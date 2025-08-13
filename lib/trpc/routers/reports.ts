import { z } from 'zod';
import { router, adminProcedure } from '../server';

export const reportsRouter = router({
  summary: adminProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        clientId: z.string().optional(),
        vesselId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        createdAt: {
          gte: input.from,
          lte: input.to,
        },
      };

      if (input.vesselId) {
        where.vesselId = input.vesselId;
      } else if (input.clientId) {
        where.vessel = {
          clientId: input.clientId,
        };
      }

      const jobs = await ctx.prisma.cleaningJob.findMany({
        where,
        include: {
          vessel: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      const summary = jobs.map((job) => {
        const totalSections = job.progress.length;
        const completedSections = job.progress.filter(p => p.percent === 100).length;
        const averagePercent = totalSections > 0 
          ? Math.round(job.progress.reduce((sum, p) => sum + p.percent, 0) / totalSections)
          : 0;

        return {
          jobId: job.id,
          clientName: job.vessel.client.name,
          vesselName: job.vessel.name,
          date: job.createdAt,
          totalSections,
          completedSections,
          averagePercent,
          status: job.status,
        };
      });

      return summary;
    }),

  detailed: adminProcedure
    .input(
      z.object({
        jobId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.cleaningJob.findUniqueOrThrow({
        where: { id: input.jobId },
        include: {
          vessel: {
            include: {
              client: true,
            },
          },
          assignee: {
            select: {
              name: true,
            },
          },
          progress: {
            include: {
              vesselSection: {
                select: {
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
    }),
});