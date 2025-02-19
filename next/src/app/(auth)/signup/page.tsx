import { getTemporaryUser } from '@/data-acess-layer/user-dto';
import SignUpProcess from '@/components/signup/SignUpProcess';

export default async function SignUp() {
    const response = await getTemporaryUser();

    return (
        <SignUpProcess user={response.success ? response.data.user : null} />
    )
};