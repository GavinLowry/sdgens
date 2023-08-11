'use client'

import { ChangeEvent, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import MonsterForm, { fieldNames, FormFields } from './monster-form';
import { FilterByProject, SelectedProject } from '@/app/context';
import { monsterTable } from "@/app/database/database.config";
import { IMonster } from "@/app/database/types";

function Monsters () {
	const {selectedProject, setSelectedProject} = useContext(SelectedProject);
	const {filterByProject, setFilterByProject} = useContext(FilterByProject);
    const [formData, setFormData] = useState<FormFields>();
    const [showForm, setShowForm] = useState<boolean>(false);
    const [monsterList, setMonsterList] = useState<any[]>([]);

    const [filterLevel, _setFilterLevel] = useState<string>("");
    const filterLevelRef = useRef(filterLevel);
    const setFilterLevel = (level: string) => {
        console.log({level})
        filterLevelRef.current = level;
        _setFilterLevel(level);
    }

    useEffect(() => {
        const data = makeDefaultObject();
        setFormData(data);
        updateMonsterList();
    }, [])

    function makeDefaultObject (): FormFields {
        return fieldNames.reduce((ac, f) => ({...ac, [f]: ''}), {});
    }

	function storeMonster(data: FormFields) {
		const monster = {
			...data,
			projectId: selectedProject,
		}
        console.log({monster})
		try {
			const id = monsterTable
			.add(monster)
			.then(() => {
				updateMonsterList();
			});
		} catch (error) {
			console.error(`failed to add ${monster}: ${error}`);
		}
	}

    function updateMonster (data: FormFields) {
        try {
            monsterTable
            .put(data)
            .then(() => {
                updateMonsterList();
            })
		} catch (error) {
			console.error(`failed to add ${data}: ${error}`);
		}
    }

    function deleteMonster (data: FormFields) {
        monsterTable.delete(data.id).then(() => {
            updateMonsterList();
        });
    }

    function onDelete () {
        if (!formData) { return; }
        if (!window.confirm(`Really delete ${formData.name}?`)) { return; }
        deleteMonster(formData);
        setShowForm(false);
    }

    function updateMonsterList() {
		monsterTable
		.toArray()
		.then((list) => {
            console.log({list})
			setMonsterList(list);
		})
	}

    const onSubmit = (data?: FormFields) => {
        if (!data) {
            setFormData(undefined);
            return;
        }
        if (data.id && parseInt(data.id) > 0) {
            updateMonster(data);
        } else {
            const storeData = {
                ...data,
                projectId: selectedProject,
            };
            storeMonster(storeData as any);
        }
        setShowForm(false);
        updateMonsterList();
    };

    function onClickList (monster: FormFields) {
        setFormData(monster);
        console.log({monster})
        setShowForm(true);
    }

    function onNewMonster () {
        setFormData(makeDefaultObject());
        setShowForm(true);
    }

    function onChangeFilterLevel (event: ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;
        console.log({value})
        setFilterLevel(value);
    }

    function renderMonsterList(): ReactNode {
        const filterLevel = filterLevelRef.current;
        return (
            <div>
                <div>
                    <label htmlFor="filter-level">level</label>
                    <input type="text" value={filterLevel} onChange={onChangeFilterLevel} />
                </div>
                <button onClick={onNewMonster}>new</button>
                {
                    monsterList
                    .filter(m => !filterByProject || m.projectId === selectedProject)
                    .filter(m => filterLevel === "" || m.level === filterLevel)
                    .map((m, index) => (
                        <div onClick={() => onClickList(m)} className="list-item" key={`${index}:${m.name}`}>
                            {m.name}
                        </div>
                    ))
                }
            </div>
        );
    }

    return (
        <div>
            monsters page
            {
                showForm && formData ?
                <MonsterForm data={formData} onSubmit={onSubmit} onDelete={onDelete} />
                :
                renderMonsterList()
            }
        </div>
    );
}

export default Monsters;
