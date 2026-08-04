import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // clear auth/session here if implemented
    // then redirect to home
    navigate('/');
  }, [navigate]);

  return (
    <section>
      <h1>Logging out...</h1>
    </section>
  );
};

export default Logout;
