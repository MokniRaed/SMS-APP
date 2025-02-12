'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/lib/services/tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

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

  const selectedDayTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // Get all days in the current month that have tasks
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Task Calendar</h1>
        <Button onClick={() => router.push('/dashboard/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
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

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {selectedDayTasks.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayTasks.map((task) => (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent 
                        className="p-4"
                        onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{task.title_tache}</h3>
                            <Badge className={getStatusColor(task.statut_tache)}>
                              {task.statut_tache}
                            </Badge>
                          </div>
                          {task.description_tache && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {task.description_tache}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {task.date_execution_tache && (
                              <p>Execution: {format(new Date(task.date_execution_tache), 'h:mm a')}</p>
                            )}
                            <p>Client: {task.id_client}</p>
                            <p>Collaborator: {task.id_collaborateur}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
    </div>
  );
}