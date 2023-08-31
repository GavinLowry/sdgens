import {hexRingPoints} from '../utils/hex';
import {Point} from '../utils/mapview';

export interface MapTile {
    place: Point,
    features?: TileFeatures[],
}

export interface TileMap {
    id?: string,
    name?: string,
    tiles: MapTile[],
}

export type TileFeatures = "solid" | "light" | "water";

interface GetTileMapOptions {
    radius?: number,
    width?: number,
    height?: number,
}

export function getTileMap(options?: GetTileMapOptions): TileMap {
    let result: TileMap = {tiles:[]}
    if (options){
        if (options.radius) {
            for (let dist=0; dist <= options.radius; ++dist) {
                const newPoints = hexRingPoints(dist).map(p => ({place:p}));
                result.tiles = [
                    ...result.tiles,
                    ...newPoints
                ]
            }
            return result;
        } else if (options.width && options.height) {
            const startPoint: Point = {x:-Math.floor(options.width/2), y:-Math.floor(options.height/2)};
            for (let col=0; col<options.width; ++col) {
                for (let row=0; row<options.height; ++row) {
                    const tile: MapTile = {
                        place: {
                            x: startPoint.x + col,
                            y: startPoint.y + row*2 + (col%2)
                        }
                    }
                    result.tiles.push(tile);
                }
            }
            return result;
        }
    }
    return result;
}

export function getTileAt(place: Point, tileMap: TileMap): MapTile | undefined {
    return tileMap.tiles.find(t => t.place.x === place.x && t.place.y === place.y);
}

export function isPassible(tile: MapTile): boolean {
    return !tile.features?.includes("solid");
}