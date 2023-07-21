
export const terrainTypes = [
    'Desert/arctic','Swamp','Grassland','Grassland','Grassland','Forest/jungle',
    'Forest/jungle','River/coast','River/coast','Ocean','Mountain'
];

export const terrainNames = {
    DESERT: 'Desert/arctic',
    SWAMP: 'Swamp',
    GRASS: 'Grassland',
    FOREST: 'Forest/jungle',
    RIVER: 'River/coast',
    OCEAN: 'Ocean',
    MOUNT: 'Mountain',
};

export const terrainLookup = [
    {lookup: [2], name: terrainNames.DESERT, color: '#eda'},
    {lookup: [3], name: terrainNames.SWAMP, color: '#7a9'},
    {lookup: [4,5,6], name: terrainNames.GRASS, color: '#BFdEA8'},
    {lookup: [7,8], name: terrainNames.FOREST, color: 'green'},
    {lookup: [9,10], name: terrainNames.RIVER, color: '#e9c48c'},
    {lookup: [11], name: terrainNames.OCEAN, color: '#29f'},
    {lookup: [12], name: terrainNames.MOUNT, color: 'lightgray'},
];
