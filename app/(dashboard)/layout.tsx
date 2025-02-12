'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Users, Briefcase, FileText, Settings, LogOut, Database, ShoppingCart } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/notification-center';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tasks', href: '/dashboard/tasks', icon: FileText },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Data Sync', href: '/dashboard/sync', icon: Database },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
                                          children,
                                        }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="lg:hidden fixed top-4 left-4">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent ${
                            pathname === item.href ? 'bg-accent' : ''
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop navigation */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r px-6 py-4">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-2xl font-bold">Task Manager</h1>
            </div>
            <nav className="flex flex-1 flex-col gap-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent ${
                            pathname === item.href ? 'bg-accent' : ''
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                );
              })}
              <Button variant="ghost" className="justify-start gap-2 mt-auto" asChild>
                <Link href="/api/auth/logout">
                  <LogOut className="h-5 w-5" />
                  Logout
                </Link>
              </Button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="fixed top-0 right-14 left-0 lg:left-64 h-16 border-b bg-background z-50">
            <div className="flex items-center justify-end h-full px-4">
              <NotificationCenter />
            </div>
          </div>

          <main className="pt-16">
            <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
          </main>
        </div>
      </div>
  );
}