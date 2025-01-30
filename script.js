/******************************************************************************
 * script.js
 * 
 * 1. Fetches the spells.json data from a remote URL.
 * 2. Normalizes each spell into a consistent shape:
 *      - subType: 'Cantrip' or 'Spell'
 *      - level: numeric or left as-is
 *      - tags: might contain "Offensive", "Defensive", etc.
 *      - traditions: array of traditions
 * 3. Always filters for "divine" spells (Oracle Divine).
 * 4. Has separate dropdowns for:
 *      - Spell Subtype (All | Cantrip | Spell)
 *      - Spell Level (All | 1..10)
 *      - Tag (All | Offensive | Defensive)
 * 5. Also has a text box for name search.
 *****************************************************************************/

const spells = [];        // Master list of all spells
const selectedSpells = []; // Spells user has added

// Fetch JSON data on page load
fetch('https://davidaerne.github.io/OracleSpells/spells.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load spells.json');
    }
    return response.json();
  })
  .then(data => {
    data.forEach(spell => {
      // We'll interpret "Cantrip" vs. "Spell" from the data.
      // If spell.type is "Cantrip" or traits include "cantrip", we consider it a 'Cantrip'
      // Otherwise, we call it a 'Spell' (you could add more logic for "Focus" or "Ritual" if you need)
      let subType = 'Spell';
      const traits = spell.traits || [];
      if (
        (typeof spell.type === 'string' && spell.type.toLowerCase() === 'cantrip') ||
        traits.map(t => t.toLowerCase()).includes('cantrip')
      ) {
        subType = 'Cantrip';
      }

      // Offensive / Defensive / unknown
      let typedTag = 'unknown';
      if (spell.tags && spell.tags.includes('Offensive')) {
        typedTag = 'offensive';
      } else if (spell.tags && spell.tags.includes('Defensive')) {
        typedTag = 'defensive';
      }

      spells.push({
        name: spell.name,
        level: spell.level,  // e.g. 1, 2, 10, or "1" if the JSON is string
        subType,             // 'Cantrip' or 'Spell'
        tags: typedTag,      // 'offensive', 'defensive', or 'unknown'
        traditions: spell.traditions || [],
        cast: spell.cast || 'Unknown',
        range: spell.range || 'Unknown',
        description: spell.description || 'No description available'
      });
    });

    // Populate "All Spells" tab with everything
    displaySpells(spells, 'all-spell-list');
    // Do the initial filter for "Available Spells"
    filterSpells();
  })
  .catch(error => {
    console.error('Error loading spells:', error);
  });

/**
 * Filter the spells for the "Available Spells" tab.
 * We always want "Oracle Divine" (i.e., includes 'divine' in traditions).
 * Then we match:
 *  - Subtype (all | cantrip | spell)
 *  - Level (all | numeric)
 *  - Tag (all | offensive | defensive)
 *  - Name includes search text
 */
function filterSpells() {
  // Grab filter values
  const chosenSubtype = document.getElementById('spell-subtype').value; // 'all', 'cantrip', 'spell'
  const chosenLevel = document.getElementById('spell-level').value;     // 'all' or numeric string
  const chosenTag = document.getElementById('spell-tag').value;         // 'all', 'offensive', 'defensive'
  const searchQuery = document.getElementById('search-box').value.toLowerCase();

  const filtered = spells.filter(spell => {
    // 1) Must have 'divine' in traditions for Oracle Divine
    if (!spell.traditions.includes('divine')) {
      return false;
    }

    // 2) Subtype filter
    if (chosenSubtype !== 'all') {
      // if chosenSubtype = 'cantrip', we want only subType==='Cantrip'
      // if chosenSubtype = 'spell', we want only subType==='Spell'
      const subCheck = spell.subType.toLowerCase() === chosenSubtype;
      if (!subCheck) return false;
    }

    // 3) Level filter
    if (chosenLevel !== 'all') {
      // The JSON might store level as a number or a string
      // Compare them as strings or parse to integer
      // For simplicity, do string compare:
      if (String(spell.level) !== chosenLevel) {
        return false;
      }
    }

    // 4) Tag (offensive / defensive) filter
    if (chosenTag !== 'all') {
      // typedTag is 'offensive', 'defensive', or 'unknown'
      if (spell.tags !== chosenTag) {
        return false;
      }
    }

    // 5) Name search
    if (!spell.name.toLowerCase().includes(searchQuery)) {
      return false;
    }

    // If we passed all conditions, keep this spell
    return true;
  });

  // Show them in the "Available Spells" list
  displaySpells(filtered, 'available-spell-list');
}

/**
 * Displays a list of spells into the given <ul> element by ID
 */
function displaySpells(spellList, elementId) {
  const listElement = document.getElementById(elementId);
  listElement.innerHTML = '';

  spellList.forEach(spell => {
    const li = document.createElement('li');
    li.classList.add('spell-item');

    // Header: name + add button
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('spell-header');
    headerDiv.innerHTML = `
      <span>${spell.name}</span>
      <button onclick="addSpell('${spell.name}')">+</button>
    `;

    // Body details (hidden by default)
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('spell-details');
    detailsDiv.innerHTML = `
      <strong>Level:</strong> ${spell.level}<br>
      <strong>Subtype:</strong> ${spell.subType}<br>
      <strong>Tag:</strong> ${spell.tags}<br>
      <strong>Traditions:</strong> ${spell.traditions.join(', ')}<br>
      <strong>Cast:</strong> ${spell.cast}<br>
      <strong>Range:</strong> ${spell.range}<br>
      <strong>Description:</strong> ${spell.description}
    `;

    // Clicking on the list item toggles the details,
    // but we don't toggle if the user clicked the "+" button.
    li.onclick = (event) => {
      if (!event.target.matches('button')) {
        const alreadyActive = detailsDiv.classList.contains('active');
        // Close all open details
        document.querySelectorAll('.spell-details').forEach(d => d.classList.remove('active'));
        // Toggle current
        if (!alreadyActive) {
          detailsDiv.classList.add('active');
        }
      }
    };

    li.appendChild(headerDiv);
    li.appendChild(detailsDiv);
    listElement.appendChild(li);
  });
}

/**
 * Adds a spell to "Selected Spells" list
 */
function addSpell(spellName) {
  const spell = spells.find(sp => sp.name === spellName);
  if (spell && !selectedSpells.includes(spell)) {
    selectedSpells.push(spell);
    displaySpells(selectedSpells, 'selected-spell-list');
  }
}

/**
 * Switch tab UI
 */
function switchTab(event, tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}
