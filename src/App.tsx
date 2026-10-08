import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Providers } from './app/Providers';
import { routes } from './app/routes';

export default function App() {
  const [router] = useState(() => createBrowserRouter(routes));
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
