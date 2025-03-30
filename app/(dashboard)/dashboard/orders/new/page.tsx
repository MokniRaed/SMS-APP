'use client';

import AdvancedArticleFilter from '@/components/AdvancedArticleFilter ';
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
import { getUsersByRole } from '@/lib/services/users';
import { getUserFromLocalStorage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';



const OrderLineSchema = z.object({
  id_article: z.string().min(1, 'Article is required'),
  quantite_cmd: z.number().min(1, 'Quantity must be at least 1'),
  quantite_valid: z.number().default(0),
  quantite_confr: z.number().default(0),
  notes_cmd: z.string().optional(),
  statut_art_cmd: z.string()
});

const OrderSchema = z.object({
  id_client: z.string().min(1, 'Client is required'),
  id_collaborateur: z.string().optional(),
  date_cmd: z.string().min(1, 'Date is required'),
  notes_cmd: z.string().optional(),
  articles: z.array(OrderLineSchema).min(1, 'At least one article is required'),
});

type OrderForm = z.infer<typeof OrderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [articleCategory, setArticleCategory] = useState<string>("all");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const { user } = getUserFromLocalStorage() ?? {};
  const userRole = user?.role ?? '';

  const handleFilterChange = (filtered: any) => {
    setFilteredArticles(filtered);
  };
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

  // Get unique categories for filtering
  const categories = [...new Set(articles.map(article => article.art_categorie))];

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

  // const filteredArticles = articles.filter(article => {
  //   const matchesSearch = article.art_designation.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesCategory = articleCategory === "all" || article.art_categorie === articleCategory;
  //   return matchesSearch && matchesCategory;
  // });

  const handleQuantityChange = (index: number, change: number) => {
    const currentQuantity = watchArticles[index]?.quantite_cmd || 0;
    const newQuantity = Math.max(1, currentQuantity + change);
    update(index, { ...watchArticles[index], quantite_cmd: newQuantity });
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

  const addSelectedArticlesToOrder = () => {
    selectedArticles.forEach(articleId => {
      const existingIndex = fields.findIndex(field => field.id_article === articleId);

      if (existingIndex >= 0) {
        // Update existing article
        const newQuantity = watchArticles[existingIndex].quantite_cmd + (selectedQuantities[articleId] || 1);
        update(existingIndex, {
          ...watchArticles[existingIndex],
          quantite_cmd: newQuantity
        });
      } else {
        // Add new article
        append({
          id_article: articleId,
          quantite_cmd: selectedQuantities[articleId] || 1,
          quantite_valid: 0,
          quantite_confr: 0,
          notes_cmd: '',
          statut_art_cmd: '67b1670ed3246eb50d70e09c'
        });
      }
    });

    // Reset selections
    setSelectedArticles([]);
    setSelectedQuantities({});
    setSearchTerm('');
    setArticleCategory("all");
    setIsDialogOpen(false);
  };

  const onSubmit = async (data: OrderForm) => {

    if (userRole !== 'client' && (!data.id_collaborateur || data.id_collaborateur.length === 0)) {
      toast.error('Collaborator is required');
      setIsSubmitting(false);
      return;
    }

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
            quantite_valid: article.quantite_valid || 0,
            quantite_confr: article.quantite_confr || 0
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

  // Get status label
  const getStatusLabel = (statusId: string) => {
    switch (statusId) {
      case '67b1670ed3246eb50d70e09c':
        return 'Pending';
      case '67b1672ed3246eb50d70e09d':
        return 'Validated';
      case '67b1674ad3246eb50d70e09e':
        return 'Confirmed';
      case '67b1676dd3246eb50d70e09f':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userRole !== 'client' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collaborator</label>
                  {userRole === "collaborateur" ? (
                    <>
                      <p className="text-sm">{user?.username} (me)</p>
                      <Input
                        type="hidden"
                        {...register("id_collaborateur")}
                        defaultValue={user?.id}
                      />
                    </>
                  ) : (
                    <>
                      <Select
                        onValueChange={(value) =>
                          setValue("id_collaborateur", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select collaborator" />
                        </SelectTrigger>
                        <SelectContent>
                          {collaborators.map((collab, index) => (
                            <SelectItem key={index} value={collab._id}>
                              {collab.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  {errors.id_collaborateur && (
                    <p className="text-sm text-red-500">{errors.id_collaborateur.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                {userRole === 'client' ? (
                  <>
                    <p className="text-sm">{user?.clientId}</p>
                    <Input type="hidden" {...register('id_client')} defaultValue={user?.clientId} />
                  </>
                ) : (
                  <Select
                    onValueChange={(value) => setValue('id_client', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.data?.map((client) => (
                        <SelectItem key={client._id} value={client.id_client}>
                          {client.nom_prenom_contact}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Articles
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl">
                    <DialogHeader>
                      <DialogTitle>Select Articles</DialogTitle>
                    </DialogHeader>
                    <AdvancedArticleFilter
                      articles={articles}
                      onFilterChange={handleFilterChange}
                    />
                    {/* <div className="grid grid-cols-2 gap-4 mb-4">
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
                    </div> */}

                    <div className="border rounded-md" style={{ overflowY: 'auto', maxHeight: '60vh' }}>

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
                            {/* <TableHead>Category</TableHead> */}
                            {/* <TableHead>Price</TableHead> */}
                            <TableHead>Marque</TableHead>
                            <TableHead>Famille</TableHead>
                            <TableHead>Niveau 1</TableHead>
                            <TableHead>Niveau 2</TableHead>
                            <TableHead>Societé</TableHead>

                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredArticles.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6">
                                No articles found
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              {filteredArticles.map((article) => (
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
                                    <div className="font-medium">{article.art_designation}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{article.art_marque}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{article.art_code_famille}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{article.art_cat_niv_1}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{article.art_cat_niv_2}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{article.art_st}</div>
                                  </TableCell>
                                  {/* <TableCell>{article.art_categorie}</TableCell> */}
                                  {/* <TableCell>{article.art_prix}</TableCell> */}
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

                              ))}
                              {userRole == "admin" && <TableRow>
                                <TableCell colSpan={9} className="py-4 bg-gray-50 dark:bg-gray-800">
                                  <div className="flex justify-end">
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                          <Plus className="h-4 w-4" />
                                          Add More Articles
                                        </Button>
                                      </DialogTrigger>
                                    </Dialog>
                                  </div>
                                </TableCell>
                              </TableRow>}
                            </>
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      {/* <TableHead>Category</TableHead> */}
                      {/* <TableHead>Price</TableHead> */}
                      <TableHead>Initial Quantity</TableHead>
                      {/* {userRole === 'admin' && <TableHead>Validated</TableHead>} */}
                      {/* {watchArticles.length > 0 && watchArticles[0]?.quantite_valid > 0 && <TableHead>Confirmed</TableHead>} */}
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-12">
                          <div className="flex flex-col items-center justify-center gap-4 p-4">
                            <p className="text-gray-500 dark:text-gray-400">No articles added to order</p>
                            {<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button variant="default" className="gap-2">
                                  <Plus className="h-4 w-4" />
                                  Add Articles
                                </Button>
                              </DialogTrigger>
                            </Dialog>}
                          </div>
                        </TableCell>
                      </TableRow>

                    ) : (
                      fields.map((field, index) => {
                        const article = articles.find(a => a._id === field.id_article);
                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <div className="font-medium">{article?.art_designation}</div>
                            </TableCell>
                            {/* <TableCell>{article?.art_categorie}</TableCell> */}
                            {/* <TableCell>{article?.art_prix}</TableCell> */}
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
                                <span className="w-10 text-center">
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
                            {/* {userRole === 'admin' && (
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  {...register(`articles.${index}.quantite_valid`, {
                                    valueAsNumber: true
                                  })}
                                  disabled={isSubmitting}
                                  className="w-20"
                                />
                              </TableCell>
                            )} */}
                            {/* {watchArticles[index]?.quantite_valid > 0 && (
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  {...register(`articles.${index}.quantite_confr`, {
                                    valueAsNumber: true
                                  })}
                                  disabled={isSubmitting}
                                  className="w-20"
                                />
                              </TableCell>
                            )} */}
                            <TableCell>
                              <Input
                                {...register(`articles.${index}.notes_cmd`)}
                                disabled={isSubmitting}
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                defaultValue={field.statut_art_cmd}
                                onValueChange={(value) => {
                                  update(index, { ...watchArticles[index], statut_art_cmd: value })
                                }}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="67b1670ed3246eb50d70e09c">Pending</SelectItem>
                                  <SelectItem value="67b1672ed3246eb50d70e09d">Validated</SelectItem>
                                  <SelectItem value="67b1674ad3246eb50d70e09e">Confirmed</SelectItem>
                                  <SelectItem value="67b1676dd3246eb50d70e09f">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
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
                      })
                    )}
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
