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
        textContent: ''
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
    localStorage.setItem('animalFriendlyList', JSON.stringify(merged));
    return { savedCount: merged.length, addedCount: addedCount };
}

function getNonExcludedVisibleHotels(visible) {
    var savedMap = Object.create(null);
    getSavedList().forEach(function (name) { savedMap[name] = true; });
    return visible.filter(function (name) { return !savedMap[name]; });
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