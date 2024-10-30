

export default function MessageStatus({ status }: { status: string }) {
    return (
        <p className='mt-1 mr-3 text-end text-dark-500 text-14'>
            {status === 'sending' ? 'Sending' : 'seen'}
        </p>
    );
}