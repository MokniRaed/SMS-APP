'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskSchema, type Task, taskTypes, taskStatuses, collaborators, getTask } from '@/lib/services/tasks';
import { getClientContacts } from '@/lib/services/clients';
import { getProjects } from '@/lib/services/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ['task', params.id],
    queryFn: () => getTask(params.id)
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clientContacts'],
    queryFn: getClientContacts
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Task>({
    resolver: zodResolver(TaskSchema),
    values: task
  });

  const onSubmit = async (data: Task) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update task');

      toast.success('Task updated successfully');
      router.push('/dashboard/tasks');
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTask) return <div>Loading...</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...register('title_tache')} disabled={isSubmitting} />
              {errors.title_tache && <p className="text-sm text-red-500">{errors.title_tache.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <Select 
                  defaultValue={task.type_tache}
                  onValueChange={(value) => setValue('type_tache', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type_tache && <p className="text-sm text-red-500">{errors.type_tache.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select 
                  defaultValue={task.id_client}
                  onValueChange={(value) => setValue('id_client', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id_client}>
                        {client.nom_prenom_contact}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_client && <p className="text-sm text-red-500">{errors.id_client.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select 
                  defaultValue={task.id_projet}
                  onValueChange={(value) => setValue('id_projet', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.Id_projet} value={project.Id_projet}>
                        {project.Type_projet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_projet && <p className="text-sm text-red-500">{errors.id_projet.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collaborator</label>
                <Select 
                  defaultValue={task.id_collaborateur}
                  onValueChange={(value) => setValue('id_collaborateur', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collaborator" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborators.map((collab) => (
                      <SelectItem key={collab.id} value={collab.id}>
                        {collab.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_collaborateur && <p className="text-sm text-red-500">{errors.id_collaborateur.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Date</label>
                <Input type="date" {...register('date_tache')} disabled={isSubmitting} />
                {errors.date_tache && <p className="text-sm text-red-500">{errors.date_tache.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Execution Date</label>
                <Input type="date" {...register('date_execution_tache')} disabled={isSubmitting} />
                {errors.date_execution_tache && <p className="text-sm text-red-500">{errors.date_execution_tache.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea {...register('description_tache')} disabled={isSubmitting} />
              {errors.description_tache && <p className="text-sm text-red-500">{errors.description_tache.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input {...register('adresse_tache')} disabled={isSubmitting} />
              {errors.adresse_tache && <p className="text-sm text-red-500">{errors.adresse_tache.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Report</label>
              <Textarea {...register('compte_rendu_tache')} disabled={isSubmitting} />
              {errors.compte_rendu_tache && <p className="text-sm text-red-500">{errors.compte_rendu_tache.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                defaultValue={task.statut_tache}
                onValueChange={(value) => setValue('statut_tache', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.statut_tache && <p className="text-sm text-red-500">{errors.statut_tache.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea {...register('notes_tache')} disabled={isSubmitting} />
              {errors.notes_tache && <p className="text-sm text-red-500">{errors.notes_tache.message}</p>}
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}