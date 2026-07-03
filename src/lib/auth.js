import dns from "node:dns";
dns.setServers(["1.1.1.1", "1.0.0.1"]);
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("tech-bazaar");

function cleanUrl(url) {
  if (!url) {
    return "";
  }

  return url.trim().replace(/\/$/, "");
}

const appUrl = cleanUrl(process.env.BETTER_AUTH_URL);
const trustedOrigins = [
  appUrl,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

export const auth = betterAuth({
  baseURL: appUrl,
  trustedOrigins,
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        defaultValue: "buyer",
      },
      plan: {
        defaultValue: "free",
      },
      sellerPlanName: {
        defaultValue: "",
      },
    },
  },
  session: {
    cookieCache: {
      enabled: false,
      strategy: "jwt",
      maxAge: 60 * 24 * 60,
    },
  },
  plugins: [jwt()],
});

export { client, db };
