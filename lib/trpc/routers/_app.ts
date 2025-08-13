import { router } from '../server';
import { clientsRouter } from './clients';
import { vesselsRouter } from './vessels';
import { jobsRouter } from './jobs';
import { progressRouter } from './progress';
import { reportsRouter } from './reports';
import { sectionsRouter } from './sections';

export const appRouter = router({
  clients: clientsRouter,
  vessels: vesselsRouter,
  jobs: jobsRouter,
  progress: progressRouter,
  reports: reportsRouter,
  sections: sectionsRouter,
});

export type AppRouter = typeof appRouter;