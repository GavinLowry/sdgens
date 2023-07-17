"use client"

import {FormEvent, useContext, useEffect, useState} from 'react';
import type {FC} from 'react';
import {projectTable, settingsTable} from "../../../database/database.config";
import {IProject} from "../../../database/types";
import Modal from "../../../components/modal";
import {SelectedProject} from '../../../context';

import './projects.css';

const Projects: FC = () => {
	const [projects, setProjects] = useState<IProject[]>([]);
	const [showProjectModal, setShowProjectModal] = useState(false);
	const [clickedProject, setClickedProject] = useState<IProject>();
	const {selectedProject, setSelectedProject} = useContext(SelectedProject);

	useEffect(() => {
		projectTable.toArray().then((stored: IProject[]) => {
			console.log({stored});
			setProjects(stored);
		});
	}, []);

	function onClickProjectEntry(entryId: number) {
		setClickedProject(projects.find(p => p.id === entryId));
		setShowProjectModal(true);
	}

	function onCloseProjectModal() {
		setShowProjectModal(false);
	}

	function renderProjectName(entry: IProject) {
		return (
			<div
				className="project-list-entry"
				key={`project-${entry.id}`}
				onClick={() => onClickProjectEntry(entry.id)}
			>
				{entry.name}
			</div>
		);
	}

	const createProject = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
        const target: HTMLFormElement = event.target as HTMLFormElement;
        console.log({target})
        const nameField: HTMLInputElement = target.projectName;
		const name = nameField.value;
		if (!name) {
			console.log('name is required');
			return;
		}
		const project: Partial<IProject> = {name}
		try {
			const id = await projectTable.add(project);
			console.info(`new project created with id ${id}`);
			target.reset();
			updateProjectList();
		} catch (error) {
			console.error(`failed to add ${project}: ${error}`);
		}
	}

	const updateProjectList = () => {
		projectTable
			.toArray()
			.then((result) => {
				setProjects(result);
			});
	}

	function onOpenProject() {
        console.log('onOpenProject')
        if (!clickedProject) {return;}
		setSelectedProject(clickedProject.id);
        console.log({selectedProject})
        settingsTable.put({id: "selectedProject", value: clickedProject.id})
        .then(() => {
            settingsTable.toArray()
            .then((result) => {
                console.log({result})
            })
        });
	}

	function onDeleteProject() {
        if (!clickedProject) {return;}
		if (confirm(`Delete the ${clickedProject.name} project?`)) {
			console.log('delete',{clickedProject});
			projectTable
				.delete(clickedProject.id)
				.then(() => {updateProjectList()});
		}
	}

	return (
		<div className="projects-page">
			<div className="left-side">
                stored projects:
                <div className="project-list">
                    {projects.map(p => renderProjectName(p))}
                </div>
			</div>
			<div className="right-side">
				<form className="add-form" onSubmit={createProject}>
					<p>add a project</p>
					<label htmlFor="projectName">Name:</label>
					<input type="text" id="projectName" name="projectName"/>
					<button type="submit">create</button>
				</form>
			</div>
			<Modal 
				open={showProjectModal} 
				onClose={onCloseProjectModal}
				title="Project Details"
			>
				{clickedProject && <>
					<div>
						name: {clickedProject.name}
					</div>
					<div>
						id: {clickedProject.id}
					</div>
					<div className="modal-action-row">
						{ clickedProject.id === selectedProject
							?
							<div>project is open</div>
							:
							<button className="modal-action" onClick={onOpenProject}>
								open project
							</button>
						}
						<button className="modal-action modal-action-delete" onClick={onDeleteProject}>
							delete project
						</button>
					</div>
				</>}
			</Modal>
		</div>
	);
}

export default Projects;


