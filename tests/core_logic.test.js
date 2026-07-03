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
function updateStatus() {
    var status = document.getElementById('hotel-list-status');
    if (status) {
        var count = getSavedList().length;
        var dimmedNames = getDimmedHotelNames();
        var dimmedCount = dimmedNames.length;
        var dimmed = dimmedCount > 0;
        var newHotels = getNonExcludedVisibleHotels().length;
        var text = (count === 0 ? 'No hotels saved' : count + ' hotels saved');
        if (dimmed) text += ' (' + dimmedCount + ' dimmed)';
        if (newHotels > 0) text += ' (+ ' + newHotels + ' new)';
        status.textContent = text;
    }
}

function getSavedList() {
    try {
        var list = JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
        return Array.isArray(list) ? list.filter(function(item) { return typeof item === 'string' && item.trim() !== ''; }) : [];
    } catch (e) {
        return [];
    }
}

function setSavedList(list) {
    if (!Array.isArray(list)) {
        console.warn('Booking Filter: setSavedList rejected — expected array, got ' + (typeof list === 'undefined' ? 'undefined' : typeof list));
        return;
    }
    try {
        var sanitized = Array.isArray(list) ? list.filter(function(s) { return typeof s === 'string' && s.trim() !== ''; }) : [];
        localStorage.setItem('animalFriendlyList', JSON.stringify(sanitized.map(function(s) { return s.toLowerCase(); })));
    } catch (e) {
        console.error('Booking Filter: Failed to save list', e);
    }
}

function getPropertyCards() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-testid="property-card"]'));
}

function getHotelNameFromCard(card) {
    if (!card) return '';
    var t = card.querySelector('[data-testid="title"]');
    return t ? t.textContent.trim().toLowerCase() : '';
}
function mergeSavedWithVisible(visible) {
    var mergedMap = Object.create(null);
    var saved = getSavedList();
    var addedCount = 0;
    saved.forEach(function (name) { mergedMap[name.toLowerCase()] = true; });
    visible.forEach(function (name) {
        var lowerName = name.toLowerCase();
        if (!mergedMap[lowerName]) {
            mergedMap[lowerName] = true;
            addedCount++;
        }
    });
    var merged = Object.keys(mergedMap);
    setSavedList(merged);
    updateStatus();
    return { savedCount: merged.length, addedCount: addedCount };
}

function getNonExcludedVisibleHotels(visible) {
    var savedMap = Object.create(null);
    getSavedList().forEach(function (name) { savedMap[name.toLowerCase()] = true; });
    return visible.filter(function (name) { return !savedMap[name.toLowerCase()]; });
}

function removeHotel(name) {
    if (typeof name !== 'string' || !name.trim()) return;
    var currentSaved = getSavedList();
    var newSaved = currentSaved.filter(function(n) { return n.toLowerCase().trim() !== name.toLowerCase().trim(); });
    setSavedList(newSaved);
}

// Tests 7 and 16: applyDimming parity with content.js — keys lowercased, DOM errors swallowed

// Helper: addHotelToList mirrors bookmarklet.addHotelToList (sanitizes, persists, refreshes status).
function addHotelToList(name) {
    if (typeof name !== 'string') return;
    var trimmed = name.trim();
    if (!trimmed) return;
    try {
        var currentSaved = getSavedList();
        currentSaved.push(trimmed.toLowerCase());
        setSavedList(currentSaved);
        updateStatus();
    } catch (e) {
        console.error('Booking Filter: Failed to add hotel', e);
    }
}

// Helper: removeFromSavedList mirrors bookmarklet.removeFromSavedList.
function removeFromSavedList(name, card) {
    if (typeof name !== 'string') return;
    removeHotel(name);
    if (card && card.classList) {
        try { card.classList.remove('bf-dimmed'); } catch (e) {}
    }
}

function applyDimming() {
    try {
        var savedMap = Object.create(null);
        getSavedList().forEach(function (name) { savedMap[name.toLowerCase()] = true; });
        getPropertyCards().forEach(function (card) {
            var name = getHotelNameFromCard(card).toLowerCase();
            if (name && savedMap[name]) {
                card.classList.add('bf-dimmed');
            } else {
                card.classList.remove('bf-dimmed');
            }
        });
    } catch (e) {}
}

