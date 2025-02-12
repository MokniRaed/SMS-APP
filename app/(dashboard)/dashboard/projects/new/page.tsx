'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectSchema, type Project } from '@/lib/services/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Project>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      Periode_Date_debut: new Date().toISOString(),
      Periode_Date_fin: new Date().toISOString(),
      Statut_projet: 'PLANNED'
    }
  });

  const onSubmit = async (data: Omit<Project, 'Id_projet'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create project');

      toast.success('Project created successfully');
      router.push('/dashboard/projects');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Type</label>
                  <Select onValueChange={(value) => setValue('Type_projet', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEVELOPMENT">Development</SelectItem>
                      <SelectItem value="RESEARCH">Research</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.Type_projet && (
                      <p className="text-sm text-red-500">{errors.Type_projet.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Product</label>
                  <Input {...register('Produit_cible')} disabled={isSubmitting} />
                  {errors.Produit_cible && (
                      <p className="text-sm text-red-500">{errors.Produit_cible.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea {...register('Description_projet')} disabled={isSubmitting} />
                  {errors.Description_projet && (
                      <p className="text-sm text-red-500">{errors.Description_projet.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Revenue Objective</label>
                    <Input
                        type="number"
                        {...register('Objectif_CA', { valueAsNumber: true })}
                        disabled={isSubmitting}
                    />
                    {errors.Objectif_CA && (
                        <p className="text-sm text-red-500">{errors.Objectif_CA.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity Objective</label>
                    <Input
                        type="number"
                        {...register('Objectif_Qte', { valueAsNumber: true })}
                        disabled={isSubmitting}
                    />
                    {errors.Objectif_Qte && (
                        <p className="text-sm text-red-500">{errors.Objectif_Qte.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Zone</label>
                  <Input {...register('Zone_cible')} disabled={isSubmitting} />
                  {errors.Zone_cible && (
                      <p className="text-sm text-red-500">{errors.Zone_cible.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                        type="date"
                        {...register('Periode_Date_debut')}
                        disabled={isSubmitting}
                    />
                    {errors.Periode_Date_debut && (
                        <p className="text-sm text-red-500">{errors.Periode_Date_debut.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                        type="date"
                        {...register('Periode_Date_fin')}
                        disabled={isSubmitting}
                    />
                    {errors.Periode_Date_fin && (
                        <p className="text-sm text-red-500">{errors.Periode_Date_fin.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                      defaultValue="PLANNED"
                      onValueChange={(value) => setValue('Statut_projet', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.Statut_projet && (
                      <p className="text-sm text-red-500">{errors.Statut_projet.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea {...register('Notes_projet')} disabled={isSubmitting} />
                  {errors.Notes_projet && (
                      <p className="text-sm text-red-500">{errors.Notes_projet.message}</p>
                  )}
                </div>
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
                      'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}