import { Layout } from '@/features/customer/components/layout/Layout';
import { UserHelpCenterView } from '@/features/help/components/UserHelpCenterView';

export const CustomerHelpTicketPage = () => (
  <Layout>
    <UserHelpCenterView role="CUSTOMER" mode="ticket" />
  </Layout>
);
