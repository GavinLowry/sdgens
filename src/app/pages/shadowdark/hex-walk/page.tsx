'use client'

import { useEffect, useState } from 'react';
import { hexMapTable } from '@/app/database/database.config';
import { TileMap } from '../hex-map/hex-map';
import FileList, { FileListEntry } from '../components/file-list/file-list';
import HexMapView from '../hex-map/hex-map-view';
import { Point } from '../utils/mapview';
import { Mob } from '../utils/hex';
import MobManager from '../hex-map/mob-manager';

export default function HexWalk () {
    const [mapList, setMapList] = useState<TileMap[]>([]);
    const [tileMap, setTileMap] = useState<TileMap | undefined>();
    const [selectedMob, setSelectedMob] = useState<Mob>();
    const [mobManager, setMobManager] = useState<MobManager>();

    useEffect(() => {
        updateMapList();
        const mobMgr = new MobManager();
        const mob = mobMgr.createMob({x:0,y:0});
        mob.pc = true;
        mob.light = true;
        mobMgr.updateMob(mob);
        setMobManager(mobMgr)
    }, []);

    function updateMapList() {
        hexMapTable
        .toArray()
        .then(response => {
            setMapList(response);
        })
    }

    function getFileListEntry (tileMap: TileMap): FileListEntry {
        return {
            name: tileMap.name ?? '',
            id: tileMap.id ?? ''
        };
    }

    function handleClickMapList (mapId: string) {
        const tMap = mapList.find(m => m.id === mapId);
        if (tMap) {
            setTileMap(tMap);
        }
    }

    function handleClickHexMap (place: Point) {
        console.log({place})
    }

    return (
        <div>
            <div>hex walk</div>
            <div>stored maps</div>
            <FileList entries={mapList.map(m => getFileListEntry(m))} onClick={handleClickMapList} />
            {
                tileMap &&
                <HexMapView tileMap={tileMap} onClick={handleClickHexMap} mobs={mobManager} />
            }
        </div>
    );
}
