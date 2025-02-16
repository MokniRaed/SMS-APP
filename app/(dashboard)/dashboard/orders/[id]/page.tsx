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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getClientContacts } from '@/lib/services/clients';
import { cancelOrder, confirmOrder, deliverOrder, getLineCommandsByOrder, getOrder, validateOrder } from '@/lib/services/orders';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Check, Package, Pencil, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Mock user role - replace with actual auth
const userRole = 'RESPONSABLE';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const { data: order, isLoading: orderLoading } = useQuery({
        queryKey: ['order', params.id],
        queryFn: () => getOrder(params.id)
    });

    const { data: clients = [] } = useQuery({
        queryKey: ['clientContacts'],
        queryFn: getClientContacts
    });

    const { data: cmdLines = [] } = useQuery({
        queryKey: ['cmdLines', params.id],
        queryFn: () => getLineCommandsByOrder(params.id)
    });

    const mutations = {
        validate: useMutation({
            mutationFn: validateOrder,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['order', params.id] });
                toast.success('Order validated successfully');
            }
        }),
        confirm: useMutation({
            mutationFn: confirmOrder,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['order', params.id] });
                toast.success('Order confirmed successfully');
            }
        }),
        deliver: useMutation({
            mutationFn: deliverOrder,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['order', params.id] });
                toast.success('Order marked as delivered');
            }
        }),
        cancel: useMutation({
            mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelOrder(id, reason),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['order', params.id] });
                toast.success('Order cancelled successfully');
                setShowCancelDialog(false);
                setCancelReason('');
            }
        })
    };

    if (orderLoading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c._id === clientId);
        return client ? client.nom_prenom_contact : 'Unknown Client';
    };

    const getArticleName = (articleId: string) => {
        const article = cmdLines.find(a => a.id_article === articleId);
        return article ? article.art_designation : 'Unknown Article';
    };

    // const getArticlePrice = (articleId: string) => {
    //     const article = articles.find(a => a.id === articleId);
    //     return article ? article.price : 0;
    // };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'VALIDATION':
                return 'bg-yellow-100 text-yellow-800';
            case 'VALIDATED':
                return 'bg-blue-100 text-blue-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'DELIVERED':
                return 'bg-purple-100 text-purple-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAction = async (action: 'validate' | 'confirm' | 'deliver' | 'cancel') => {
        try {
            if (action === 'cancel' && !cancelReason) {
                toast.error('Please provide a reason for cancellation');
                return;
            }

            switch (action) {
                case 'validate':
                    await mutations.validate.mutateAsync(params.id);
                    break;
                case 'confirm':
                    await mutations.confirm.mutateAsync(params.id);
                    break;
                case 'deliver':
                    await mutations.deliver.mutateAsync(params.id);
                    break;
                case 'cancel':
                    await mutations.cancel.mutateAsync({ id: params.id, reason: cancelReason });
                    break;
            }
        } catch (error) {
            toast.error(`Failed to ${action} order`);
        }
    };

    // const calculateTotal = () => {
    //     return order?.articles?.reduce((total, line) => {
    //         const price = getArticlePrice(line.id_article);
    //         return total + (price * line.quantite_cmd);
    //     }, 0);
    // };

    const canEdit = () => {
        if (userRole === 'RESPONSABLE') {
            return ['VALIDATION', 'VALIDATED'].includes(order.statut_cmd.description);
        }
        if (['CLIENT', 'COLLABORATEUR'].includes(userRole)) {
            return order.statut_cmd.description === 'VALIDATED';
        }
        return false;
    };

    const renderActionButtons = () => {
        if (userRole === 'RESPONSABLE') {
            switch (order.statut_cmd.description) {
                case 'VALIDATION':
                    return (
                        <Button onClick={() => handleAction('validate')}>
                            <Check className="mr-2 h-4 w-4" />
                            Validate Order
                        </Button>
                    );
                case 'CONFIRMED':
                    return (
                        <div className="space-x-2">
                            <Button onClick={() => handleAction('deliver')}>
                                <Package className="mr-2 h-4 w-4" />
                                Mark as Delivered
                            </Button>
                            <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel Order
                            </Button>
                        </div>
                    );
            }
        } else if (['CLIENT', 'COLLABORATEUR'].includes(userRole) && order.statut_cmd.description === 'VALIDATED') {
            return (
                <Button onClick={() => handleAction('confirm')}>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Order
                </Button>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="space-x-2">
                    {renderActionButtons()}
                    {canEdit() && (
                        <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${params.id}/edit`)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Order
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold">Order #{order._id}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Created on {format(new Date(order.date_cmd), 'PPP')}
                                </p>
                            </div>
                            <Badge className={getStatusColor(order.statut_cmd.description)}>
                                {order.statut_cmd.description}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Client</p>
                                    <p className="text-sm text-muted-foreground">
                                        {getClientName(order.id_client._id)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Order Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(order.date_cmd), 'PPP')}
                                    </p>
                                </div>
                            </div>

                            {order.date_livraison && (
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Delivery Date</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(order.date_livraison), 'PPP')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Total Amount</p>
                                    <p className="text-sm text-muted-foreground">
                                        ${calculateTotal()?.toFixed(2)}
                                    </p>
                                </div>
                            </div> */}
                        </div>

                        {order.notes_cmd && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Notes</h4>
                                <p className="text-sm text-muted-foreground">{order.notes_cmd}</p>
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
                            {cmdLines?.map((line, index) => {
                                return (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {line.id_article.art_designation}
                                                    </p>
                                                    {/* <p className="text-sm text-muted-foreground">
                                                            ${article.price} × {line.quantite_cmd} = ${(article.price * line.quantite_cmd).toFixed(2)}
                                                        </p> */}
                                                    {line.notes_cmd && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Note: {line.notes_cmd}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge className={getStatusColor(line.statut_art_cmd)}>
                                                    {line.statut_art_cmd.description}
                                                </Badge>
                                            </div>
                                            {line.quantite_cmd > 0 && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    Demand Quantity: {line.quantite_cmd}
                                                </div>
                                            )}
                                            {line.quantite_valid > 0 && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    Validated Quantity: {line.quantite_valid}
                                                </div>
                                            )}
                                            {line.quantite_confr > 0 && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    Confirmed Quantity: {line.quantite_confr}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for cancelling this order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCancelReason('')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleAction('cancel')}
                            disabled={!cancelReason}
                        >
                            Confirm Cancellation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}