import React from 'react';
import { AuthLayout } from '../../features/auth/components/AuthLayout';
import { LoginForm } from '../../features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Sign In" 
      subtitle="Welcome back to Skill-Link"
      showBackButton={false}
    >
      <LoginForm />
    </AuthLayout>
  );
};
