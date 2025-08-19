import { Navigate } from 'react-router-dom';
import { useAuthenticationStatus } from '@nhost/react';
import { Loader, Center } from '@mantine/core';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return <Center sx={{ height: '100vh' }}><Loader size="xl" /></Center>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;