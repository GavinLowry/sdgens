'use client'

import {useState} from 'react'
import MapView, {MapData, RoomData} from '../../../utils/mapview'
import {hexAreaPoints} from '../../../utils/hex'
import {roll} from '../../../utils/random'

/*
Shadowdark p. 130
*/

export default function Maps() {
    const [mapData, setMapData] = useState<MapData>();

    function generateMap(roomCount: number): MapData {
        let lastId = 0;
        const md: MapData = {rooms: [], info:{title:""}};
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
        console.log('onConnect',{from,to})
        const fromRoom = mapData!.rooms.find(r => r.id === from.id);
        console.log({mapData,fromRoom})
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

    return (
        <div>
            <div>maps</div>
            <button onClick={onGenerate}>generate</button>
            {mapData &&
                <MapView mapData={mapData} onConnect={onConnect} />
            }
        </div>
    );
}
