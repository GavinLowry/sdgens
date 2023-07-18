'use client'

import {useEffect} from 'react';

export interface Point {
    x: number;
    y: number;
}

export interface RoomData {
    title: string;
    location: Point;
    exits: number[];
}

export interface MapData {
    rooms: RoomData[];
}

interface CircleOptions {
    fill?: string;
    stroke?: string;
}

export default function MapView({mapData}: {mapData: MapData | undefined}) {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    const width = 600;
    const height = 600;
    const unit = 10;
    const roomRadius = 4;

    const colors = {
        background: "#aaa",
        floor: "white",
        wall: "black",
    };

    useEffect(() => {
        console.log({mapData})
        if(!mapData) {return;}
        draw();
    }, [mapData])

    function draw() {
        if (!canvas || !ctx) {
            canvas = document.getElementById("viewer") as HTMLCanvasElement;
            ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        }

        console.log('draw')
        ctx.fillStyle =colors.background;
        ctx.fillRect(0,0,width,height);
        if (!mapData) {return;}

        mapData.rooms.forEach(room => {
            drawCircle(room.location, roomRadius, {fill: colors.floor});
        });
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

    function drawCircle(center: Point, radius: number, options: CircleOptions) {
        const ctr = mapToScreenPoint(center);
        const rad = mapToScreenLength(radius);
        ctx.beginPath();
        ctx.arc(ctr.x, ctr.y, rad, 0, Math.PI*2);
        if (options.fill) {
            ctx.fillStyle = options.fill;
            ctx.fill();
        }
        if (options.stroke) {
            ctx.strokeStyle = options.stroke;
            ctx.stroke();
        }
    }

    return (
        <div>
            <canvas id="viewer" width={width} height={height} />
        </div>
    );
}