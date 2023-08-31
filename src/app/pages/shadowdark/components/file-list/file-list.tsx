import './file-list.css';

export interface FileListEntry {
    name?: string;
    id?: string;
    [x: string]: string | undefined | unknown;
}

interface FileListAttrs {
    entries: FileListEntry[];
    onClick(entry?: string): void;
}

export default function FileList ({entries, onClick}: FileListAttrs) {
    return (
        <div className="fl-list">
            { entries.map(entry => (
                <div onClick={() => onClick(entry.id)} className="list-item" key={entry.id}>
                    {entry.name}
                </div>
            )) }
        </div>
    );
}
