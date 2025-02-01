import ChangeUsername from '@/components/settings/ChangeUsername';
import SettingsLogin from '@/components/settings/SettingsLogin';
import { verifyCurrentUserSettingsToken } from '@/data-acess-layer/auth';
import React from 'react'

export default async function SettingsAccountUsername() {
    // check for settings token, if not valid ask for password and store the token
    const isAuth = await verifyCurrentUserSettingsToken();

    if (!isAuth) return (
        <div>
            <SettingsLogin />
        </div>
    )

    return (
        <ChangeUsername />
    )
}
