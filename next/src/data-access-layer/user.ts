import 'server-only'

import { verifySession } from '@/lib/session';
import { cache } from 'react';

export const getUser = cache(async () => {
    const session = await verifySession();
    return session;
});