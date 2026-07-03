import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:5000",
  plugins: [jwtClient()],
});
