import { ReactNode, useState } from 'react';
import { rollDice } from '@/app/pages/shadowdark/utils/random';
import { TableObject, TableEntry } from "./encounter-table-form";
import { stringToNumArray } from '@/app/pages/shadowdark/utils/table-roller';
import './encounter-table.css';

interface EncounterTableAttrs {
    table: TableObject | undefined;
}

export default function EncounterTable ({table}: EncounterTableAttrs) {
    const [rollResult, setRollResult] = useState<TableEntry | undefined>();
    
    console.log({table})

    if (!table) { return; }
    const { dice, entries, title } = table;

    function renderEntry (entry: TableEntry): ReactNode {
        if (!entry) { return (<div></div>); }
        const { roll, notes, monster } = entry;
        return (
            <div key={`${roll}:${monster?.name}:${notes}`}>
                {roll}: {monster?.name} {notes}
            </div>
        );
    }

    function rollTable () {
        if (!table) { return; }
        const roll = rollDice(table?.dice);
        const entry = table.entries.find(e => stringToNumArray(e.roll).includes(roll));
        setRollResult(entry);
    }

    return (
        <div className="encounter-table">
            <div>{title}</div>
            <div>{dice}</div>
            <div>
                { entries.map(entry => renderEntry(entry)) }
            </div>
            <div>
                <button onClick={rollTable}>roll</button>
            </div>
            { rollResult && <RollResult data={rollResult.monster?.name} />}
        </div>
    );
}

function RollResult({data}: {data: string | undefined}): ReactNode {
    return (
        <div>
            { data ?? '' }
        </div>
    );
}
