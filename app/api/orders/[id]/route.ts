import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import api from '@/lib/axios';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const order = await api.get(`/orders/${params.id}`);
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const order = await api.patch(`/orders/${params.id}`, body);
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await api.delete(`/orders/${params.id}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete order' },
            { status: 500 }
        );
    }
}