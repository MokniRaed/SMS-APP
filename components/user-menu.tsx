'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserFromLocalStorage, handleLogout } from '@/lib/utils';
import { LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function UserMenu() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before accessing theme information
    useEffect(() => {
        setMounted(true);
        setIsDarkMode(theme === 'dark');
    }, [theme]);

    // Handle theme toggle
    const handleToggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setIsDarkMode(!isDarkMode);
        setTheme(newTheme);
    };

    const { user } = getUserFromLocalStorage() ?? {};
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{user ? user?.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    
                    {/* Theme Toggle Switch */}
                    <DropdownMenuItem 
                        className="flex items-center justify-between"
                        onSelect={(e) => {
                            // Prevent the dropdown from closing when toggling theme
                            e.preventDefault();
                        }}
                    >
                        <div className="flex items-center">
                            {mounted && isDarkMode ? (
                                <Moon className="mr-2 h-4 w-4" />
                            ) : (
                                <Sun className="mr-2 h-4 w-4" />
                            )}
                            <span>Dark Mode</span>
                        </div>
                        <Switch
                            checked={mounted && isDarkMode}
                            onCheckedChange={handleToggleTheme}
                        />
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}