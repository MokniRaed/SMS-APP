import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import api from '@/lib/axios';

export async function GET() {
    try {
        const orders = await api.get('/orders');
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const order = await api.post('/orders', body);
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}