import { useEffect, useState } from 'react';
import { Point } from './mapview';

export interface LandTileData {
    type?: string;
    typeIndex?: number;
    color?: string;
    location: Point;
}

export interface LandMapData {
    id?: number;
    name: string;
    tiles: LandTileData[];
}

interface LandMapViewAttrs {
    data: LandMapData;
}

export function LandMapView({data}: LandMapViewAttrs) {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [focus, setFocus] = useState<Point>({x:0, y:0});
    const [size, setSize] = useState<number>(20);
    const canvasSize = 600;
    const hexHeight = 0.8; 
    const colors = {
        background: "#999",
        hexBorder: "#444",
    };

    useEffect(() => {
        const c: HTMLCanvasElement = document.getElementById("viewer") as HTMLCanvasElement;
        setCanvas(c);
        setCtx(c.getContext('2d') as CanvasRenderingContext2D);
    }, [])

    useEffect(() => {
        if (!ctx) { return; }
        draw();
    }, [ctx, data])

    function draw() {
        if (!ctx) { return; }
        clearScreen();
        drawMap();
    }

    function clearScreen() {
        if (!ctx) { return; }
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    function drawMap() {
        if (!ctx) { return; }
        if (!data) { return; }
        data.tiles.forEach(tile => {
            drawHex(tile.location);
            if (tile.type) {
                ctx.fillStyle = tile.color!;
            }
            ctx.fill();
            ctx.strokeStyle = colors.hexBorder;
            ctx.stroke();
        });
    }

    function drawHex(loc: Point) {
        if (!ctx) { return; }
        const radius = size;
        const height = radius * hexHeight;
        const center = hexLocationToScreen(loc);
        ctx.beginPath();
        ctx.moveTo(center.x + radius, center.y);
        ctx.lineTo(center.x + radius/2, center.y + height);
        ctx.lineTo(center.x - radius/2, center.y + height);
        ctx.lineTo(center.x - radius, center.y);
        ctx.lineTo(center.x - radius/2, center.y - height);
        ctx.lineTo(center.x + radius/2, center.y - height);
        ctx.lineTo(center.x + radius, center.y);
    }

    function lengthToScreen(len: number): number {
        return len * size;
    }
    
    function hexLocationToScreen(loc: Point): Point {
        const radius = size;
        const height = radius * hexHeight;
        return {
            x: canvasSize/2 + loc.x * radius * 1.5 + focus.x,
            y: canvasSize/2 + loc.y * height + focus.y
        };
    }

    return (
        <div>
            <canvas id="viewer" width={canvasSize} height={canvasSize} />
        </div>
    );
}
