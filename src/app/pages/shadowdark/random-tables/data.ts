export interface RandomTableEntry {
    roll: string,
    value: string,
}

export interface RandomTableObject {
    field: string;
    die: string;
    options?: {
        [key: string]: string | boolean,
    };
    table: RandomTableEntry[],
}

export type TableCategory = "encounter" | "feature" | "loot";

export interface RandomTableGroup {
    name: string;
    category: TableCategory;
    options?: {
        separate?: "select" | "random",
    };
    tables: RandomTableObject[]
}

export const encounterDisposition: RandomTableGroup = {
    name: "Encounter Disposition",
    category: "encounter",
    tables: [
        {
            field: "distance",
            die: "d6",
            table: [
                {roll: "1", value: "close"},
                {roll: "2-4", value: "near"},
                {roll: "5-6", value: "far"},
            ],
        },
        {
            field: "activity",
            die: "2d6",
            table: [
                {roll: "2-4", value: "Hunting"},
                {roll: "5-6", value: "Eating"},
                {roll: "7-8", value: "Building/nesting"},
                {roll: "9-10", value: "Socializing/playing"},
                {roll: "11", value: "Guarding"},
                {roll: "12", value: "Sleeping"},
            ]
        },
        {
            field: "reaction",
            die: "2d6",
            options: {
                mod: "CHA",
            },
            table: [
                {roll: "0-6",  value: "Hostile"},
                {roll: "7-8",  value: "Suspicious"},
                {roll: "9",  value: "Neutral"},
                {roll: "10-11",  value: "Curious"},
                {roll: "12+",  value: "Friendly"},
            ],
        },
    ],
};

export const monsterGenerator: RandomTableGroup = {
    name: "Monster",
    category: "encounter",
    tables: [
        {
            field: "combat",
            die: "d20",
            table: [
                {roll: "1", value: "PL -3"},
                {roll: "2", value: "PL -3"},
                {roll: "3", value: "PL -2"},
                {roll: "4", value: "PL -2"},
                {roll: "5", value: "PL -1"},
                {roll: "6", value: "PL -1"},
                {roll: "7", value: "PL"},
                {roll: "8", value: "PL"},
                {roll: "9", value: "PL"},
                {roll: "10", value: "PL"},
                {roll: "11", value: "PL"},
                {roll: "12", value: "PL"},
                {roll: "13", value: "PL"},
                {roll: "14", value: "PL +1"},
                {roll: "15", value: "PL +1"},
                {roll: "16", value: "PL +2"},
                {roll: "17", value: "PL +2"},
                {roll: "18", value: "PL +3"},
                {roll: "19", value: "PL +3"},
                {roll: "20", value: "PL +4"},
            ]
        },
        {
            field: "strength",
            die: "d20",
            table: [
                {roll: "1", value: "+1 attack"},
                {roll: "2", value: "Absorbs magic"},
                {roll: "3", value: "Swarm"},
                {roll: "4", value: "1d10 damage"},
                {roll: "5", value: "Poison sting"},
                {roll: "6", value: "Confusing gaze"},
                {roll: "7", value: "Eats metal"},
                {roll: "8", value: "Ranged attacks"},
                {roll: "9", value: "Highly intelligent"},
                {roll: "10", value: "Crushing grasp"},
                {roll: "11", value: "Psychic blast"},
                {roll: "12", value: "Stealthy"},
                {roll: "13", value: "Petrifying gaze"},
                {roll: "14", value: "1d12 damage"},
                {roll: "15", value: "Impersonation"},
                {roll: "16", value: "Blinding aura"},
                {roll: "17", value: "Turns invisible"},
                {roll: "18", value: "2d6 damage"},
                {roll: "19", value: "Swallows whole"},
                {roll: "20", value: "+2 attacks"},
            ]
        },
        {
            field: "quality",
            die: "d20",
            table: [
                {roll: "1", value: "Beastlike"},
                {roll: "2", value: "Avian"},
                {roll: "3", value: "Amphibious"},
                {roll: "4", value: "Demonic"},
                {roll: "5", value: "Arachnid"},
                {roll: "6", value: "Ooze"},
                {roll: "7", value: "Insectoid"},
                {roll: "8", value: "Draconic"},
                {roll: "9", value: "Plantlike"},
                {roll: "10", value: "Elephantine"},
                {roll: "11", value: "Undead"},
                {roll: "12", value: "Crystalline"},
                {roll: "13", value: "Humanoid"},
                {roll: "14", value: "Angelic"},
                {roll: "15", value: "Spectral"},
                {roll: "16", value: "Stonecarved"},
                {roll: "17", value: "Serpentine"},
                {roll: "18", value: "Elemental"},
                {roll: "19", value: "Piscine"},
                {roll: "20", value: "Reptilian"},
            ]
        },
        {
            field: "weakness",
            die: "d20",
            table: [
                {roll: "1", value: "Cold"},
                {roll: "2", value: "Greed"},
                {roll: "3", value: "Light"},
                {roll: "4", value: "Salt"},
                {roll: "5", value: "Vanity"},
                {roll: "6", value: "Mirrors"},
                {roll: "7", value: "Electricity"},
                {roll: "8", value: "Sunlight"},
                {roll: "9", value: "Silver"},
                {roll: "10", value: "Fire"},
                {roll: "11", value: "Food"},
                {roll: "12", value: "Acid"},
                {roll: "13", value: "Garlic"},
                {roll: "14", value: "Iron"},
                {roll: "15", value: "Water"},
                {roll: "16", value: "Music"},
                {roll: "17", value: "Fragile body"},
                {roll: "18", value: "Its True Name"},
                {roll: "19", value: "Loud sounds"},
                {roll: "20", value: "Holy water"},
            ]
        },
    ]
};

