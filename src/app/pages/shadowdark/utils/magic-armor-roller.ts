import { RandomTableGroup, RandomTableObject, magicArmor, itemPersonality } from '@/app/pages/shadowdark/random-tables/data';
import { generateName, roll, rollDice } from '@/app/pages/shadowdark/utils/random';
import TableRoller from '@/app/pages/shadowdark/utils/table-roller';

export default class MagicArmorRoller {
    roller: TableRoller;
    personalityRoller: TableRoller;

    constructor () {
        this.roller = new TableRoller(magicArmor);
        this.personalityRoller = new TableRoller(itemPersonality);
    }

    rollGroup () {
        const bonus = this.rollBonus();
        const bonusString = bonus ? `+${bonus} ` : '';
        const armorType = this.rollType();
        const firstLine = `${bonusString}${armorType}`;

        const personalities: string[] = [];
        const personality = this.rollPersonality();
        personality.forEach(p => personalities.push(p));

        const features: string[] = [];
        const feature = this.rollFeature();
        if (feature) { features.push(feature); }

        const qualities = this.rollQualities();

        const result: string[] = [
            firstLine,
            ...personalities,
            ...features,
            ...qualities,
        ];

        console.log({result})

        return result;
    }

    rollBonus (): number {
        const bonusRoll = rollDice("2d6");
        const bonus = bonusRoll === 12 ? 3 : bonusRoll > 8 ? 2 : bonusRoll > 5 ? 1 : 0;
        return bonus;
    }

    rollType (): string {
        this.roller.setSelection("armor type");
        let armorType = this.roller.rollGroup()[0];
        if (armorType === "Mithral") {
            let subtype: string | undefined;
            while (!subtype) {
                const t = this.roller.rollGroup()[0];
                if (t !== "Mithral" && t !== "Leather") {
                    subtype = t;
                }
            }
            armorType = `${armorType} ${subtype}`;
        }
        return armorType;
    }

    rollFeature (): string | undefined {
        const oneOfThree = roll(1,3);
        if (oneOfThree > 1) { return; }
        this.roller.setSelection("armor feature");
        return this.roller.rollGroup()[0];
    }

    rollQualities (): string[] {
        const qualities = [];
        this.roller.setSelection("armor benefit");
        const benefitRoll = rollDice("2d6");
        const benefits = benefitRoll < 4 ? 0 : benefitRoll < 12 ? 1 : 2;
        for (let i=0; i<benefits; ++i) {
            qualities.push(this.roller.rollGroup()[0]);
        }
        const curseRoll = rollDice("2d6");
        const curses = curseRoll < 8 ? 1 : 0;
        if (curses) {
            this.roller.setSelection("armor curse");
            qualities.push(this.roller.rollGroup()[0]);
        }
        return qualities;
    }

    rollPersonality (): string[] {
        let personality: string[] = [];
        const virtueRoll = rollDice("2d6");
        const virtues = virtueRoll < 10 ? 0 : 1;
        if (virtues) {
            this.personalityRoller.setSelection("item virtue");
            personality.push(this.personalityRoller.rollGroup()[0]);
        }
        const flawRoll = rollDice("2d6");
        const flaws = [2,3,10,11].includes(flawRoll) ? 1 : 0;
        if (flaws) {
            this.personalityRoller.setSelection("item flaw");
            personality.push(this.personalityRoller.rollGroup()[0]);
        }
        if (personality.length > 0) {
            this.personalityRoller.setSelection("personality trait");
            const trait = this.personalityRoller.rollGroup()[0];
            this.personalityRoller.setSelection("alignment");
            const alignment = this.personalityRoller.rollGroup()[0];
            personality = [
                `"${generateName(false)}"`,
                `${alignment}, ${trait}`,
                ...personality
            ];
        }
        return personality;
    }

}
