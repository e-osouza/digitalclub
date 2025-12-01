import Image from 'next/image';

export default function Footer() {

    return (
        <div className="footer overflow-hidden bg-[url(/bg-footer.png)] bg-cover bg-center bg-no-repeat">
            <div className="mx-auto max-w-[var(--largura)] px-5 py-6 relative">

                <div className='flex flex-col md:flex-row justify-between items-center z-[1] relative'>
                    <div className="flex justify-center items-center uppercase font-[500] text-[12px] md:text-md text-[var(--verde)]">Dos mesmos criadores do <Image src="/DSX1.png" alt="DSX" width={50} height={50} /></div>
                    <Image
                        src="/logo.svg"
                        alt="Logo Onda"
                        width={200}
                        height={300}
                        priority
                        className='mx-auto w-30 md:w-35 mt-2 md:mt-0 mb-4 md:mb-0'
                    />
                    <div className="text-white text-[12px] md:text-md bg-white/20 rounded-xl px-3 backdrop-blur-lg"><span className="text-[var(--verde)]">1 e 2 | DEZ</span> CC VASCO VASQUES</div>
                </div>

                <div className='absolute bg-[#0C33C6] w-[50%] h-200 blur-[200px] -right-50 top-0'></div>
            </div>
        </div>
    );

}