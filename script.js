/******************************************************************************
 * script.js
 * 
 * 1. We define how many slots are available at each level (1..10). Optionally,
 *    we add "cantrip" as level 0 if you want a separate row.
 * 2. We fetch all spells from your GitHub JSON, but we only show those that
 *    include the string "divine" in their `traditions`.
 * 3. The main screen is a single-column list of "Level X" blocks, each with
 *    that many "slot" rows. 
 * 4. Clicking an empty slot => opens a modal with the spells for that level
 *    (cantrips if level=0). 
 * 5. Clicking an assigned slot's name => also opens the modal to see details.
 * 6. You can "Remove" a spell from a slot by clicking a button on that slot.
 *****************************************************************************/

// Example Oracle slot progression (no cantrip slots by default).
// If you want a "cantrip" row (level 0) that has N "slots", add it below or handle differently.
const oracleSlotProgression = {
  1: [2,0,0,0,0,0,0,0,0,0], // class level 1 => 2 slots at Spell Level 1
  2: [3,0,0,0,0,0,0,0,0,0],
  3: [3,2,0,0,0,0,0,0,0,0],
  4: [3,3,0,0,0,0,0,0,0,0],
  5: [3,3,2,0,0,0,0,0,0,0],
  6: [3,3,3,0,0,0,0,0,0,0],
  7: [3,3,3,2,0,0,0,0,0,0],
  8: [3,3,3,3,0,0,0,0,0,0],
  9: [3,3,3,3,2,0,0,0,0,0],
  10:[3,3,3,3,3,0,0,0,0,0]
};

// If you want to show cantrip slots, do something like:
//   const oracleSlotProgression = { ... same ... }
//   const showCantripRow = true; // We'll handle it below if you want a row for cantrip.

const CLASS_LEVEL = 10; // or whichever level your Oracle is. 
// This chooses which row of slot progression we use from above.

let userSlots = [];        // For each spell level (0..10?), an array of slot data
let allSpells = [];        // All spells from the JSON (we only display "divine" though)
let currentSlotLevel = null; // Which slot level we clicked (0 for cantrip, 1..10 for spells)
let currentSlotIndex = null; // Which slot index within that level

document.addEventListener('DOMContentLoaded', () => {
  // 1) Fetch spells
  fetch('https://davidaerne.github.io/OracleSpells/spells.json')
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to load spells.json');
      return resp.json();
    })
    .then(data => {
      // Filter: keep only spells that have 'divine' in traditions
      // + (If you want to skip that, remove the filter.)
      allSpells = data.filter(sp => {
        const trad = sp.traditions || [];
        return trad.map(t => t.toLowerCase()).includes('divine');
      });

      // 2) Build the main page (slots). 
      initSlots();
      renderSlotScreen();
    })
    .catch(err => console.error('Error loading spells:', err));

  // 3) Hook up modal close button
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('spell-modal').style.display = 'none';
  });

  // 4) “Assign to Slot” button in the modal
  document.getElementById('modal-assign-btn').addEventListener('click', () => {
    if (currentSlotLevel !== null && currentSlotIndex !== null && chosenSpell) {
      userSlots[currentSlotLevel][currentSlotIndex] = chosenSpell;
      renderSlotScreen();
    }
    document.getElementById('spell-modal').style.display = 'none';
    chosenSpell = null;
    currentSlotLevel = null;
    currentSlotIndex = null;
  });
});

/** 
 * We'll store the chosenSpell in a global variable each time we open the modal 
 * so that "Assign Spell" knows which spell to set 
 */
let chosenSpell = null;

/**
 * Prepare our userSlots array based on the class level’s progression.
 * E.g. if class level=5 => [3,3,2,0,0,0,0,0,0,0], meaning:
 *  - userSlots[0] -> ??? (if we handle cantrip)
 *  - userSlots[1] -> array of 3 slots
 *  - userSlots[2] -> array of 3 slots
 *  - userSlots[3] -> array of 2 slots
 *  etc...
 */
function initSlots() {
  // If you want a separate cantrip row (level 0) with e.g. 2 “slots”, do that here:
  // userSlots[0] = Array(2).fill(null);

  const progression = oracleSlotProgression[CLASS_LEVEL];
  // progression is like [3,3,2,0,0,0,0,0,0,0] at level 5

  userSlots = []; // reset
  // We'll ignore index 0 unless you manually decide to use cantrip row
  // so userSlots[1] is for level 1 spells, userSlots[2] for level 2 spells, etc.
  for (let spellLevel = 1; spellLevel <= 10; spellLevel++) {
    const numSlots = progression[spellLevel - 1]; // array is 0-based
    userSlots[spellLevel] = Array(numSlots).fill(null);
  }
}

/**
 * Renders the entire “slot screen” in #slot-screen:
 *   - For each level that has >0 slots, create a block:
 *       "Level X"
 *       - slot #1
 *       - slot #2
 *       ...
 */
