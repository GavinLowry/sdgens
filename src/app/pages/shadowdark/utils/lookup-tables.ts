
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

// character sheet

export const backgroundOptions = [
    "Urchin. You grew up in the merciless streets of a large city",
    "Wanted. There's a price on your head, but you have allies",
    "Cult Initiate. You know blasphemous secrets and rituals",
    "Thieves' Guild. You have connections, contacts, and debts",
    "Banished. Your people cast you out for supposed crimes",
    "Orphaned. An unusual guardian rescued and raised you",
    "Wizard's Apprentice. You have a knack and eye for magic",
    "Jeweler. You can easily appraise value and authenticity",
    "Herbalist. You know plants, medicines, and poisons",
    "Barbarian. You left the horde, but it never quite left you",
    "Mercenary. You fought friend and foe alike for your coin",
    "Sailor. Pirate, privateer, or merchant — the seas are yours",
    "Acolyte. You're well trained in religious rites and doctrines",
    "Soldier. You served as a fighter in an organized army",
    "Ranger. The woods and wilds are your true home",
    "Scout. You survived on stealth, observation, and speed",
    "Minstrel. You've traveled far with your charm and talent",
    "Scholar. You know much about ancient history and lore",
    "Noble. A famous name has opened many doors for you",
    "Chirurgeon. You know anatomy, surgery, and first aid",
];

interface ClassDetail {
    name: string;
    weapons: string;
    armor: string;
    hitDie: number;
    specials: {title: string, details: string}[];
    talents: {lookup: number[], effect: string}[];
    spellsKnown?: (level: number, tier: number) => number;
}

