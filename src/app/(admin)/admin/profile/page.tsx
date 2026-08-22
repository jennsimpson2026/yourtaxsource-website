import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/admin/ProfileForm";

export default async function AdminProfilePage() {
  const session = await auth();
  if (!session || (session.user as any).role === "CLIENT") {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-bold text-brand-black">My Profile</h1>
        <p className="text-brand-charcoal/60 mt-1 font-medium">Manage your personal information and author profile.</p>
      </div>
      
      <ProfileForm 
        initialData={{ 
          name: user.name || "", 
          image: user.image || "" 
        }} 
      />
    </div>
  );
}
