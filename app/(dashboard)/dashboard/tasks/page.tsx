'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, deleteTask, taskTypes, taskStatuses } from '@/lib/services/tasks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, LayoutGrid, Table as TableIcon, ArrowUpDown, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { CardSkeleton } from '@/components/ui/skeletons/card-skeleton';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';

type ViewMode = 'grid' | 'table';
type SortField = 'title_tache' | 'type_tache' | 'date_tache' | 'statut_tache';
type SortOrder = 'asc' | 'desc';

export default function TasksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('date_tache');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'title_tache':
        comparison = a.title_tache.localeCompare(b.title_tache);
        break;
      case 'type_tache':
        comparison = a.type_tache.localeCompare(b.type_tache);
        break;
      case 'date_tache':
        comparison = new Date(a.date_tache).getTime() - new Date(b.date_tache).getTime();
        break;
      case 'statut_tache':
        comparison = a.statut_tache.localeCompare(b.statut_tache);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
      setDeleteTaskId(null);
    },
    onError: () => {
      toast.error('Failed to delete task');
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

  const getStatusColor = (statusId: string) => {
    const colors = {
      '1': 'bg-gray-100 text-gray-800',
      '2': 'bg-blue-100 text-blue-800',
      '3': 'bg-yellow-100 text-yellow-800',
      '4': 'bg-green-100 text-green-800',
      '5': 'bg-red-100 text-red-800'
    };
    return colors[statusId as keyof typeof colors] || colors['1'];
  };

  const getTaskTypeName = (typeId: string) => {
    return taskTypes.find(t => t.id === typeId)?.name || 'Unknown';
  };

  const getTaskStatusName = (statusId: string) => {
    return taskStatuses.find(s => s.id === statusId)?.name || 'Unknown';
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

  const renderTableActions = (task: Task) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/tasks/${task.id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setDeleteTaskId(task.id)}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedTasks.map((task) => (
          <Card 
            key={task.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{task.title_tache}</h3>
                  <p className="text-sm text-muted-foreground">{getTaskTypeName(task.type_tache)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.statut_tache)}`}>
                  {getTaskStatusName(task.statut_tache)}
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description_tache}
                </p>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Date: {format(new Date(task.date_tache), 'MMM dd, yyyy')}</span>
                  {task.date_execution_tache && (
                    <span>Execution: {format(new Date(task.date_execution_tache), 'MMM dd, yyyy')}</span>
                  )}
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
      return <TableSkeleton columnCount={7} />;
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{renderSortButton('title_tache', 'Title')}</TableHead>
              <TableHead>{renderSortButton('type_tache', 'Type')}</TableHead>
              <TableHead>{renderSortButton('date_tache', 'Date')}</TableHead>
              <TableHead>Execution Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Collaborator</TableHead>
              <TableHead>{renderSortButton('statut_tache', 'Status')}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title_tache}</TableCell>
                <TableCell>{getTaskTypeName(task.type_tache)}</TableCell>
                <TableCell>{format(new Date(task.date_tache), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {task.date_execution_tache ? 
                    format(new Date(task.date_execution_tache), 'MMM dd, yyyy') : 
                    '-'
                  }
                </TableCell>
                <TableCell>{task.id_client}</TableCell>
                <TableCell>{task.id_collaborateur}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.statut_tache)}`}>
                    {getTaskStatusName(task.statut_tache)}
                  </span>
                </TableCell>
                <TableCell>{renderTableActions(task)}</TableCell>
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
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex space-x-2">
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
          <Button onClick={() => router.push('/dashboard/tasks/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTaskId && deleteMutation.mutate(deleteTaskId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}