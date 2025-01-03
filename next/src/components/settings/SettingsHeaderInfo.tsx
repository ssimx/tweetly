
export default function SettingsHeaderInfo({ header, desc }: { header: string, desc?: string }) {
    return (
        <div className='flex flex-col gap-y-1 px-4 mb-3'>
            <h2 className='text-18 font-semibold'>{header}</h2>
            {desc && (
                <p className='text-14 text-gray-500'>
                    {desc}
                </p>
            )}
        </div>
    )
}
