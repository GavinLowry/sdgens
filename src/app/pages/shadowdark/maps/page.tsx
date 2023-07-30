'use client'

import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { FilterByProject, SelectedProject } from '../../../context';
import { mapTable } from "../../../database/database.config";
import MapView, { HallData, MapData, Point, RoomData } from "../utils/mapview";
import DarkMap from "../utils/darkMap";
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

    const [mapData, _setMapData] = useState<MapData | undefined>();
    const mapDataRef = useRef(mapData);
    const setMapData = (obj: MapData | undefined) => {
        mapDataRef.current = obj;
        _setMapData(obj);
    }

    useEffect(() => {
        console.log({selectedProject, filterByProject})
        updateMapList();
    }, [selectedProject, filterByProject])

    useEffect(() => {
        updateMapList();
    }, [])

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

    function removeHall(hallId: number): void {
        if (!mapData) { return; }
        const index = mapData.halls.findIndex(h => h.id === hallId);
        mapData.halls.splice(index,1);
        setMapChanged(true);
    }

    function rerollRoom(roomId: number): void {
        if (!mapData) { return; }
        const index = mapData.rooms.findIndex(r => r.id === roomId);
        const features = DarkMap.rollRoomFeatures();
        const oldRoom = mapData.rooms[index];
        const newRoom: RoomData = {
            ...oldRoom,
            featureIndex: features.featureIndex,
            title: features.title,
            description: features.description,
        };
        setMapData({
            ...mapData,
            rooms: [
                ...mapData.rooms.filter(r => r.id !== oldRoom.id),
                newRoom,
            ],
        });
        setMapChanged(true);
    }

    function editRoom(roomId: number): void {
        setEditingRoom(true);
        setEditingRoomId(roomId);
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
                    <MapView
                        mapData={mapData} onConnect={addHall} onRemoveHall={removeHall}
                        onRerollRoom={rerollRoom} onEditRoom={editRoom} onChangeName={changeMapName}
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
