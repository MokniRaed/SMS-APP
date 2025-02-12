'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrderSchema, type Order, getOrder, updateOrder } from '@/lib/services/orders';
import { getClients } from '@/lib/services/clients';
import { getArticles } from '@/lib/services/articles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function EditOrderPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: order, isLoading: orderLoading } = useQuery({
        queryKey: ['order', params.id],
        queryFn: () => getOrder(params.id)
    });

    const { data: clients = [] } = useQuery({
        queryKey: ['clients'],
        queryFn: getClients
    });

    const { data: articles = [] } = useQuery({
        queryKey: ['articles'],
        queryFn: getArticles
    });

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Order>({
        resolver: zodResolver(OrderSchema),
        values: order
    });

    const watchLines = watch('lines');

    const handleQuantityChange = (index: number, change: number) => {
        const currentQuantity = watchLines[index]?.quantity || 0;
        const newQuantity = Math.max(1, currentQuantity + change);
        const lines = [...watchLines];
        lines[index] = { ...lines[index], quantity: newQuantity };
        setValue('lines', lines);
    };

    const onSubmit = async (data: Order) => {
        setIsSubmitting(true);
        try {
            await updateOrder(params.id, data);
            toast.success('Order updated successfully');
            router.push('/dashboard/orders');
        } catch (error) {
            toast.error('Failed to update order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderLoading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Order #{order.id}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client</label>
                                <Select
                                    defaultValue={order.clientId}
                                    onValueChange={(value) => setValue('clientId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.clientId && (
                                    <p className="text-sm text-red-500">{errors.clientId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    {...register('date')}
                                    defaultValue={new Date(order.date).toISOString().split('T')[0]}
                                />
                                {errors.date && (
                                    <p className="text-sm text-red-500">{errors.date.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea {...register('notes')} />
                            {errors.notes && (
                                <p className="text-sm text-red-500">{errors.notes.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Order Lines</h3>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const lines = [...watchLines];
                                        lines.push({
                                            id: Math.random().toString(),
                                            articleId: '',
                                            quantity: 1,
                                            status: 'PENDING'
                                        });
                                        setValue('lines', lines);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Line
                                </Button>
                            </div>

                            {watchLines.map((line, index) => (
                                <Card key={line.id}>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Article</label>
                                                <Select
                                                    defaultValue={line.articleId}
                                                    onValueChange={(value) => {
                                                        const lines = [...watchLines];
                                                        lines[index] = { ...lines[index], articleId: value };
                                                        setValue('lines', lines);
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select article" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {articles.map((article) => (
                                                            <SelectItem key={article.id} value={article.id}>
                                                                {article.name} (${article.price})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Quantity</label>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleQuantityChange(index, -1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        {...register(`lines.${index}.quantity`)}
                                                        className="w-20 text-center"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleQuantityChange(index, 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-auto"
                                                        onClick={() => {
                                                            const lines = [...watchLines];
                                                            lines.splice(index, 1);
                                                            setValue('lines', lines);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <label className="text-sm font-medium">Notes</label>
                                            <Input {...register(`lines.${index}.notes`)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Order'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}