'use client'

import { ReactNode, useEffect, useState } from "react";
import { stashTable } from "@/app/database/database.config";
import { Monster } from "../monsters/monster-form";
import { Details } from "../random-tables/page";
import { attributeNames } from "../utils/names";
import "./stash.css";

export default function Stash () {
    const [stashList, setStashList] = useState<StashItem[]>([]);

    useEffect(() => {
        updateStashList();
    }, [])

    function updateStashList () {
        stashTable
        .toArray()
        .then((data) => {
            setStashList(data);
        });
    }

    function onRemove (item: StashItem) {
        stashTable
        .delete(item.id as string)
        .then(() => {
            updateStashList();
        })
    }

    function onDuplicate (item: StashItem) {
        const { id, ...dupe } = item;
        stashTable
        .add(dupe)
        .then(() => {
            updateStashList();
        })
    }

    function onMoveUp (item: StashItem): void {
        const tempList = [ ...stashList ];
        const itemIndex = tempList.indexOf(item);
        if (itemIndex === -1 || itemIndex === 0) { return; }
        tempList[itemIndex] = tempList[itemIndex-1];
        tempList[itemIndex-1] = item;
        setStashList(tempList);
    }

    function onMoveDown (item: StashItem): void {
        const tempList = [ ...stashList ];
        const itemIndex = tempList.indexOf(item);
        if (itemIndex === -1 || itemIndex === stashList.length - 1) { return; }
        tempList[itemIndex] = tempList[itemIndex+1];
        tempList[itemIndex+1] = item;
        setStashList(tempList);
    }

    function renderMonsterItem (item: StashItem): ReactNode {
        const data: Monster = item.data as Monster;
        return (
            <>
                <div className="stash-item-type">{item.type}</div>
                <div className="stash-item-content">
                    <div className="stash-data-row">
                        {
                            ["name","level","al","hp","ac","mv"].map(field => (
                                <div key={`${item.id}:${field}`}>
                                    {field === "name" ? "" : `${field}: `}{data[field]}
                                </div>
                            ))
                        }
                    </div>
                    <div className="stash-data-row">
                        {
                            attributeNames.map(an => (
                                <div key={`${item.id}:${an}`}>
                                    {an}: {data[an] ?? "0"}
                                </div>
                            ))
                        }
                    </div>
                    <div>attacks: {data.attacks}</div>
                    { data.extras && <div>extras: {data.extras}</div> }
                </div>
            </>
        );
    }

    function renderTreasureItem (item: StashItem): ReactNode {
        return (
            <>
                <div className="stash-item-type">{item.type}</div>
                <div className="stash-item-content">
                    {
                        (item.data as Details).map(d => (
                            <div className="stash-data-row" key={d}>{d}</div>
                        ))
                    }
                </div>
            </>
        );
    }

    function getItemKey(item: StashItem): string {
        if (item.type === "monster") {
            return `${item.id}:${(item.data as Monster).name}`;
        }
        else {
            return `${item.id}:${(item.data as Details)[0]}`;
        }
    }

    function renderStashItem (item: StashItem, order: string): ReactNode {
        const key = getItemKey(item);
        let itemMarkup: ReactNode = <></>;
        if (item.type === "monster") { itemMarkup = renderMonsterItem(item); }
        else { itemMarkup = renderTreasureItem(item); }
        return (
            <div key={ key } className="stash-item">
                <div className="stash-column">
                    { itemMarkup }
                </div>
                <div className="stash-column stash-right-column">
                    <button onClick={() => onRemove(item)}>X</button>
                    <button onClick={() => onDuplicate(item)}>dup</button>
                    { order !== "first" && <button onClick={() => onMoveUp(item)}>^</button> }
                    { order !== "last" && <button onClick={() => onMoveDown(item)}>v</button>}
                </div>
            </div>
        );
    }

    return (
        <div className="stash-item-list">
            { stashList.map((item, index) => {
                const order = index === 0 ? "first" : index === stashList.length - 1 ? "last" : "";
                return renderStashItem(item, order)
            }) }
        </div>
    );
}

export type StashType = "monster" | "Treasure" | "Magic Armor" | "Magic Weapon";

export interface StashItem {
    id?: string;
    type: StashType;
    data: Monster | Details; // | Treasure | Npc | etc.
}