export const traps: RandomTableGroup = {
    name: "Trap",
    category: "feature",
    tables: [
        {
            field: "trap",
            die: "d12",
            table: [
                { roll: "1", value: "Crossbow"},
                { roll: "2", value: "Hail of needles"},
                { roll: "3", value: "Toxic gas"},
                { roll: "4", value: "Barbed net"},
                { roll: "5", value: "Rolling boulder"},
                { roll: "6", value: "Slicing blade"},
                { roll: "7", value: "Spiked pit"},
                { roll: "8", value: "Javelin"},
                { roll: "9", value: "Magical glyph"},
                { roll: "10", value: "Blast of fire"},
                { roll: "11", value: "Falling block"},
                { roll: "12", value: "Cursed statue"},
            ]
        },
        {
            field: "trigger",
            die: "d12",
            table: [
                { roll: "1", value: "Tripwire"},
                { roll: "2", value: "Pressure plate"},
                { roll: "3", value: "Opening a door"},
                { roll: "4", value: "Switch or button"},
                { roll: "5", value: "False step on stairs"},
                { roll: "6", value: "Closing a door"},
                { roll: "7", value: "Breaking a light beam"},
                { roll: "8", value: "Pulling a lever"},
                { roll: "9", value: "A word is spoken"},
                { roll: "10", value: "Hook on a thread"},
                { roll: "11", value: "Removing an object"},
                { roll: "12", value: "Casting a spell"},
            ]
        },
        {
            field: "effect",
            die: "d12",
            table: [
                { roll: "1", value: "1d6"},
                { roll: "2", value: "1d6/sleep"},
                { roll: "3", value: "1d6/paralyze"},
                { roll: "4", value: "1d6/blind"},
                { roll: "5", value: "2d8"},
                { roll: "6", value: "2d8/sleep"},
                { roll: "7", value: "2d8/paralyze"},
                { roll: "8", value: "2d8/confuse"},
                { roll: "9", value: "3d10"},
                { roll: "10", value: "3d10/paralyze"},
                { roll: "11", value: "3d10/unconscious"},
                { roll: "12", value: "3d10/petrify"},
            ]
        },
    ]
};

export const hazards: RandomTableGroup = {
    name: "Hazard",
    category: "feature",
    options: {
        separate: "select",
    },
    tables: [
        {
            field: "movement",
            die: "d12",
            table:  [
                {roll: "1", value: "Quicksand"},
                {roll: "2", value: "Caltrops"},
                {roll: "3", value: "Loose debris"},
                {roll: "4", value: "Tar field"},
                {roll: "5", value: "Grasping vines"},
                {roll: "6", value: "Steep incline"},
                {roll: "7", value: "Slippery ice"},
                {roll: "8", value: "Rushing water"},
                {roll: "9", value: "Sticky webs"},
                {roll: "10", value: "Gale force wind"},
                {roll: "11", value: "Greased floor"},
                {roll: "12", value: "Illusory terrain"},
            ]
        },
        {
            field: "damage",
            die: "d12",
            table:  [
                {roll: "1", value: "Acid pools"},
                {roll: "2", value: "Exploding rocks"},
                {roll: "3", value: "Icy water"},
                {roll: "4", value: "Lava"},
                {roll: "5", value: "Pummeling hail"},
                {roll: "6", value: "Steam vents"},
                {roll: "7", value: "Toxic mold"},
                {roll: "8", value: "Falling debris"},
                {roll: "9", value: "Acid rain"},
                {roll: "10", value: "Curtain of fire"},
                {roll: "11", value: "Electrified field"},
                {roll: "12", value: "Gravity flux"},
            ]
        },
        {
            field: "weaken",
            die: "d12",
            table:  [
                {roll: "1", value: "Blinding smoke"},
                {roll: "2", value: "Magnetic field"},
                {roll: "3", value: "Exhausting runes"},
                {roll: "4", value: "Antimagic zone"},
                {roll: "5", value: "Snuffs light sources"},
                {roll: "6", value: "Disorienting sound"},
                {roll: "7", value: "Magical silence"},
                {roll: "8", value: "Numbing cold"},
                {roll: "9", value: "Sickening smell"},
                {roll: "10", value: "Sleep-inducing spores"},
                {roll: "11", value: "Confusing reflections"},
                {roll: "12", value: "Memory-stealing"},
            ]
        },
    ]
};

