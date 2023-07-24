import { ChangeEvent, ReactNode } from 'react';
import {
    alignmentOptions, ancestryDetails, ancestryOptions, backgroundOptions,
    classOptions, statNames
} from '@/app/pages/shadowdark/utils/lookup-tables';
import { chooseRandom, generateName, roll} from '../utils/random';
import RandomEditField from '@/app/components/random-edit-field';
import SelectEditField from '@/app/components/select-edit-field';
import { ClassDetailSheet, getClassDetails } from './class-detail-sheet';

export interface Character {
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

export function CharacterSheet ({character, onChange}: CharacterSheetAttrs): ReactNode {
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

export function rollStats(): { [index: string]: number } {
    const threeDice = (): number => (roll(1,6) + roll(1,6) + roll(1,6));
    const tempStats: any = {};
    for (let stat of statNames) {
        tempStats[stat] = threeDice();
    }
    return tempStats;
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
