'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUser, CreateUserSchema, getRoles, type User } from '@/lib/services/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<User>({
    resolver: zodResolver(CreateUserSchema),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
  console.log("errors", errors);



  // const selectedPermissions = watch('permissions');

  const onSubmit = async (data: User) => {
    setIsSubmitting(true);
    try {
      const response = await createUser(data)
      if (response) throw new Error(`Failed to create user : ${response?.message}`);

      toast.success('User created successfully');
      router.push('/dashboard/users');
    } catch (error) {
      console.log("err", error);

      toast.error(` ${error?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handlePermissionToggle = (permission: string, checked: boolean) => {
  //   const currentPermissions = selectedPermissions || [];
  //   if (checked) {
  //     setValue('permissions', [...currentPermissions, permission]);
  //   } else {
  //     setValue('permissions', currentPermissions.filter(p => p !== permission));
  //   }
  // };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input {...register('username')} disabled={isSubmitting} />
                  {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" {...register('email')} disabled={isSubmitting} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select onValueChange={(value) => setValue('role', value as User['role'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
              </div>

              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {watch('isActive') ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div> */}

              {/* <div className="space-y-4">
                <label className="text-sm font-medium">Permissions</label>
                <Accordion type="multiple">
                  {Object.entries(AVAILABLE_PERMISSIONS).map(([category, permissions]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="text-sm font-medium capitalize">{category}</AccordionTrigger>
                      <AccordionContent className="space-y-2 p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission}
                                checked={selectedPermissions?.includes(permission)}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(permission, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={permission}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.split('.')[1].charAt(0).toUpperCase() +
                                  permission.split('.')[1].slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {errors.permissions && (
                  <p className="text-sm text-red-500">{errors.permissions.message}</p>
                )}
              </div> */}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div >
  );
}