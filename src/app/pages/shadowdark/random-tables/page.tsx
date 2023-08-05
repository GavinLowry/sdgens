'use client'

import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import {
    RandomTableGroup, SeparateOption,
    monsterGenerator, encounterDisposition, traps, hazards, treasure, magicArmor
} from "./data";
import TableRoller from '../utils/table-roller';
import MagicArmorRoller from '../utils/magic-armor-roller';

import "./random-tables.css";

function RandomTables () {
    const [groups, setGroups] = useState<RandomTableGroup[]>();
    const [group, setGroup] = useState<RandomTableGroup>();
    const [results, setResults] = useState<string[][]>([]);
    const [rollerResult, setRollerResult] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');

    useEffect(() => {
        const groups: RandomTableGroup[] = [
            monsterGenerator, encounterDisposition, traps, hazards, treasure, magicArmor
        ];
        setGroups(groups);
    }, []);

    function onClickGroup (group: RandomTableGroup) {
        setGroup(group);
        setSelectedTable(group.tables[0].field);
    }

    function onKeepResult () {
        setResults(
            [
                ...results,
                rollerResult
            ]
        )
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
        } else {
            roller = new TableRoller(group);
        }
        if (showTableSelect()) {
            roller.setSelection(selectedTable);
        }
        const result = roller.rollGroup();
        setRollerResult([
            group.name,
            ...result
        ]);
    }

    function renderResult(): ReactNode {
        return (
            <ul className="rt-kept-result">
                {
                    rollerResult?.map(r => (
                        <li key={r}>{r}</li>
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
                            { rollerResult.length > 0 &&
                                <>
                                    { renderResult() }
                                    <button onClick={onKeepResult}>keep</button>
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
                            {r.map(rline =>(
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

export default RandomTables;
