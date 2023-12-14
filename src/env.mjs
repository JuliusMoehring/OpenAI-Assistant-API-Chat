import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const AssistentConfigSchema = z
  .object({
    assistantId: z.string().min(1),
    path: z.string().min(1),
    initialThreadMessage: z.string().min(1).optional(),
    restriction: z.enum(["none", "email"]).default("none"),
    emails: z.array(z.string().email()).optional(),
  })
  .refine(
    (value) => {
      const isEmail = value.restriction === "email";

      const hasEmails = value.emails && value.emails.length > 0;

      if (isEmail && !hasEmails) {
        return false;
      }
      return true;
    },
    { message: "Emails are required when restriction is set to email" },
  );

const parseAssistentConfig = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error("NEXT_PUBLIC_ASSISTENT_CONFIG is not valid JSON");
  }
};

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),

    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(18),

    AZURE_AD_CLIENT_ID: z.string(),
    AZURE_AD_CLIENT_SECRET: z.string(),
    AZURE_AD_TENANT_ID: z.string(),

    OPENAI_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_AUTH_TOKEN: z.string().optional(),
    NEXT_PUBLIC_ASSISTENT_CONFIG: z.array(AssistentConfigSchema),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
    AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET,
    AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    NEXT_PUBLIC_AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN,
    NEXT_PUBLIC_ASSISTENT_CONFIG: parseAssistentConfig(
      process.env.NEXT_PUBLIC_ASSISTENT_CONFIG,
    ),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
