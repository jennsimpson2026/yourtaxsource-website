import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { updateUserRole } from "@/actions/users";
import { User, Shield, Clock } from "lucide-react";

export default async function UserManagementPage() {
  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-brand-navy">User Management</h1>
        <p className="text-brand-charcoal/60 mt-1 font-medium">Manage staff and client access levels.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-brand-cloud/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-cloud rounded-full flex items-center justify-center text-brand-navy font-bold border border-gray-100">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-brand-navy">{user.name || "N/A"}</div>
                        <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full border ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      user.role === 'STAFF' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-green-50 text-green-700 border-green-100'
                    } uppercase tracking-wider`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-brand-charcoal/60 font-medium">
                      <Clock size={14} className="text-gray-300" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <form action={async (formData: FormData) => {
                      "use server";
                      const userId = formData.get("userId") as string;
                      const role = formData.get("role") as string;
                      await updateUserRole(userId, role);
                    }} className="flex items-center justify-end gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="text-xs border border-gray-200 rounded-lg p-1.5 bg-brand-cloud focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-bold text-brand-navy"
                      >
                        <option value="CLIENT">CLIENT</option>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button
                        type="submit"
                        className="text-xs bg-brand-navy text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 font-bold transition-all shadow-sm"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