export const treasure: RandomTableGroup = {
    name: "Treasure",
    category: "loot",
    options: {separate: "select"},
    tables: [
        {
            field: "Treasure 0-3",
            die: "d100",
            table: [
                {roll: "01", value: "Bent tin fork (1 cp)"},
                {roll: "02-03", value: "Muddy torch (2 cp)"},
                {roll: "04-05", value: "Bag of smooth pebbles (2 cp)"},
                {roll: "06-07", value: "10 cp in a greasy pouch"},
                {roll: "08-09", value: "Rusty lantern with shattered glass (1 gp)"},
                {roll: "10-11", value: "Silver tooth (1 gp)"},
                {roll: "12-13", value: "Dull dagger (1 gp)"},
                {roll: "14-15", value: "Two empty glass vials (6 gp)"},
                {roll: "16-17", value: "60 sp in a rotten boot"},
                {roll: "18-19", value: "Cracked, handheld mirror (8 gp)"},
                {roll: "20-21", value: "Chipped greataxe (9 gp)"},
                {roll: "22-23", value: "10 gp in a moldy, wood box"},
                {roll: "24-25", value: "Chip of an emerald (10 gp)"},
                {roll: "26-27", value: "Longbow and bundle of 40 arrows (10 gp)"},
                {roll: "28-29", value: "Dusty, leather armor dyed black (10 gp)"},
                {roll: "30-31", value: "Scuffed, heavy shield (10 gp)"},
                {roll: "32-33", value: "Simple, well-made bastard sword (10 gp)"},
                {roll: "34-35", value: "12 gp in the pocket of a ripped cloak"},
                {roll: "36-37", value: "Wavy-bladed greatsword (12 gp)"},
                {roll: "38-39", value: "Pair of elf-forged shortswords (14 gp)"},
                {roll: "40-41", value: "Golden bowl (15 gp)"},
                {roll: "42-43", value: "Obsidian statuette of Shune the Vile (15 gp)"},
                {roll: "44-45", value: "Undersized pearl (20 gp)"},
                {roll: "46-47", value: "Jade-and-gold scarab pin (20 gp)"},
                {roll: "48-49", value: "Bag of 10 silver spikes (2 gp each)"},
                {roll: "50-53", value: "Mithral locket with a painting of a halfling (20 gp)"},
                {roll: "54-55", value: "Two finely forged dwarven shields (20 gp)"},
                {roll: "56-57", value: "Pair of silvered daggers (10 gp each)"},
                {roll: "58-59", value: "Copper-and-gold mead tankard (20 gp)"},
                {roll: "60-61", value: "Bundle of five red dragon scales (5 gp each)"},
                {roll: "62-63", value: "Light, warm cloak woven of spidersilk (25 gp)"},
                {roll: "64-65", value: "Fine set of ivory game pieces (25 gp)"},
                {roll: "66-67", value: "Half-finished suit of chainmail (30 gp)"},
                {roll: "68-69", value: "Matched trio of warhammers (10 gp each)"},
                {roll: "70-71", value: "Fragment of a sapphire (30 gp)"},
                {roll: "72-73", value: "Set of silk slippers and a robe (35 gp)"},
                {roll: "74-75", value: "Silver-and-gold circlet (40 gp)"},
                {roll: "76-77", value: "Radiant, polished pearl (40 gp)"},
                {roll: "78-79", value: "Mithral shield etched with soaring dragons (40 gp)"},
                {roll: "80-81", value: "Gold monkey idol with a ruby gripped in its teeth (60 gp)"},
                {roll: "82-83", value: "Fine suit of chainmail (60 gp)"},
                {roll: "84-85", value: "Cracked emerald (60 gp)"},
                {roll: "86-87", value: "Two lustrous pearls (40 gp each)"},
                {roll: "88-89", value: "1st-tier spell scroll (80 gp)"},
                {roll: "90-91", value: "Potion of Invisibility (80 gp)"},
                {roll: "92-93", value: "Magic wand, 2nd-tier spell (100 gp)"},
                {roll: "94-95", value: "Egg of The Cockatrice (100 gp)"},
                {roll: "96-97", value: "+1 armor (benefit, curse) (150 gp)"},
                {roll: "98-99", value: "Bag of Holding (virtue, flaw) (150 gp)"},
                {roll: "100", value: "+1 magic weapon (benefit) (200 gp)"},
            ]
        },
        {
            field: "Treasure 4-6",
            die: "d100",
            table: [
                {roll: "01",  value: "Scattering of 3 cp"},
                {roll: "02-03",  value: "Wooden ring carved with knot pattern (5 cp)"},
                {roll: "04-05",  value: "Heavy iron key (1 sp)"},
                {roll: "06-07",  value: "Steel-banded wooden shield (10 gp)"},
                {roll: "08-09",  value: "Golden anchor necklace (10 gp)"},
                {roll: "10-11",  value: "Bag of 20 glass marbles (5 sp each)"},
                {roll: "12-13",  value: "Serrated greatsword (12 gp)"},
                {roll: "14-15",  value: "Three silver-tipped javelins (4 gp each)"},
                {roll: "16-17",  value: "Bag of rare spices (15 gp)"},
                {roll: "18-19",  value: "Mahogany pipe with ivory inlay (25 gp)"},
                {roll: "20-21",  value: "Set of polished bone dice (25 gp)"},
                {roll: "22-23",  value: "Copper flask etched with an owl (30 gp)"},
                {roll: "24-25",  value: "Eyepatch made of batwing leather (30 gp)"},
                {roll: "26-27",  value: "Leather bandoleer with 10 blue bottles (3 gp each)"},
                {roll: "28-29",  value: "Small oil painting of an elf woman (35 gp)"},
                {roll: "30-31",  value: "Opalescent pearl (40 gp)"},
                {roll: "32-33",  value: "Ceremonial, gold-capped warhammer (40 gp)"},
                {roll: "34-35",  value: "Silver ring with a miniature emerald (40 gp)"},
                {roll: "36-37",  value: "Tapestry of a unicorn in a forest glade (45 gp)"},
                {roll: "38-39",  value: "Goblin-made clockwork dragon doll (45 gp)"},
                {roll: "40-41",  value: "Half-complete suit of chainmail (50 gp)"},
                {roll: "42-43",  value: "Mace inlaid with gold holy symbols (50 gp)"},
                {roll: "44-45",  value: "Delicate, ancient vase of Myrkhosian make (50 gp)"},
                {roll: "46-47",  value: "Rare incense that is repulsive to undead (50 gp)"},
                {roll: "48-49",  value: "Minotaur hoof with a gold horseshoe (50 gp)"},
                {roll: "50-53",  value: "Longsword with a fiery pearl set in the pommel (50 gp)"},
                {roll: "54-55",  value: "Green crystal statuette of Memnon (50 gp)"},
                {roll: "56-57",  value: "Crimson holy symbol of Ramlaat with small ruby (55 gp)"},
                {roll: "58-59",  value: "Six black candles traced with gold runes (10 gp each)"},
                {roll: "60-61",  value: "Suit of dwarf-made chainmail (60 gp)"},
                {roll: "62-63",  value: "Dragonbone crossbow carved as roaring dragon (60 gp)"},
                {roll: "64-65",  value: "Half-complete suit of plate mail (65 gp)"},
                {roll: "66-67",  value: "Magnetic, iridescent chunk of meteorite (70 gp)"},
                {roll: "68-69",  value: "Full-length mirror set in gold frame (70 gp)"},
                {roll: "70-71",  value: "Large, green scarab encased in amber (75 gp)"},
                {roll: "72-73",  value: "Lute carved from ironwood with gold hardware (75 gp)"},
                {roll: "74-75",  value: "Ivory tusk carved with angels battling demons (80 gp)"},
                {roll: "76-77",  value: "Mithral shield inlaid with small, blue pearls (80 gp)"},
                {roll: "78-79",  value: "Two intact griffon eggs (40 gp each)"},
                {roll: "80-81",  value: "Suit of blackened-steel plate mail (130 gp)"},
                {roll: "82-83",  value: "2nd-tier spell scroll (140 gp)"},
                {roll: "84-85",  value: "Potion of Healing (150 gp)"},
                {roll: "86-87",  value: "3rd-tier spell scroll (200 gp)"},
                {roll: "88-89",  value: "Potion of Flying (200 gp)"},
                {roll: "90-91",  value: "Potion of Giant Strength (200 gp)"},
                {roll: "92-93",  value: "Magic wand, 3rd-tier spell (curse) (250 gp)"},
                {roll: "94-95",  value: "Ring of Feather Falling (250 gp)"},
                {roll: "96-97",  value: "+2 magic armor (benefit, curse) (300 gp)"},
                {roll: "98-99",  value: "Kytherian Cog (300 gp)"},
                {roll: "100",  value: "magic weapon (benefit, curse) (500 gp)"},
            ]
        },
        {
            field: "Treasure 7-9",
            die: "d100",
            table: [
                {roll: "01", value: "Broken glass shards (2 cp)"},
                {roll: "02-03", value: "Pair of muddy boots (5 sp)"},
                {roll: "04-05", value: "Rotting, leather pouch with 12 sp"},
                {roll: "06-07", value: "Greatsword made of blue steel (15 gp)"},
                {roll: "08-09", value: "Tall, thin mirror in a bronze frame (20 gp)"},
                {roll: "10-11", value: "Pair of bastard swords with griffon pommels (20 gp)"},
                {roll: "12-13", value: "Silver-and-gold statuette of an elf archer (25 gp)"},
                {roll: "14-15", value: "Taxidermied smilodon (30 gp)"},
                {roll: "16-17", value: "Cameo necklace of a human's profile (30 gp)"},
                {roll: "18-19", value: "Ivory horn mug carved with drinking dwarves (35 gp)"},
                {roll: "20-21", value: "Ironwood longbow engraved with silver leaves (35 gp)"},
                {roll: "22-23", value: "Mahogany chess board with silver pieces (40 gp)"},
                {roll: "24-25", value: "Mithral shield polished to a mirror-shine (45 gp)"},
                {roll: "26-27", value: "Iridescent, spiralled unicorn horn (50 gp)"},
                {roll: "28-29", value: "Basilisk egg in a silk bag (55 gp)"},
                {roll: "30-31", value: "Gold holy symbol of Madeera with a large pearl (60 gp)"},
                {roll: "32-33", value: "Red dragon mask with gold filigree (65 gp)"},
                {roll: "34-35", value: "Gold censer with hooded, skeletal figures (70 gp)"},
                {roll: "36-37", value: "Large, marble statue of an armored angel (70 gp)"},
                {roll: "38-39", value: "Chainmail with several rows of gold links (75 gp)"},
                {roll: "40-41", value: "Clutch of three green cockatrice eggs (25 gp each)"},
                {roll: "42-43", value: "Oak lockbox filled to the brim with 80 gp"},
                {roll: "44-45", value: "Blue silk robe embroidered with silver moons (80 gp)"},
                {roll: "46-47", value: "Radiant giant pearl (80 gp)"},
                {roll: "48-49", value: "Lantern made of intricate stained glass (80 gp)"},
                {roll: "50-53", value: "Life-sized, jointed python of polished gold (80 gp)"},
                {roll: "54-55", value: "Oil painting of a famous bard (85 gp)"},
                {roll: "56-57", value: "Chunk of meteorite sculpted into a tentacled idol (85 gp)"},
                {roll: "58-59", value: "Black silk surcoat embroidered with a gold lion (90 gp)"},
                {roll: "60-61", value: "Pair of lustrous pearls in a silver lockbox (90 gp)"},
                {roll: "62-63", value: "Gilded helm plumed with roc feathers (95 gp)"},
                {roll: "64-65", value: "Hand-drawn bestiary of rare creatures (95 gp)"},
                {roll: "66-67", value: "Wyvern hatchling encased in amber (110 gp)"},
                {roll: "68-69", value: "Pendant with three lambent pearls (120 gp)"},
                {roll: "70-71", value: "Life-sized, obsidian statue of a galloping horse (120 gp)"},
                {roll: "72-73", value: "Glittering, faceted emerald (120 gp)"},
                {roll: "74-75", value: "Potion of Healing (150 gp)"},
                {roll: "76-77", value: "Potion of Polymorph (200 gp)"},
                {roll: "78-79", value: "Magic wand, 3rd-tier spell (250 gp)"},
                {roll: "80-81", value: "4th-tier spell scroll (260 gp)"},
                {roll: "82-83", value: "Crystal Ball (260 gp)"},
                {roll: "84-85", value: "Magic wand, 4th-tier spell (flaw) (300 gp)"},
                {roll: "86-87", value: "Immovable Rod (300 gp)"},
                {roll: "88-89", value: "+2 magic armor (benefit) (300 gp)"},
                {roll: "90-91", value: "+2 mithral magic armor (benefit, virtue) (320 gp)"},
                {roll: "92-93", value: "Scorpion idol, one Death's Sting blessing (320 gp)"},
                {roll: "94-95", value: "Necromancy circle, one Ghostwalk blessing (350 gp)"},
                {roll: "96-97", value: "Owl statue, one Arcane Eye blessing (350 gp)"},
                {roll: "98-99", value: "+2 magic weapon (benefit, flaw) (500 gp)"},
                {roll: "100", value: "magic weapon (benefit, virtue) (900 gp)"},
            ]
        },
        {
            field: "Treasure 10+",
            die: "d100",
            table: [
                {roll: "01-01", value: "Three tarnished silver plates (5 sp each)"},
                {roll: "02-03", value: "Soapstone statuette of Gede with crumbled head (3 gp)"},
                {roll: "04-05", value: "Half-empty cask of dwarvish honey mead (5 gp)"},
                {roll: "06-07", value: "Damaged chainmail in need of repair (50 gp)"},
                {roll: "08-09", value: "Five matching, ceremonial greatswords (12 gp each)"},
                {roll: "10-11", value: "Chipped emerald worth half its value (60 gp)"},
                {roll: "12-13", value: "Gold ring with a large, black pearl (65 gp)"},
                {roll: "14-15", value: "Suit of crimson chainmail with matching shield (70 gp)"},
                {roll: "16-17", value: "Giant pearl in the mouth of a gold-dipped bat (100 gp)"},
                {roll: "18-19", value: "Stained glass pane of St. Terragnis vs. a dragon (110 gp)"},
                {roll: "20-21", value: "Marble throne with giant pearl in headrest (115 gp)"},
                {roll: "22-23", value: "Dagger with emerald in the pommel (120 gp)"},
                {roll: "24-25", value: "A trio of pearls with blue and violet hues (40 gp each)"},
                {roll: "26-27", value: "Suit of plate mail shaped to look like a minotaur (130 gp)"},
                {roll: "28-29", value: "Suit of blue plate mail with crashing wave motif (130 gp)"},
                {roll: "30-31", value: "Jade sculpture of a meditating elephant-man (140 gp)"},
                {roll: "32-33", value: "Masterwork lute by realm's most famous luthier (140 gp)"},
                {roll: "34-35", value: "Dragonbone greataxe with a ruby in pommel (220 gp)"},
                {roll: "36-37", value: "Gold scarab dotted with miniature emeralds (220 gp)"},
                {roll: "38-39", value: "Chest brimming with 230 gp"},
                {roll: "40-41", value: "Silvered staff tipped with a ruby held in a claw (220 gp)"},
                {roll: "42-43", value: "Only existing painting of an ancient king (240 gp)"},
                {roll: "44-45", value: "Gold pendant bearing a teardrop-cut ruby (240 gp)"},
                {roll: "46-47", value: "Giant, egg-shaped emerald (240 gp)"},
                {roll: "48-49", value: "Silk robe with four pearls as buttons (240 gp)"},
                {roll: "50-53", value: "Silver skull with a ruby in the eye (240 gp)"},
                {roll: "54-55", value: "Mithral suit of elvish chainmail (240 gp)"},
                {roll: "56-57", value: "Opalized giant conch shell with silver inlay (250 gp)"},
                {roll: "58-59", value: "Gold sarcophagus inscribed with lost language (250 gp)"},
                {roll: "60-61", value: "Chunk of meteorite wrapped around a ruby (250 gp)"},
                {roll: "62-63", value: "4th-tier spell scroll (260 gp)"},
                {roll: "64-65", value: "Velvet bag holding a lustrous sapphire (280 gp)"},
                {roll: "66-67", value: "2 Potions of Healing (300 gp)"},
                {roll: "68-69", value: "Silver torc with a sapphire and two pearls (360 gp)"},
                {roll: "70-71", value: "Flawless, dazzling diamond (360 gp)"},
                {roll: "72-73", value: "Taxidermied adult dragon (360 gp)"},
                {roll: "74-75", value: "5th-tier spell scroll (360 gp)"},
                {roll: "76-77", value: "Potion of Extirpation (360 gp)"},
                {roll: "78-79", value: "Magic wand, 5th-tier spell (virtue, flaw) (360 gp)"},
                {roll: "80-81", value: "Giant diamond, casts wish once without fail (720 gp)"},
                {roll: "82-83", value: "Portable Hole (720 gp)"},
                {roll: "84-85", value: "Ruby-eyed, gold idol, 3 Demonskin blessings (840 gp)"},
                {roll: "86-87", value: "Scroll of the Covenant, 3 Divine Halo blessings (840 gp)"},
                {roll: "88-89", value: "Brak's Cube of Perfection (840 gp)"},
                {roll: "90-91", value: "Richly woven Flying Carpet (840 gp)"},
                {roll: "92-93", value: "+3 mithral magic armor (benefit, virtue) (900 gp)"},
                {roll: "94-95", value: "+3 magic weapon (2 benefits) (900 gp)"},
                {roll: "96-97", value: "The fearsome Obsidian Witchknife (1,200 gp)"},
                {roll: "98-99", value: "The hallowed Armor of Saint Terragnis (1,200 gp)"},
                {roll: "00-00", value: "The mighty Staff of Ord (1,200 gp)"},
            ]
        },
    ],
};

