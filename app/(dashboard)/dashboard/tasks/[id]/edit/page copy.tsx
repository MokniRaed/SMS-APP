"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getClientContacts } from "@/lib/services/clients";
import { getProjects } from "@/lib/services/projects";
import {
  getAllTaskStatus,
  getAllTaskTypes,
  getTask,
  getTaskStatusByName,
  TaskSchema,
  updateTask,
  type Task
} from "@/lib/services/tasks";
import { getUsersByRole } from "@/lib/services/users";
import { getUserFromLocalStorage, statusColors } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";



export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = getUserFromLocalStorage() ?? {};
  const userRole = user?.role ?? "";

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ["task", params.id],
    queryFn: () => getTask(params.id),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clientContacts"],
    queryFn: getClientContacts,
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ["collaborators"],
    queryFn: () => getUsersByRole("679694ee22268f25bdfcba23"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: taskTypes = [] } = useQuery({
    queryKey: ["taskTypes"],
    queryFn: getAllTaskTypes,
  });

  // const { data: taskStatus = [] } = useQuery({
  //   queryKey: ['taskStatus'],
  //   queryFn: getAllTaskStatus
  // });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Task>({
    resolver: zodResolver(TaskSchema),
    values: {
      ...task,
      type_tache: task?.type_tache._id,
      id_client: task?.id_client._id,
      id_projet: task?.id_projet._id,
      id_collaborateur: task?.id_collaborateur?._id,
      statut_tache: task?.statut_tache._id,
      date_tache: task?.date_tache ? task.date_tache.split("T")[0] : "", // Ensure format YYYY-MM-DD
      date_execution_tache: task?.date_execution_tache
        ? task.date_execution_tache.split("T")[0]
        : "", // Ensure format YYYY-MM-DD
    },
  });

  const selectedCollaborator = watch("id_collaborateur");
  const dateExecutionTache = watch("date_execution_tache");

  console.log("watch", watch("statut_tache"));

  const { data: taskStatus } = useQuery({
    queryKey: ["taskStatus", selectedCollaborator, dateExecutionTache],
    queryFn: ({ queryKey }) => {
      const [, selectedCollaborator, dateExecutionTache] = queryKey;
      let statusName = "SAISIE";
      if ((dateExecutionTache && selectedCollaborator) || (dateExecutionTache && userRole) === "admin") {
        statusName = "PLANIFIED";
      } else if (selectedCollaborator) {
        statusName = "AFFECTED";
      }
      return getTaskStatusByName(statusName);
    },
  });

  const { data: allTaskStatus = [] } = useQuery({
    queryKey: ['allTaskStatus'],
    queryFn: getAllTaskStatus
  });


  const onSubmit = async (data: Task) => {
    setIsSubmitting(true);

    if (data.date_execution_tache && !data.id_collaborateur) {
      toast.error("Please select a collaborator before setting an execution date.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await updateTask(params.id, {
        ...data,
        // statut_tache: taskStatus?._id,
      });

      if (response)
        throw new Error(`Failed to update Task : ${response?.message}`);

      toast.success("Task updated successfully");
      router.push("/dashboard/tasks");
    } catch (error: any) {
      console.log("err", error);
      toast.error(` Failed to update Task :${error?.message || error}`);
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
          <div className="flex justify-between items-center">
            <CardTitle>Edit Task</CardTitle>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...register("title_tache")} disabled={isSubmitting} />
              {errors.title_tache && (
                <p className="text-sm text-red-500">
                  {errors.title_tache.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <Select
                  defaultValue={task.type_tache._id}
                  onValueChange={(value) => setValue("type_tache", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.nom_type_tch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type_tache && (
                  <p className="text-sm text-red-500">
                    {errors.type_tache.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select
                  defaultValue={task.id_client._id}
                  onValueChange={(value) => setValue("id_client", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.nom_prenom_contact}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_client && (
                  <p className="text-sm text-red-500">
                    {errors.id_client.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select
                  defaultValue={task.id_projet._id}
                  onValueChange={(value) => setValue("id_projet", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.nom_projet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_projet && (
                  <p className="text-sm text-red-500">
                    {errors.id_projet.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collaborator</label>

                {userRole === "collaborateur" ? (
                  <>
                    <p className="text-sm">{user?.username} (me)</p>
                    <Input
                      type="hidden"
                      {...register("id_collaborateur")}
                      defaultValue={user?.id}
                    />
                  </>
                ) : (
                  <>
                    <Select
                      onValueChange={(value) =>
                        setValue("id_collaborateur", value)
                      }
                    >
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
                  </>
                )}

                {errors.id_collaborateur && (
                  <p className="text-sm text-red-500">
                    {errors.id_collaborateur.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Date</label>
                <Input
                  type="date"
                  {...register("date_tache")}
                  disabled={isSubmitting}
                />
                {errors.date_tache && (
                  <p className="text-sm text-red-500">
                    {errors.date_tache.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Execution Date</label>
                <Input
                  type="date"
                  {...register("date_execution_tache")}
                  disabled={isSubmitting}
                />
                {errors.date_execution_tache && (
                  <p className="text-sm text-red-500">
                    {errors.date_execution_tache.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register("description_tache")}
                disabled={isSubmitting}
              />
              {errors.description_tache && (
                <p className="text-sm text-red-500">
                  {errors.description_tache.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input {...register("adresse_tache")} disabled={isSubmitting} />
              {errors.adresse_tache && (
                <p className="text-sm text-red-500">
                  {errors.adresse_tache.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Report</label>
              <Textarea
                {...register("compte_rendu_tache")}
                disabled={isSubmitting}
              />
              {errors.compte_rendu_tache && (
                <p className="text-sm text-red-500">
                  {errors.compte_rendu_tache.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              {userRole === "collaborateur" && taskStatus?.nom_statut_tch === "PLANIFIED" ? (
                <Select
                  defaultValue={task.statut_tache._id}

                  onValueChange={(value) => setValue("statut_tache", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTaskStatus
                      .filter(
                        (status) =>
                          status.nom_statut_tch === "PLANIFIED" ||
                          status.nom_statut_tch === "REPORTED" ||
                          status.nom_statut_tch === "CLOSED" ||
                          status.nom_statut_tch === "CANCELED"
                      )
                      .map((status) => (
                        <SelectItem key={status._id} value={status._id}>
                          {status.description_statut_tch}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {taskStatus?.nom_statut_tch && (
                    <span
                      className={`inline-block h-2 w-2 rounded-full mr-1 ${statusColors[taskStatus?.nom_statut_tch] ||
                        "bg-gray-400"
                        }`}
                    ></span>
                  )}
                  {taskStatus?.description_statut_tch}
                </p>
              )}
              {errors.statut_tache && (
                <p className="text-sm text-red-500">
                  {errors.statut_tache.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea {...register("notes_tache")} disabled={isSubmitting} />
              {errors.notes_tache && (
                <p className="text-sm text-red-500">
                  {errors.notes_tache.message}
                </p>
              )}
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
                    Updating...
                  </>
                ) : (
                  "Update Task"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
