import { z } from 'zod';
import { router, adminProcedure, protectedProcedure } from '../server';

export const clientsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.client.findMany({
        where: input.search
          ? {
              OR: [
                { name: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } },
                { companyName: { contains: input.search, mode: 'insensitive' } },
              ],
            }
          : undefined,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          vessels: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.client.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          vessels: {
            include: {
              jobs: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  finishedAt: true,
                },
              },
            },
          },
        },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        companyName: z.string().optional(),
        address: z.string().optional(),
        billingNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.client.create({
        data: input,
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        companyName: z.string().optional(),
        address: z.string().optional(),
        billingNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.client.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.client.delete({
        where: { id: input.id },
      });
    }),
});