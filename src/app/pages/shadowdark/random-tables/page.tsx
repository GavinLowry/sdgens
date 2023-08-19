'use client'

import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import {
    RandomTableGroup, SeparateOption,
    monsterGenerator, encounterDisposition, traps, hazards, treasure, magicArmor, magicWeapon, mishap
} from "./data";
import TableRoller from '../utils/table-roller';
import MagicArmorRoller from '../utils/magic-armor-roller';
import MagicWeaponRoller from '../utils/magic-weapon-roller';
import { StashItem, StashType } from '../stash/page';
import { stashTable } from "@/app/database/database.config";

import "./random-tables.css";

function RandomTables () {
    const [groups, setGroups] = useState<RandomTableGroup[]>();
    const [group, setGroup] = useState<RandomTableGroup>();
    const [results, setResults] = useState<StashItem[]>([]);
    const [rollerResult, setRollerResult] = useState<StashItem | undefined>();
    const [selectedTable, setSelectedTable] = useState<string>('');

    useEffect(() => {
        const groups: RandomTableGroup[] = [
            monsterGenerator, encounterDisposition, traps, hazards, treasure, magicArmor, magicWeapon, mishap
        ];
        setGroups(groups);
    }, []);

    function onClickGroup (group: RandomTableGroup) {
        setGroup(group);
        setSelectedTable(group.tables[0].field);
    }

    function onKeepResult () {
        if (!rollerResult) { return; }
        setResults(
            [
                ...results,
                rollerResult
            ]
        )
    }

    function onStashResult (): void {
        if (!rollerResult) { return; }
        stashTable
        .add(rollerResult)
        .then(response => console.log({response}));
    }

    function onClearResults () {
        setResults([])
    }

    function onChangeTable (event: ChangeEvent<HTMLSelectElement>) {
        const { value } = event.target;
        setSelectedTable(value);
    }

    function rollRoller () {
        if (!group) { return; }
        let roller: any;
        if (group.name === "Magic Armor") {
            roller = new MagicArmorRoller();
        }
        else if (group.name === "Magic Weapon") {
            roller = new MagicWeaponRoller();
        } else {
            roller = new TableRoller(group);
        }
        if (showTableSelect()) {
            roller.setSelection(selectedTable);
        }
        const result = roller.rollGroup();
        console.log({group})
        const stashable = {
            type: group.name as StashType,
            data: result as Details,
        }
        setRollerResult(stashable);
    }

    function renderResult(): ReactNode {
        const data = rollerResult?.data || [];
        return (
            <ul className="rt-kept-result">
                {
                    (data as string[]).map((r, index) => (
                        <li key={`${index}:${r}`}>{r}</li>
                    ))
                }
            </ul>
        );
    }

    function showTableSelect (): boolean {
        if (!group || !group.options) { return false; }
        if (!group.options.separate) { return false; }
        return group.options.separate === "select";
    }

    return (
        <div className="rt-main">
            <div>
                <ul>
                    { groups?.map(g => (
                        <li
                            key={g.name}
                            className={`rt-group-entry${g.name === group?.name ? " selected" : ""}`}
                            onClick={() => onClickGroup(g)}
                        >{g.name}</li>
                    )) }
                </ul>
            </div>
            <div>
                <div className="rt-roller-area">
                    { group &&
                        <>
                            { showTableSelect() &&
                                <select
                                    value = {selectedTable}
                                    onChange={onChangeTable}
                                >
                                    {
                                        group.tables.map(t => <option key={t.field}>{t.field}</option>)
                                    }
                                </select>
                            }
                            <button onClick={rollRoller}>roll</button>
                            { (rollerResult?.data as string[] ?? []).length > 0 &&
                                <>
                                    { renderResult() }
                                    <button onClick={onKeepResult}>keep</button>
                                    <button onClick={onStashResult}>stash</button>
                                </>
                            }
                        </>
                    }
                </div>
            </div>
            { results.length > 0 &&
                <div className="rt-kept-area">
                    <button onClick={onClearResults}>clear</button>
                    { results.map((r, rindex) => (
                        <ul key={`result${rindex}`} className="rt-kept-result">
                            {(r.data as string[]).map(rline =>(
                                <li key={rline}>
                                    {rline}
                                </li>
                            ))}
                        </ul>
                    )) }
                </div>
            }
        </div>
    );
}

export type Details = string[];

export default RandomTables;
