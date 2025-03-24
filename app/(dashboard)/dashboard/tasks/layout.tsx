'use client';

import { Button } from '@/components/ui/button';
import { Calendar, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex  items-center px-4">
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/dashboard/tasks">
              <Button
                variant={pathname === '/dashboard/tasks' ? 'secondary' : 'ghost'}
                size="sm"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                List View
              </Button>
            </Link>
            <Link href="/dashboard/tasks/calendar">
              <Button
                variant={pathname === '/dashboard/tasks/calendar' ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </Link>
          </div>

        </div>
      </div>
      {children}
    </div>
  );
}