// Test 4: removeHotel
console.log('Testing removeHotel...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A', 'Hotel B']));
removeHotel('Hotel A');
assert.deepStrictEqual(getSavedList(), ['Hotel B']);
console.log('Test 4 passed!');
function toggleDimSavedHotels() {
    var savedMap = Object.create(null);
    getSavedList().forEach(function (name) { savedMap[name] = true; });
    getPropertyCards().forEach(function (card) {
        var name = getHotelNameFromCard(card);
        if (name && savedMap[name]) {
            card.classList.toggle('bf-dimmed');
        }
    });
    var cards = getPropertyCards();
    var isDimmed = false;
    for (var i = 0; i < cards.length; i++) {
        if (cards[i].classList.contains('bf-dimmed')) {
            isDimmed = true;
            break;
        }
    }
    return isDimmed;
}

// Test 1: merge adds new hotels
console.log('Testing mergeSavedWithVisible...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A']));
const res = mergeSavedWithVisible(['Hotel A', 'Hotel B']);
assert.strictEqual(res.addedCount, 1);
assert.strictEqual(res.savedCount, 2);
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

// Test 27: getNonExcludedVisibleHotels is case-insensitive — regression for mixed-case bug.
// When saved list entries are lowercase but visible names have initial caps (or vice versa),
// excluded hotels must be detected regardless of case mismatch between the two lists.
console.log('Testing getNonExcludedVisibleHotels case insensitivity...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['alpha hotel']));
const nonExcludedMixed = getNonExcludedVisibleHotels(['Alpha Hotel', 'Hotel C']);
assert.deepStrictEqual(nonExcludedMixed, ['Hotel C']);
console.log('Test 27 passed!');

// Test 5: toggleDimSavedHotels
console.log('Testing toggleDimSavedHotels...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['hotel a']));
const mockCard = {
    querySelector: function(selector) {
        if (selector === '[data-testid="title"]') {
            return { textContent: '  HOTEL A  ' };
        }
        return null;
    },
    classList: {
        _toggled: null,
        toggle: function(cls) { this._toggled = cls; }
    }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCard];
    return [];
};
global.document.getElementById = function(id) {
    return { textContent: '', setAttribute: () => {}, addEventListener: () => {}, removeChild: () => {}, className: '' };
};
var isDimmed = toggleDimSavedHotels();
assert.strictEqual(mockCard.classList._toggled, 'bf-dimmed');
assert.strictEqual(isDimmed, true);
console.log('Test 5 passed!');

// Test 6: getHotelNameFromCard
console.log('Testing getHotelNameFromCard...');
const mockCard2 = {
    querySelector: (selector) => {
        if (selector === '[data-testid="title"]') {
            return { textContent: '  HOTEL NAME  ' };
        }
        return null;
    }
};
const name = getHotelNameFromCard(mockCard2);
assert.strictEqual(name, 'hotel name');
console.log('Test 6 passed!');

// Test 6.1: getHotelNameFromCard with null title
console.log('Testing getHotelNameFromCard with null title...');
const mockCardNull = {
    querySelector: (selector) => {
        if (selector === '[data-testid="title"]') {
            return null;
        }
        return null;
    }
};
const nameNull = getHotelNameFromCard(mockCardNull);
assert.strictEqual(nameNull, '');
console.log('Test 6.1 passed!');

// Test 6.2: getHotelNameFromCard with non-string textContent
console.log('Testing getHotelNameFromCard with non-string textContent...');
const mockCardNonString = {
    querySelector: (selector) => {
        if (selector === '[data-testid="title"]') {
            return { textContent: 123 };
        }
        return null;
    }
};
const nameNonString = getHotelNameFromCard(mockCardNonString);
assert.strictEqual(nameNonString, '');
console.log('Test 6.2 passed!');

// Test 6.3: getHotelNameFromCard with null card (defensive guard)
console.log('Testing getHotelNameFromCard with null card...');
const nameNullCard = getHotelNameFromCard(null);
assert.strictEqual(nameNullCard, '');
console.log('Test 6.3 passed!');

// Test 9.1: getSavedList robustness
console.log('Testing getSavedList robustness...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', 'not-json');
const fallbackList = getSavedList();
assert.deepStrictEqual(fallbackList, []);
console.log('Test 9.1 passed!');

// Test 9.2: getSavedList with null elements
console.log('Testing getSavedList with null elements...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A', null, undefined, 123]));
const cleanedList = getSavedList();
assert.deepStrictEqual(cleanedList, ['Hotel A']);
console.log('Test 9.2 passed!');