function renderSlotScreen() {
  const container = document.getElementById('slot-screen');
  container.innerHTML = '';

  // If you do cantrip row, you might handle userSlots[0] as a special block:
  // if (userSlots[0] && userSlots[0].length > 0) { ... build "Cantrip" block ... }

  // For each level from 1..10
  for (let lvl = 1; lvl <= 10; lvl++) {
    const slotsForLevel = userSlots[lvl];
    if (!slotsForLevel || slotsForLevel.length === 0) {
      // Means no slots at this level
      continue;
    }
    // Build a block
    const blockDiv = document.createElement('div');
    blockDiv.classList.add('level-block');

    // Header: “Level 1” etc.
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('level-header');
    headerDiv.textContent = `Level ${lvl}`;
    blockDiv.appendChild(headerDiv);

    // UL for the slots
    const ul = document.createElement('ul');
    ul.classList.add('slot-list');

    slotsForLevel.forEach((spellObj, idx) => {
      const li = document.createElement('li');
      li.classList.add('slot-item');

      // Left side: slot name, plus the assigned spell’s name if any
      const infoDiv = document.createElement('div');
      infoDiv.classList.add('slot-info');

      const slotNameSpan = document.createElement('span');
      slotNameSpan.classList.add('slot-name');
      slotNameSpan.textContent = `Slot ${idx+1}`;
      infoDiv.appendChild(slotNameSpan);

      // If we have a spell assigned, show its name
      if (spellObj) {
        const assignedSpan = document.createElement('span');
        assignedSpan.textContent = spellObj.name;
        infoDiv.appendChild(assignedSpan);

        // Clicking the name => show details
        infoDiv.addEventListener('click', () => {
          openSpellDetails(spellObj, lvl, idx);
        });
      } else {
        // No assigned spell => show "[Empty]"
        const emptySpan = document.createElement('span');
        emptySpan.textContent = '[Empty]';
        infoDiv.appendChild(emptySpan);

        // If user clicks => open the modal to select a new spell
        infoDiv.addEventListener('click', () => {
          currentSlotLevel = lvl;
          currentSlotIndex = idx;
          showSpellSelectModal(lvl);
        });
      }

      li.appendChild(infoDiv);

      // Right side: either “Remove” if assigned, or “Select Spell” button 
      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('slot-action-buttons');

      if (spellObj) {
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          userSlots[lvl][idx] = null;
          renderSlotScreen();
        });
        actionsDiv.appendChild(removeBtn);
      } else {
        // A “Select” button (optional). Clicking => open the modal for that level
        const selectBtn = document.createElement('button');
        selectBtn.textContent = 'Select';
        selectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentSlotLevel = lvl;
          currentSlotIndex = idx;
          showSpellSelectModal(lvl);
        });
        actionsDiv.appendChild(selectBtn);
      }

      li.appendChild(actionsDiv);
      ul.appendChild(li);
    });

    blockDiv.appendChild(ul);
    container.appendChild(blockDiv);
  }
}

/**
 * Opens the modal to pick a new spell for a slot of the given level,
 * showing only “divine” spells that match that level (or 0 if you handle cantrip).
 */
function showSpellSelectModal(level) {
  const modal = document.getElementById('spell-modal');
  // We won't fill the fields yet; we'll show a list of spells in the UI somehow,
  // or we can display them in the console, or we can do a "one spell at a time" approach.
  // Let's do the approach: a “master list” wouldn't fit well in a single modal, so we can
  // just pick the first or show a small sub-list. 

  // For simplicity, let's pick “the next step”:
  // We'll store “chosenSpell” only after we call openSpellDetails on it.
  // So let's show a quick version of “choose from sub-list.”

  // Instead, let's reuse openSpellDetails for each divine spell at this level in an <ul>?
  // But that can be big. Alternatively, you could do another modal or a separate page.

  // --- For a minimal example, we'll just do a console listing. ---
  // In a real app, you'd build a custom sub-list. Let's do so:

  // We'll filter spells by level + “divine”
  let filtered = [];
  if (level === 0) {
    // cantrip row => spells with level=0 or traits include 'cantrip'
    filtered = allSpells.filter(sp => {
      const spLvl = parseInt(sp.level, 10);
      const hasCantripTrait = (sp.traits||[]).map(t=>t.toLowerCase()).includes('cantrip');
      return spLvl===0 || hasCantripTrait;
    });
  } else {
    filtered = allSpells.filter(sp => parseInt(sp.level,10)===level);
  }

  // If no spells, just show a simple message
  if (filtered.length===0) {
    chosenSpell = null;
    document.getElementById('modal-spell-name').textContent = `No Divine Spells found at level ${level}`;
    document.getElementById('modal-spell-level').textContent = '';
    document.getElementById('modal-traditions').textContent = '';
    document.getElementById('modal-cast').textContent = '';
    document.getElementById('modal-range').textContent = '';
    document.getElementById('modal-description').textContent = '';
    // Hide the “Assign to Slot” button
    document.getElementById('modal-assign-btn').style.display = 'none';
    modal.style.display = 'block';
    return;
  }

  // Let's just pick the first spell automatically in this example,
  // or you can open a separate sub-modal with a list. 
  // We'll do a minimal approach: pick the first, show details, user can press “Assign”.

  const firstSpell = filtered[0];
  openSpellDetails(firstSpell, level, currentSlotIndex);
}

/**
 * Show the details of a specific spell in the modal. Store it in `chosenSpell` 
 * so that when user clicks "Assign," we set that in the current slot.
 */
function openSpellDetails(spell, lvl, idx) {
  chosenSpell = spell;
  currentSlotLevel = lvl;
  currentSlotIndex = idx;

  const modal = document.getElementById('spell-modal');
  modal.style.display = 'block';

  document.getElementById('modal-assign-btn').style.display = 'inline-block';

  // Fill fields
  document.getElementById('modal-spell-name').textContent = spell.name || 'Untitled Spell';

  let lvlText = spell.level;
  if (parseInt(lvlText, 10)===0) lvlText = 'Cantrip';
  document.getElementById('modal-spell-level').textContent = `Spell Level: ${lvlText}`;

  const tradStr = (spell.traditions||[]).join(', ');
  document.getElementById('modal-traditions').textContent = tradStr || 'None';

  document.getElementById('modal-cast').textContent = spell.cast || 'Unknown';
  document.getElementById('modal-range').textContent = spell.range || 'Unknown';
  document.getElementById('modal-description').textContent = spell.description || 'No description provided';
}
