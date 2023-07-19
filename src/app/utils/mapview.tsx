'use client'

import {useEffect, useRef, useState} from 'react';

export interface Point {
    x: number;
    y: number;
}

export interface ExitData {
    destination: number;
    description?: string;
}

export interface RoomData {
    id: number;
    title: string;
    location: Point;
    description?: string;
    exits?: ExitData[];
}

export interface MapData {
    projectId: number;
    rooms: RoomData[];
    id?: number;
    name?: string;
}

interface ScreenPoint {
    location: Point;
    roomId: number;
}

const commands = {
    CONNECT: 'connect',
};

export interface MapViewApps {
    mapData: MapData | undefined,
    onConnect(from: RoomData, to: RoomData | undefined): void;
}

export default function MapView({mapData, onConnect}: MapViewApps) {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();

    const [selectedRoom, _setSelectedRoom] = useState<RoomData | undefined>();
    const selectedRoomRef = useRef(selectedRoom);
    const setSelectedRoom = (data: RoomData | undefined) => {
        selectedRoomRef.current = data;
        _setSelectedRoom(data);
    }
    
    const [command, _setCommand] = useState<string>('');
    const commandRef = useRef(command);
    const setCommand = (data: string) => {
        commandRef.current = data;
        _setCommand(data);
    }

    const width = 600;
    const height = 600;
    const unit = 10;
    const roomRadius = 4;
    const screenPoints: ScreenPoint[] = [];

    const colors = {
        background: "#aaa",
        floor: "white",
        wall: "black",
        hilight: "cyan",
    };

    useEffect(() => {
        const c: HTMLCanvasElement = document.getElementById("viewer") as HTMLCanvasElement;
        setCanvas(c);
        setCtx(c.getContext('2d') as CanvasRenderingContext2D);
    }, [])

    useEffect(() => {
        if (!mapData || !canvas || !ctx) { return; }
        canvas.addEventListener("click", (event) => {
            const {offsetX, offsetY} = event;
            const room = getClickedRoom(offsetX, offsetY);
            clickRoom(room);
        });
        draw();
    }, [mapData, ctx, canvas])

    useEffect(() => {
        draw();
    }, [selectedRoom])

    function clickRoom(room: RoomData | undefined) {
        if (room) {
            if (commandRef.current === commands.CONNECT) {
                if (selectedRoomRef.current) {
                    onConnect(selectedRoomRef.current, room);
                }
                setCommand('');
                setSelectedRoom(room);
            } else {
                setSelectedRoom(room);
            }
        } else {
            setSelectedRoom(undefined);
        }
    }

    function draw() {
        if (!ctx) { return; }
        ctx.fillStyle =colors.background;
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
        drawMap(mapData);
        if (selectedRoom) {
            const center = mapToScreenPoint(selectedRoom.location);
            ctx.save();
            ctx.beginPath();
            ctx.arc(center.x, center.y, mapToScreenLength(roomRadius), 0, Math.PI*2);
            ctx.strokeStyle = colors.hilight;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    function drawMap(data: MapData): void {
        if (!mapData || !ctx) {return;}
        data.rooms.forEach(room => {
            drawRoom(room);
            room.exits?.forEach(exit => {
                const destination = getRoom(exit.destination);
                drawHall(room.location, destination!.location);
            })
        });
    }

    function drawHall(map_start: Point, map_end: Point) {
        if (!ctx) { return; }
        const start = mapToScreenPoint(map_start);
        const end = mapToScreenPoint(map_end);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
    }

    function drawRoom(room: RoomData) {
        if (!ctx) { return; }
        const center = room.location;
        const ctr = mapToScreenPoint(center);
        const rad = mapToScreenLength(roomRadius);
        screenPoints.push({roomId: room.id, location: ctr});
        ctx.beginPath();
        ctx.arc(ctr.x, ctr.y, rad, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }

    function getRoom(id: number): RoomData | undefined {
        return mapData?.rooms.find(r => r.id === id);
    }

    function getClickedRoom(x: number, y:number): RoomData | undefined {
        let maxDist = Math.pow(mapToScreenLength(roomRadius), 2);
        let distsq = 0;
        let screenPoint: ScreenPoint | undefined = undefined;
        screenPoints.forEach(sp => {
            let ds = Math.pow((x - sp.location.x), 2) + Math.pow((y - sp.location.y), 2);
            if(screenPoint) {
                if (ds < distsq) {
                    distsq = ds;
                    screenPoint = sp;
                }
            } else {
                screenPoint = sp;
                distsq = ds;
            }
        })
        if (distsq <= maxDist) {
            return getRoom(screenPoint!.roomId);
        } else {
            return undefined;
        }
    }

    function mapToScreenPoint(location: Point): Point {
        return {
            x: width / 2 + location.x * unit,
            y: height / 2 + location.y * unit
        };
    }

    function mapToScreenLength(length: number): number {
        return length * unit;
    }

    function onConnectCommand() {
        setCommand(commands.CONNECT);
    }

    return (
        <div>
            <div className="mv-button-row">
                <button onClick={onConnectCommand} disabled={!selectedRoom}>connect</button>
            </div>
            <canvas id="viewer" width={width} height={height} />
        </div>
    );
}