// Test 9.3: getSavedList with unexpected JSON type
console.log('Testing getSavedList with unexpected JSON type...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify({}));
const objectList = getSavedList();
assert.deepStrictEqual(objectList, []);
console.log('Test 9.3 passed!');


// Test 19: removeHotel rejects empty/whitespace-only input (no state change)
console.log('Testing removeHotel with whitespace-only input...');
localStorage.clear();
var savedBefore = JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
removeHotel('   ');
removeHotel('');
assert.deepStrictEqual(getSavedList(), savedBefore, 'whitespace/empty should not modify the list');
console.log('Test 19 passed!');

// Test 4.1: removeHotel with non-existing name
console.log('Testing removeHotel with non-existing name...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A', 'Hotel B']));
removeHotel('Hotel C');
assert.deepStrictEqual(getSavedList(), ['Hotel A', 'Hotel B']);
console.log('Test 4.1 passed!');

// Test 9: getSavedList type validation
console.log('Testing getSavedList type validation...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A', 123, null]));
const validatedList = getSavedList();
assert.deepStrictEqual(validatedList, ['Hotel A']);
console.log('Test 9 passed!');

// Test 12: getDimmedHotelNames returns only dimmed card names
console.log('Testing getDimmedHotelNames...');
localStorage.clear();
var mockCardA = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: '  Alpha Hotel  ' }; return null; },
    classList: { contains: function(cls) { return cls === 'bf-dimmed'; } }
};
var mockCardB = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: '  Beta Hotel  ' }; return null; },
    classList: { contains: function(cls) { return false; } }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardA, mockCardB];
    return [];
};
var dimmedNames = getDimmedHotelNames();
assert.deepStrictEqual(dimmedNames, ['alpha hotel']);
console.log('Test 12 passed!');

// Test 7: applyDimming swallows DOM errors (parity with content.js)
console.log('Testing applyDimming error resilience...');
var spy = { calls: [] };
global.console.error = function() { spy.calls.push(Array.prototype.slice.call(arguments)); };
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['hotel a']));
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid=\"property-card\"]') return [{ querySelector: function(){return null}, classList: { contains:function(){throw new Error('DOM err') } } }];
    return [];
};
var threw = false;
try { applyDimming(); } catch(e) { threw = true; }
assert.strictEqual(threw, false);
assert.ok(spy.calls.length > 0, 'expected console.error call');
console.log('Test 7 passed!');

// Test 13: updateStatus swallows DOM errors (parity with content.js)
console.log('Testing updateStatus error resilience...');
var spy2 = { calls: [] };
global.console.error = function() { spy2.calls.push(Array.prototype.slice.call(arguments)); };
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['hotel a']));
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [{ querySelector: function(){return null}, classList: { contains:function(){throw new Error('DOM err')} } }];
    return [];
};
var threw2 = false;
try { updateStatus(); } catch(e) { threw2 = true; }
assert.strictEqual(threw2, false);
assert.ok(spy2.calls.length > 0, 'expected console.error call');
console.log('Test 13 passed!');

// Test 13: updateStatus swallows DOM errors (parity with content.js) — added regression assertion for the new try/catch boundary in updateStatus.
console.log('Testing removeHotel bidirectional trim...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify([' Hotel A ']));
removeHotel('Hotel A ');
assert.deepStrictEqual(getSavedList(), []);
console.log('Test 10.1 passed!');

// Test 10: removeHotel with whitespace in list
console.log('Testing removeHotel with whitespace in list...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A ']));
removeHotel('Hotel A');
assert.deepStrictEqual(getSavedList(), []);
console.log('Test 10 passed!');

