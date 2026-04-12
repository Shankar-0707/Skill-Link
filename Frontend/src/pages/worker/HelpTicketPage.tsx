import { UserHelpCenterView } from '@/features/help/components/UserHelpCenterView';
import { WorkerLayout } from '@/features/worker/components/layout/Layout';

export const WorkerHelpTicketPage = () => (
  <WorkerLayout>
    <UserHelpCenterView role="WORKER" mode="ticket" />
  </WorkerLayout>
);
