'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createProject, getProjectsProductCible, getProjectsStatus, getProjectsTypes, getProjectsZones, ProjectSchema, type Project } from '@/lib/services/projects';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Project>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      periode_date_debut: new Date().toISOString(),
      periode_date_fin: new Date().toISOString(),
      statut_projet: 'PLANNED'
    }
  });

  console.log("errors", errors);


  const { data: projectStatus = [] } = useQuery({
    queryKey: ['projectStatus'],
    queryFn: getProjectsStatus
  });

  const { data: ProjectType = [] } = useQuery({
    queryKey: ['ProjectType'],
    queryFn: getProjectsTypes
  });

  const { data: ProjectProductCible = [] } = useQuery({
    queryKey: ['ProjectProductCible'],
    queryFn: getProjectsProductCible
  });

  const { data: ProjectsZones = [] } = useQuery({
    queryKey: ['ProjectsZones'],
    queryFn: getProjectsZones
  });

  const onSubmit = async (data: Omit<Project, 'Id_projet'>) => {
    setIsSubmitting(true);
    try {
      const response = await createProject(data)
      if (response) throw new Error(`Failed to create project : ${response?.message}`);

      toast.success('Project created successfully');
      router.push('/dashboard/projects');
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
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input {...register('nom_projet')} disabled={isSubmitting} />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Type</label>
                  <Select
                    onValueChange={(value) => setValue('type_projet', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ProjectType.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.nom_type_prj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type_projet && (
                    <p className="text-sm text-red-500">{errors.type_projet.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Product</label>
                  {/* <Input {...register('produit_cible')} disabled={isSubmitting} /> */}

                  <Select
                    onValueChange={(value) => setValue('produit_cible', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product Cible" />
                    </SelectTrigger>
                    <SelectContent>
                      {ProjectProductCible.map((ProductCible) => (
                        <SelectItem key={ProductCible._id} value={ProductCible._id}>
                          {ProductCible.nom_produit_cible}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.produit_cible && (
                    <p className="text-sm text-red-500">{errors.produit_cible.message}</p>
                  )}

                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea {...register('description_projet')} disabled={isSubmitting} />
                {errors.description_projet && (
                  <p className="text-sm text-red-500">{errors.description_projet.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Revenue Objective</label>
                  <Input
                    type="number"
                    {...register('objectif_ca', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.objectif_ca && (
                    <p className="text-sm text-red-500">{errors.objectif_ca.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity Objective</label>
                  <Input
                    type="number"
                    {...register('objectif_qte', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.objectif_qte && (
                    <p className="text-sm text-red-500">{errors.objectif_qte.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Zone</label>
                <Select
                  onValueChange={(value) => setValue('zone_cible', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Target Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {ProjectsZones.map((zone) => (
                      <SelectItem key={zone._id} value={zone._id}>
                        {zone.zone_cible} - {zone.sous_Zone_cible}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zone_cible && (
                  <p className="text-sm text-red-500">{errors.zone_cible.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    {...register('periode_date_debut')}
                    disabled={isSubmitting}
                  />
                  {errors.periode_date_debut && (
                    <p className="text-sm text-red-500">{errors.periode_date_debut.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    {...register('periode_date_fin')}
                    disabled={isSubmitting}
                  />
                  {errors.periode_date_fin && (
                    <p className="text-sm text-red-500">{errors.periode_date_fin.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  onValueChange={(value) => setValue('statut_projet', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Product Cible" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatus.map((status) => (
                      <SelectItem key={status._id} value={status._id}>
                        {status.nom_statut_prj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.statut_projet && (
                  <p className="text-sm text-red-500">{errors.statut_projet.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea {...register('notes_projet')} disabled={isSubmitting} />
                {errors.notes_projet && (
                  <p className="text-sm text-red-500">{errors.notes_projet.message}</p>
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