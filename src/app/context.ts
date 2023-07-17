'use client';

import {createContext} from 'react';

export const SelectedProject = createContext<{selectedProject: number, setSelectedProject: (n: number)=>void}>(
    {
        selectedProject: 0,
        setSelectedProject: (n: number) => {},
    }
);

export const FilterByProject = createContext<{filterByProject: boolean, setFilterByProject: (b: boolean)=>void}>(
    {
        filterByProject: true,
        setFilterByProject: (b: boolean) => {},
    }
);
