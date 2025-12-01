import Image from 'next/image';

export default function Footer() {

    return (
        <div className="relative z-50 overflow-hidden bg-[var(--bgclaro)]">
            <div className="mx-auto max-w-[var(--largura)] p-5 relative">

                <div className='flex justify-center items-center z-[1] relative'>
                    <Image
                        src="/logo3.svg"
                        alt="Digital Club"
                        width={200}
                        height={300}
                        priority
                        className='mx-auto w-25 md:w-30'
                    />
                </div>

            </div>
        </div>
    );

}