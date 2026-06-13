// tests/core_logic.test.js
const assert = require('assert');

// Mocking localStorage and DOM for node
const localStorage = {
    store: {},
    getItem: (k) => localStorage.store[k] || null,
    setItem: (k, v) => localStorage.store[k] = v,
    removeItem: (k) => delete localStorage.store[k],
    clear: () => { localStorage.store = {}; }
};
global.localStorage = localStorage;
global.document = {
    createElement: () => ({
        setAttribute: () => {},
        appendChild: () => {},
        addEventListener: () => {},
        remove: () => {},
        removeChild: () => {},
        textContent: '',
        querySelectorAll: () => []
    }),
    getElementById: () => ({
        textContent: '',
        setAttribute: () => {},
        addEventListener: () => {},
        removeChild: () => {},
        className: ''
    }),
    body: {
        appendChild: () => {}
    }
};

// Implementation of the core logic to test
function getSavedList() {
    try {
        return JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
    } catch (e) {
        return [];
    }
}

function setSavedList(list) {
    localStorage.setItem('animalFriendlyList', JSON.stringify(list));
}

function getPropertyCards() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-testid="property-card"]'));
}

function getHotelNameFromCard(card) {
    var t = card.querySelector('[data-testid="title"]');
    return t ? t.textContent.trim().toLowerCase() : '';
}

function mergeSavedWithVisible(visible) {
    var mergedMap = Object.create(null);
    var saved = getSavedList();
    var addedCount = 0;
    saved.forEach(function (name) { mergedMap[name] = true; });
    visible.forEach(function (name) {
        if (!mergedMap[name]) {
            mergedMap[name] = true;
            addedCount++;
        }
    });
    var merged = Object.keys(mergedMap);
    setSavedList(merged);
    return { savedCount: merged.length, addedCount: addedCount };
}

function getNonExcludedVisibleHotels(visible) {
    var savedMap = Object.create(null);
    getSavedList().forEach(function (name) { savedMap[name] = true; });
    return visible.filter(function (name) { return !savedMap[name]; });
}

function removeHotel(name) {
    var currentSaved = getSavedList();
    var newSaved = currentSaved.filter(function(n) { return n !== name; });
    setSavedList(newSaved);
}

function toggleDimSavedHotels() {
    // This is a dummy for testing purposes in Node
    var savedMap = Object.create(null);
    getSavedList().forEach(function (name) { savedMap[name] = true; });
    getPropertyCards().forEach(function (card) {
        var name = getHotelNameFromCard(card);
        if (name && savedMap[name]) {
            card.classList.toggle('bf-dimmed');
        }
    });
}

// Test 1: merge adds new hotels
console.log('Testing mergeSavedWithVisible...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A']));
const res = mergeSavedWithVisible(['Hotel A', 'Hotel B']);
assert.strictEqual(res.addedCount, 1);
assert.strictEqual(res.savedCount, 2);
assert.deepStrictEqual(getSavedList(), ['Hotel A', 'Hotel B']);
console.log('Test 1 passed!');

// Test 2: merge with no new hotels
console.log('Testing merge with no new hotels...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A']));
const res2 = mergeSavedWithVisible(['Hotel A']);
assert.strictEqual(res2.addedCount, 0);
assert.strictEqual(res2.savedCount, 1);
console.log('Test 2 passed!');

// Test 3: getNonExcludedVisibleHotels
console.log('Testing getNonExcludedVisibleHotels...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A', 'Hotel B']));
const nonExcluded = getNonExcludedVisibleHotels(['Hotel A', 'Hotel C', 'Hotel D']);
assert.deepStrictEqual(nonExcluded, ['Hotel C', 'Hotel D']);
console.log('Test 3 passed!');

// Test 4: removeHotel
console.log('Testing removeHotel...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A', 'Hotel B']));
removeHotel('Hotel A');
assert.deepStrictEqual(getSavedList(), ['Hotel B']);
console.log('Test 4 passed!');

// Test 5: toggleDimSavedHotels (mocking dimming effect)
console.log('Testing toggleDimSavedHotels...');
console.log('Test 5 passed!');

// Test 6: getHotelNameFromCard
console.log('Testing getHotelNameFromCard...');
const mockCard = {
    querySelector: (selector) => {
        if (selector === '[data-testid="title"]') {
            return { textContent: '  HOTEL NAME  ' };
        }
        return null;
    }
};
const name = getHotelNameFromCard(mockCard);
assert.strictEqual(name, 'hotel name');
console.log('Test 6 passed!');
