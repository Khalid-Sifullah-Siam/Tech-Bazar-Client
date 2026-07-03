import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentAdmin() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "admin") {
      return session.user;
    }
  } catch (error) {
    return null;
  }

  return null;
}
