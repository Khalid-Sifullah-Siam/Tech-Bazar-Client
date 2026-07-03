"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { Loader2, UserCog } from "lucide-react";
import { toast } from "react-toastify";

function getStatusStyle(status) {
  if (status === "blocked" || status === "suspended") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const regularUsers = users.filter((user) => user.role !== "admin");
  const adminUsers = users.filter((user) => user.role === "admin");

  const loadUsers = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/users");
    const data = await response.json();

    if (response.ok) {
      setUsers(data.users || []);
    } else {
      setMessage(data.error || "Users could not be loaded");
      toast.error(data.error || "Users could not be loaded.");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    let shouldUpdate = true;

    async function fetchUsers() {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!shouldUpdate) {
        return;
      }

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setMessage(data.error || "Users could not be loaded");
        toast.error(data.error || "Users could not be loaded.");
      }

      setIsLoading(false);
    }

    fetchUsers();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const updateUser = async (userId, action) => {
    setMessage("");

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      toast.success(data.message || "User updated successfully.");
      await loadUsers();
    } else {
      setMessage(data.error || "User update failed");
      toast.error(data.error || "User update failed.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              User management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Change roles and control account access.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      )}

      <div className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-slate-950">Buyer and seller users</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage role and account status for non-admin users.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading users...
          </div>
        ) : regularUsers.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No buyer or seller users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regularUsers.map((user) => (
                  <tr key={user._id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-100">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={44}
                              height={44}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-slate-950">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 capitalize text-slate-700">
                      {user.role}
                    </td>
                    <td className="px-4 py-4 capitalize text-slate-700">
                      {user.sellerPlanName || user.plan || "free"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(user.accountStatus)}`}
                      >
                        {user.accountStatus || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {user.role !== "buyer" && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => updateUser(user._id, "make-buyer")}
                          >
                            Make Buyer
                          </Button>
                        )}
                        {user.role !== "seller" && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => updateUser(user._id, "make-seller")}
                          >
                            Make Seller
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => updateUser(user._id, "block")}
                        >
                          Block
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => updateUser(user._id, "suspend")}
                        >
                          Suspend
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => updateUser(user._id, "unblock")}
                        >
                          Unblock
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => updateUser(user._id, "unsuspend")}
                        >
                          Unsuspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-slate-950">Admins</h2>
          <p className="mt-1 text-sm text-slate-500">
            Admin accounts are view-only and cannot be changed from this page.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading admins...
          </div>
        ) : adminUsers.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No admin users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Access</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((user) => (
                  <tr key={user._id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-100">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={44}
                              height={44}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-slate-950">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 capitalize text-slate-700">
                      {user.role}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(user.accountStatus)}`}
                      >
                        {user.accountStatus || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-slate-500">
                      Admin protected
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
