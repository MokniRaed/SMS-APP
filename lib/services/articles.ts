import { z } from 'zod';
import api from '@/lib/axios';

export const ArticleSchema = z.object({
  id: z.string().min(1, 'Article ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be positive'),
  category: z.string().optional(),
});

export type Article = z.infer<typeof ArticleSchema>;

// Mock data for articles
const mockArticles: Article[] = [
  {
    id: '1',
    name: 'Premium Laptop',
    description: '15" High-performance laptop with SSD',
    price: 1299.99,
    stock: 50,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with long battery life',
    price: 49.99,
    stock: 200,
    category: 'Accessories',
  },
  {
    id: '3',
    name: 'External Monitor',
    description: '27" 4K Ultra HD Monitor',
    price: 399.99,
    stock: 75,
    category: 'Electronics',
  },
  {
    id: '4',
    name: 'USB-C Dock',
    description: 'Universal docking station with multiple ports',
    price: 129.99,
    stock: 100,
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches',
    price: 149.99,
    stock: 150,
    category: 'Accessories',
  },
  {
    id: '6',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling Bluetooth headphones',
    price: 199.99,
    stock: 120,
    category: 'Audio',
  },
];

export async function getArticles(): Promise<Article[]> {
  // For demo purposes, return mock data
  return Promise.resolve(mockArticles);
}

export async function getArticle(id: string): Promise<Article> {
  const article = mockArticles.find(a => a.id === id);
  if (!article) throw new Error('Article not found');
  return Promise.resolve(article);
}