export const classDetails: ClassDetail[] = [
    {
        name: 'fighter',
        weapons: 'all weapons',
        armor: 'all armor and shields',
        hitDie: 8,
        specials: [
            { title: 'Hauler', details: "Add your Constitution modifier, if positive, to your gear slots." },
            { title: "Weapon Mastery", details: "Choose one type of weapon, such as longswords. You gain +1 to attack and damage with that weapon type. In addition, add half your level to these rolls (round down)." },
            { title: "Grit", details: "Choose Strength or Dexterity. You have advantage on checks of that type to overcome an opposing force, such as kicking open a stuck door (Strength) or slipping free of rusty chains (Dexterity)." },
        ],
        talents: [
            {lookup: [2], effect: "Gain Weapon Mastery with one additional weapon type"},
            {lookup: [3,4,5,6], effect: "+1 to melee and ranged attacks"},
            {lookup: [7,8,9], effect: "+2 to Strength, Dexterity, or Constitution stat"},
            {lookup: [10,11], effect: "Choose one kind of armor. You get +1 AC from that armor"},
            {lookup: [12], effect: "Choose a talent or +2 points to distribute to stats"},
        ],
    },
    {
        name: 'priest',
        weapons: "Club, crossbow, dagger, mace, longsword, staff, warhammer",
        armor: "All armor and shields",
        hitDie: 6,
        specials: [
            {
                title: "Languages",
                details: "You know Celestial, Diabolic, or Primordial.",
            },
            {
                title: "Turn Undead",
                details: "You know the turn undead spell. It doesn’t count toward your number of known spells."
            },
            {
                title: "Deity",
                details: "Choose a deity to serve who matches your alignment (see Deities, pg. 28). You have a holy symbol for your deity (it takes up no gear slots)."
            },
            {
                title: "Spellcasting",
                details: "You can cast priest spells you know. You know two tier 1 spells of your choice from the priest spell list on pg. 51. Each time you gain a level, you choose new priest spells to learn according to the Priest Spells Known table. For casting priest spells, see Spellcasting on pg. 44"
            },
        ],
        talents: [
            {lookup: [2], effect: "Gain advantage on casting one spell you know"},
            {lookup: [3,4,5,6], effect: "+1 to melee or ranged attacks"},
            {lookup: [7,8,9], effect: "+1 to priest spellcasting checks"},
            {lookup: [10,11], effect: "+2 to Strength or Wisdom stat"},
            {lookup: [12], effect: "Choose a talent or +2 points to distribute to stats"},
        ],
        spellsKnown: (level: number, tier: number) => {
            if (level === 0 || tier > 5) { return 0; }
            const firstLevelOfTier = tier * 2 - 1;
            if (level < firstLevelOfTier) { return 0; }
            if (level === firstLevelOfTier) { return tier === 1 ? 2 : 1; }
            if (level < firstLevelOfTier + 4) { return tier === 1 ? 3 : 2; }
            return 3;
        },
    },
    {
        name: 'thief',
        weapons: ": Club, crossbow, dagger, shortbow, shortsword",
        armor: "Leather armor, mithral chainmail",
        hitDie: 4,
        specials: [
            {
                title: "Backstab",
                details: "If you hit a creature who is unaware of your attack, you deal an extra weapon die of damage. Add additional weapon dice of damage equal to half your level (round down).",
            },
            {
                title: "Thievery",
                details: "You are adept at thieving skills and have the necessary tools of the trade secreted on your person (they take up no gear slots). You are trained in the following tasks and have advantage on any associated checks: • Climbing • Sneaking and hiding • Applying disguises • Finding and disabling traps • Delicate tasks such as picking pockets and opening locks"
            },
        ],
        talents: [
            {lookup: [2], effect: "Gain advantage on initiative rolls (reroll if duplicate)"},
            {lookup: [3,4,5,6], effect: "Your Backstab deals +1 dice of damage"},
            {lookup: [7,8,9], effect: "+2 to Strength, Dexterity, or Charisma stat"},
            {lookup: [10,11], effect: "+1 to melee and ranged attacks"},
            {lookup: [12], effect: "Choose a talent or +2 points to distribute to stats"},
        ],
    },
    {
        name: 'wizard',
        weapons: "Dagger, staff",
        armor: "None",
        hitDie: 4,
        specials: [
            {
                title: "Languages",
                details: "You know two additional common languages and two rare languages (see pg.32).",
            },
            {
                title: "Learning Spells",
                details: " You can permanently learn a wizard spell from a spell scroll by studying it for a day and succeeding on a DC 15 Intelligence check. Whether you succeed or fail, you expend the spell scroll. Spells you learn in this way don't count toward your known spells"
            },
            {
                title: "Spellcasting",
                details: "You can cast wizard spells you know. You know three tier 1 spells of your choice from the wizard spell list (see pg. 52). Each time you gain a level, you choose new wizard spells to learn according to the Wizard Spells Known table. For casting wizard spells, see Spellcasting on pg. 44."
            },
        ],
        talents: [
            {lookup: [2], effect: "Make 1 random magic item of a type you choose (pg. 282)"},
            {lookup: [3,4,5,6], effect: "+2 to Intelligence stat or +1 to wizard spellcasting checks"},
            {lookup: [7,8,9], effect: "Gain advantage on casting one spell you know"},
            {lookup: [10,11], effect: "Learn one additional wizard spell of any tier you know"},
            {lookup: [12], effect: "Choose a talent or +2 points to distribute to stats"},
        ],
        spellsKnown: (level: number, tier: number) => {
            if (level === 0 || tier > 5) { return 0; }
            if (tier === 1) { return level === 1 ? 3 : 4 }
            const firstLevelOfTier = tier * 2 - 1;
            if (level < firstLevelOfTier) { return 0; }
            if (level === firstLevelOfTier) { return 1; }
            if (level < 6 + (tier-2) * 3) { return 2; }
            if (level < 8 + (tier-2) * 2) { return 3; }
            return 4;
        },
    },
    {
        name: 'bard',
        weapons: "Crossbow, dagger, mace, shortbow, shortsword, spear, staff",
        armor: "Leather armor, chainmail, shields",
        hitDie: 6,
        specials: [
            {
                title: "Languages",
                details: "You know four additional common languages and one rare language.",
            },
            {
                title: "Bardic Arts",
                details: "You're trained in oration, performing arts, lore, and diplomacy. You have advantage on related checks."
            },
            {
                title: "Inspire",
                details: "DC 12 CHA check to cause one target in near to gain a luck token. If you fail, you can't use this again until you successfully rest."
            },
            {
                title: "Magical Dabbler",
                details: "You can activate any spell scroll or wand using Charisma as your spellcasting stat."
            },
            {
                title: "Prolific",
                details: "Add 1 + half your level (round down) to your rolls for learning and carousing (use the highest bard's bonus only; it applies to everyone carousing)."
            },
        ],
        talents: [
            {lookup: [2], effect: "1/day, DC 15 CHA to hypnotize a target in near, focus duration (duplicate: +1 use/day)"},
            {lookup: [3,4,5,6], effect: "+1 to melee and ranged attacks or +1 to Magical Dabbler rolls"},
            {lookup: [7,8,9], effect: "+2 points to distribute to any stats"},
            {lookup: [10,11], effect: "The DC to use Inspire becomes 9 (duplicate: reroll)"},
            {lookup: [12], effect: "Choose a talent"},
        ],
    },
    {
        name: 'ranger',
        weapons: "Dagger, longbow, longsword, shortbow, shortsword, spear, staff",
        armor: "Leather armor, chainmail",
        hitDie: 8,
        specials: [
            {
                title: "Wayfinder",
                details: "You have advantage on checks associated with: • Navigation • Tracking • Bushcraft • Stealth • Wild animals",
            },
            {
                title: "Herbalism",
                details: "Make an INT check to prepare an herbal remedy you choose. If you fail, you can't make that remedy again until you successfully rest. Unused remedies expire in 3 rounds."
            },
            {
                title: "Herbal Remedies:",
                details: "DC 11 Salve. Heals 1 HP, DC 12 Stimulant. You can't be surprised for 10 rounds, DC 13 Foebane. ADV on attacks and damage against one creature type you choose for 1d6 rounds, DC 14 Restorative. Ends one poison or disease, DC 15 Curative. Equivalent to a Potion of Healing"
            },
        ],
        talents: [
            {lookup: [2], effect: "You deal d12 damage with one weapon type you choose"},
            {lookup: [3,4,5,6], effect: "+1 to melee or ranged attacks and damage"},
            {lookup: [7,8,9], effect: "+2 to Strength, Dexterity, or Intelligence"},
            {lookup: [10,11], effect: "You gain ADV on Herbalism checks for an herb you choose"},
            {lookup: [12], effect: "Choose a talent or +2 points to distribute to stats"},
        ],
    },
];