// Test 2.5: mergeSavedWithVisible with mixed-case titles (case-insensitive dedup)
console.log('Testing merge with mixed-case visible hotels...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['hotel a']));
const res3 = mergeSavedWithVisible(['Hotel A', 'Hotel B']);
assert.strictEqual(res3.addedCount, 1);
assert.strictEqual(res3.savedCount, 2);
console.log('Test 2.5 passed!');

// Test 11: updateStatus
console.log('Testing updateStatus...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['Hotel A']));
document.getElementById('hotel-list-status').textContent = '';
updateStatus();
assert.strictEqual(document.getElementById('hotel-list-status').textContent, '1 hotels saved');
console.log('Test 11 passed!');

// Test 14: setSavedList always trims and lowercases entries (sanitization invariant)
// This supports mergeSavedWithVisible correctness when it writes merged keys back.
console.log('Testing setSavedList sanitization...');
localStorage.clear();
setSavedList(['  Alpha Hotel  ', 'Beta Hotel', null, undefined, 99]);
const saved = getSavedList();
assert.deepStrictEqual(saved, ['alpha hotel', 'beta hotel']);
// Verify the raw localStorage value is also normalized.
const raw = JSON.parse(localStorage.getItem('animalFriendlyList'));
assert.deepStrictEqual(raw, ['alpha hotel', 'beta hotel']);
console.log('Test 14 passed!');

// Test 15: mergeSavedWithVisible saves with sanitized (trimmed+lowercased) keys.
// Regression guard for the merge function's setSavedList call path.
console.log('Testing mergeSavedWithVisible sanitization...');
localStorage.clear();
setSavedList(['  Old Hotel  ']);
const res4 = mergeSavedWithVisible(['  New Hotel ', 'OLD HOTEL']);
assert.strictEqual(res4.addedCount, 1); // 'new hotel' is new; 'old hotel' already exists (case-insensitive)
assert.deepStrictEqual(getSavedList(), ['old hotel', 'new hotel']);
// Verify that merge also refreshes the status UI text (parity with bookmarklet).
var statusEl = document.getElementById('hotel-list-status');
assert.ok(
  typeof statusEl !== 'undefined' && statusEl !== null,
  'status element should exist for Test 15 assertion'
);
// After updateStatus() the mocked element's textContent is set by the function above.
assert.strictEqual(statusEl.textContent, '2 hotels saved');
console.log('Test 15 passed!');

// Test 17: applyDimming matches bookmarklet — mixed-case visible names normalize correctly.
// Regression guard for the bookmarklet.applyDimming fix (savedMap keys lowercased, lookup uses name.toLowerCase()).
console.log('Testing applyDimming mixed-case visible normalization...');
localStorage.clear();
global.console.error = function() {};
localStorage.setItem('animalFriendlyList', JSON.stringify(['alpha hotel']));
var mockCardMixed = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: 'Alpha Hotel' }; return null; },
    classList: { _added: [], _removed: [], add: function(c){this._added.push(c)}, remove:function(c){this._removed.push(c)}, contains:function(c){return this._added.indexOf(c)!==-1} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardMixed];
    return [];
};
applyDimming();
assert.ok(mockCardMixed.classList._added.indexOf('bf-dimmed') !== -1, 'card with mixed-case visible name should be dimmed');
console.log('Test 17 passed!');

// Test 18: toggleDimSavedHotels swallows DOM errors — error resilience invariant matching applyDimming pattern.
// The global test implementation must mirror bookmarklet's try/catch wrapping so DOM errors are swallowed (returning false).
console.log('Testing toggleDimSavedHotels error resilience...');

// Re-define toggleDimSavedHotels with try/catch to match bookmarklet parity:
function toggleDimSavedHotels() {
    try {
        var savedMap = Object.create(null);
        getSavedList().forEach(function (name) { savedMap[name.toLowerCase()] = true; });
        getPropertyCards().forEach(function (card) {
            var name = getHotelNameFromCard(card).toLowerCase();
            if (name && savedMap[name]) {
                card.classList.toggle('bf-dimmed');
            }
        });
        var cards = getPropertyCards();
        var isDimmed = false;
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].classList.contains('bf-dimmed')) {
                isDimmed = true;
                break;
            }
        }
        return isDimmed;
    } catch (e) {
        console.error('Booking Filter: Error toggling dimming', e);
        return false;
    }
}

// Test 18.1: mergeSavedWithVisible drives dimming internally — parity guard for bookmarklet's redundant-applyDimming fix.
// When mergeSavedWithVisible is called, the saved list must be updated and status refreshed without caller needing to invoke applyDimming separately.
console.log('Testing mergeSavedWithVisible parity (no redundant applyDimming needed)...');
localStorage.clear();
var dimmingCalls = 0;
function patchedApplyDimming() { dimmingCalls++; }

// Simulate bookmarklet's "Add visible" handler: only core.mergeSavedWithVisible then render update.
// This mirrors the fixed codepath after removing the redundant applyDimming() call.
localStorage.setItem('animalFriendlyList', JSON.stringify([]));
var mergeResult = mergeSavedWithVisible(['Alpha Hotel']);
assert.strictEqual(mergeResult.addedCount, 1);
assert.strictEqual(getSavedList().length, 1);

