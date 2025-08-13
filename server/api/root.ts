import { router } from "../trpc";
import { clientsRouter } from "./routers/clients";

export const appRouter = router({
  clients: clientsRouter,
});
export type AppRouter = typeof appRouter;