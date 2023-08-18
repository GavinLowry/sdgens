
import Dexie from "dexie";

/*
Dexie reference
https://dexie.org/docs/API-Reference#add-items
*/

const database = new Dexie("database");

// REMEMBER to update the version number when making table changes
database.version(11).stores({
	// don't declare all columns like in SQL -- just columns you want to search by
	projects: '++id', // name, npcs, etc.
	settings: 'id', // value
	npcs: '++id, projectId, name',
	maps: '++id, projectId, name',
	landMaps: '++id, projectId, name',
	character: '++id, projectId, name',
	monster: '++id, projectId, name, level',
	encounterTable: '++id, projectId, name',
	stashItem: '++id, projectId, type',
	// items : '++id, projectId, type', ...and array of string for the item itself
});

export const projectTable = database.table('projects');
export const settingsTable = database.table('settings');
export const npcsTable = database.table('npcs');
export const mapTable = database.table('maps');
export const landMapTable = database.table('landMaps');
export const characterTable = database.table('character');
export const monsterTable = database.table('monster');
export const encounterTable = database.table('encounterTable');
export const stashTable = database.table('stashItem');

export default database;
