'use client';

import {
  BookOpenCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { User } from '@/types/user';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

const adminNav = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];

const teacherNav = [
  { href: '/students', label: 'Students', icon: Users },
  { href: '/problems', label: 'Problems', icon: GraduationCap },
];

const studentNav = [{ href: '/problems', label: 'Problems', icon: GraduationCap }];

export default function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const navItems =
    user.role === 'admin'
      ? adminNav
      : user.role === 'teacher'
      ? teacherNav
      : studentNav;

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      toast({ title: 'Logged out successfully' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout failed' });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-headline">EduQuest</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  asChild
                  className="w-full justify-start"
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-start">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
