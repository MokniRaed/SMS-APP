'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFonctions } from '@/lib/services/clients';
import { getAllStatusArtCmd, getAllStatusCmd } from '@/lib/services/orders';
import { createParameter, deleteParameter, updateParameter } from '@/lib/services/parameters';
import { getProjectsProductCible, getProjectsStatus, getProjectsTypes } from '@/lib/services/projects';
import { getAllTaskStatus, getAllTaskTypes } from "@/lib/services/tasks";
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Types
type ParameterCategory = 'projects' | 'tasks' | 'clients' | 'orders';
type ParameterType = 'type' | 'status' | 'priority' | 'function' | 'productCible';

interface BaseParameter {
    _id: string;
    description: string;
}

interface ProjectType extends BaseParameter {
    nom_type_prj: string;
}

interface ContactFunction extends BaseParameter {
    nom_fonc: string;
}

// Schema
const ParameterSchema = z.object({
    id: z.string().optional(),
    description: z.string().min(1, 'Description is required')
});

type Parameter = z.infer<typeof ParameterSchema>;

// Configuration
const CATEGORY_CONFIG = {
    projects: {
        title: 'Project Parameters',
        types: ['type', 'status', 'productCible'] as const,
        queryKeys: {
            type: 'type',
            status: 'status',
            productCible: 'productcible'
        },
        fieldMappings: {
            type: 'nom_type_prj',
            status: 'nom_statut_prj',
            productCible: 'nom_produit_cible'
        }
    },
    tasks: {
        title: 'Tasks Parameters',
        types: ['type', 'status'] as const,
        queryKeys: {
            type: 'taskType', // Corrected mapping
            status: 'taskStatus' // Corrected mapping
        },
        fieldMappings: {
            type: 'nom_type_tch',
            status: 'description_statut_tch',
        }
    },
    clients: {
        title: 'Client Parameters',
        types: ['function'] as const,
        queryKeys: {
            function: 'function'
        },
        fieldMappings: {
            function: 'nom_fonc'
        }
    },
    // orders: {
    //     title: 'Order Parameters',
    //     types: ['status', 'type'] as const,
    //     queryKeys: {
    //         status: 'statutcmds',
    //         type: 'statutartcmds'
    //     },
    //     fieldMappings: {
    //         status: 'description',
    //         type: 'description'
    //     }
    // }
} as const;

export default function SettingsPage() {
    // State
    const [selectedCategory, setSelectedCategory] = useState<ParameterCategory>('projects');
    const [selectedType, setSelectedType] = useState<ParameterType>('type');
    const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hooks
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<Parameter>({
        resolver: zodResolver(ParameterSchema)
    });

    // Queries
    const queries = {
        statutcmds: useQuery({ queryKey: ['statutcmds'], queryFn: getAllStatusCmd }),
        statutartcmds: useQuery({ queryKey: ['statutartcmds'], queryFn: getAllStatusArtCmd }),
        taskType: useQuery({ queryKey: ['taskType'], queryFn: getAllTaskTypes }),
        taskStatus: useQuery({ queryKey: ['taskStatus'], queryFn: getAllTaskStatus }),
        type: useQuery<ProjectType[]>({ queryKey: ['type'], queryFn: getProjectsTypes }),
        status: useQuery({ queryKey: ['status'], queryFn: getProjectsStatus }),
        productcible: useQuery({ queryKey: ['productcible'], queryFn: getProjectsProductCible }),
        function: useQuery<ContactFunction[]>({ queryKey: ['function'], queryFn: getFonctions })
    };

    // Get current data based on selected category and type
    const getCurrentData = () => {
        const categoryConfig = CATEGORY_CONFIG[selectedCategory];
        const queryData = queries[categoryConfig.queryKeys[selectedType as keyof typeof categoryConfig.queryKeys]].data;
        const fieldMapping = categoryConfig.fieldMappings[selectedType];

        if (queryData) {
            return queryData.map((item: any) => ({
                id: item._id,
                description: item[fieldMapping]
            }));
        }

        return [];
    };

    // Handlers
    const handleParameterSubmit = async (data: Parameter) => {
        setIsSubmitting(true);
        try {
            const fieldMapping = CATEGORY_CONFIG[selectedCategory].fieldMappings[selectedType];
            const payload = { [fieldMapping]: data.description };
            const selectedQuery = CATEGORY_CONFIG[selectedCategory].queryKeys[selectedType];

            if (editingParameter) {
                await updateParameter(selectedCategory, selectedQuery, editingParameter.id!, payload);
            } else {
                await createParameter(selectedCategory, selectedQuery, payload);
            }

            // Invalidate or refetch the query after modification
            queryClient.invalidateQueries([selectedQuery]);
            toast.success(`Parameter ${editingParameter ? 'updated' : 'added'} successfully`);
            handleCloseDialog();
        } catch (error) {
            toast.error(`Failed to ${editingParameter ? 'update' : 'add'} parameter`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteParameter = async (id: string) => {
        const selectedQuery = CATEGORY_CONFIG[selectedCategory].queryKeys[selectedType];

        try {
            await deleteParameter(selectedCategory, selectedQuery, id);

            // Invalidate or refetch the query after deletion
            queryClient.invalidateQueries([selectedQuery]);
            toast.success('Parameter deleted successfully');
        } catch (error) {
            toast.error('Failed to delete parameter');
        }
    };

    const handleCloseDialog = () => {
        setIsParameterDialogOpen(false);
        reset();
        setEditingParameter(null);
    };

    // Render helpers
    const renderParameterTable = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {getCurrentData().length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center">
                            No parameters found
                        </TableCell>
                    </TableRow>
                ) : (
                    getCurrentData().map((param: Parameter) => (
                        <TableRow key={param.id}>
                            <TableCell>{param.description}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
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
                                        onClick={() => handleDeleteParameter(param.id!)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Tabs defaultValue="projects" className="space-y-6">
                <TabsList>
                    {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
                        <TabsTrigger
                            key={category}
                            value={category}
                            onClick={() => {
                                setSelectedCategory(category as ParameterCategory);
                                setSelectedType(config.types[0]);
                            }}
                        >
                            {config.title}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
                    <TabsContent key={category} value={category}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{config.title}</CardTitle>
                                    <Button onClick={() => setIsParameterDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Parameter
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs
                                    value={selectedType}
                                    onValueChange={(value) => setSelectedType(value as ParameterType)}
                                >
                                    <TabsList className="mb-4">
                                        {config.types.map((type) => (
                                            <TabsTrigger key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <div className="rounded-md border">
                                        {renderParameterTable()}
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            <Dialog open={isParameterDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingParameter ? 'Edit' : 'Add'} {selectedCategory} {selectedType}
                        </DialogTitle>
                        <DialogDescription>
                            {editingParameter ? 'Update' : 'Enter'} the description for this parameter.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleParameterSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                {...register('description')}
                                defaultValue={editingParameter?.description || ''}
                                disabled={isSubmitting}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
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
