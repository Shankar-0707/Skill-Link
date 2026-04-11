import { Layout } from '@/features/customer/components/layout/Layout';
import { UserHelpCenterView } from '@/features/help/components/UserHelpCenterView';

export const CustomerHelpCenterPage = () => (
  <Layout>
    <UserHelpCenterView role="CUSTOMER" mode="home" />
  </Layout>
);
