'use client'

import type {FC, ReactNode} from 'react';
import {SyntheticEvent, useContext, useEffect, useState} from 'react';
import {npcsTable} from "../../../database/database.config";
import {INpc} from "../../../database/types";
import {FilterByProject, SelectedProject} from '../../../context';
import {generateName} from '../../../utils/random';

import './npcs.css';

const Npcs: FC = () => {
	const {selectedProject, setSelectedProject} = useContext(SelectedProject);
	const {filterByProject, setFilterByProject} = useContext(FilterByProject);
	const [newNpc, setNewNpc] = useState<Npc | undefined>();
	const [npcList, setNpcList] = useState<Npc[]>([]);
	const [bigImage, setBigImage] = useState<File | undefined>();

	useEffect(() => {
		updateNpcList();
	}, []);

	useEffect(() => {
		console.log({newNpc});
	}, [newNpc])

	function updateNpcList() {
		npcsTable
		.toArray()
		.then((list) => {
			setNpcList(list);
		})
	}

	function onStoreNpc() {
		const npc = {
			...newNpc,
			projectId: selectedProject,
		}
		try {
			const id = npcsTable
			.add(npc)
			.then(() => {
				updateNpcList();
			});
		} catch (error) {
			console.error(`failed to add ${npc}: ${error}`);
		}

	}

	function onCopyNpc() {
		const npc = {...newNpc};
		delete npc.id;
		try {
			const id = npcsTable
			.add(npc)
			.then(() => {
				updateNpcList();
			});
		} catch (error) {
			console.error(`failed to add ${npc}: ${error}`);
		}

	}

	function onUpdateNpc() {
		const npc = newNpc;
		try {
			npcsTable
			.put(npc)
			.then(() => {
				updateNpcList();
			})
		} catch (error) {
			console.error(`failed to update ${npc}: ${error}`);
		}
	}

	function onDeleteNpc() {
		if (!newNpc) {return;}
		if (!confirm(`Really delete ${newNpc.name}?`)) { return; }
		try {
			if (newNpc.id) {
				npcsTable
				.delete(newNpc.id as string)
				.then(() => {
					updateNpcList();
					setNewNpc(undefined);
				})
			}
		} catch (error) {
			console.error(`failed to delete ${newNpc}: ${error}`);
		}
	}

	function onReroll(attribute: string) {
		setNewNpc(pc => ({
			...pc,
			[attribute]: reroll(attribute),
		}));
	}

	function onShowPortrait(): void {
		setBigImage(newNpc!.portrait);
	}

	function onHidePortrait():void {
		setBigImage(undefined);
	}

	function renderNpcForm(npc: Npc) {
		function onChangeField(event: SyntheticEvent<HTMLInputElement>) {
			const target = event.target as HTMLInputElement;
			const {name, value} = target;
			console.log({name, value})
			setNewNpc(pc => ({
				...pc,
				[name]: value
			}))
		}

		function renderLine(label: string, value: string | undefined) {
			if (label==='portrait'){ console.log({value})}
			return (
				<div className="npc-line" key={label}>
					<div>{label}:</div>
					<input type="text" name={label} value={value as string} onChange={onChangeField} />
					<button onClick={() => onReroll(label)}>reroll</button>
				</div>
			);
		}

		const attributeNames = Object.keys(attributes);
		return (
			<div className="npc-form">
				{attributeNames.map(n => {
					return renderLine(n, npc[n] as string)
				})}
				<div className="ai-prompt">
					<div>AI prompt</div>
					<div className="ai-prompt-content">
					{npc.wealth} {npc.age} {npc.race} {npc.occupation}. {npc.appearance}, {npc.behavior}, {npc.secret}.
					</div>
				</div>
				{ npc.portrait &&
					<div className="npc-portrait" onClick={onShowPortrait}>
						<img src={URL.createObjectURL(npc.portrait as Blob)} />
					</div>
				}
				<div>
					<input
						type="file"
						name="myImage"
						onChange={(event) => {
							const target = event.target;
							const files = target.files;
							const portrait = files && files.length > 0 ? files[0] : undefined;
							setNewNpc(pc => ({
								...pc,
								portrait,
							}))
						}}
					/>
				</div>
				<div className="npc-form-button-row">
					{
						npc.id
						?
						<>
							<button onClick={onUpdateNpc}>update</button>
							<button onClick={onCopyNpc}>create copy</button>
							<button onClick={onDeleteNpc}>delete</button>
						</>
						:	
						<button onClick={onStoreNpc}>keep</button>
					}
				</div>
			</div>
		);
	}

	function onClickStoredNpc(npc: Npc): void {
		console.log({npc})
		setNewNpc({...npc})
	}

	function renderStoredNpcListItem(npc: Npc): ReactNode {
		const getDisplay = (npc: Npc): string => {
			return `(${npc.projectId}) ${npc.name}: ${npc.race} ${npc.occupation}`
		}

		return (
			<div
				className="list-item"
				key={`${npc.id}:${npc.name}`}
				onClick={() => onClickStoredNpc(npc)}
			>
				{getDisplay(npc)}
			</div>
		);
	}

	function onGenerate() {
		setNewNpc(generate());
	}

	return (
		bigImage
		?
		<div onClick={onHidePortrait}>
			<img src={URL.createObjectURL(bigImage as Blob)} />
		</div>
		:
		<div>
			<button onClick={onGenerate}>Generate new NPC</button>
			{newNpc && renderNpcForm(newNpc)}
			<div className="npc-list">
				{
					npcList
						.filter(npc => !filterByProject || parseInt(npc.projectId as string ?? '') === selectedProject)
						.map(npc => renderStoredNpcListItem(npc))
				}
			</div>
		</div>
	);
}

