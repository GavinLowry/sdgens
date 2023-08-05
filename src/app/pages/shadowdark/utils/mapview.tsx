'use client'

import { useEffect, useRef, useState } from 'react';

export interface Point {
    x: number;
    y: number;
}

export interface MapObjectData {
    id: number;
    location: Point;
    type: string;
    light?: string;
}

export interface RoomData extends MapObjectData {
    title: string;
    description?: string;
    featureIndex?: number;
    shape?: string;
    radius?: number;
    flag?: {angle: number, message: string};
    details?: string;
}

export interface HallData extends MapObjectData {
    rooms: number[];
    width?: number;
    stairs?: string; // up or down
}

interface ScreenPoint {
    location: Point;
    object: MapObjectData;
}

export interface MapData {
    projectId: number;
    rooms: RoomData[];
    halls: HallData[];
    id?: number;
    name?: string;
}

let screenPoints: ScreenPoint[] = [];

export interface MapViewApps {
    mapData: MapData | undefined,
    onClick(obj: MapObjectData | undefined): void;
}

export default function MapView({ mapData, onClick }: MapViewApps) {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [mapId, setMapId] = useState<number | undefined>();

    const [selectedObject, _setSelectedObject] = useState<MapObjectData | undefined>();
    const selectedObjectRef = useRef(selectedObject);
    const setSelectedObject = (obj: MapObjectData | undefined) => {
        selectedObjectRef.current = obj;
        _setSelectedObject(obj);
    }

    const width = 600;
    const height = 600;
    const unit = 120;
    const roomRadius = 3/8;

    useEffect(() => {
        const c: HTMLCanvasElement = document.getElementById("viewer") as HTMLCanvasElement;
        setCanvas(c);
        setCtx(c.getContext('2d') as CanvasRenderingContext2D);
    }, [])

    useEffect(() => {
        if (!canvas || !ctx) { return; }
        canvas.addEventListener("click", onClickMap);
        draw();
    }, [ctx, canvas])

    useEffect(() => {
        if (!mapData) { return; }
        if (mapData.id !== mapId) {
            setMapId(mapData.id);
            setSelectedObject(undefined);
        }
        draw();
    }, [mapData])

    useEffect(() => {
        draw();
    }, [selectedObject])

    function draw() {
        if (!ctx) { return; }
        screenPoints = [];
        ctx.fillStyle = colors.background;
        ctx.fillRect(0,0,width,height);

        if (!mapData) {return;}

        ctx.save();

        ctx.fillStyle = colors.wall;
        ctx.strokeStyle = colors.wall;
        ctx.lineWidth = 40;
        drawMap(mapData);

        ctx.fillStyle = colors.floor;
        ctx.strokeStyle = colors.floor;
        ctx.lineWidth = 20;
        drawMap(mapData, true);

        ctx.fillStyle = colors.text;
        ctx.textAlign = "center";
        drawMapText(mapData);

        ctx.restore();
    }

    function breakText(text: string, width: number): string[] {
        if (text.length <= width) { return [text]; }
        let cursor = width;
        while (text[cursor] != ' ' && cursor > 0) {
            cursor -= 1;
        }
        if (cursor > 0 && cursor < text.length) {
            return [text.substring(0,cursor), text.substring(cursor+1)];
        }
        return [text];
    }

    function drawMapText(data: MapData): void {
        if (!mapData || !ctx) {return;}
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        data.rooms.forEach(room => {
            const center = mapToScreenPoint(room.location);
            const lineHeight = 15;
            const cursor = { ...center }
            cursor.y -= lineHeight * 2;

            const maxWidth = 10;

            const titleAry = breakText(room.title, maxWidth);
            ctx.font = "bold 13px Arial";
            titleAry.forEach(word => {
                cursor.y += lineHeight
                ctx.strokeText(word, cursor.x, cursor.y);
                ctx.fillText(word, cursor.x, cursor.y);
            })

            if (room.description) {
                const descAry = breakText(room.description, maxWidth);
                ctx.font = "11px Arial";
                descAry.forEach(word => {
                    cursor.y += lineHeight
                    ctx.strokeText(word, cursor.x, cursor.y);
                    ctx.fillText(word, cursor.x, cursor.y);
                })
            }
        });
        ctx.restore();
    }

    function drawMap(data: MapData, secondPass: boolean = false): void {
        if (!mapData || !ctx) {return;}
        if (data.halls) {
            data.halls.forEach(hall => { drawHall(hall, secondPass); })
        }
        data.rooms.forEach(room => { drawRoom(room, secondPass); });
    }

    function drawHall(hall: HallData, secondPass: boolean) {
        if (!ctx) { return; }
        const rooms: RoomData[] = mapData!.rooms;
        if (!rooms) { return; }
        const room0 = rooms.find( r => r.id === hall.rooms[0]);
        const map_start = room0?.location;
        const room1 = rooms.find( r => r.id === hall.rooms[1]);
        const map_end = room1?.location;
        if (!map_start || !map_end) { return; }
        const start = mapToScreenPoint(map_start);
        const end = mapToScreenPoint(map_end);
        if (!secondPass) {
            screenPoints.push({
                location: {
                    x: Math.floor((start.x + end.x)/2),
                    y: Math.floor((start.y + end.y)/2),
                },
                object: hall
            })
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        if (secondPass) {
            if (selectedObject && selectedObject.id === hall.id) {
                ctx.strokeStyle = colors.hilight;
            }
            else {
                const floorColor = getFloorColor(hall);
                ctx.fillStyle = floorColor;
                ctx.strokeStyle = floorColor;
            }
        }
        const hallWidth = hall.width ?? 20;
        ctx.lineWidth = secondPass ? hallWidth : hallWidth + 20;
        ctx.stroke();
        ctx.restore();

        if (secondPass) {
            drawStairs(hall);
        }
    }

    function drawStairs(hall: HallData): void  {
        if (!ctx || !hall || !mapData) { return; }
        if (!hall.stairs) { return; }
        const topIndex = hall.stairs === "down" ? hall.rooms[0] : hall.rooms[1];
        const bottomIndex = hall.stairs === "down" ? hall.rooms[1] : hall.rooms[0];
        const topRoom = mapData.rooms.find(r => r.id === topIndex);
        const bottomRoom = mapData.rooms.find(r => r.id === bottomIndex);
        if (!topRoom || !bottomRoom) { return; }
        const top = mapToScreenPoint({ ...topRoom.location });
        const bottom = mapToScreenPoint({ ...bottomRoom.location });
        const segments = 10;
        const crunch = 1/3;
        const dx = (bottom.x - top.x) / segments * crunch;
        const dy = (bottom.y - top.y) / segments * crunch;
        const width = hall.width ?? 20;
        ctx.save();
        ctx.strokeStyle = 'darkgray';
        ctx.setLineDash([2, 4]);
        for (let i=0; i<segments; ++i) {
            ctx.beginPath();
            ctx.moveTo(
                top.x + dx * i + (dx * segments * (1 - crunch/2)),
                top.y + dy * i + (dy * segments * (1 - crunch/2))
            );
            ctx.lineTo(
                top.x + dx * (i + 1) + (dx * segments * (1 - crunch/2)),
                top.y + dy * (i + 1) + (dy * segments * (1 - crunch/2))
            );
            ctx.lineWidth = width * (1 - i / segments);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawRoom(room: RoomData, secondPass: boolean) {
        if (!ctx) { return; }
        const center = room.location;
        const ctr = mapToScreenPoint(center);
        if (!secondPass) {
            screenPoints.push({location: ctr, object: room});
        }
        const storedRadius = room.radius ? room.radius / 20 : roomRadius;
        const rad = mapToScreenLength(storedRadius);
        ctx.save();
        ctx.beginPath();

        switch(room.shape) {
            case 'tri': drawPolyRoom(ctr, rad, 3, "half"); break;
            case 'tri2': drawPolyRoom(ctr, rad, 3, "minus-half"); break;
            case 'diamond': drawPolyRoom(ctr, rad, 4); break;
            case 'square': drawPolyRoom(ctr, rad, 4, "rotate"); break;
            case 'penta': drawPolyRoom(ctr, rad, 5, "half"); break;
            case 'penta2': drawPolyRoom(ctr, rad, 5, "minus-half"); break;
            case 'hex': drawPolyRoom(ctr, rad, 6); break;
            case 'hex2': drawPolyRoom(ctr, rad, 6, "rotate"); break;
            case 'octa': drawPolyRoom(ctr, rad, 8); break;
            case 'octa2': drawPolyRoom(ctr, rad, 8, "rotate"); break;
            default: drawRoundRoom(ctr, rad); break;
        }

        if (secondPass) {
            if (selectedObject && selectedObject.id === room.id) {
                ctx.fillStyle = colors.hilight;
                ctx.strokeStyle = colors.hilight;
            } else {
                const floorColor = getFloorColor(room);
                ctx.fillStyle = floorColor;
                ctx.strokeStyle = floorColor;
            }
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        if (room.flag) {
            drawFlag(ctr, rad, room.flag.angle, room.flag.message);
        }
    }

    function drawText(message: string, where: Point) {
        if (!ctx) { return; }
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'black';
        ctx.lineWidth = 4;
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(message, where.x, where.y);
        ctx.fillText(message, where.x, where.y);
    }

    function drawFlag(onScreenCenter: Point, onScreenRadius: number, angle: number, message: string): void {
        if (!ctx) { return; }

        const radians = -angle / 180 * Math.PI;
        const innerPoint = polarToCartesian(onScreenCenter, radians, onScreenRadius * 4/5);
        const outerPoint = polarToCartesian(onScreenCenter, radians, onScreenRadius * 8/5);
        const textPoint = polarToCartesian(onScreenCenter, radians, onScreenRadius * 10/5);
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = 10;
        ctx.strokeStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(innerPoint.x, innerPoint.y);
        ctx.lineTo(outerPoint.x, outerPoint.y);
        ctx.stroke();
        drawText(message, textPoint);
        ctx.restore();
    }

    function drawPolyRoom(ctr: Point, rad: number, sides: number, rotate?: string): void {
        if (!ctx) { return; }
        for (let i=0; i<sides; ++i) {
            let angle = Math.PI / (sides/2) * i;
            if (rotate) {
                let rotation = Math.PI/sides;
                if (rotate === "half") { rotation /= 2; }
                else if (rotate === "minus-half") { rotation = -rotation / 2; }
                angle += rotation;
            }
            const corner: Point = {
                x: ctr.x + Math.cos(-angle) * rad,
                y: ctr.y + Math.sin(-angle) * rad
            };
            if (i === 0) {
                ctx.moveTo(corner.x, corner.y);
            } else {
                ctx.lineTo(corner.x, corner.y);
            }
        }
        ctx.closePath();
    }

    function drawRoundRoom(ctr: Point, rad: number) {
        if (!ctx) { return; }
        ctx.arc(ctr.x, ctr.y, rad, 0, Math.PI*2);
    }

    function onClickMap(event: MouseEvent): void {
        const {offsetX, offsetY} = event;
        clickObject(offsetX, offsetY);
    }

    function clickObject (x: number, y:number): void {
        if (!mapData) { return; }
        let maxDist = Math.pow(mapToScreenLength(roomRadius), 2);
        let distsq = 0;
        let screenPoint: ScreenPoint | undefined;
        screenPoints.forEach(sp => {
            if (sp) {
                let ds = Math.pow((x - sp.location.x), 2) + Math.pow((y - sp.location.y), 2);
                if (!screenPoint || ds < distsq) {
                    distsq = ds;
                    screenPoint = sp;
                }
            }
        })
        if (screenPoint && distsq <= maxDist) {
            setSelectedObject(screenPoint.object);
            onClick(screenPoint.object);
        } else {
            setSelectedObject(undefined);
            onClick(undefined);
        }
    }

    function mapToScreenPoint(location: Point): Point {
        return {
            x: width / 2 + location.x * unit,
            y: height / 2 + location.y * unit / 2
        };
    }

    function mapToScreenLength(length: number): number {
        return length * unit;
    }

    return (
        <canvas id="viewer" width={width} height={height} />
    );
}

function polarToCartesian (center: Point, angle: number, radius: number): Point {
    return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
    };
}

function getFloorColor(obj: MapObjectData): string {
    if (obj.light === lightSettings.DARK) { return colors.darkFloor; }
    if (obj.light === lightSettings.DARKER) { return colors.darkerFloor; }
    return "#fff";

}

export const lightSettings = {
    LIGHT: 'light',
    DARK: 'dark',
    DARKER: 'darker',
}

const colors = {
    background: "#568",
    floor: "white",
    darkFloor: "#ccd",
    darkerFloor: "#aab",
    wall: "#226",
    hilight: "#9bf",
    text: "black",
};
