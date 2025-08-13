import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export async function createTRPCContext(_opts: { headers: Headers }) {
  // İleride auth vb. eklersen buradan geçer
  return {};
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;