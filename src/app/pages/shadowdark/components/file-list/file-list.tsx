import './file-list.css';

interface FileListEntry {
    name: string;
    id: string;
}

interface FileListAttrs {
    entries: FileListEntry[];
    onClick(entry: string): void;
}

export default function FileList ({entries, onClick}: FileListAttrs) {
    return (
        <div className="fl-list">
            { entries.map(entry => (
                <div onClick={() => onClick(entry.id)} className="list-item">
                    {entry.name}
                </div>
            )) }
        </div>
    );
}
