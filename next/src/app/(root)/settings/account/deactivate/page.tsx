import AccountDeactivate from '@/components/settings/AccountDeactivate';
import SettingsLogin from '@/components/settings/SettingsLogin';
import { getSettingsToken, verifySettingsToken } from '@/lib/session';
import React from 'react'

export default async function SettingsAccountDeactivate() {
    // check for settings token, if not valid ask for password and store the token
    const token = await getSettingsToken();
    const isAuth = await verifySettingsToken(token).then(res => res.isAuth);

    if (!isAuth) return (
        <div>
            <SettingsLogin />
        </div>
    )

    return (
        <AccountDeactivate />
    )
}
