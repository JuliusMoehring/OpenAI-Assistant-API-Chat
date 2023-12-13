import { inferRouterOutputs } from "@trpc/server";

import { assistantRouter } from "./routers/assistant";
import { fileRouter } from "./routers/file";
import { messageRouter } from "./routers/message";
import { runRouter } from "./routers/run";
import { threadRouter } from "./routers/thread";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  assistant: assistantRouter,
  file: fileRouter,
  message: messageRouter,
  thread: threadRouter,
  run: runRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutput = inferRouterOutputs<AppRouter>;
