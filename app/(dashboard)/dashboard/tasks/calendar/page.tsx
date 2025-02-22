'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTasks, Task, taskStatuses } from '@/lib/services/tasks';
import { useQuery } from '@tanstack/react-query';
import { eachDayOfInterval, endOfMonth, format, isSameDay, isWithinInterval, startOfMonth } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Plus, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TaskCalendarPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date_tache);
      return isSameDay(taskDate, date);
    });
  };

  const getTasksForMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return tasks.filter(task => {
      const taskDate = new Date(task.date_tache);
      return isWithinInterval(taskDate, { start, end });
    });
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

  const getStatusName = (statusId: string) => {
    return taskStatuses.find(s => s.id === statusId)?.name || statusId;
  };

  const daysWithTasks = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  }).reduce<Record<string, number>>((acc, day) => {
    const tasksOnDay = getTasksForDate(day);
    if (tasksOnDay.length > 0) {
      acc[format(day, 'yyyy-MM-dd')] = tasksOnDay.length;
    }
    return acc;
  }, {});

  const selectedDayTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const monthlyTasks = getTasksForMonth(date);

  const renderTaskCard = (task: Task) => (
    <Card
      key={task._id}
      className="cursor-pointer hover:shadow-md transition-shadow mb-4"
      onClick={() => router.push(`/dashboard/tasks/${task._id}`)}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{task.title_tache}</h3>
            <Badge className={getStatusColor(task.statut_tache)}>
              {task.statut_tache.nom_statut_tch}
            </Badge>
          </div>
          {task.description_tache && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description_tache}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(task.date_tache), 'PPp')}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.id_collaborateur.username}
            </div>
          </div>
          {task.adresse_tache && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {task.adresse_tache}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Task Calendar</h1>
        <Button onClick={() => router.push('/dashboard/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-[2fr,1fr] gap-6">
        {/* Left Column - Calendar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(date, 'MMMM yyyy')}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={date}
                onMonthChange={setDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => {
                    const key = format(date, 'yyyy-MM-dd');
                    const taskCount = daysWithTasks[key];
                    return (
                      <div className="relative w-full h-full">
                        <div>{date.getDate()}</div>
                        {taskCount && (
                          <div className="absolute bottom-0 right-0">
                            <Badge variant="secondary" className="text-xs">
                              {taskCount}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Day Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {selectedDayTasks.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayTasks.map(renderTaskCard)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>No tasks for this date</p>
                    <Button
                      variant="link"
                      onClick={() => router.push('/dashboard/tasks/new')}
                    >
                      Create a task
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - All Tasks */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Tasks</TabsTrigger>

                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>

              <TabsContent value="month" className="mt-0">
                <ScrollArea className="h-[700px]">
                  {monthlyTasks.length > 0 ? (
                    <div className="space-y-4 pr-4">
                      {monthlyTasks.map(renderTaskCard)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <p>No tasks this month</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-[700px]">
                  {tasks.length > 0 ? (
                    <div className="space-y-4 pr-4">
                      {tasks.map(renderTaskCard)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <p>No tasks found</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}