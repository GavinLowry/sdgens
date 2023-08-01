import { ChangeEvent, useEffect, useState } from 'react';
import Modal from '../../../components/modal';
import { MapData, RoomData } from "../utils/mapview";
import DarkMap from "../utils/darkMap";

import "./edit-room-modal.css";

interface EditRoomModalAttrs {
    roomId: number,
    mapData: MapData,
    onSubmit(room: RoomData): void,
    onCancel(): void,
}

export default function EditRoomModal({roomId, mapData, onSubmit, onCancel}: EditRoomModalAttrs) {
    console.log({roomId, mapData, onSubmit, onCancel})
    if (!mapData) { return (<></>); }
    const [editRoom, setEditRoom] = useState<RoomData>();
    const [editTitle, setEditTitle] = useState<string>("");
    const [editDescription, setEditDescription] = useState<string>("");
    const [editRadius, setEditRadius] = useState<string>("");

    useEffect(() => {
        const room = DarkMap.getRoom(mapData, roomId);
        if (room) {
            setEditRoom(room);
            setEditTitle(room.title);
            setEditDescription(room.description ?? "");
            setEditRadius(`${room.radius || 7}`);
        }
    }, [roomId])

    function onChangeEditTitle(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        setEditTitle(target.value);
    }

    function onChangeEditDescription(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        setEditDescription(target.value);
    }

    function onChangeEditRadius(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        setEditRadius(target.value);
    }

    function onSubmitEditRoom(): void {
        const newRoom: RoomData = {
            ...editRoom as RoomData,
            title: editTitle ?? "",
            description: editDescription ?? "",
            radius: parseInt(editRadius ?? "0"),
        };
        onSubmit(newRoom);
    }

    function onCancelEditRoom(): void {
        onCancel();
    }

    function onReroll(): void {
        const {title, description} = DarkMap.rollRoomFeatures();
        setEditTitle(title);
        setEditDescription(description);
    }

    return (
        <Modal
            title="Edit Room"
            open={ !!editRoom }
        >
            <div>
                id: {roomId}
            </div>
            <div className="erm-feature-form">
                <div>
                    <label htmlFor='title'>Title</label>
                    <input type="text" name="title" value={editTitle} onChange={onChangeEditTitle} />
                </div>
                <div>
                    <label htmlFor='Description'>Description</label>
                    <input type="text" name="Description" value={editDescription} onChange={onChangeEditDescription} />
                </div>
                <div>
                    <label htmlFor='radius'>Radius</label>
                    <input type="text" name="radius" value={editRadius} onChange={onChangeEditRadius} />
                </div>
            </div>
            <div className="sd-control-row">
                <button onClick={onSubmitEditRoom}>submit</button>
                <button onClick={onReroll}>reroll</button>
                <button onClick={onCancelEditRoom}>cancel</button>
            </div>
        </Modal>
    );
}
