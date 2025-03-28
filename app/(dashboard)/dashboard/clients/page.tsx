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
import { deleteClientContact, getClientContacts } from '@/lib/services/clients';
import { MakeClientUser } from "@/lib/services/users";
import { getUserFromLocalStorage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, LayoutGrid, MoreVertical, Pencil, Plus, Table as TableIcon, Trash2, UserRoundPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ViewMode = 'grid' | 'table';
type SortOrder = 'asc' | 'desc';
type SortField = 'nom_prenom_contact' | 'is_user';

export default function ClientContactsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortField, setSortField] = useState<SortField>('is_user');
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '10');

  const { user } = getUserFromLocalStorage() ?? {};
  const userRole = user?.role ?? '';

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['clientContacts', page, limit],
    queryFn: () => getClientContacts(page.toString(), limit.toString()),
  });
console.log("categoryData",categoryData);

  const contacts = categoryData?.data || [];
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

  const sortedContacts = contacts
    ? [...contacts].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'nom_prenom_contact':
            comparison = a?.nom_prenom_contact.localeCompare(
              b?.nom_prenom_contact
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
    mutationFn: deleteClientContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientContacts'] });
      toast.success('Contact deleted successfully');
      setDeleteContactId(null);
    },
    onError: () => {
      toast.error('Failed to delete contact');
    },
  });

  // TODO : apply same patter to other functions + handle error message from backend

  const makeUser = async (clientId: string) => {
    try {
      const response = await MakeClientUser(clientId);
      console.log('response', response);

      if (response?.status === 201) {
        toast.success('Client Account has been created');
        queryClient.invalidateQueries({ queryKey: ['clientContacts'] });

        // router.push('/dashboard/clients');
      } else {
        toast.error(`cannot create account ${response?.message}`);
      }
    } catch (error) {
      toast.error('Failed to create client contact');
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
        {contacts.map((contact, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {contact.nom_prenom_contact}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {contact?.fonction_contact?.nom_fonc}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {contact.adresse_email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span>{' '}
                  {contact.numero_mobile || contact.numero_fix}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Preferred Channel:</span>{' '}
                  {contact.canal_interet}
                </p>
                <p className="text-sm">
                  <span className="font-medium">User: </span>
                  <Badge color="green">
                    {' '}
                    {contact?.is_user == true ? 'Yes' : 'No'}{' '}
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
                        router.push(`/dashboard/clients/${contact._id}/edit`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteContactId(contact._id)}
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

  const renderTableActions = (contact: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!contact.is_user && (
          <DropdownMenuItem onClick={() => makeUser(contact?.id_client)}>
            <UserRoundPlus className="h-4 w-4 mr-2 " />
            Make user
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/clients/${contact._id}/edit`)}
        >
          <Pencil className="h-4 w-4 mr-2 " />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDeleteContactId(contact._id)}
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
              <TableHead> {renderSortButton('nom_prenom_contact', 'Name')}</TableHead>
              <TableHead>Function</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Preferred Channel</TableHead>
              <TableHead>
                {renderSortButton('is_user', 'User')}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map((contact, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {contact.nom_prenom_contact}
                </TableCell>
                <TableCell>{contact?.fonction_contact?.nom_fonc}</TableCell>
                <TableCell>{contact?.adresse_email}</TableCell>
                <TableCell>
                  {contact?.numero_mobile || contact.numero_fix}
                </TableCell>
                <TableCell>{contact?.canal_interet}</TableCell>
                <TableCell>
                  {' '}
                  <Badge>{contact?.is_user == true ? 'Yes' : 'No'}</Badge>{' '}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {userRole !== 'collaborateur' && (
                      <>
                        {renderTableActions(contact)}
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
        <h1 className="text-3xl font-bold">Client Contacts</h1>
        <div className="flex space-x-2">
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
          {userRole !== 'collaborateur' && (
            <Button onClick={() => router.push('/dashboard/clients/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Contact
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
        onOpenChange={() => setDeleteContactId(null)}
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
