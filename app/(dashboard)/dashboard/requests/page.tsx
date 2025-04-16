'use client';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowUpDown, Calendar, ChevronLeft, ChevronRight, Eye, LayoutGrid, MapPin, MoreVertical, Pencil, Plus, Table as TableIcon, Target, Trash2, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRequests } from '../../../../lib/services/requests';
import { Request } from '../../../../lib/types/request';

type ViewMode = 'grid' | 'table';
type SortField = 'type_requete' | 'cible_requete' | 'statut_requete' | 'date_requete';
type SortOrder = 'asc' | 'desc';

const requestTypeMap = {
    "Commercial": "Commercial",
    "Technique": "Technique",
    "Recouvrement": "Recouvrement",
    "Logistique": "Logistique",
    "ADV": "ADV",
    "Direction G.": "Direction G."
};

const targetServiceMap = {
    "Reclamation": "Reclamation",
    "Notification": "Notification",
    "Demande": "Demande",
    "Suggestion": "Suggestion"
};

export default function RequestsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [sortField, setSortField] = useState<SortField>('date_requete');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

    const [page, setPage] = useState(1);
    const searchParams = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');

    // const { data: categoryData, isLoading } = useQuery({
    //   queryKey: ['requests', page, limit],
    //   queryFn: () => getRequests(page.toString(), limit.toString())
    // });

    const [requests, setRequests] = useState<Request[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchRequests = async () => {
            const fetchedRequests = await getRequests();
            setRequests(fetchedRequests);
            setTotal(fetchedRequests.length);
            setTotalPages(Math.ceil(fetchedRequests.length / limit));
        };

        fetchRequests();
        setPage(1);
    }, [limit]);

    const handleNextPage = () => {
        setPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        setPage((prev) => prev - 1);
    };

    // const updateMutation = useMutation({
    //   mutationFn: async ({ id, data }: { id: string; data: Partial<Request> }) => {
    //     return updateRequest(id, data);
    //   },
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['requests'] });
    //     toast.success('Requests updated successfully');
    //     setSelectedRequests([]);
    //   },
    //   onError: () => {
    //     toast.error('Failed to update requests');
    //   }
    // });

    // const deleteMutation = useMutation({
    //   mutationFn: deleteRequest,
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['requests'] });
    //     toast.success('Request deleted successfully');
    //     setDeleteRequestId(null);
    //   },
    //   onError: () => {
    //     toast.error('Failed to delete request');
    //   }
    // });

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
            setSelectedRequests(requests.map(request => request.Id_requete));
        } else {
            setSelectedRequests([]);
        }
    };

    const handleSelectRequest = (requestId: string, checked: boolean) => {
        if (checked) {
            setSelectedRequests(prev => [...prev, requestId]);
        } else {
            setSelectedRequests(prev => prev.filter(id => id !== requestId));
        }
    };

    // const handleBulkStatusUpdate = async (status: string) => {
    //   try {
    //     await Promise.all(
    //       selectedRequests.map(requestId =>
    //         updateMutation.mutateAsync({
    //           id: requestId,
    //           data: { statut_request: status }
    //         })
    //       )
    //     );
    //   } catch (error) {
    //     toast.error('Failed to update requests');
    //   }
    // };

    // const handleBulkDelete = async () => {
    //   try {
    //     await Promise.all(
    //       selectedRequests.map(requestId => deleteMutation.mutateAsync(requestId))
    //     );
    //     setSelectedRequests([]);
    //     toast.success('Requests deleted successfully');
    //   } catch (error) {
    //     toast.error('Failed to delete requests');
    //   }
    // };

    const sortedRequests = [...requests].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case 'type_requete':
                comparison = a.Type_requete.localeCompare(b.Type_requete);
                break;
            case 'cible_requete':
                comparison = a.Cible_requete.localeCompare(b.Cible_requete);
                break;
            case 'statut_requete':
                comparison = a.Statut_requete.localeCompare(b.Statut_requete);
                break;
            case 'date_requete':
                comparison = new Date(a.Date_requete).getTime() - new Date(b.Date_requete).getTime();
                break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Saisie':
                return 'bg-gray-100 text-gray-800';
            case 'Notifiée':
                return 'bg-blue-100 text-blue-800';
            case 'Clôturé':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRequestTypeColor = (type: string) => {
        switch (type) {
            case 'Technical':
                return 'bg-purple-100 text-purple-800';
            case 'Commercial':
                return 'bg-indigo-100 text-indigo-800';
            case 'Support':
                return 'bg-cyan-100 text-cyan-800';
            case 'Logistique':
                return 'bg-orange-100 text-orange-800';
            case 'ADV':
                return 'bg-teal-100 text-teal-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderSortButton = (field: SortField, label: string) => (
        <Button
            variant="ghost"
            onClick={() => handleSort(field)}
            className="hover:bg-transparent"
        >
            {label}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );

    const renderBulkActions = () => (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={selectedRequests.length === 0}>
                        Bulk Actions ({selectedRequests.length})
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {/* <DropdownMenuItem onClick={() => handleBulkStatusUpdate('PLANNED')}>
            Mark as Planned
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('IN_PROGRESS')}>
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('COMPLETED')}>
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('ON_HOLD')}>
            Mark as On Hold
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
                    {/* <DropdownMenuItem
            onClick={handleBulkDelete}
            className="text-red-600"
          >
            Delete Selected
          </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    const renderGridView = () => {
        // if (isLoading) {
        //   return (
        //     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        //       {Array.from({ length: 6 }).map((_, index) => (
        //         <CardSkeleton key={index} />
        //       ))}
        //     </div>
        //   );
        // }

        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedRequests.map((request) => (
                    <Card key={request.Id_requete} className="relative overflow-hidden group">
                        <CardContent className="p-6">
                            {/* Checkbox */}
                            <div className="absolute top-4 left-4">
                                <Checkbox
                                    checked={selectedRequests.includes(request.Id_requete)}
                                    onCheckedChange={(checked) => handleSelectRequest(request.Id_requete, checked as boolean)}
                                />
                            </div>

                            {/* Delete Button in Top-Right Corner (Hidden by default, visible on hover) */}
                            <div className="absolute top-0 right-0 transform -translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteRequestId(request.Id_requete)}
                                    className="text-muted-foreground hover:text-destructive focus:outline-none"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Request Type and Status and Name */}
                            <div className="flex justify-between items-start mt-8">
                                <div className="font-medium">{request.Id_requete}</div>
                                <Badge className={getStatusColor(request.Statut_requete)}>
                                    {request.Statut_requete}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-start mt-4 "></div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">{requestTypeMap[request.Type_requete] || request.Type_requete}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {request.Description_requete}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Target className="h-4 w-4" />
                                            <span>{targetServiceMap[request.Cible_requete] || request.Cible_requete}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{request.Id_Client}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(request.Date_requete), 'MMM d')}</span>
                                        </div>
                                        {/* <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(request.periode_date_fin), 'MMM d')}</span>
                    </div> */}
                                    </div>
                                    <div className="space-y-2">
                                        <Badge className={getRequestTypeColor(request.Type_requete)}>
                                            {request.Type_requete}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/dashboard/requests/${request.Id_requete}/edit`)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

            </div>

        );
    };




    const renderTableActions = (request: Request) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4 " />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/requests/${request.Id_requete}`)}>
                    <Eye className="h-4 w-4 mr-2 " />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/requests/${request.Id_requete}/edit`)}        >
                    <Pencil className="h-4 w-4 mr-2 " />
                    Edit
                </DropdownMenuItem>
                {/* <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/projects/${project._id}/duplicate`)}>
          <BookCopy className="h-4 w-4 mr-2 " />
          Duplicate
        </DropdownMenuItem> */}
                <DropdownMenuItem
                    onClick={() => setDeleteRequestId(request.Id_requete)}
                    className="text-red-600"
                >
                    <Trash2 className="h-4 w-4 mr-2 cursor-pointer" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderTableView = () => {
        // if (isLoading) {
        //   return <TableSkeleton columnCount={8} />;
        // }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedRequests.length === requests.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>{renderSortButton('type_requete', 'Type')}</TableHead>
                            <TableHead>{renderSortButton('cible_requete', 'Target')}</TableHead>
                            <TableHead>{renderSortButton('statut_requete', 'Status')}</TableHead>
                            <TableHead>Client ID</TableHead>
                            <TableHead>{renderSortButton('date_requete', 'Date')}</TableHead>
                            {/* <TableHead>End Date</TableHead> */}
                            {/* <TableHead>Revenue Target</TableHead> */}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>

                        {sortedRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No Requests found
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedRequests.map((request) => (
                                <TableRow key={request.Id_requete}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRequests.includes(request.Id_requete)}
                                            onCheckedChange={(checked) => handleSelectRequest(request.Id_requete, checked as boolean)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getRequestTypeColor(request.Type_requete)}>
                                            {requestTypeMap[request.Type_requete] || request.Type_requete}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{targetServiceMap[request.Cible_requete] || request.Cible_requete}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                {request.Description_requete}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(request.Statut_requete)}>
                                            {request.Statut_requete}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{request.Id_Client}</TableCell>
                                    <TableCell>{format(new Date(request.Date_requete), 'MMM d, yyyy')}</TableCell>
                                    {/* <TableCell>{format(new Date(request?.periode_date_fin), 'MMM d, yyyy')}</TableCell> */}
                                    {/* <TableCell>${request.objectif_ca?.toLocaleString() || '-'}</TableCell> */}
                                    <TableCell>{renderTableActions(request)}</TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Requests</h1>
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
                    <Button onClick={() => router.push('/dashboard/requests/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? renderGridView() : renderTableView()}

            <AlertDialog open={!!deleteRequestId} onOpenChange={() => setDeleteRequestId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this request? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {/* <AlertDialogAction
              onClick={() => deleteRequestId && deleteMutation.mutate(deleteRequestId)}
            >
              Delete
            </AlertDialogAction> */}
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
