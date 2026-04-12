import { UserHelpCenterView } from '@/features/help/components/UserHelpCenterView';
import { WorkerLayout } from '@/features/worker/components/layout/Layout';

export const WorkerHelpCenterPage = () => (
  <WorkerLayout>
    <UserHelpCenterView role="WORKER" mode="home" />
  </WorkerLayout>
);
