import { ArrowRight, BarChart3, Shield, Zap } from 'lucide';
import WelzLogo from '../components/WelzLogo.tsx';
import Button from '../components/ui/button.tsx';

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div class='min-h-screen bg-background'>
      {/* Header */}
      <div class='p-6 border-b border-gray-200 bg-muted/30'>
        <div class='max-w-7xl mx-auto flex justify-between items-center'>
          <div class='flex items-center gap-2'>
            <WelzLogo size='sm' showText={false} />
            <h1 class='text-2xl font-bold text-secondary'>Welz</h1>
          </div>
          <div class='flex items-center gap-4'>
            <a href='/dashboard'>
              <Button variant='ghost'>Dashboard</Button>
            </a>
            <a href='/accounts/bdb5dfa5-a5bf-4a37-8afd-38bf39636155/transactions'>
              <Button>Get Started</Button>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section class='py-20 px-6'>
        <div class='max-w-6xl mx-auto text-center'>
          <h1 class='text-4xl md:text-6xl font-bold text-secondary mb-6'>
            Take Control of Your Finances
          </h1>
          <p class='text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto'>
            Track expenses, monitor income, and reach your financial goals with our intuitive platform.
          </p>
          <div class='flex flex-col sm:flex-row gap-4 justify-center'>
            <a href='/dashboard'>
              <Button size='lg' class='gap-2'>
                View Dashboard
                <ArrowRight class='h-5 w-5' />
              </Button>
            </a>
            <a href='/accounts/bdb5dfa5-a5bf-4a37-8afd-38bf39636155/transactions'>
              <Button size='lg' variant='outline' class='border-gray-200'>
                View Transactions
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class='py-16 px-6 bg-muted/30'>
        <div class='max-w-6xl mx-auto'>
          <h2 class='text-3xl font-bold text-center mb-12 text-secondary'>
            Our Key Features
          </h2>
          <div class='grid md:grid-cols-3 gap-8'>
            <div class='bg-card p-6 rounded-lg shadow-sm border-gray-200 border'>
              <div class='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                <BarChart3 class='h-6 w-6 text-primary' />
              </div>
              <h3 class='font-bold text-xl mb-2'>Financial Dashboard</h3>
              <p class='text-muted-foreground'>
                Get a comprehensive view of your finances with our intuitive dashboard.
              </p>
            </div>
            <div class='bg-card p-6 rounded-lg shadow-sm border-gray-200 border'>
              <div class='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                <Zap class='h-6 w-6 text-primary' />
              </div>
              <h3 class='font-bold text-xl mb-2'>Quick Analysis</h3>
              <p class='text-muted-foreground'>
                See where your money is going with categorized transaction reports.
              </p>
            </div>
            <div class='bg-card p-6 rounded-lg shadow-sm border-gray-200 border'>
              <div class='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                <Shield class='h-6 w-6 text-primary' />
              </div>
              <h3 class='font-bold text-xl mb-2'>Secure & Private</h3>
              <p class='text-muted-foreground'>
                Your financial data is encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class='py-20 px-6'>
        <div class='max-w-4xl mx-auto text-center'>
          <h2 class='text-3xl font-bold mb-6 text-secondary'>
            Ready to improve your financial health?
          </h2>
          <p class='text-xl text-muted-foreground mb-10'>
            Join thousands of users who are taking control of their finances with Welz.
          </p>
          <a href='/dashboard'>
            <Button size='lg'>
              Get Started Now
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer class='bg-muted/50 py-8 px-6 border-t border-gray-200'>
        <div class='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center'>
          <div class='flex items-center gap-2 mb-4 md:mb-0'>
            <WelzLogo size='sm' showText={false} />
            <span class='text-secondary font-bold'>Welz</span>
          </div>
          <p class='text-muted-foreground text-sm'>
            © {currentYear} Welz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
