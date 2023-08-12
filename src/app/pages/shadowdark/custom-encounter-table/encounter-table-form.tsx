'use client'

import { ChangeEvent, useEffect, useState } from 'react';
import MonsterList from '../components/monster-list/monster-list';
import { FormFields } from '../monsters/monster-form';
import { stringToNumArray } from '../utils/table-roller';
import { dieStringToDiceObject, DiceObject } from '../utils/random';
import "./encounter-table-form.css";

function EncounterTableForm () {
    const [entries, setEntries] = useState<TableEntry[]>([]);
    const [diceValue, setDiceValue] = useState<string>('');
    const [titleValue, setTitleValue] = useState<string>("");
    const [selectMonsterFor, setSelectMonsterFor] = useState<number>(-1);
    const [errorList, setErrorList] = useState<ErrorEntry[]>([
        {id: "title", message: "Title needed", show: false},
        {id: "dice", message: "Dice needed", show: false},
        {id: "roll", message: "Not all items have \"roll\" entries", show: false},
        {id: "duplicate", message: "Duplicate die rolls", show: false},
        {id: "empty", message: "Each entry should have monster or notes", show: false},
        {id: "cover", message: "Not all possible die rolls are covered", show: false},
    ]);

    useEffect(() => {
        validateTable();
    }, [entries, diceValue, titleValue])

    function onClickMonsterList (monster: FormFields) {
        const editEntries = [ ...entries ];
        editEntries[selectMonsterFor].monster = monster;
        setEntries(editEntries);
        setSelectMonsterFor(-1);
    }

    function onChangeDice (event: ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;
        setDiceValue(value);
    }

    function onChangeTitle (event: ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;
        setTitleValue(value);
    }

    function onChangeRoll (event: ChangeEvent<HTMLInputElement>, index: number) {
        const { value } = event.target;
        const editEntries = [ ...entries ];
        editEntries[index].roll = value;
        setEntries(editEntries);
    }

    function onChangeNotes (event: ChangeEvent<HTMLTextAreaElement>, index: number) {
        const { value } = event.target;
        const editEntries = [ ...entries ];
        editEntries[index].notes = value;
        setEntries(editEntries);
    }

    function addEntry () {
        const entry = {roll:"", notes: ""};
        setEntries([
            ...entries,
            entry
        ]);
    }

    function openMonsterList (entryIndex: number) {
        setSelectMonsterFor(entryIndex);
    }

    function validateTable () {
        const editErrorList = [ ...errorList ];
        editErrorList.forEach(entry => {
            switch (entry.id) {
                case "title": entry.show = !titleValue; break;
                case "dice": entry.show = validateDice(); break;
                case "roll": entry.show = validateRoll(); break;
                case "duplicate": entry.show = validateDuplicate(); break;
                case "empty": entry.show = validateEmpty(); break;
                case "cover": entry.show = validateDiceCoverage(); break;
            }
        })
        setErrorList(editErrorList);
    }

    function validateDice (): boolean {
        if (!diceValue) { return true; }
        const diceObject: DiceObject = dieStringToDiceObject(diceValue);
        if (!diceObject.count || !diceObject.size) { return true; }
        return false;
    }

    function validateDiceCoverage (): boolean {
        const diceObject: DiceObject = dieStringToDiceObject(diceValue);
        let rolls = [];
        for (let i=diceObject.count; i<=diceObject.count * diceObject.size; ++i) {
            rolls.push(i);
        }
        for (let entry of entries) {
            const entryRolls = stringToNumArray(entry.roll);
            for (let entryRoll of entryRolls) {
                const index = rolls.indexOf(entryRoll);
                if (index > -1) {
                    rolls.splice(index,1);
                }
            }
        }
        return rolls.length > 0;
    }

    function validateRoll (): boolean {
        const noRoll = entries.filter(entry => !entry.roll);
        return noRoll.length > 0;
    }

    function validateDuplicate (): boolean {
        let numeric: number[] = [];
        for (let entry of entries) {
            const entryRolls = stringToNumArray(entry.roll);
            numeric = [
                ...numeric,
                ...entryRolls
            ];
        }
        for (let roll of numeric) {
            const found = numeric.filter(r => r === roll);
            if (found.length > 1) { return true; }
        }
        return false;
    }

    function validateEmpty (): boolean {
        for (let entry of entries) {
            if (!entry.monster && !entry.notes) { return true; }
        }
        return false;
    }

    function renderErrors () {
        return errorList
        .filter(entry => entry.show)
        .map(entry => <div key={entry.message}>{entry.message}</div>);
    }

    function renderTableLine (index: number) {
        const entry = entries[index];

        return (
            <div className="etf-list-entry" key={`entry${index}`}>
                <input
                    name={`roll-${index}`}
                    placeholder="roll"
                    onChange={(event) => onChangeRoll(event, index)}
                    value={entries[index].roll}
                />
                <button
                    onClick={() => openMonsterList(index)}
                    disabled={
                        selectMonsterFor > -1 && selectMonsterFor !== index
                    }
                >
                    { entry.monster ? entry.monster.name : "?" }
                </button>
                <textarea
                    onChange={(event) => onChangeNotes(event, index)}
                    value={entries[index].notes}
                />
            </div>
        );
    }

    return (
        <div>
            <div>
                encounter table form
            </div>
            <div className="etf-form">
                <div>
                    <label htmlFor="title">title</label>
                    <input name="title" onChange={onChangeTitle} value={titleValue} />
                </div>
                <div>
                    <label htmlFor="die">dice</label>
                    <input name="die" onChange={onChangeDice} value={diceValue} />
                </div>
                <button onClick={addEntry}>add entry</button>
                <div className="etf-list">
                    {
                        entries.map((_, index) => renderTableLine(index))
                    }
                </div>
                <div className="etf-errors">{ renderErrors() }</div>
            </div>
            { selectMonsterFor > -1 && <MonsterList onClick={onClickMonsterList} /> }
        </div>
    );
}

interface TableEntry {
    roll: string;
    monster?: FormFields;
    notes: string;
}

interface ErrorEntry {
    id: string;
    message: string;
    show: boolean;
}



export default EncounterTableForm;
