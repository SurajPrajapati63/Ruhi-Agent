import React from 'react';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <AuthForm isLogin={true} />
    </div>
  );
};

export default LoginPage;
