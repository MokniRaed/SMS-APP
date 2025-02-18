'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardSkeleton } from '@/components/ui/skeletons/card-skeleton';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProject, getProjects, Project, updateProject } from '@/lib/services/projects';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowUpDown, Calendar, LayoutGrid, MapPin, Pencil, Plus, Table as TableIcon, Target, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'table';
type SortField = 'type_projet' | 'produit_cible' | 'statut_projet' | 'periode_date_debut';
type SortOrder = 'asc' | 'desc';

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('periode_date_debut');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  // const { data: typeProject = [], isLoading } = useQuery({
  //   queryKey: ['typeProject'],
  //   queryFn: getProjects
  // });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      return updateProject(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projects updated successfully');
      setSelectedProjects([]);
    },
    onError: () => {
      toast.error('Failed to update projects');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
      setDeleteProjectId(null);
    },
    onError: () => {
      toast.error('Failed to delete project');
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map(project => project._id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, projectId]);
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedProjects.map(projectId =>
          updateMutation.mutateAsync({
            id: projectId,
            data: { statut_projet: status }
          })
        )
      );
    } catch (error) {
      toast.error('Failed to update projects');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedProjects.map(projectId => deleteMutation.mutateAsync(projectId))
      );
      setSelectedProjects([]);
      toast.success('Projects deleted successfully');
    } catch (error) {
      toast.error('Failed to delete projects');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'type_projet':
        comparison = a.type_projet.localeCompare(b.type_projet);
        break;
      case 'produit_cible':
        comparison = (a.produit_cible || '').localeCompare(b.produit_cible.nom_produit_cible || '');
        break;
      case 'statut_projet':
        comparison = a.statut_projet.localeCompare(b.statut_projet.nom_statut_prj);
        break;
      case 'periode_date_debut':
        comparison = new Date(a.periode_date_debut).getTime() - new Date(b.periode_date_debut).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'DEVELOPMENT':
        return 'bg-purple-100 text-purple-800';
      case 'RESEARCH':
        return 'bg-indigo-100 text-indigo-800';
      case 'MAINTENANCE':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="hover:bg-transparent"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  const renderBulkActions = () => (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={selectedProjects.length === 0}>
            Bulk Actions ({selectedProjects.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('PLANNED')}>
            Mark as Planned
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('IN_PROGRESS')}>
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('COMPLETED')}>
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('ON_HOLD')}>
            Mark as On Hold
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleBulkDelete}
            className="text-red-600"
          >
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.map((project) => (
          <Card key={project._id} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="absolute top-4 left-4">
                <Checkbox
                  checked={selectedProjects.includes(project._id)}
                  onCheckedChange={(checked) => handleSelectProject(project._id, checked as boolean)}
                />
              </div>
              <div className="flex justify-between items-start mb-4 pl-8">
                <Badge className={getProjectTypeColor(project.type_projet.nom_type_prj)}>
                  {project.type_projet.nom_type_prj}
                </Badge>
                <Badge className={getStatusColor(project.statut_projet.nom_statut_prj)}>
                  {project.statut_projet.nom_statut_prj}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {project.produ}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description_projet}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Revenue: ${project.objectif_ca?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{project.zone_cible.sous_Zone_cible || 'No zone specified'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(project.periode_date_debut), 'MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(project.periode_date_fin), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/projects/${project._id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteProjectId(project._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    if (isLoading) {
      return <TableSkeleton columnCount={8} />;
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedProjects.length === projects.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>{renderSortButton('type_projet', 'Type')}</TableHead>
              <TableHead>{renderSortButton('produit_cible', 'Product')}</TableHead>
              <TableHead>{renderSortButton('statut_projet', 'Status')}</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>{renderSortButton('periode_date_debut', 'Start Date')}</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Revenue Target</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow key={project._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProjects.includes(project._id)}
                    onCheckedChange={(checked) => handleSelectProject(project._id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <Badge className={getProjectTypeColor(project.type_projet.nom_type_prj)}>
                    {project.type_projet.nom_type_prj}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{project.nom_projet}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {project.description_projet}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(project.statut_projet.nom_statut_prj.nom_produit_cible)}>
                    {project.statut_projet.nom_statut_prj}
                  </Badge>
                </TableCell>
                <TableCell>{project.zone_cible.sous_Zone_cible || '-'}</TableCell>
                <TableCell>{format(new Date(project.periode_date_debut), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(project.periode_date_fin), 'MMM d, yyyy')}</TableCell>
                <TableCell>${project.objectif_ca?.toLocaleString() || '-'}</TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/dashboard/projects/${project._id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteProjectId(project._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex space-x-2">
          {renderBulkActions()}
          <div className="border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => router.push('/dashboard/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && deleteMutation.mutate(deleteProjectId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}