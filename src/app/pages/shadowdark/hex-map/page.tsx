'use client'

import { SyntheticEvent, useContext, useEffect, useState } from 'react';
import {Point} from '../utils/mapview';
import { getTileMap, MapTile, TileMap, TileFeatures } from './hex-map';
import HexMapView from './hex-map-view';
import {SelectedProject} from '../../../context';
import { hexMapTable } from '@/app/database/database.config';
import FileList, { FileListEntry } from '../components/file-list/file-list';
import "./hex-map.css";

// TODO:
// allow map deletion
// (maybe) create 7-hex 'brush'
// DONE:
// show list of stored hex maps
// 'add' button should delete existing hexes
// 'sollid' command button should add a hex if clicked where there is no hex

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

    function addHex(x: number, y: number, options?: {solid?: boolean}) {
        const existing = getHexAt(x,y);
        if (existing) {
            const tempMap = { ...tileMap }
            tempMap.tiles = tileMap.tiles.filter(t => !(t.place.x===x && t.place.y===y))
            setTileMap(tempMap);
        } else {
            const tile: MapTile = {
                place: {x,y},
                features: [],
            }
            if (options) {
                if (options.solid) {
                    tile.features!.push("solid");
                }
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
        if (tileMap.id) {
            hexMapTable
            .put(tileMap)
            .then(() => { updateMapList(); });
            return;
        }
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

    function addSolidHex(x:number, y:number): void {
        const existing = getHexAt(x,y);
        if (existing) {
            toggleTileFeature(x,y, "solid");
        } else {
            addHex(x,y, { solid: true });
        }
    }

    function handleClickHexMap(p: Point) {
        const {x,y} = p;
        if (buildCommand === "add") { addHex(x,y); }
        else if (buildCommand === "solid") { addSolidHex(x,y); }
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
            setTileMap(tMap);
            if (tMap.name) {
                setMapName(tMap.name);
            }
        }
    }

    function getFileListEntry (tileMap: TileMap): FileListEntry {
        return {
            name: tileMap.name ?? '',
            id: tileMap.id ?? ''
        };
    }

    function handleNewMap (): void {
        setTileMap(getTileMap({radius:5}));
        setMapName('');
    }

    return (
        <div className="walk">
            { mapList &&
                <div id="walk-list-column">
                    <button onClick={handleNewMap}>new map</button>
                    <div>stored maps</div>
                    <FileList entries={mapList.map(m => getFileListEntry(m))} onClick={handleClickMapList} />
                </div>
            }
            <div>
                <HexMapView tileMap={tileMap} onClick={handleClickHexMap} lowLight={lowLight} />
                <div className="walk-controls-column">
                    <div className="walk-build-controls">
                        <button onClick={() => handleBuildButton("add")} className={buildCommand==="add" ? "active" : ""}>hex</button>
                        <button onClick={() => handleBuildButton("solid")} className={buildCommand==="solid" ? "active" : ""}>solid</button>
                        <button onClick={() => handleBuildButton("light")} className={buildCommand==="light" ? "active" : ""}>light</button>
                        <button onClick={() => handleBuildButton("water")} className={buildCommand==="water" ? "active" : ""}>water</button>

                        <button onClick={toggleLowLight} className={lowLight ? "active" : ""}>lowlight</button>

                    </div>
                    <div className="walk-build-controls">
                        <label htmlFor="mapName">map name</label>
                        <input type="text" name="mapName" onChange={handleChangeMapName} value={mapName}></input>
                        <button onClick={handleSaveMap} disabled={!mapName}>save map</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

type buildCommands = "add" | "solid" | "light" | "water";
