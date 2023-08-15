'use client'

import { ReactNode, useContext, useEffect, useState } from 'react';
import { FilterByProject, SelectedProject } from '@/app/context';
import { encounterTable } from "@/app/database/database.config";
import { IEncounterTable } from "@/app/database/types";
import EncounterTableForm, { TableObject, TableEntry } from "./encounter-table-form";
import EncounterTable from './encounter-table';
import "./custom-encounter-table.css";

/*
TODO
show & test selected table
edit table
delete table
filter table list by project
component for rendering monster object
keep a few monster objects (and/or other objects) selected
*/

function CustomEncounterTable () {
	const {selectedProject, setSelectedProject} = useContext(SelectedProject);
	const {filterByProject, setFilterByProject} = useContext(FilterByProject);
    const [tableList, setTableList] = useState<TableObject[]>([]);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [selectedTable, setSelectedTable] = useState<TableObject | undefined>();

    useEffect(() =>  {
        updateTableList();
    }, [])

    function updateTableList () {
        encounterTable
        .toArray()
        .then((list) => {
            const result: TableObject[] = [
                ...list
            ]
            setTableList(list);
        })
    }

    function onSubmit(obj: TableObject): void {
        encounterTable
        .add({
            ...obj,
            projectId: selectedProject,
        })
        .then(() => {
            updateTableList();
            setShowForm(false);
        })
    }
    
    function onCancelForm (): void {
        setShowForm(false);
    }

    function onNewTable () {
        setSelectedTable(undefined);
        setShowForm(true);
    }

    function onClickEntry(entry: TableObject) {
        setSelectedTable(entry);
    }

    function renderTableListEntry(tableListEntry: TableObject): ReactNode {
        return (
            <div
                className="list-item"
                key={`${tableListEntry.title}:${tableListEntry.dice}`}
                onClick={() => onClickEntry(tableListEntry)}
            >
                {tableListEntry.title}
            </div>
        );
    }

    return (
        <div>
<<<<<<< HEAD
            <div>
                custom encounter tables
            </div>
            <div className="cet-two-columns">
                {
                    showForm
                    ?
                    <EncounterTableForm onSubmit={onSubmit} onCancel={onCancelForm} />
                    :
                    <div>
                        <button onClick={onNewTable}>new table</button>
                        <div>
                            { tableList.map(t => renderTableListEntry(t)) }
                        </div>
                    </div>
                }
                <EncounterTable table={selectedTable} />
            </div>
=======
            custom encounter tables
            <EncounterTableForm />
>>>>>>> d3a9edebb1aa4002311d5bdd4ddee76d065f54b4
        </div>
    );
}

<<<<<<< HEAD
export default CustomEncounterTable;
=======
export default CustomEncounterTable;
>>>>>>> d3a9edebb1aa4002311d5bdd4ddee76d065f54b4
