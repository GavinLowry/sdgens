import { useEffect, useState } from 'react';
import { Point } from './mapview';
import { terrainNames } from './lookup-tables';
import Image from 'next/image';

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
                ctx.fill();
            }
            ctx.strokeStyle = colors.hexBorder;
            ctx.stroke();
            drawHexIcon(tile);
        });
    }

    function drawHexIcon(tile: LandTileData): void {
        if (!ctx) { return; }
        const radius = size;
        const height = radius * hexHeight;
        const center = hexLocationToScreen(tile.location);
        function drawIcon(color: string, points: Point[]) {
            if (!ctx) { return; }
            let first = true;
            ctx.beginPath();
            points.forEach(p => {
                if (first) {
                    first = false;
                    ctx.moveTo( center.x + radius * p.x, center.y + radius * p.y );
                } else {
                    ctx.lineTo( center.x + radius * p.x, center.y + radius * p.y );
                }
            });
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        function drawSvg(id: string, shift: Point, size: Point) {
            if (!ctx) { return; }
            const image: CanvasImageSource = document.getElementById(id) as CanvasImageSource;
            ctx.drawImage(image, center.x-shift.x, center.y-shift.y, size.x, size.y)
        }
        
        if (tile.type === terrainNames.DESERT) {
            const imageSize = radius * .8;
            const image: CanvasImageSource = document.getElementById(terrainNames.DESERT) as CanvasImageSource;
            ctx.drawImage(image, center.x-imageSize/2, center.y-imageSize/2, imageSize, imageSize)
        }
        else if(tile.type === terrainNames.OCEAN) {
            const imageSize = radius * 1;
            const image: CanvasImageSource = document.getElementById(terrainNames.OCEAN) as CanvasImageSource;
            ctx.drawImage(image, center.x-imageSize*.8, center.y-imageSize*.4, imageSize*1.5, imageSize*.8)
        }
        else if(tile.type === terrainNames.SWAMP) {
            drawSvg(terrainNames.SWAMP, {x:radius/2,y:radius*.3}, {x:radius, y:radius*.6});
        }
        else if(tile.type === terrainNames.FOREST) {
            drawSvg(terrainNames.FOREST, {x:radius*.7,y:radius*.5}, {x:radius*1.4, y:radius});
        }
        else if (tile.type === terrainNames.MOUNT) {
            drawIcon('black', [
                {x:-.6,y:.2}, {x:-.2,y:-.6}, {x:0, y:0}, {x:.2,y:-.4},
                {x:.6, y:.2}, {x:.2, y:-.2}, {x:0, y:.0}, {x:-.2,y:-.4}
            ]);
        }
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
            <div style={{height: 0}}>
                <Image id={terrainNames.DESERT} src="/cactus.svg" alt="cactus" width="0" height="0" />
                <Image id={terrainNames.OCEAN} src="/ocean.svg" alt="ocean" width="0" height="0" />
                <Image id={terrainNames.SWAMP} src="/swamp.svg" alt="swamp" width="0" height="0" />
                <Image id={terrainNames.FOREST} src="/forest.svg" alt="forest" width="0" height="0" />
            </div>
        </div>
    );
}
