import { Toaster as SonnerToaster } from 'sonner';

/** Mounted once in the providers. Show toasts with `toast` from './toast'. */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      offset={16}
      mobileOffset={16}
      toastOptions={{
        className: 'rounded-control! border-border! font-sans! text-sm!',
      }}
    />
  );
}
