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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CardSkeleton } from '@/components/ui/skeletons/card-skeleton';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { deleteCollaborator, getCollaborators } from "@/lib/services/collaborators";
import { MakeCollaboratorUser } from "@/lib/services/users";
import { getUserFromLocalStorage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, ChevronLeft, ChevronRight, LayoutGrid, MoreVertical, Pencil, Plus, Table as TableIcon, Trash2, UserRoundPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'table';
type SortOrder = 'asc' | 'desc';
type SortField = 'nom_prenom_contact' | 'is_user';

export default function CollaboratorContactsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [deleteContactId, setDeleteCollabId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [sortField, setSortField] = useState<SortField>('is_user');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const searchParams = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');

    const { user } = getUserFromLocalStorage() ?? {};
    const userRole = user?.role ?? '';

    const { data: collaboratorsData, isLoading } = useQuery({
        queryKey: ['collaborator', page, limit],
        queryFn: () => getCollaborators(page.toString(), limit.toString()),
    });

    const collaborators = collaboratorsData?.data || [];
    const total = collaboratorsData?.total;
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

    const sortedCollaborators = collaborators
        ? [...collaborators].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'firstName':
                    comparison = a?.firstName.localeCompare(
                        b?.firstName
                    );
                    break;
                case 'is_user':
                    comparison = a?.is_user === b?.is_user ? 0 : a?.is_user ? 1 : -1;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        })
        : [];

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            console.log('sorted', sortField);
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(
                selectedContacts.map(collabId => deleteMutation.mutate(collabId))
            );
            setSelectedContacts([]);
            toast.success('Contacts deleted successfully');
        } catch (error) {
            toast.error('Failed to delete contacts');
        }
    };

    const renderBulkActions = () => (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={selectedContacts.length === 0}>
                        Bulk Actions ({selectedContacts.length})
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                        Delete Selected
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedContacts(collaborators.map(contact => contact._id));
        } else {
            setSelectedContacts([]);
        }
    };

    const handleSelectContact = (contactId: string, checked: boolean) => {
        if (checked) {
            setSelectedContacts(prev => [...prev, contactId]);
        } else {
            setSelectedContacts(prev => prev.filter(id => id !== contactId));
        }
    };

    // TODO : make it reusable component
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

    const deleteMutation = useMutation({
        mutationFn: deleteCollaborator,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collaboratorContacts'] });
            toast.success('Contact deleted successfully');
            setDeleteCollabId(null);
        },
        onError: () => {
            toast.error('Failed to delete contact');
        },
    });

    const makeUser = async (id_collab: string) => {
        try {
            // Assuming MakeClientUser takes clientId as argument
            const response = await MakeCollaboratorUser(id_collab);
            if (response?.status === 201) {
                toast.success('Collaborator Account has been created');
                queryClient.invalidateQueries({ queryKey: ['collaboratorContacts'] });
            } else {
                toast.error(`cannot create account ${response?.message}`);
            }
        } catch (error) {
            toast.error('Failed to make collaborator contact');
        }
    };

    const renderGridView = () => {
        if (isLoading) {
            return (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <CardSkeleton key={index} />
                    ))}
                </div>
            );
        }

        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collaborators.map((collaborator, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {collaborator.nom_prenom_contact}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {collaborator?.fonction_contact?.nom_fonc}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">Email:</span> {collaborator.adresse_email}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Phone:</span>{' '}
                                    {collaborator.numero_mobile || collaborator.numero_fix}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Preferred Channel:</span>{' '}
                                    {collaborator.canal_interet}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">User: </span>
                                    <Badge color="green">
                                        {' '}
                                        {collaborator?.is_user == true ? 'Yes' : 'No'}{' '}
                                    </Badge>
                                </p>
                            </div>

                            <div className=" flex justify-end space-x-2">
                                {userRole !== 'collaborateur' && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                router.push(`/dashboard/collaborators/${collaborator._id}/edit`)
                                            }
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteCollabId(collaborator._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderTableActions = (collab: any) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4 " />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {!collab.is_user && (
                    <DropdownMenuItem onClick={() => makeUser(collab?.id_collab)}>
                        <UserRoundPlus className="h-4 w-4 mr-2 " />
                        Make user
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/collaborators/${collab._id}/edit`)}
                >
                    <Pencil className="h-4 w-4 mr-2 " />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setDeleteCollabId(collab._id)}
                    className="text-red-600"
                >
                    <Trash2 className="h-4 w-4 mr-2 " />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderTableView = () => {
        if (isLoading) {
            return <TableSkeleton columnCount={7} />;
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedContacts.length === collaborators.length}
                                    onCheckedChange={handleSelectAll}
                                />

                            </TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead> {renderSortButton('nom_prenom_contact', 'Name')}</TableHead>
                            {/* <TableHead>Function</TableHead> */}
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>
                                {renderSortButton('is_user', 'User')}
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCollaborators.map((collab, index) => (
                            <TableRow key={index}>
                                <TableCell className="w-[50px]">
                                    <Checkbox
                                        checked={selectedContacts.includes(collab._id)}
                                        onCheckedChange={(checked) => handleSelectContact(collab._id, checked as boolean)}
                                    />

                                </TableCell>
                                <TableCell className="font-medium">
                                    {collab.id_collab}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {collab.firstName} {" "}
                                    {collab.lastName}
                                </TableCell>
                                {/* <TableCell>{collab?.fonction_collab?.nom_fonc}</TableCell> */}
                                <TableCell>{collab?.adresse_email}</TableCell>
                                <TableCell>
                                    {collab?.numero_mobile || collab.numero_fix}
                                </TableCell>
                                <TableCell>
                                    {' '}
                                    <Badge>{collab?.is_user == true ? 'Yes' : 'No'}</Badge>{' '}
                                </TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        {userRole !== 'collaborateur' && (
                                            <>
                                                {renderTableActions(collab)}
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Collaborators</h1>
                <div className="flex space-x-2">
                    {renderBulkActions()}
                    <div className="border rounded-lg p-1">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
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
                    {userRole !== 'collaborateur' && (
                        <Button onClick={() => router.push('/dashboard/collaborators/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Collaborator

                        </Button>
                    )}
                </div>
            </div>

            {viewMode === 'grid' ? renderGridView() : renderTableView()}
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

            <AlertDialog
                open={!!deleteContactId}
                onOpenChange={() => setDeleteCollabId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this contact? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                deleteContactId && deleteMutation.mutate(deleteContactId)
                            }
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
