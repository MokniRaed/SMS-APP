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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getClientContacts } from '@/lib/services/clients';
import { getProjects } from '@/lib/services/projects';
import { acceptTask, cancelTask, completeTask, getTask, planTask, reportTask, taskStatuses, taskTypes } from '@/lib/services/tasks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Briefcase, CalendarDays, Check, FileText, MapPin, Pencil, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const TASK_PHASES = [
  { status: 'SAISIE', label: 'Saisie' },
  { status: 'AFFECTEE', label: 'Afféctée' },
  { status: 'ACCEPTEE', label: 'Accéptée' },
  { status: 'PLANIFIEE', label: 'Planifiée' },
  { status: 'REPORTEE', label: 'Reportée' },
  { status: 'CLOTUREE', label: 'Clôturée' }
];

export default function TaskDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [completionReport, setCompletionReport] = useState('');
  const [taskReport, setTaskReport] = useState('');
  const [plannedDates, setPlannedDates] = useState({
    date: '',
    address: ''
  });

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

  const updateMutation = useMutation({
    mutationFn: (variables: { action: string; data?: any }) => {
      switch (variables.action) {
        case 'accept':
          return acceptTask(params.id);
        case 'plan':
          return planTask(params.id, {
            date_execution_tache: variables.data.date,
            adresse_tache: variables.data.address
          });
        case 'report':
          return reportTask(params.id, { content: variables.data });
        case 'complete':
          return completeTask(params.id, { content: variables.data });
        case 'cancel':
          return cancelTask(params.id, variables.data);
        default:
          throw new Error('Invalid action');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', params.id] });
      toast.success('Task updated successfully');
      setShowCancelDialog(false);
      setShowCompleteDialog(false);
      setShowPlanDialog(false);
      setShowReportDialog(false);
    },
    onError: () => {
      toast.error('Failed to update task');
    }
  });

  if (isLoadingTask) return <div>Loading...</div>;
  if (!task) return <div>Task not found</div>;

  const getTaskTypeName = (typeId: string) => {
    return taskTypes.find(t => t.id === typeId)?.name || 'Unknown';
  };

  const getTaskStatusName = (statusId: string) => {
    return taskStatuses.find(s => s.id === statusId)?.name || 'Unknown';
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

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id_client === clientId)?.nom_prenom_contact || 'Unknown Client';
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.Id_projet === projectId)?.Type_projet || 'Unknown Project';
  };

  const renderStepper = () => {
    const currentPhaseIndex = TASK_PHASES.findIndex(phase => phase.status === task.statut_tache);
    const isTaskCancelled = task.statut_tache === 'ANNULEE';

    return (
      <div className="w-full py-4">
        <div className="flex justify-between">
          {TASK_PHASES.map((phase, index) => {
            const isActive = !isTaskCancelled && index <= currentPhaseIndex;
            const isCurrent = phase.status === task.statut_tache;

            return (
              <div key={phase.status} className="flex flex-col items-center flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  ${isCurrent ? 'ring-2 ring-offset-2 ring-primary' : ''}
                  ${isTaskCancelled ? 'opacity-50' : ''}
                `}>
                  {isActive ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="mt-2 text-xs font-medium text-center">
                  {phase.label}
                </div>
                {index < TASK_PHASES.length - 1 && (
                  <div className={`
                    h-0.5 w-full mt-4
                    ${index < currentPhaseIndex && !isTaskCancelled ? 'bg-primary' : 'bg-muted'}
                    ${isTaskCancelled ? 'opacity-50' : ''}
                  `} />
                )}
              </div>
            );
          })}
        </div>
        {isTaskCancelled && (
          <div className="mt-4 text-center">
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('ANNULEE')}`}>
              Task Cancelled
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => router.push(`/dashboard/tasks/${params.id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Task
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {renderStepper()}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{task.title_tache}</h3>
              <span className={`mt-2 inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(task.statut_tache)}`}>
                {task.statut_tache.nom_statut_tch}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>Created: {format(new Date(task.date_tache), 'PPP')}</span>
              </div>
              {task.date_execution_tache && (
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>Execution: {format(new Date(task.date_execution_tache), 'PPP')}</span>
                </div>
              )}
            </div>

            {task.description_tache && (
              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-muted-foreground">{task.description_tache}</p>
              </div>
            )}

            {task.adresse_tache && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1" />
                <p className="text-muted-foreground">{task.adresse_tache}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {task.statut_tache === 'AFFECTEE' && (
                <Button onClick={() => updateMutation.mutate({ action: 'accept' })}>
                  Accept Task
                </Button>
              )}

              {task.statut_tache === 'ACCEPTEE' && (
                <Button onClick={() => setShowPlanDialog(true)}>
                  Plan Task
                </Button>
              )}

              {task.statut_tache === 'PLANIFIEE' && (
                <Button onClick={() => setShowReportDialog(true)}>
                  Submit Report
                </Button>
              )}

              {task.statut_tache === 'REPORTEE' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Task
                  </Button>
                  <Button onClick={() => setShowCompleteDialog(true)}>
                    Complete Task
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <div>
                  <p className="text-sm font-medium">Client</p>
                  {/* <p className="text-sm text-muted-foreground">{getClientName(task.id_client)}</p> */}
                  <p className="text-sm text-muted-foreground">{task.id_client.nom_prenom_contact}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                <div>
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-sm text-muted-foreground">{task.id_projet.nom_projet}</p>
                  {/* <p className="text-sm text-muted-foreground">{getProjectName(task.id_projet)}</p> */}
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <div>
                  <p className="text-sm font-medium">Collaborator</p>
                  <p className="text-sm text-muted-foreground">{task.id_collaborateur.username}</p>
                  {/* <p className="text-sm text-muted-foreground">{getCollaboratorName(task.id_collaborateur)}</p> */}
                </div>
              </div>
            </div>

            {task.compte_rendu_tache && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <h4 className="font-medium">Task Report</h4>
                </div>
                <p className="text-muted-foreground">{task.compte_rendu_tache}</p>
              </div>
            )}

            {task.notes_tache && (
              <div className="space-y-2">
                <h4 className="font-medium">Notes</h4>
                <p className="text-muted-foreground">{task.notes_tache}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Dialog */}
      <AlertDialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan Task</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide the execution date and address for this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Execution Date</label>
              <Input
                type="date"
                value={plannedDates.date}
                onChange={(e) => setPlannedDates(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={plannedDates.address}
                onChange={(e) => setPlannedDates(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter task location..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateMutation.mutate({
                action: 'plan',
                data: plannedDates
              })}
            >
              Plan Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Task Report</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a report for this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter task report..."
              value={taskReport}
              onChange={(e) => setTaskReport(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateMutation.mutate({
                action: 'report',
                data: taskReport
              })}
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a completion report for this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter completion report..."
              value={completionReport}
              onChange={(e) => setCompletionReport(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateMutation.mutate({
                action: 'complete',
                data: completionReport
              })}
            >
              Complete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Task</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateMutation.mutate({
                action: 'cancel',
                data: cancelReason
              })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}