import { z } from 'zod';
import { router, adminProcedure, protectedProcedure } from '../server';

export const sectionsRouter = router({
  templates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.sectionTemplate.findMany({
      orderBy: { order: 'asc' },
    });
  }),

  createTemplate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.sectionTemplate.create({
        data: input,
      });
    }),

  createVesselSection: adminProcedure
    .input(
      z.object({
        vesselId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vesselSection.create({
        data: input,
      });
    }),

  updateVesselSection: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.vesselSection.update({
        where: { id },
        data,
      });
    }),

  deleteVesselSection: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vesselSection.delete({
        where: { id: input.id },
      });
    }),
});