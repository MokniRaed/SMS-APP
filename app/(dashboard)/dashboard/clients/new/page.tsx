'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientContactSchema, type ClientContact, createClientContact, getFonctions, type FonctionContact } from '@/lib/services/clients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function NewClientContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: fonctions = [] } = useQuery({
    queryKey: ['fonctions'],
    queryFn: getFonctions
  });

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ClientContact>({
    resolver: zodResolver(ClientContactSchema)
  });

  const onSubmit = async (data: Omit<ClientContact, 'id'>) => {
    setIsSubmitting(true);
    try {
      await createClientContact(data);
      toast.success('Client contact created successfully');
      router.push('/dashboard/clients');
    } catch (error) {
      toast.error('Failed to create client contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Client Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client ID</label>
                  <Input {...register('id_client')} disabled={isSubmitting} />
                  {errors.id_client && (
                      <p className="text-sm text-destructive">{errors.id_client.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input {...register('nom_prenom_contact')} disabled={isSubmitting} />
                  {errors.nom_prenom_contact && (
                      <p className="text-sm text-destructive">{errors.nom_prenom_contact.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Function</label>
                <Select
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
                </Select>
                {errors.fonction_contact && (
                    <p className="text-sm text-destructive">{errors.fonction_contact.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fixed Phone</label>
                  <Input {...register('numero_fix')} disabled={isSubmitting} />
                  {errors.numero_fix && (
                      <p className="text-sm text-destructive">{errors.numero_fix.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Phone</label>
                  <Input {...register('numero_mobile')} disabled={isSubmitting} />
                  {errors.numero_mobile && (
                      <p className="text-sm text-destructive">{errors.numero_mobile.message}</p>
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
                  <label className="text-sm font-medium">Facebook</label>
                  <Input {...register('compte_facebook')} disabled={isSubmitting} />
                  {errors.compte_facebook && (
                      <p className="text-sm text-destructive">{errors.compte_facebook.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram</label>
                  <Input {...register('compte_instagram')} disabled={isSubmitting} />
                  {errors.compte_instagram && (
                      <p className="text-sm text-destructive">{errors.compte_instagram.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn</label>
                  <Input {...register('compte_linkedin')} disabled={isSubmitting} />
                  {errors.compte_linkedin && (
                      <p className="text-sm text-destructive">{errors.compte_linkedin.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp</label>
                  <Input {...register('compte_whatsapp')} disabled={isSubmitting} />
                  {errors.compte_whatsapp && (
                      <p className="text-sm text-destructive">{errors.compte_whatsapp.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">WhatsApp Number</label>
                <Input {...register('compte_whatsapp_num')} disabled={isSubmitting} />
                {errors.compte_whatsapp_num && (
                    <p className="text-sm text-destructive">{errors.compte_whatsapp_num.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Channel</label>
                <Input {...register('canal_interet')} disabled={isSubmitting} />
                {errors.canal_interet && (
                    <p className="text-sm text-destructive">{errors.canal_interet.message}</p>
                )}
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
                      'Create Contact'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}