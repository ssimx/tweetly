import { removeSession, removeSettingsToken } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
    if (req.method === 'DELETE') {
        try {
            await removeSession();
            removeSettingsToken();
            return NextResponse.json({ message: 'Session removed successfully' });
        } catch (error) {
            console.error('Error removing session:', error);
            return NextResponse.json({ error: 'Failed to remove session' }, { status: 500 });
        }
    }
}