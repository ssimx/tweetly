import { removeSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
    if (req.method === 'DELETE') {
        try {
            await removeSession();
            return NextResponse.json({ message: 'Session removed successfully' });
        } catch (error) {
            console.error('Error removing session:', error);
            return NextResponse.json({ error: 'Failed to remove session' }, { status: 500 });
        }
    }
}