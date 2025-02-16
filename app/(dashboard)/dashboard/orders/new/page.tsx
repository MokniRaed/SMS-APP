'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { getUsersByRole } from '@/lib/services/users';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Mock user role - replace with actual auth
const userRole = 'CLIENT';

const OrderLineSchema = z.object({
  id_article: z.string().min(1, 'Article is required'),
  quantite_cmd: z.number().min(1, 'Quantity must be at least 1'),
  notes_cmd: z.string().optional(),
  // statut_art_cmd: z.enum(['PENDING', 'VALIDATED', 'CONFIRMED', 'CANCELLED']),
  statut_art_cmd: z.string()
});

const OrderSchema = z.object({
  id_client: z.string().min(1, 'Client is required'),
  id_collaborateur: z.string().min(1, 'Collaborator is required'),
  date_cmd: z.string().min(1, 'Date is required'),
  notes_cmd: z.string().optional(),
  articles: z.array(OrderLineSchema).min(1, 'At least one article is required'),
});

type OrderForm = z.infer<typeof OrderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
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

  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm<OrderForm>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      date_cmd: new Date().toISOString().split('T')[0],
      articles: []
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'articles'
  });

  const watchArticles = watch('articles');

  const handleQuantityChange = (index: number, change: number) => {
    const currentQuantity = watchArticles[index]?.quantite_cmd || 0;
    const newQuantity = Math.max(1, currentQuantity + change);
    update(index, { ...watchArticles[index], quantite_cmd: newQuantity });
  };

  const handleAddArticle = (article: any) => {
    append({
      id_article: article._id,
      quantite_cmd: quantity,
      notes_cmd: '',
      statut_art_cmd: '67b1670ed3246eb50d70e09c'
    });
    setQuantity(1);
    setOpen(false);
  };

  const onSubmit = async (data: OrderForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          statut_cmd: '67b164ea14c46c093c5f3f74',
          articles: data.articles.map(article => ({
            ...article,
            quantite_valid: 0,
            quantite_confr: 0
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      toast.success('Order created successfully');
      router.push('/dashboard/orders');
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Collaborator</label>
                <Select
                  onValueChange={(value) => setValue('id_collaborateur', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Collaborateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborators.map((collaborator) => (
                      <SelectItem key={collaborator._id} value={collaborator._id}>
                        {collaborator.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_client && (
                  <p className="text-sm text-red-500">{errors.id_client.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select
                  onValueChange={(value) => setValue('id_client', value)}
                  disabled={isSubmitting}
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

            <div className="space-y-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  {...register('date_cmd')}
                  disabled={isSubmitting}
                />
                {errors.date_cmd && (
                  <p className="text-sm text-red-500">{errors.date_cmd.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Notes</label>
              <Textarea
                {...register('notes_cmd')}
                placeholder="Add any notes about the order"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[300px] justify-between"
                    >
                      Select an article...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search articles..." />
                      <CommandEmpty>No article found.</CommandEmpty>
                      <CommandGroup>
                        {articles.map((article) => (
                          <CommandItem
                            key={article._id}
                            value={article.art_designation}
                            onSelect={() => handleAddArticle(article)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                watchArticles.some(line => line.id_article === article._id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{article.art_designation}</span>
                              <span className="text-sm text-muted-foreground">
                                {article.art_prix} - {article.art_categorie}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Quantity:</label>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

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
                      const article = articles.find(a => a._id === field.id_article);
                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{article?.art_designation}</span>
                              <span className="text-sm text-muted-foreground">
                                {article?.art_prix}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(index, -1)}
                                disabled={isSubmitting}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">
                                {watchArticles[index]?.quantite_cmd}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(index, 1)}
                                disabled={isSubmitting}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              {...register(`articles.${index}.notes_cmd`)}
                              disabled={isSubmitting}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {errors.articles && (
                <p className="text-sm text-red-500">{errors.articles.message}</p>
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}