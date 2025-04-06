import { Head } from '$fresh/runtime.ts';
import { useEffect } from 'preact/hooks';
import Button from '../components/ui/button.tsx';

export default function NotFound({ url }: { url: string }) {
  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', url);
  }, [url]);

  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class='min-h-screen flex items-center justify-center bg-gradient-to-b from-muted to-background'>
        <div class='text-center p-8 max-w-md'>
          <div class='mb-6 flex justify-center'>
            <svg
              class='h-16 w-16 text-primary'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
          </div>
          <h1 class='text-4xl font-bold mb-4 text-secondary'>404</h1>
          <p class='text-xl text-muted-foreground mb-6'>Oops! Page not found</p>
          <a href='/'>
            <Button>Return to Home</Button>
          </a>
        </div>
      </div>
    </>
  );
}
