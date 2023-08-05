import { magicArmor, itemPersonality } from '@/app/pages/shadowdark/random-tables/data';
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
        const itemType = this.rollType();
        const firstLine = `${bonus && `${bonus} `}${itemType}`;

        console.log({firstLine});

        const personalities: string[] = [];
        const personality = this.rollPersonality();
        personality.forEach(p => personalities.push(p));

        const qualities = this.rollQualities();

        const result: string[] = [
            firstLine,
            ...personalities,
            ...qualities,
        ];

        return result;
    }

    rollBonus (): string {
        this.roller.setSelection("item bonus");
        const bonus = this.roller.rollGroup()[0];
        console.log({bonus})
        return bonus;
    }

    rollType (): string {
        this.roller.setSelection("item type");
        let itemType = this.roller.rollGroup()[0];
        if (itemType === "Mithral") {
            let subtype: string | undefined;
            while (!subtype) {
                const t = this.roller.rollGroup()[0];
                if (t !== "Mithral" && t !== "Leather") {
                    subtype = t;
                }
            }
            itemType = `${itemType} ${subtype}`;
        }
        console.log({itemType})
        return itemType;
    }

    rollFeature (): string {
        this.roller.setSelection("feature");
        return this.roller.rollGroup()[0];
    }

    rollQualities (): string[] {
        const qualities = [];
        this.roller.setSelection("benefit");
        const benefitRoll = rollDice("2d6");
        const benefits = benefitRoll < 4 ? 0 : benefitRoll < 12 ? 1 : 2;
        for (let i=0; i<benefits; ++i) {
            qualities.push(this.roller.rollGroup()[0]);
        }
        const curseRoll = rollDice("2d6");
        const curses = curseRoll < 8 ? 1 : 0;
        if (curses) {
            this.roller.setSelection("curse");
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
            const feature = this.rollFeature();
            this.personalityRoller.setSelection("personality trait");
            const trait = this.personalityRoller.rollGroup()[0];
            this.personalityRoller.setSelection("alignment");
            const alignment = this.personalityRoller.rollGroup()[0];
            personality = [
                `"${generateName(false)}"`,
                feature,
                `${alignment}, ${trait}`,
                ...personality
            ];
        }
        return personality;
    }
}
