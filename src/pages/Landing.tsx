import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, CheckCircle2, Shield, Zap, LayoutDashboard } from 'lucide-react';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Enterprise-grade security with JWT tokens and encrypted data storage',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with modern technologies for optimal performance',
    },
    {
      icon: LayoutDashboard,
      title: 'Intuitive Dashboard',
      description: 'Manage your tasks and profile with an elegant, user-friendly interface',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth?tab=login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/auth?tab=signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center md:py-32">
        <div className="mx-auto max-w-3xl space-y-8">
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            Manage Your Tasks
            <span className="text-gradient block">With Confidence</span>
          </h1>
          <p className="text-xl text-muted-foreground md:text-2xl">
            A modern, secure platform to organize your work, collaborate with your team, and achieve your goals efficiently.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="hero" onClick={() => navigate('/auth?tab=signup')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth?tab=login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Everything you need to stay productive
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-card transition-smooth hover:shadow-elegant"
              >
                <feature.icon className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-primary to-accent p-12 text-center text-primary-foreground shadow-elegant">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to get started?</h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of users who trust TaskFlow to manage their work.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth?tab=signup')}>
            Create Your Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
