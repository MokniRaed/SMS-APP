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
import { useEffect, useState } from "react";
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

  const { data: allTaskStatus = [] } = useQuery({
    queryKey: ['allTaskStatus'],
    queryFn: getAllTaskStatus
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<Task>({
    resolver: zodResolver(TaskSchema),
  });

  const selectedCollaborator = watch("id_collaborateur");
  const dateExecutionTache = watch("date_execution_tache");
  const currentStatus = watch("statut_tache");

  // Initialize form values when task data is loaded
  useEffect(() => {
    if (task) {
      setValue("title_tache", task.title_tache);
      setValue("type_tache", task.type_tache._id);
      setValue("id_client", task.id_client._id);
      setValue("id_projet", task.id_projet._id);
      setValue("id_collaborateur", task.id_collaborateur?._id);
      setValue("statut_tache", task.statut_tache._id);
      setValue("date_tache", task.date_tache ? task.date_tache.split("T")[0] : "");
      setValue("date_execution_tache", task.date_execution_tache ? task.date_execution_tache.split("T")[0] : "");
      setValue("description_tache", task.description_tache);
      setValue("adresse_tache", task.adresse_tache);
      setValue("compte_rendu_tache", task.compte_rendu_tache);
      setValue("notes_tache", task.notes_tache);
    }
  }, [task, setValue]);

  // Find current status object
  const currentStatusObject = allTaskStatus.find(
    status => status._id === currentStatus
  );

  // Get allowed next statuses based on role and current status
  const getAllowedStatusTransitions = () => {
    if (!currentStatusObject || !allTaskStatus.length) return [];

    const currentStatusName = currentStatusObject.nom_statut_tch;

    if (userRole === "admin") {
      // Admin can change to any status
      if (currentStatusName === "SAISIE") {
        // Can move to AFFECTED if collaborator is selected
        return allTaskStatus.filter(s =>
          s.nom_statut_tch === "SAISIE" ||
          (s.nom_statut_tch === "AFFECTED" && selectedCollaborator)
        );
      } else if (currentStatusName === "AFFECTED") {
        // Can move to PLANIFIED if execution date is set
        return allTaskStatus.filter(s =>
          s.nom_statut_tch === "AFFECTED" ||
          (s.nom_statut_tch === "PLANIFIED" && dateExecutionTache)
        );
      } else {
        // Admin can change to any status from other states
        return allTaskStatus;
      }
    } else if (userRole === "collaborateur") {
      // Collaborator has limited transitions
      if (currentStatusName === "AFFECTED") {
        // Can only accept task or keep as is
        return allTaskStatus.filter(s =>
          s.nom_statut_tch === "AFFECTED" ||
          s.nom_statut_tch === "ACCEPTED"
        );
      } else if (currentStatusName === "PLANIFIED") {
        // Can report, close or cancel
        return allTaskStatus.filter(s =>
          s.nom_statut_tch === "PLANIFIED" ||
          s.nom_statut_tch === "REPORTED" ||
          s.nom_statut_tch === "CLOSED" ||
          s.nom_statut_tch === "CANCELED"
        );
      } else {
        // For other statuses, no change allowed or only current status
        return allTaskStatus.filter(s => s._id === currentStatus);
      }
    }

    return [];
  };

  const allowedStatusTransitions = getAllowedStatusTransitions();

  // Automatically update status when certain fields change
  useEffect(() => {
    if (!allTaskStatus.length) return;

    if (userRole === "admin") {
      // Handle automatic status transitions for admin
      const currentStatusName = currentStatusObject?.nom_statut_tch;

      if (currentStatusName === "SAISIE" && selectedCollaborator) {
        // Auto change to AFFECTED when admin selects collaborator
        const affectedStatus = allTaskStatus.find(s => s.nom_statut_tch === "AFFECTED");
        if (affectedStatus) setValue("statut_tache", affectedStatus._id);
      } else if (currentStatusName === "AFFECTED" && dateExecutionTache) {
        // Auto change to PLANIFIED when admin sets execution date
        const planifiedStatus = allTaskStatus.find(s => s.nom_statut_tch === "PLANIFIED");
        if (planifiedStatus) setValue("statut_tache", planifiedStatus._id);
      }
    }
  }, [selectedCollaborator, dateExecutionTache, allTaskStatus, currentStatusObject, setValue, userRole]);

  const onSubmit = async (data: Task) => {
    setIsSubmitting(true);

    // Validate that collaborator is set if execution date is provided
    if (data.date_execution_tache && !data.id_collaborateur) {
      toast.error("Please select a collaborator before setting an execution date.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await updateTask(params.id, data);

      if (response && response.message)
        throw new Error(`Failed to update Task: ${response.message}`);

      toast.success("Task updated successfully");
      router.push("/dashboard/tasks");
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(`Failed to update Task: ${error?.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTask) return <div>Loading...</div>;
  if (!task) return <div>Task not found</div>;

  // Function to get status name
  const getStatusName = (statusId: string) => {
    const status = allTaskStatus.find(s => s._id === statusId);
    return status?.nom_statut_tch || "";
  };

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
                  value={watch("type_tache")}
                  onValueChange={(value) => setValue("type_tache", value)}
                  disabled={isSubmitting}
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
                  value={watch("id_client")}
                  onValueChange={(value) => setValue("id_client", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.data?.map((client) => (
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
                  value={watch("id_projet")}
                  onValueChange={(value) => setValue("id_projet", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.data?.map((project) => (
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
                      value={watch("id_collaborateur") || ""}
                      onValueChange={(value) => setValue("id_collaborateur", value)}
                      disabled={isSubmitting || getStatusName(currentStatus) === "CLOSED" || getStatusName(currentStatus) === "CANCELED"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collaborator" />
                      </SelectTrigger>
                      <SelectContent>
                        {collaborators.map((collab) => (
                          <SelectItem key={collab._id} value={collab._id}>
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
                  disabled={
                    isSubmitting ||
                    !selectedCollaborator ||
                    getStatusName(currentStatus) === "CLOSED" ||
                    getStatusName(currentStatus) === "CANCELED"
                  }
                />
                {!selectedCollaborator && (
                  <p className="text-xs text-amber-600">
                    Please select a collaborator first
                  </p>
                )}
                {errors.date_execution_tache && (
                  <p className="text-sm text-red-500">
                    {errors.date_execution_tache.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              {allowedStatusTransitions.length > 1 ? (
                <Select
                  value={watch("statut_tache") || ""}
                  onValueChange={(value) => setValue("statut_tache", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatusTransitions.map((status) => (
                      <SelectItem key={status._id} value={status._id}>
                        <div className="flex items-center">
                          <span
                            className={`inline-block h-2 w-2 rounded-full mr-2 ${statusColors[status.nom_statut_tch] || "bg-gray-400"
                              }`}
                          ></span>
                          {status.description_statut_tch}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center p-2 border rounded">
                  <span
                    className={`inline-block h-2 w-2 rounded-full mr-2 ${statusColors[currentStatusObject?.nom_statut_tch || ""] || "bg-gray-400"
                      }`}
                  ></span>
                  <span>{currentStatusObject?.description_statut_tch}</span>
                </div>
              )}
              {errors.statut_tache && (
                <p className="text-sm text-red-500">
                  {errors.statut_tache.message}
                </p>
              )}
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
                disabled={
                  isSubmitting ||
                  !["PLANIFIED", "REPORTED", "CLOSED"].includes(getStatusName(currentStatus))
                }
              />
              {errors.compte_rendu_tache && (
                <p className="text-sm text-red-500">
                  {errors.compte_rendu_tache.message}
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
                type="button"
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