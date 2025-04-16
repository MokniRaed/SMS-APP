'use client';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export default function Loader({
    size = 12,
    className = '',
    color = 'text-muted-foreground dark:text-muted-foreground',
}: {
    size?: number;
    className?: string;
    color?: string;
}) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <div className="flex flex-col items-center justify-center text-muted-foreground dark:text-muted-foreground">
                <Loader2
                    className={clsx(
                        'animate-spin mb-4',
                        `h-${size} w-${size}`,
                        color,
                        className
                    )}
                />
                <span className="text-lg font-medium">Loading...</span>
            </div>
        </div>
    );
}
