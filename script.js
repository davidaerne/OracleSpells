/******************************************************************************
 * script.js
 * 
 * 1. Fetch all spells (including cantrips).
 * 2. Build an accordion for "Cantrip" + levels 1..10, each showing all spells of that level.
 * 3. When you click a spell, a modal shows the details (name, traditions, description, etc.).
 * 4. A "Add Spell" button in the modal adds it to "Selected Spells."
 * 5. The "Selected Spells" list is also clickable, so you can re-open a spell’s details if desired.
 *****************************************************************************/

let spells = [];           // all spells from JSON
let selectedSpells = [];   // list of chosen spells

document.addEventListener('DOMContentLoaded', () => {
  // Fetch from your GitHub JSON
  fetch('https://davidaerne.github.io/OracleSpells/spells.json')
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to load spells.json');
      return resp.json();
    })
    .then(data => {
      spells = data;
      buildAccordion(); // create the single-column levels
    })
    .catch(err => console.error('Error loading spells:', err));

  // Close modal if user clicks the "X"
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('spell-modal').style.display = 'none';
  });
});

/**
 * Builds an accordion with sections: "Cantrip," "Level 1," "Level 2," ... "Level 10."
 * Each section has a list of spells for that level.
 */
function buildAccordion() {
  const container = document.getElementById('accordion-container');
  container.innerHTML = '';

  // We want "Cantrip" + numeric levels 1..10
  const allLevels = ['Cantrip', '1','2','3','4','5','6','7','8','9','10'];

  allLevels.forEach(levelLabel => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('accordion-item');

    // Accordion Header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('accordion-header');
    headerDiv.innerHTML = `
      <span>${levelLabel === 'Cantrip' ? 'Cantrip' : 'Level ' + levelLabel}</span>
      <span>+</span>
    `;

    // Accordion Content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('accordion-content');

    // Filter spells for this level
    // If "Cantrip," show spells where "spell.level" is 0 or "type" is "Cantrip" or "traits" includes "cantrip".
    // If numeric, show spells with parseInt(spell.level)== that number
    let filteredSpells = [];
    if (levelLabel === 'Cantrip') {
      filteredSpells = spells.filter(sp => {
        // Some spells might have "type": "Cantrip" or "traits": ["cantrip"]
        // or might literally have "level": 0. Adjust logic to your data format.
        const isTypeCantrip = (typeof sp.type === 'string' && sp.type.toLowerCase() === 'cantrip');
        const hasCantripTrait = (sp.traits||[]).map(t=>t.toLowerCase()).includes('cantrip');
        const numericLevel = parseInt(sp.level, 10);
        return (isTypeCantrip || hasCantripTrait || numericLevel === 0);
      });
    } else {
      const desiredLevel = parseInt(levelLabel, 10);
      filteredSpells = spells.filter(sp => parseInt(sp.level, 10) === desiredLevel);
    }

    // Build a UL of spells
    const ul = document.createElement('ul');
    ul.classList.add('spell-list');

    // For each spell, create a row with name, traditions, and "Spell X" label (like your screenshot)
    filteredSpells.forEach(spell => {
      const li = document.createElement('li');
      li.classList.add('spell-list-item');

      const spellName = spell.name || 'Unnamed Spell';
      const traditionStr = (spell.traditions || []).join(', ') || 'No Traditions';
      const levelString = (levelLabel === 'Cantrip') 
        ? 'Spell Cantrip'
        : `Spell ${spell.level}`;

      li.innerHTML = `
        <div class="spell-info">
          <strong>${spellName}</strong>
          <span>${traditionStr}</span>
          <span class="spell-level-label">${levelString}</span>
        </div>
        <button title="View Details/Select">+</button>
      `;

      // Clicking anywhere but the button => open details
      // Or we can unify: if user clicks anywhere in the LI, open details
      // and in the modal is a "Add Spell" button
      li.addEventListener('click', e => {
        // If user clicked the button, we also open the modal, but we know the next step is "Add Spell"
        showSpellModal(spell);
        e.stopPropagation();
      });

      // If you only want the plus button to open details, remove the li.addEventListener
      ul.appendChild(li);
    });

    if (filteredSpells.length === 0) {
      const noSpellLi = document.createElement('li');
      noSpellLi.textContent = '(No spells found for this level.)';
      ul.appendChild(noSpellLi);
    }

    contentDiv.appendChild(ul);

    // Toggle accordion on header click
    headerDiv.addEventListener('click', () => {
      const isActive = contentDiv.classList.contains('active');
      // Close all other open content
      document.querySelectorAll('.accordion-content').forEach(div => div.classList.remove('active'));
      // Toggle this one
      if (!isActive) {
        contentDiv.classList.add('active');
      }
    });

    itemDiv.appendChild(headerDiv);
    itemDiv.appendChild(contentDiv);
    container.appendChild(itemDiv);
  });
}

/**
 * Opens the modal with the given spell's details.
 */
function showSpellModal(spell) {
  // Fill modal fields
  document.getElementById('modal-spell-name').textContent = spell.name || 'Untitled Spell';

  let levelText = spell.level;
  if (typeof levelText === 'string') levelText = parseInt(levelText, 10);
  if (isNaN(levelText)) levelText = 'Cantrip'; // fallback
  if (levelText === 0) levelText = 'Cantrip';  // if the data uses 0 for cantrips
  document.getElementById('modal-spell-level').textContent = 
    (levelText === 'Cantrip') ? 'Cantrip' : `Spell Level: ${levelText}`;

  document.getElementById('modal-traditions').textContent = (spell.traditions || []).join(', ') || 'None';
  document.getElementById('modal-cast').textContent = spell.cast || 'Unknown';
  document.getElementById('modal-range').textContent = spell.range || 'Unknown';
  document.getElementById('modal-description').textContent = spell.description || 'No description provided';

  // Show the modal
  const modal = document.getElementById('spell-modal');
  modal.style.display = 'block';

  // “Add Spell” button => push to selectedSpells if not already
  const addBtn = document.getElementById('modal-add-btn');
  addBtn.onclick = () => {
    addSpellToSelected(spell);
    modal.style.display = 'none';
  };
}

/**
 * Adds a spell to `selectedSpells` (if not already present),
 * then re-renders the #selected-spells-list.
 */
function addSpellToSelected(spell) {
  // Avoid duplicates
  if (!selectedSpells.find(s => s.name === spell.name)) {
    selectedSpells.push(spell);
    renderSelectedSpells();
  }
}

/**
 * Renders the selected spells in a single-column list.
 * Clicking any item re-opens the modal with details.
 */
function renderSelectedSpells() {
  const list = document.getElementById('selected-spells-list');
  list.innerHTML = '';

  selectedSpells.forEach(spell => {
    const li = document.createElement('li');
    li.textContent = spell.name;
    // On click => show details
    li.addEventListener('click', () => {
      showSpellModal(spell);
    });
    list.appendChild(li);
  });
}