export const ancestryDetails = [
    {race: 'dwarf', details: "Brave, stalwart folk as sturdy as the stone kingdoms they carve inside mountains. You know the Common and Dwarvish languages. Stout. Start with +2 HP. Roll hit points per level with advantage"},
    {race: 'elf', details: "Ethereal, graceful people who revere knowledge and beauty. Elves see far and live long. You know the Common, Elvish, and Sylvan languages. Farsight. You get a +1 bonus to attack rolls with ranged weapons or a +1 bonus to spellcasting checks."},
    {race: 'goblin', details: "Green, clever beings who thrive in dark, cramped places. As fierce as they are tiny. You know the Common and Goblin languages. Keen Senses. You can't be surprised."},
    {race: 'half-orc', details: "Towering, tusked warriors who are as daring as humans and as relentless as orcs. You know the Common and Orcish languages. Mighty. You have a +1 bonus to attack and damage rolls with melee weapons."},
    {race: 'halfling', details: "Small, cheerful country folk with mischievous streaks. They enjoy life’s simple pleasures. You know the Common language. Stealthy. Once per day, you can become invisible for 3 rounds."},
    {race: 'human', details: "Bold, adaptable, and diverse people who learn quickly and accomplish mighty deeds. You know the Common language and one additional common language (pg. 32). Ambitious. You gain one additional talent roll at 1st level."},
];

export const statNames = ['str','dex','con','int','wis','cha'];

export const ancestryOptions = ['dwarf','elf','goblin','half-orc','halfling','human'];

export const classOptions = ["fighter", "thief", "wizard", "priest", "ranger", "bard"];

export const alignmentOptions = ["lawful","neutral","chaotic"];

interface RoomFeatures {
    type: string;
    options?: {
        list1: string[];
        list2?: string[];
    };
}

export const roomFeatures: RoomFeatures[] = [
    {type: 'empty'},
    {type: 'empty'},
    {type: 'trap', options: {
        list1: ['Crude','Ranged','Sturdy','Sturdy','Ancient','Large'],
        list2: ['Ensnaring','Toxic','Mechanical','Mechanical','Magical','Deadly'],
    }},
    {type: 'minor hazard', options: {
        list1: [
            'Short fall','Stuck or locked barrier','Stuck or locked barrier',
            'Dense rubble','Collapsing walls','Enfeebling magic'
        ]
    }},
    {type: 'solo monster', options: {
        list1: ['Sneaky','Mighty','Clever','Mighty','Clever','Mutated'],
        list2: ['Ambusher','Brute','Brute','Spellcaster','Spellcaster','Pariah'],
    }},
    {type: 'NPC', options: {list1: ['Hiding','Captive','Wounded','Captive','Wounded','Rival crawlers']}},
    {type: 'monster mob', options: {
        list1: ['Stealthy','Reckless','Reckless','Magical','Primitive','Organized'],
        list2: ['Outcasts','Minions','Minions','Tricksters','Vermin','Warriors'],
    }},
    {type: 'major hazard', options: {
        list1: ['Long fall','Long fall','Toxic gas or vapors','Entrapping terrain','Antimagic zone','Drowning hazard']
    }},
    {type: 'treasure', options: {
        list1: ['Hidden','Guarded by monster','Hidden','Guarded by monster','Protected by trap','Protected by hazard']
    }},
    {type: 'boss monster', options: {
        list1: ['Physically strongest','Cult leader','Guarded by minions','Guarded by minions','Guarded by minions','Supreme sorcerer']
    }},
];
