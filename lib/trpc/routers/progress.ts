import { z } from 'zod';
import { MediaKind } from '@prisma/client';
import { router, crewProcedure } from '../server';
import { TRPCError } from '@trpc/server';

export const progressRouter = router({
  updatePercent: crewProcedure
    .input(
      z.object({
        cleaningJobId: z.string(),
        vesselSectionId: z.string(),
        percent: z.number().min(0).max(100),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if crew user can access this job
      const job = await ctx.prisma.cleaningJob.findUniqueOrThrow({
        where: { id: input.cleaningJobId },
      });

      if (ctx.session?.user.role === 'CREW' && job.assignedTo !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update jobs assigned to you',
        });
      }

      return ctx.prisma.cleaningSectionProgress.upsert({
        where: {
          cleaningJobId_vesselSectionId: {
            cleaningJobId: input.cleaningJobId,
            vesselSectionId: input.vesselSectionId,
          },
        },
        update: {
          percent: input.percent,
          note: input.note,
        },
        create: {
          cleaningJobId: input.cleaningJobId,
          vesselSectionId: input.vesselSectionId,
          percent: input.percent,
          note: input.note,
        },
      });
    }),

  addMedia: crewProcedure
    .input(
      z.object({
        progressId: z.string(),
        kind: z.nativeEnum(MediaKind),
        url: z.string().url(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if crew user can access this progress record
      const progress = await ctx.prisma.cleaningSectionProgress.findUniqueOrThrow({
        where: { id: input.progressId },
        include: {
          cleaningJob: true,
        },
      });

      if (ctx.session?.user.role === 'CREW' && progress.cleaningJob.assignedTo !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only add media to jobs assigned to you',
        });
      }

      return ctx.prisma.media.create({
        data: {
          cleaningSectionProgressId: input.progressId,
          kind: input.kind,
          url: input.url,
          caption: input.caption,
        },
      });
    }),

  deleteMedia: crewProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.prisma.media.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          progress: {
            include: {
              cleaningJob: true,
            },
          },
        },
      });

      if (ctx.session?.user.role === 'CREW' && media.progress.cleaningJob.assignedTo !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete media from jobs assigned to you',
        });
      }

      return ctx.prisma.media.delete({
        where: { id: input.id },
      });
    }),
});