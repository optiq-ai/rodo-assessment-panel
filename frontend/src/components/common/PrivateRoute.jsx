import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return <div className="d-flex justify-content-center p-5">Ładowanie...</div>;
  }

  return currentUser ? children : null;
};

export default PrivateRoute;
