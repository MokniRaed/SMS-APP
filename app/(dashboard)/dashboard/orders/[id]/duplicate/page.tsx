'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { getArticles } from '@/lib/services/articles';
import { getClientContacts } from '@/lib/services/clients';
import { createOrder, getAllStatusArtCmd, getAllStatusCmd, getLineCommandsByOrder, getOrder, OrderSchema, type Order } from '@/lib/services/orders';
import { getUsersByRole } from '@/lib/services/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Minus, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Mock user role - replace with actual auth
const userRole = 'RESPONSABLE';

export default function DuplicateOrderPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
    const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
    const [articleCategory, setArticleCategory] = useState<string>("all");

    const { data: order, isLoading: orderLoading } = useQuery({
        queryKey: ['order', params.id],
        queryFn: () => getOrder(params.id)
    });

    const { data: statusArtCmd = [] } = useQuery({
        queryKey: ['statusArtCmd'],
        queryFn: getAllStatusArtCmd
    });

    const statusMapArtCmd = statusArtCmd.reduce((acc, status) => ({
        ...acc,
        [status._id]: status.description,
        [status.value]: status._id
    }), {});

    const { data: statutartcmds, isLoading: statutartcmdsLoading } = useQuery({
        queryKey: ['statutartcmds', params.id],
        queryFn: getAllStatusArtCmd
    });

    const { data: statutcmds, isLoading: statutcmdsLoading } = useQuery({
        queryKey: ['statutcmds', params.id],
        queryFn: getAllStatusCmd
    });

    const { data: cmdLines = [], isLoading: cmdLinesLoading } = useQuery({
        queryKey: ['cmdLines', params.id],
        queryFn: () => getLineCommandsByOrder(params.id),
        enabled: !!order
    });

    const { data: clients = [] } = useQuery({
        queryKey: ['clientContacts'],
        queryFn: getClientContacts
    });

    const { data: collaborators = [] } = useQuery({
        queryKey: ['collaborators'],
        queryFn: () => getUsersByRole("679694ee22268f25bdfcba23")
    });

    const { data: articles = [] } = useQuery({
        queryKey: ['articles'],
        queryFn: getArticles
    });

    // Get unique categories for filtering
    const categories = [...new Set(articles.map(article => article.art_categorie))];

    const { register, handleSubmit, formState: { isDirty, errors }, setValue, watch } = useForm<Order>({
        resolver: zodResolver(OrderSchema),
        values: {
            ...order,
            articles: cmdLines.map(line => ({
                id_article: line.id_article?._id,
                quantite_cmd: line.quantite_cmd,
                notes_cmd: line.notes_cmd,
                statut_art_cmd: line.statut_art_cmd?._id,
                quantite_valid: line.quantite_valid,
                quantite_confr: line.quantite_confr
            }))
        }
    });

    useEffect(() => {
        if (cmdLines.length > 0 && !isDirty) {
            setValue('articles', cmdLines.map(line => ({
                id_article: line.id_article?._id,
                quantite_cmd: line.quantite_cmd,
                notes_cmd: line.notes_cmd,
                statut_art_cmd: line.statut_art_cmd?._id,
                quantite_valid: line.quantite_valid,
                quantite_confr: line.quantite_confr
            })));
        }
    }, [cmdLines, setValue, isDirty]);

    const watchArticles = watch('articles') || [];
    const statut_cmd = watch('statut_cmd') || [];

    const handleQuantityChange = (index: number, change: number, field: 'quantite_cmd' | 'quantite_valid' | 'quantite_confr') => {
        const currentArticles = [...watchArticles];
        const currentQuantity = currentArticles[index]?.[field] || 0;
        const newQuantity = Math.max(1, currentQuantity + change);

        // Apply validation rules based on user role and field
        if (userRole === 'RESPONSABLE' && field === 'quantite_valid') {
            currentArticles[index] = {
                ...currentArticles[index],
                quantite_valid: newQuantity,
            };
        } else if (['CLIENT', 'COLLABORATEUR'].includes(userRole) && field === 'quantite_confr') {
            // Client/Collaborateur can set confirmed quantity based on validated quantity
            const validatedQty = currentArticles[index].quantite_valid || 0;
            if (newQuantity <= validatedQty) {
                currentArticles[index] = {
                    ...currentArticles[index],
                    quantite_confr: newQuantity,
                    statut_art_cmd: '67b1330031cfd7a92cb14c49' // CONFIRMED
                };
            } else {
                toast.error('Confirmed quantity cannot exceed validated quantity');
                return;
            }
        } else {
            // Default case for quantite_cmd
            currentArticles[index] = {
                ...currentArticles[index],
                [field]: newQuantity
            };
        }

        setValue('articles', currentArticles);
    };

    const handleArticleSelect = (articleId: string, checked: boolean) => {
        if (checked) {
            setSelectedArticles(prev => [...prev, articleId]);
            setSelectedQuantities(prev => ({
                ...prev,
                [articleId]: prev[articleId] || 1
            }));
        } else {
            setSelectedArticles(prev => prev.filter(id => id !== articleId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = filteredArticles.map(article => article._id);
            setSelectedArticles(allIds);

            const quantities: Record<string, number> = {};
            allIds.forEach(id => {
                quantities[id] = selectedQuantities[id] || 1;
            });
            setSelectedQuantities(quantities);
        } else {
            setSelectedArticles([]);
        }
    };

    const updateArticleQuantity = (articleId: string, change: number) => {
        setSelectedQuantities(prev => ({
            ...prev,
            [articleId]: Math.max(1, (prev[articleId] || 1) + change)
        }));
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.art_designation.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = articleCategory === "all" || article.art_categorie === articleCategory;
        return matchesSearch && matchesCategory;
    });

    const addSelectedArticlesToOrder = () => {
        const currentArticles = [...watchArticles];

        selectedArticles.forEach(articleId => {
            const existingIndex = currentArticles.findIndex(article => article.id_article === articleId);

            if (existingIndex >= 0) {
                // Update existing article quantity
                const newQuantity = currentArticles[existingIndex].quantite_cmd + (selectedQuantities[articleId] || 1);
                currentArticles[existingIndex] = {
                    ...currentArticles[existingIndex],
                    quantite_cmd: newQuantity
                };
            } else {
                // Add new article
                currentArticles.push({
                    id_article: articleId,
                    quantite_cmd: selectedQuantities[articleId] || 1,
                    quantite_valid: 0,
                    quantite_confr: 0,
                    notes_cmd: '',
                    statut_art_cmd: '67b1670ed3246eb50d70e09c' // Default to PENDING
                });
            }
        });

        setValue('articles', currentArticles);

        // Reset selections
        setSelectedArticles([]);
        setSelectedQuantities({});
        setSearchTerm('');
        setArticleCategory("all");
        setIsDialogOpen(false);
    };

    const handleRemoveArticle = (index: number) => {
        const currentArticles = [...watchArticles];
        currentArticles.splice(index, 1);
        setValue('articles', currentArticles);
    };

    const onSubmit = async (data: Order) => {
        console.log("data", data);

        setIsSubmitting(true);
        try {
            // Validate quantities based on user role
            if (userRole === 'RESPONSABLE') {
                // Ensure all articles have valid validated quantities
                const invalidArticles = data.articles.filter(
                    article => !article.quantite_valid || article.quantite_valid <= 0
                );
                if (invalidArticles.length > 0) {
                    throw new Error('All articles must have valid validated quantities');
                }
            } else if (['CLIENT', 'COLLABORATEUR'].includes(userRole)) {
                // Ensure all articles have valid confirmed quantities
                const invalidArticles = data.articles.filter(
                    article => !article.quantite_confr || article.quantite_confr <= 0
                );
                if (invalidArticles.length > 0) {
                    throw new Error('All articles must have valid confirmed quantities');
                }
            }

            await createOrder(data);
            toast.success('Order created successfully');
            router.push('/dashboard/orders');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderLoading || cmdLinesLoading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-gray-100 text-gray-800';
            case 'VALIDATED':
                return 'bg-blue-100 text-blue-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Determine if user can edit based on role and order status
    const canEdit = () => {
        if (userRole === 'RESPONSABLE') {
            return "67b164ea14c46c093c5f3f74" === order.statut_cmd;
        }
        if (['CLIENT', 'COLLABORATEUR'].includes(userRole)) {
            return order.statut_cmd.description === 'VALIDATED';
        }
        return false;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Duplicate Order #{order._id}</CardTitle>
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Collaborator</label>
                                <Select
                                    defaultValue={order.id_collaborateur}
                                    onValueChange={(value) => setValue('id_collaborateur', value)}
                                    disabled={!canEdit() || isSubmitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select collaborator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {collaborators.map((collaborator) => (
                                            <SelectItem key={collaborator._id} value={collaborator._id}>
                                                {collaborator.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.id_collaborateur && (
                                    <p className="text-sm text-red-500">{errors.id_collaborateur.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client</label>
                                <Select
                                    defaultValue={order.id_client}
                                    onValueChange={(value) => setValue('id_client', value)}
                                    disabled={!canEdit() || isSubmitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client._id} value={client._id}>
                                                {client.nom_prenom_contact}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.id_client && (
                                    <p className="text-sm text-red-500">{errors.id_client.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Order Date</label>
                                <Input
                                    type="date"
                                    defaultValue={new Date(order.date_cmd).toISOString().split('T')[0]}
                                    {...register('date_cmd')}
                                    disabled={!canEdit() || isSubmitting}
                                />
                                {errors.date_cmd && (
                                    <p className="text-sm text-red-500">{errors.date_cmd.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Delivery Date</label>
                                <Input
                                    type="date"
                                    defaultValue={order.date_livraison ? new Date(order.date_livraison).toISOString().split('T')[0] : undefined}
                                    {...register('date_livraison')}
                                    disabled={!canEdit() || isSubmitting}
                                />
                                {errors.date_livraison && (
                                    <p className="text-sm text-red-500">{errors.date_livraison.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {canEdit() && (
                                <div className="flex items-center justify-between">
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add Articles
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Select Articles</DialogTitle>
                                            </DialogHeader>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search articles..."
                                                        className="pl-8"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>

                                                <Select
                                                    value={articleCategory}
                                                    onValueChange={setArticleCategory}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Filter by category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Categories</SelectItem>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[50px]">
                                                                <Checkbox
                                                                    checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                                                                    onCheckedChange={handleSelectAll}
                                                                />
                                                            </TableHead>
                                                            <TableHead>Article</TableHead>
                                                            <TableHead>Quantity</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredArticles.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="text-center py-6">
                                                                    No articles found
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            filteredArticles.map((article) => (
                                                                <TableRow key={article._id}>
                                                                    <TableCell>
                                                                        <Checkbox
                                                                            checked={selectedArticles.includes(article._id)}
                                                                            onCheckedChange={(checked) =>
                                                                                handleArticleSelect(article._id, checked as boolean)
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{article.art_designation}</span>
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {article.art_unite_vente || ''}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {selectedArticles.includes(article._id) && (
                                                                            <div className="flex items-center space-x-2">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    onClick={() => updateArticleQuantity(article._id, -1)}
                                                                                >
                                                                                    <Minus className="h-4 w-4" />
                                                                                </Button>
                                                                                <span className="w-10 text-center">
                                                                                    {selectedQuantities[article._id] || 1}
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    onClick={() => updateArticleQuantity(article._id, 1)}
                                                                                >
                                                                                    <Plus className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            <div className="flex justify-end gap-2 mt-4">
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <Button
                                                    onClick={addSelectedArticlesToOrder}
                                                    disabled={selectedArticles.length === 0}
                                                >
                                                    Add {selectedArticles.length > 0 ? `(${selectedArticles.length})` : ''}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Article</TableHead>
                                            <TableHead>Initial Quantity</TableHead>
                                            {userRole === 'RESPONSABLE' && <TableHead>Validated Quantity</TableHead>}
                                            {['CLIENT', 'COLLABORATEUR'].includes(userRole) && <TableHead>Confirmed Quantity</TableHead>}
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Status</TableHead>
                                            {canEdit() && <TableHead>Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {watchArticles.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6">
                                                    No articles added to order
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            watchArticles.map((line, index) => {
                                                const article = articles.find(a => a._id === line.id_article);
                                                const status = statusArtCmd.find(s => s._id === line.statut_art_cmd)?.description;

                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">
                                                                    {article?.art_designation || 'Unknown Article'}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {article?.art_unite_vente || ''}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                {canEdit() && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => handleQuantityChange(index, -1, 'quantite_cmd')}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <Minus className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <span className="w-12 text-center">
                                                                    {line.quantite_cmd}
                                                                </span>
                                                                {canEdit() && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => handleQuantityChange(index, 1, 'quantite_cmd')}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        {userRole === 'RESPONSABLE' && (
                                                            <TableCell>
                                                                <div className="flex items-center space-x-2">
                                                                    {canEdit() && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => handleQuantityChange(index, -1, 'quantite_valid')}
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            <Minus className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    <span className="w-12 text-center">
                                                                        {line.quantite_valid || 0}
                                                                    </span>
                                                                    {canEdit() && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => handleQuantityChange(index, 1, 'quantite_valid')}
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            <Plus className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                        {['CLIENT', 'COLLABORATEUR'].includes(userRole) && (
                                                            <TableCell>
                                                                <div className="flex items-center space-x-2">
                                                                    {canEdit() && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => handleQuantityChange(index, -1, 'quantite_confr')}
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            <Minus className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    <span className="w-12 text-center">
                                                                        {line.quantite_confr || 0}
                                                                    </span>
                                                                    {canEdit() && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => handleQuantityChange(index, 1, 'quantite_confr')}
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            <Plus className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            <Input
                                                                defaultValue={line.notes_cmd}
                                                                {...register(`articles.${index}.notes_cmd`)}
                                                                disabled={!canEdit() || isSubmitting}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(statusMapArtCmd[line.statut_art_cmd] || 'PENDING')}>
                                                                {status || 'Unknown Status'}
                                                            </Badge>
                                                        </TableCell>
                                                        {canEdit() && (
                                                            <TableCell>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveArticle(index)}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                                defaultValue={order.notes_cmd}
                                {...register('notes_cmd')}
                                disabled={!canEdit() || isSubmitting}
                            />
                            {errors.notes_cmd && (
                                <p className="text-sm text-red-500">{errors.notes_cmd.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            {canEdit() && (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Order'
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}