(function () {
    if (window.__bookingFilterInit) return;
    window.__bookingFilterInit = true;
    console.info('Booking.com Hotel Filter initialized.');

    var SELECTORS = {
        propertyCard: '[data-testid="property-card"]',
        title: '[data-testid="title"]'
    };

    var STORAGE_KEY = 'animalFriendlyList';

    function createCore() {
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
            var titleElement = card.querySelector(SELECTORS.title);
            return titleElement ? titleElement.textContent.trim() : '';
        }

        function getVisibleHotelNames() {
            var cards = getPropertyCards();
            var names = [];
            cards.forEach(function (card) {
                var name = getHotelNameFromCard(card);
                if (name) names.push(name);
            });
            return names;
        }

        function mergeSavedWithVisible() {
            var savedList = getSavedList();
            var visibleHotels = getVisibleHotelNames();
            var mergedMap = Object.create(null);
            savedList.forEach(function (name) { mergedMap[name] = true; });
            
            var addedCount = 0;
            visibleHotels.forEach(function (name) {
                if (!mergedMap[name]) {
                    mergedMap[name] = true;
                    addedCount++;
                }
            });

            var merged = Object.keys(mergedMap);
            setSavedList(merged);
            return { savedCount: merged.length, addedCount: addedCount };
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

        function clearSavedList() {
            localStorage.removeItem(STORAGE_KEY);
            getPropertyCards().forEach(function (card) {
                card.style.opacity = '1';
            });
        }

        function getNonExcludedVisibleHotels() {
            var savedMap = Object.create(null);
            getSavedList().forEach(function (name) { savedMap[name] = true; });
            return getVisibleHotelNames().filter(function (name) { return !savedMap[name]; });
        }

        return {
            getSavedList: getSavedList,
            mergeSavedWithVisible: mergeSavedWithVisible,
            toggleDimSavedHotels: toggleDimSavedHotels,
            clearSavedList: clearSavedList,
            getNonExcludedVisibleHotels: getNonExcludedVisibleHotels
        };
    }

    function createUI(core) {
        function showMessage(message) {
            var old = document.getElementById('bf-toast');
            if (old && old.parentNode) old.parentNode.removeChild(old);

            var msgBox = document.createElement('div');
            msgBox.id = 'bf-toast';
            msgBox.textContent = message;
            msgBox.setAttribute('role', 'status');
            msgBox.setAttribute('aria-live', 'polite');
            document.body.appendChild(msgBox);

            setTimeout(function () {
                if (msgBox.parentNode) msgBox.parentNode.removeChild(msgBox);
            }, 3000);
        }

        function createButton(text, id, onClick, symbol) {
            var button = document.createElement('button');
            button.textContent = symbol || text;
            button.id = id;
            button.title = text;
            button.setAttribute('aria-label', text);
            button.addEventListener('click', onClick);
            return button;
        }

        function renderSavedList(hoverList) {
            var saved = core.getSavedList();
            hoverList.innerHTML = '';

            if (!saved.length) {
                var empty = document.createElement('i');
                empty.textContent = 'No hotels saved';
                hoverList.appendChild(empty);
                return;
            }

            var list = document.createElement('ul');
            saved.forEach(function (name) {
                var item = document.createElement('li');
                item.textContent = name;
                list.appendChild(item);
            });
            hoverList.appendChild(list);
        }

        function updateHotelListCount() {
            var status = document.getElementById('hotel-list-status');
            if (status) status.textContent = core.getSavedList().length + ' saved';
        }

        function copyText(text, onDone, onFail) {
            function fallbackCopy() {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;top:50%;left:5%;width:90%;height:120px;z-index:10002;font-size:14px;border:2px solid #1f67ff;border-radius:8px;padding:8px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                showMessage('Select all & copy the text below (' + text.split('\n').length + ' hotels)');
                ta.addEventListener('blur', function () {
                    if (ta.parentNode) ta.parentNode.removeChild(ta);
                });
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(onDone, function () {
                    fallbackCopy();
                    if (onFail) onFail();
                });
                return;
            }

            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.top = '-2000px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                document.execCommand('copy');
                onDone();
            } catch (e) {
                fallbackCopy();
                if (onFail) onFail();
            }
            if (ta.parentNode) ta.parentNode.removeChild(ta);
        }

        function insertControlPanel() {
            if (document.getElementById('animal-filter-panel')) return;

            var panel = document.createElement('div');
            panel.id = 'animal-filter-panel';

            var topRow = document.createElement('div');
            topRow.className = 'panel-row panel-row-top';

            var bottomRow = document.createElement('div');
            bottomRow.className = 'panel-row panel-row-bottom';

            var statusText = document.createElement('div');
            statusText.id = 'hotel-list-status';
            statusText.setAttribute('role', 'status');
            statusText.setAttribute('aria-live', 'polite');
            statusText.setAttribute('aria-atomic', 'true');
            statusText.setAttribute('tabindex', '0');
            statusText.setAttribute('aria-controls', 'hover-hotel-list');
            statusText.setAttribute('aria-expanded', 'false');
            statusText.style.cursor = 'pointer';
            topRow.appendChild(statusText);

            var hoverList = document.createElement('div');
            hoverList.id = 'hover-hotel-list';
            hoverList.setAttribute('aria-hidden', 'true');

            function setHoverListVisible(visible) {
                hoverList.style.display = visible ? 'block' : 'none';
                hoverList.setAttribute('aria-hidden', visible ? 'false' : 'true');
                statusText.setAttribute('aria-expanded', visible ? 'true' : 'false');
            }

            var buttonsConfig = [
                ['Add visible hotels', '\u2795', 'save-animals-btn', function () {
                    var result = core.mergeSavedWithVisible();
                    updateHotelListCount();
                    if (hoverList.style.display === 'block') renderSavedList(hoverList);
                    showMessage(result.addedCount ? ('Saved ' + result.addedCount + ' hotel names.') : 'No new hotel names found.');
                }],
                ['Toggle dimming', '\uD83D\uDD0D', 'filter-animals-btn', function () {
                    core.toggleDimSavedHotels();
                    showMessage('Toggled dimming.');
                }],
                ['Copy all saved', '\uD83D\uDCCB', 'copy-all-saved-btn', function () {
                    var saved = core.getSavedList();
                    if (!saved.length) {
                        showMessage('No hotels to copy.');
                        return;
                    }
                    copyText(saved.join('\n'), function () {
                        showMessage('Copied ' + saved.length + ' hotel names.');
                    }, function () {
                        showMessage('Copy failed on this browser.');
                    });
                }],
                ['Copy non-excluded hotels', '\uD83D\uDCCB', 'copy-non-excluded-btn', function () {
                    var nonExcluded = core.getNonExcludedVisibleHotels();
                    if (!nonExcluded.length) {
                        showMessage('No non-excluded hotels to copy.');
                        return;
                    }
                    copyText(nonExcluded.join('\n'), function () {
                        showMessage('Copied ' + nonExcluded.length + ' hotel names to clipboard.');
                    }, function () {
                        showMessage('Copy failed on this browser.');
                    });
                }],
                ['Clear hotel filter list', '\uD83E\uDDF9', 'clear-animals-btn', function () {
                    var hadSavedList = core.getSavedList().length > 0;
                    core.clearSavedList();
                    updateHotelListCount();
                    if (hoverList.style.display === 'block') renderSavedList(hoverList);
                    showMessage(hadSavedList ? 'Hotel filter list cleared.' : 'Hotel filter list was already empty.');
                }]
            ];

            var saveBtn;
            buttonsConfig.forEach(function (config) {
                var btn = createButton(config[0], config[2], config[3], config[1]);
                bottomRow.appendChild(btn);
                if (config[2] === 'save-animals-btn') {
                    saveBtn = btn;
                }
            });

            function toggleSavedListVisibility() {
                var visible = hoverList.style.display !== 'block';
                if (visible) renderSavedList(hoverList);
                setHoverListVisible(visible);
            }

            saveBtn.addEventListener('mouseenter', function () { renderSavedList(hoverList); setHoverListVisible(true); });
            saveBtn.addEventListener('focus', function () { renderSavedList(hoverList); setHoverListVisible(true); });
            saveBtn.addEventListener('blur', function () { setHoverListVisible(false); });
            statusText.addEventListener('click', toggleSavedListVisibility);
            statusText.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleSavedListVisibility();
                }
            });
            panel.addEventListener('mouseleave', function () { setHoverListVisible(false); });

            panel.appendChild(topRow);
            panel.appendChild(bottomRow);
            panel.appendChild(hoverList);
            document.body.appendChild(panel);
            updateHotelListCount();
        }

        return { insertControlPanel: insertControlPanel };
    }

    createUI(createCore()).insertControlPanel();
})();
