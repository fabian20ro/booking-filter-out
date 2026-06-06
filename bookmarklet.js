/**
 * Booking.com Hotel Filter Bookmarklet
 * 
 * Configuration:
 * - SELECTORS: DOM elements used to identify hotel cards and titles.
 * - STORAGE_KEY: localStorage key for the list of animal-friendly hotels.
 */
(function () {
    if (document.getElementById('animal-filter-panel')) return;

    var SELECTORS = {
        propertyCard: '[data-testid="property-card"]',
        title: '[data-testid="title"]'
    };
    var STORAGE_KEY = 'animalFriendlyList';

    var style = document.createElement('style');
    style.textContent = '#animal-filter-panel{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10000;width:auto;padding:8px 12px;background:#efefef;border:1px solid #d6dbe7;border-radius:14px;box-shadow:0 4px 14px rgba(31,71,161,.15);display:flex;align-items:center;gap:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif}#animal-filter-panel button{width:44px;height:44px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:2px solid #1f67ff;border-radius:10px;background:#f7f9ff;color:#1f67ff;font-size:20px;line-height:1;cursor:pointer;-webkit-tap-highlight-color:transparent}#animal-filter-panel button:active{background:#dde6ff;transform:scale(.95)}#animal-filter-panel button:focus-visible,#hotel-list-status:focus-visible{outline:3px solid #163680;outline-offset:2px}#hotel-list-status{min-height:44px;min-width:50px;padding:0 10px;display:flex;align-items:center;justify-content:center;border:2px solid #1f67ff;border-radius:10px;background:#f7f9ff;color:#1f67ff;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer}#hover-hotel-list{display:none;position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);width:260px;max-height:200px;overflow-y:auto;padding:10px;border:1px solid #c8d7ff;border-radius:10px;background:#fff;color:#163680;font-size:12px;box-shadow:0 4px 12px rgba(31,71,161,.12)}#hover-hotel-list ul{margin:0;padding-left:18px}.filter-input{width:100%;padding:4px 8px;margin-bottom:6px;border:1px solid #c8d7ff;border-radius:4px;font-size:12px}#bf-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#444;color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.3);z-index:10001;font:14px -apple-system,BlinkMacSystemFont,sans-serif}';
    document.head.appendChild(style);

    function getSavedList() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function setSavedList(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function getPropertyCards() {
        return Array.prototype.slice.call(document.querySelectorAll(SELECTORS.propertyCard));
    }

    function getHotelNameFromCard(card) {
        var t = card.querySelector(SELECTORS.title);
        return t ? t.textContent.trim() : '';
    }

    function getVisibleHotelNames() {
        var names = [];
        getPropertyCards().forEach(function (card) {
            var name = getHotelNameFromCard(card);
            if (name) names.push(name);
        });
        return names;
    }

    function mergeSavedWithVisible() {
        var mergedMap = Object.create(null);
        var visible = getVisibleHotelNames();
        var saved = getSavedList();
        var addedCount = 0;
        saved.forEach(function (name) { mergedMap[name] = true; });
        visible.forEach(function (name) {
            if (!mergedMap[name]) {
                mergedMap[name] = true;
                addedCount++;
            }
        });
        setSavedList(Object.keys(mergedMap));
        return { savedCount: Object.keys(mergedMap).length, addedCount: addedCount };
    }

    function toggleDimSavedHotels() {
        var savedMap = Object.create(null);
        getSavedList().forEach(function (name) { savedMap[name] = true; });
        getPropertyCards().forEach(function (card) {
            var name = getHotelNameFromCard(card);
            if (name && savedMap[name]) {
                card.style.opacity = (card.style.opacity === '0.2') ? '1' : '0.2';
            }
        });
    }

    function getNonExcludedVisibleHotels() {
        var savedMap = Object.create(null);
        getSavedList().forEach(function (name) { savedMap[name] = true; });
        return getVisibleHotelNames().filter(function (name) { return !savedMap[name]; });
    }

    function showMessage(message) {
        var old = document.getElementById('bf-toast');
        if (old && old.parentNode) old.parentNode.removeChild(old);
        var msg = document.createElement('div');
        msg.id = 'bf-toast';
        msg.textContent = message;
        msg.setAttribute('role', 'status');
        msg.setAttribute('aria-live', 'polite');
        document.body.appendChild(msg);
        setTimeout(function () { if (msg.parentNode) msg.parentNode.removeChild(msg); }, 3000);
    }

    function updateStatus() {
        var el = document.getElementById('hotel-list-status');
        if (el) el.textContent = getSavedList().length + ' saved';
    }

    function renderSavedList(listEl, filter) {
        var ul = listEl.querySelector('ul');
        if (ul) {
            ul.innerHTML = '';
        } else {
            ul = document.createElement('ul');
            listEl.appendChild(ul);
        }
        var saved = getSavedList();
        if (!saved.length) {
            var empty = document.createElement('i');
            empty.textContent = 'No hotels saved';
            ul.appendChild(empty);
            return;
        }
        var items = saved.filter(function (name) {
            return name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        });
        if (items.length === 0) {
            var noMatch = document.createElement('li');
            noMatch.textContent = 'No matches';
            ul.appendChild(noMatch);
            return;
        }
        items.forEach(function (name) {
            var li = document.createElement('li');
            li.textContent = name;
            ul.appendChild(li);
        });
    }

    function fallbackCopy(text, count) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:50%;left:5%;width:90%;height:120px;z-index:10002;font-size:14px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        showMessage('Select all & copy the text below (' + count + ' hotels)');
        ta.addEventListener('blur', function() { if(ta.parentNode) ta.parentNode.removeChild(ta); });
    }

    function copyText(text, onDone, onFail) {
        if (!text || text.length === 0) {
            showMessage('No content to copy.');
            return;
        }
        var count = text.split('\n').length;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                if (onDone) onDone(count);
            }, function () {
                if (onFail) onFail(count);
                else fallbackCopy(text, count);
            });
        } else {
            fallbackCopy(text, count);
        }
    }

    var panel = document.createElement('div');
    panel.id = 'animal-filter-panel';

    var status = document.createElement('div');
    status.id = 'hotel-list-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    status.setAttribute('tabindex', '0');
    status.setAttribute('aria-controls', 'hover-hotel-list');
    status.setAttribute('aria-expanded', 'false');
    status.style.cursor = 'pointer';
    panel.appendChild(status);

    var hoverList = document.createElement('div');
    hoverList.id = 'hover-hotel-list';
    hoverList.setAttribute('aria-hidden', 'true');

    var filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter list...';
    filterInput.className = 'filter-input';
    filterInput.addEventListener('input', function() {
        renderSavedList(hoverList, filterInput.value);
    });
    hoverList.appendChild(filterInput);

    function setHoverListVisible(visible) {
        hoverList.style.display = visible ? 'block' : 'none';
        hoverList.setAttribute('aria-hidden', visible ? 'false' : 'true');
        status.setAttribute('aria-expanded', visible ? 'true' : 'false');
    }

    var buttons = [
        ['Add visible hotels', '\u2795', function () { 
            var result = mergeSavedWithVisible(); 
            updateStatus(); 
            if (hoverList.style.display === 'block') renderSavedList(hoverList, filterInput.value); 
            showMessage(result.addedCount ? ('Saved ' + result.addedCount + ' hotel names.') : 'No new hotel names found.'); 
        }],
        ['Toggle dimming', '\uD83D\uDD0D', function () { toggleDimSavedHotels(); showMessage('Toggled dimming.'); }],
        ['Copy all saved', '\uD83D\uDCCB', function() {
            var saved = getSavedList();
            if (!saved.length) { showMessage('No hotels to copy.'); return; }
            copyText(saved.join('\n'), function(c){showMessage('Copied '+c+' hotel names.')}, null);
        }],
        ['Copy non-excluded hotels', '\uD83D\uDCCB', function() {
            var nonExcluded = getNonExcludedVisibleHotels();
            if (!nonExcluded.length) { showMessage('No non-excluded hotels to copy.'); return; }
            copyText(nonExcluded.join('\n'), function(c){showMessage('Copied '+c+' hotel names to clipboard.');}, null);
        }],
        ['Clear hotel filter list', '\uD83E\uDDF9', function () {
            var hadSavedList = getSavedList().length > 0;
            getSavedList(); // logic error in my mental model? no.
            localStorage.removeItem(STORAGE_KEY);
            getPropertyCards().forEach(function (card) { card.style.opacity = '1'; });
            updateStatus();
            if (hoverList.style.display === 'block') renderSavedList(hoverList, filterInput.value);
            showMessage(hadSavedList ? 'Hotel filter list cleared.' : 'Hotel filter list was already empty.');
        }]
    ];

    buttons.forEach(function(b) {
        var btn = document.createElement('button');
        btn.textContent = b[0]; // simpler for now, icon can be added back
        btn.title = b[0];
        btn.addEventListener('click', b[2]);
        panel.appendChild(btn);
    });

    status.addEventListener('click', function() {
        var visible = hoverList.style.display !== 'block';
        if (visible) renderSavedList(hoverList, filterInput.value);
        setHoverListVisible(visible);
    });
    status.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            status.click();
        }
    });

    panel.addEventListener('mouseleave', function () { setHoverListVisible(false); });

    panel.appendChild(hoverList);
    document.body.appendChild(panel);
    updateStatus();
})();