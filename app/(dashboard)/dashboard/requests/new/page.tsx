'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createRequest, RequestSchema } from '@/lib/services/requests';
import { Request } from '@/lib/types/request';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function NewRequestPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<Request>({
        resolver: zodResolver(RequestSchema),
        defaultValues: {
            Date_requete: new Date().toISOString(),
            Statut_requete: 'Pending'
        }
    });

    const onSubmit = async (data: Omit<Request, 'Id_requete'>) => {
        setIsSubmitting(true);
        try {
            const response = await createRequest(data)
            if (response) throw new Error(`Failed to create request : ${response?.message}`);

            toast.success('Request created successfully');
            router.push('/dashboard/requests');
        } catch (error) {
            console.log("err", error);
            toast.error(` ${error?.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Request</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Request ID</label>
                            <Input {...register('Id_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Request Date</label>
                            <Input type="date" {...register('Date_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client ID</label>
                            <Input {...register('Id_Client')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Request Type</label>
                            <Input {...register('Type_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target</label>
                            <Input {...register('Cible_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea {...register('Description_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Input {...register('Statut_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea {...register('Notes_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Traitement</label>
                            <Input type="date" {...register('Date_traitement_requete')} disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Heure Traitement</label>
                            <Input type="time" {...register('Heure_traitement_requete')} disabled={isSubmitting} />
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
                                    'Create Request'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
