'use client'

import {ChangeEvent, useContext, useEffect, useState, SyntheticEvent} from 'react'
import {mapTable} from "../../../database/database.config";
import MapView, {MapData, RoomData, HallData} from '../utils/mapview'
import {hexAreaPoints} from '../utils/hex'
import {roll, chooseRandom} from '../utils/random'
import {FilterByProject, SelectedProject} from '../../../context';
import Modal from '../../../components/modal';
import { roomFeatures } from '../utils/lookup-tables';

import { DarkMap } from '../utils/darkMap';

import './maps.css';

/*
Shadowdark p. 130
*/

export default function Maps() {
	const {selectedProject} = useContext(SelectedProject);
    const {filterByProject} = useContext(FilterByProject);
    // const [mapData, setMapData] = useState<MapData>();
    const [mapName, setMapName] = useState<string>('');
    const [mapList, setMapList] = useState<MapData[]>([]);
    const [editRoom, setEditRoom] = useState<RoomData | undefined>();
    const [editTitle, setEditTitle] = useState<string>('');
    const [editDescription, setEditDescription] = useState<string>('');
    const [editFeatureIndex, setEditFeatureIndex] = useState<number>(0);
    const [roomCount, setRoomCount] = useState<string>("10");

    const [darkMap, setDarkMap] = useState<DarkMap>();

    // let darkMap: DarkMap;

    useEffect(() => {
        // updateMapList();
        setDarkMap(new DarkMap());
    }, []);

    useEffect(() => {
        console.log({list:darkMap?.mapList})
        if (darkMap?.mapList.length ?? 0 > 0){
            const firstMap = mapList[0];
            if (firstMap) {
                darkMap?.switchMap(firstMap.id!);
            }
        }
    }, [darkMap?.mapList]);

    // useEffect(() => {
    //     console.log({mapData})
    // }, [mapData])

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

    function generateMap(rooms: number): MapData {
        if (rooms > 19) { rooms = 19; }
        let lastId = 0;
        const md: MapData = {rooms: [], halls: [], projectId: selectedProject};
        const points = hexAreaPoints(3);
        const roomPoints = [];
        for (let i=0; i<rooms; ++i) {
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
        return md;
    }

    function getNextId(): number {
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

    function onConnect(from: RoomData, to: RoomData) {
        console.log('onConnect',{mapData,from,to})
        if (!mapData) { return; }
        const fromRoom = mapData!.rooms.find(r => r.id === from.id);
        const toRoom = mapData.rooms.find(r => r.id === to.id);
        console.log({fromRoom,toRoom})
        if (fromRoom && toRoom) {
            const hall: HallData = {
                id: getNextId(),
                location: {
                    x: Math.floor((toRoom.location.x + from.location.x) / 2),
                    y: Math.floor((toRoom.location.y + from.location.y) / 2)
                },
                rooms: [from.id, toRoom.id],
            }
            const temp = { ...mapData };
            temp.halls.push(hall);
            setMapData(temp);
        }
    }

    function onGenerate() {
        // TODO: allow map size or room count selection
        const md: MapData = generateMap(parseInt(roomCount));
        setMapData(md);
        setMapName('');
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

    function changeRoomFeatures(roomId: number, title: string, description: string, featureIndex: number) {
        if (!mapData) { return; }
        const rooms = [...mapData.rooms];
        const existing = rooms.find(r => r.id === roomId)
        const index = rooms.indexOf(existing!);
        rooms[index] = {
            ...rooms[index],
            description, featureIndex, title
        }
        const updating = {
            ...mapData,
            rooms
        }
        setMapData(updating);
    }

    function onRerollRoom(room: RoomData): void {
        const {title, description, featureIndex} = rollRoomFeatures();
        changeRoomFeatures(room.id, title, description, featureIndex);
    }

    function onCloseRoomModal() {
        console.log('onCloseRoomModal');
    }

    function onChangeEditTitle(event: ChangeEvent<HTMLInputElement>): void {
        const target = event.target;
        setEditTitle(target.value);
    }

    function onChangeEditDescription(event: ChangeEvent<HTMLInputElement>): void {
        const target = event.target;
        setEditDescription(target.value);
    }

    function onChangeEditFeatureIndex(event: ChangeEvent<HTMLInputElement>): void {
        const target = event.target;
        setEditFeatureIndex(parseInt(target.value));
    }

    function onSubmitEditRoom() {
        if (!editRoom) { return; }
        changeRoomFeatures(editRoom.id, editTitle, editDescription, editFeatureIndex);
        setEditRoom(undefined);
    }

    function onCancelEditRoom() {
        setEditRoom(undefined);
    }

    function onEditRoom (room: RoomData) {
        setEditTitle(room.title);
        setEditDescription(room.description ?? '');
        setEditFeatureIndex(room.featureIndex ?? 0);
        setEditRoom(room);
    }

    function onRemoveHall (hall: HallData) {
        const temp = {...mapData};
        if (!temp || !temp.halls) { return; }
        const hallIndex = temp.halls.findIndex(h => h.id === hall.id);
        if (hallIndex > -1) {
            temp.halls.splice(hallIndex, 1);
            setMapData(temp as MapData);
        }
    }

    function onChangeRoomCount(event: SyntheticEvent<HTMLInputElement>): void {
        const target = event.target as HTMLInputElement;
        const {value} = target;
        setRoomCount(value);
    }

    return (
        <div>
            <div>maps</div>
            <div className="sd-control-row">
                <span>rooms:</span>
                <input type="text" value={roomCount} onChange={onChangeRoomCount} />
                <button onClick={onGenerate}>generate</button>
                <div></div>
                <input type="text" value={mapName} onChange={onChangeName} placeholder='map name'></input>
                <button onClick={onSave}>save</button>
                <button onClick={onDelete}>delete</button>
            </div>
            {mapData &&
                <MapView
                    mapData={mapData} onConnect={onConnect} onRerollRoom={onRerollRoom} onEditRoom={onEditRoom}
                    onRemoveHall={onRemoveHall}
                />
            }
            <div>
                {
                    mapList
                    .filter(m => !filterByProject || m.projectId === selectedProject)
                    .map((m, index) => renderMapListItem(m, index))
                }
            </div>
            {editRoom &&
                <Modal
                    title="Edit Room"
                    open={!!editRoom}
                    onClose={onCloseRoomModal}
                >
                    <div>
                        id: {editRoom.id}
                    </div>
                    <div>
                        <label htmlFor='title'>Title</label>
                        <input type="text" name="title" value={editTitle} onChange={onChangeEditTitle} />
                    </div>
                    <div>
                        <label htmlFor='Description'>Description</label>
                        <input type="text" name="Description" value={editDescription} onChange={onChangeEditDescription} />
                    </div>
                    <div>
                        <label htmlFor='featureIndex'>FeatureIndex</label>
                        <input type="text" name="featureIndex" value={editFeatureIndex} onChange={onChangeEditFeatureIndex} />
                    </div>
                    <div>
                        <button onClick={onSubmitEditRoom}>submit</button>
                        <button onClick={onCancelEditRoom}>cancel</button>
                    </div>
                </Modal>
            }
        </div>
    );
}
