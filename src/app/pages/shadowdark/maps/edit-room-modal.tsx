import { ChangeEvent, useEffect, useState } from 'react';
import Modal from '../../../components/modal';
import { MapData, RoomData } from "../utils/mapview";
import DarkMap from "../utils/darkMap";

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
    const [editFeatureIndex, setEditFeatureIndex] = useState<string>("");

    useEffect(() => {
        const room = DarkMap.getRoom(mapData, roomId);
        if (room) {
            setEditRoom(room);
            setEditTitle(room.title);
            setEditDescription(room.description ?? "");
            setEditFeatureIndex(`${room.featureIndex}`);
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

    function onChangeEditFeatureIndex(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        setEditFeatureIndex(target.value);
    }

    function onSubmitEditRoom(): void {
        const newRoom: RoomData = {
            ...editRoom as RoomData,
            title: editTitle ?? "",
            description: editDescription ?? "",
            featureIndex: parseInt(editFeatureIndex ?? "0"),
        };
        onSubmit(newRoom);
    }

    function onCancelEditRoom(): void {
        onCancel();
    }

    return (
        <Modal
            title="Edit Room"
            open={ !!editRoom }
        >
            <div>
                id: {roomId}
            </div>
            <div>
                <label htmlFor='title'>Title</label>
                <input type="text" name="title" value={editTitle} onChange={onChangeEditTitle} />
            </div>
            <div>
                <label htmlFor='Description'>Description</label>
                <input type="text" name="Description" value={editDescription} onChange={onChangeEditDescription} />
            </div>
            <div>
                <label htmlFor='featureIndex'>FeatureIndex</label>
                <input type="text" name="featureIndex" value={editFeatureIndex} onChange={onChangeEditFeatureIndex} />
            </div>
            <div className="sd-control-row">
                <button onClick={onSubmitEditRoom}>submit</button>
                <button onClick={onCancelEditRoom}>cancel</button>
            </div>
        </Modal>
    );
}
