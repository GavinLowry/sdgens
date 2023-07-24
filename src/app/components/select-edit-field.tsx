import { ChangeEvent, ReactNode, useEffect, useState } from 'react';

interface SelectEditFieldAttrs {
    label: string;
    value: string | undefined;
    options: string[];
    onChange(s: string): void;
}

export default function SelectEditField ({label, value, options, onChange}: SelectEditFieldAttrs): ReactNode {
    const [selection, setSelection] = useState('');

    useEffect(() => {
        if(value) { setSelection(value); }
    }, [value])

    function onSelect(event: ChangeEvent<HTMLSelectElement>) {
        const {value} = event.target;
        onChange(value);
        setSelection(value);
    }

    function onEdit(event: ChangeEvent<HTMLInputElement>) {
        const {value} = event.target;
        onChange(value);
    }

    return (
        <div className="ch-special-field">
            <label htmlFor={label}>{label}</label>
            <select onChange={onSelect} value={selection}>
                { ['', ...options].map(opt => <option value={opt} key={opt}>{opt}</option>) }
            </select>
            <input type="text" name={label} value={value} onChange={onEdit} />
        </div>
    );
}
