'use client';

import { NotificationCenter } from '@/components/notifications/notification-center';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserMenu } from '@/components/user-menu';
import { getUserFromLocalStorage, handleLogout } from '@/lib/utils';
import { Boxes, Briefcase, ChevronLeft, ChevronRight, Database, FileText, Handshake, Home, LogOut, Menu, MessageSquareDot, Puzzle, Settings, ShoppingCart, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigationGroups = [
  {
    title: 'General',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['collaborateur', 'admin'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Tasks', href: '/dashboard/tasks', icon: FileText, roles: ['admin', 'collaborateur'] },
      { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, roles: ['admin', 'collaborateur', 'client'] },
      { name: 'Requests', href: '/dashboard/requests', icon: MessageSquareDot, roles: ['admin', 'collaborateur', 'client'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, roles: ['admin', 'collaborateur'] },
      { name: 'Clients', href: '/dashboard/clients', icon: Handshake, roles: ['admin', 'collaborateur'] },
      { name: 'Collaborators', href: '/dashboard/collaborators', icon: Puzzle, roles: ['admin', 'collaborateur'] },
      { name: 'Categories', href: '/dashboard/categories', icon: Boxes, roles: ['admin', 'collaborateur'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['admin'] },
      { name: 'Data Sync', href: '/dashboard/sync', icon: Database, roles: ['admin'] },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
    ],
  },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = getUserFromLocalStorage() ?? {};
  const userRole = user?.role;
  // console.log("userRole", userRole);



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
            <h1 className="text-2xl font-bold">SMS Manager</h1>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navigationGroups.map((group, groupIndex) => {
              const visibleItems = group.items.filter((item) => item.roles.includes(userRole));
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="mt-4">
                  {/* Section Title */}
                  {!collapsed && (
                    <h2 className="text-muted-foreground text-xs font-semibold uppercase px-3 mb-2">
                      {group.title}
                    </h2>
                  )}

                  {/* Navigation Links */}
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center w-full gap-2 py-2 px-3 rounded-lg transition-colors
              ${collapsed ? 'justify-center px-0' : ''}
              ${isActive ? 'bg-accent text-primary' : 'hover:bg-muted'}
            `}
                      >
                        <Icon className="h-5 w-5" />
                        {!collapsed && <span className="text-sm">{item.name}</span>}
                      </Link>
                    );
                  })}

                  {/* Divider */}
                  {groupIndex < navigationGroups.length - 1 && (
                    <hr className="my-3 border-t border-border" />
                  )}
                </div>
              );
            })}


            <div className="mt-6 border-t pt-4 px-3">
              <Button
                variant="ghost"
                className={`justify-start gap-2 w-full ${collapsed ? 'px-0 justify-center' : ''}`}
                onClick={() => handleLogout()}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && "Logout"}
              </Button>
            </div>

          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop navigation */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${collapsed ? 'w-24' : 'w-64'
          }`}
      >
        <div className="flex grow flex-col gap-y-2 overflow-y-auto border-r px-4 ">
          <div className="flex items-center justify-center ">
            <Image
              src="/assets/light-logo.png"
              alt="Light Logo"
              width={250}
              height={250}
              className={`h-32 w-48 object-contain hidden dark:block transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
            />
            <Image
              src="/assets/dark-logo.png"
              alt="Dark Logo"
              width={250}
              height={250}
              className={`h-32 w-48 object-contain block dark:hidden transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
            />
            <Image
              src="/assets/dark-icon.png"
              alt="Dark Icon"
              width={50}
              height={50}
              className={`h-12 w-12 object-contain block dark:hidden transition-all duration-300 absolute top-12 left-1/2 -translate-x-1/2 ${collapsed ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}
            />
            <Image
              src="/assets/light-icon.png"
              alt="Light Icon"
              width={50}
              height={50}
              className={`h-12 w-12 object-contain hidden dark:block transition-all duration-300 absolute top-12 left-1/2 -translate-x-1/2 ${collapsed ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}
            />
            <div className="absolute top-32 right-0 -translate-y-1/2">
              <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {navigationGroups.map((group, groupIndex) => {
              const visibleItems = group.items.filter((item) => item.roles.includes(userRole));
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="mt-2">
                  {/* Section Title */}
                  {!collapsed && (
                    <h2 className="text-muted-foreground text-xs font-semibold uppercase px-3 mb-2">
                      {group.title}
                    </h2>
                  )}

                  {/* Navigation Links */}
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center w-full gap-2 py-2 px-3 rounded-lg transition-colors
              ${collapsed ? 'justify-center px-0' : ''}
              ${isActive ? 'bg-accent text-primary' : 'hover:bg-muted'}
            `}
                      >
                        <Icon className="h-5 w-5" />
                        {!collapsed && <span className="text-sm">{item.name}</span>}
                      </Link>
                    );
                  })}

                  {/* Divider */}
                  {groupIndex < navigationGroups.length - 1 && (
                    <hr className="my-3 border-t border-border" />
                  )}
                </div>
              );
            })}


            {/* <Button variant="ghost" className={`justify-start gap-2 mt-auto ${collapsed ? 'px-0 justify-center' : ''}`} onClick={() => handleLogout()}>
              <LogOut className="h-5 w-5" />
              {!collapsed && "Logout"}
            </Button> */}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`${collapsed ? 'lg:pl-24' : 'lg:pl-64'}`}>
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
