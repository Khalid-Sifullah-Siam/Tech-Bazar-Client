
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("tech-bazaar");


export const auth = betterAuth({
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


