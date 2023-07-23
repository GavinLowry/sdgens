
import Dexie from "dexie";

/*
Dexie reference
https://dexie.org/docs/API-Reference#add-items
*/

const database = new Dexie("database");

// REMEMBER to update the version number when making table changes
database.version(6).stores({
	// don't declare all columns like in SQL -- just columns you want to search by
	projects: '++id', // name, npcs, etc.
	settings: 'id', // value
	npcs: '++id, projectId, name',
	maps: '++id, projectId, name',
	landMaps: '++id, projectId, name',
	character: '++id, projectId, name',
});

export const projectTable = database.table('projects');
export const settingsTable = database.table('settings');
export const npcsTable = database.table('npcs');
export const mapTable = database.table('maps');
export const landMapTable = database.table('landMaps');

export default database;
