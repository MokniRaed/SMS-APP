'use client';

import { NotificationCenter } from '@/components/notifications/notification-center';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserMenu } from '@/components/user-menu';
import { getUserFromLocalStorage, handleLogout } from '@/lib/utils';
import { Boxes, Briefcase, Database, FileText, Handshake, Home, LogOut, Menu, Settings, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['collaborateur', 'admin'] },
  { name: 'Tasks', href: '/dashboard/tasks', icon: FileText, roles: ['admin', 'collaborateur'] },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, roles: ['admin', 'collaborateur'] },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, roles: ['admin', 'collaborateur', 'client'] },
  { name: 'Categories', href: '/dashboard/categories', icon: Boxes, roles: ['admin', 'collaborateur'] },
  { name: 'Clients', href: '/dashboard/clients', icon: Handshake, roles: ['admin', 'collaborateur'] },
  { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['admin'] },
  { name: 'Data Sync', href: '/dashboard/sync', icon: Database, roles: ['admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = getUserFromLocalStorage()
  const userRole = user.role
  console.log("userRole", userRole);



  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 shrink-0 items-center px-6">
            <h1 className="text-2xl font-bold">Task Manager</h1>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navigation
              .filter((item) => item.roles.includes(userRole))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent ${pathname === item.href ? 'bg-accent' : ''
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            <Button variant="ghost" className="justify-start gap-2 mt-auto" onClick={() => handleLogout()}>
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r px-6 py-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold">Task Manager</h1>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {navigation
              .filter((item) => item.roles.includes(userRole))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent ${pathname === item.href ? 'bg-accent' : ''
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            <Button variant="ghost" className="justify-start gap-2 mt-auto" onClick={() => handleLogout()}>
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 h-16 border-b bg-background z-40">
          <div className="flex items-center justify-end h-full px-4 space-x-4">
            <NotificationCenter />
            <UserMenu />
          </div>
        </div>

        <main className="pt-16">
          <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
