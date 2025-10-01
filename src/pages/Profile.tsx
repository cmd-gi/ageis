import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(255, 'Email too long').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long').optional().or(z.literal('')),
});

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleUpdateProfile = async () => {
    setErrors({});

    // Filter out empty fields
    const updateData: any = {};
    if (formData.username) updateData.username = formData.username;
    if (formData.email) updateData.email = formData.email;
    if (formData.password) updateData.password = formData.password;

    if (Object.keys(updateData).length === 0) {
      toast.error('Please fill in at least one field to update');
      return;
    }

    try {
      profileSchema.parse(updateData);
      setIsLoading(true);
      await authAPI.updateProfile(updateData);
      await refreshUser();
      setFormData({ username: '', email: '', password: '' });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Profile Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Current Information</CardTitle>
            <CardDescription>Your current profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold">{user?.username}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4">
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-mono text-sm">{user?.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Profile Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>Change your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">New Username (optional)</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={user?.username}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">New Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={user?.email}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password (optional)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep current password
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Profile Update</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to update your profile information? This action will save your changes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdateProfile}>
                      Confirm Update
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
