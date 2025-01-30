 document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('#menu a');
    const sections = document.querySelectorAll('.content-section');
    const levelSelect = document.getElementById('level-select');
    const spellSlotsContainer = document.getElementById('spell-slots');
    const spellList = document.getElementById('spell-list');

    // Placeholder spell data
    const spells = {
        cantrips: ["Ray of Frost", "Electric Arc", "Detect Magic"],
        level1: ["Magic Missile", "Shield", "Mage Armor"],
        level2: ["Mirror Image", "Invisibility", "Scorching Ray"],
        level3: ["Fireball", "Counterspell", "Haste"],
        level4: ["Black Tentacles", "Phantasmal Killer", "Stoneskin"],
        level5: ["Cloudkill", "Wall of Force", "Cone of Cold"],
        level6: ["Chain Lightning", "Disintegrate", "True Seeing"],
        level7: ["Power Word Pain", "Prismatic Spray", "Finger of Death"],
        level8: ["Earthquake", "Horrid Wilting", "Maze"],
        level9: ["Meteor Swarm", "Time Stop", "Wish"],
        level10: ["Cataclysm", "Foresight", "Gate"]
    };

    // Default view: Always show Cantrips
    function showCantrips() {
        spellList.innerHTML = `<h4>Cantrips</h4>`;
        spells.cantrips.forEach(spell => {
            const li = document.createElement('li');
            li.textContent = spell;
            spellList.appendChild(li);
        });
    }
    showCantrips();

    // Navigation Handling
    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = link.getAttribute('data-target');

            sections.forEach(section => {
                section.style.display = section.id === target ? 'block' : 'none';
            });
        });
    });

    // Spell Slot Rendering based on Level
    levelSelect.addEventListener('change', () => {
        const level = levelSelect.value;
        spellSlotsContainer.innerHTML = `<h4>Level ${level} Spell Slots</h4>`;

        // Simulating spell slot numbers
        const slots = Math.max(1, 11 - level); // Higher levels have fewer slots
        for (let i = 1; i <= slots; i++) {
            const slot = document.createElement('button');
            slot.textContent = `Slot ${i}`;
            slot.classList.add('spell-slot');
            slot.dataset.level = level;
            spellSlotsContainer.appendChild(slot);
        }

        // Update spell list for selected level
        updateSpellList(level);
    });

    function updateSpellList(level) {
        spellList.innerHTML = `<h4>Level ${level} Spells</h4>`;
        if (spells[`level${level}`]) {
            spells[`level${level}`].forEach(spell => {
                const li = document.createElement('li');
                li.textContent = spell;
                spellList.appendChild(li);
            });
        }
    }

    // Event Listener for Selecting a Spell Slot
    spellSlotsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('spell-slot')) {
            const selectedLevel = event.target.dataset.level;
            updateSpellList(selectedLevel);
        }
    });

    // Initialize spell slots for Level 1 on page load
    levelSelect.value = "1";
    levelSelect.dispatchEvent(new Event('change'));
});
