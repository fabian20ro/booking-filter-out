function createButton(text, id, onClick, symbol = null) {
    const button = document.createElement('button');
    button.textContent = symbol || text;
    button.id = id;
    button.title = text;
    button.addEventListener('click', onClick);
    return button;
}

function showMessage(message) {
    const msgBox = document.createElement('div');
    msgBox.textContent = message;
    msgBox.style.position = 'fixed';
    msgBox.style.top = '20px';
    msgBox.style.left = '50%';
    msgBox.style.transform = 'translateX(-50%)';
    msgBox.style.background = '#444';
    msgBox.style.color = '#fff';
    msgBox.style.padding = '10px 20px';
    msgBox.style.borderRadius = '5px';
    msgBox.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    msgBox.style.zIndex = '10001';
    document.body.appendChild(msgBox);

    setTimeout(() => {
        document.body.removeChild(msgBox);
    }, 3000);
}

function insertControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'animal-filter-panel';

    const topRow = document.createElement('div');
    topRow.className = 'panel-row panel-row-top';

    const bottomRow = document.createElement('div');
    bottomRow.className = 'panel-row panel-row-bottom';

    const statusText = document.createElement('div');
    statusText.id = 'hotel-list-status';
    updateHotelListCount();

    const saveBtn = createButton('Add visible hotels', 'save-animals-btn', saveAnimalFriendlyProperties, '+');
    const filterBtn = createButton('Exclude added hotels', 'filter-animals-btn', filterOutAnimalFriendlyProperties, '⊘');
    const clearBtn = createButton('Clear hotel filter list', 'clear-animals-btn', clearAnimalFriendlyList, 'x');
    const copyBtn = createButton('Copy non-excluded hotels', 'copy-non-excluded-btn', copyNonExcludedHotels, '⧉');

    const hoverList = document.createElement('div');
    hoverList.id = 'hover-hotel-list';

    saveBtn.addEventListener('mouseenter', () => {
        const saved = JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
        hoverList.innerHTML = saved.length ? '<ul>' + saved.map(name => `<li>${name}</li>`).join('') + '</ul>' : '<i>No hotels saved</i>';
        hoverList.style.display = 'block';
    });

    panel.addEventListener('mouseleave', () => {
        hoverList.style.display = 'none';
    });

    topRow.appendChild(statusText);
    topRow.appendChild(clearBtn);

    bottomRow.appendChild(saveBtn);
    bottomRow.appendChild(filterBtn);
    bottomRow.appendChild(copyBtn);

    panel.appendChild(topRow);
    panel.appendChild(bottomRow);
    panel.appendChild(hoverList);

    document.body.appendChild(panel);
}

function updateHotelListCount() {
    const saved = JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
    const status = document.getElementById('hotel-list-status');
    if (status) {
        status.textContent = `${saved.length} hotels saved`;
    }
}

function getPropertyElements() {
    return [...document.querySelectorAll('[data-testid="property-card"]')];
}

function extractVisibleHotelNames() {
    const cards = getPropertyElements();
    const names = [];

    for (const card of cards) {
        const titleElement = card.querySelector('[data-testid="title"]');
        if (titleElement) {
            names.push(titleElement.textContent.trim());
        }
    }

    return names;
}

function saveAnimalFriendlyProperties() {
    const existing = new Set(JSON.parse(localStorage.getItem('animalFriendlyList') || '[]'));
    const newNames = extractVisibleHotelNames();

    for (const name of newNames) {
        existing.add(name);
    }

    const merged = Array.from(existing);
    localStorage.setItem('animalFriendlyList', JSON.stringify(merged));
    updateHotelListCount();

    showMessage(`Saved ${newNames.length} hotel names.`);
}

function filterOutAnimalFriendlyProperties() {
    const saved = JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
    const cards = getPropertyElements();

    for (const card of cards) {
        const titleElement = card.querySelector('[data-testid="title"]');
        if (titleElement && saved.includes(titleElement.textContent.trim())) {
            card.style.opacity = '0.2';
        }
    }

    showMessage('Dimmed saved hotels.');
}

function copyNonExcludedHotels() {
    const saved = new Set(JSON.parse(localStorage.getItem('animalFriendlyList') || '[]'));
    const visibleNames = extractVisibleHotelNames();
    const nonExcluded = visibleNames.filter(name => !saved.has(name));

    if (nonExcluded.length === 0) {
        showMessage('No non-excluded hotels to copy.');
        return;
    }

    navigator.clipboard.writeText(nonExcluded.join('\n')).then(() => {
        showMessage(`Copied ${nonExcluded.length} hotel names to clipboard.`);
    });
}

function clearAnimalFriendlyList() {
    localStorage.removeItem('animalFriendlyList');
    updateHotelListCount();
    showMessage('Hotel filter list cleared.');
}

(function init() {
    insertControlPanel();
})();
