import 'server-only'

import { decryptSession } from '@/lib/session';
import { cache } from 'react';

export const getUserTokenData = cache(async () => {
    return await decryptSession();
});