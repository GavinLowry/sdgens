'use client'

import { useState, SyntheticEvent } from 'react';
import { LandMapData, LandMapView, LandTileData } from '@/app/utils/landMapView';
import { getNeighbors, hexAreaPoints } from '@/app/utils/hex';
import { Point } from '@/app/utils/mapview';
// TODO: randomize terrain types
import { terrainLookup, terrainTypes } from '@/app/utils/lookup-tables';
import { chooseRandom, roll } from '@/app/utils/random';

import './land-maps.css';

export default function LandMaps(){
    const [mapRadius, setMapRadius] = useState<string>("8");
    const [data, setData] = useState<LandMapData>();

    function getTileAt(loc: Point, tileList?: LandTileData[]): LandTileData | undefined {
        if (!tileList) {
            if (!data) { return; }
            tileList = data.tiles;
        }
        const tile = tileList.find(t => t.location.x===loc.x && t.location.y===loc.y)
        return tile;
    }

    function onClickGenerate(){
        const radius = parseInt(mapRadius);
        const points = hexAreaPoints(radius);
        const tiles: LandTileData[] = points.map(p => {
            return {location: p};
        });
        const centerTile = getTileAt({x:0, y:0}, tiles);
        if (centerTile) {
            generateTileTypes(centerTile, tiles);
        }
        const result: LandMapData = {
            name: "",
            tiles
        };
        setData(result);
    }

    function generateTileTypes(tile: LandTileData, tileList: LandTileData[]) {
        generateThisTileType(tile, tileList);

        for (let i=0; i<parseInt(mapRadius)*2; ++i) {
            const t = tileList[roll(0, tileList.length-1)];
            generateOneRadius(t, tileList);
        }
    }

    function generateOneRadius(tile: LandTileData, tileList: LandTileData[]) {
        const neighborPoints = getNeighbors(tile.location);
        neighborPoints.forEach(p => {
            const t = getTileAt(p, tileList);
            if (t) {
                const entry = generateTypeFromLastTile(tile);
                t.type = entry?.name;
                t.color = entry?.color;
            }
        });
    }

    function generateTypeFromLastTile(lastTile: LandTileData): typeof terrainLookup[0] {
        let twodice = roll(1,6) + roll(1,6);
        if (twodice === 12) {
            twodice = roll(1,6) + roll(1,6);
            const entry = terrainLookup.find(t => t.lookup.indexOf(twodice) > -1);
            return entry!;
        } else {
            let lastIndex = terrainLookup.findIndex(t => t.name === lastTile.type);
            if (twodice < 4) { lastIndex += 1; }
            else if (twodice > 8) { lastIndex += 2; }
            return terrainLookup[lastIndex];
        }
    }

    function generateThisTileType(tile: LandTileData, tileList: LandTileData[], lastTile?: LandTileData): void {
        let entry;
        if (lastTile) {
            entry = generateTypeFromLastTile(lastTile);
        } else {
            const twodice = roll(1,6) + roll(1,6);
            entry = terrainLookup.find(t => t.lookup.indexOf(twodice) > -1);
        }
        tile.type = entry?.name;
        tile.color = entry?.color;
        const neighborPoints = getNeighbors(tile.location);
        neighborPoints.forEach(p => {
            const t = getTileAt(p, tileList);
            if (t && !t.type) {
                generateThisTileType(t, tileList, tile);
            }
        });
    }

    function onChangeMapRadius(event: SyntheticEvent<HTMLInputElement>){
        const target = event.target as HTMLInputElement;
        const {value} = target;
        setMapRadius(value);
    }

    return (
        <div>
            <div>
                <label htmlFor='map-radius'>Map Radius</label>
                <input 
                    type="text" name='map-radius' value={mapRadius} onChange={onChangeMapRadius}
                    className="lm-radius-field"
                />
                <button onClick={onClickGenerate}>generate</button>
            </div>
            {
                data &&
                <LandMapView data={data} />
            }
        </div>
    );
}
