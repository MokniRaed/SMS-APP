'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFonctions } from '@/lib/services/clients';
import { getAllStatusArtCmd, getAllStatusCmd } from '@/lib/services/orders';
import { createParameter, updateParameter } from '@/lib/services/parameters';
import { getProjectsProductCible, getProjectsStatus, getProjectsTypes } from '@/lib/services/projects';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ParameterSchema = z.object({
    id: z.string().optional(),
    description: z.string().min(1, 'Description is required')
        .refine(value => !getCurrentData().some(p => p.description === value), {
            message: 'This parameter already exists',
        }),
});

type Parameter = z.infer<typeof ParameterSchema>;

type ParameterCategory = 'projects' | 'tasks' | 'clients' | 'orders';
type ParameterType = 'type' | 'status' | 'priority' | 'function' | 'productCible';

type ProjectType = {
    _id: string;
    nom_type_prj: string;
};

type ContactFunction = {
    _id: string;
    nom_fonc: string;
};


type ParametersState = {
    [K in ParameterCategory]: {
        [T in ParameterType]?: Parameter[];
    };
};

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [pushNotifications, setPushNotifications] = useState(true);
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ParameterCategory>('projects');
    const [selectedType, setSelectedType] = useState<ParameterType>('type');
    const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<Parameter>({
        resolver: zodResolver(ParameterSchema)
    });

    // Order Data
    const { data: statusCmd = [] } = useQuery({
        queryKey: ['statusCmd'],
        queryFn: getAllStatusCmd
    });

    const { data: statusArtCmd = [] } = useQuery({
        queryKey: ['statusArtCmd'],
        queryFn: getAllStatusArtCmd
    });

    // Project Data
    const { data: projectTypes = [] } = useQuery<ProjectType[]>({
        queryKey: ['projectTypes'],
        queryFn: getProjectsTypes
    });

    const { data: projectStatus = [] } = useQuery({
        queryKey: ['projectStatus'],
        queryFn: getProjectsStatus
    });

    const { data: projectProductCible = [] } = useQuery({
        queryKey: ['projectProductCible'],
        queryFn: getProjectsProductCible
    });

    const { data: contactFunction = [] } = useQuery<ContactFunction[]>({
        queryKey: ['contactFunction'],
        queryFn: getFonctions
    });


    const getFieldMapping = () => {
        const mappings: Record<ParameterCategory, Record<ParameterType, string>> = {
            projects: {
                type: 'nom_type_prj',
                status: 'nom_statut_prj',
                productCible: 'nom_produit_cible',
                priority: '',
                function: ''
            },
            clients: {
                type: '',
                status: '',
                priority: '',
                function: 'nom_fonc',
                productCible: ''
            },
            orders: {
                type: 'description',
                status: 'description',
                priority: '',
                function: '',
                productCible: ''
            },
            tasks: {
                type: '',
                status: '',
                priority: '',
                function: '',
                productCible: ''
            }
        };
        return mappings[selectedCategory][selectedType];
    };
    console.log("contactFunction", contactFunction);


    const getCurrentData = () => {
        switch (selectedCategory) {
            case 'projects':
                switch (selectedType) {
                    case 'type': return projectTypes.map((t: any) => ({ id: t._id, description: t.nom_type_prj }));
                    case 'status': return projectStatus.map((s: any) => ({ id: s._id, description: s.nom_statut_prj }));
                    case 'productCible': return projectProductCible.map((p: any) => ({ id: p._id, description: p.nom_produit_cible }));
                    default: return [];
                }
            case 'clients':
                switch (selectedType) {
                    case 'function': return contactFunction.map((f: any) => ({ id: f._id, description: f.nom_fonc }));
                    default: return [];
                }
            case 'orders':
                switch (selectedType) {
                    case 'status': return statusCmd.map((s: any) => ({ id: s._id, description: s.description }));
                    case 'type': return statusArtCmd.map((a: any) => ({ id: a._id, description: a.description }));
                    default: return [];
                }
            default: return [];
        }
    };

    const handleParameterSubmit = async (data: Parameter) => {
        setIsSubmitting(true);
        try {
            const fieldName = getFieldMapping();
            const payload = { [fieldName]: data.description };

            if (editingParameter) {
                await updateParameter(
                    selectedCategory,
                    selectedType,
                    editingParameter.id,
                    payload
                );
            } else {
                await createParameter(
                    selectedCategory,
                    selectedType,
                    payload
                );
            }

            queryClient.invalidateQueries([getQueryKey()]);
            toast.success(`Parameter ${editingParameter ? 'updated' : 'added'} successfully`);
            setIsParameterDialogOpen(false);
            reset();
            setEditingParameter(null);
        } catch (error) {
            toast.error(`Failed to ${editingParameter ? 'update' : 'add'} parameter: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteParameter = async (id: string) => {
        try {
            await deleteParameter(
                selectedCategory,
                selectedType,
                id
            );
            queryClient.invalidateQueries([getQueryKey()]);
            toast.success('Parameter deleted successfully');
        } catch (error) {
            toast.error(`Failed to delete parameter: ${error.message}`);
        }
    };

    const getQueryKey = () => {
        const keys: Record<ParameterCategory, Record<ParameterType, string>> = {
            projects: {
                type: 'projectTypes',
                status: 'projectStatus',
                productCible: 'projectProductCible',
                priority: '',
                function: ''
            },
            clients: {
                type: '',
                status: '',
                priority: '',
                function: 'contactFunction',
                productCible: ''
            },
            orders: {
                type: 'statusArtCmd',
                status: 'statusCmd',
                priority: '',
                function: '',
                productCible: ''
            },
            tasks: {
                type: '',
                status: '',
                priority: '',
                function: '',
                productCible: ''
            }
        };
        return keys[selectedCategory][selectedType];
    };

    const getCategoryTitle = (category: ParameterCategory) => {
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    const getAvailableTypes = (category: ParameterCategory): ParameterType[] => {
        switch (category) {
            case 'projects': return ['type', 'status', 'productCible'];
            case 'clients': return ['function'];
            case 'orders': return ['status', 'type'];
            default: return [];
        }
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Tabs defaultValue="projects" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="projects">Project Parameters</TabsTrigger>
                    <TabsTrigger value="clients">Client Parameters</TabsTrigger>
                    <TabsTrigger value="orders">Order Parameters</TabsTrigger>
                </TabsList>

                {(['projects', 'clients', 'orders'] as const).map((category) => (
                    <TabsContent key={category} value={category}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{getCategoryTitle(category)} Parameters</CardTitle>
                                    <Button onClick={() => {
                                        setSelectedCategory(category);
                                        setEditingParameter(null);
                                        setIsParameterDialogOpen(true);
                                    }}>
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
                                        {getAvailableTypes(category).map((type) => (
                                            <TabsTrigger key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <div className="rounded-md border">
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
                                                    getCurrentData().map((param) => (
                                                        <TableRow key={param.id}>
                                                            <TableCell>{param.description}</TableCell>
                                                            <TableCell>
                                                                <div className="flex space-x-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => {
                                                                            setSelectedCategory(category);
                                                                            setEditingParameter(param);
                                                                            setIsParameterDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleDeleteParameter(param.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>)
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            <Dialog open={isParameterDialogOpen} onOpenChange={setIsParameterDialogOpen}>
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
                                onClick={() => {
                                    setIsParameterDialogOpen(false);
                                    reset();
                                    setEditingParameter(null);
                                }}
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
        </div >
    );
}