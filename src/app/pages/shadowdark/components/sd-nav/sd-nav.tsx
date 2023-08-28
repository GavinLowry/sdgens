import { ReactNode, useState } from 'react';
import Link from 'next/link';
import './sd-nav.css';

export default function SdNav () {
    const [openCategory, setOpenCategory] = useState<string | undefined>();

    function onClickCategory (title: string) {
        if (title === openCategory) { setOpenCategory(undefined); }
        else { setOpenCategory(title); }
    }

    return (
        <div className="sdn-column">
            { links.map(l => <CategoryDisplay key={l.title} category={l} onClick={onClickCategory} openCategory={openCategory} /> )}
        </div>
    );
}

interface LinkEntry {
    title: string;
    href?: string;
    links?: LinkEntry[];
}

const links: LinkEntry[] = [
    { title: "Shadowdark", href:"/pages/shadowdark" },
    { title: "setup", links: [
        { title:  "projects", href: "/pages/shadowdark/projects" },
        { title: "monsters", href: "/pages/shadowdark/monsters" },
    ] },
    { title: "generators", links: [
        { title: "random tables", href: "/pages/shadowdark/random-tables" },
        { title: "npcs", href: "/pages/shadowdark/npcs" },
        { title: "characters", href: "/pages/shadowdark/characters" },
        { title: "dark maps", href: "/pages/shadowdark/maps" },
        { title: "land maps", href: "/pages/shadowdark/land-maps" },
        { title: "encounter tables", href: "/pages/shadowdark/custom-encounter-table" },
    ] },
    {
        title: "in-game tools", links: [
            { title: "stash", href: "/pages/shadowdark/stash" },
            { title: "walk", href: "/pages/shadowdark/walk" },
        ]
    },
];

interface CategoryDisplayAttrs {
    category: LinkEntry,
    onClick(title: string): void,
    openCategory: string | undefined,
}

function CategoryDisplay ({category, onClick, openCategory}: CategoryDisplayAttrs): ReactNode {
    return (
        <>
            {
                category.href
                ?
                <Link className="sdn-category" href={category.href}>{category.title}</Link>
                :
                <div className="sdn-category" onClick={() => onClick(category.title)}>{category.title}</div>
            }
            {
                openCategory === category.title && category.links &&
                category.links.map(l => <LinkDisplay link={l} key={l.title} />)

            }
        </>
    );
}

function LinkDisplay ({link}: {link: LinkEntry}): ReactNode {
    if (!link.href) { return <></>; }
    return (
        <div className="sdn-link">
            <Link href={link.href}>{link.title}</Link>
        </div>
    );
}