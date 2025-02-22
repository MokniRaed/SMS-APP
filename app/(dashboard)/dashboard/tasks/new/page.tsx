'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getClientContacts } from '@/lib/services/clients';
import { getProjects } from '@/lib/services/projects';
import {
  createTask,
  getAllTaskStatus,
  getAllTaskTypes,
  TaskSchema,
  type Task
} from '@/lib/services/tasks';
import { getUsersByRole } from '@/lib/services/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function NewTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ['clientContacts'],
    queryFn: getClientContacts
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ['collaborators'],
    queryFn: () => getUsersByRole("679694ee22268f25bdfcba23")
  });
  const { data: taskTypes = [] } = useQuery({
    queryKey: ['taskTypes'],
    queryFn: getAllTaskTypes
  });

  const { data: taskStatus = [] } = useQuery({
    queryKey: ['taskStatus'],
    queryFn: getAllTaskStatus
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Task>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      date_tache: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: Task) => {
    setIsSubmitting(true);
    try {
      const response = await createTask(data)

      if (response) throw new Error(`Failed to create Task : ${response?.message}`);

      toast.success('Task created successfully');
      router.push('/dashboard/tasks');
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
          <CardTitle>Create New Task</CardTitle>
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
                <Select onValueChange={(value) => setValue('type_tache', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type, index) => (
                      <SelectItem key={index} value={type._id}>
                        {type.nom_type_tch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type_tache && <p className="text-sm text-red-500">{errors.type_tache.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select onValueChange={(value) => setValue('id_client', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client, index) => (
                      <SelectItem key={index} value={client._id}>
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
                <Select onValueChange={(value) => setValue('id_projet', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project, index) => (
                      <SelectItem key={index} value={project._id}>
                        {project.nom_projet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_projet && <p className="text-sm text-red-500">{errors.id_projet.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collaborator</label>
                <Select onValueChange={(value) => setValue('id_collaborateur', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collaborator" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborators.map((collab, index) => (
                      <SelectItem key={index} value={collab._id}>
                        {collab.username}
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
              <label className="text-sm font-medium">Status</label>
              <Select onValueChange={(value) => setValue('statut_tache', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatus.map((status, index) => (
                    <SelectItem key={index} value={status._id}>
                      {status.nom_statut_tch}
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
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}