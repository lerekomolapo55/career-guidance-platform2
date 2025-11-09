import React, { useState } from 'react';
import InstitutionLogin from './InstitutionLogin';
import InstitutionRegister from './InstitutionRegister';

const InstitutionAuth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="institution-auth">
      {isLogin ? (
        <InstitutionLogin 
          onLogin={onLogin} 
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <InstitutionRegister 
          onRegister={onLogin}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
};

export default InstitutionAuth;