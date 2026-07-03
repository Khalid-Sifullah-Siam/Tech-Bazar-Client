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

function isLocalhostUrl(url) {
  return url.includes("localhost") || url.includes("127.0.0.1");
}

function getExtraOrigins() {
  const originsText = process.env.TRUSTED_ORIGINS || "";

  return originsText
    .split(",")
    .map((origin) => cleanUrl(origin))
    .filter(Boolean);
}

const authUrl = cleanUrl(process.env.BETTER_AUTH_URL);
const vercelUrl = process.env.VERCEL_URL
  ? `https://${cleanUrl(process.env.VERCEL_URL)}`
  : "";
const appUrl =
  process.env.NODE_ENV === "production" && isLocalhostUrl(authUrl)
    ? vercelUrl
    : authUrl;

const trustedOrigins = [
  appUrl,
  vercelUrl,
  ...getExtraOrigins(),
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

export const auth = betterAuth({
  baseURL: appUrl || vercelUrl,
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
        type: "string",
        defaultValue: "buyer",
        input: true,
      },
      plan: {
        type: "string",
        defaultValue: "free",
        input: true,
      },
      sellerPlanName: {
        type: "string",
        defaultValue: "",
        input: true,
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
