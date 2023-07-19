'use client'

import {MouseEventHandler, useContext, useEffect, useState, SyntheticEvent} from 'react'
import {mapTable} from "../../../database/database.config";
import MapView, {MapData, RoomData} from '../../../utils/mapview'
import {hexAreaPoints} from '../../../utils/hex'
import {roll} from '../../../utils/random'
import {FilterByProject, SelectedProject} from '../../../context';

/*
Shadowdark p. 130
*/

export default function Maps() {
    const [mapData, setMapData] = useState<MapData>();
    const [mapName, setMapName] = useState<string>('');
    const [mapList, setMapList] = useState<MapData[]>([]);
	const {selectedProject, setSelectedProject} = useContext(SelectedProject);

    useEffect(() => {
        updateMapList();
    }, []);

    function generateMap(roomCount: number): MapData {
        let lastId = 0;
        const md: MapData = {rooms: []};
        const points = hexAreaPoints(3);
        const roomPoints = [];
        for (let i=0; i<roomCount; ++i) {
            const index = roll(0, points.length - 1);
            const p = points.splice(index,1)[0];
            roomPoints.push(p);
        }

        const heightMult = .5;
        const spacing = 12;
        md.rooms = roomPoints.map(p => ({
            id: lastId++,
            title: "",
            location: {
                x: p.x * spacing,
                y: p.y * spacing * heightMult
            },
        }));

        return md;
    }

    function onConnect(from: RoomData, to: RoomData) {
        const fromRoom = mapData!.rooms.find(r => r.id === from.id);
        if (fromRoom && to) {
            if (!fromRoom.hasOwnProperty('exits')) {
                fromRoom.exits = [];
            }
            fromRoom.exits!.push({destination: to.id})
        }
    }

    function onGenerate() {
        // TODO: allow map size or room count selection
        const md: MapData = generateMap(10);
        setMapData(md);
    }

    function onChangeName(event: SyntheticEvent<HTMLInputElement>): void {
        const target = event.target as HTMLInputElement;
        const {value} = target;
        setMapName(value);
    }

    function onSave(): void {
        if (!mapData) { return; }
        if (!mapName) {
            alert('Please enter a name for this map.');
            return;
        }
        const data = {
            ...mapData,
            name: mapName,
            projectId: selectedProject,
        };
		try {
			const id = mapTable
			.add(data)
			.then(() => {
				updateMapList();
			});
		} catch (error) {
			console.error(`failed to add ${data}: ${error}`);
		}
    }

	function updateMapList() {
		mapTable
		.toArray()
		.then((list) => {
			setMapList(list);
		})
	}

    function renderMapListItem(data: MapData, index: number) {
        return <div key={`${index}:${data.name}`}>{data.name}</div>
    }

    return (
        <div>
            <div>maps</div>
            <div>
                <button onClick={onGenerate}>generate</button>
                <input type="text" value={mapName} onChange={onChangeName} placeholder='map name'></input>
                <button onClick={onSave}>save</button>
            </div>
            {mapData &&
                <MapView mapData={mapData} onConnect={onConnect} />
            }
            <div>
                {mapList.map((m, index) => renderMapListItem(m, index))}
            </div>
        </div>
    );
}
