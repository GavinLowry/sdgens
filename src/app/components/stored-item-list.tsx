import { ReactNode } from 'react';
import { StoredItem } from '@/app/database/types';

export interface StoredItemListAttrs {
    itemList: StoredItem[];
    onClick(id: number): void;
}

export function StoredItemList({itemList, onClick}: StoredItemListAttrs): ReactNode {
    function renderItem(item: StoredItem): ReactNode {
        return (
            <div
                key={`${item.id}:${item.name}`}
                className="list-item"
                onClick={() => {onClick(item.id)}}
            >
                {item.name}
            </div>
        );
    }

    return (
        <div>
            {
                itemList.map(item => renderItem(item))
            }
        </div>
    );
}