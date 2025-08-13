import { z } from 'zod';
import { JobStatus } from '@prisma/client';
import { router, adminProcedure, crewProcedure, protectedProcedure } from '../server';
import { TRPCError } from '@trpc/server';

export const jobsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(JobStatus).optional(),
        assignedTo: z.string().optional(),
        vesselId: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.status) {
        where.status = input.status;
      }
      
      if (input.assignedTo) {
        where.assignedTo = input.assignedTo;
      }
      
      if (input.vesselId) {
        where.vesselId = input.vesselId;
      }

      // If user is crew, only show jobs assigned to them
      if (ctx.session?.user.role === 'CREW') {
        where.assignedTo = ctx.session.user.id;
      }

      const items = await ctx.prisma.cleaningJob.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          vessel: {
            include: {
              client: {
                select: {
                  name: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
          progress: {
            select: {
              percent: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
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
      const job = await ctx.prisma.cleaningJob.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          vessel: {
            include: {
              client: true,
              sections: {
                orderBy: { order: 'asc' },
              },
            },
          },
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
                  id: true,
                  name: true,
                  order: true,
                },
              },
              media: true,
            },
            orderBy: {
              vesselSection: {
                order: 'asc',
              },
            },
          },
        },
      });

      // Check if crew user can access this job
      if (ctx.session?.user.role === 'CREW' && job.assignedTo !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access jobs assigned to you',
        });
      }

      return job;
    }),

  create: adminProcedure
    .input(
      z.object({
        vesselId: z.string(),
        scheduledAt: z.date().optional(),
        assignedTo: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.cleaningJob.create({
        data: {
          ...input,
          status: JobStatus.DRAFT,
        },
      });

      // Create initial progress records for all vessel sections
      const sections = await ctx.prisma.vesselSection.findMany({
        where: { vesselId: input.vesselId },
      });

      if (sections.length > 0) {
        await Promise.all(
          sections.map((section) =>
            ctx.prisma.cleaningSectionProgress.create({
              data: {
                cleaningJobId: job.id,
                vesselSectionId: section.id,
                percent: 0,
              },
            })
          )
        );
      }

      return job;
    }),

  updateStatus: crewProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(JobStatus),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.cleaningJob.findUniqueOrThrow({
        where: { id: input.id },
      });

      // Check if crew user can access this job
      if (ctx.session?.user.role === 'CREW' && job.assignedTo !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update jobs assigned to you',
        });
      }

      const updateData: any = {
        status: input.status,
        notes: input.notes,
      };

      if (input.status === JobStatus.IN_PROGRESS && !job.startedAt) {
        updateData.startedAt = new Date();
      }

      if (input.status === JobStatus.DONE && !job.finishedAt) {
        updateData.finishedAt = new Date();
      }

      return ctx.prisma.cleaningJob.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  assign: adminProcedure
    .input(
      z.object({
        id: z.string(),
        assignedTo: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.cleaningJob.update({
        where: { id: input.id },
        data: {
          assignedTo: input.assignedTo,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.cleaningJob.delete({
        where: { id: input.id },
      });
    }),

  myJobs: crewProcedure.query(async ({ ctx }) => {
    return ctx.prisma.cleaningJob.findMany({
      where: {
        assignedTo: ctx.session.user.id,
        status: { in: [JobStatus.DRAFT, JobStatus.IN_PROGRESS] },
      },
      include: {
        vessel: {
          include: {
            client: {
              select: {
                name: true,
              },
            },
          },
        },
        progress: {
          select: {
            percent: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }),
});