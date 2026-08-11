import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);

  return (
    <section>
      <h1>Logging out...</h1>
      <p>Clearing your session and returning to the homepage.</p>
    </section>
  );
};

export default Logout;
