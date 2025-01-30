/******************************************************************************
 * script.js - PF2e Oracle Spell List Tracker with Saving & Level Selection
 *****************************************************************************/

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

const CANTRIP_SLOTS = 5;
let userSlots = [];
let allSpells = [];
let currentSlotLevel = null;
let currentSlotIndex = null;
let chosenSpell = null;
let selectedLevel = 10; // Default Oracle level

document.addEventListener('DOMContentLoaded', () => {
  loadSpellData();

  fetch('https://davidaerne.github.io/OracleSpells/spells.json')
    .then(resp => resp.json())
    .then(data => {
      allSpells = data.filter(sp => (sp.traditions || []).map(t => t.toLowerCase()).includes('divine'));
      initSlots();
      renderSlotScreen();
    })
    .catch(err => console.error('Error loading spells:', err));

  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('spell-modal').style.display = 'none';
  });

  document.getElementById('modal-assign-btn').addEventListener('click', () => {
    if (currentSlotLevel !== null && currentSlotIndex !== null && chosenSpell) {
      userSlots[currentSlotLevel][currentSlotIndex] = chosenSpell;
      saveSpellData();
      renderSlotScreen();
    }
    document.getElementById('spell-modal').style.display = 'none';
  });

  document.getElementById('level-select').addEventListener('change', (event) => {
    selectedLevel = parseInt(event.target.value, 10);
    initSlots();
    renderSlotScreen();
    saveSpellData();
  });

  document.getElementById('save-data-btn').addEventListener('click', saveSpellData);
  document.getElementById('load-data-btn').addEventListener('click', loadSpellData);
});

/** Initializes userSlots based on selected Oracle level */
function initSlots() {
  userSlots = [];
  userSlots[0] = Array(CANTRIP_SLOTS).fill(null);

  const progression = oracleSlotProgression[selectedLevel];
  for (let spellLevel = 1; spellLevel <= 10; spellLevel++) {
    userSlots[spellLevel] = Array(progression[spellLevel - 1]).fill(null);
  }
}

/** Renders all spell slots */
function renderSlotScreen() {
  const container = document.getElementById('slot-screen');
  container.innerHTML = '';

  renderLevelBlock(container, 0, "Cantrips");

  for (let lvl = 1; lvl <= 10; lvl++) {
    if (userSlots[lvl] && userSlots[lvl].length > 0) {
      renderLevelBlock(container, lvl, `Level ${lvl}`);
    }
  }
}

/** Renders a level block */
function renderLevelBlock(container, lvl, title) {
  const blockDiv = document.createElement('div');
  blockDiv.classList.add('level-block');

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('level-header');
  headerDiv.textContent = title;
  blockDiv.appendChild(headerDiv);

  const ul = document.createElement('ul');
  ul.classList.add('slot-list');

  userSlots[lvl].forEach((spellObj, idx) => {
    const li = document.createElement('li');
    li.classList.add('slot-item');

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('slot-info');

    const slotNameSpan = document.createElement('span');
    slotNameSpan.textContent = `Slot ${idx + 1}`;
    infoDiv.appendChild(slotNameSpan);

    if (spellObj) {
      const assignedSpan = document.createElement('span');
      assignedSpan.textContent = spellObj.name;
      infoDiv.appendChild(assignedSpan);
      infoDiv.addEventListener('click', () => openSpellDetails(spellObj, lvl, idx));
    } else {
      const emptySpan = document.createElement('span');
      emptySpan.textContent = '[Empty]';
      infoDiv.appendChild(emptySpan);
      infoDiv.addEventListener('click', () => {
        currentSlotLevel = lvl;
        currentSlotIndex = idx;
        showSpellSelectModal(lvl);
      });
    }

    li.appendChild(infoDiv);
    ul.appendChild(li);
  });

  blockDiv.appendChild(ul);
  container.appendChild(blockDiv);
}

/** Saves spell data to localStorage */
function saveSpellData() {
  const saveData = {
    selectedLevel,
    userSlots
  };
  localStorage.setItem('oracleSpellData', JSON.stringify(saveData));
}

/** Loads spell data from localStorage */
function loadSpellData() {
  const savedData = JSON.parse(localStorage.getItem('oracleSpellData'));
  if (savedData) {
    selectedLevel = savedData.selectedLevel || 10;
    userSlots = savedData.userSlots || [];
    document.getElementById('level-select').value = selectedLevel;
    renderSlotScreen();
  }
}

/** Opens spell selection modal */
function showSpellSelectModal(level) {
  const modal = document.getElementById('spell-modal');
  const filteredSpells = allSpells.filter(sp => parseInt(sp.level, 10) === level);
  
  if (filteredSpells.length === 0) {
    document.getElementById('modal-spell-name').textContent = `No spells at level ${level}`;
    document.getElementById('modal-assign-btn').style.display = 'none';
    modal.style.display = 'block';
    return;
  }

  openSpellDetails(filteredSpells[0], level, currentSlotIndex);
}

/** Opens modal to show spell details */
function openSpellDetails(spell, lvl, idx) {
  chosenSpell = spell;
  currentSlotLevel = lvl;
  currentSlotIndex = idx;

  document.getElementById('modal-spell-name').textContent = spell.name || 'Unknown';
  document.getElementById('modal-spell-level').textContent = `Spell Level: ${spell.level}`;
  document.getElementById('modal-traditions').textContent = spell.traditions.join(', ') || 'None';
  document.getElementById('modal-cast').textContent = spell.cast || 'Unknown';
  document.getElementById('modal-range').textContent = spell.range || 'Unknown';
  document.getElementById('modal-description').textContent = spell.description || 'No description available';

  document.getElementById('spell-modal').style.display = 'block';
}
