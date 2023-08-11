'use client'

import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import Link from 'next/link';
import {FilterByProject, SelectedProject} from '../../context';
import {settingsTable} from '../../database/database.config';
import {projectTable} from "../../database/database.config";
import {IProject} from "../../database/types";
import Toggle from "../../components/toggle";

import './shadowdark.css'

export default function ShadowdarkLayout({children}: {children: ReactNode}) {
    const [selectedProject, setSelectedProject] = useState<number>(0);
    const [filterByProject, setFilterByProject] = useState<boolean>(true);
    const [projects, setProjects] = useState<IProject[]>();

    useEffect(() => {
        settingsTable
          .get("selectedProject")
          .then(setting => {
            if (setting){
                setSelectedProject(parseInt(setting.value))
            }
          });
        
		projectTable.toArray().then(stored => {
			setProjects(stored);
		});
      }, []);

    function getProjectName(): string {
        if (!projects) { return ""; }
        const project = projects.find(p => p.id === selectedProject);
        return project ? project.name : 'none';
    }

    function onFilterToggle (event: SyntheticEvent<HTMLInputElement>): void {
        const {checked} = event.target as HTMLInputElement;
        setFilterByProject(checked);
    }
    
    return (
        <div className="sd-layout">
            <div className="sd-left-nav">
                <Link href="/pages/shadowdark">main</Link>
                <Link href="/pages/shadowdark/projects">projects</Link>
                <Link href="/pages/shadowdark/maps">maps</Link>
                <Link href="/pages/shadowdark/land-maps">land maps</Link>
                <Link href="/pages/shadowdark/characters">characters</Link>
                <Link href="/pages/shadowdark/npcs">npcs</Link>
                <Link href="/pages/shadowdark/random-tables">random tables</Link>
                <Link href="/pages/shadowdark/monsters">monsters</Link>
            </div>
            <div className="sd-right-column">
                <FilterByProject.Provider value={{filterByProject, setFilterByProject}}>
                <SelectedProject.Provider value={{selectedProject, setSelectedProject}}>
                    <div className="sd-status-bar">
                        <div>
                            Selected Project: {getProjectName()}
                        </div>
                        <div>
                            filter to current project
                            <Toggle onChange={onFilterToggle} value={filterByProject} />
                        </div>
                    </div>
                    <div className="sd-content">
                        {children}
                    </div>
                </SelectedProject.Provider>
                </FilterByProject.Provider>
            </div>
        </div>
    );
}
