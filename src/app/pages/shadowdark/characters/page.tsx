'use client'

import { useContext, useEffect, useState } from 'react';
import { FilterByProject, SelectedProject } from '@/app/context';
import { chooseRandom, generateName } from '../utils/random';
import {
    alignmentOptions, ancestryOptions, backgroundOptions
} from '../utils/lookup-tables';
import { characterTable } from '@/app/database/database.config';
import { StoredItem } from '@/app/database/types';
import { StoredItemList } from '@/app/components/stored-item-list';
import { Character, CharacterSheet, rollStats } from './character-sheet';

import './characters.css';

export default function Characters () {
	const {selectedProject} = useContext(SelectedProject);
	const {filterByProject} = useContext(FilterByProject);
    const [character, setCharacter] = useState<Character>();
    const [characterList, setCharacterList] = useState<Character[]>();

    useEffect(() => {
        updateCharacterList();
    }, [selectedProject, filterByProject]);

    function onClickGenerate (): void {
        const ch: Character = {
            projectId: selectedProject,
            name: generateName(),
            ancestry: chooseRandom(ancestryOptions),
            background: chooseRandom(backgroundOptions),
            class: '',
            alignment: chooseRandom(alignmentOptions),
            level: 1,
            stats: rollStats(),
            talents: [],
        };
        setCharacter(ch);
    }

    function onChangeCharacter (temp: Character): void {
        setCharacter(temp);
    }

    function updateCharacterList (): void {
		characterTable
		.toArray()
		.then((list) => {
            const filtered = list.filter(c => {
                return !filterByProject || c.projectId === selectedProject;
            });
			setCharacterList(filtered);
		})
    }

    function onSaveCharacter (): void {
		try {
            if (character?.id) {
                characterTable
                .put(character)
                .then(() => {
                    updateCharacterList();
                });
            } else {
                const id = characterTable
                .add(character)
                .then(() => {
                    updateCharacterList();
                });
            }
		} catch (error) {
			console.error(`failed to add ${character}: ${error}`);
		}
    }

    function onClickStoredCharacter (characterId: number): void {
        const char = characterList?.find(c => c.id === characterId)
        if (char) {
            setCharacter(char);
        }
    }

    return (
        <div className="ch-main">
            <div>
                <div>characters</div>
                {
                    characterList && 
                    <StoredItemList itemList={characterList as StoredItem[]} onClick={onClickStoredCharacter} />
                }
            </div>
            <div>
                <div className="sd-control-row">
                    <button onClick={onClickGenerate}>generate</button>
                    <button onClick={onSaveCharacter}>save</button>
                </div>
                { character && <CharacterSheet character={character} onChange={onChangeCharacter} /> }
            </div>
        </div>
    );
}
