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
            type: 'projectTypes',
            status: 'projectStatus',
            productCible: 'projectProductCible'
        },
        fieldMappings: {
            type: 'nom_type_prj',
            status: 'nom_statut_prj',
            productCible: 'nom_produit_cible'
        }
    },
    clients: {
        title: 'Client Parameters',
        types: ['function'] as const,
        queryKeys: {
            function: 'contactFunction'
        },
        fieldMappings: {
            function: 'nom_fonc'
        }
    },
    orders: {
        title: 'Order Parameters',
        types: ['status', 'type'] as const,
        queryKeys: {
            status: 'statusCmd',
            type: 'statusArtCmd'
        },
        fieldMappings: {
            status: 'description',
            type: 'description'
        }
    }
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
        statusCmd: useQuery({ queryKey: ['statusCmd'], queryFn: getAllStatusCmd }),
        statusArtCmd: useQuery({ queryKey: ['statusArtCmd'], queryFn: getAllStatusArtCmd }),
        projectTypes: useQuery<ProjectType[]>({ queryKey: ['projectTypes'], queryFn: getProjectsTypes }),
        projectStatus: useQuery({ queryKey: ['projectStatus'], queryFn: getProjectsStatus }),
        projectProductCible: useQuery({ queryKey: ['projectProductCible'], queryFn: getProjectsProductCible }),
        contactFunction: useQuery<ContactFunction[]>({ queryKey: ['contactFunction'], queryFn: getFonctions })
    };

    // Helpers
    const getFieldMapping = () => {
        return CATEGORY_CONFIG[selectedCategory].fieldMappings[selectedType as keyof typeof CATEGORY_CONFIG[typeof selectedCategory]['fieldMappings']];
    };

    const getCurrentData = () => {
        const data = {
            projects: {
                type: queries.projectTypes.data?.map(t => ({ id: t._id, description: t.nom_type_prj })),
                status: queries.projectStatus.data?.map(s => ({ id: s._id, description: s.nom_statut_prj })),
                productCible: queries.projectProductCible.data?.map(p => ({ id: p._id, description: p.nom_produit_cible }))
            },
            clients: {
                function: queries.contactFunction.data?.map(f => ({ id: f._id, description: f.nom_fonc }))
            },
            orders: {
                status: queries.statusCmd.data?.map(s => ({ id: s._id, description: s.description })),
                type: queries.statusArtCmd.data?.map(a => ({ id: a._id, description: a.description }))
            }
        };

        return (data[selectedCategory] as any)?.[selectedType] || [];
    };

    // Handlers
    const handleParameterSubmit = async (data: Parameter) => {
        setIsSubmitting(true);
        try {
            const fieldName = getFieldMapping();
            const payload = { [fieldName]: data.description };

            if (editingParameter) {
                await updateParameter(selectedCategory, selectedType, editingParameter.id!, payload);
            } else {
                await createParameter(selectedCategory, selectedType, payload);
            }

            queryClient.invalidateQueries([CATEGORY_CONFIG[selectedCategory].queryKeys[selectedType as keyof typeof CATEGORY_CONFIG[typeof selectedCategory]['queryKeys']]]);
            toast.success(`Parameter ${editingParameter ? 'updated' : 'added'} successfully`);
            handleCloseDialog();
        } catch (error) {
            toast.error(`Failed to ${editingParameter ? 'update' : 'add'} parameter`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteParameter = async (id: string) => {
        try {
            await deleteParameter(selectedCategory, selectedType, id);
            queryClient.invalidateQueries([CATEGORY_CONFIG[selectedCategory].queryKeys[selectedType as keyof typeof CATEGORY_CONFIG[typeof selectedCategory]['queryKeys']]]);
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
                                defaultValue={editingParameter?.description}
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