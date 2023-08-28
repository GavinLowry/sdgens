'use client'

import { KeyboardEvent, MouseEvent, useEffect, useState } from 'react';
import {Point} from '../utils/mapview';
import { drawHex, getLitTiles, hatchHex, hexRatio, pointsAreEqual, ringPointsAndAngles, subtractPoints } from "../utils/hex";
import { TileMap, MapTile } from './hex-map';
import "./hex-map.css";

interface HexMapViewAttrs {
    tileMap: TileMap;
    onClick(p: Point): void;
    lowLight: boolean;
}

export default function HexMapView ({tileMap, onClick, lowLight}: HexMapViewAttrs) {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
    const [radius, setRadius] = useState<number>(20);
    const [hoveredCoord, setHoveredCoord] = useState<Point | undefined>();
    const [focus, setFocus] = useState<Point>({x: 0, y: 0});
    const [ctrlDown, setCtrlDown] = useState<boolean>(false);
    const [mouseLast, setMouseLast] = useState<Point | undefined>();

    const colors = {
        background: '#333',
        litFloor: '#dcb',
        hexLine: '#876',
        lightSource: '#ff4',
        lightSourceBorder: '#fb4',
        water: '#46a',
        lowLightFloor: '#556',
        lowLightWater: '#667',
        lowLightLine: '#778',
    }
    
    useEffect(() => {
        const can = document.getElementById("hex-map-canvas") as HTMLCanvasElement;
        if (can) {
            setCanvas(can);
            const context = can.getContext('2d');
            if (context) { setCtx(context); }
        }

        document.addEventListener("keydown", handleKeyDown);

        document.addEventListener("keyup", handleKeyUp);

        // testRingPoints();
    }, []);

    useEffect(() => {
        draw();
    }, [ctx]);

    useEffect(() => {
        draw();
    }, [hoveredCoord, lowLight, tileMap, focus]);

    // document.addEventListener("keydown", handleKeyDown);

    // document.addEventListener("keyup", handleKeyUp);

    function testRingPoints() {
        const ring1 = ringPointsAndAngles(1);
        console.log({ring1});
        const ring2 = ringPointsAndAngles(2);
        console.log({ring2});
        const ring3 = ringPointsAndAngles(3);
        console.log({ring3});
    }

    function draw(): void {
        if (!ctx || !canvas) { return; }

        clearScreen();

        const screenSize = { x: canvas.width, y: canvas.height };

        let litTiles: MapTile[] = [];
        const sources = tileMap.tiles.filter(t => t.features?.includes("light"));
        for (const source of sources) {
            const lit = source ? getLitTiles(tileMap, source.place, 6) : [];
            litTiles = [
                ...litTiles,
                ...lit
            ];
        }

        tileMap.tiles.forEach(t => {
            const screenLoc = coordToScreen(t.place, screenSize, focus, radius);
            drawHex(ctx, screenLoc, radius);

            const litHex = litTiles.find(h => pointsAreEqual(h.place, t.place));
            ctx.lineWidth = 1;
            if (litHex) {
                if (t.features?.includes("water")) {
                    ctx.fillStyle = colors.water;
                } else {
                    ctx.fillStyle = colors.litFloor;
                }
                ctx.fill();
                ctx.strokeStyle = colors.hexLine;
                ctx.stroke();
                if (t.features?.includes("solid")) {
                    hatchHex(ctx, screenLoc, radius);
                    ctx.stroke();
                }
            } else if (lowLight) {
                ctx.fillStyle = t.features?.includes("water") ? colors.lowLightWater : colors.lowLightFloor;
                ctx.fill();
                ctx.strokeStyle = colors.lowLightLine;
                ctx.stroke();
                if (t.features?.includes("solid")) {
                    hatchHex(ctx, screenLoc, radius);
                    ctx.stroke();
                }
            }

            if (t.features?.includes("light")) {
                drawLightSource(ctx, screenLoc, radius);
            }
        });

        if (hoveredCoord) {
            const screenLoc = coordToScreen(hoveredCoord, screenSize, focus, radius);
            drawHex(ctx, screenLoc, radius);
            ctx.fillStyle = colors.lightSource;
            ctx.fill();
        }
    }

    function drawLightSource(ctx: CanvasRenderingContext2D, screenLoc: Point, radius: number): void {
        const lightColor = colors.lightSource;
        const borderColor = colors.lightSourceBorder;
        ctx.beginPath();
        ctx.arc(screenLoc.x, screenLoc.y, radius/3, 0, 2*Math.PI)
        ctx.fillStyle = lightColor;
        ctx.strokeStyle = borderColor;
        ctx.fill();
        ctx.stroke();
    }

    function clearScreen() {
        if (!ctx || !canvas) { return; }
        ctx.fillStyle = colors.background;
        ctx.fillRect(0,0, canvas.width, canvas.height);
    }

    function screenToCoord (screen: Point, focus: Point, hexRadius: number): Point {
        if (!canvas) { return {x:0, y:0}; }

        const shiftx = screen.x + focus.x - canvas.width / 2;
        const columnWidth = 1.5 * hexRadius;
        const column = Math.floor((shiftx + columnWidth/2) / columnWidth);

        const rowHeight = hexRadius * hexRatio * 2;
        let shifty = screen.y + focus.y - canvas.height / 2;
        if (column % 2 === 0) { shifty += rowHeight / 2; }
        let row = Math.floor(shifty / rowHeight) * 2;
        if (column % 2) { row += 1; }

        return {x:column, y:row};
    }

    function coordToScreen (coord: Point, screenSize: Point, focus: Point, hexRadius: number): Point {
        const hexHeight = hexRatio * hexRadius;
        const x = screenSize.x / 2 - focus.x + coord.x * (hexRadius * 1.5);
        const y = screenSize.y / 2 - focus.y + coord.y * hexHeight;
        return {x,y};
    }

    function handleKeyDown(event: any): void {
        if (event.key === "Control") {
            setCtrlDown(true);
        }
    }

    function handleKeyUp(event: any): void {
        if (event.key === "Control") {
            setCtrlDown(false);
        }
    }

    function handleMouseMove(event: MouseEvent) {
        if (!canvas) { return; }

        const screenx = event.nativeEvent.offsetX;
        const screeny = event.nativeEvent.offsetY;
        const mousePoint = {x:screenx, y:screeny};

        if (ctrlDown) {
            if (mouseLast) {
                const delta = subtractPoints(mousePoint, mouseLast);
                setFocus({
                    x: focus.x - delta.x,
                    y: focus.y - delta.y
                })
            }
        } else {

            const coord = screenToCoord(mousePoint, focus, radius);
            
            if (!hoveredCoord || coord.x !== hoveredCoord.x || coord.y !== hoveredCoord.y) {
                setHoveredCoord(coord);
            }
        }

        setMouseLast(mousePoint);
    }

    function handleMouseOut() {
        setHoveredCoord(undefined);
        setCtrlDown(false);
    }

    function handleClick() {
        if (hoveredCoord) { onClick(hoveredCoord); }
    }

    return (
        <canvas
            className="walk-view"
            id="hex-map-canvas"
            width="600" height="600"
            onMouseMove={handleMouseMove}
            onMouseOut={handleMouseOut}
            onClick={handleClick}
        ></canvas>
    );
}
