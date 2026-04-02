import React from 'react';
import { AuthLayout } from '../../features/auth/components/AuthLayout';
import { RegisterForm } from '../../features/auth/components/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Sign Up" 
      subtitle="Join the future of skilled work"
      showBackButton={false}
    >
      <RegisterForm />
    </AuthLayout>
  );
};
