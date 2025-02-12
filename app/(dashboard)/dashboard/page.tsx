'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getClientContacts } from '@/lib/services/clients';
import { getTasks } from '@/lib/services/tasks';
import { getOrders } from '@/lib/services/orders';
import { getProjects } from '@/lib/services/projects';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Activity,
  ShoppingCart,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CustomXAxis = ({ ...props }) => (
  <XAxis
    tickLine={false}
    axisLine={true}
    {...props}
  />
);

const CustomYAxis = ({ ...props }) => (
  <YAxis
    tickLine={false}
    axisLine={true}
    {...props}
  />
);

export default function DashboardPage() {
  const { data: contacts = [] } = useQuery({
    queryKey: ['clientContacts'],
    queryFn: getClientContacts
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  // Calculate key metrics
  const totalContacts = contacts.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeProjects = projects.filter(project => project.Statut_projet === 'IN_PROGRESS').length;
  const totalOrders = orders.length;
  const totalOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Calculate contact channel distribution
  const channelDistribution = contacts.reduce((acc: Record<string, number>, contact) => {
    const channel = contact.canal_interet || 'Not Specified';
    acc[channel] = (acc[channel] || 0) + 1;
    return acc;
  }, {});

  const channelData = Object.entries(channelDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // Task status distribution
  const taskStatusData = [
    { name: 'Created', value: tasks.filter(t => t.status === 'CREATED').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length },
    { name: 'Cancelled', value: tasks.filter(t => t.status === 'CANCELLED').length },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const stats = [
    {
      name: 'Total Contacts',
      value: totalContacts,
      icon: Users,
      change: '+12.30%',
      changeType: 'positive',
    },
    {
      name: 'Active Projects',
      value: activeProjects,
      icon: Briefcase,
      change: '+54.02%',
      changeType: 'positive',
    },
    {
      name: 'Task Completion',
      value: `${taskCompletionRate}%`,
      icon: Activity,
      change: `${completedTasks} of ${totalTasks}`,
      changeType: 'info',
    },
    {
      name: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      change: `$${totalOrderAmount.toFixed(2)}`,
      changeType: 'positive',
    },
  ];

  // Contact methods distribution
  const contactMethods = [
    {
      name: 'Phone',
      value: contacts.filter(c => c.numero_mobile || c.numero_fix).length,
      icon: Phone,
    },
    {
      name: 'Email',
      value: contacts.filter(c => c.adresse_email).length,
      icon: Mail,
    },
    {
      name: 'Social',
      value: contacts.filter(c => 
        c.compte_facebook || 
        c.compte_instagram || 
        c.compte_linkedin || 
        c.compte_whatsapp
      ).length,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-blue-600'
                  }>
                    {stat.change}
                  </span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact Methods Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contactMethods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <CustomXAxis dataKey="name" />
                  <CustomYAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contact Channel Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Channel Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>New Contacts</span>
                </div>
                <span className="font-medium">{contacts.length} total</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Tasks</span>
                </div>
                <span className="font-medium">{completedTasks} completed</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span>Orders</span>
                </div>
                <span className="font-medium">${totalOrderAmount.toFixed(2)} total</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Projects</span>
                </div>
                <span className="font-medium">{activeProjects} active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}