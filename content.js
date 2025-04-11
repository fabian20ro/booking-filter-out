function createButton(text, id, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.id = id;
    button.style.margin = '5px';
    button.style.cursor = 'pointer';
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
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.zIndex = '10000';
    panel.style.background = '#fff';
    panel.style.border = '1px solid #ccc';
    panel.style.padding = '10px';
    panel.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    panel.style.borderRadius = '6px';

    const statusText = document.createElement('div');
    statusText.id = 'hotel-list-status';
    statusText.style.marginBottom = '10px';
    updateHotelListCount();

    const saveBtn = createButton('Add visible hotels', 'save-animals-btn', saveAnimalFriendlyProperties);
    const filterBtn = createButton('Exclude added hotels', 'filter-animals-btn', filterOutAnimalFriendlyProperties);
    const clearBtn = createButton('Clear hotel filter list', 'clear-animals-btn', clearAnimalFriendlyList);

    const hoverList = document.createElement('div');
    hoverList.id = 'hover-hotel-list';
    hoverList.style.display = 'none';
    hoverList.style.position = 'absolute';
    hoverList.style.top = '100%';
    hoverList.style.right = '0';
    hoverList.style.backgroundColor = '#f9f9f9';
    hoverList.style.border = '1px solid #ccc';
    hoverList.style.padding = '10px';
    hoverList.style.maxHeight = '200px';
    hoverList.style.overflowY = 'auto';
    hoverList.style.width = '250px';
    hoverList.style.fontSize = '12px';

    saveBtn.addEventListener('mouseenter', () => {
        const saved = JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
        hoverList.innerHTML = saved.length ? '<ul>' + saved.map(name => `<li>${name}</li>`).join('') + '</ul>' : '<i>No hotels saved</i>';
        hoverList.style.display = 'block';
    });

    saveBtn.addEventListener('mouseleave', () => {
        hoverList.style.display = 'none';
    });

    panel.appendChild(statusText);
    panel.appendChild(saveBtn);
    panel.appendChild(hoverList);
    panel.appendChild(filterBtn);
    panel.appendChild(clearBtn);

    document.body.appendChild(panel);
}

function updateHotelListCount() {
    const saved = JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
    const status = document.getElementById('hotel-list-status');
    if (status) {
        status.textContent = `Hotels in list: ${saved.length}`;
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

function clearAnimalFriendlyList() {
    localStorage.removeItem('animalFriendlyList');
    updateHotelListCount();
    showMessage('Hotel filter list cleared.');
}

(function init() {
    insertControlPanel();
})();