interface Npc {
	name?: string;
	race?: string;
	age?: string;
	alignment?: string;
	wealth?: string;
	appearance?: string;
	behavior?: string;
	secret?: string;
	occupation? :string;
	portrait?: File;
    [key: string]: string | File | undefined;
}

const attributes: {[key: string]: string[]} = {
	name: [],
	race: ['human','elf','dwarf','halfling','half-orc','goblin'],
	occupation: ['gravedigger','tax collector','baker','locksmith','carpenter','farmer','cook','cobbler','scholar','bartender','sailor','friar/nun','blacksmith','beggar','butcher','merchant'],
	age: ['adolescent','young adult','adult','middle-aged','elderly','ancient'],
	alignment: ['lawful','neutral','chaotic'],
	wealth: ['poor','standard','successful','wealthy','extravagant'],
	appearance: ['balding','stocky build','very tall','beauty mark','one eye','braided hair','muscular','white hair','facial scar','willowy build','sweaty','cleft chin','frail','big eyebrows','tattooed','floppy hat','gold tooth','six fingers','very short','large nose'],
	behavior: ['spits','always eating','moves quickly','card tricks','prays aloud','writes in diary','apologetic','slaps backs','drops things','swears oath','makes puns','rare accent','easily spooked','forgetful','speaks quietly','twitches','moves slowly','speaks loudly','swaggers','smokes pipe'],
	secret: ['hiding a fugitive','adores baby animals','obsessed with fire','in a religious cult','is a half-demon','was a wizard\'s apprentice','needlessly picks pockets','has a false identity','afraid of storms','has functional gills','in deep gambling debt','works as a smuggler','is a werewolf','can actually smell lies','cast out of wealthy family','in love with a bartender','left the thieves\' guild','best friends with a prince','retired crawler','has a pet basilisk'],
};

function roll(lo: number, hi: number): number {
	const span = hi - lo + 1;
	return Math.floor(Math.random() * span) + lo;
}

function chooseRandom(attribute: string): string {
	const options = attributes[attribute];
	return options[roll(0,options.length-1)];
}

function generate(): Npc {
	const npc: Npc = {};
	const attributeNames = Object.keys(attributes);
	attributeNames.forEach(name => {
		if(name==='name') {
			npc.name = generateName();
		} else {
			npc[name] = chooseRandom(name);
		}
	})
	return npc;
}

function reroll(attribute: string) {
	const newValue = attribute === 'name'
	? generateName()
	: chooseRandom(attribute);
	return newValue;
}

export default Npcs;


