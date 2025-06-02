import React from 'react';
import { AuthProvider } from './auth-provider';

function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default ProvidersWrapper;
