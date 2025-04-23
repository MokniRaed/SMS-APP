'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MultiSelectPopover from '@/components/ui/MultiSelectPopover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/useDebounce';
import {
  createProject,
  getProjectsProductCible,
  getProjectsStatus,
  getProjectsTypes,
  getProjectsZonesDropdown,
  ProjectSchema,
  type Project
} from '@/lib/services/projects';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const [allFetchedZones, setAllFetchedZones] = useState(new Map());

  console.log("allFetchedZones", allFetchedZones);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Project>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      periode_date_debut: new Date().toISOString(),
      periode_date_fin: new Date().toISOString(),
      statut_projet: 'PLANNED',
    },
  });

  console.log('errors', errors);

  const { data: projectStatus = [] } = useQuery<any[]>({
    queryKey: ['projectStatus'],
    queryFn: getProjectsStatus
  });

  const { data: ProjectType = [] } = useQuery<any[]>({
    queryKey: ['ProjectType'],
    queryFn: getProjectsTypes
  });

  const { data: ProjectProductCible = [] } = useQuery<any[]>({
    queryKey: ['ProjectProductCible'],
    queryFn: getProjectsProductCible
  });

  const {
    data: ProjectsZonesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['ProjectsZones', debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getProjectsZonesDropdown({ pageParam, search: debouncedSearchTerm }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  console.log("ProjectsZonesPages", ProjectsZonesPages);


  const allZones = ProjectsZonesPages?.pages.flatMap(page => page.data) || [];

  // ✅ Better to reset when search term changes
  useEffect(() => {
    // Reset when search term changes
    const newMap = new Map();
    allZones.forEach(zone => newMap.set(zone?._id, zone));
    setAllFetchedZones(newMap);
  }, [debouncedSearchTerm]);

  // Keep current accumulation for pagination
  useEffect(() => {
    if (!debouncedSearchTerm) {
      const newMap = new Map(allFetchedZones);
      allZones.forEach(zone => newMap.set(zone?._id, zone));
      setAllFetchedZones(newMap);
    }
  }, [allZones, allFetchedZones, debouncedSearchTerm]);

  const onSubmit = async (data: Omit<Project, 'Id_projet'>) => {
    setIsSubmitting(true);
    try {
      const response = await createProject(data);
      if (response && response.message) {
        throw new Error(`Failed to create project : ${response?.message}`);
      }

      toast.success('Project created successfully');
      router.push('/dashboard/projects');
    } catch (error) {
      console.log('err', error);
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
                    <p className="text-sm text-red-500">
                      {errors.type_projet.message}
                    </p>
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
                    <p className="text-sm text-red-500">
                      {errors.produit_cible.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  {...register('description_projet')}
                  disabled={isSubmitting}
                />
                {errors.description_projet && (
                  <p className="text-sm text-red-500">
                    {errors.description_projet.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Revenue Objective
                  </label>
                  <Input
                    type="number"
                    {...register('objectif_ca', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.objectif_ca && (
                    <p className="text-sm text-red-500">
                      {errors.objectif_ca.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Quantity Objective
                  </label>
                  <Input
                    type="number"
                    {...register('objectif_qte', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.objectif_qte && (
                    <p className="text-sm text-red-500">
                      {errors.objectif_qte.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Zone</label>

                <MultiSelectPopover
                  options={allZones}  // Changed from allFetchedZones
                  selectedValues={selectedZones}
                  onChange={(values) => {
                    setSelectedZones(values);
                    setValue("zone_cible", values);
                  }}
                  labelKey1="zone_cible"
                  labelKey2="sous_Zone_cible"
                  placeholder="Select Target Zones"
                  onScrollBottom={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  isFetchingMore={isFetchingNextPage}
                  searchTerm={searchInput}
                  onSearchChange={(value) => {
                    setSearchInput(value);
                    // Clear previous results when search changes
                    queryClient.removeQueries({
                      queryKey: ['ProjectsZones'],
                      exact: false
                    });
                  }}
                  isLoading={isLoading}
                  allFetchedZones={Array.from(allFetchedZones.values())} // Add this
                />


                {errors.zone_cible && (
                  <p className="text-sm text-red-500">
                    {errors.zone_cible.message}
                  </p>
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
                    <p className="text-sm text-red-500">
                      {errors.periode_date_debut.message}
                    </p>
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
                    <p className="text-sm text-red-500">
                      {errors.periode_date_fin.message}
                    </p>
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
                  <p className="text-sm text-red-500">
                    {errors.statut_projet.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  {...register('notes_projet')}
                  disabled={isSubmitting}
                />
                {errors.notes_projet && (
                  <p className="text-sm text-red-500">
                    {errors.notes_projet.message}
                  </p>
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
