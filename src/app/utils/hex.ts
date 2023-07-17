import {Point} from './mapview';

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