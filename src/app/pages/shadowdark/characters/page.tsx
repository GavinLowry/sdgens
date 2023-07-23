'use client'

import { ChangeEvent, ReactNode, SyntheticEvent, useContext, useState } from 'react';
import { FilterByProject, SelectedProject } from '@/app/context';
import {chooseRandom, generateName, roll} from '../utils/random';
import { backgroundOptions, classDetails } from '../utils/lookup-tables';

import './characters.css';

export default function Characters () {
	const {selectedProject} = useContext(SelectedProject);
	const {filterByProject} = useContext(FilterByProject);
    const [character, setCharacter] = useState<Character>();

    function rollStats (): void {
        const threeDice = (): number => (roll(1,6) + roll(1,6) + roll(1,6));
        const tempStats: any = {};
        for (const stat of statNames) {
            tempStats[stat] = threeDice();
        }
        const tempCharacter: Character = {
            ...character,
            stats: tempStats,
        } as Character;
        setCharacter(tempCharacter);
    }
    
    function onClickGenerate (): void {
        const ch: Character = {
            projectId: selectedProject,
            name: generateName(),
            ancestry: '',
            background: '',
            class: '',
            alignment: '',
            level: 1,
        };
        setCharacter(ch);
    }

    function onChangeCharacter (temp: Character): void {
        setCharacter(temp);
    }

    return (
        <div>
            characters
            <div className="sd-control-row">
                <button onClick={onClickGenerate}>generate</button>
                <button onClick={rollStats} disabled={!character}>
                    {character?.stats ? 're' : ''}roll stats
                </button>
            </div>
            { character && <CharacterSheet character={character} onChange={onChangeCharacter} /> }
        </div>
    );
}

function CharacterSheet ({character, onChange}: CharacterSheetAttrs): ReactNode {
    function onChangeAncestry(ancestry: string) {
        const temp = { ...character, ancestry };
        onChange(temp);
    }

    function onChangeBackground(background: string) {
        const temp = { ...character, background };
        onChange(temp);
    }

    function onChangeName(name: string) {
        onChange({ ...character, name });
    }

    function onChangeClass(c: string) {
        onChange({ ...character, class: c });
    }

    function getModifier(stat: number): string {
        const mod = Math.floor((stat-10)/2)
        return `${mod<0?'':'+'}${mod}`;
    }

    function onChangeAlignment(alignment: string) {
        onChange({ ...character, alignment })
    }

    function renderStats(): ReactNode {

        return (
            <div>
                { statNames.map(s => (
                    <div key={s} className="ch-stat-row">
                        <div>{ s }:</div>
                        <div>{ character.stats![s] }</div>
                        <div>({getModifier(character.stats![s])})</div>
                    </div>
                )) }
            </div>
        );
    }

    function rerollAncestry(): string {
        return chooseRandom(ancestryOptions);
    }

    function rerollBackground(): string {
        return chooseRandom(backgroundOptions);
    }

    return (
        <div className="ch-sheet">
            <RandomEditField
                label="name" value={character.name}
                reroll={generateName} onChange={onChangeName}
            />
            <div>
                {
                    character.stats && renderStats()
                }
            </div>
            <RandomEditField
                label="ancestry" value={character.ancestry}
                reroll={rerollAncestry}
                onChange={onChangeAncestry}
            />
            <SelectEditField
                label={'class'}
                value={character.class}
                options={classOptions}
                onChange={onChangeClass}
            />
            <SelectEditField
                label={'alignment'}
                value={character.alignment}
                options={alignmentOptions}
                onChange={onChangeAlignment}
            />
            <RandomEditField
                label="background" value={character.background}
                reroll={rerollBackground}
                onChange={onChangeBackground}
            />
            {character.class && <ClassDetailSheet characterClass={character.class} level={character.level} />}
        </div>
    );
}

function ClassDetailSheet ({characterClass, level}: {characterClass: string, level: number}): ReactNode {
    const classData = classDetails.find(cd => cd.name === characterClass);
    if (!classData) { return; }
    const tiers = [1,2,3,4,5];
    return (
        <div>
            <div>{classData.name}</div>
            <div>weapons: {classData.weapons}</div>
            <div>armor: {classData.armor}</div>
            <div>hit die: d{classData.hitDie}</div>
            {classData.specials.map(s => (
                <div key={s.title}>
                    <div>{s.title}</div>
                    <div>{s.details}</div>
                </div>
            ))}
            {classData.spellsKnown && <div>
                {tiers.map((tier) => <span key={`tier${tier}`}>{classData.spellsKnown!(level, tier)} </span>)}
            </div>}
        </div>
    );
}

function RandomEditField ({label, value, reroll, onChange}: RandomEditFieldAttrs): ReactNode {
    function onClick() {
        onChange(reroll());
    }

    function onEdit(event: ChangeEvent<HTMLInputElement>) {
        const {value} = event.target;
        onChange(value);
    }

    return (
        <div className="ch-special-field">
            <label htmlFor={label}>{label}</label>
            <button onClick={onClick}>reroll</button>
            <input type="text" name={label} value={value} onChange={onEdit} />
        </div>
    );
}

function SelectEditField ({label, value, options, onChange}: SelectEditFieldAttrs): ReactNode {
    const [selection, setSelection] = useState('');

    function onSelect(event: ChangeEvent<HTMLSelectElement>) {
        const {value} = event.target;
        onChange(value);
        setSelection(value);
    }

    function onEdit(event: ChangeEvent<HTMLInputElement>) {
        const {value} = event.target;
        onChange(value);
    }

    return (
        <div className="ch-special-field">
            <label htmlFor={label}>{label}</label>
            <select onChange={onSelect} value={selection}>
                { ['', ...options].map(opt => <option value={opt} key={opt}>{opt}</option>) }
            </select>
            <input type="text" name={label} value={value} onChange={onEdit} />
        </div>
    );
}

interface Character {
    projectId: number;
    name: string;
    id?: number;
    stats?: {[index: string]: number};
    ancestry: string;
    background: string;
    class: string;
    alignment: string;
    level: number;
}

interface CharacterSheetAttrs {
    character: Character;
    onChange(c: Character): void;
}

interface RandomEditFieldAttrs {
    label: string;
    value: string | undefined;
    reroll(): string;
    onChange(s: string): void;
}

interface SelectEditFieldAttrs {
    label: string;
    value: string | undefined;
    options: string[];
    onChange(s: string): void;
}

const statNames = ['str','dex','con','int','wis','cha'];

const ancestryOptions = ['dwarf','elf','goblin','half-orc','halfling','human'];

const classOptions = ["fighter", "thief", "wizard", "priest", "ranger", "bard"];

const alignmentOptions = ["lawful","neutral","chaotic"];

const raceDetails = [];
