import {Point} from './mapview';
import { TileMap, MapTile } from '../walk/hex-map';

export const hexRatio = 0.85;

export function addPoints (a: Point, b: Point): Point {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

export function subtractPoints (a: Point, b: Point): Point {
    return {
        x: a.x - b.x,
        y: a.y - b.y
    }
}

export function pointsAreEqual (a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
}

export function hexRingPoints(radius: number): Point[] {
    if (radius === 0) { return [{x:0, y:0}]; }
    const result: Point[] = [];
    for (let i=0; i<radius; ++i) {
        result.push({
            x: 0 + i,
            y: (radius * -2) + i
        });
        result.push({
            x: radius,
            y: -radius + i*2
        });
        result.push({
            x: radius - i,
            y: radius + i
        });
        result.push({
            x: 0 - i,
            y: radius * 2 - i
        });
        result.push({
            x: -radius,
            y: radius - i * 2
        });
        result.push({
            x: -radius + i,
            y: -radius - i
        });
    }
    return result;
}

/*
algorithm for casting shadows on a hex map
https://forums.roguetemple.com/index.php?topic=3675.0
*/

export function getLitTiles(tmap: TileMap, source: Point, range: number): MapTile[] {
    const litTiles: MapTile[] = [];
    const sourceTile = tmap.tiles.find(t => pointsAreEqual(t.place, source));
    if (sourceTile) { litTiles.push(sourceTile); }
    interface Shadow { minAngle: number, maxAngle: number }
    const shadows: Shadow[] = [];
    const addShadow = (shadow: Shadow) => {
        let found = false;
        for (let existing of shadows) {
            if (shadow.minAngle >= existing.minAngle && shadow.maxAngle <= existing.maxAngle) { return; }
            if (shadow.minAngle >= existing.minAngle && shadow.minAngle <= existing.maxAngle) {
                found = true;
                existing.maxAngle = shadow.maxAngle;
            } else
            if (shadow.maxAngle >= existing.minAngle && shadow.maxAngle <= existing.maxAngle) {
                found = true;
                existing.minAngle = shadow.minAngle;
            }
        }
        if (!found) { shadows.push(shadow); }
    }
    for (let dist=1; dist<=range; ++dist) {
        const ring = ringPointsAndAngles(dist).map(p => ({
            ...p,
            point: addPoints(source, p.point)
        }));
        const isInShadow = (pa: PointAndAngle) => {
            const umbra = 5;
            for (let shadow of shadows) {
                if (pa.minAngle+umbra >= shadow.minAngle && pa.maxAngle-umbra <= shadow.maxAngle) {
                    return true;
                }
            }
            return false;
        }
        ring.forEach((pa: PointAndAngle) => {
            let shaded = false;
            if (pa.minAngle < 0) {
                const lowPoint: PointAndAngle = {
                    point: pa.point,
                    maxAngle: 0,
                    minAngle: 360 + pa.minAngle
                };
                const highPoint: PointAndAngle = {
                    point: pa.point,
                    minAngle: 0,
                    maxAngle: pa.maxAngle
                };
                shaded = isInShadow(lowPoint) && isInShadow(highPoint);
            } else {
                shaded = isInShadow(pa);
            }
            if (!shaded) {
                const tile = tmap.tiles.find(t => pointsAreEqual(t.place, pa.point));
                if (tile) {
                    litTiles.push(tile);
                    if(tile.features?.includes("solid")){
                        if (pa.minAngle < 0) {
                            addShadow({minAngle:360+pa.minAngle, maxAngle:0});
                            addShadow({minAngle:0, maxAngle:pa.maxAngle});
                        } else {
                            addShadow({minAngle:pa.minAngle, maxAngle:pa.maxAngle});
                        }
                    }
                }
            }
        })
    }
    return litTiles;
}

interface PointAndAngle {
    point: Point;
    minAngle: number;
    maxAngle: number;
}

export function ringPointsAndAngles(radius: number): PointAndAngle[] {
    if (radius === 0) { return [{point: {x:0,y:0}, minAngle:0, maxAngle:360}]};
    const result: PointAndAngle[] = [];
    const count = radius * 6;
    const angleIncrement = 360 / count;
    const minAngle = (radius % 2) ? 0 : -angleIncrement/2;
    const cursor: PointAndAngle = {
        point: {
            x: radius,
            y: (radius % 2) ? -1 : 0,
        },
        minAngle,
        maxAngle: minAngle + angleIncrement
    };
    let direction = 0;
    for (let i=0; i<count; ++i) {
        result.push({
            point: {x: cursor.point.x, y: cursor.point.y},
            minAngle: cursor.minAngle,
            maxAngle: cursor.maxAngle
        });
        if (i === count - 1) { break; }
        if (direction === 0 && cursor.point.x === -cursor.point.y) { direction += 1; }
        else if (direction === 1 && cursor.point.x === 0) { direction += 1; }
        else if (direction === 2 && cursor.point.x === cursor.point.y) { direction += 1; }
        else if (direction === 3 && cursor.point.x === -cursor.point.y) { direction += 1; }
        else if (direction === 4 && cursor.point.x === 0) { direction += 1; }
        else if (direction === 5 && cursor.point.x === cursor.point.y) { direction = 0; }
        cursor.minAngle = cursor.maxAngle;
        cursor.maxAngle += angleIncrement;
        switch (direction) {
            case 0: cursor.point.y -= 2; break;
            case 1: cursor.point.x -= 1; cursor.point.y -= 1; break;
            case 2: cursor.point.x -= 1; cursor.point.y += 1; break;
            case 3: cursor.point.y += 2; break;
            case 4: cursor.point.x += 1; cursor.point.y += 1; break;
            case 5: cursor.point.x += 1; cursor.point.y -= 1; break;
        }
    }
    return result;
}

export function hexAreaPoints(radius: number): Point[] {
    let result: Point[] = [];
    for (let i=0; i<radius; ++i) {
        result = [
            ...result,
            ...hexRingPoints(i)
        ];
    }
    return result;
}

export function getNeighbors(p: Point): Point[] {
    return hexRingPoints(1).map(r => ({x:r.x+p.x, y:r.y+p.y}));
}

export function getHexPoints(center: Point, radius: number): Point[] {
    const height = radius * hexRatio;
    return [
        { x: center.x + radius, y: center.y },
        { x: center.x + radius/2, y: center.y + height },
        { x: center.x - radius/2, y: center.y + height },
        { x: center.x - radius, y: center.y },
        { x: center.x - radius/2, y: center.y - height },
        { x: center.x + radius/2, y: center.y - height },
    ];
}

export function drawHex(ctx: CanvasRenderingContext2D, center: Point, radius: number) {
    const points = getHexPoints(center, radius);
    ctx.beginPath();
    for (let i=0; i<6; ++i) {
        const p = points[i];
        if (i===0){ ctx.moveTo(p.x, p.y); }
        else { ctx.lineTo(p.x, p.y); }
    }
    ctx.lineTo(points[0].x, points[0].y);
}

function tween (a: Point, b: Point, factor: number): Point {
    if (factor < 0) { return a; }
    if (factor > 1) { return b; }
    return {
        x: a.x + (b.x - a.x) * factor,
        y: a.y + (b.y - a.y) * factor
    };
}

export function hatchHex(ctx: CanvasRenderingContext2D, center: Point, radius: number) {
    const points = getHexPoints(center, radius);
    ctx.beginPath();
    const lines = 4;
    for (let i=1; i<=lines; ++i) {
        const factor = i/lines;
        const ll = tween(points[3], points[2], factor);
        const ur = tween(points[4], points[5], factor);
        ctx.moveTo(ll.x, ll.y);
        ctx.lineTo(ur.x, ur.y);
    }
    for (let i=1; i<lines; ++i) {
        const factor = i/lines;
        const ll = tween(points[2], points[1], factor);
        const ur = tween(points[5], points[0], factor);
        ctx.moveTo(ll.x, ll.y);
        ctx.lineTo(ur.x, ur.y);
    }
}
