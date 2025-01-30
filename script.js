/******************************************************************************
 * script.js
 *
 * - Fetch all spells from your JSON URL.
 * - Group them by "Cantrip" vs. numeric levels 1..10.
 * - Display them in an accordion: each level is one "row" in the accordion.
 * - When you click on a level header, it expands that group and collapses others.
 * - Each spell can be expanded to see details and can be added to "Selected Spells."
 ******************************************************************************/

const spells = [];
const selectedSpells = [];

/**
 * On load, fetch the remote JSON
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
      // Determine if it's a cantrip. We check "type" or "traits" for "cantrip"
      const traits = spell.traits || [];
      const isCantrip =
        (typeof spell.type === 'string' && spell.type.toLowerCase() === 'cantrip') ||
        traits.map(t => t.toLowerCase()).includes('cantrip');

      // Store each spell in a consistent shape
      spells.push({
        name: spell.name,
        level: spell.level,             // Usually a number or string
        isCantrip: isCantrip,           // Boolean
        traditions: spell.traditions || [],
        cast: spell.cast || 'Unknown',
        range: spell.range || 'Unknown',
        description: spell.description || 'No description available'
      });
    });

    // Build the accordion in #accordion-container
    buildAccordion();
  })
  .catch(err => console.error('Error loading spells:', err));

/**
 * Builds an accordion of 11 rows: "Cantrip" + levels 1..10.
 * Each row is clickable to show/hide spells of that level.
 */
function buildAccordion() {
  const container = document.getElementById('accordion-container');
  container.innerHTML = '';

  // We'll define the levels we care about, including "Cantrip"
  const levels = ['Cantrip', '1','2','3','4','5','6','7','8','9','10'];

  levels.forEach(levelLabel => {
    // Create a div for each accordion item
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('accordion-item');

    // The clickable header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('accordion-header');
    headerDiv.textContent = (levelLabel === 'Cantrip')
      ? 'Cantrip'
      : `Level ${levelLabel}`;

    // The collapsible content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('accordion-content');

    // Filter spells for this level
    // If levelLabel === 'Cantrip', we only include spells where isCantrip === true.
    // Otherwise, we match the numeric level to the levelLabel.
    let spellsForLevel = [];
    if (levelLabel === 'Cantrip') {
      spellsForLevel = spells.filter(s => s.isCantrip);
    } else {
      spellsForLevel = spells.filter(s => String(s.level) === levelLabel && !s.isCantrip);
    }

    // Build a UL of spells
    const ul = document.createElement('ul');
    spellsForLevel.forEach(spell => {
      const li = document.createElement('li');
      li.classList.add('spell-item');

      // Spell header
      const liHeader = document.createElement('div');
      liHeader.classList.add('spell-header');
      liHeader.innerHTML = `
        <span>${spell.name}</span>
        <button onclick="addSpell('${spell.name}')">+</button>
      `;

      // Spell details (hidden by default)
      const detailsDiv = document.createElement('div');
      detailsDiv.classList.add('spell-details');
      detailsDiv.innerHTML = `
        <strong>Level:</strong> ${spell.isCantrip ? 'Cantrip' : spell.level}<br>
        <strong>Traditions:</strong> ${spell.traditions.join(', ') || 'None'}<br>
        <strong>Cast:</strong> ${spell.cast}<br>
        <strong>Range:</strong> ${spell.range}<br>
        <strong>Description:</strong> ${spell.description}<br>
      `;

      // Clicking anywhere on the LI (except the + button) toggles details
      li.onclick = (event) => {
        if (!event.target.matches('button')) {
          const active = detailsDiv.classList.contains('active');
          // Close all other open details in this UL
          ul.querySelectorAll('.spell-details').forEach(d => d.classList.remove('active'));
          // Toggle current
          if (!active) {
            detailsDiv.classList.add('active');
          }
        }
      };

      li.appendChild(liHeader);
      li.appendChild(detailsDiv);
      ul.appendChild(li);
    });

    // If no spells exist for that level, display a small note
    if (spellsForLevel.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = '(No spells found)';
      ul.appendChild(msg);
    }

    contentDiv.appendChild(ul);

    // Clicking the header toggles this level's content,
    // and collapses any other open content in the accordion.
    headerDiv.onclick = () => {
      // Close all other accordion-content
      document.querySelectorAll('.accordion-content').forEach(div => {
        if (div !== contentDiv) {
          div.classList.remove('active');
        }
      });
      // Toggle this one
      contentDiv.classList.toggle('active');
    };

    itemDiv.appendChild(headerDiv);
    itemDiv.appendChild(contentDiv);
    container.appendChild(itemDiv);
  });
}

/**
 * Add a spell to the "Selected Spells" list if not already added.
 */
function addSpell(spellName) {
  const spell = spells.find(s => s.name === spellName);
  if (spell && !selectedSpells.includes(spell)) {
    selectedSpells.push(spell);
    displaySelectedSpells();
  }
}

/**
 * Renders selectedSpells[] into #selected-spell-list
 */
function displaySelectedSpells() {
  const list = document.getElementById('selected-spell-list');
  list.innerHTML = '';

  selectedSpells.forEach(spell => {
    const li = document.createElement('li');
    li.classList.add('spell-item');
    li.textContent = spell.name;
    list.appendChild(li);
  });
}
