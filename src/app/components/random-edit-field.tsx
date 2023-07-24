import { ChangeEvent, ReactNode } from 'react';

interface RandomEditFieldAttrs {
    label: string;
    value: string | undefined;
    reroll(): string;
    onChange(s: string): void;
}

export default function RandomEditField ({label, value, reroll, onChange}: RandomEditFieldAttrs): ReactNode {
    function onClick() {
        onChange(reroll());
    }

    function onEdit(event: ChangeEvent<HTMLInputElement>) {
        const {value} = event.target;
        onChange(value);
    }

    return (
        <div className="ch-special-field">
            <label htmlFor={label}>{label}</label>
            <button onClick={onClick}>reroll</button>
            <input type="text" name={label} value={value} onChange={onEdit} />
        </div>
    );
}
