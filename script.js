/******************************************************************************
 * script.js
 *
 * 1. Hard-code the Oracle Spell Slot progression for levels 1–10.
 * 2. When user picks a "class level," display a table row of that many slots
 *    at each spell level (1..10).
 * 3. Each slot is clickable:
 *      - It opens a modal listing all spells of that level.
 *      - Clicking "+" on a spell assigns that spell to the slot, closes the modal.
 * 4. We fetch the entire spells JSON from your GitHub link. We do NOT filter
 *    them by tradition or tags, so you see *all* spells for the chosen level.
 *****************************************************************************/

// Oracle slot progression: array index = class level
// Each element is an array of 10 items representing the # of slots at each spell level 1..10
// e.g. oracleSlotProgression[5] => [3,3,2,0,0,0,0,0,0,0] => means at class level 5, you have
//   3 first-level slots, 3 second-level slots, 2 third-level slots, etc.
const oracleSlotProgression = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [3, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  5: [3, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  6: [3, 3, 3, 0, 0, 0, 0, 0, 0, 0],
  7: [3, 3, 3, 2, 0, 0, 0, 0, 0, 0],
  8: [3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
  9: [3, 3, 3, 3, 2, 0, 0, 0, 0, 0],
  10: [3, 3, 3, 3, 3, 0, 0, 0, 0, 0]
};

// We'll keep an array that mirrors the # of slots for the *selected* level.
// For instance, if class level is 5 => [3,3,2,0,0,0,0,0,0,0] => then we store
// which spell each slot is assigned to. e.g. at "1st-level, slot #1 => Fireball" etc.
// This is purely for display. If you have 3 slots at 1st level, userSelectedSpells[0] = Array of 3 spells (or null).
let userSelectedSpells = [];

// We'll store all spells from JSON
let allSpells = [];

/**
 * On page load, fetch spells from your GitHub JSON
 * Then set up event listeners and initialize table for default class level (1).
 */
document.addEventListener('DOMContentLoaded', () => {
  // Fetch all spells
  fetch('https://davidaerne.github.io/OracleSpells/spells.json')
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to load spells.json');
      return resp.json();
    })
    .then(data => {
      allSpells = data; // store all spells
    })
    .catch(err => console.error('Error loading spells:', err));

  // When user changes the class level dropdown, rebuild the table
  const classLevelSelect = document.getElementById('class-level');
  classLevelSelect.addEventListener('change', updateSpellSlotsTable);

  // Also close the modal if user clicks the "X"
  const modalClose = document.getElementById('modal-close');
  modalClose.addEventListener('click', () => {
    const modal = document.getElementById('spell-modal');
    modal.style.display = 'none';
  });

  // Initialize table for the default value (level 1)
  updateSpellSlotsTable();
});

/**
 * Builds the table row(s) for the current class level,
 * based on oracleSlotProgression. Each cell is clickable.
 */
function updateSpellSlotsTable() {
  const level = parseInt(document.getElementById('class-level').value, 10);
  const slotsTableBody = document.querySelector('#spell-slots-table tbody');
  slotsTableBody.innerHTML = ''; // clear existing rows

  // e.g. for level=5 => [3,3,2,0,0,0,0,0,0,0]
  const slotArray = oracleSlotProgression[level];

  // Reinitialize userSelectedSpells with the correct structure
  // We'll store an array of arrays, one sub-array per spell level (1..10).
  // Each sub-array has "slotArray[i]" number of entries, initially null.
  userSelectedSpells = slotArray.map(slotCount => Array(slotCount).fill(null));

  // We'll display just a *single row* with 10 columns for spell levels 1..10
  // Each cell will contain sub-slots if slotCount > 0
  const row = document.createElement('tr');

  for (let i = 0; i < 10; i++) {
    const td = document.createElement('td');
    td.classList.add('slot-cell');

    const slotCount = slotArray[i];
    if (slotCount === 0) {
      td.textContent = '-';
      td.classList.remove('slot-cell');
    } else {
      // Build a small sub-list of each slot
      // e.g. if slotCount=3, we create three lines: "Slot 1: [empty]" ...
      let htmlContent = '';
      for (let s = 0; s < slotCount; s++) {
        htmlContent += `
          <div class="slot-line" data-slot-level="${i+1}" data-slot-index="${s}">
            Slot ${s+1}: <span class="assigned-spell">[empty]</span>
          </div>
        `;
      }
      td.innerHTML = htmlContent;
    }

    row.appendChild(td);
  }

  slotsTableBody.appendChild(row);

  // Add event listeners to each slot-line
  document.querySelectorAll('.slot-line').forEach(slotLine => {
    slotLine.addEventListener('click', e => {
      e.stopPropagation(); // don't bubble to the TD
      const levelIndex = parseInt(slotLine.dataset.slotLevel, 10); // 1..10
      const slotIndex = parseInt(slotLine.dataset.slotIndex, 10); // which slot # within that level
      openSpellModal(levelIndex, slotIndex);
    });
  });
}

/**
 * Opens a modal listing all spells of the given "spell level" (1..10).
 * Clicking "+" sets the selected spell in userSelectedSpells, closes the modal,
 * and updates the displayed slot in the table.
 */
function openSpellModal(spellLevel, slotIndex) {
  const modal = document.getElementById('spell-modal');
  const modalLevelLabel = document.getElementById('modal-level-label');
  const modalSpellList = document.getElementById('modal-spell-list');

  modalLevelLabel.textContent = `Showing spells of Level ${spellLevel}`;

  // Clear old list
  modalSpellList.innerHTML = '';

  // Filter allSpells to only those that have "level == spellLevel"
  // or if your data sometimes stores the level as a string, do `==` instead of `===`.
  const spellsAtThisLevel = allSpells.filter(sp => parseInt(sp.level, 10) === spellLevel);

  if (spellsAtThisLevel.length === 0) {
    const li = document.createElement('li');
    li.textContent = '(No spells at this level in the JSON)';
    modalSpellList.appendChild(li);
  } else {
    // Build a list item with a "+" button for each spell
    spellsAtThisLevel.forEach(spell => {
      const li = document.createElement('li');
      li.classList.add('spell-item');
      li.innerHTML = `
        <span>${spell.name}</span>
        <button>+</button>
      `;
      // Clicking "+" assigns the spell
      li.querySelector('button').addEventListener('click', () => {
        assignSpellToSlot(spell.name, spellLevel, slotIndex);
        modal.style.display = 'none'; // close modal
      });
      modalSpellList.appendChild(li);
    });
  }

  // Show modal
  modal.style.display = 'block';
}

/**
 * Updates userSelectedSpells array and the table display
 * so that the clicked slot shows the chosen spell name.
 */
function assignSpellToSlot(spellName, spellLevel, slotIndex) {
  // Spell levels are 1..10, but our array is zero-based:
  // userSelectedSpells[ spellLevel-1 ] = the sub-array for that level
  const levelArray = userSelectedSpells[spellLevel - 1];
  if (!levelArray || slotIndex >= levelArray.length) {
    return; // safety check
  }

  // Assign that spell
  levelArray[slotIndex] = spellName;

  // Update the visible text in the table
  // We'll find the correct ".slot-line" element
  // The data attributes: [data-slot-level="spellLevel"][data-slot-index="slotIndex"]
  const slotLine = document.querySelector(
    `.slot-line[data-slot-level="${spellLevel}"][data-slot-index="${slotIndex}"]`
  );
  if (slotLine) {
    const span = slotLine.querySelector('.assigned-spell');
    if (span) {
      span.textContent = spellName;
    }
  }
}
