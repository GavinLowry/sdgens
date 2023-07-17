import { ReactNode } from "react";
import Link from 'next/link';

import './shadowdark.css'

export default function ShadowdarkLayout({children}: {children: ReactNode}) {
    return (
        <div className="sd-layout">
            <div className="sd-left-nav">
                <Link href="/pages/shadowdark">main</Link>
                <Link href="/pages/shadowdark/maps">maps</Link>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
