import api from '@/lib/axios';
import { z } from 'zod';

export const ArticleSchema = z.object({
  art_id: z.string().min(1, 'Article ID is required'),
  art_designation: z.string().min(1, 'Article designation is required'),
  art_unite_vente: z.string().optional(),
  art_suivi_stock: z.string().optional(),
  art_code_famille: z.string().optional(),
  art_famille: z.string().optional(),
  art_cat_niv_1: z.string().optional(),
  art_cat_niv_2: z.string().optional(),
  art_marque: z.string().optional(),
  art_st: z.string().optional(),
  art_tb: z.string().optional(),
});

export type Article = z.infer<typeof ArticleSchema>;

// Mock data for articles
const mockArticles: Article[] = [
  {
    art_id: '1',
    art_designation: 'Premium Laptop',
    art_unite_vente: 'Piece',
    art_suivi_stock: 'In Stock',
    art_code_famille: 'ELEC',
    art_famille: 'Laptops',
    art_cat_niv_1: 'Electronics',
    art_cat_niv_2: 'Computers',
    art_marque: 'BrandA',
    art_st: 'Available',
    art_tb: 'High-end',
  },
  {
    art_id: '2',
    art_designation: 'Wireless Mouse',
    art_unite_vente: 'Piece',
    art_suivi_stock: 'In Stock',
    art_code_famille: 'ACC',
    art_famille: 'Mice',
    art_cat_niv_1: 'Accessories',
    art_cat_niv_2: 'Peripherals',
    art_marque: 'BrandB',
    art_st: 'Available',
    art_tb: 'Mid-range',
  },
  {
    art_id: '3',
    art_designation: 'External Monitor',
    art_unite_vente: 'Piece',
    art_suivi_stock: 'Out of Stock',
    art_code_famille: 'ELEC',
    art_famille: 'Monitors',
    art_cat_niv_1: 'Electronics',
    art_cat_niv_2: 'Displays',
    art_marque: 'BrandC',
    art_st: 'Unavailable',
    art_tb: 'Premium',
  },
  {
    art_id: '4',
    art_designation: 'USB-C Dock',
    art_unite_vente: 'Piece',
    art_suivi_stock: 'In Stock',
    art_code_famille: 'ACC',
    art_famille: 'Docking Stations',
    art_cat_niv_1: 'Accessories',
    art_cat_niv_2: 'Peripherals',
    art_marque: 'BrandD',
    art_st: 'Available',
    art_tb: 'Standard',
  },
  {
    art_id: '5',
    art_designation: 'Mechanical Keyboard',
    art_unite_vente: 'Piece',
    art_suivi_stock: 'In Stock',
    art_code_famille: 'ACC',
    art_famille: 'Keyboards',
    art_cat_niv_1: 'Accessories',
    art_cat_niv_2: 'Input Devices',
    art_marque: 'BrandE',
    art_st: 'Available',
    art_tb: 'High-end',
  },
  {
    art_id: '6',
    art_designation: 'Wireless Headphones',
    art_unite_vente: 'Piece',
    art_suivi_stock: 'In Stock',
    art_code_famille: 'AUDIO',
    art_famille: 'Headphones',
    art_cat_niv_1: 'Audio',
    art_cat_niv_2: 'Wireless',
    art_marque: 'BrandF',
    art_st: 'Available',
    art_tb: 'Mid-range',
  },
];



export async function getArticles(): Promise<Article[]> {
  // // For demo purposes, return mock data
  // return Promise.resolve(mockArticles);

  try {
    const response = await api.get(`/articles`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for client contact');
    return mockArticles;
  }
}

export async function getArticleByOrderId(orderId: string): Promise<Article[]> {

  try {
    const response = await api.get(`/articles/order/:id`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for client contact');
    return mockArticles;
  }
}

export async function getArticle(id: string): Promise<Article> {
  const article = mockArticles.find(a => a.id === id);
  if (!article) throw new Error('Article not found');
  return Promise.resolve(article);
}