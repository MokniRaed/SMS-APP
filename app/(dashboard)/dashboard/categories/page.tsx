'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AddCategory,
  deleteCategory,
  getCategoriesByType,
  updateCategoriesById
} from "@/lib/services/categories";
import { getUserFromLocalStorage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Types
type ParameterType = 'cat_stat' | 'cat_nv_1' | 'cat_nv_2' | 'st' | 'marque';

interface Category {
  _id: string;
  name: string;
  label: string;
}

// Schema
const ParameterSchema = z.object({
  _id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  name: z.string().optional(),
  label: z.string().optional()
});

type Parameter = z.infer<typeof ParameterSchema>;

// Configuration for categories only
const CATEGORY_CONFIG = {
  title: 'Category Parameters',
  types: ['cat_stat', 'cat_nv_1', 'cat_nv_2', 'st', 'marque'] as const,
  queryKeys: {
    cat_stat: 'Societé',
    cat_nv_1: 'Niveau1',
    cat_nv_2: 'Niveau2',
    st: 'Societé',
    marque: 'Marque'
  },
  fieldMappings: {
    cat_stat: 'name',
    cat_nv_1: 'name',
    cat_nv_2: 'name',
    st: 'name',
    marque: 'name'
  }
};

export default function SettingsPage() {
  // State
  const [selectedType, setSelectedType] = useState<ParameterType>('st');
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = getUserFromLocalStorage();
  const userRole = user?.role ?? '';

  const [page, setPage] = useState(1);

  // Hooks
  const queryClient = useQueryClient();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Parameter>({
    resolver: zodResolver(ParameterSchema)
  });
  const searchParams = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '10');
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['categories', selectedType, page, limit, searchTerm],
    queryFn: () => getCategoriesByType(selectedType, page.toString(), limit.toString(), searchTerm)
  });

  console.log("categoryData", categoryData);
  console.log("limit", limit);


  const categories = categoryData?.data || [];
  const total = categoryData?.total;
  const totalPages = Math.ceil(total / limit);
  console.log("total", total);
  console.log("totalPages", totalPages);

  useEffect(() => {
    setPage(1);
  }, [selectedType]);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => prev - 1);
  };


  // Get current data based on selected type
  // const getCurrentData = () => {
  //   const queryData = queries[CATEGORY_CONFIG.queryKeys[selectedType]].data;

  //   if (queryData) {
  //     return queryData.map((item: Category) => ({
  //       id: item._id,
  //       name: item.name,
  //       label: item.label,
  //       description: item.name // Keep description for compatibility with existing code
  //     }));
  //   }

  //   return [];
  // };

  // Handlers
  const handleParameterSubmit = async (data: Parameter) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.description,
        label: data.label || data.description, // Use description as label if not provided
      };

      const selectedQuery = CATEGORY_CONFIG.queryKeys[selectedType];
      console.log("editingParameter", editingParameter);


      // These functions would need to be adapted to handle only categories
      if (editingParameter) {
        await updateParameter(selectedQuery, editingParameter._id!, payload);
      } else {
        await createParameter(payload);
      }

      // Invalidate or refetch the query after modification
      queryClient.invalidateQueries({ queryKey: ['categories', selectedType, page, limit] });
      toast.success(`Category ${editingParameter ? 'updated' : 'added'} successfully`);
      handleCloseDialog();
    } catch (error) {
      toast.error(`Failed to ${editingParameter ? 'update' : 'add'} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParameter = async (id: string) => {
    const selectedQuery = CATEGORY_CONFIG.queryKeys[selectedType];

    try {
      await deleteParameter('categories', selectedQuery, id);

      // Invalidate or refetch the query after deletion
      queryClient.invalidateQueries({ queryKey: ['categories', selectedType, page, limit] });
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleCloseDialog = () => {
    setIsParameterDialogOpen(false);
    reset();
    setEditingParameter(null);
  };

  // Import necessary service functions that need to be adapted for categories only
  const createParameter = async (payload: any) => {
    // This would need to be implemented to handle only categories
    // This is a placeholder based on the original implementation
    // return fetch(`/api/${category}/${type}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // }).then(res => {
    //   if (!res.ok) throw new Error('Failed to create parameter');
    //   return res.json();
    // });



    //  setIsSubmitting(true);
    try {
      await AddCategory(selectedType, payload);
      // toast.success('Client contact updated successfully');
      // router.push('/dashboard/clients');
    } catch (error) {
      toast.error(`Failed to update ${selectedType} category`);
    } finally {
      // setIsSubmitting(false);
    }

  };

  const updateParameter = async (type: string, id: string, payload: any) => {
    // This would need to be implemented to handle only categories
    // This is a placeholder based on the original implementation
    // return fetch(`/api/${category}/${type}/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // }).then(res => {
    //   if (!res.ok) throw new Error('Failed to update parameter');
    //   return res.json();
    // });
    console.log("type", type);
    console.log("payload", payload);
    console.log("id", id);



    //  setIsSubmitting(true);
    try {
      await updateCategoriesById(id, payload);
      // toast.success('Client contact updated successfully');
      // router.push('/dashboard/clients');
    } catch (error) {
      toast.error(`Failed to update ${type} category`);
    } finally {
      // setIsSubmitting(false);
    }
  };

  const deleteParameter = async (category: string, type: string, id: string) => {
    // This would need to be implemented to handle only categories
    // This is a placeholder based on the original implementation
    // return fetch(`/api/${category}/${type}/${id}`, {
    //   method: 'DELETE'
    // }).then(res => {
    //   if (!res.ok) throw new Error('Failed to delete parameter');
    //   return res.json();
    // });

    try {
      await deleteCategory(id);
      // toast.success('Client contact updated successfully');
      // router.push('/dashboard/clients');
    } catch (error) {
      toast.error(`Failed to update ${type} category`);
    } finally {
      // setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Category Settings</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{CATEGORY_CONFIG.title}</CardTitle>
            {userRole !== 'collaborateur' && (
              <Button onClick={() => setIsParameterDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>

          <Tabs
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as ParameterType)}
          >
            <TabsList className="mb-4">
              {CATEGORY_CONFIG.types.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type.replace('cat_', '').replace('_', ' ').charAt(0).toUpperCase() + type.replace('cat_', '').replace('_', ' ').slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <TableSkeleton columnCount={4} />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((param: any) => (
                        <TableRow key={param.cat_id}>
                          <TableCell>{param.cat_id}</TableCell>
                          <TableCell>{param.name}</TableCell>
                          <TableCell>{param.label}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {userRole !== 'collaborateur' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingParameter(param);
                                      setIsParameterDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteParameter(param._id!)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
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
              <span className="text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isParameterDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingParameter ? 'Edit' : 'Add'} Category
            </DialogTitle>
            <DialogDescription>
              {editingParameter ? 'Update' : 'Enter'} the details for this category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleParameterSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                {...register('description')}
                defaultValue={editingParameter?.name || editingParameter?.description || ''}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                {...register('label')}
                defaultValue={editingParameter?.label || ''}
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingParameter ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
