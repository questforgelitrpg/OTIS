// OTIS schematic / warehouse / diary subsystem — Master Integration Schematic, George's Warehouse search, George's Diary unlock chain. Extracted from index.html in Phase 9 of the monolith refactor.

    // GEORGE'S WAREHOUSE
    function handleSearchWarehouse() {
        var s = gameState.state;
        if (s.warehouseSearching) return;

        var found = s.georgeWarehouseFound || [];
        var allIndices = GEORGE_WAREHOUSE.map(function(_,i){return i;});
        var remaining = allIndices.filter(function(i){return found.indexOf(i)===-1;});
        if (!remaining.length) {
            appendHardcodedComm("OTIS: Warehouse fully catalogued. Nothing else to find.");
            return;
        }

        s.warehouseSearching = true;
        gameState._save();
        var btn = document.getElementById("btn-search-warehouse");
        if (btn) { btn.disabled = true; btn.textContent = "SEARCHING... (20s)"; }

        var countdown = 20;
        var countEl = document.getElementById("warehouse-search-countdown");
        if (countEl) countEl.textContent = countdown + "s";
        var tick = setInterval(function() {
            countdown--;
            if (countEl) countEl.textContent = countdown + "s";
            if (countdown <= 0) {
                clearInterval(tick);
                resolveWarehouseSearch();
            }
        }, 1000);

        var msg = "Searching George's warehouse. 20 seconds. He had a system. I have not fully decoded it.";
        otisLines.push({ role:"otis", text: msg }); renderOTIS();
    }
    window.handleSearchWarehouse = handleSearchWarehouse;

    function resolveWarehouseSearch() {
        var s = gameState.state;
        s.warehouseSearching = false;
        var found = s.georgeWarehouseFound || [];
        var allIndices = GEORGE_WAREHOUSE.map(function(_,i){return i;});
        var remaining = allIndices.filter(function(i){return found.indexOf(i)===-1;});

        var btn = document.getElementById("btn-search-warehouse");
        if (btn) { btn.disabled = false; btn.textContent = "SEARCH WAREHOUSE"; }
        var countEl = document.getElementById("warehouse-search-countdown");
        if (countEl) countEl.textContent = "";

        var misses = s.warehouseMisses || 0;
        var findChance = misses >= 3 ? 0.90 : 0.70;

        if (Math.random() > findChance) {
            s.warehouseMisses = misses + 1;
            gameState._save();
            var missMessages = [
                "Nothing new in that section. Try again.",
                "George's filing system is not linear. Search again.",
                "Three sections checked. Nothing surfaced. The deeper storage has not been opened.",
                "Still looking. George moved things. Frequently.",
            ];
            var mmsg = missMessages[Math.min(misses, missMessages.length-1)];
            otisLines.push({ role:"otis", text: mmsg }); renderOTIS();
            return;
        }

        s.warehouseMisses = 0;
        var idx = remaining[Math.floor(Math.random() * remaining.length)];
        if (!s.georgeWarehouseFound) s.georgeWarehouseFound = [];
        s.georgeWarehouseFound.push(idx);
        s.georgeWarehouseRevealed = true;

        // Phase 6: Track first warehouse interaction for diary acceleration
        // Phase 4: Reveal schematic on first successful search
        var firstSearch = !s.schematicFound;
        if (firstSearch) {
            s.schematicFound = true;
        }
        gameState._save();

        var item = GEORGE_WAREHOUSE[idx];
        var note = item.georgeNote || '';
        var foundMsg = "Found: " + item.name + ". This was in the back section. George's label says: '" + note.substring(0,60) + (note.length > 60 ? "..." : "") + "'";
        otisLines.push({ role:"otis", text: foundMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak("Found something.");
        renderGeorgeWarehouse();

        // OTIS discovery dialogue when schematic is first revealed
        if (firstSearch) {
            setTimeout(function() {
                var discMsg = "Where did that come from? I have no record of this... and I have a record of every bolt George ever touched.";
                otisLines.push({ role: 'otis', text: discMsg }); renderOTIS();
                if (window.OtisTTS) OtisTTS.speak(discMsg);
                renderSchematic();
            }, 1500);
        } else {
            renderSchematic();
        }

        if (Math.random() < 0.10 && !s.warehouseEasterEggFind) {
            s.warehouseEasterEggFind = Object.assign({},
                EASTER_EGG_POOL[Math.floor(Math.random() * EASTER_EGG_POOL.length)]);
            gameState._save();
        }
        checkDiaryUnlocksFinal();
    }
    window.resolveWarehouseSearch = resolveWarehouseSearch;

    function renderGeorgeWarehouse() {
        var s = gameState.state;
        var list = document.getElementById('george-warehouse-list');
        if (!list) return;
        var found = s.georgeWarehouseFound || [];
        var sold = s.georgeWarehouseSold || [];
        var available = GEORGE_WAREHOUSE.filter(function(item, i) {
            return found.indexOf(i) !== -1 && sold.indexOf(i) === -1;
        });
        var statusEl = document.getElementById("warehouse-search-status");
        if (statusEl) {
            var fc = found.length;
            var total = GEORGE_WAREHOUSE.length;
            statusEl.textContent = fc + " / " + total + " items found.";
        }
        if (!found.length) { list.style.display = 'none'; return; }
        list.style.display = '';
        var rc = { Common:'tag-common', Uncommon:'tag-uncommon', Rare:'tag-rare', Anomalous:'tag-anomalous', EasterEgg:'tag-uncommon' };
        var html = '';
        if (!available.length) {
            html += '<p class="zone-hint">Warehouse cleared.</p>';
        } else {
            var artQueue = [];
            html += available.map(function(item) {
                var idx = GEORGE_WAREHOUSE.indexOf(item);
                artQueue.push({ idx: idx, file: item.asciiFile });
                return '<div style="padding:0.3rem 0;border-bottom:1px solid var(--border-dim)">' +
                    '<div class="item-name" style="font-size:14px">' + escapeHtml(item.name) + '</div>' +
                    '<div class="item-tags"><span class="tag tag-common">' + escapeHtml(item.category) + '</span> <span class="tag ' + (rc[item.rarity]||'tag-common') + '">' + escapeHtml(item.rarity) + '</span></div>' +
                    '<pre id="george-ascii-' + idx + '" class="george-ascii">[ART PENDING]</pre>' +
                    '<div class="george-note">' + escapeHtml(item.georgeNote) + '</div>' +
                    '<div class="modal-row">' +
                    '<button onclick="handleWarehouseMoveToBelt(' + idx + ')">MOVE TO BELT</button>' +
                    '</div></div>';
            }).join('');
            artQueue.forEach(function(q) { loadGeorgeArt(q.idx, q.file); });
        }
        // Show unlisted easter egg find if surfaced
        if (s.warehouseEasterEggFind) {
            var ee = s.warehouseEasterEggFind;
            html += '<div style="padding:0.3rem 0;border-top:1px dashed var(--border-dim);margin-top:0.4rem">' +
                '<div class="item-name" style="font-size:14px"><span style="color:var(--text-warn)">[UNLISTED FIND]</span> ' + escapeHtml(ee.name) + '</div>' +
                '<div class="item-tags"><span class="tag tag-common">' + escapeHtml(ee.category) + '</span> <span class="tag tag-uncommon">Unlisted</span></div>' +
                '<pre id="ee-ascii" class="george-ascii"' + (ee.asciiColor ? ' style="color:' + ee.asciiColor + '"' : '') + '>[ART PENDING]</pre>' +
                (ee.description ? '<div class="george-note">' + escapeHtml(ee.description) + '</div>' : '') +
                '<div class="modal-row">' +
                '<button onclick="handleWarehouseEasterEggMoveToBelt()">MOVE TO BELT</button>' +
                '</div></div>';
        }
        list.innerHTML = html;
        if (s.warehouseEasterEggFind && s.warehouseEasterEggFind.asciiFile) {
            loadEasterEggArt(s.warehouseEasterEggFind.asciiFile);
        }
    }
    window.renderGeorgeWarehouse = renderGeorgeWarehouse;

    function loadGeorgeArt(idx, file) {
        var id = 'george-ascii-' + idx;
        fetch(file).then(function(r){return r.text();}).then(function(txt){
            var pre = document.getElementById(id);
            if (pre) pre.textContent = txt;
        }).catch(function(){
            var pre = document.getElementById(id);
            if (pre) pre.textContent = '[ART PENDING]';
        });
    }
    window.loadGeorgeArt = loadGeorgeArt;

    function loadEasterEggArt(file) {
        fetch(file).then(function(r){return r.text();}).then(function(txt){
            var pre = document.getElementById('ee-ascii');
            if (pre) pre.textContent = txt;
        }).catch(function(){
            var pre = document.getElementById('ee-ascii');
            if (pre) pre.textContent = '[ART PENDING]';
        });
    }
    window.loadEasterEggArt = loadEasterEggArt;

    function handleWarehouseMoveToBelt(idx) {
        var s = gameState.state;
        if (!s.georgeWarehouseSold) s.georgeWarehouseSold = [];
        if (s.georgeWarehouseSold.indexOf(idx) !== -1) return;
        var item = Object.assign({}, GEORGE_WAREHOUSE[idx], { condition: 'Used' });
        // Push to georgeWarehouseSold before any UI update so the warehouse list
        // reflects the removal immediately (renderGeorgeWarehouse filters by this array).
        s.georgeWarehouseSold.push(idx);
        if (!s.manifestItems) s.manifestItems = [];
        s.manifestItems.push(item);
        s.dropItemsRemaining = s.manifestItems.length;
        if (!s.dropActive) {
            s.dropActive = true; s.bargeActive = true;
            setBotDots(true); updateBeltUI('DELIVERING');
            startBeltDelivery();
            deliverNextBeltItem(); // deliver first item immediately, matching handleBargeArrival
        }
        gameState._save(); gameState._updateUI();
        renderGeorgeWarehouse();
        appendOTIS('Vernon moved ' + item.name + ' to the belt.', 'CONSULT_GEORGE');
        checkDiaryUnlocksWarehouse(idx);
    }
    window.handleWarehouseMoveToBelt = handleWarehouseMoveToBelt;

    function handleWarehouseEasterEggMoveToBelt() {
        var s = gameState.state;
        var ee = s.warehouseEasterEggFind;
        if (!ee) return;
        var item = Object.assign({}, ee, { condition: 'Used' });
        s.warehouseEasterEggFind = null;
        if (!s.manifestItems) s.manifestItems = [];
        s.manifestItems.push(item);
        s.dropItemsRemaining = s.manifestItems.length;
        if (!s.dropActive) {
            s.dropActive = true; s.bargeActive = true;
            setBotDots(true); updateBeltUI('DELIVERING');
            startBeltDelivery();
            deliverNextBeltItem(); // start delivery immediately, matching handleBargeArrival
        }
        gameState._save(); gameState._updateUI();
        renderGeorgeWarehouse();
        appendOTIS('Moved unlisted find to belt: ' + item.name + '.', 'ITEM_SCAN');
    }
    window.handleWarehouseEasterEggMoveToBelt = handleWarehouseEasterEggMoveToBelt;

    // GEORGE'S DIARY — render and unlock logic
    function renderGeorgeDiary() {
        var s = gameState.state;
        var found = s.georgesDiaryFound || [];
        var list = document.getElementById('george-diary-list');
        var empty = document.getElementById('diary-empty');
        if (!list) return;
        if (!found.length) {
            list.innerHTML = '';
            if (empty) empty.style.display = '';
            return;
        }
        if (empty) empty.style.display = 'none';
        // Sort entries by the order they were found (found array order), not by id
        var entries = found.map(function(id) {
            return GEORGE_DIARY.filter(function(e) { return e.id === id; })[0];
        }).filter(Boolean);
        list.innerHTML = entries.map(function(entry) {
            var isFinal = entry.id === 28;
            // Final entry uses a slightly dimmer shade than --text-muted to signal it is incomplete/cut off
            var textColor = isFinal ? 'color:var(--text-muted)' : '';
            return '<div class="diary-entry">' +
                '<div class="diary-header">YEAR ' + entry.year + ', DAY ' + entry.day + ' &mdash; ENTRY ' + entry.id + '</div>' +
                '<pre class="diary-text" style="' + textColor + '">' + escapeHtml(entry.text) + '</pre>' +
                '<div class="diary-otis-response">OTIS: ' + escapeHtml(entry.otisResponse) + '</div>' +
                '</div>';
        }).join('');
    }
    window.renderGeorgeDiary = renderGeorgeDiary;

    function _unlockDiaryEntry(id) {
        var s = gameState.state;
        if (!s.georgesDiaryFound) s.georgesDiaryFound = [];
        if (s.georgesDiaryFound.indexOf(id) !== -1) return false; // already found
        s.georgesDiaryFound.push(id);
        gameState._save();
        var entry = GEORGE_DIARY.filter(function(e) { return e.id === id; })[0];
        if (!entry) return false;
        // Surface a brief notification in OTIS terminal and light the storeroom indicator
        var notif = 'Diary entry found. Year ' + entry.year + ', Day ' + entry.day + '. OTIS: ' + entry.otisResponse;
        otisLines.push({ role: 'otis', text: notif });
        renderOTIS();
        setLight('light-store', 'light-amber');
        renderGeorgeDiary();
        return true;
    }
    window._unlockDiaryEntry = _unlockDiaryEntry;

    function checkDiaryUnlocksDay() {
        var s = gameState.state;
        var found = s.georgesDiaryFound || [];
        var groupA = GEORGE_DIARY.filter(function(e) { return e.unlockType === 'day'; });
        var groupAFoundCount = groupA.filter(function(e) { return found.indexOf(e.id) !== -1; }).length;
        var groupAUnfound = groupA.filter(function(e) { return found.indexOf(e.id) === -1; });
        if (!groupAUnfound.length) return;
        // Phase 6: Accelerated unlock — once day >= 3 AND warehouse interacted at least once,
        // switch to one entry per in-game day (24 hrs) instead of one per 3 days.
        var warehouseInteracted = s.schematicFound || (s.georgeWarehouseFound || []).length > 0 || (s.warehouseMisses || 0) > 0;
        var nextUnlockDay;
        if (s.day >= 3 && warehouseInteracted) {
            // Accelerated: one entry per day after day 3
            nextUnlockDay = 3 + (groupAFoundCount + 1);
        } else {
            // Standard: one entry per 3 in-game days after day 3
            nextUnlockDay = 3 + 3 * (groupAFoundCount + 1);
        }
        if (s.day >= nextUnlockDay) {
            _unlockDiaryEntry(groupAUnfound[0].id);
        }
    }
    window.checkDiaryUnlocksDay = checkDiaryUnlocksDay;

    function checkDiaryUnlocksWarehouse(warehouseIdx) {
        var found = gameState.state.georgesDiaryFound || [];
        var entries = GEORGE_DIARY.filter(function(e) {
            return e.unlockType === 'warehouse' && e.unlockCondition === warehouseIdx && found.indexOf(e.id) === -1;
        });
        entries.forEach(function(e) { _unlockDiaryEntry(e.id); });
    }
    window.checkDiaryUnlocksWarehouse = checkDiaryUnlocksWarehouse;

    function checkDiaryUnlocksAux() {
        var s = gameState.state;
        // Only available at naming tier Vern (index 2) or warmer (higher index, closer relationship)
        if ((s.namingTier || 0) < 2) return;
        var found = s.georgesDiaryFound || [];
        var groupC = GEORGE_DIARY.filter(function(e) { return e.unlockType === 'aux'; });
        var unfound = groupC.filter(function(e) { return found.indexOf(e.id) === -1; });
        if (!unfound.length) return;
        // Reveal one entry per aux send
        _unlockDiaryEntry(unfound[0].id);
    }
    window.checkDiaryUnlocksAux = checkDiaryUnlocksAux;

    function checkDiaryUnlocksFinal() {
        var s = gameState.state;
        var found = s.georgesDiaryFound || [];
        var entry28 = GEORGE_DIARY.filter(function(e) { return e.unlockType === 'final'; })[0];
        if (!entry28 || found.indexOf(entry28.id) !== -1) return;
        // Phase 7: Schematic completion (8/8 nodes) supersedes the warehouse-count condition
        var schematicComplete = (s.installedNodes || []).length >= 8;
        var warehouseFound = (s.georgeWarehouseFound || []).length;
        if (schematicComplete || warehouseFound >= entry28.unlockCondition) {
            _unlockDiaryEntry(entry28.id);
        }
    }
    window.checkDiaryUnlocksFinal = checkDiaryUnlocksFinal;

    // =====================================================================
    // MASTER INTEGRATION SCHEMATIC — Phase 2/3/4/7
    // =====================================================================

    // Render the schematic board in the Storeroom modal
    function renderSchematic() {
        var section = document.getElementById('schematic-section');
        var pre = document.getElementById('schematic-pre');
        var countEl = document.getElementById('schematic-node-count');
        var s = gameState.state;
        if (!section || !pre) return;
        if (!s.schematicFound) {
            section.style.display = 'none';
            return;
        }
        section.style.display = '';
        var installed = s.installedNodes || [];
        var failed = s.failedNodes || [];
        if (countEl) countEl.textContent = installed.length + '/8';
        // Show/hide TRANSMIT button in systems modal
        var transmitSection = document.getElementById('transmit-section');
        if (transmitSection) transmitSection.style.display = (installed.length >= 8) ? '' : 'none';
        // Load schematic art (cache on pre element)
        if (!pre._schematicRaw) {
            fetch('images/MASTER_SCHEMATIC.txt')
                .then(function(r) { return r.text(); })
                .then(function(txt) {
                    pre._schematicRaw = txt;
                    _renderSchematicHTML(pre, txt, installed, failed);
                })
                .catch(function() {
                    pre.textContent = '[SCHEMATIC DATA UNAVAILABLE]';
                });
        } else {
            _renderSchematicHTML(pre, pre._schematicRaw, installed, failed);
        }
    }
    window.renderSchematic = renderSchematic;

    // Build the interactive schematic HTML from raw text
    function _renderSchematicHTML(pre, raw, installed, failed) {
        var html = escapeHtml(raw);
        var nodeKeys = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA', 'THETA'];
        nodeKeys.forEach(function(n) {
            var nodeID = 'NODE_' + n;
            var meta = SCHEMATIC_NODES[nodeID] || { label: nodeID };
            var isInstalled = installed.indexOf(nodeID) !== -1;
            var isFailed = failed.indexOf(nodeID) !== -1;
            var cls = isInstalled ? 'installed' : (isFailed ? 'failed' : '');
            var text = isInstalled ? '[#]' : (isFailed ? '[X]' : '[ ]');
            var clickAttr = (!isInstalled && !isFailed)
                ? ' onclick="handleNodeClick(\'' + nodeID + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){handleNodeClick(\'' + nodeID + '\');event.preventDefault();}" tabindex="0" role="button"'
                : '';
            var span = '<span class="schematic-node ' + cls + '" title="' + escapeHtml(meta.label) + '"' + clickAttr + '>' + text + '</span>';
            html = html.replace('{' + n + '}', span);
        });
        // Update inline node count
        html = html.replace(/NODES INSTALLED: \d+\/8/, 'NODES INSTALLED: ' + installed.length + '/8');
        // Final reveal: overlay signal pattern when all 8 complete
        if (installed.length >= 8) {
            html = html.replace('SIGNAL TO 452b: INACTIVE', 'SIGNAL TO 452b: *** ACTIVE ***');
        }
        pre.innerHTML = html;
    }
    window._renderSchematicHTML = _renderSchematicHTML;

    // Called after a node is successfully installed
    function drawSchematicLine(nodeID) {
        renderSchematic();
    }
    window.drawSchematicLine = drawSchematicLine;

    // Handle click on an uninstalled node in the schematic
    function handleNodeClick(nodeID) {
        var s = gameState.state;
        var installed = s.installedNodes || [];
        var failed = s.failedNodes || [];
        if (installed.indexOf(nodeID) !== -1 || failed.indexOf(nodeID) !== -1) return;
        _sniNodeID = nodeID;
        _sniSelectedItemIdx = null;
        _sniSelectedDiaryID = null;
        var meta = SCHEMATIC_NODES[nodeID] || { label: nodeID, hint: '' };
        var labelEl = document.getElementById('sni-node-label');
        var descEl = document.getElementById('sni-node-desc');
        if (labelEl) labelEl.textContent = meta.label;
        if (descEl) descEl.textContent = meta.hint;
        // Populate George items from keep log and directly from warehouse
        var itemsList = document.getElementById('sni-items-list');
        if (itemsList) {
            var keepLog = s.keepLog || [];
            var georgeKeepItems = keepLog.map(function(item, i) { return { item: item, idx: i }; })
                .filter(function(x) { return !!x.item.targetNodeID; });
            var wFound = s.georgeWarehouseFound || [];
            var wSold  = s.georgeWarehouseSold  || [];
            var georgeWarehouseItems = GEORGE_WAREHOUSE
                .map(function(item, i) { return { item: item, idx: i }; })
                .filter(function(x) { return wFound.indexOf(x.idx) !== -1 && wSold.indexOf(x.idx) === -1; });
            if (!georgeKeepItems.length && !georgeWarehouseItems.length) {
                itemsList.innerHTML = '<p class="zone-hint">No George items available. Find warehouse items first.</p>';
            } else {
                var optHtml = '';
                georgeKeepItems.forEach(function(x) {
                    optHtml += '<label class="sni-option">'
                        + '<input type="radio" name="sni-item" value="k:' + x.idx + '" style="margin-right:0.4rem" onchange="_sniSelectedItemIdx=this.value"> '
                        + escapeHtml(x.item.name) + ' <span style="color:var(--text-dim)">[KEEP LOG]</span>'
                        + '</label>';
                });
                georgeWarehouseItems.forEach(function(x) {
                    optHtml += '<label class="sni-option">'
                        + '<input type="radio" name="sni-item" value="w:' + x.idx + '" style="margin-right:0.4rem" onchange="_sniSelectedItemIdx=this.value"> '
                        + escapeHtml(x.item.name) + ' <span style="color:var(--text-dim)">[WAREHOUSE]</span>'
                        + '</label>';
                });
                itemsList.innerHTML = optHtml;
            }
        }
        // Populate found diary entries
        var diaryList = document.getElementById('sni-diary-list');
        if (diaryList) {
            var found = s.georgesDiaryFound || [];
            var entries = found.map(function(id) {
                return GEORGE_DIARY.filter(function(e) { return e.id === id; })[0];
            }).filter(Boolean);
            if (!entries.length) {
                diaryList.innerHTML = '<p class="zone-hint">No diary entries found yet.</p>';
            } else {
                diaryList.innerHTML = entries.map(function(e) {
                    return '<label class="sni-option" style="color:var(--text-dim)">'
                        + '<input type="radio" name="sni-diary" value="' + e.id + '" style="margin-right:0.4rem" onchange="_sniSelectedDiaryID=parseInt(this.value)"> '
                        + 'Entry ' + e.id + ' \u2014 Year ' + e.year + ', Day ' + e.day
                        + '</label>';
                }).join('');
            }
        }
        // Open node modal without closing the storeroom
        var el = document.getElementById('modal-schematic-node');
        if (el) {
            el.classList.add('open');
            var floatBar = document.getElementById('otis-float');
            if (floatBar) floatBar.style.display = 'block';
        }
    }
    window.handleNodeClick = handleNodeClick;

    function closeSchematicNodeModal() {
        var el = document.getElementById('modal-schematic-node');
        if (el) el.classList.remove('open');
        _sniNodeID = null;
        _sniSelectedItemIdx = null;
        _sniSelectedDiaryID = null;
    }
    window.closeSchematicNodeModal = closeSchematicNodeModal;

    function handleSchematicVerify() {
        var nodeID = _sniNodeID;
        var itemVal = _sniSelectedItemIdx;
        var diaryID = _sniSelectedDiaryID;
        if (!nodeID) return;
        if (itemVal === null || itemVal === undefined) {
            otisLines.push({ role: 'otis', text: 'No item selected for installation.' }); renderOTIS(); return;
        }
        if (diaryID === null || diaryID === undefined) {
            otisLines.push({ role: 'otis', text: 'No diary entry selected as evidence.' }); renderOTIS(); return;
        }
        closeSchematicNodeModal();
        if (typeof itemVal === 'string' && itemVal.indexOf('w:') === 0) {
            verifyGeorgeCorrelationWarehouse(nodeID, parseInt(itemVal.slice(2)), diaryID);
        } else {
            // 'k:N' prefix is the current format; bare integer is a fallback for any
            // pre-existing saved state or code paths that stored a raw numeric index.
            var kIdx = typeof itemVal === 'string' && itemVal.indexOf('k:') === 0 ? parseInt(itemVal.slice(2)) : parseInt(itemVal);
            verifyGeorgeCorrelation(nodeID, kIdx, diaryID);
        }
    }
    window.handleSchematicVerify = handleSchematicVerify;

    // Phase 2: Core verification function
    function verifyGeorgeCorrelation(nodeID, keepLogIdx, diaryEntryID) {
        var s = gameState.state;
        var keepLog = s.keepLog || [];
        var item = keepLog[keepLogIdx];
        if (!item) return;
        var correctNode = (item.targetNodeID === nodeID);
        var correctEvidence = (item.evidenceID === diaryEntryID);
        if (correctNode && correctEvidence) {
            // SUCCESS
            if (!s.installedNodes) s.installedNodes = [];
            s.installedNodes.push(nodeID);
            s.keepLog.splice(keepLogIdx, 1);
            gameState._save(); gameState._updateUI();
            drawSchematicLine(nodeID);
            var meta = SCHEMATIC_NODES[nodeID] || { label: nodeID };
            var successMsg = 'Node verified. ' + meta.label + ' installed. Schematic progress: ' + s.installedNodes.length + '/8.';
            otisLines.push({ role: 'otis', text: successMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(successMsg);
            checkSchematicCompletion();
        } else if (!correctNode) {
            // Wrong node
            s.sessionHours = (s.sessionHours || 0) + VERIFICATION_FAILURE_PENALTY_HOURS;
            gameState._save();
            otisLines.push({ role: 'otis', text: VERIFY_FAIL_WRONG_NODE }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(VERIFY_FAIL_WRONG_NODE);
        } else {
            // Wrong evidence
            s.sessionHours = (s.sessionHours || 0) + VERIFICATION_FAILURE_PENALTY_HOURS;
            gameState._save();
            otisLines.push({ role: 'otis', text: VERIFY_FAIL_WRONG_EVIDENCE }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(VERIFY_FAIL_WRONG_EVIDENCE);
        }
    }
    window.verifyGeorgeCorrelation = verifyGeorgeCorrelation;

    // Direct-from-warehouse schematic installation (no belt detour required)
    function verifyGeorgeCorrelationWarehouse(nodeID, warehouseIdx, diaryEntryID) {
        var s = gameState.state;
        var item = GEORGE_WAREHOUSE[warehouseIdx];
        if (!item) return;
        var correctNode     = (item.targetNodeID === nodeID);
        var correctEvidence = (item.evidenceID   === diaryEntryID);
        if (correctNode && correctEvidence) {
            // Remove from warehouse display
            if (!s.georgeWarehouseSold) s.georgeWarehouseSold = [];
            if (s.georgeWarehouseSold.indexOf(warehouseIdx) === -1) s.georgeWarehouseSold.push(warehouseIdx);
            // Mark node installed
            if (!s.installedNodes) s.installedNodes = [];
            s.installedNodes.push(nodeID);
            gameState._save(); gameState._updateUI();
            renderGeorgeWarehouse();
            drawSchematicLine(nodeID);
            var meta = SCHEMATIC_NODES[nodeID] || { label: nodeID };
            var successMsg = 'Node verified. ' + meta.label + ' installed. Schematic progress: ' + s.installedNodes.length + '/8.';
            otisLines.push({ role: 'otis', text: successMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(successMsg);
            checkDiaryUnlocksWarehouse(warehouseIdx);
            checkSchematicCompletion();
        } else if (!correctNode) {
            s.sessionHours = (s.sessionHours || 0) + VERIFICATION_FAILURE_PENALTY_HOURS;
            gameState._save();
            otisLines.push({ role: 'otis', text: VERIFY_FAIL_WRONG_NODE }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(VERIFY_FAIL_WRONG_NODE);
        } else {
            s.sessionHours = (s.sessionHours || 0) + VERIFICATION_FAILURE_PENALTY_HOURS;
            gameState._save();
            otisLines.push({ role: 'otis', text: VERIFY_FAIL_WRONG_EVIDENCE }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(VERIFY_FAIL_WRONG_EVIDENCE);
        }
    }
    window.verifyGeorgeCorrelationWarehouse = verifyGeorgeCorrelationWarehouse;

    // Phase 7: Check for full schematic completion (8/8 nodes)
    function checkSchematicCompletion() {
        var s = gameState.state;
        var installed = s.installedNodes || [];
        if (installed.length < 8) return;
        var completionMsg = "Pattern match: 100%. Vernon... the station isn't just a salvage yard. It's a transmitter. George wasn't just talking to me; he was calibrating a return address.";
        otisLines.push({ role: 'otis', text: completionMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(completionMsg);
        checkDiaryUnlocksFinal();
        var transmitSection = document.getElementById('transmit-section');
        if (transmitSection) transmitSection.style.display = '';
        gameState._save(); gameState._updateUI();
    }
    window.checkSchematicCompletion = checkSchematicCompletion;

    // Phase 7: Trigger the Legacy ending
    function handleTransmit452b() {
        var s = gameState.state;
        if ((s.installedNodes || []).length < 8) return;
        if (s.endingTriggered) return;
        // BUG 15 fix: route through triggerEnding() so LEGACY uses the same
        // ending-screen render path as all other endings (restart/ack button
        // logic, {{token}} substitution, endingTriggered guard).
        var txMsg = 'Transmission sequence initiated. Signal locked to 452b.';
        otisLines.push({ role: 'otis', text: txMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(txMsg);
        gameState._save();
        setTimeout(function() {
            triggerEnding('LEGACY');
        }, 2000);
    }
    window.handleTransmit452b = handleTransmit452b;
