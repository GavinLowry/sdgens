'use client'

import { useContext, useState } from 'react';
import { useForm, FieldPath } from 'react-hook-form';
import "./monster-form.css";

interface MonsterFormAttrs {
    data: FormFields;
    onSubmit(data?: FormFields): void;
    onDelete(): void;
}

function MonsterForm ({data, onSubmit, onDelete}: MonsterFormAttrs) {
    const { handleSubmit, register } = useForm<FormFields>({
        defaultValues: data,
    });

    const onFormSubmit = handleSubmit ((data: FormFields) => {
        onSubmit(data);
    });

    interface InputAttrs {
        name: FieldPath<FormFields>;
        long?: boolean;
    }

    function Input({ name, long }: InputAttrs) {
        return (
            <div className={`mf-input-wrapper${long ? " long" : ""}`}>
                <label htmlFor={name}>{name}</label>
                <input {...register(name)} placeholder={name} />
            </div>
        );
    }

    function TextArea({ name, cols }: {name: string, cols?: number}) {
        return (
            <>
                <label htmlFor={ name }>{ name }</label>
                <textarea {...register(name)} placeholder={ name } rows={4} cols={cols ?? 50} />
            </>
        )
    }

    function onCancel () {
        onSubmit();
    }

    return (
        <form onSubmit={onFormSubmit} className="mf">
            <div className="mf-stat-block">
                <Input name={"name"} long={true} />
                <TextArea name="details" />
            </div>

            <div className="mf-two-columns">
                <div className="mf-stat-block half">
                    {["level", "al", "ac", "hp", "mv"].map((n, index) => <Input key={`${index}:${n}`} name={n} />)}
                    <TextArea name="attacks" cols={20} />
                </div>
                
                <div className="mf-stat-block half">
                    <span>stat modifiers</span>
                    {["str", "dex", "con", "int", "wil", "cha"].map((n, index) => <Input key={`${index}:${n}`} name={n} />)}
                </div>
            </div>

            <div className="mf-stat-block">
                <TextArea name="extras" />
            </div>
            
            <div className="mf-stat-block mf-control-row">
                <input type="submit" />
                <button onClick={onCancel}>cancel</button>
                { data.id &&
                    <button onClick={onDelete}>delete</button>
                }
            </div>
        </form>
    );
}

export const fieldNames = ["name", "details", "ac", "hp", "atk", "mv", "str", "dex", "con", "int", "wil", "cha", "level", "al", "extras"];
type FormValues = typeof fieldNames[number];
export type FormFields = {
    [key: FormValues]: string;
}

export default MonsterForm;
