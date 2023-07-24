'use client'

import { ChangeEvent, ReactNode, useContext, useEffect, useState } from 'react';
import { FilterByProject, SelectedProject } from '@/app/context';
import { chooseRandom, generateName, roll} from '../utils/random';
import { backgroundOptions, classDetails, ancestryDetails } from '../utils/lookup-tables';
import { characterTable } from '@/app/database/database.config';
import { StoredItem } from '@/app/database/types';
import { StoredItemList } from '@/app/components/stored-item-list';

import './characters.css';

function rollStats(): { [index: string]: number } {
    const threeDice = (): number => (roll(1,6) + roll(1,6) + roll(1,6));
    const tempStats: any = {};
    for (let stat of statNames) {
        tempStats[stat] = threeDice();
    }
    return tempStats;
}

export default function Characters () {
	const {selectedProject} = useContext(SelectedProject);
	const {filterByProject} = useContext(FilterByProject);
    const [character, setCharacter] = useState<Character>();
    const [characterList, setCharacterList] = useState<Character[]>();

    useEffect(() => {
        updateCharacterList();
    }, [selectedProject, filterByProject]);

    function rerollStats (): void {
        const tempCharacter: Character = {
            ...character,
            stats: rollStats(),
        } as Character;
        setCharacter(tempCharacter);
    }

    function onClickGenerate (): void {
        const ch: Character = {
            projectId: selectedProject,
            name: generateName(),
            ancestry: chooseRandom(ancestryOptions),
            background: chooseRandom(backgroundOptions),
            class: '',
            alignment: chooseRandom(alignmentOptions),
            level: 1,
            stats: rollStats(),
            talents: [],
        };
        setCharacter(ch);
    }

    function onChangeCharacter (temp: Character): void {
        setCharacter(temp);
    }

    function updateCharacterList (): void {
		characterTable
		.toArray()
		.then((list) => {
            const filtered = list.filter(c => {
                return !filterByProject || c.projectId === selectedProject;
            });
			setCharacterList(filtered);
		})
    }

    function onSaveCharacter (): void {
		try {
            if (character?.id) {
                characterTable
                .put(character)
                .then(() => {
                    updateCharacterList();
                });
            } else {
                const id = characterTable
                .add(character)
                .then(() => {
                    updateCharacterList();
                });
            }
		} catch (error) {
			console.error(`failed to add ${character}: ${error}`);
		}
    }

    function onClickStoredCharacter (characterId: number): void {
        const char = characterList?.find(c => c.id === characterId)
        if (char) {
            setCharacter(char);
        }
    }

    return (
        <div className="ch-main">
            <div>
                <div>characters</div>
                {
                    characterList && 
                    <StoredItemList itemList={characterList as StoredItem[]} onClick={onClickStoredCharacter} />
                }
            </div>
            <div>
                <div className="sd-control-row">
                    <button onClick={onClickGenerate}>generate</button>
                    <button onClick={onSaveCharacter}>save</button>
                </div>
                { character && <CharacterSheet character={character} onChange={onChangeCharacter} /> }
            </div>
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

    function onChangeLevel(event: ChangeEvent<HTMLInputElement>) {
        const {value} = event.target;
        onChange({ ...character, level: parseInt(value) })
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

    function rerollStats() {
        const newStats = rollStats();
        const temp = {
            ...character,
            stats: newStats
        }
        onChange(temp);
    }

    function talentsAllowed(level: number, ancestry: string): number {
        const allowed = Math.ceil(level / 2) + ((ancestry === 'human') ? 1 : 0);
        return allowed;
    }

    function rollNewTalent(): void {
        console.log('rollNewTalent')
        const classData = getClassDetails(character.class);
        console.log({class:character.class,classData})
        if (!classData) {
            return;
        }
        const twoDice = roll(1,6) + roll(1,6);
        const talent = classData.talents.find(t => t.lookup.includes(twoDice));
        console.log({twoDice,talent})
        const temp = { ...character }
        temp.talents.push(talent!.effect);
        onChange(temp);
    }
    
    function renderTalents(): ReactNode {
        const allowed = talentsAllowed(character.level, character.ancestry);
        console.log({talents:character.talents})
        return (
            <div>
                {(allowed > character.talents.length) &&
                    <div>
                        {character.name} can have {allowed} talent{allowed > 1 ? 's' : ''} at level {character.level}.
                        <div>
                            <button onClick={rollNewTalent}>roll new talent</button>
                        </div>
                    </div>
                }
                {character.talents.length > 0 &&
                    <div>
                        {character.talents.map((t, index) => ( <div key={`${index}-${t}`}>{t}</div> ))}
                    </div>
                }
            </div>
        );
    }

    return (
        <div className="ch-sheet">
            <RandomEditField
                label="name" value={character.name}
                reroll={generateName} onChange={onChangeName}
            />
            <div className='ch-special-field'>
                <label htmlFor='level-field'>level</label>
                <input type='text' value={character.level} onChange={onChangeLevel} />
            </div>
            <div>
                <div>
                {
                    character.stats && renderStats()
                }
                </div>
                <div>
                    <button onClick={rerollStats}>reroll</button>
                </div>
            </div>
            { character.stats &&
                <div className='ch-special-field'>
                    <label htmlFor='hp-field'>hp</label>
                    <div>
                        {
                            Math.max(Math.ceil(
                                character.level * ((getClassDetails(character.class)?.hitDie ?? 0) / 2 + .5)
                            ) + parseInt(getModifier(character.stats['con'])), 1)
                            
                        }
                    </div>
                </div>
            }
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
            {character.class && renderTalents()}
            {character.ancestry && <AncestryDetailSheet ancestry={character.ancestry} />}
            {character.class && <ClassDetailSheet characterClass={character.class} level={character.level} />}
        </div>
    );
}

function AncestryDetailSheet({ancestry}: {ancestry: string}) {
    const details = ancestryDetails.find(ad => ad.race === ancestry);
    return (
        <div className="ch-detail-sheet">
            <div className="title">{ancestry}</div>
            {details &&
                <div>{details.details}</div>
            }
        </div>
    );
}

const getClassDetails = (characterClass: string) => {
    return classDetails.find(cd => cd.name === characterClass);
}

function ClassDetailSheet ({characterClass, level}: {characterClass: string, level: number}): ReactNode {
    const classData = getClassDetails(characterClass);
    if (!classData) { return; }
    const tiers = [1,2,3,4,5];
    return (
        <div className="ch-detail-sheet">
            <div className="title">{classData.name}</div>
            <div>weapons: {classData.weapons}</div>
            <div>armor: {classData.armor}</div>
            <div>hit die: d{classData.hitDie}</div>
            {classData.specials.map(s => (
                <div key={s.title}>
                    <div>{s.title}</div>
                    <div>{s.details}</div>
                </div>
            ))}
            {classData.spellsKnown && <div>spells known:&nbsp;
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

    useEffect(() => {
        if(value) { setSelection(value); }
    }, [value])

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
    talents: string[];
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
