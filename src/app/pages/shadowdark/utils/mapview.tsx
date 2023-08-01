'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react';

export interface Point {
    x: number;
    y: number;
}

export interface MapObjectData {
    id: number;
    location: Point;
    type: string;
}

export interface RoomData extends MapObjectData {
    title: string;
    description?: string;
    featureIndex?: number;
    shape?: string;
}

export interface HallData extends MapObjectData {
    rooms: number[];
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
    const roomRadius = 1/3;

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
        data.rooms.forEach(room => {
            const center = mapToScreenPoint(room.location);
            const lineHeight = 15;
            const cursor = { ...center }

            ctx.font = "15px Arial";
            cursor.y -= lineHeight * 2;
            ctx.fillText(`${room.featureIndex}`, cursor.x, cursor.y);

            const maxWidth = 10;

            const titleAry = breakText(room.title, maxWidth);
            titleAry.forEach(word => {
                cursor.y += lineHeight
                ctx.fillText(word, cursor.x, cursor.y);
            })

            if (room.description) {
                ctx.font = "12px Arial";
                const descAry = breakText(room.description, maxWidth);
                descAry.forEach(word => {
                    ctx.fillText(word, cursor.x, cursor.y + 15);
                    cursor.y += lineHeight
                })
            }
        });
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
        if (secondPass && selectedObject && selectedObject.id === hall.id) {
            ctx.strokeStyle = colors.hilight;
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawRoom(room: RoomData, secondPass: boolean) {
        if (!ctx) { return; }
        const center = room.location;
        const ctr = mapToScreenPoint(center);
        if (!secondPass) {
            screenPoints.push({location: ctr, object: room});
        }
        const rad = mapToScreenLength(roomRadius);
        ctx.save();
        ctx.beginPath();

        switch(room.shape) {
            case 'square': drawSquareRoom(ctr, rad); break;
            case 'hex': drawHexRoom(ctr, rad); break;
            default: drawRoundRoom(ctr, rad); break;
        }

        if (secondPass && selectedObject && selectedObject.id === room.id) {
            ctx.fillStyle = colors.hilight;
            ctx.strokeStyle = colors.hilight;
        }

        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function drawHexRoom(ctr: Point, rad: number) {
        if (!ctx) { return; }
        for (let i=0; i<6; ++i) {
            const angle = Math.PI / 3 * i;
            const corner: Point = {
                x: ctr.x + Math.cos(-angle) * rad,
                y: ctr.y + Math.sin(-angle) * rad
            };
            console.log({corner});
            if (i === 0) {
                ctx.moveTo(corner.x, corner.y);
            } else {
                ctx.lineTo(corner.x, corner.y);
            }
        }
        ctx.closePath();
    }

    function drawSquareRoom(ctr: Point, rad: number) {
        if (!ctx) { return; }
        ctx.moveTo(ctr.x - rad, ctr.y - rad);
        ctx.lineTo(ctr.x + rad, ctr.y - rad);
        ctx.lineTo(ctr.x + rad, ctr.y + rad);
        ctx.lineTo(ctr.x - rad, ctr.y + rad);
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

const colors = {
    background: "#568",
    floor: "white",
    wall: "#226",
    hilight: "#9bf",
    text: "black",
};
