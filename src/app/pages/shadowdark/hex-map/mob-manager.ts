import { Mob, newMob } from "../utils/hex";
import { Point } from "../utils/mapview";

export default class MobManager {
    mobs: Mob[] = [];
    selectedMobId: number = 0;

    constructor () {}

    addMobs(mobs: Mob[]): void {
        this.mobs = [
            ...this.mobs,
            ...mobs
        ];
    }

    createMob(place: Point): Mob {
        const id = this.getAvailableMobId();
        const mob = newMob(id, place);
        this.mobs.push(mob);
        return mob;
    }

    getMobs (): Mob[] {
        return this.mobs;
    }

    getSelectedMob (): Mob {
        return this.mobs[this.selectedMobId];
    }

    getAvailableMobId (): string {
        let nextId: number = 0;
        this.mobs.forEach(mob => {
            const mobId = parseInt(mob.id);
            if (!nextId || nextId < mobId) { nextId = mobId; }
        });
        return `${nextId + 1}`;
    }

    updateMob(mob: Mob): void {
        this.mobs = [
            ...this.mobs.filter(m => m.id !== mob.id),
            mob,
        ];
    }
}
