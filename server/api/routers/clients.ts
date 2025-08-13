import { publicProcedure, router } from "../../trpc";
import { z } from "zod";

export const clientsRouter = router({
  list: publicProcedure
    .input(z.object({ q: z.string().optional() }).optional())
    .query(async ({ input }) => {
      // Şimdilik mock veri; Prisma ekleyince DB'den çek
      const all = [
        { id: "c1", name: "Reef Co." },
        { id: "c2", name: "Blue Marina" },
      ];
      const q = input?.q?.toLowerCase().trim();
      const items = q ? all.filter(c => c.name.toLowerCase().includes(q)) : all;
      return { items };
    }),
});