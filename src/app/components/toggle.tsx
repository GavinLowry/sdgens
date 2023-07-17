import {SyntheticEvent} from 'react';
import './toggle.css';

interface ToggleAttrs {
    value: boolean;
    onChange(e: SyntheticEvent<HTMLInputElement, Event>): void;
}

const Toggle = ({onChange, value}: ToggleAttrs) => {
    return (
        <label className="switch">
            <input type="checkbox" onChange={onChange} checked={value}></input>
            <span className="slider round"></span>
        </label>
    );
}

export default Toggle;
