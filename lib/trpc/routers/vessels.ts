import { z } from 'zod';
import { VesselType } from '@prisma/client';
import { router, adminProcedure, protectedProcedure } from '../server';

export const vesselsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        clientId: z.string().optional(),
        type: z.nativeEnum(VesselType).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.clientId) {
        where.clientId = input.clientId;
      }
      
      if (input.type) {
        where.type = input.type;
      }
      
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { registrationNo: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const items = await ctx.prisma.vessel.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          jobs: {
            where: {
              status: { in: ['DRAFT', 'IN_PROGRESS'] },
            },
            select: {
              id: true,
              status: true,
            },
          },
          sections: {
            select: {
              id: true,
              name: true,
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
      return ctx.prisma.vessel.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          client: true,
          sections: {
            orderBy: { order: 'asc' },
          },
          jobs: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                },
              },
              progress: {
                include: {
                  vesselSection: {
                    select: {
                      name: true,
                    },
                  },
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
        clientId: z.string(),
        name: z.string().min(1),
        type: z.nativeEnum(VesselType),
        length: z.number().positive().optional(),
        width: z.number().positive().optional(),
        registrationNo: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vessel.create({
        data: input,
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        clientId: z.string(),
        name: z.string().min(1),
        type: z.nativeEnum(VesselType),
        length: z.number().positive().optional(),
        width: z.number().positive().optional(),
        registrationNo: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.vessel.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vessel.delete({
        where: { id: input.id },
      });
    }),

  createSectionFromTemplate: adminProcedure
    .input(
      z.object({
        vesselId: z.string(),
        templateIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const templates = await ctx.prisma.sectionTemplate.findMany({
        where: { id: { in: input.templateIds } },
        orderBy: { order: 'asc' },
      });

      const sections = await Promise.all(
        templates.map((template) =>
          ctx.prisma.vesselSection.create({
            data: {
              vesselId: input.vesselId,
              name: template.name,
              description: template.description,
              order: template.order,
            },
          })
        )
      );

      return sections;
    }),
});