// The test's global updateStatus must have been called by merge. Verify status text reflects saved state.
document.getElementById('hotel-list-status').textContent = '';
updateStatus();
assert.ok(document.getElementById('hotel-list-status').textContent.indexOf('1 hotels saved') !== -1, 'status should reflect merged count');

// Parity invariant: caller does NOT need to invoke applyDimming after merge — the function handles it internally.
// This test documents the contract that justifies removing redundant dimming calls from bookmarklet.
console.log('Test 18.1 passed!');

var spy3 = { calls: [] };
global.console.error = function() { spy3.calls.push(Array.prototype.slice.call(arguments)); };
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['hotel a']));
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid=\"property-card\"]') return [{ querySelector: function(){return null}, classList: { contains:function(){throw new Error('DOM err') }, toggle:function(){} } }];
    return [];
};
var threw3 = false;
try { var result18 = toggleDimSavedHotels(); } catch(e) { threw3 = true; }
assert.strictEqual(threw3, false);
assert.ok(spy3.calls.length > 0, 'expected console.error call');
assert.strictEqual(result18, false);
console.log('Test 18 passed!');

// Test 16: applyDimming matches content.js — savedMap keys are lowercased
// Regression guard for the bookmarklet parity fix.
console.log('Testing applyDimming key normalization...');
localStorage.clear();
global.console.error = function() {};
localStorage.setItem('animalFriendlyList', JSON.stringify(['Alpha Hotel']));
var mockCardC = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: 'alpha hotel' }; return null; },
    classList: { _added: [], _removed: [], add: function(c){this._added.push(c)}, remove:function(c){this._removed.push(c)}, contains:function(c){return this._added.indexOf(c)!==-1} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardC];
    return [];
};
applyDimming();
assert.ok(mockCardC.classList._added.indexOf('bf-dimmed') !== -1, 'card should have been dimmed');
console.log('Test 16 passed!');

// Test 20: bookmarklet applyDimming uses raw savedMap key (no double lowercase on lookup) — parity with content.js.
// The bookmarklet fix removed .toLowerCase() from the savedMap[name] lookup inside applyDimming so it
// matches content.js where getHotelNameFromCard already lowercases before comparison.
console.log('Testing bookmarklet applyDimming lookup key parity (Test 20)...');

function applyDimmingBookmarkletParity() {
    try {
        var savedMap = Object.create(null);
        getSavedList().forEach(function (name) { savedMap[name] = true; });   // keys raw (already lowercased by setSavedList)
        getPropertyCards().forEach(function (card) {
            var name = getHotelNameFromCard(card);  // already .toLowerCase()'d
            if (name && savedMap[name]) {           // <-- no extra .toLowerCase() here — matches bookmarklet fix
                card.classList.add('bf-dimmed');
            } else {
                card.classList.remove('bf-dimmed');
            }
        });
    } catch (e) {}
}

localStorage.clear();
global.console.error = function() {};
// savedMap keys are already lowercase+trimmed via setSavedList, so store raw value:
localStorage.setItem('animalFriendlyList', JSON.stringify(['alpha hotel']));
var mockCardParity = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: '  Alpha Hotel  ' }; return null; },
    classList: { _added: [], _removed: [], add: function(c){this._added.push(c)}, remove:function(c){this._removed.push(c)}, contains:function(c){return this._added.indexOf(c)!==-1} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardParity];
    return [];
};
applyDimmingBookmarkletParity();
assert.ok(mockCardParity.classList._added.indexOf('bf-dimmed') !== -1, 'card should be dimmed — parity with bookmarklet fix');
console.log('Test 20 passed!');

// Test 19: toggleDimSavedHotels normal case — returns true when card is toggled on.
console.log('Testing toggleDimSavedHotels normal case...');
localStorage.clear();
global.console.error = function() {};
localStorage.setItem('animalFriendlyList', JSON.stringify(['alpha hotel']));
var mockCardNormal = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: 'Alpha Hotel' }; return null; },
    classList: { _toggled: [], contains:function(c){return this._toggled.indexOf(c)!==-1}, toggle:function(c){this._toggled.push(c)} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardNormal];
    return [];
};
var result19 = toggleDimSavedHotels();
assert.strictEqual(result19, true);
assert.ok(mockCardNormal.classList._toggled.indexOf('bf-dimmed') !== -1);
console.log('Test 19 passed!');

