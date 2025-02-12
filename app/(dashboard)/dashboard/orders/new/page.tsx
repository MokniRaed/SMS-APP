'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { getClients } from '@/lib/services/clients';
import { getArticles, type Article } from '@/lib/services/articles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Minus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrderLineSchema = z.object({
  articleId: z.string().min(1, 'Article is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
});

const OrderSchema = z.object({
  clientId: z.string(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  lines: z.array(OrderLineSchema).min(1, 'At least one article is required'),
});

type OrderForm = z.infer<typeof OrderSchema>;

type OrderStatus = 'draft' | 'validation' | 'confirmation';

export default function NewOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('validation');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles
  });

  const { register, handleSubmit, formState: { errors }, control, watch } = useForm<OrderForm>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      lines: []
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'lines'
  });

  const watchLines = watch('lines');

  const handleQuantityChange = (index: number, change: number) => {
    const currentQuantity = watchLines[index]?.quantity || 0;
    const newQuantity = Math.max(1, currentQuantity + change);
    update(index, { ...watchLines[index], quantity: newQuantity });
  };

  const onSubmit = async (data: OrderForm) => {
    setIsSubmitting(true);
    try {
      if (orderStatus === 'draft') {
        setOrderStatus('validation');
      } else if (orderStatus === 'validation') {
        setOrderStatus('confirmation');
      } else {
        // Submit final order
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to create order');

        toast.success('Order created successfully');
        router.push('/dashboard/orders');
      }
    } catch (error) {
      toast.error('Failed to process order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {orderStatus === 'draft' ? 'Create New Order' :
             orderStatus === 'validation' ? 'Validate Order' :
             'Confirm Order'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    {...register('date')}
                    disabled={orderStatus === 'confirmation' || isSubmitting}
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Client</label>
                  <Select
                    onValueChange={(value) => register('clientId').onChange({ target: { value } })}
                    disabled={orderStatus === 'confirmation' || isSubmitting}
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
                  {errors.clientId && <p className="text-sm text-red-500">{errors.clientId.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order Notes</label>
                <Textarea
                  {...register('notes')}
                  placeholder="Add any notes about the order"
                  disabled={orderStatus === 'confirmation' || isSubmitting}
                />
              </div>

              {orderStatus === 'draft' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Article</label>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        const article = articles.find(a => a.id === value);
                        setSelectedArticle(article || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select article" />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => {
                        if (selectedArticle) {
                          append({
                            articleId: selectedArticle.id,
                            quantity: 1,
                            notes: ''
                          });
                          setSelectedArticle(null);
                        }
                      }}
                      disabled={!selectedArticle}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Order Lines</label>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const article = articles.find(a => a.id === field.articleId);
                        return (
                          <TableRow key={field.id}>
                            <TableCell>{article?.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {orderStatus !== 'confirmation' && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(index, -1)}
                                    disabled={isSubmitting}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                                <span className="w-12 text-center">
                                  {watchLines[index]?.quantity}
                                </span>
                                {orderStatus !== 'confirmation' && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(index, 1)}
                                    disabled={isSubmitting}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                {...register(`lines.${index}.notes`)}
                                disabled={orderStatus === 'confirmation' || isSubmitting}
                              />
                            </TableCell>
                            <TableCell>
                              {orderStatus !== 'confirmation' && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {errors.lines && <p className="text-sm text-red-500">{errors.lines.message}</p>}
              </div>
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
                    Processing...
                  </>
                ) : orderStatus === 'draft' ? (
                  'Proceed to Validation'
                ) : orderStatus === 'validation' ? (
                  'Proceed to Confirmation'
                ) : (
                  'Confirm Order'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}