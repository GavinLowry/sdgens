'use client'

import { ReactNode, useContext, useState, useEffect, SyntheticEvent } from 'react';
import { LandMapData, LandMapView, LandTileData } from '@/app/pages/shadowdark/utils/landMapView';
import { getNeighbors, hexAreaPoints } from '@/app/pages/shadowdark/utils/hex';
import { Point } from '@/app/pages/shadowdark/utils/mapview';
import { terrainLookup } from '@/app/pages/shadowdark/utils/lookup-tables';
import { roll } from '@/app/pages/shadowdark/utils/random';
import {landMapTable} from "../../../database/database.config";
import {FilterByProject, SelectedProject} from '../../../context';
import { StoredItem } from '@/app/database/types';

import './land-maps.css';

export default function LandMaps(){
    const {selectedProject} = useContext(SelectedProject);
    const {filterByProject} = useContext(FilterByProject);
    const [mapRadius, setMapRadius] = useState<string>("9");
    const [data, setData] = useState<LandMapData>();
    const [mapName, setMapName] = useState<string>('');
    const [mapList, setMapList] = useState<LandMapData[]>([]);

    useEffect(() => {
        updateMapList();
    }, []);

    useEffect(() => {
        updateMapList();
    }, [filterByProject]);

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
            projectId: selectedProject,
            tiles
        };
        setData(result);
        setMapName('');
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
            if (lastIndex >= terrainLookup.length) {
                lastIndex -= terrainLookup.length
            }
            const entry = terrainLookup[lastIndex];
            return entry;
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

    function onChangeMapRadius(event: SyntheticEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement;
        const {value} = target;
        setMapRadius(value);
    }

    function onChangeMapName(event: SyntheticEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement;
        const {value} = target;
        setMapName(value);
    }

    function onSave(): void {
        if (!data) { return; }
        if (!mapName) {
            alert('Please enter a name for this map.');
            return;
        }
        const landData = {
            ...data,
            name: mapName,
            projectId: selectedProject,
        };
		try {
            if (landData.id) {
                landMapTable.put(landData)
                .then(() => {
                    updateMapList();
                })
            } else {
                landMapTable
                .add(landData)
                .then((result) => {
                    const id: number = result as number;
                    setData({
                        ...landData,
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
		landMapTable
		.toArray()
		.then((list) => {
            const filtered = list.filter(m => m.projectId === selectedProject || !filterByProject);
			setMapList(filtered);
		})
	}
    
    function onClickStoredMap(id: number) {
        const selectedMap = mapList.find(m => m.id === id);
        if (selectedMap) {
            setData(selectedMap);
            setMapName(selectedMap.name);
        }
    }

    return (
        <div>
            <div className="sd-control-row">
                <label htmlFor='map-radius'>Map Radius</label>
                <input
                    type="text"
                    name='map-radius'
                    value={mapRadius}
                    onChange={onChangeMapRadius}
                    className="lm-radius-field"
                />
                <button onClick={onClickGenerate}>generate</button>
                <input
                    type="text"
                    name='map-name'
                    value={mapName}
                    onChange={onChangeMapName}
                    className="lm-name-field"
                />
                <button onClick={onSave} disabled={!data || !mapName}>save</button>
            </div>
            {
                data &&
                <LandMapView data={data} />
            }
            {
                mapList && <StoredItemList itemList={mapList as StoredItem[]} onClick={onClickStoredMap} />
            }
        </div>
    );
}

interface StoredItemListAttrs {
    itemList: StoredItem[];
    onClick(id: number): void;
}

function StoredItemList({itemList, onClick}: StoredItemListAttrs): ReactNode {
    function renderItem(item: StoredItem): ReactNode {
        return (
            <div
                key={`${item.id}:${item.name}`}
                className="list-item"
                onClick={() => {onClick(item.id)}}
            >
                {item.name}
            </div>
        );
    }

    return (
        <div>
            {
                itemList.map(item => renderItem(item))
            }
        </div>
    );
}