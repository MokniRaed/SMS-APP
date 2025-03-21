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
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteTask, getTasks, Task, taskStatuses, taskTypes, updateTask } from '@/lib/services/tasks';
import { getUserFromLocalStorage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowUpDown, BookCopy, Eye, LayoutGrid, MoreVertical, Pencil, Plus, Table as TableIcon, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'table';
type SortField = 'title_tache' | 'type_tache' | 'date_tache' | 'statut_tache';
type SortOrder = 'asc' | 'desc';
const ITEMS_PER_PAGE = 5;

export default function TasksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('date_tache');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = getUserFromLocalStorage() ?? {};
  const userRole = user?.role ?? '';
  const roleId = userRole === 'collaborateur' ? { collaboratorId: user.id } : { adminId: user.id }

  const { data: tasksData = [], isLoading } = useQuery({
    queryKey: ['tasks', userRole, user?.id, currentPage],
    queryFn: () => getTasks({
      ...roleId, page: currentPage,
      limit: ITEMS_PER_PAGE,
    }),
  });



  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      return updateTask(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tasks updated successfully');
      setSelectedTasks([]);
    },
    onError: () => {
      toast.error('Failed to update tasks');
    }
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

  const getTaskTypeName = (typeId: string) => {
    return taskTypes.find(t => t.id === typeId)?.name || 'Unknown';
  };
  const tasks = tasksData?.data || [];
  const totalTasks = tasksData?.total || 0;
  const totalPages = Math.ceil(totalTasks / ITEMS_PER_PAGE);

  const sortedTasks = tasks ? [...tasks].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'title_tache':
        comparison = a?.title_tache?.localeCompare(b?.title_tache);
        break;
      case 'type_tache': {
        const typeA = (a.type_tache?.id || '').toString();
        const typeB = (b.type_tache?.id || '').toString();
        comparison = getTaskTypeName(typeA).localeCompare(getTaskTypeName(typeB));
        break;
      }
      case 'date_tache':
        comparison = new Date(a.date_tache).getTime() - new Date(b.date_tache).getTime();
        break;
      case 'statut_tache':
        comparison = (a.statut_tache?.nom_statut_tch || '').localeCompare(b.statut_tache?.nom_statut_tch || '');
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  }) : [];

  console.log("sortedTasks", sortedTasks)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      console.log("sorted", sortField)
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(task => task._id!));
    } else {
      setSelectedTasks([]);
    }
  };

  // In handleSelectTask
  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId =>
          updateMutation.mutateAsync({
            id: taskId,
            data: { statut_tache: status }
          })
        )
      );
    } catch (error) {
      toast.error('Failed to update tasks');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedTasks.map(taskId => deleteMutation.mutateAsync(taskId))
      );
      setSelectedTasks([]);
      toast.success('Tasks deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const getStatusColor = (statusId: string) => {
    const colors = {
      'SAISIE': 'bg-gray-100 text-gray-800',
      'AFFECTEE': 'bg-blue-100 text-blue-800',
      'ACCEPTEE': 'bg-yellow-100 text-yellow-800',
      'PLANIFIEE': 'bg-purple-100 text-purple-800',
      'REPORTEE': 'bg-orange-100 text-orange-800',
      'CLOTUREE': 'bg-green-100 text-green-800',
      'ANNULEE': 'bg-red-100 text-red-800'
    };
    return colors[statusId as keyof typeof colors] || colors['SAISIE'];
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
          <MoreVertical className="h-4 w-4 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/tasks/${task._id}`)}>
          <Eye className="h-4 w-4 mr-2 " />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/tasks/${task._id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2 " />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/tasks/${task._id}/duplicate`)}>
          <BookCopy className="h-4 w-4 mr-2 " />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDeleteTaskId(task._id)}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2 cursor-pointer" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderBulkActions = () => (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={selectedTasks.length === 0}>
            Bulk Actions ({selectedTasks.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('AFFECTEE')}>
            Mark as Assigned
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('ACCEPTEE')}>
            Mark as Accepted
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('PLANIFIEE')}>
            Mark as Planned
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('CLOTUREE')}>
            Mark as Completed
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
                  checked={selectedTasks.length === tasks.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
            {sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No Tasks found
                </TableCell>
              </TableRow>
            ) : (
              sortedTasks.map((task, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task?._id ?? '')}
                      onCheckedChange={(checked) => handleSelectTask(task?._id ?? '', checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.title_tache}</TableCell>
                  <TableCell>{task.type_tache?.nom_type_tch}</TableCell>
                  {/*<TableCell>{getTaskTypeName(task.type_tache)}</TableCell>*/}
                  <TableCell>{format(new Date(task.date_tache), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {task.date_execution_tache ?
                      format(new Date(task.date_execution_tache), 'MMM dd, yyyy') :
                      '-'
                    }
                  </TableCell>
                  <TableCell>{task?.id_client.id_client}-{task?.id_client.nom_prenom_contact}</TableCell>
               <TableCell>{  task?.id_collaborateur?.username ?  task?.id_collaborateur?.username :"-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.statut_tache)}`}>
                      {task.statut_tache.nom_statut_tch}
                      {/* {getTaskStatusName(task.statut_tache.nom_statut_tch)} */}
                    </span>
                  </TableCell>
                  <TableCell>{renderTableActions(task)}</TableCell>
                </TableRow>
              )))}
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
          <Button onClick={() => router.push('/dashboard/tasks/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedTasks.map((task) => (
            <Card
              key={task.id}
              className="relative overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="absolute top-4 left-4">
                  <Checkbox
                    checked={selectedTasks.includes(task._id)}
                    onCheckedChange={(checked) => handleSelectTask(task._id, checked as boolean)}
                  />
                </div>
                <div className="flex justify-between items-start mb-4 pl-8">
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

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tasks/${task.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tasks/${task.id}/duplicate`)}
                    >
                      <BookCopy className="h-4 w-4" />
                    </Button>


                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTaskId(task._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : renderTableView()}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <Button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

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
