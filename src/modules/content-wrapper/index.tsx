import LoginForm from '../login-form';
import Chat from '../chat';
import { useAuth } from '@/providers/auth-provider';

function ContentWrapper() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Chat />;
}

export default ContentWrapper;
