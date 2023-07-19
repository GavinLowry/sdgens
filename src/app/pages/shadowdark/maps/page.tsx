'use client'

import {useContext, useEffect, useState, SyntheticEvent} from 'react'
import {mapTable} from "../../../database/database.config";
import MapView, {MapData, RoomData} from '../../../utils/mapview'
import {hexAreaPoints} from '../../../utils/hex'
import {roll, chooseRandom} from '../../../utils/random'
import {FilterByProject, SelectedProject} from '../../../context';
import './maps.css';

/*
Shadowdark p. 130
*/

export default function Maps() {
    const [mapData, setMapData] = useState<MapData>();
    const [mapName, setMapName] = useState<string>('');
    const [mapList, setMapList] = useState<MapData[]>([]);
	const {selectedProject} = useContext(SelectedProject);
    const {filterByProject} = useContext(FilterByProject);

    useEffect(() => {
        updateMapList();
    }, []);

    function rollRoomFeatures() {
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

    function generateMap(roomCount: number): MapData {
        let lastId = 0;
        const md: MapData = {rooms: [], projectId: selectedProject};
        const points = hexAreaPoints(3);
        const roomPoints = [];
        for (let i=0; i<roomCount; ++i) {
            const index = roll(0, points.length - 1);
            const p = points.splice(index,1)[0];
            roomPoints.push(p);
        }

        const heightMult = .5;
        const spacing = 12;
        md.rooms = roomPoints.map(p => {
            const features = rollRoomFeatures();
            const description = features.description;
            return {
                id: lastId++,
                title: features.title,
                description,
                featureIndex: features.featureIndex,
                location: {
                    x: p.x * spacing,
                    y: p.y * spacing * heightMult
                },
            }
        });

        console.log({md})

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
            if (data.id) {
                mapTable.put(data)
                .then(() => {
                    updateMapList();
                })
            } else {
                mapTable
                .add(data)
                .then((result) => {
                    const id: number = result as number;
                    setMapData({
                        ...data,
                        id
                    })
                    updateMapList();
                });
            }
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

    function onClickMapListItem(data: MapData): void {
        setMapData(data);
        setMapName(data.name ?? '');
    }

    function renderMapListItem(data: MapData, index: number) {
        return <div 
        key={`${index}:${data.name}`} 
        onClick={()=>{onClickMapListItem(data)}}
        className='list-item'
        >
            {data.name}
        </div>
    }

    function onDelete(): void {
		if (!mapData) {return;}
		if (!confirm(`Really delete ${mapData.name}?`)) { return; }
		try {
			if (mapData.id) {
				mapTable
				.delete(mapData.id as number)
				.then(() => {
					updateMapList();
					setMapData(undefined);
                    setMapName('');
				})
			}
		} catch (error) {
			console.error(`failed to delete ${mapData}: ${error}`);
		}
	}

    return (
        <div>
            <div>maps</div>
            <div>
                <button onClick={onGenerate}>generate</button>
                <input type="text" value={mapName} onChange={onChangeName} placeholder='map name'></input>
                <button onClick={onSave}>save</button>
                <button onClick={onDelete}>delete</button>
            </div>
            {mapData &&
                <MapView mapData={mapData} onConnect={onConnect} />
            }
            <div>
                {
                    mapList
                    .filter(m => !filterByProject || m.projectId === selectedProject)
                    .map((m, index) => renderMapListItem(m, index))
                }
            </div>
        </div>
    );
}

interface RoomFeatures {
    type: string;
    options?: {
        list1: string[];
        list2?: string[];
    };
}

const roomFeatures: RoomFeatures[] = [
    {type: 'empty'},
    {type: 'empty'},
    {type: 'trap', options: {
        list1: ['Crude','Ranged','Sturdy','Sturdy','Ancient','Large'],
        list2: ['Ensnaring','Toxic','Mechanical','Mechanical','Magical','Deadly'],
    }},
    {type: 'minor hazard', options: {
        list1: [
            'Short fall','Stuck or locked barrier','Stuck or locked barrier',
            'Dense rubble','Collapsing walls','Enfeebling magic'
        ]
    }},
    {type: 'solo monster', options: {
        list1: ['Sneaky','Mighty','Clever','Mighty','Clever','Mutated'],
        list2: ['Ambusher','Brute','Brute','Spellcaster','Spellcaster','Pariah'],
    }},
    {type: 'NPC', options: {list1: ['Hiding','Captive','Wounded','Captive','Wounded','Rival crawlers']}},
    {type: 'monster mob', options: {
        list1: ['Stealthy','Reckless','Reckless','Magical','Primitive','Organized'],
        list2: ['Outcasts','Minions','Minions','Tricksters','Vermin','Warriors'],
    }},
    {type: 'major hazard', options: {
        list1: ['Long fall','Long fall','Toxic gas or vapors','Entrapping terrain','Antimagic zone','Drowning hazard']
    }},
    {type: 'treasure', options: {
        list1: ['Hidden','Guarded by monster','Hidden','Guarded by monster','Protected by trap','Protected by hazard']
    }},
    {type: 'boss monster', options: {
        list1: ['Physically strongest','Cult leader','Guarded by minions','Guarded by minions','Guarded by minions','Supreme sorcerer']
    }},
];
