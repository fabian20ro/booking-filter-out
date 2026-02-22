(function () {
    if (document.getElementById('animal-filter-panel')) return;

    // Inject styles
    var style = document.createElement('style');
    style.textContent = '#animal-filter-panel{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10000;width:auto;padding:8px 12px;background:#efefef;border:1px solid #d6dbe7;border-radius:14px;box-shadow:0 4px 14px rgba(31,71,161,.15);display:flex;align-items:center;gap:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif}#animal-filter-panel button{width:44px;height:44px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:2px solid #1f67ff;border-radius:10px;background:#f7f9ff;color:#1f67ff;font-size:20px;line-height:1;cursor:pointer;-webkit-tap-highlight-color:transparent}#animal-filter-panel button:active{background:#dde6ff;transform:scale(.95)}#hotel-list-status{min-height:44px;min-width:50px;padding:0 10px;display:flex;align-items:center;justify-content:center;border:2px solid #1f67ff;border-radius:10px;background:#f7f9ff;color:#1f67ff;font-size:13px;font-weight:600;white-space:nowrap}#hover-hotel-list{display:none;position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);width:260px;max-height:200px;overflow-y:auto;padding:10px;border:1px solid #c8d7ff;border-radius:10px;background:#fff;color:#163680;font-size:12px;box-shadow:0 4px 12px rgba(31,71,161,.12)}#hover-hotel-list ul{margin:0;padding-left:18px}#bf-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#444;color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.3);z-index:10001;font:14px -apple-system,BlinkMacSystemFont,sans-serif}';
    document.head.appendChild(style);

    function showMessage(message) {
        var old = document.getElementById('bf-toast');
        if (old) old.remove();
        var msg = document.createElement('div');
        msg.id = 'bf-toast';
        msg.textContent = message;
        document.body.appendChild(msg);
        setTimeout(function () { msg.remove(); }, 3000);
    }

    function getPropertyElements() {
        return Array.from(document.querySelectorAll('[data-testid="property-card"]'));
    }

    function extractVisibleHotelNames() {
        var names = [];
        getPropertyElements().forEach(function (card) {
            var t = card.querySelector('[data-testid="title"]');
            if (t) names.push(t.textContent.trim());
        });
        return names;
    }

    function getSaved() {
        return JSON.parse(localStorage.getItem('animalFriendlyList') || '[]');
    }

    function setSaved(list) {
        localStorage.setItem('animalFriendlyList', JSON.stringify(list));
    }

    function updateStatus() {
        var el = document.getElementById('hotel-list-status');
        if (el) el.textContent = getSaved().length + ' saved';
    }

    function saveVisible() {
        var existing = new Set(getSaved());
        var visible = extractVisibleHotelNames();
        visible.forEach(function (n) { existing.add(n); });
        setSaved(Array.from(existing));
        updateStatus();
        showMessage('Saved ' + visible.length + ' hotel names.');
    }

    function filterSaved() {
        var saved = getSaved();
        getPropertyElements().forEach(function (card) {
            var t = card.querySelector('[data-testid="title"]');
            if (t && saved.indexOf(t.textContent.trim()) !== -1) {
                card.style.opacity = '0.2';
            }
        });
        showMessage('Dimmed saved hotels.');
    }

    function copyNonExcluded() {
        var saved = new Set(getSaved());
        var visible = extractVisibleHotelNames();
        var nonExcluded = visible.filter(function (n) { return !saved.has(n); });
        if (nonExcluded.length === 0) {
            showMessage('No non-excluded hotels to copy.');
            return;
        }
        var text = nonExcluded.join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                showMessage('Copied ' + nonExcluded.length + ' hotel names.');
            }, function () {
                fallbackCopy(text, nonExcluded.length);
            });
        } else {
            fallbackCopy(text, nonExcluded.length);
        }
    }

    function fallbackCopy(text, count) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:50%;left:5%;width:90%;height:120px;z-index:10002;font-size:14px;border:2px solid #1f67ff;border-radius:8px;padding:8px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        showMessage('Select all & copy the text below (' + count + ' hotels)');
        ta.addEventListener('blur', function () { ta.remove(); });
    }

    function clearList() {
        localStorage.removeItem('animalFriendlyList');
        updateStatus();
        showMessage('Hotel filter list cleared.');
    }

    // Build panel
    var panel = document.createElement('div');
    panel.id = 'animal-filter-panel';

    var status = document.createElement('div');
    status.id = 'hotel-list-status';
    panel.appendChild(status);

    var hoverList = document.createElement('div');
    hoverList.id = 'hover-hotel-list';
    var listVisible = false;

    var buttons = [
        ['Add visible hotels', '\u2795', saveVisible],
        ['Exclude added hotels', '\uD83D\uDD0D', filterSaved],
        ['Copy non-excluded', '\uD83D\uDCCB', copyNonExcluded],
        ['Clear list', '\uD83E\uDDF9', clearList]
    ];

    buttons.forEach(function (b) {
        var btn = document.createElement('button');
        btn.textContent = b[1];
        btn.title = b[0];
        btn.setAttribute('aria-label', b[0]);
        btn.addEventListener('click', b[2]);
        panel.appendChild(btn);
    });

    // Tap the status badge to toggle saved list
    status.style.cursor = 'pointer';
    status.addEventListener('click', function () {
        listVisible = !listVisible;
        if (listVisible) {
            var saved = getSaved();
            hoverList.innerHTML = saved.length
                ? '<ul>' + saved.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>'
                : '<i>No hotels saved</i>';
            hoverList.style.display = 'block';
        } else {
            hoverList.style.display = 'none';
        }
    });

    panel.appendChild(hoverList);
    document.body.appendChild(panel);
    updateStatus();
})();