export const magicArmor: RandomTableGroup = {
    name: "Magic Armor",
    category: "loot",
    options: { separate: "select" },
    tables: [
        {
            field: "armor type",
            die: "2d6",
            table: [
                {roll: "2-5", value: "Leather"},
                {roll: "6-7", value: "Chainmail"},
                {roll: "8-9", value: "Shield"},
                {roll: "10-11", value: "Plate mail"},
                {roll: "12", value: "Mithral"}, // reroll for type
            ],
        },
        {
            field: "armor bonus",
            die: "2d6",
            table: [
                {roll: "2-5", value: "0"},
                {roll: "6-8", value: "1"},
                {roll: "9-11", value: "2"},
                {roll: "12-12", value: "3"},
            ],
        },
        {
            field: "armor feature",
            die: "d20",
            table: [
                {roll: "1", value: "Demonic horned face"},
                {roll: "2", value: "Oak leaf motif"},
                {roll: "3", value: "Studded with shark teeth"},
                {roll: "4", value: "Dragon scales"},
                {roll: "5", value: "Bone or metal spikes"},
                {roll: "6", value: "Faint arcane runes"},
                {roll: "7", value: "Turtle shell plating"},
                {roll: "8", value: "Made of scorpion chitin"},
                {roll: "9", value: "Gilded metal/gold thread"},
                {roll: "10", value: "Scorched, smells burned"},
                {roll: "11", value: "Pearl-white fish scales"},
                {roll: "12", value: "Oozes blood"},
                {roll: "13", value: "Festooned with fungi"},
                {roll: "14", value: "Distant sound of ocean"},
                {roll: "15", value: "Set with crystals"},
                {roll: "16", value: "Draped in holy symbols"},
                {roll: "17", value: "Exudes tree sap"},
                {roll: "18", value: "Blurry, indistinct edges"},
                {roll: "19", value: "Large golden cat eye"},
                {roll: "20", value: "Covered in frost"},
            ],
        },
        {
            field: "armor benefit",
            die: "d12",
            table: [
                {roll: "1", value: "Once per day, deflect a ranged attack that would hit you"},
                {roll: "2", value: "Checks to stabilize you are easy (DC 9)"},
                {roll: "3", value: "You cannot be knocked over while you are conscious"},
                {roll: "4", value: "Undetected creatures do not have advantage to attack you"},
                {roll: "5", value: "You know Diabolic and are immune to fire, lava, and magma"},
                {roll: "6", value: "You are immune to the curses of one item you choose"},
                {roll: "7", value: "Once per day, gain advantage on all attacks for 3 rounds"},
                {roll: "8", value: "You have a +4 bonus to your death timers"},
                {roll: "9", value: "Gain immunity to a poison after suffering its effects once"},
                {roll: "10", value: "You know Celestial and can fly for 3 rounds once per day"},
                {roll: "11", value: "Treat critical hits against you as normal hits"},
                {roll: "12", value: "Ignore any damage dealt to you of 3 points or below"},
            ],
        },
        {
            field: "armor curse",
            die: "d12",
            table: [
                {roll: "1", value: "You take 2d10 damage if you remove this armor"},
                {roll: "2", value: "Your party cannot add CHA bonuses to reaction checks"},
                {roll: "3", value: "Mounts fear you and will not allow you to ride them"},
                {roll: "4", value: "DC 15 WIS first round of combat or attack nearest creature"},
                {roll: "5", value: "You take double damage from blunt/bludgeoning weapons"},
                {roll: "6", value: "Armor uses 5 gear slots and is extremely loud and clunky"},
                {roll: "7", value: "Ranged attacks against you have advantage"},
                {roll: "8", value: "Treat a natural 1 attack roll against you as a critical hit"},
                {roll: "9", value: "Beneficial spells that target you are hard to cast (DC 15)"},
                {roll: "10", value: "You have disadvantage on Dexterity checks"},
                {roll: "11", value: "There's a secret 1-in-6 chance each NPC ally will betray you"},
                {roll: "12", value: "You take double damage from silvered weapons"},
            ],
        },
    ],
};

