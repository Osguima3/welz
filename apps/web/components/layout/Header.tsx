import { Home, Wallet } from 'lucide';
import Button from '../ui/button.tsx';
import WelzLogo from '../WelzLogo.tsx';

export function Header() {
  return (
    <div class='p-6 border-b border-gray-200 bg-muted/30'>
      <div class='max-w-7xl mx-auto flex justify-between items-center'>
        <div class='flex items-center gap-2'>
          <WelzLogo size='sm' showText={false} />
          <h1 class='text-2xl font-bold text-secondary'>Welz</h1>
        </div>
        <div class='flex items-center gap-4'>
          <a href='/'>
            <Button variant='ghost' class='gap-2'>
              <Home class='h-4 w-4' />
              Home
            </Button>
          </a>
          <a href='/dashboard'>
            <Button variant='default' class='gap-2'>
              <Wallet class='h-4 w-4' />
              Dashboard
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
