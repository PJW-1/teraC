import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '../components/ui';
import { InventoryProvider } from '../lib/inventory/InventoryProvider';
import { createQueryClient } from '../lib/queryClient';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryProvider>{children}</InventoryProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
