'use client';

import { Briefcase, Database, FileText, Home, Settings, ShoppingCart, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile navigation */}
      {/* <Sheet>
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent ${pathname === item.href ? 'bg-accent' : ''
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
      {/* <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
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
      </div> */}

      {/* Main content */}
      <main className="py-4">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}