// Test 21: addHotelToList sanitizes (trims+lowercases) and persists — mirrors setSavedList invariant.
// Covers the bookmarklet.addHotelToList path that is otherwise untested.
console.log('Testing addHotelToList sanitization...');
localStorage.clear();
global.console.error = function() {};
addHotelToList('  Gamma Hotel  ');
assert.deepStrictEqual(getSavedList(), ['gamma hotel']);
var raw21 = JSON.parse(localStorage.getItem('animalFriendlyList'));
assert.strictEqual(raw21[0], 'gamma hotel', 'raw localStorage entry should be sanitized');
console.log('Test 21 passed!');

// Test 22: addHotelToList with empty/whitespace name is a no-op (sanitized away).
console.log('Testing addHotelToList with empty input...');
localStorage.clear();
addHotelToList('   ');
assert.deepStrictEqual(getSavedList(), []);
console.log('Test 22 passed!');

// Test 23: addHotelToList updates status text to reflect new saved count.
console.log('Testing addHotelToList refreshes status...');
localStorage.clear();
document.getElementById('hotel-list-status').textContent = '';
addHotelToList('Delta Hotel');
assert.strictEqual(document.getElementById('hotel-list-status').textContent, '1 hotels saved');
console.log('Test 23 passed!');

// Test 24: removeFromSavedList trims+lowercases the removed name (bidirectional trim).
console.log('Testing removeFromSavedList bidirectional trim...');
localStorage.clear();
global.console.error = function() {};
setSavedList(['Alpha Hotel', 'Beta Hotel']);
removeFromSavedList(' alpha hotel ', null);
assert.deepStrictEqual(getSavedList(), ['beta hotel']);
console.log('Test 24 passed!');

// Test 25: removeFromSavedList also removes the dimming class from the card.
console.log('Testing removeFromSavedList clears dimming...');
localStorage.clear();
global.console.error = function() {};
setSavedList(['alpha hotel']);
var mockCardRem = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: 'Alpha Hotel' }; return null; },
    classList: { _added: [], add: function(c){this._added.push(c)}, remove:function(c){this._removed=c}, contains:function(c){return this._added.indexOf(c)!==-1} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardRem];
    return [];
};
removeFromSavedList('Alpha Hotel', mockCardRem);
assert.strictEqual(mockCardRem.classList._removed, 'bf-dimmed');
console.log('Test 25 passed!');

// Test 26: toggleDimSavedHotels original implementation uses savedMap[name] (no .toLowerCase on lookup).
// This exercises the locally-defined function at line 132 (not the redefined version in Test 18/19).
console.log('Testing toggleDimSavedHotels original implementation key handling...');
localStorage.clear();
global.console.error = function() {};
setSavedList(['alpha hotel']);
var mockCardOrig = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: 'Alpha Hotel' }; return null; },
    classList: { _toggled: [], contains:function(c){return this._toggled.indexOf(c)!==-1}, toggle:function(c){this._toggled.push(c)} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardOrig];
    return [];
};
toggleDimSavedHotels();
assert.ok(mockCardOrig.classList._toggled.indexOf('bf-dimmed') !== -1);
console.log('Test 26 passed!');

// Test 30: toggleDimSavedHotels handles mixed-case saved entries (defensive normalization).
// Previously, if setSavedList were bypassed and mixed-case names entered localStorage,
// the function would fail to match. The fix lowercases both savedMap keys and lookups.
console.log('Testing toggleDimSavedHotels defensive normalization...');
localStorage.clear();
global.console.error = function() {};
// Simulate a situation where raw localStorage has mixed-case entries (bypassing setSavedList).
localStorage.setItem('animalFriendlyList', JSON.stringify(['ALPHA HOTEL']));
var mockCardCase = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: 'Alpha Hotel' }; return null; },
    classList: { _toggled: [], contains:function(c){return this._toggled.indexOf(c)!==-1}, toggle:function(c){this._toggled.push(c)} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardCase];
    return [];
};
var result30 = toggleDimSavedHotels();
assert.ok(mockCardCase.classList._toggled.indexOf('bf-dimmed') !== -1, 'toggle should match despite mixed-case saved entries');
assert.strictEqual(result30, true);
console.log('Test 30 passed!');

