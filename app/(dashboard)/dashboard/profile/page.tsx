'use client';

import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserProfile, updateUser, updateUserPassword, User } from '@/lib/services/users';
import { getCurrentUserId } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const PasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const UserUpdateSchema = z.object({
    username: z.string().min(1, 'Current Username is required'),
    // email: z.string().email('Invalid email address'),

});

type PasswordForm = z.infer<typeof PasswordSchema>;

export default function ProfilePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const {
        register: passwordRegister,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPasswordForm
    } = useForm<PasswordForm>({
        resolver: zodResolver(PasswordSchema)
    });

    const id = getCurrentUserId()

    const { data: user } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUserProfile(id)
    });

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<User>({
        resolver: zodResolver(UserUpdateSchema),
        values: user
    });

    console.log("errors", passwordErrors);

    const handleProfileUpdate = async (data: User) => {
        setIsSubmitting(true);
        try {
            const response = await updateUser(id, data)
            console.log("response", response);
            if (response) throw new Error(`Failed to uddate Prodile : ${response?.message}`);

            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(` ${error?.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordForm) => {
        setIsSubmitting(true);
        try {
            const response = await updateUserPassword(id, data)
            console.log("response", response);
            if (response) throw new Error(`Failed to uddate Prodile : ${response?.message}`);

            toast.success('Password updated successfully');
            setIsPasswordDialogOpen(false);
            resetPasswordForm();
        } catch (error) {
            toast.error('Failed to update password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Profile Settings</h1>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="danger">Danger Zone</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <div className="grid gap-6">
                        {/* Profile Photo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Photo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileUpload
                                    onUpload={(url) => {
                                        toast.success('Profile photo updated');
                                    }}
                                    accept={{
                                        'image/*': ['.png', '.jpeg', '.jpg', '.gif']
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Profile Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Full Name</label>
                                            <Input placeholder="John Doe" {...register('username')} />
                                            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}

                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <Input type="email" placeholder="john@example.com" {...register('email')} disabled />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone Number</label>
                                            <Input type="tel" placeholder="+1 (555) 000-0000" disabled />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security">
                    <div className="grid gap-6">
                        {/* Password */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted-foreground">
                                            Update your password to keep your account secure
                                        </p>
                                    </div>
                                    <Button onClick={() => setIsPasswordDialogOpen(true)}>
                                        Change Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Two-Factor Authentication */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Switch
                                        checked={twoFactorEnabled}
                                        onCheckedChange={setTwoFactorEnabled}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="danger">
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all of your data
                                    </p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new one.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Password</label>
                                <Input
                                    type="password"
                                    {...passwordRegister('currentPassword')}
                                    disabled={isSubmitting}
                                />
                                {passwordErrors.currentPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Password</label>
                                <Input
                                    type="password"
                                    {...passwordRegister('newPassword')}
                                    disabled={isSubmitting}
                                />
                                {passwordErrors.newPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm New Password</label>
                                <Input
                                    type="password"
                                    {...passwordRegister('confirmNewPassword')}
                                    disabled={isSubmitting}
                                />
                                {passwordErrors.confirmNewPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsPasswordDialogOpen(false);
                                    resetPasswordForm();
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}