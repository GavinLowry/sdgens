import { ReactNode } from "react";
import Link from 'next/link';

import './shadowdark.css'

export default function ShadowdarkLayout({children}: {children: ReactNode}) {
    return (
        <div className="sd-layout">
            <div className="sd-left-nav">
                <div>
                    <Link href="/pages/shadowdark">main</Link>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
