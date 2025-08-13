import { type GetServerSidePropsContext } from 'next';
import { type Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

export const createTRPCContext = async (opts: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  const { req, res } = opts;
  const session = await getServerSession(req, res, authOptions);

  return createInnerTRPCContext({
    session,
  });
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;