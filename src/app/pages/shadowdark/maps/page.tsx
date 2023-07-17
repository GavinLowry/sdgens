'use client'

import {useEffect, useState} from 'react'
import MapView, {MapData, Point} from '../../../utils/mapview'
import {hexAreaPoints} from '../../../utils/hex'
import {roll} from '../../../utils/random'

/*
Shadowdark p. 130
*/

export default function Maps() {
    const [mapData, setMapData] = useState<MapData>();

    useEffect(() => {
        console.log('Maps()')
        const md: MapData = generateMap(10);
        setMapData(md);
    }, [])

    function generateMap(roomCount: number): MapData {
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
            title: "",
            location: {
                x: p.x * spacing,
                y: p.y * spacing * heightMult
            },
            exits: []
        }));

        return md;
    }

    return (
        <div>
            <div>maps</div>
            <MapView mapData={mapData} />
        </div>
    );
}
