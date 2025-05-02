'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  getProject,
  getProjectsProductCible,
  getProjectsStatus,
  getProjectsTypes,
  getProjectsZonesDropdown,
  ProjectSchema,
  updateProject,
  type Project,
} from '@/lib/services/projects';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ZoneOption {
  _id: string;
  zone_cible: string;
  sous_Zone_cible: string;
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => getProject(params.id),
  });
  const [selectedZones, setSelectedZones] = useState<string[]>(
    project?.zone_cible ? project.zone_cible : []
  );

  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const [allFetchedZones, setAllFetchedZones] = useState(new Map<string, any>());

  const { data: ProjectProductCible = [] } = useQuery({
    queryKey: ['ProjectProductCible'],
    queryFn: getProjectsProductCible,
  });

  const { data: projectStatus = [] } = useQuery({
    queryKey: ['projectStatus'],
    queryFn: getProjectsStatus,
  });

  const { data: ProjectType = [] } = useQuery({
    queryKey: ['ProjectType'],
    queryFn: getProjectsTypes,
  });

  const {
    data: ProjectsZonesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingZones,
  } = useInfiniteQuery({
    queryKey: ['ProjectsZones', debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getProjectsZonesDropdown({ pageParam, search: debouncedSearchTerm }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const allZones = ProjectsZonesPages?.pages.flatMap((page) => page.data) || [];

  // ✅ Better to reset when search term changes
  useEffect(() => {
    // Reset when search term changes
    const newMap = new Map<string, any>();
    allZones.forEach((zone) => newMap.set(zone?._id, zone));
    setAllFetchedZones(newMap);
  }, [debouncedSearchTerm]);

  // Keep current accumulation for pagination
  useEffect(() => {
    if (!debouncedSearchTerm) {
      const newMap = new Map<string, any>(allFetchedZones);
      allZones.forEach((zone) => newMap.set(zone?._id, zone));
      setAllFetchedZones(newMap);
    }
  }, [allZones, allFetchedZones, debouncedSearchTerm]);

  const { register, handleSubmit, formState: { errors }, setValue } =
    useForm<Project>({
      resolver: zodResolver(ProjectSchema),
      values: project,
    });

  const onSubmit = async (data: Project) => {
    setIsSubmitting(true);
    try {
      const response = await updateProject(params.id, data);
      if (typeof response === 'object' && response !== null && 'message' in response) {
        throw new Error(`Failed to update project : ${response?.message}`);
      }

      toast.success('Project updated successfully');
      router.push('/dashboard/projects');
    } catch (error: any) {
      toast.error(` ${error?.response?.data?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Edit Project</CardTitle>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input {...register('nom_projet')} disabled={isSubmitting} />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Type</label>
                  <Select
                    defaultValue={project.type_projet}
                    onValueChange={(value) => setValue('type_projet', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ProjectType.map((type: any) => (
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
                  <label>Target Product</label>
                  {/* <Input {...register('produit_cible')} disabled={isSubmitting} /> */}
                  <Select
                    defaultValue={project.produit_cible}
                    onValueChange={(value) => setValue('produit_cible', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product Cible" />
                    </SelectTrigger>
                    <SelectContent>
                      {ProjectProductCible.map((ProductCible: any) => (
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
            </div>


            <div className="space-y-2">
              <label>Description</label>
              <Textarea {...register('description_projet')} disabled={isSubmitting} />
              {errors.description_projet && <p className="text-sm text-red-500">{errors.description_projet.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Revenue Objective</label>
                <Input type="number" {...register('objectif_ca')} disabled={isSubmitting} />
                {errors.objectif_ca && <p className="text-sm text-red-500">{errors.objectif_ca.message}</p>}
              </div>

              <div className="space-y-2">
                <label>Quantity Objective</label>
                <Input type="number" {...register('objectif_qte')} disabled={isSubmitting} />
                {errors.objectif_qte && <p className="text-sm text-red-500">{errors.objectif_qte.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label>Target Zone</label>
              {/* <Input {...register('zone_cible')} disabled={isSubmitting} /> */}
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
                isLoading={isLoadingZones}
                allFetchedZones={Array.from(allFetchedZones.values())}
                multiple={true}
              />
              {errors.zone_cible && <p className="text-sm text-red-500">{errors.zone_cible.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Start Date</label>
                <Input
                  defaultValue={new Date(project.periode_date_debut).toISOString().split('T')[0]}
                  type="date" {...register('periode_date_debut')} disabled={isSubmitting} />
                {errors.periode_date_debut && <p className="text-sm text-red-500">{errors.periode_date_debut.message}</p>}
              </div>

              <div className="space-y-2">
                <label>End Date</label>
                <Input
                  defaultValue={new Date(project.periode_date_fin).toISOString().split('T')[0]}
                  type="date" {...register('periode_date_fin')} disabled={isSubmitting} />
                {errors.periode_date_fin && <p className="text-sm text-red-500">{errors.periode_date_fin.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label>Status</label>
              <Select
                defaultValue={project.statut_projet}
                onValueChange={(value) => setValue('statut_projet', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product Cible" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatus.map((status: any) => (
                    <SelectItem key={status._id} value={status._id}>
                      {status.nom_statut_prj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.statut_projet && <p className="text-sm text-red-500">{errors.statut_projet.message}</p>}
            </div>

            <div className="space-y-2">
              <label>Notes</label>
              <Textarea {...register('notes_projet')} disabled={isSubmitting} />
              {errors.notes_projet && <p className="text-sm text-red-500">{errors.notes_projet.message}</p>}
            </div>

            <div className="flex justify-end space-x-4">

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              ></Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Project'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
