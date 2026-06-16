"use server";

import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyNewMessage } from "@/lib/notifications";
import { encrypt, decrypt } from "@/lib/crypto";

export async function sendMessage({
  recipientId,
  content,
  taxReturnId,
}: {
  recipientId: string;
  content: string;
  taxReturnId?: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const senderId = session.user.id;

  // Encrypt content for security at rest
  const encryptedContent = encrypt(content);

  const [newMessage] = await db.insert(messages).values({
    senderId,
    recipientId,
    content: encryptedContent,
    taxReturnId: taxReturnId || null,
  }).returning();

  // Get recipient and sender info for notifications
  const recipient = await db.query.users.findFirst({
    where: eq(users.id, recipientId),
  });

  if (recipient) {
    await notifyNewMessage({
      toEmail: recipient.email,
      toPhone: null, // Default to null, profile lookup could be added later
      senderName: session.user.name || "A user",
      content: content,
      isToStaff: recipient.role === "STAFF" || recipient.role === "ADMIN",
    });
  }

  revalidatePath("/portal/messages");
  revalidatePath("/admin/messages");

  return newMessage;
}

export async function getConversation(otherUserId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const rawMessages = await db.query.messages.findMany({
    where: or(
      and(eq(messages.senderId, userId), eq(messages.recipientId, otherUserId)),
      and(eq(messages.senderId, otherUserId), eq(messages.recipientId, userId))
    ),
    orderBy: [desc(messages.createdAt)],
    with: {
      sender: true,
      recipient: true,
    },
  });

  return rawMessages.map((msg) => ({
    ...msg,
    content: decrypt(msg.content),
  }));
}

export async function getRecentConversations() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // This is a bit tricky in SQLite/Drizzle without complex subqueries
  // For now, let's just get all messages involving the user and group them in memory
  const allMessages = await db.query.messages.findMany({
    where: or(eq(messages.senderId, userId), eq(messages.recipientId, userId)),
    orderBy: [desc(messages.createdAt)],
    with: {
      sender: true,
      recipient: true,
    },
  });

  const conversations: Record<string, any> = {};

  allMessages.forEach((msg) => {
    const otherUser = msg.senderId === userId ? msg.recipient : msg.sender;
    if (!conversations[otherUser.id]) {
      conversations[otherUser.id] = {
        user: otherUser,
        lastMessage: {
          ...msg,
          content: decrypt(msg.content),
        },
      };
    }
  });

  return Object.values(conversations);
}

export async function markConversationAsRead(otherUserId: string) {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    await db.update(messages)
        .set({ isRead: true })
        .where(and(eq(messages.recipientId, session.user.id), eq(messages.senderId, otherUserId)));
    
    revalidatePath("/portal/messages");
    revalidatePath("/admin/messages");
}
