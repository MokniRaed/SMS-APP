'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/services/notifications';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export function NotificationCenter() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const { data: notifications = [], refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            await markAsRead(notification.id);
            refetch();
        }
        if (notification.link) {
            router.push(notification.link);
        }
        setOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        refetch();
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return 'text-green-600 dark:text-green-400';
            case 'WARNING':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'ERROR':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h2 className="text-sm font-semibold">Notifications</h2>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`px-4 py-2 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), 'PP')}
                    </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-sm text-muted-foreground">No notifications</p>
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}