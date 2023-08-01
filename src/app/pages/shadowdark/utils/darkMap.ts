import { mapTable } from "@/app/database/database.config";
import { MapData, RoomData, HallData, Point } from './mapview';
import { roll, chooseRandom } from './random';
import { hexAreaPoints } from './hex';
import { roomFeatures } from './lookup-tables';
import { getNeighbors } from "./hex";

export default class DarkMap {
    constructor() {}

    static getNextId(mapData: MapData): number {
        if (!mapData) { return 0; }
        let nextId = 0;
        mapData.rooms.forEach(room => {
            if (room.id > nextId) { nextId = room.id; }
        })
        mapData.halls.forEach(hall => {
            if (hall.id > nextId) { nextId = hall.id; }
        })
        return nextId + 1;
    }

    static getRoom(mapData: MapData, roomId: number): RoomData | undefined {
        return mapData.rooms.find(r => r.id === roomId);
    }

    static getRoomAt(mapData: MapData, where: Point): RoomData | undefined {
        return mapData.rooms.find(r => r.location.x === where.x && r.location.y === where.y);
    }

    static rollRoomFeatures() {
        const featureIndex = roll(0, roomFeatures.length-1);
        const feature = roomFeatures[featureIndex];
        const title = feature.type;
        let description = '';
        if (feature.options?.list1) {
            description += chooseRandom(feature.options.list1);
        }
        if (feature.options?.list2) {
            description += ' ' + chooseRandom(feature.options.list2);
        }
        return {featureIndex, title, description}
    }

    static generateMap(rooms: number, projectId: number): MapData {
        if (rooms > 19) { rooms = 19; }
        let lastId = 0;
        const newMap: MapData = {name: "", rooms: [], halls: [], projectId};
        const points = hexAreaPoints(3);
        const roomPoints = [];
        for (let i=0; i<rooms; ++i) {
            const index = roll(0, points.length - 1);
            const p = points.splice(index,1)[0];
            roomPoints.push(p);
        }
        const heightMult = .5;
        const spacing = 12;
        newMap.rooms = roomPoints.map(p => {
            const features = this.rollRoomFeatures();
            const description = features.description;
            return {
                type: objectTypes.ROOM,
                id: lastId++,
                title: features.title,
                description,
                featureIndex: features.featureIndex,
                location: {
                    x: p.x,
                    y: p.y
                },
            }
        });
        this.connectNeighborRooms(newMap);
        return newMap;
    }

    static getMidPoint(p1: Point, p2: Point): Point {
        return {
            x: p1.x + (p2.x - p1.x)/2,
            y: p1.y + (p2.y - p1.y)/2,
        };
    }

    static addHall(mapData: MapData, roomId1: number, roomId2: number): void {
        const room1 = this.getRoom(mapData, roomId1);
        const room2 = this.getRoom(mapData, roomId2);
        if (!room1 || !room2) { return; }
        const location = this.getMidPoint(room1.location, room2.location);
        const hall: HallData = {
            type: objectTypes.HALL,
            id: this.getNextId(mapData),
            rooms: [room1.id, room2.id],
            location,
        }
        mapData.halls.push(hall);
    }

    static connectNeighborRooms(mapData: MapData) {
        mapData.rooms.forEach(room => {
            const neighbors = getNeighbors(room.location);
            neighbors.forEach((neighbor: Point) => {
                const nRoom = this.getRoomAt(mapData, neighbor);
                if (nRoom) {
                    let existing = mapData.halls.find(h => h.rooms.includes(room.id) && h.rooms.includes(nRoom.id));
                    if (!existing)  {
                        this.addHall(mapData, room.id, nRoom.id);
                    }
                }
            })
        });
    }

    static deleteMap(mapId: number): void {
		if (!confirm("Really delete current map?")) { return; }
		try {
			if (mapId) {
				mapTable
				.delete(mapId as number)
			}
		} catch (error) {
			alert("failed to delete map");
		}
	}

    static storeMap(mapData: MapData, callback: (id: number) => void): void {
        if (!mapData) { return; }
        if (!mapData.name) {
            alert('please give this map a name');
            return;
        }
		try {
            if (mapData.id) {
                mapTable.put(mapData);
                callback(mapData.id)
            }
            else {
                mapTable
                .add(mapData)
                .then((result) => {
                    const id: number = result as number;
                    callback(id);
                });
            }
		} catch (error) {
			console.error(`failed to add ${mapData}: ${error}`);
		}
    }

    static removeHall(mapData: MapData, hallId: number): MapData | undefined {
        if (!mapData) { return; }
        // const index = mapData.halls.findIndex(h => h.id === hallId);
        // mapData.halls.splice(index,1);
        const data = { ...mapData }
        data.halls = [
            ...data.halls.filter(h => h.id !== hallId)
        ];
        return data;
    }

}

export const objectTypes = {
    ROOM: "room",
    HALL: "hall",
}
