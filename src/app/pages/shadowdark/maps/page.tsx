'use client'

import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { FilterByProject, SelectedProject } from '../../../context';
import { mapTable } from "../../../database/database.config";
import MapView, { HallData, MapData, MapObjectData, Point, RoomData } from "../utils/mapview";
import DarkMap, { objectTypes } from "../utils/darkMap";
import EditRoomModal from "./edit-room-modal";

import './maps.css';

interface MapListEntry {
    name: string;
    id: number;
}

export default function Maps() {
	const {selectedProject} = useContext(SelectedProject);
    const {filterByProject} = useContext(FilterByProject);

    const [mapList, setMapList] = useState<MapListEntry[]>([]);
    const [mapChanged, setMapChanged] = useState<boolean>(false);
    const [editingRoom, setEditingRoom] = useState<boolean>(false);
    const [editingRoomId, setEditingRoomId] = useState<number>(0);
    const [roomCount, setRoomCount] = useState<string>("10");

    const [selectedObject, _setSelectedObject] = useState<MapObjectData>();
    const selectedObjectRef = useRef(selectedObject);
    const setSelectedObject = (obj: MapObjectData | undefined) => {
        selectedObjectRef.current = obj;
        _setSelectedObject(obj);
    }

    const [command, _setCommand] = useState<string | undefined>();
    const commandRef = useRef(command);
    const setCommand = (cmd: string | undefined) => {
        commandRef.current = cmd;
        _setCommand(cmd);
    }

    const [mapData, _setMapData] = useState<MapData | undefined>();
    const mapDataRef = useRef(mapData);
    const setMapData = (obj: MapData | undefined) => {
        mapDataRef.current = obj;
        _setMapData(obj);
    }

    useEffect(() => {
        console.log({selectedObject})
    }, [selectedObject])

    useEffect(() => {
        updateMapList();
    }, [])

    useEffect(() => {
        updateMapList();
    }, [selectedProject, filterByProject])

    function updateMapList() {
        mapTable
        .toArray()
        .then(data => {
            const list: MapListEntry[] = data
            .filter(map => !filterByProject || map.projectId === selectedProject)
            .map((m: MapData) => ({name: m.name!, id: m.id!}));
            setMapList(list);
        })
    }

    function clickMapListEntry(mapId: number): void {
        mapTable
        .where("id")
        .equals(mapId)
        .first()
        .then(entry => {
            if (!entry.hasOwnProperty('halls')) {
                entry.halls = [];
            }
            setMapData(entry);
        })
    }

    function addHall(from: number, to: number): void {
        if (!mapDataRef.current) { return; }
        setMapChanged(true);
        DarkMap.addHall(mapDataRef.current, from,to);
    }

    function removeHall(): void {
        if (!mapDataRef.current || !selectedObjectRef.current || selectedObjectRef.current.type !== objectTypes.HALL) {
            return;
        }

        const result = DarkMap.removeHall(mapDataRef.current, selectedObjectRef.current.id);
        setMapData(result);
        
        setSelectedObject(undefined);
        setMapChanged(true);
    }

    function editRoom(): void {
        if(!selectedObject || selectedObject.type !== objectTypes.ROOM){ return; }
        setEditingRoom(true);
        setEditingRoomId(selectedObject.id);
    }

    function submitEditRoom(newRoom: RoomData): void {
        if (!mapData) { return; }
        const newMap: MapData = {
            ...mapData,
            rooms: [
                ...mapData.rooms.filter(r => r.id !== newRoom.id),
                newRoom,
            ],
        };
        setMapData(newMap);
        cancelEditRoom();
        setMapChanged(true);
    }

    function cancelEditRoom(): void {
        setEditingRoom(false);
    }

    function generateMap(): void {
        const newMap: MapData = DarkMap.generateMap(parseInt(roomCount), selectedProject);
        setMapData(newMap);
        setMapChanged(true);
    }

    function changeMapName(event: ChangeEvent<HTMLInputElement>) {
        if (!mapData) { return; }
        const target = event.target;
        const newName = target.value;
        setMapData({
            ...mapData,
            name: newName,
        })
        setMapChanged(true);
    }

    function storeMap(): void {
        if (!mapData) { return; }
        DarkMap.storeMap(mapData, (id: number): void => {
            mapData.id = id;
            setMapChanged(false);
            updateMapList();
        });
    }

    function changeRoomCount(event: ChangeEvent<HTMLInputElement>): void {
        const target = event.target;
        const newCount = target.value;
        setRoomCount(newCount);
    }

    function deleteMap(): void {
        if (!mapData || !mapData.id) { return; }
        DarkMap.deleteMap(mapData.id);
        setMapData(undefined);
        updateMapList();
    }

    function onClickMap(obj: MapObjectData | undefined): void {
        console.log({selected:selectedObjectRef.current,obj})
        if (commandRef.current === commands.CONNECT) {
            if (!selectedObjectRef.current || !obj) { return; }
            if (selectedObjectRef.current.type === objectTypes.ROOM && obj.type === objectTypes.ROOM) {
                addHall(selectedObjectRef.current.id, obj.id);
                setCommand(undefined);
            }
        }
        setSelectedObject(obj);
    }

    function onConnectCommand(): void {
        setCommand(commands.CONNECT);
    }

    function getRoomShape(): string | undefined {
        if (!selectedObject || selectedObject.type !== objectTypes.ROOM) { return; }
        const obj = selectedObject as RoomData;
        return obj.shape ?? "circle";
    }

    function changeRoomShape(): void {
        if (!mapData || !selectedObject) {
            return;
        }
        const data = DarkMap.changeRoomShape(mapData, selectedObject.id);
        if (data) {
            setMapData(data);
            setMapChanged(true);
        }
    }

    return (
        <div className="mp-column-container">

            <div className="mp-column">
                <div className="mp-control-buttons">
                    <div className="mp-room-count">
                        <label htmlFor="room-count">rooms:</label>
                        <input type="text" name="room-count" value={roomCount} onChange={changeRoomCount} />
                    </div>
                    <button onClick={generateMap}>generate map</button>
                    <button onClick={storeMap} disabled={!mapChanged || !mapData?.name}>store map</button>
                    <button onClick={deleteMap} disabled={!mapData || !mapData.id}>delete map</button>
                </div>
                {mapList &&
                    mapList.map(m => (
                        <div key={`mapListEntry${m.id}`} className="list-item" onClick={() => {clickMapListEntry(m.id)}}>
                            {m.name}
                        </div>
                    ))
                }
            </div>

            <div className="mp-column">
                { mapData &&
                    <div className='mp-map-controls'>
                        <div className='mp-form-field'>
                            <label htmlFor="map-name">Map Name</label>
                            <input
                                type="text" name="map-name" placeholder="map name" value={mapData.name}
                                onChange={changeMapName}
                            />
                        </div>
                        {
                            selectedObject && selectedObject.type === objectTypes.ROOM &&
                            <>
                                <button onClick={onConnectCommand}>connect</button>
                                <button onClick={editRoom}>edit features</button>
                                <button onClick={changeRoomShape}>{getRoomShape()}</button>
                            </>
                        }
                        {
                            command === commands.CONNECT &&
                            <p>click a destination</p>
                        }
                        {
                            selectedObject && selectedObject.type === objectTypes.HALL &&
                            <button onClick={removeHall}>remove hall</button>
                        }
                    </div>
                }
            </div>

            <div className="mp-column">
                { mapData &&
                    <MapView
                        mapData={mapData}
                        onClick={onClickMap}
                    />
                }
            </div>
            { mapData && editingRoom &&
                <EditRoomModal
                    roomId={editingRoomId} mapData={mapData}
                    onSubmit={submitEditRoom} onCancel={cancelEditRoom}
                />
            }
        </div>
    );
}

const commands = {
    CONNECT: "connect",
}
