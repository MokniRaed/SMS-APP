import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import api from '@/lib/axios';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clientContacts = await api.get('/client-contacts');
    return NextResponse.json(clientContacts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch client contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const clientContact = await api.post('/client-contacts', body);
    return NextResponse.json(clientContact);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create client contact' },
      { status: 500 }
    );
  }
}