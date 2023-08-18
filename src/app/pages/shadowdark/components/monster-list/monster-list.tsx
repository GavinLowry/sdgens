import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { FilterByProject, SelectedProject } from '@/app/context';
import { monsterTable } from "@/app/database/database.config";
import { Monster } from "../../monsters/monster-form";

interface MonsterListAttrs {
    onClick(m: Monster): void,
}

export default function MonsterList ({onClick}: MonsterListAttrs) {
	const {selectedProject, setSelectedProject} = useContext(SelectedProject);
	const {filterByProject, setFilterByProject} = useContext(FilterByProject);
    const [monsterList, setMonsterList] = useState<any[]>([]);
    const [filterLevel, _setFilterLevel] = useState<string>("");
    const filterLevelRef = useRef(filterLevel);
    const setFilterLevel = (level: string) => {
        console.log({level})
        filterLevelRef.current = level;
        _setFilterLevel(level);
    }

    useEffect(() => {
        updateMonsterList();
    }, [])

    function updateMonsterList() {
		monsterTable
		.toArray()
		.then((list) => {
            console.log({list})
			setMonsterList(list);
		})
	}

    function onChangeFilterLevel (event: ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;
        console.log({value})
        setFilterLevel(value);
    }

    return (
        <div>
            <div>
                <label htmlFor="filter-level">level</label>
                <input type="text" value={filterLevel} onChange={onChangeFilterLevel} />
            </div>
            {
                monsterList
                .filter(m => !filterByProject || m.projectId === selectedProject)
                .filter(m => filterLevelRef.current === "" || m.level === filterLevelRef.current)
                .map((m, index) => (
                    <div onClick={() => onClick(m)} className="list-item" key={`${index}:${m.name}`}>
                        {m.name}
                    </div>
                ))
            }
        </div>
    );

}