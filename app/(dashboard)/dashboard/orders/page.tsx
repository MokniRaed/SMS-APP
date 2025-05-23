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
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from '@/components/ui/textarea';
import { cancelOrder, confirmOrder, deleteOrder, deliverOrder, getOrders, validateOrder } from '@/lib/services/orders';
import { getUserFromLocalStorage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowUpDown, BookCopy, Check, ChevronLeft, ChevronRight, LayoutGrid, MoreVertical, Pencil, Plus, Table as TableIcon, Trash2, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'table';
type SortField = 'date_cmd' | 'id_client' | 'statut_cmd';
type SortOrder = 'asc' | 'desc';

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('date_cmd');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkCancelDialog, setShowBulkCancelDialog] = useState(false);
  const { user } = getUserFromLocalStorage() ?? {};
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '10');

  const userRole = user?.role ?? '';

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['orders', userRole, user?.id, page, limit],
    queryFn: () => getOrders(userRole === 'client' ? user.clientId : undefined, userRole === 'collaborateur' ? user.id : undefined, page.toString(), limit.toString())
  });
  console.log("user", user);

  const orders = categoryData?.data || [];
  const total = categoryData?.total;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    setPage(1);
  }, []);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => prev - 1);
  };


  const mutations = {
    delete: useMutation({
      mutationFn: deleteOrder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.success('Orders deleted successfully');
        setSelectedOrders([]);
      }
    }),
    validate: useMutation({
      mutationFn: validateOrder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.success('Orders validated successfully');
        setSelectedOrders([]);
      }
    }),
    confirm: useMutation({
      mutationFn: confirmOrder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.success('Orders confirmed successfully');
        setSelectedOrders([]);
      }
    }),
    deliver: useMutation({
      mutationFn: deliverOrder,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.success('Orders marked as delivered');
        setSelectedOrders([]);
      }
    }),
    cancel: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelOrder(id, reason),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.success('Orders cancelled successfully');
        setShowBulkCancelDialog(false);
        setCancelReason('');
        setSelectedOrders([]);
      }
    })
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order._id!));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleBulkAction = async (action: 'validate' | 'confirm' | 'deliver' | 'delete') => {
    try {
      await Promise.all(
        selectedOrders.map(orderId => mutations[action].mutateAsync(orderId))
      );
    } catch (error) {
      toast.error(`Failed to ${action} orders`);
    }
  };

  const handleBulkCancel = async () => {
    if (!cancelReason) return;

    try {
      await Promise.all(
        selectedOrders.map(orderId =>
          mutations.cancel.mutateAsync({ id: orderId, reason: cancelReason })
        )
      );
    } catch (error) {
      toast.error('Failed to cancel orders');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'date_cmd':
        comparison = new Date(a.date_cmd).getTime() - new Date(b.date_cmd).getTime();
        break;
      case 'id_client':
        comparison = (a.id_client?.nom_prenom_contact || '').localeCompare(b.id_client?.nom_prenom_contact || '');
        break;
      case 'statut_cmd':
        comparison = (a.statut_cmd?.description || '').localeCompare(b.statut_cmd?.description || '');
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'VALIDATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBulkActions = () => {
    if (selectedOrders.length === 0) return null;

    const selectedOrdersData = orders.filter(order => selectedOrders.includes(order._id!));
    const allSameStatus = selectedOrdersData.every(order => order.statut_cmd === selectedOrdersData[0].statut_cmd);
    const currentStatus = allSameStatus ? selectedOrdersData[0].statut_cmd : null;

    const hasActions =
      (userRole === 'RESPONSABLE' && currentStatus === 'VALIDATION') ||
      (['CLIENT', 'COLLABORATEUR'].includes(userRole) && currentStatus === 'VALIDATED') ||
      (userRole === 'RESPONSABLE' && currentStatus === 'CONFIRMED') ||
      (userRole === 'RESPONSABLE' && ['VALIDATED', 'CONFIRMED'].includes(currentStatus || '')) ||
      (userRole !== 'client');

    return selectedOrders.length > 0 && hasActions ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Bulk Actions ({selectedOrders.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {userRole === 'RESPONSABLE' && currentStatus === 'VALIDATION' && (
            <DropdownMenuItem onClick={() => handleBulkAction('validate')}>
              <Check className="mr-2 h-4 w-4" />
              Validate Selected
            </DropdownMenuItem>
          )}
          {['CLIENT', 'COLLABORATEUR'].includes(userRole) && currentStatus === 'VALIDATED' && (
            <DropdownMenuItem onClick={() => handleBulkAction('confirm')}>
              <Check className="mr-2 h-4 w-4" />
              Confirm Selected
            </DropdownMenuItem>
          )}
          {userRole === 'RESPONSABLE' && currentStatus === 'CONFIRMED' && (
            <DropdownMenuItem onClick={() => handleBulkAction('deliver')}>
              <Check className="mr-2 h-4 w-4" />
              Mark Selected as Delivered
            </DropdownMenuItem>
          )}
          {userRole === 'RESPONSABLE' && ['VALIDATED', 'CONFIRMED'].includes(currentStatus || '') && (
            <DropdownMenuItem onClick={() => setShowBulkCancelDialog(true)}>
              <X className="mr-2 h-4 w-4" />
              Cancel Selected
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {userRole !== 'client' && (
            <DropdownMenuItem
              onClick={() => handleBulkAction('delete')}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;
  };

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
                  checked={selectedOrders.length === orders.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date_cmd')}
                  className="hover:bg-transparent"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('id_client')}
                  className="hover:bg-transparent"
                >
                  Client
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Collaborator</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('statut_cmd')}
                  className="hover:bg-transparent"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No Orders found
                </TableCell>
              </TableRow>
            ) : (
              sortedOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order._id)}
                      onCheckedChange={(checked) => handleSelectOrder(order._id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>#{order?.id_order}</TableCell>
                  <TableCell>{format(new Date(order.date_cmd), 'PP')}</TableCell>
                  <TableCell>{order.id_client?.nom_prenom_contact}</TableCell>
                  <TableCell>
                    {order.date_livraison ? format(new Date(order.date_livraison), 'PP') : '-'}
                  </TableCell>
                  {/* <TableCell>{order.articles.length} items</TableCell> */}
                  <TableCell>-{order?.id_collaborateur?.username} </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.statut_cmd?.description)}>
                      {order?.statut_cmd?.description}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order._id}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order._id}/duplicate`)}>
                          <BookCopy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {userRole !== 'client' && (
                          <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setDeleteOrderId(order._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>

                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderCardView = () => {
    if (isLoading) {
      return <TableSkeleton columnCount={8} />;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedOrders.map((order) => (
          <Card
            key={order._id}
            className="relative overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order._id}</h3>
                  <p className="text-sm text-muted-foreground">Client: {order.id_client?.nom_prenom_contact}</p>
                </div>
                <Badge className={getStatusColor(order.statut_cmd?.description)}>
                  {order?.statut_cmd?.description}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status: {order?.statut_cmd?.description}</p>
                {order.id_collaborateur && (
                  <p className="text-sm text-muted-foreground">Collaborator: {order.id_collaborateur.username}</p>
                )}
                {order.date_livraison && (
                  <p className="text-sm text-muted-foreground">Delivery Date: {format(new Date(order.date_livraison), 'MMM dd, yyyy')}</p>
                )}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Date: {format(new Date(order.date_cmd), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
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
          <Button onClick={() => router.push('/dashboard/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? renderTableView() : (viewMode === 'grid' ? renderCardView() : null)}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrderId && mutations.delete.mutate(deleteOrderId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Cancel Dialog */}
      <AlertDialog
        open={showBulkCancelDialog}
        onOpenChange={(open) => {
          setShowBulkCancelDialog(open);
          if (!open) setCancelReason('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Selected Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling these orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkCancel}
              disabled={!cancelReason}
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-center justify-center space-x-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={page === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={totalPages === undefined || page === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
