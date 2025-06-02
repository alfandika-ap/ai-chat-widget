import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BubbleButton from './modules/bubble-button';
import ProvidersWrapper from './providers/providers-wrapper';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWrapper>
        <BubbleButton />
      </ProvidersWrapper>
    </QueryClientProvider>
  );
}

export default App;
