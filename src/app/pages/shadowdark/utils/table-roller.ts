import { RandomTableGroup, RandomTableObject, RandomTableEntry } from '@/app/pages/shadowdark/random-tables/data';
import { roll, rollDice } from '@/app/pages/shadowdark/utils/random';

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
                if(['select', 'controlled'].includes(this.tableGroup.options.separate)) {
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
        const diceRoll = rollDice(table.die);
        const entry = table.table.find(e => this.stringToNumArray(e.roll).includes(diceRoll));
        let value = entry?.value ?? '';
        return this.rollMiniTable(value);
    }

    rollMiniTable(value: string) {
        const trigger = "1d4: ";
        const d4index = value.indexOf(trigger);
        if (d4index > -1) {
            const [before, after] = value.split(trigger);
            const afterArray = after.split(", ");
            const subtable: RandomTableEntry[] = afterArray.map(e => {
                const [rollString, text] = e.split(". ");
                return {roll: rollString, value:text} as RandomTableEntry;
            })
            const tableObject: RandomTableObject = {
                field: "",
                die: "d4",
                table: subtable,
            };
            const choice = this.rollTable(tableObject);
            value = `${before} ${choice}`;
        }
        return value;
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
