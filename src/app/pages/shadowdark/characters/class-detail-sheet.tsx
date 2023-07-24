import { ReactNode } from 'react';
import { classDetails } from '@/app/pages/shadowdark/utils/lookup-tables';

export function ClassDetailSheet ({characterClass, level}: {characterClass: string, level: number}): ReactNode {
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

export const getClassDetails = (characterClass: string) => {
    return classDetails.find(cd => cd.name === characterClass);
}
