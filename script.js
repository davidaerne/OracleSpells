/**
 * script.js
 * This file loads spells from a remote JSON, filters them,
 * and displays only "Oracle Divine" spells (i.e., spells that include 'divine' in traditions).
 * When the user selects "Cantrip" in the dropdown, it checks if the spell is typed as "Cantrip"
 * or has "cantrip" in traits. Otherwise it uses numeric level filtering.
 */

const spells = [];       // Master list of all spells from JSON
const selectedSpells = []; // Spells the user adds

/**
 * Fetch the JSON data on page load
 */
fetch('https://davidaerne.github.io/OracleSpells/spells.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load spells.json');
    }
    return response.json();
  })
  .then(data => {
    data.forEach(spell => {
      // We'll store "traits" if it exists
      const traits = spell.traits || [];

      // We'll define a standard "type" for each spell:
      // - "Cantrip" if 'type' is "Cantrip" or traits contain "cantrip"
      // - "offensive"/"defensive" if the spell tags or type says so
      // - Otherwise "unknown"
      let newType = 'unknown';

      // If the JSON has something like:  "type": "Cantrip",
      // or the "traits" includes "cantrip"
      if (
        (typeof spell.type === 'string' && spell.type.toLowerCase() === 'cantrip') ||
        (traits.includes('cantrip'))
      ) {
        newType = 'Cantrip';
      }
      // If the JSON has "tags": ["Offensive"]...
      else if (spell.tags && spell.tags.includes('Offensive')) {
        newType = 'offensive';
      }
      else if (spell.tags && spell.tags.includes('Defensive')) {
        newType = 'defensive';
      }

      // Push a standardized object into our spells array
      spells.push({
        name: spell.name,
        level: spell.level, // might be numeric (1-10) or a string
        type: newType,
        traits: traits,
        traditions: spell.traditions || [],
        cast: spell.cast || 'Unknown',
        range: spell.range || 'Unknown',
        description: spell.description || 'No description available'
      });
    });

    // Populate the "All Spells" tab with every spell from the JSON
    displaySpells(spells, 'all-spell-list');

    // Also apply an initial filter to show "Available Spells"
    filterSpells();
  })
  .catch(error => {
    console.error('Error loading spells:', error);
  });


/**
 * Filters spells for the "Available Spells" tab.
 *   - Must include 'divine' in traditions (Oracle Divine).
 *   - Must match the selected "level" or "Cantrip" selection.
 *   - Must match the selected "type" (offensive/defensive/all).
 *   - Must match the name search box (case-insensitive).
 */
function filterSpells() {
  const level = document.getElementById('spell-level').value;
  const type = document.getElementById('spell-type').value;
  const searchQuery = document.getElementById('search-box').value.toLowerCase();

  // Filter array
  const filteredSpells = spells.filter(spell => {
    // 1) We only want "Oracle Divine" spells, so the traditions must contain 'divine'
    const isDivine = spell.traditions.includes('divine');
    if (!isDivine) return false;  // skip immediately if not divine

    // 2) Check the selected spell-level:
    //    - If user chose "Cantrip", we match if our standardized "type" is "Cantrip".
    //    - Otherwise, compare numeric levels (the JSON might store them as a number or string)
    let matchesLevel = false;
    if (level === 'Cantrip') {
      matchesLevel = (spell.type === 'Cantrip');
    } else {
      matchesLevel = (spell.level == level); 
    }
    if (!matchesLevel) return false;

    // 3) Match type: 'all' means skip the check; 'offensive' or 'defensive' must match
    //    (We've standardized `spell.type` as 'offensive', 'defensive', 'Cantrip', or 'unknown')
    const matchesType = (type === 'all' || spell.type === type);
    if (!matchesType) return false;

    // 4) Name search
    const matchesName = spell.name.toLowerCase().includes(searchQuery);
    if (!matchesName) return false;

    // If all conditions pass, this spell is included
    return true;
  });

  // Display results in "Available Spells"
  displaySpells(filteredSpells, 'available-spell-list');
}


/**
 * Renders a list of spells into a UL element with ID == elementId
 */
function displaySpells(spellList, elementId) {
  const listElement = document.getElementById(elementId);
  listElement.innerHTML = '';

  spellList.forEach(spell => {
    const li = document.createElement('li');
    li.classList.add('spell-item');

    // Header: name and plus button
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('spell-header');
    headerDiv.innerHTML = `
      <span>${spell.name}</span>
      <button onclick="addSpell('${spell.name}')">+</button>
    `;

    // Details: hidden by default
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('spell-details');
    detailsDiv.innerHTML = `
      <strong>Level:</strong> ${spell.level}<br>
      <strong>Type:</strong> ${spell.type || 'N/A'}<br>
      <strong>Traditions:</strong> ${spell.traditions.join(', ')}<br>
      <strong>Cast:</strong> ${spell.cast}<br>
      <strong>Range:</strong> ${spell.range}<br>
      <strong>Description:</strong> ${spell.description}<br>
    `;

    // When the user clicks anywhere on the LI except the + button, toggle details
    li.onclick = (event) => {
      if (!event.target.matches('button')) {
        const active = detailsDiv.classList.contains('active');
        // Close all open details first
        document.querySelectorAll('.spell-details').forEach(d => d.classList.remove('active'));
        // Then toggle this one
        if (!active) detailsDiv.classList.add('active');
      }
    };

    li.appendChild(headerDiv);
    li.appendChild(detailsDiv);
    listElement.appendChild(li);
  });
}


/**
 * Adds a spell to the "Selected Spells" list
 */
function addSpell(spellName) {
  const spell = spells.find(sp => sp.name === spellName);
  if (spell && !selectedSpells.includes(spell)) {
    selectedSpells.push(spell);
    displaySpells(selectedSpells, 'selected-spell-list');
  }
}


/**
 * Switches between the three tabs (Available, Selected, All)
 */
function switchTab(event, tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}
