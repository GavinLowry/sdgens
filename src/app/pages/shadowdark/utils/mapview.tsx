'use client'

import {useEffect, useRef, useState} from 'react';

export interface Point {
    x: number;
    y: number;
}

export interface ExitData {
    id: number;
    destination: number;
    description?: string;
}

export interface RoomData {
    id: number;
    location: Point;
    title: string;
    description?: string;
    featureIndex?: number;
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
    type: string;
}

export interface RoomExit {
    room: RoomData;
    exit: ExitData;
}

type ObjectType = "room" | "hall";

interface ClickedObject {
    type: ObjectType;
    object: RoomData | RoomExit;
}

const commands = {
    CONNECT: 'connect',
};

export interface MapViewApps {
    mapData: MapData | undefined,
    onConnect(from: RoomData, to: RoomData | undefined): void;
    onRerollRoom(room: RoomData): void;
    onEditRoom(room: RoomData): void;
    onRemoveHall(exit: RoomExit): void;
}

export default function MapView({mapData, onConnect, onRerollRoom, onEditRoom, onRemoveHall}: MapViewApps) {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();

    const [selectedExit, _setSelectedExit] = useState<RoomExit | undefined>();
    const selectedExitRef = useRef(selectedExit);
    const setSelectedExit = (exit: RoomExit | undefined) => {
        selectedExitRef.current = exit;
        _setSelectedExit(exit);
    }

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
        background: "#568",
        floor: "white",
        wall: "#226",
        hilight: "#9bf",
        text: "black",
    };

    useEffect(() => {
        const c: HTMLCanvasElement = document.getElementById("viewer") as HTMLCanvasElement;
        setCanvas(c);
        setCtx(c.getContext('2d') as CanvasRenderingContext2D);
    }, [])

    useEffect(() => {
        if (!mapData || !canvas || !ctx) { return; }
        canvas.addEventListener("click", onClick);
        document.addEventListener('keypress', (event) => {
            const name = event.key;
            const code = event.code;
            if (name === 'c') {
                if (selectedRoomRef.current) {
                    onConnectCommand();
                }
            }
        });
        draw();
    }, [mapData, ctx, canvas])

    useEffect(() => {
        draw();
    }, [selectedRoom])

    useEffect(() => {
        console.log({selectedExit:selectedExit?.exit.id ?? 'none'})
        draw();
    }, [selectedExit])

    function onClick(event: MouseEvent): void {
        const {offsetX, offsetY} = event;
        const obj = getClickedObject(offsetX, offsetY);
        if (obj) {
            console.log({obj})
            if (obj.type === "hall") {
                setSelectedExit(obj.object as RoomExit);
                setSelectedRoom(undefined);
            }
            else if (obj.type === "room") {
                clickRoom(obj.object as RoomData);
                setSelectedExit(undefined);
            }
        } else {
            setSelectedExit(undefined);
            setSelectedRoom(undefined);
        }
    }

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

        if (selectedExit) {
            const fromId = selectedExit.room.id;
            const toId = selectedExit.exit.destination;
            const fromRoom = getRoom(fromId);
            const toRoom = getRoom(toId);
            const fromPoint = mapToScreenPoint(fromRoom!.location);
            const toPoint = mapToScreenPoint(toRoom!.location);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(fromPoint.x, fromPoint.y);
            ctx.lineTo(toPoint.x, toPoint.y);
            ctx.strokeStyle = colors.hilight;
            ctx.stroke();
            ctx.restore();
        }

        ctx.fillStyle = colors.text;
        ctx.textAlign = "center";
        drawMapText(mapData);

        ctx.restore();
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

            const titleAry = room.title.split(" ");
            titleAry.forEach(word => {
                cursor.y += lineHeight
                ctx.fillText(word, cursor.x, cursor.y);
            })

            if (room.description) {
                ctx.font = "12px Arial";
                const descAry = room.description.split(" ");
                descAry.forEach(word => {
                    ctx.fillText(word, cursor.x, cursor.y + 15);
                    cursor.y += lineHeight
                })
            }
        });
    }

    function drawMap(data: MapData): void {
        if (!mapData || !ctx) {return;}
        data.rooms.forEach(room => {
            drawRoom(room);
            room.exits?.forEach(exit => {
                const destination = getRoom(exit.destination);
                drawHall(room.location, destination!.location, exit);
            })
        });
    }

    function drawHall(map_start: Point, map_end: Point, exit: ExitData) {
        if (!ctx) { return; }
        const start = mapToScreenPoint(map_start);
        const end = mapToScreenPoint(map_end);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();

        const screenx = start.x + (end.x - start.x) / 2;
        const screeny = start.y + (end.y - start.y) / 2;
        screenPoints.push({roomId: exit.id, location: {x:screenx, y:screeny}, type:'hall'});
    }

    function drawRoom(room: RoomData) {
        if (!ctx) { return; }
        const center = room.location;
        const ctr = mapToScreenPoint(center);
        const rad = mapToScreenLength(roomRadius);
        screenPoints.push({roomId: room.id, location: ctr, type: 'room'});
        ctx.beginPath();
        ctx.arc(ctr.x, ctr.y, rad, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }

    function getRoom(id: number): RoomData | undefined {
        return mapData?.rooms.find(r => r.id === id);
    }

    function getExit(id: number): RoomExit | undefined {
        if (!mapData) { return; }
        for (let room of mapData.rooms) {
            if (room.exits) {
                for (let exit of room.exits) {
                    if (exit.id === id) {
                        return {room, exit};
                    }
                }
            }
        }
        return;
    }

    function getClickedObject (x: number, y:number): ClickedObject | undefined {
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
            const type: ObjectType = screenPoint!.type as ObjectType;
            if (type === "room") {
                const room = getRoom(screenPoint!.roomId);
                return {type, object: room as RoomData};
            } else {
                const hall = getExit(screenPoint!.roomId);
                return {type, object: hall as RoomExit};
            }
        } else {
            return undefined;
        }
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

    function onRerollRoomFeatures() {
        if (!selectedRoom) { return; }
        onRerollRoom(selectedRoom)
    }

    function onEditRoomFeatures() {
        if (!selectedRoom) { return; }
        onEditRoom(selectedRoom)
    }

    function handleRemoveHall() {
        console.log('onRemoveHall')
        onRemoveHall(selectedExitRef.current!);
        setSelectedExit(undefined);
    }

    return (
        <div>
            <div className="sd-control-row">
                <button onClick={onConnectCommand} disabled={!selectedRoom}>connect</button>
                <button onClick={onRerollRoomFeatures} disabled={!selectedRoom}>re-roll features</button>
                <button onClick={onEditRoomFeatures} disabled={!selectedRoom}>edit features</button>
                <button onClick={handleRemoveHall} disabled={!selectedExit}>remove hall</button>
            </div>
            <canvas id="viewer" width={width} height={height} />
        </div>
    );
}