'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/lib/services/orders';
import { getClients } from '@/lib/services/clients';
import { getArticles } from '@/lib/services/articles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Package, User, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();

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

    if (orderLoading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
    };

    const getArticleName = (articleId: string) => {
        const article = articles.find(a => a.id === articleId);
        return article ? `${article.name} ($${article.price})` : 'Unknown Article';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'VALIDATION':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button onClick={() => router.push(`/dashboard/orders/${params.id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Order
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold">Order #{order.id}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Created on {format(new Date(order.createdAt), 'PPP')}
                                </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                                {order.status}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Client</p>
                                    <p className="text-sm text-muted-foreground">
                                        {getClientName(order.clientId)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Order Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(order.date), 'PPP')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Total Amount</p>
                                    <p className="text-sm text-muted-foreground">
                                        ${order.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Notes</h4>
                                <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Lines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.lines.map((line) => (
                                <Card key={line.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <p className="font-medium">
                                                        {getArticleName(line.articleId)}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Quantity: {line.quantity}
                                                </p>
                                                {line.notes && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Note: {line.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={getStatusColor(line.status)}>
                                                {line.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}