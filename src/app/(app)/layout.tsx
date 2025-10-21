'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { createContext, useContext } from 'react';
import type { User as AppUser } from '@/types/user';

const AppUserContext = createContext<AppUser | null>(null);

export const useAppUser = () => useContext(AppUserContext);

export default function AppLayout({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return (
    <AppUserContext.Provider value={user}>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="flex flex-col">
          <AppHeader />
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppUserContext.Provider>
  );
}
