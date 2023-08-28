
Dexie reference:
https://dexie.org/docs/API-Reference#add-items


npm run dev


TODO:
- stash page: "current" objects rolled on random tables: items, monsters, etc. "stashable" from any random table

- monster form: disable save if not changed

- better random table handler: alow passed render function, support encounter tables
- standard random table objects (ongoing)
- save random table object to db, support edit and added notes field, and allow delete from db
- copy random object to clipboard: navigator.clipboard.writeText(text); -- use a copy svg icon

- dark map: support longer room description for popup when user clicks "?" button
- dark map: hover-able icons: sound, smell, feel(wind, cold, heat, etc.) to easily emanate beyond room

- land map: make map list and map side by side
- land map: click and drag to move focus
- land map: zoom land map view. idea: hold shift and drag mouse up / down
- land map: rivers
- land map: ? land tile random events / points of interest / settlement names (p.133)?
- land map: allow selecting a hex and storing that selection in map object (gm 'bookmark')

- character: ai prompt and display image like npcs
- character: disable save button when not changed
- character: when you change class, erase rolled talents
- character: have character and npc share core code

- flag "orphan" items whose project has been removed
- support change item project
- support some kind of export - data dump, save map as image, etc.

DONE:
- style the left nav bar and make collapsible categories - probably make the nav bar a component
- custom encounter tables, requires stored monster objects
- stored monster objects, data entry ui
- dark map: map exit labels - a dot at room radius and stored angle from center. place text message
- dark map: allow two levels of darker room color stored in room and hall data
- dark map: room text gets hidden by walls. maybe text background
- dark map: draw stairs
- dark map: hall width
- dark map: room sizes
- dark map: room shapes
- dark map: fix word wrap on map room labels / descriptions
- dark map: sometimes connect doesn't respond
- dark map: move reroll room features into edit features and remove extra button
- dark map: make sure maps have projectId and filter the list
- dark map: put map list and map view side by side
- dark map: put halls "under" rooms
- dark map: can't select halls (with some maps)
- dark map: arrange controls better and disable save btn if no map name
- if level drops and character has too many talents, remove excess
- move character sheet into a separate file
- characters: move reroll stats button into character sheet
- characters: save character - show character list and sheet side by side
- characters
- filter land maps by project
- land type icons
- store and retrieve land maps
- land hex map page - generate and show maps
- allow map size or room count selection
- allow hall (connection) removal
- allow room feature edit
- allow room feature reroll
- roll room features and show on map
- mapview: fire a connect event on keyboard "c"
- mapview: disable connect button unless a node is selected
- click listed map to open, edit and delete (be sure to populate map name input)
- mapview: leave "to" room selected after connect
- filter displayed maps if toggled
- name maps, save maps and show a list of saved maps
- only generate maps when you click a generate button
- in mapview support user-created connections
- click npc image to make it fullscreen to show to players
- support npc portraits
- show npc form values in editable text inputs
- click npc from list to show it in a form. support delete
- fix the screen width problem
- toggle to filter displayed lists to show only npcs that pertain to the current project
