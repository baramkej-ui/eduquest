'use client';

import {
  BookOpenCheck,
  GraduationCap,
  LayoutDashboard,
  Library,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAppUser } from '@/app/layout';


const adminNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/level-test', label: 'Level Test', icon: GraduationCap },
    { href: '/learning', label: 'Learning', icon: Library },
    { href: '/users', label: 'Users', icon: Users, adminOnly: true },
];


export default function AppSidebar() {
  const user = useAppUser();
  const pathname = usePathname();

  // Safely filter nav items, even if user is temporarily null
  const navItems = adminNav.filter(item => !item.adminOnly || user?.role === 'admin');

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
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
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
    </Sidebar>
  );
}
