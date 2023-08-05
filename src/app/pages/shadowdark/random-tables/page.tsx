'use client'

import { ReactNode, useEffect, useState } from 'react';
import { RandomTableGroup, monsterGenerator, encounterDisposition, traps, hazards, treasure } from "./data";
import TableRoller from '../utils/table-roller';

import "./random-tables.css";

function RandomTables () {
    const [groups, setGroups] = useState<RandomTableGroup[]>();
    const [group, setGroup] = useState<RandomTableGroup>();
    const [results, setResults] = useState<string[][]>([]);

    const [rollerResult, setRollerResult] = useState<string[]>([]);

    useEffect(() => {
        const groups: RandomTableGroup[] = [
            monsterGenerator, encounterDisposition, traps, hazards, treasure
        ];
        setGroups(groups);
    }, []);

    function onClickGroup (group: RandomTableGroup) {
        setGroup(group);
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

    function rollRoller () {
        if (!group) { return; }
        const roller = new TableRoller(group);
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
