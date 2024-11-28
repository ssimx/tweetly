import { getToken } from "@/lib/session";
import { UserInfo } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function SettingsTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    const token = getToken();
    if (!token) {
        return redirect('/login');
    }

    const response = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return redirect('/logout');
    }

    const userData = await response.json() as UserInfo;

    return (
        <div className=''>
            <div>left div</div>
            <div>{ children }</div>
        </div>
    )
}
