import ChangeBirthday from '@/components/settings/ChangeBirthday';
import SettingsLogin from '@/components/settings/SettingsLogin';
import { verifyCurrentUserSettingsToken } from '@/data-acess-layer/auth';
import React from 'react'

export default async function SettingsAccountBirthday() {
    // check for settings token, if not valid ask for password and store the token
    const isAuth = await verifyCurrentUserSettingsToken();

    if (!isAuth) return (
        <div>
            <SettingsLogin />
        </div>
    )

    return (
        <ChangeBirthday />
    )
}