export const itemPersonality: RandomTableGroup = {
    name: "Item Personality",
    category: "loot",
    options: { separate: "select" },
    tables: [
        {
            field: "item virtue",
            die: "d20",
            table: [
                {roll: "1", value: "Insists on protecting people and creatures it likes"},
                {roll: "2", value: "Warns its wielder if it senses impending danger"},
                {roll: "3", value: "Gladly translates Primordial for its wielder"},
                {roll: "4", value: "Senses hiding creatures within near, but not exact place"},
                {roll: "5", value: "Owed a favor by a 1d4: 1-2. unicorn, 3. dragon, 4. noble"},
                {roll: "6", value: "Commands the respect of the followers of a god"},
                {roll: "7", value: "Occasionally remembers useful ancient history"},
                {roll: "8", value: "Imparts pleasant dreams and good sleep to its wielder"},
                {roll: "9", value: "Coaches its wielder on the right things to say in a situation"},
                {roll: "10", value: "Sometimes provides helpful strategic advice"},
                {roll: "11", value: "Occasionally notices important details others have missed"},
                {roll: "12", value: "Tries to mediate disagreements between conscious items"},
                {roll: "13", value: "Calming presence to 1d4: 1. dogs, 2. horses, 3. cats, 4. birds"},
                {roll: "14", value: "Has an extremely acute sense of smell"},
                {roll: "15", value: "Knows the direction of the nearest running water"},
                {roll: "16", value: "Lawful, intimidating to chaotic creatures"},
                {roll: "17", value: "Neutral, intimidating to lawful and chaotic creatures"},
                {roll: "18", value: "Chaotic, intimidating to lawful creatures"},
                {roll: "19", value: "Has legitimate prophecies but isn't sure of their meaning"},
                {roll: "20", value: "Can undo a great 1d4: 1. evil, 2. lie, 3. spell, 4. alliance"},
            ],
        },
        {
            field: "item flaw",
            die: "d20",
            table: [
                {roll: "1", value: "Afraid of 1d4: 1. the dark, 2. vermin, 3. heights, 4. water"},
                {roll: "2", value: "Preferred a past owner and always draws comparisons"},
                {roll: "3", value: "Chatters while wielder is trying to concentrate"},
                {roll: "4", value: "Dislikes 1d4: 1. elves, 2. dwarves, 3. humans, 4. goblins"},
                {roll: "5", value: "Tries to get wielder into fights so it \"has something to do\""},
                {roll: "6", value: "Does not want to be separated from wielder for any reason"},
                {roll: "7", value: "Objects to 1d4: 1. gambling, 2. carousing, 3. stealth, 4. theft"},
                {roll: "8", value: "Accuses everyone of lying; is correct once in a while"},
                {roll: "9", value: "Won't harm 1d4: 1-2. lawful, 3. neutral, 4. chaotic creatures"},
                {roll: "10", value: "Believes its wielder is a pawn in its apocalyptic scheme"},
                {roll: "11", value: "Constantly tries to escape its current wielder"},
                {roll: "12", value: "Demands its wielder observe its god's strict rituals"},
                {roll: "13", value: "Insists on being reunited with its creator, living or dead"},
                {roll: "14", value: "Can't stand other conscious magic items"},
                {roll: "15", value: "Refuses to be used for \"unimportant\" or \"boring\" tasks"},
                {roll: "16", value: "Purposefully goes magically inert when mad at its wielder"},
                {roll: "17", value: "Insists on being meticulously cleaned every day"},
                {roll: "18", value: "Loves the color purple and despises all other colors"},
                {roll: "19", value: "Objects to 1d4: 1. negotiating, 2-3. fighting, 4. planning"},
                {roll: "20", value: "Pretends to know information it doesn't know"},
            ],
        },
        {
            field: "personality trait",
            die: "d16",
            table: [
                {roll: "1", value: "Imperious"},
                {roll: "2", value: "Polite"},
                {roll: "3", value: "Puritanical"},
                {roll: "4", value: "Charming"},
                {roll: "5", value: "Anxious"},
                {roll: "6", value: "Righteous"},
                {roll: "7", value: "Critical"},
                {roll: "8", value: "Theatrical"},
                {roll: "9", value: "Bossy"},
                {roll: "10", value: "Noble"},
                {roll: "11", value: "Greedy"},
                {roll: "12", value: "Protective"},
                {roll: "13", value: "Impulsive"},
                {roll: "14", value: "Brave"},
                {roll: "15", value: "Vicious"},
                {roll: "16", value: "Loyal"},
            ],
        },
        {
            field: "alignment",
            die: "d3",
            table: [
                {roll: "1", value: "lawful"},
                {roll: "2", value: "neutral"},
                {roll: "3", value: "chaotic"},
            ],
        },
    ],
};


