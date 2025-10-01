import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, User, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Tasks',
      value: '0',
      description: 'No tasks yet',
      icon: CheckSquare,
      color: 'text-primary',
    },
    {
      title: 'Profile',
      value: user?.username || 'User',
      description: user?.email || '',
      icon: User,
      color: 'text-accent',
    },
    {
      title: 'Activity',
      value: '0%',
      description: 'This week',
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.username}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card transition-smooth hover:shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Start managing your tasks and profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-smooth hover:shadow-elegant">
            <div className="flex items-start gap-4">
              <CheckSquare className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Create Your First Task</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate to the Tasks page to create and manage your tasks with full CRUD operations
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/tasks')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-smooth hover:shadow-elegant">
            <div className="flex items-start gap-4">
              <User className="h-5 w-5 text-accent" />
              <div>
                <h3 className="font-medium">Update Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Visit the Profile page to securely update your information
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/profile')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Dashboard Features</CardTitle>
          <CardDescription>Everything you need at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Protected routes with JWT authentication</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Full CRUD operations with search, filter, sort & pagination</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Debounced search for optimal performance</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Confirmation dialogs for destructive actions</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Real-time validation with user-friendly error messages</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
