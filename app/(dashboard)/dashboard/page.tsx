'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientContacts } from '@/lib/services/clients';
import { getOrders } from '@/lib/services/orders';
import { getProjects } from '@/lib/services/projects';
import { getTasks, taskStatuses } from '@/lib/services/tasks';
import { getUserFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Briefcase,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  ShoppingCart,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
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
  const { data: contactsData = [] } = useQuery({
    queryKey: ['clientContacts'],
    queryFn: getClientContacts
  });

  const contacts = contactsData?.data || [];

  const { user } = getUserFromLocalStorage() ?? {};
  const userRole = user?.role ?? '';
  const roleId = userRole === 'collaborateur' ? { collaboratorId: user.id } : { adminId: user.id }

  const { data: tasksData = [], isLoading } = useQuery({
    queryKey: ['tasks', userRole, user?.id],
    queryFn: () => getTasks({ ...roleId }),
  });

  const tasks = tasksData?.data || [];

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', userRole, user?.id],
    queryFn: () => getOrders(userRole === 'client' ? user.clientId : undefined, userRole === 'collaborateur' ? user.id : undefined)
  });

  const { data: projectsData = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  const projects = projectsData?.data || [];


  // Calculate key metrics
  const totalContacts = contacts.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.statut_tache?.nom_statut_tch === 'CLOSED').length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeProjects = projects.filter(project => project.statut_projet?.nom_statut_prj === 'PENDING').length;
  const totalOrders = orders?.data?.length;
  // const totalOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);


  console.log("contacts", contacts);

  // Calculate contact channel distribution
  const channelDistribution = contacts?.reduce((acc: Record<string, number>, contact) => {
    const channel = contact.canal_interet || 'Not Specified';
    acc[channel] = (acc[channel] || 0) + 1;
    return acc;
  }, {});

  const channelData = Object?.entries(channelDistribution ?? {}).map(([name, value]) => ({
    name,
    value
  }));

  // Task status distribution with proper mapping to status names
  const taskStatusData = taskStatuses.map(status => ({
    name: status.name,
    value: tasks.filter(t => t.statut_tache?.nom_statut_tch === status.id).length
  })).filter(item => item.value > 0); // Only include statuses that have tasks

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(15 90% 65%)',
    'hsl(142 72% 29%)',
  ];

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
      // change: `$${totalOrderAmount.toFixed(2)}`,
      changeType: 'positive',
    },
  ];

  // Contact methods distribution
  const contactMethods = [
    {
      name: 'Phone',
      value: contacts?.filter(c => c.numero_mobile || c.numero_fix).length,
      icon: Phone,
    },
    {
      name: 'Email',
      value: contacts?.filter(c => c.adresse_email).length,
      icon: Mail,
    },
    {
      name: 'Social',
      value: contacts?.filter(c =>
        c.compte_facebook ||
        c.compte_instagram ||
        c.compte_linkedin ||
        c.compte_whatsapp
      ).length,
      icon: MessageSquare,
    },
  ];
  console.log("taskStatusData", taskStatusData);


  const CustomPieChartLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    ) : null;
  };

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
                    paddingAngle={2}
                    dataKey="value"
                    label={CustomPieChartLabel}
                    labelLine={false}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      return `${value} (${payload.value})`;
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value} tasks`, name]}
                  />
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
                    dataKey="value"
                    label={CustomPieChartLabel}
                    labelLine={false}
                  >
                    {channelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      return `${value} (${payload.value})`;
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value} contacts`, name]}
                  />
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
                <span className="font-medium">{totalOrders} total</span>
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
