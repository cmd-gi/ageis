import { NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { title: 'Overview', url: '/dashboard', icon: Home },
  { title: 'Tasks', url: '/dashboard/tasks', icon: CheckSquare },
  { title: 'Profile', url: '/dashboard/profile', icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          {!isCollapsed && <span className="ml-2 text-xl font-bold">TaskFlow</span>}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info and logout */}
      <SidebarFooter className="border-t p-4">
        {!isCollapsed && user && (
          <div className="mb-2 space-y-1 text-sm">
            <p className="font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
