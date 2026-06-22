(function () {
    if (document.getElementById('animal-filter-panel')) return;

    var style = document.createElement('style'); style.textContent = '#animal-filter-panel{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10000;width:auto;padding:8px 12px;background:#efefef;border:1px solid #d6dbe7;border-radius:14px;box-shadow:0 4px 14px rgba(31,71,161,.15);display:flex;align-items:center;gap:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}#animal-filter-panel button{width:44px;height:44px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:2px solid #1f67ff;border-radius:10px;background:#f7f9ff;color:#1f67ff;font-size:20px;line-height:1;cursor:pointer;-webkit-tap-highlight-color:transparent}#animal-filter-panel button:active{background:#dde6ff;transform:scale(.95)}#hotel-list-status{min-height:44px;min-width:50px;padding:0 10px;display:flex;align-items:center;justify-content:center;border:2px solid #1f67ff;border-radius:10px;background:#f7f9ff;color:#1f67ff;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer}[data-testid="property-card"]{transition:opacity 0.3s ease}.bf-dimmed { opacity: 0.2 !important; }.bf-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#444;color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.3);z-index:10001;font:14px -apple-system,BlinkMacSystemFont,sans-serif}#hover-hotel-list{display:none;position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);width:260px;max-height:200px;overflow-y:auto;padding:10px;border:1px solid #c8d7ff;border-radius:10px;background:#fff;color:#163680;font-size:12px;box-shadow:0 4px 12px rgba(31,71,161,.12);}.filter-input{width:100%;padding:6px;margin-bottom:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-size:12px;}';
    document.head.appendChild(style);
    var SELECTORS = {
        propertyCard: '[data-testid="property-card"]',
        title: '[data-testid="title"]'
    };
    var STORAGE_KEY = 'animalFriendlyList';

    function getSavedList() {
        try {
            var list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function removeHotel(name) {
        var currentSaved = getSavedList();
        var newSaved = currentSaved.filter(function(n) { return n.toLowerCase() !== name.toLowerCase(); });
        setSavedList(newSaved);
        applyDimming();
        updateStatus();
    }

    function setSavedList(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map(function(s) { return s.toLowerCase(); })));
        } catch (e) {
            console.error('Booking Filter: Failed to save list', e);
        }
    }

    function getPropertyCards() {
        return Array.prototype.slice.call(document.querySelectorAll(SELECTORS.propertyCard));
    }

    function getHotelNameFromCard(card) {
        var t = card.querySelector(SELECTORS.title);
        return t ? t.textContent.trim().toLowerCase() : '';
    }

    function getVisibleHotelNames() {
        var names = [];
        getPropertyCards().forEach(function (card) {
            var name = getHotelNameFromCard(card);
            if (name && names.indexOf(name) === -1) names.push(name);
        });
        return names;
    }

    function mergeSavedWithVisible() {
        var mergedMap = Object.create(null);
        var visible = getVisibleHotelNames();
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
        applyDimming();
        return { savedCount: merged.length, addedCount: addedCount };
    }

    function applyDimming() {
        var savedMap = Object.create(null);
        getSavedList().forEach(function (name) { savedMap[name] = true; });
        getPropertyCards().forEach(function (card) {
            var name = getHotelNameFromCard(card);
            if (name && savedMap[name]) {
                if (!card.classList.contains('bf-dimmed')) {
                    card.classList.add('bf-dimmed');
                }
            } else {
                if (card.classList.contains('bf-dimmed')) {
                    card.classList.remove('bf-dimmed');
                }
            }
        });
    }

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

    function clearSavedList() {
        localStorage.removeItem(STORAGE_KEY);
        getPropertyCards().forEach(function (card) {
            card.classList.remove('bf-dimmed');
        });
        updateStatus();
    }

    function getNonExcludedVisibleHotels() {
        var savedMap = Object.create(null);
        getSavedList().forEach(function (name) { savedMap[name] = true; });
        return getVisibleHotelNames().filter(function (name) { return !savedMap[name]; });
    }

    function showMessage(message) {
        var old = document.getElementById('bf-toast');
        if (old && old.parentNode) old.parentNode.removeChild(old);

        var toast = document.createElement('div');
        toast.id = 'bf-toast';
        toast.className = 'bf-toast';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.setAttribute('aria-atomic', 'true');
        toast.setAttribute('tabindex', '0');
        toast.setAttribute('aria-controls', 'hover-hotel-list');
        document.body.appendChild(toast);

        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3000);
    }

    function updateStatus() {
        var el = document.getElementById('hotel-list-status');
        if (el) {
            var count = getSavedList().length;
            el.textContent = count === 0 ? 'No hotels saved' : count + ' hotels saved';
        }
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
            var empty = document.createElement('li');
            empty.innerHTML = '<i>No hotels saved</i>';
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
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            var span = document.createElement('span');
            span.textContent = name;
            li.appendChild(span);

            var btn = document.createElement('button');
            btn.textContent = '×';
            btn.style.border = 'none';
            btn.style.background = 'none';
            btn.style.color = '#ff4d4f';
            btn.style.cursor = 'pointer';
            btn.style.padding = '0 4px';
            btn.style.fontSize = '16px';
            btn.onclick = function() {
                if (!confirm('Remove ' + name + ' from the list?')) return;
                removeHotel(name);
                renderSavedList(listEl, filter);
            };
            li.appendChild(btn);

            ul.appendChild(li);
        });
    }

    function createButton(text, id, onClick, symbol) {
        var button = document.createElement('button');
        button.textContent = symbol || text;
        button.id = id;
        button.title = text;
        button.setAttribute('aria-label', text);
        button.addEventListener('click', onClick);
        if (id === 'save-animals-btn') {
            button.addEventListener('mouseenter', function() { button.style.opacity = '0.7'; });
            button.addEventListener('mouseleave', function() { button.style.opacity = '1.0'; });
            button.addEventListener('focus', function() { button.style.opacity = '0.7'; });
            button.addEventListener('blur', function() { button.style.opacity = '1.0'; });
        }
        return button;
    }

    function copyText(text, onDone, onFail) {
        if (!text || text.length === 0) {
            showMessage('No hotels to copy.');
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

    function fallbackCopy(text, count) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-2000px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            // fail silently
        }
        if (ta.parentNode) ta.parentNode.removeChild(ta);
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
    status.setAttribute('title', 'Click to toggle list');
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

    var buttonsConfig = [
        ['Add visible hotels', '\u2795', 'save-animals-btn', function () {
            var result = mergeSavedWithVisible();
            updateStatus();
            if (hoverList.style.display === 'block') renderSavedList(hoverList, filterInput.value);
            showMessage(result.addedCount ? ('Saved ' + result.addedCount + (result.addedCount === 1 ? ' hotel name.' : ' hotel names.')) : 'No new hotel names found.');
        }],
        ['Toggle dimming', '\u263C', 'toggle-dim-btn', function () {
            var isDimmed = toggleDimSavedHotels();
            var icon = isDimmed ? '\uD83C\uDF19' : '\uD83C\uDF1E';
            var btn = document.getElementById('toggle-dim-btn');
            if (btn) btn.textContent = icon;
            showMessage('Dimming ' + (isDimmed ? 'ON' : 'OFF'));
        }],
        ['Copy all saved', '\uD83D\uDCCB', 'copy-all-saved-btn', function () {
            var saved = getSavedList();
            if (!saved.length) { showMessage('No hotels to copy.'); return; }
            copyText(saved.join('\n'), function(c){showMessage('Copied '+c+' hotel name' + (c === 1 ? '' : 's') + '.')}, null);
        }],
        ['Copy non-excluded hotels', '\uD83D\uDCCB', 'copy-non-excluded-btn', function () {
            var nonExcluded = getNonExcludedVisibleHotels();
            if (!nonExcluded.length) { showMessage('No non-excluded hotels to copy.'); return; }
            copyText(nonExcluded.join('\n'), function(c){showMessage('Copied '+c+' hotel names to clipboard.');}, null);
        }],
        ['Clear hotel filter list', '\uD83E\uDDF9', 'clear-animals-btn', function () {
            if (!confirm('Are you sure you want to clear the hotel filter list?')) return;
            var hadSavedList = getSavedList().length > 0;
            clearSavedList();
            updateStatus();
            if (hoverList.style.display === 'block') renderSavedList(hoverList, filterInput.value);
            showMessage(hadSavedList ? 'Hotel filter list cleared.' : 'Hotel filter list was already empty.');
        }],
    ];

    buttonsConfig.forEach(function(b) {
        panel.appendChild(createButton(b[0], b[2], b[3], b[1]));
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
        } else if (event.key === 'Escape') {
            setHoverListVisible(false);
        }
    });

    panel.addEventListener('mouseleave', function () { setHoverListVisible(false); });

    var debounceTimeout;
    var observer = new MutationObserver(function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(function() {
            applyDimming();
        }, 500);
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    panel.appendChild(hoverList);
    document.body.appendChild(panel);
    updateStatus();
})();