import { z } from 'zod';
import api from '@/lib/axios';

export const OrderLineSchema = z.object({
  id: z.string(),
  articleId: z.string(),
  quantity: z.number().min(1),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'VALIDATED', 'CONFIRMED', 'CANCELLED']),
});

export const OrderSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  date: z.string(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'VALIDATION', 'CONFIRMED', 'CANCELLED']),
  lines: z.array(OrderLineSchema),
  totalAmount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OrderLine = z.infer<typeof OrderLineSchema>;
export type Order = z.infer<typeof OrderSchema>;

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: '1',
    clientId: '1',
    date: '2024-03-20',
    notes: 'Priority delivery requested',
    status: 'CONFIRMED',
    lines: [
      {
        id: '1',
        articleId: '1',
        quantity: 2,
        status: 'CONFIRMED',
        notes: 'Special configuration needed'
      },
      {
        id: '2',
        articleId: '2',
        quantity: 5,
        status: 'CONFIRMED',
      }
    ],
    totalAmount: 2799.93,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z'
  },
  {
    id: '2',
    clientId: '2',
    date: '2024-03-21',
    status: 'VALIDATION',
    lines: [
      {
        id: '3',
        articleId: '3',
        quantity: 1,
        status: 'PENDING',
      },
      {
        id: '4',
        articleId: '4',
        quantity: 3,
        status: 'PENDING',
      }
    ],
    totalAmount: 789.96,
    createdAt: '2024-03-21T09:15:00Z',
    updatedAt: '2024-03-21T09:15:00Z'
  },
  {
    id: '3',
    clientId: '3',
    date: '2024-03-22',
    notes: 'Bulk order discount applied',
    status: 'DRAFT',
    lines: [
      {
        id: '5',
        articleId: '5',
        quantity: 10,
        status: 'PENDING',
      },
      {
        id: '6',
        articleId: '6',
        quantity: 8,
        status: 'PENDING',
        notes: 'Check stock availability'
      }
    ],
    totalAmount: 3099.82,
    createdAt: '2024-03-22T11:45:00Z',
    updatedAt: '2024-03-22T11:45:00Z'
  }
];

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await api.get('/api/orders');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for orders');
    return mockOrders;
  }
}

export async function getOrder(id: string): Promise<Order> {
  try {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for order');
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  try {
    const response = await api.post('/api/orders', order);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create order');
    return {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order> {
  try {
    const response = await api.patch(`/api/orders/${id}`, order);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for update order');
    const existingOrder = await getOrder(id);
    return {
      ...existingOrder,
      ...order,
      updatedAt: new Date().toISOString()
    };
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    await api.delete(`/api/orders/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete order');
    return Promise.resolve();
  }
}