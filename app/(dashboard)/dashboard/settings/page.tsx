'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Moon, Sun, Bell, User, Lock, Shield, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for parameter entries
const ParameterSchema = z.object({
    id: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
});

type Parameter = z.infer<typeof ParameterSchema>;

type ParameterCategory = 'project' | 'task' | 'client' | 'order';
type ParameterType = 'type' | 'status' | 'priority' | 'category';

// Define the structure of our parameters state
type ParametersState = {
    [K in ParameterCategory]: {
        [T in ParameterType]?: Parameter[];
    };
};

const initialParameters: ParametersState = {
    project: {
        type: [
            { id: '1', description: 'Development' },
            { id: '2', description: 'Research' },
            { id: '3', description: 'Maintenance' }
        ],
        status: [
            { id: '1', description: 'Planned' },
            { id: '2', description: 'In Progress' },
            { id: '3', description: 'Completed' }
        ]
    },
    task: {
        type: [
            { id: '1', description: 'Bug Fix' },
            { id: '2', description: 'Feature' },
            { id: '3', description: 'Documentation' }
        ],
        priority: [
            { id: '1', description: 'Low' },
            { id: '2', description: 'Medium' },
            { id: '3', description: 'High' }
        ],
        status: [
            { id: '1', description: 'Open' },
            { id: '2', description: 'In Progress' },
            { id: '3', description: 'Completed' }
        ]
    },
    client: {
        category: [
            { id: '1', description: 'Enterprise' },
            { id: '2', description: 'SMB' },
            { id: '3', description: 'Individual' }
        ],
        status: [
            { id: '1', description: 'Active' },
            { id: '2', description: 'Inactive' },
            { id: '3', description: 'Pending' }
        ]
    },
    order: {
        type: [
            { id: '1', description: 'Standard' },
            { id: '2', description: 'Express' },
            { id: '3', description: 'Bulk' }
        ],
        status: [
            { id: '1', description: 'New' },
            { id: '2', description: 'Processing' },
            { id: '3', description: 'Shipped' }
        ]
    }
};

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ParameterCategory>('project');
    const [selectedType, setSelectedType] = useState<ParameterType>('type');
    const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [parameters, setParameters] = useState<ParametersState>(initialParameters);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<Parameter>({
        resolver: zodResolver(ParameterSchema)
    });

    const handleParameterSubmit = async (data: Parameter) => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (editingParameter) {
                // Update existing parameter
                setParameters(prev => ({
                    ...prev,
                    [selectedCategory]: {
                        ...prev[selectedCategory],
                        [selectedType]: prev[selectedCategory][selectedType]?.map(p =>
                            p.id === editingParameter.id ? { ...p, description: data.description } : p
                        )
                    }
                }));
                toast.success('Parameter updated successfully');
            } else {
                // Add new parameter
                setParameters(prev => ({
                    ...prev,
                    [selectedCategory]: {
                        ...prev[selectedCategory],
                        [selectedType]: [
                            ...(prev[selectedCategory][selectedType] || []),
                            { id: Math.random().toString(), description: data.description }
                        ]
                    }
                }));
                toast.success('Parameter added successfully');
            }

            setIsParameterDialogOpen(false);
            reset();
            setEditingParameter(null);
        } catch (error) {
            toast.error('Failed to save parameter');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteParameter = async (id: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setParameters(prev => ({
                ...prev,
                [selectedCategory]: {
                    ...prev[selectedCategory],
                    [selectedType]: prev[selectedCategory][selectedType]?.filter(p => p.id !== id)
                }
            }));

            toast.success('Parameter deleted successfully');
        } catch (error) {
            toast.error('Failed to delete parameter');
        }
    };

    const getCategoryTitle = (category: ParameterCategory) => {
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    const getTypeTitle = (type: ParameterType) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const getAvailableTypes = (category: ParameterCategory): ParameterType[] => {
        switch (category) {
            case 'project':
                return ['type', 'status'];
            case 'task':
                return ['type', 'priority', 'status'];
            case 'client':
                return ['category', 'status'];
            case 'order':
                return ['type', 'status'];
            default:
                return ['type'];
        }
    };

    const getCurrentParameters = () => {
        return parameters[selectedCategory][selectedType] || [];
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Tabs defaultValue="project" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="project">Project Parameters</TabsTrigger>
                    <TabsTrigger value="task">Task Parameters</TabsTrigger>
                    <TabsTrigger value="client">Client Parameters</TabsTrigger>
                    <TabsTrigger value="order">Order Parameters</TabsTrigger>
                </TabsList>

                {(['project', 'task', 'client', 'order'] as const).map((category) => (
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
                                                {getTypeTitle(type)}
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
                                                {getCurrentParameters().map((param) => (
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
                                                    </TableRow>
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

            {/* Parameter Dialog */}
            <Dialog open={isParameterDialogOpen} onOpenChange={setIsParameterDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingParameter ? 'Edit' : 'Add'} {getCategoryTitle(selectedCategory)} {getTypeTitle(selectedType)}
                        </DialogTitle>
                        <DialogDescription>
                            {editingParameter ? 'Update the' : 'Enter a'} description for this parameter.
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
        </div>
    );
}