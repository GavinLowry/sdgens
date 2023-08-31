'use client'

import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import {Point} from '../utils/mapview';
import { drawHex, getLitTiles, hatchHex, hexRatio, pointsAreEqual, ringPointsAndAngles, subtractPoints } from "../utils/hex";
import { TileMap, MapTile, getTileAt, isPassible } from './hex-map';
import { Mob } from '../utils/hex';
import Image from 'next/image';
import MobManager from '../hex-map/mob-manager';

import "./hex-map.css";

interface HexMapViewAttrs {
    tileMap: TileMap;
    onClick(p: Point): void;
    lowLight?: boolean;
    mobs?: MobManager;
}

export default function HexMapView ({tileMap, onClick, lowLight, mobs}: HexMapViewAttrs) {
    const [radius, setRadius] = useState<number>(20);
    const [hoveredCoord, setHoveredCoord] = useState<Point | undefined>();
    const [focus, setFocus] = useState<Point>({x: 0, y: 0});
    const [ctrlDown, setCtrlDown] = useState<boolean>(false);
    const [mouseLast, setMouseLast] = useState<Point | undefined>();
    
    const [canvas, _setCanvas] = useState<HTMLCanvasElement>();
    const canvasRef = useRef(canvas);
    const setCanvas = (c: HTMLCanvasElement) => {
        canvasRef.current = c;
        _setCanvas(c);
    }

    const [context, _setContext] = useState<CanvasRenderingContext2D>();
    const contextRef = useRef(context);
    const setContext = (x: CanvasRenderingContext2D) => {
        contextRef.current = x;
        _setContext(x);
    }

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
            const ctx = can.getContext('2d');
            if (ctx) { setContext(ctx); }
        }

        document.addEventListener("keydown", handleKeyDown);

        document.addEventListener("keyup", handleKeyUp);

        // testRingPoints();
    }, []);

    useEffect(() => {
        draw();
    }, [context]);

    useEffect(() => {
        draw();
    }, [hoveredCoord, lowLight, tileMap, focus]);

    function testRingPoints() {
        const ring1 = ringPointsAndAngles(1);
        console.log({ring1});
        const ring2 = ringPointsAndAngles(2);
        console.log({ring2});
        const ring3 = ringPointsAndAngles(3);
        console.log({ring3});
    }

    function draw(): void {
        const ctx = contextRef.current;
        const canvasObject = canvasRef.current;
        if (!ctx || !canvasObject) { return; }

        clearScreen();

        const screenSize = { x: canvasObject.width, y: canvasObject.height };

        let lights: Point[] = tileMap.tiles
        .filter(t => t.features?.includes("light"))
        .map(t => t.place);
        if (mobs) {
            const mobLights = mobs.getMobs()
            .filter(m => m.light)
            .map(m => m.place);
            lights = [
                ...lights,
                ...mobLights,
            ];
        }

        let litTiles: MapTile[] = [];
        for (const source of lights) {
            const lit = source ? getLitTiles(tileMap, source, 6) : [];
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

        if (mobs) {
            const mobList = mobs.getMobs();
            mobList.forEach(m => { drawMob(ctx, m); })
        }
    }

    function drawMob(ctx: CanvasRenderingContext2D, mob: Mob) {
        const canvasObject = canvasRef.current;
        if (!canvasObject) { return; }
        const screenSize = { x: canvasObject.width, y: canvasObject.height };
        const mobScreen = coordToScreen(mob.place, screenSize, focus, radius);
        const image: CanvasImageSource = document.getElementById(iconNames.MAN) as CanvasImageSource;
        ctx.drawImage(image, mobScreen.x-radius/2, mobScreen.y-radius/2, radius, radius);
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
        const ctx = contextRef.current;
        const canvasObject = canvasRef.current;
        if (!ctx || !canvasObject) { return; }
        ctx.fillStyle = colors.background;
        ctx.fillRect(0,0, canvasObject.width, canvasObject.height);
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

    function handleNumpad (key: string): void {
        const mob = mobs?.getSelectedMob();
        if (!mob || !mobs) { return; }
        const place = { ...mob.place };
        switch (key) {
            case "1": place.x -= 1; place.y += 1; break;
            case "2": place.y += 2; break;
            case "3": place.x += 1; place.y += 1; break;
            case "7": place.x -= 1; place.y -= 1; break;
            case "8": place.y -= 2; break;
            case "9": place.x += 1; place.y -= 1; break;
        }
        const tile = getTileAt(place, tileMap);
        if (tile && isPassible(tile)) {
            mob.place = place;
            mobs.updateMob(mob);
            draw();
        }
    }

    function handleKeyDown(event: any): void {
        switch (event.key) {
            case "Control" : setCtrlDown(true); break;
            case "1":
            case "2":
            case "3":
            case "7":
            case "8":
            case "9":
                handleNumpad(event.key);
                break;
            default: console.log({key:event.key});
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
        <>
            <canvas
                className="walk-view"
                id="hex-map-canvas"
                width="600" height="600"
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
                onClick={handleClick}
            ></canvas>
            <div>
                <Image id={iconNames.MAN} src="/man.svg" alt="man" width={radius} height={radius} />
            </div>
        </>
    );
}

const iconNames = {
    MAN: "man",
}
