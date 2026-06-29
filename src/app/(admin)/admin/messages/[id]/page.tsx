import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { MessageCenter } from "@/components/portal/MessageCenter";
import { notFound, redirect } from "next/navigation";

export default async function AdminConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // @ts-ignore
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/portal");
  }

  const client = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!client) {
    notFound();
  }

  return (
    <MessageCenter 
      // @ts-ignore
      userId={session.user.id} 
      otherUserId={client.id} 
      otherUserName={client.name || client.email} 
    />
  );
}
