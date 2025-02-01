// Add this function to handle text formatting
function formatDescription(text) {
    if (!text) return 'No description available.';
    // Replace **text** with <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Update the showSpellDetails function's description part
function showSpellDetails(spell) {
    const modal = document.getElementById('spellModal');
    const title = document.getElementById('spellTitle');
    const level = document.getElementById('spellLevel');
    const details = document.getElementById('spellDetails');

    title.textContent = spell.name;
    level.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;

    details.innerHTML = `
        <div>
            <div class="font-semibold">Traits</div>
            <div>${spell.traits?.join(', ') || 'None'}</div>
        </div>
        ${spell.cast ? `
            <div>
                <div class="font-semibold">Cast</div>
                <div>${formatDescription(spell.cast)}</div>
            </div>
        ` : ''}
        ${spell.range ? `
            <div>
                <div class="font-semibold">Range</div>
                <div>${formatDescription(spell.range)}</div>
            </div>
        ` : ''}
        ${spell.targets ? `
            <div>
                <div class="font-semibold">Targets</div>
                <div>${formatDescription(spell.targets)}</div>
            </div>
        ` : ''}
        ${spell['saving throw'] ? `
            <div>
                <div class="font-semibold">Saving Throw</div>
                <div>${formatDescription(spell['saving throw'])}</div>
            </div>
        ` : ''}
        <div>
            <div class="font-semibold">Description</div>
            <div class="whitespace-pre-wrap">${formatDescription(spell.description)}</div>
        </div>
    `;

    modal.classList.remove('hidden');
}
