
export interface ISetting {
	id: string;
	value: string;
}

export interface StoredItem {
	id: number;
	name: string;
}

export interface IProject extends StoredItem {
	id: number;
	name: string;
}

export interface INpc extends StoredItem { projectId: string; }

export interface IMap extends StoredItem { projectId: number; }

export interface ILandMap extends StoredItem { projectId: number; }

export interface ICharacter extends StoredItem { projectId: number; }
