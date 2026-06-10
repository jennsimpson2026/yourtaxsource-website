import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MfaSetup } from "@/components/portal/MfaSetup";

export default async function MfaSetupPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as any).id;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-heading font-black text-brand-black mb-8">Security Settings</h1>
      <MfaSetup userId={userId} initialEnabled={!!user.mfaEnabled} />
    </div>
  );
}
