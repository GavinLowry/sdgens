'use client'

import { SyntheticEvent, useContext, useEffect, useState } from 'react';
import {Point} from '../utils/mapview';
import { getTileMap, MapTile, TileMap, TileFeatures } from './hex-map';
import HexMapView from './hex-map-view';
import {SelectedProject} from '../../../context';
import { hexMapTable } from '@/app/database/database.config';
import FileList, { FileListEntry } from '../components/file-list/file-list';
import "./walk.css";

// TODO:
// show list of stored hex maps
// allow map deletion
// 'sollid' command button should add a hex if clicked where there is no hex
// 'add' button should delete existing hexes
// (maybe) create 7-hex 'brush'

export default function Walk () {
    const [buildCommand, setBuildCommand] = useState<buildCommands | undefined>();
    const [tileMap, setTileMap] = useState<TileMap>( getTileMap({width:10, height:10}) );
    const [lowLight, setLowLight] = useState<boolean>(false);
    const [mapName, setMapName] = useState<string>("");
    const [mapList, setMapList] = useState<TileMap[]>([]);
	const {selectedProject, setSelectedProject} = useContext(SelectedProject);
    
    useEffect(() => {
        updateMapList();
    }, []);

    function updateMapList() {
        hexMapTable
        .toArray()
        .then(response => {
            console.log('update',{response})
            setMapList(response);
        })
    }

    function getHexAt(x: number, y: number): MapTile | undefined {
        return tileMap.tiles.find(t => t.place.x === x && t.place.y === y);
    }

    function toggleTileFeature(x: number, y: number, feature: TileFeatures) {
        const tmap = {...tileMap}
        const existing = tmap.tiles.find(t => t.place.x === x && t.place.y === y);
        if (existing) {
            if (!existing.features) {
                existing.features = [];
            }
            const index = existing.features.indexOf(feature);
            if (index === -1) {
                existing.features.push(feature);
            } else {
                existing.features.splice(index,1);
            }
            setTileMap(tmap);
        }
    }

    function addHex(x: number, y: number) {
        const existing = getHexAt(x,y);
        if (!existing) {
            const tile: MapTile = {
                place: {x,y}
            }
            const tmap = {...tileMap};
            tmap.tiles.push(tile);
            setTileMap(tmap);
        }
    }

    function handleBuildButton(cmd: buildCommands): void {
        setBuildCommand(buildCommand === cmd ? undefined : cmd);
    }

    function handleSaveMap () {
        const savableMap = {
            ...tileMap,
            name: mapName,
            projectId: selectedProject,
        }
        hexMapTable
        .add(savableMap)
        .then((newId) => {
            if (newId) {
                setTileMap({
                    ...tileMap,
                    id: `${newId}`,
                })
            }
            updateMapList();
        });
    }

    function toggleLowLight(): void {
        setLowLight(!lowLight);
    }

    function handleClickHexMap(p: Point) {
        const {x,y} = p;
        if (buildCommand === "add") { addHex(x,y); }
        else if (buildCommand === "solid") { toggleTileFeature(x,y, "solid"); }
        else if (buildCommand === "light") { toggleTileFeature(x,y, "light"); }
        else if (buildCommand === "water") { toggleTileFeature(x,y, "water"); }
    }

    function handleChangeMapName (event: SyntheticEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement;
        const { value } = target;
        setMapName(value);
    }

    function handleClickMapList (mapId: string) {
        const tMap = mapList.find(m => m.id === mapId);
        if (tMap) {
            setTileMap(tMap)
        }
    }

    function getFileListEntry (tileMap: TileMap): FileListEntry {
        return {
            name: tileMap.name ?? '',
            id: tileMap.id ?? ''
        };
    }

    return (
        <div className="walk">
            { mapList &&
                <div id="walk-list-column">
                    <div>stored maps</div>
                    <FileList entries={mapList.map(m => getFileListEntry(m))} onClick={handleClickMapList} />
                </div>
            }
            <div>
                <HexMapView tileMap={tileMap} onClick={handleClickHexMap} lowLight={lowLight} />
                <div className="walk-controls-column">
                    <div className="walk-build-controls">
                        <button onClick={() => handleBuildButton("add")} className={buildCommand==="add" ? "active" : ""}>add</button>
                        <button onClick={() => handleBuildButton("solid")} className={buildCommand==="solid" ? "active" : ""}>solid</button>
                        <button onClick={() => handleBuildButton("light")} className={buildCommand==="light" ? "active" : ""}>light</button>
                        <button onClick={() => handleBuildButton("water")} className={buildCommand==="water" ? "active" : ""}>water</button>

                        <button onClick={toggleLowLight} className={lowLight ? "active" : ""}>lowlight</button>

                    </div>
                    <div className="walk-build-controls">
                        <label htmlFor="mapName">map name</label>
                        <input type="text" name="mapName" onChange={handleChangeMapName} value={mapName}></input>
                        <button onClick={handleSaveMap}>save map</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

type buildCommands = "add" | "solid" | "light" | "water";
