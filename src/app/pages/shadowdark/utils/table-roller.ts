import { RandomTableGroup, RandomTableObject } from '@/app/pages/shadowdark/random-tables/data';
import { roll } from '@/app/pages/shadowdark/utils/random';

export default class TableRoller {
    tableGroup: RandomTableGroup;
    selection: string;

    constructor (group: RandomTableGroup) {
        this.tableGroup = group;
        this.selection = group.tables[0].field;
    }

    rollGroup(): string[] {
        if (this.tableGroup.options) {
            if(this.tableGroup.options.separate) {
                if(this.tableGroup.options.separate === 'select') {
                    const table = this.tableGroup.tables.find(t => t.field === this.selection);
                    if (!table) { return ['']; }
                    return [this.rollTable(table)];
                }
                else if(this.tableGroup.options.separate === 'random') {
                    const index = roll(0, this.tableGroup.tables.length - 1);
                    const table = this.tableGroup.tables[index];
                    return [this.rollTable(table)];
                }
            }
        }
        const resultArray: string[] = [];
        this.tableGroup.tables.forEach((tableObject: RandomTableObject) => {
            const result = this.rollTable(tableObject);
            resultArray.push(`${tableObject.field}: ${result}`);
        })
        return resultArray;
    }

    getSelectionOptions(): string[] {
        return this.tableGroup.tables.map(t => t.field);
    }

    setSelection(selection: string) {
        this.selection = selection;
    }
    
    rollTable(table: RandomTableObject): string {
        const dice = this.dieStringToDiceObject(table.die);
        const diceRoll = this.rollDice(dice);
        const entry = table.table.find(e => this.stringToNumArray(e.roll).includes(diceRoll));
        return entry?.value ?? '';
    }

    rollDice(dice: DiceObject): number {
        let dieRoll = 0;
        for(let i=0; i<dice.count; ++i) {
            dieRoll += roll(1, dice.size);
        }
        return dieRoll;
    }

    dieStringToDiceObject(die: string): DiceObject {
        const dIndex = die.indexOf("d");
        if (dIndex === 0) {
            return {
                count: 1,
                size: parseInt(die.substring(dIndex+1))
            };
        } else {
            const dieArray = die.split("d").map(d => parseInt(d));
            return {
                count: dieArray[0],
                size: dieArray[1]
            }
        }
    }

    stringToNumArray(original: string): number[] {
        const hyphenIndex = original.indexOf("-");
        const commaIndex = original.indexOf(",");
        const plusIndex = original.indexOf("+");
        if (hyphenIndex > -1) {
            const from = parseInt(original.substring(0, hyphenIndex));
            const to = parseInt(original.substring(hyphenIndex + 1));
            const result = [];
            for(let i=from; i<=to; ++i) {
                result.push(i);
            }
            if (from === 0) {
                for(let i=-1; i>-10; --i) {
                    result.push(i);
                }
            }
            return result;
        }
        else if (commaIndex > -1) {
            return original
                .split(",")
                .map(entry => parseInt(entry));
        }
        else if (plusIndex > -1) {
            const number = parseInt(original.substring(0,plusIndex));
            const result = [];
            for (let i=number; i<=number+20; ++i){
                result.push(i);
            }
            return result;
        }
        return [parseInt(original)];
    }

}

interface DiceObject {
    count: number;
    size: number;
}