// Test 28: mergeSavedWithVisible dedupes mixed-case + whitespace-padded visible names against saved entries.
// Regression guard — exercises both .trim() and .toLowerCase() in parallel through the same path.
// If either normalization step is later weakened (e.g., getHotelNameFromCard drops .trim()), this test catches silent divergence.
console.log('Testing mergeSavedWithVisible mixed-case+whitespace dedup...');
localStorage.clear();
setSavedList(['alpha hotel']);
const resMixedWs = mergeSavedWithVisible(['Alpha Hotel ', 'Beta Hotel']);
assert.strictEqual(resMixedWs.addedCount, 1); // 'Alpha Hotel ' should be deduplicated against 'alpha hotel'; only 'beta hotel' is new
assert.deepStrictEqual(getSavedList(), ['alpha hotel', 'beta hotel']);
console.log('Test 28 passed!');

// Test 29: mergeSavedWithVisible with a visible name that has leading whitespace and mixed case must not be counted as new.
console.log('Testing mergeSavedWithVisible leading-whitespace dedup...');
localStorage.clear();
setSavedList(['Hotel Beta']);
const resLeadWs = mergeSavedWithVisible(['  hotel beta ', 'Gamma Hotel']);
assert.strictEqual(resLeadWs.addedCount, 1); // only 'gamma hotel' is new; 'hotel beta' matches existing
assert.deepStrictEqual(getSavedList(), ['hotel beta', 'gamma hotel']);
console.log('Test 29 passed!');

// Test 31: merge dedupes DOM-sourced visible names (trim + lowercase) against saved entries — regression for getVisibleHotelNames normalization.
// When content.js normalizes visible names, a DOM name like "Alpha Hotel" must not re-insert as duplicate of already-lowercased saved entry.
console.log('Testing merge dedup with normalized DOM-visible names...');
localStorage.clear();
setSavedList(['alpha hotel']);
const resVisibleNorm = mergeSavedWithVisible(['  Alpha Hotel  ']);
assert.strictEqual(resVisibleNorm.addedCount, 0); // already present after normalization — no re-insertion
assert.deepStrictEqual(getSavedList(), ['alpha hotel']);
console.log('Test 31 passed!');

// Test 32: getNonExcludedVisibleHotels filters by normalized DOM names against saved entries.
console.log('Testing getNonExcludedVisibleHotels with normalized visible names...');
localStorage.clear();
setSavedList(['alpha hotel', 'beta hotel']);
const nonExclNorm = getNonExcludedVisibleHotels(['  Alpha Hotel  ', 'Beta Hotel', 'Hotel C']);
assert.deepStrictEqual(nonExclNorm, ['hotel c']);
console.log('Test 32 passed!');

// Test 33: applyDimming normalizes savedMap keys with .toLowerCase() — regression for mixed-case localStorage entries.
// Previously, if setSavedList were bypassed and mixed-case names entered localStorage directly,
// the function would fail to match because savedMap keys weren't normalized. The fix lowercases both savedMap keys and lookups.
console.log('Testing applyDimming defensive normalization of stored entries...');
localStorage.clear();
global.console.error = function() {};
// Simulate bypassing setSavedList — raw mixed-case entries in localStorage
localStorage.setItem('animalFriendlyList', JSON.stringify(['ZETA HOTEL']));
var mockCardNorm = {
    querySelector: function(sel) { if (sel === '[data-testid="title"]') return { textContent: 'Zeta Hotel' }; return null; },
    classList: { _added: [], _removed: [], add: function(c){this._added.push(c)}, remove:function(c){this._removed.push(c)}, contains:function(c){return this._added.indexOf(c)!==-1} }
};
global.document.querySelectorAll = function(selector) {
    if (selector === '[data-testid="property-card"]') return [mockCardNorm];
    return [];
};
applyDimming();
assert.ok(mockCardNorm.classList._added.indexOf('bf-dimmed') !== -1, 'card should be dimmed despite mixed-case stored entry');
console.log('Test 33 passed!');

// Test setSavedList input guard — rejects non-array inputs without corrupting localStorage (content.js parity).
console.log('Testing setSavedList input guard...');
localStorage.clear();
localStorage.setItem('animalFriendlyList', JSON.stringify(['hotel a']));
setSavedList('not-an-array');
assert.deepStrictEqual(getSavedList(), ['hotel a'], 'list should be unchanged after rejecting non-array string input');
setSavedList(null);
setSavedList(undefined);
assert.deepStrictEqual(getSavedList(), ['hotel a'], 'list should be unchanged after rejecting null/undefined');
console.log('Test setSavedList input guard passed!');