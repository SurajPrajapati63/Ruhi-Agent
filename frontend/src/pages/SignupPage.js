import React from 'react';
import AuthForm from '../components/AuthForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <AuthForm isLogin={false} />
    </div>
  );
};

export default SignupPage;
