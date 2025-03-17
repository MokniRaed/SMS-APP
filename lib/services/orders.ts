import api from '@/lib/axios';
import { z } from 'zod';

export const OrderLineSchema = z.object({
  id_article: z.string().min(1, 'Article is required'),
  quantite_cmd: z.number().min(1, 'Quantity must be at least 1'),
  quantite_valid: z.number().optional(),
  quantite_confr: z.number().optional(),
  statut_art_cmd: z.string(),
  notes_cmd: z.string().optional(),
});

export const OrderSchema = z.object({
  _id: z.string().optional(),
  date_cmd: z.string().min(1, 'Date is required'),
  id_client: z.string().min(1, 'Client is required'),
  id_collaborateur: z.string().min(1, 'Collaborator is required'),
  statut_cmd: z.string(),
  date_livraison: z.string().optional(),
  notes_cmd: z.string().optional(),
  articles: z.array(OrderLineSchema).min(1, 'At least one article is required'),
});

export type OrderLine = z.infer<typeof OrderLineSchema>;
export type Order = z.infer<typeof OrderSchema>;

// Order status transition functions
export async function validateOrder(id: string): Promise<Order> {
  try {
    const response = await api.post(`/api/orders/${id}/validate`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to validate order');
  }
}

export async function confirmOrder(id: string): Promise<Order> {
  try {
    const response = await api.post(`/api/orders/${id}/confirm`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to confirm order');
  }
}

export async function deliverOrder(id: string): Promise<Order> {
  try {
    const response = await api.post(`/api/orders/${id}/deliver`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to mark order as delivered');
  }
}

export async function cancelOrder(id: string, reason: string): Promise<Order> {
  try {
    const response = await api.post(`/api/orders/${id}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw new Error('Failed to cancel order');
  }
}

// Base CRUD operations
export async function getOrders(clientId?: string, collaboratorId?: string): Promise<Order[]> {
  try {
    const response = await api.get('/orders', {
      params: {
        id_client: clientId,
        id_collaborateur: collaboratorId,
      },
    });
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for orders');
    return [];
  }


}

export async function getLineCommandsByOrder(id: string): Promise<OrderLine[]> {
  try {
    const response = await api.get(`/orders/cmd/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for order');

  }
}
export async function getAllStatusArtCmd(): Promise<any[]> {
  try {
    const response = await api.get(`/orders/statutartcmds`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for article command status');

  }
}

export async function getAllStatusCmd(): Promise<any[]> {
  try {
    const response = await api.get(`/orders/statutcmds`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for article command status');

  }
}


export async function getOrder(id: string): Promise<Order> {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for order');
    const order = mockOrders.find(o => o._id === id);
    if (!order) throw new Error('Order not found');
    return order;
  }
}

export async function createOrder(order: Omit<Order, '_id'>): Promise<Order> {
  try {
    const response = await api.post('/orders', {
      ...order,
      articles: order.articles.map(article => ({
        ...article,
      }))
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create order');
  }
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order> {
  try {
    const response = await api.patch(`/orders/validate/${id}`, order);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update order');
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    await api.delete(`/orders/${id}`);
  } catch (error) {
    throw new Error('Failed to delete order');
  }
}

// Helper functions
export function canEditOrder(userRole: string, orderStatus: string): boolean {
  if (userRole === 'RESPONSABLE') {
    return ['VALIDATION', 'VALIDATED'].includes(orderStatus);
  }
  if (['CLIENT', 'COLLABORATEUR'].includes(userRole)) {
    return orderStatus === 'VALIDATED';
  }
  return false;
}

export function canConfirmOrder(userRole: string, orderStatus: string): boolean {
  return ['CLIENT', 'COLLABORATEUR'].includes(userRole) && orderStatus === 'VALIDATED';
}

export function canValidateOrder(userRole: string, orderStatus: string): boolean {
  return userRole === 'RESPONSABLE' && orderStatus === 'VALIDATION';
}

export function canDeliverOrder(userRole: string, orderStatus: string): boolean {
  return userRole === 'RESPONSABLE' && orderStatus === 'CONFIRMED';
}

export function canCancelOrder(userRole: string, orderStatus: string): boolean {
  return userRole === 'RESPONSABLE' && ['VALIDATED', 'CONFIRMED'].includes(orderStatus);
}

// Mock data for development
const mockOrders: Order[] = [
  {
    _id: '1',
    date_cmd: '2024-03-20',
    id_client: 'client1',
    id_collaborateur: 'collab1',
    statut_cmd: 'CONFIRMED',
    date_livraison: '2024-03-25',
    notes_cmd: 'Priority delivery requested',
    articles: [
      {
        id_article: 'art1',
        quantite_cmd: 2,
        quantite_valid: 2,
        quantite_confr: 2,
        statut_art_cmd: 'CONFIRMED',
        notes_cmd: 'Special configuration needed'
      },
      {
        id_article: 'art2',
        quantite_cmd: 5,
        quantite_valid: 5,
        quantite_confr: 5,
        statut_art_cmd: 'CONFIRMED'
      }
    ]
  }
];
