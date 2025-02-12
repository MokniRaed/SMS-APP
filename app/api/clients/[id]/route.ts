import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import api from '@/lib/axios';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clientContact = await api.get(`/client-contacts/${params.id}`);
    return NextResponse.json(clientContact);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch client contact' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const clientContact = await api.patch(`/client-contacts/${params.id}`, body);
    return NextResponse.json(clientContact);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update client contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await api.delete(`/client-contacts/${params.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete client contact' },
      { status: 500 }
    );
  }
}