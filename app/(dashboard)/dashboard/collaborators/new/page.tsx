'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Collaborator, CollaboratorSchema, createCollaborator } from '@/lib/services/collaborators';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function NewCollaboratorContactPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const { data: fonctions = [] } = useQuery({
    //     queryKey: ['fonctions'],
    //     queryFn: getFonctions
    // });

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<Collaborator>({
        resolver: zodResolver(CollaboratorSchema)
    });
    console.log("errors", errors);


    const onSubmit = async (data: Omit<Collaborator, 'id'>) => {
        setIsSubmitting(true);
        try {
            await createCollaborator(data);
            toast.success('Collaborator  created successfully');
            router.push('/dashboard/collaborators');
        } catch (error) {
            toast.error('Failed to create collaborator');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Collaborator </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* <div className="space-y-2">
                                <label className="text-sm font-medium">Client ID</label>
                                <Input {...register('id_client')} disabled={isSubmitting} />
                                {errors.id_client && (
                                    <p className="text-sm text-destructive">{errors.id_client.message}</p>
                                )}
                            </div> */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <Input {...register('firstName')} disabled={isSubmitting} />
                                {errors.firstName && (
                                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <Input {...register('lastName')} disabled={isSubmitting} />
                                {errors.lastName && (
                                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Function</label>
                                <Input {...register('fontion')} disabled={isSubmitting} />

                                {/* <Select
                                onValueChange={(value) => setValue('fonction_contact', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a function" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fonctions.map((fonction) => (
                                        <SelectItem
                                            key={fonction._id}
                                            value={fonction._id}
                                        >
                                            {fonction.nom_fonc} - {fonction.description_fonc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select> */}
                                {errors.fontion && (
                                    <p className="text-sm text-destructive">{errors.fontion.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Service</label>
                                <Input {...register('service')} disabled={isSubmitting} />

                                {/* <Select
                                onValueChange={(value) => setValue('fonction_contact', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a function" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fonctions.map((fonction) => (
                                        <SelectItem
                                            key={fonction._id}
                                            value={fonction._id}
                                        >
                                            {fonction.nom_fonc} - {fonction.description_fonc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select> */}
                                {errors.service && (
                                    <p className="text-sm text-destructive">{errors.service.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" {...register('adresse_email')} disabled={isSubmitting} />
                            {errors.adresse_email && (
                                <p className="text-sm text-destructive">{errors.adresse_email.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mobile Phone</label>
                                <Input {...register('numero_mobile')} disabled={isSubmitting} />
                                {errors.numero_mobile && (
                                    <p className="text-sm text-destructive">{errors.numero_mobile.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
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
                                    'Create Collaborator'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
