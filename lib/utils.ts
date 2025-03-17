// src/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const handleLogout = async (options?: {
  redirectPath?: string;
  successMessage?: string;
  router?: any;
}) => {
  try {
    // Call server-side logout endpoint
    const logoutResponse = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!logoutResponse.ok) throw new Error('Logout failed');

    // Clear client-side storage
    localStorage.removeItem('user');

    // Show success notification
    toast.success(options?.successMessage || 'Logged out successfully');

    // Handle redirection
    const redirectPath = options?.redirectPath || '/login';
    if (options?.router) {
      options.router.push(redirectPath);
    } else {
      window.location.href = redirectPath;
    }
  } catch (error) {
    toast.error('Logout failed. Please try again.');
    console.error('Logout error:', error);
  }
};



export const getUserFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    // Check if localStorage exists and get user data
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const getCurrentUserId = () => {
  if (typeof window !== "undefined") {
    // Check if localStorage exists and get user data
    const userData = localStorage.getItem("user");

    const { user } = userData ? JSON.parse(userData) : {};
    return user?.id
  }
  return null;
};

