export interface StoredItem {
	id: number;
	name: string;
}

export interface IProject extends StoredItem {
	id: number;
	name: string;
}

export interface ISetting {
	id: string;
	value: string;
}

export interface INpc extends StoredItem {
	id: number;
	projectId: string;
	name: string;
}

export interface IMap extends StoredItem {
	id: number;
	projectId: number;
	name: string;
}

export interface ILandMap extends StoredItem {
	id: number;
	projectId: number;
	name: string;
}
