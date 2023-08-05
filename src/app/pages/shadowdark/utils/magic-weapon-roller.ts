import MagicArmorRoller from "./magic-armor-roller";
import { magicWeapon } from '@/app/pages/shadowdark/random-tables/data';
import TableRoller from '@/app/pages/shadowdark/utils/table-roller';

export default class MagicWeaponRoller extends MagicArmorRoller {
    constructor () {
        super();
        this.roller = new TableRoller(magicWeapon);
    }
}