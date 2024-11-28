import { redirect } from 'next/navigation'
import React from 'react'

export default function Settings() {
    redirect('/settings/account');
    return (
        <div>

        </div>
    )
}
