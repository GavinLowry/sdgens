
export interface IProject {
	id: number;
	name: string;
}

export interface ISetting {
	id: string;
	value: string;
}

export interface INpc {
	id: string;
	projectId: string;
	name: string;
}

export interface IMap {
	id: number;
	projectId: number;
	name: string;
}
