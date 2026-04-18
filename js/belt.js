// OTIS belt / drop / declaration subsystem — extracted from index.html in Phase 5 of the monolith refactor.

    function buildManifestSummary(manifest) {
        if (gameState.state.day === 1) {
            return "First intake. Four items. Common origin. Belt is running. Examine each one. George had a method. Worth learning before diverging from it.";
        }
        var n = manifest.length;
        var cats = {};
        manifest.forEach(function(i) { cats[i.category] = (cats[i.category] || 0) + 1; });
        var catList = Object.keys(cats).map(function(c) { return c + '(' + cats[c] + ')'; }).join(', ');
        var rec = getOTISPickRecommendation();
        var recNote = rec ? ' Your ' + rec.category + ' trend continues.' : '';
        var choice = gameState.state.pickListChoice || {};
        var pickNote = (choice.mode !== 'DROP' || choice.category)
            ? ' Pick list: ' + choice.mode + (choice.category ? ' ' + choice.category : '') + '.' : '';
        return 'Barge inbound. ' + n + ' items. Categories: ' + catList + '.' + pickNote + recNote;
    }

    function renderManifestSummary(manifest) {
        var panel = document.getElementById('manifest-category-bars');
        var empty = document.getElementById('manifest-summary-empty');
        if (!panel) return;
        if (!manifest || !manifest.length) {
            panel.innerHTML = '';
            if (empty) empty.style.display = '';
            return;
        }
        if (empty) empty.style.display = 'none';
        var cats = {};
        manifest.forEach(function(i) { cats[i.category] = (cats[i.category] || 0) + 1; });
        var total = manifest.length;
        panel.innerHTML = PICK_CATEGORIES.filter(function(c) { return cats[c]; }).map(function(cat) {
            var n = cats[cat];
            var pct = Math.round((n / total) * 100);
            var barWidth = Math.max(4, Math.round((n / total) * MANIFEST_BAR_MAX_PX));
            return '<div style="margin-bottom:0.35rem">' +
                '<div style="display:flex;justify-content:space-between;font-size:14px">' +
                '<span>' + cat.toUpperCase() + '</span>' +
                '<span style="color:var(--text-dim)">' + n + ' (' + pct + '%)</span>' +
                '</div>' +
                '<div class="manifest-cat-bar-track">' +
                '<div class="manifest-cat-bar-fill" style="width:' + barWidth + 'px"></div>' +
                '</div></div>';
        }).join('');
    }

    window.buildManifestSummary = buildManifestSummary;
    window.renderManifestSummary = renderManifestSummary;

    function getEffectiveValue(item) {
        if (item.rarity === 'Anomalous') return 0;
        var raw = Math.floor((item.otisValue || 0) * (CONDITION_MULTIPLIERS[item.condition] || 1.0));
        var cap = RARITY_CREDIT_CAPS[item.rarity];
        return (cap != null) ? Math.min(raw, cap) : raw;
    }
    window.getEffectiveValue = getEffectiveValue;

    function getBeltMs() { return getBotDeliveryMs(); }
    function startBeltDelivery() { if (beltTimer) return; beltTimer = setInterval(deliverNextBeltItem, getBeltMs()); }
    function stopBeltDelivery()  { clearInterval(beltTimer); beltTimer = null; }
    window.getBeltMs = getBeltMs;
    window.startBeltDelivery = startBeltDelivery;
    window.stopBeltDelivery = stopBeltDelivery;

    function assignCondition() { var r = Math.random(); return r < 0.15 ? 'Broken' : r < 0.50 ? 'Poor' : r < 0.85 ? 'Used' : 'Excellent'; }
    window.assignCondition = assignCondition;

    function deliverNextBeltItem() {
        if (!gameState.state.dropActive) { stopBeltDelivery(); return; }
        if (gameState.state.manifestItems.length === 0) {
            stopBeltDelivery();
            gameState.state.dropActive = false;
            gameState.state.bargeActive = false;
            gameState.state.dropItemsRemaining = 0;
            gameState.state.dropCount = (gameState.state.dropCount || 0) + 1;
            // Track scrap fill per drop
            var s0 = gameState.state;
            s0.lastDropFillPct = (s0.dropStartSize||0) > 0 ? Math.round(((s0.currentDropScrapped||0) / s0.dropStartSize) * 100) : 0;
            s0.currentDropScrapped = 0;
            s0.dropStartSize = 0;
            checkActProgression();
            gameState.state.pickListChoice = { mode: 'DROP', category: null };
            gameState._save();
            updateBeltUI('DROP_COMPLETE');
            setBotDots(false);
            showBotAnimation(3000);
            if (window.OtisSound) OtisSound.stopAmbient('conveyor');
            renderPickList();
            renderManifestSummary([]);
            var daysLeft = (gameState.state.daysUntilNextDrop != null)
                ? gameState.state.daysUntilNextDrop : TIMING.DAYS_BETWEEN_DROPS;
            narratorLine(DROP_COMPLETE_POOL, { DAYS: daysLeft });
            AnimWindow.startBotsReturn();
            onDropCompleteBotDegradation();
            rollConveyorJam();
            checkEasterEgg();
            maybeSvenInterference();
            return;
        }
        if (currentItem !== null) {
            updateBeltUI('BACKED_UP');
            var backed = gameState.state.manifestItems.length;
            var overflowWarn = document.getElementById('storeroom-overflow-warning');
            var overflowCount = document.getElementById('overflow-count');
            if (overflowWarn) overflowWarn.style.display = backed >= TIMING.OVERFLOW_THRESHOLD ? '' : 'none';
            if (overflowCount) overflowCount.textContent = backed;
            return;
        }
        var item = gameState.state.manifestItems.shift();
        item.condition = assignCondition();
        gameState.state.dropItemsRemaining = gameState.state.manifestItems.length;
        gameState._save();
        setItemInQueue(item);
        updateBeltUI('DELIVERING');
        var s = gameState.state;
        var deliveryCount = s.deliveryCount = (s.deliveryCount || 0) + 1;
        if (deliveryCount % 7 === 0) fireOtisSideComment();
        if (window.innerWidth <= 600) openModal('belt');
    }

    window.deliverNextBeltItem = deliverNextBeltItem;

    function handleBeltScan() { deliverNextBeltItem(); }
    window.handleBeltScan = handleBeltScan;

    function fireOtisSideComment() {
        var s = gameState.state;
        var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        var tier = s.namingTier || 0;
        var keeps = (s.keepLog || []).length;
        var drops = s.dropCount || 0;
        var msgs;
        if (dup <= 3) {
            msgs = [
                'Payment in ' + dup + ' days. Belt is not moving fast enough.',
                'Three days. George always had something in the queue by now.',
                'The bank does not send reminders. They send receivers.',
            ];
        } else if (keeps >= 8) {
            msgs = [
                'Keep log is heavy. ' + keeps + ' items. George capped at seven.',
                'You are keeping a lot. George said that is either instinct or sentiment.',
                'The keep log does not pay the debt. Just noting that.',
            ];
        } else if (tier >= 2) {
            msgs = [
                "George cleared this in under a minute on day one. You're faster now.",
                "Belt running. That's what matters.",
                "You're getting George's rhythm. I'm noting that whether you want me to or not.",
            ];
        } else if (drops >= 5 && s.skipCount > drops) {
            // Operator has skipped GEORGE consults more times than drops completed
            msgs = [
                "You've been skipping more than consulting. That's your call.",
                "George consulted on everything. I'm not saying you're wrong.",
                "The George Archive is there. You don't have to use it.",
            ];
        } else {
            msgs = [
                'Belt running.',
                'Intake nominal.',
                'George had an opinion about this one. You didn\'t ask.',
                'The moon does not care about your backlog.',
                'Running nominal. Barely.',
                'Station holding.',
            ];
        }
        if ((s.brokerBin||[]).length >= 8) {
            msgs = [
                'Broker bin at ' + s.brokerBin.length + '. Ship now at 88% or wait for full.',
                'Eight items. Two more and you get full value. Or ship now.',
                'Broker bin getting heavy. Payment is in ' + dup + ' days.',
            ];
        }
        if ((s.mayBin||[]).length >= 8) {
            msgs = [
                'May bin has ' + s.mayBin.length + ' items. Dispatch alongside scrap.',
                'May bin is ready whenever you are. She pays full.',
            ];
        }
        var sideMsg = msgs[Math.floor(Math.random() * msgs.length)];
        otisLines.push({ role: 'otis', text: sideMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(sideMsg);
    }

    window.fireOtisSideComment = fireOtisSideComment;

    var _dropShuffledPool = [];
    var _dropShuffleIndex = 0;

    function shuffleDropPool(pickChoice) {
        var nonRare = MANIFEST_POOL.filter(function(i) { return i.rarity !== 'Rare'; });
        var rareItems = MANIFEST_POOL.filter(function(i) { return i.rarity === 'Rare'; });
        // Include each Rare item with base 25% probability + scanner bonus to adjust drop frequency.
        var rareReduced = rareItems.filter(function() { return Math.random() < (0.25 + getScannerBonus()); });
        var pool = nonRare.concat(rareReduced);
        // Fallback: if all Rare items were filtered out and there are no non-Rare items, use full pool.
        if (!pool.length) pool = MANIFEST_POOL.slice();
        if (pickChoice && pickChoice.mode === 'DOUBLE_WEIGHT' && pickChoice.category) {
            var extras = MANIFEST_POOL.filter(function(i) { return i.category === pickChoice.category; });
            pool = pool.concat(extras);
        }
        if (pickChoice && pickChoice.mode === 'PRIORITIZE') {
            var high = MANIFEST_POOL.filter(function(i) { return i.rarity === 'Rare' || i.rarity === 'Uncommon'; });
            pool = pool.concat(high);
        }
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
        }
        if (pickChoice && pickChoice.mode === 'DROP' && pickChoice.category) {
            var filtered = pool.filter(function(i) { return i.category !== pickChoice.category; });
            if (filtered.length) pool = filtered;
        }
        _dropShuffledPool = pool;
        _dropShuffleIndex = 0;
    }

    function weightedPickItem() {
        if (_dropShuffleIndex >= _dropShuffledPool.length) {
            var s = gameState.state;
            shuffleDropPool(s.confirmedPickChoice || s.pickListChoice || {});
        }
        if (!_dropShuffledPool.length) { return Object.assign({}, MANIFEST_POOL[Math.floor(Math.random() * MANIFEST_POOL.length)]); }
        var item = _dropShuffledPool[_dropShuffleIndex++];
        return Object.assign({}, item);
    }
    window.shuffleDropPool = shuffleDropPool;
    window.weightedPickItem = weightedPickItem;


    // ── Animation Window ─────────────────────────────────────────────────────
    var AnimWindow = (function() {
      var BARGE_ART = '                                                               —                          \n                                                              ›—                          \n                                                             ›—{— ›                       \n                                                             ›—íz{í—                    › \n                                                           ›{{{íí———————{——›››          { \n                                                        ›{íí{ííííííííí› › ›››››{›››››—›\n                                                  {ííí› ———{——›———›—————————— —{  › ›› ›››\n                ›{ › —›—              —{Ï{—{   ——{{{————————————{————{—  ››—›››{ ››—›› ›››\n                        ›—›{—{›—›—{{›››—z{{ {í{—{—íí{{———››› ›› › ›› — ›       {      ›   \n   ››——››—›——í{——{—››—›››í{—{{{{{{{{{{{{{{{›{{{í——{{í——››› ›››  ››—›—{ ›      ›í— ›› ›  — \n           ———››› —  ›    ›{›{z{{Ï{íí{Ï{{z{ {—z—í——í{í——››{{——{—{{—{  ›      —››——  ›—  \n           ›   ›› —  ›  ›› {›{íí{{{íí{{ííí{—{——{›———{›—{››› —{ííííííz››› ›  ›››—››  —   \n                › ››——››› —› —              {› › —› › —        ›——{{{—         {››—— —    \n                   {{—                                         — ›—› ›     › ››           \n                    —                                          ›››››                      \n                                                               ›{›—                       \n                                                                ——›                       \n                                                                 ›                        ';

      var BOT_ART = '                             .#@@@@@@@@@@@@@-                                             \n                              :%+  .=-  .*#=@=                                             \n                              .%+.#@+*@=.**=%=                                             \n                              .%+:## .@*.**=%=                                             \n                              :%=  +%%:  *#=%=                                             \n                              :%%********%@%@=                                             \n                                ....%@+@=....                                              \n                                    %@-%-                                                  \n                                    %@-%:                                                  \n                                    %@-%-                                          .       \n     --                             %@*@=                                       .*@%%-     \n     .*%=                        :#%*=-+#%=                  *%%%%%%%%+       .*@*.:#@%-   \n :.    :#@-                     :%+      -%+                .#*     .#*     :*%+ :#@+=%@%= \n +@+.    #@                :%@%@@@@%%%@@@@@@@@@@@%%@@@@%%%@@@@@@%@@@@@@@@@@@@*.:#%=-#%=.+@#\n   *%+. :@%                -@-  .:.                :-:                     =%+#%==%%- -#%= \n    :+#%#*@*.              -@= +%#%%:            -%#+%%          :%@@@@@%. =@%==%%- -#%-   \n           *@+             -@=-@* -@+          .=%@+.*@#-        .++****+. =@*%%- -#%-     \n            :*%=           +@@%+*%#=        :*%%=::+*+:-*@*-      :::::::  =@#- =%%-       \n              :#%-      :*%@@=          .=#@#-.           -#%*-::.         =%--%%-         \n                -%%: :*%#- -@=.    ..:+%@*=:.   ....   .... .*@#+@*.....   =@@#:           \n                  =@@#-    .#####%@@@%#####################@@@@- *@@@%######*:             \n                    .     .=#-:+%@*:               =#-. .+%%=.-##*::+%%+. .=*-             \n                      -+%@#+%*%@%*-           =+%@#***%@@%=          .+@@@#*#*%@#==        \n                     :@@-       =@%:         :@@=       =@%.         =@@:       +@@.       \n                    .@*    -=:   .#%        :@*    -=:    *#:       -%+    -=:    %%       \n                    *%:  -%#-#%:  -@+       #@   :%#=%@   :@+      .*%.  :@#=#%:  .@+      \n                    #%:  -@+.*%:  :%*      .%@   -@+:#@.  -@+      .#%:  :@*:#%.  :@*      \n                    .@+    +#+.   *@.       -@+   .+*=   .*%:       -@=    +*=    #@:      \n                     -@%-       =@@.         =@%:       :@%-         -@%.       =@@.       \n                      +#@@*=*=*@@#=           *#@@*=++#@@#=           +#@@*=+=#@@*+        \n                          :+@*:                   :*@=.                   :+%+:            ';
      var BOT_ART_LINES  = BOT_ART.split('\n');
      var BOT_SPINNER    = ['|','/','-','\\'];
      var BOT_SPIN_SET   = {'=':1,'-':1,'*':1,'+':1,':':1,'/':1,'\\':1};
      var BOT_LINE_HEIGHT  = 1.05;
      var BOT_SPIN_START   = 22; // lines 0-21 are head/body; legs start at line 22

      function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

      var _spinFrame = 0;
      var _spinTimer = null;
      var _botEls    = [];

      function _spinBots() {
        _spinFrame++;
        var spinChar = BOT_SPINNER[_spinFrame % 4];
        var spun = BOT_ART_LINES.map(function(line, i) {
          if (i < BOT_SPIN_START) return line;
          var out = '';
          for (var c = 0; c < line.length; c++) {
            out += BOT_SPIN_SET[line[c]] ? spinChar : line[c];
          }
          return out;
        }).join('\n');
        for (var b = 0; b < _botEls.length; b++) { _botEls[b].textContent = spun; }
      }

      var _clearTimer = null;
      var _botsOutboundTimer = null;

      function _clearTimers() {
        if (_clearTimer) { clearTimeout(_clearTimer); _clearTimer = null; }
        if (_botsOutboundTimer) { clearTimeout(_botsOutboundTimer); _botsOutboundTimer = null; }
      }

      function _clearBots() {
        if (_spinTimer) { clearInterval(_spinTimer); _spinTimer = null; }
        _botEls = [];
        var layer = document.getElementById('anim-bots-layer');
        if (layer) layer.innerHTML = '';
      }

      function _buildBotRows(direction) {
        var layer = document.getElementById('anim-bots-layer');
        if (!layer) return;
        _clearBots();
        var lineCount = BOT_ART_LINES.length;
        var windowH   = 120; // always size for the non-maze base height
        var fontSize  = Math.max(2, windowH / (lineCount * BOT_LINE_HEIGHT));
        var botCount  = 3;
        var animDur   = 14;
        for (var r = 0; r < botCount; r++) {
          var el = document.createElement('pre');
          el.className = 'anim-bot-row ' + direction;
          el.style.top        = '50%';
          el.style.fontSize   = fontSize + 'px';
          el.style.lineHeight = BOT_LINE_HEIGHT.toString();
          el.style.margin     = '0';
          el.style.padding    = '0';
          el.style.animationDuration = animDur + 's';
          el.style.animationDelay   = (-r * (animDur / botCount)) + 's';
          el.textContent = BOT_ART;
          layer.appendChild(el);
          _botEls.push(el);
        }
        _spinFrame = 0;
        _spinBots();
        _spinTimer = setInterval(_spinBots, 100);
      }

      function startBargeSequence() {
        _clearTimers();
        if (window.mazePause) window.mazePause();
        var bargeEl = document.getElementById('anim-barge');
        if (!bargeEl) return;
        _clearBots();
        bargeEl.textContent = BARGE_ART;
        bargeEl.classList.remove('running');
        void bargeEl.offsetWidth;
        bargeEl.classList.add('running');

        _botsOutboundTimer = setTimeout(function() {
          bargeEl.classList.remove('running');
          bargeEl.textContent = '';
          _buildBotRows('outbound');
          if (window.OtisSound) OtisSound.startAmbient('bots');
        }, 3500);
      }

      function startBotsReturn() {
        _clearTimers();
        if (window.mazePause) window.mazePause();
        var bargeEl = document.getElementById('anim-barge');
        if (bargeEl) { bargeEl.classList.remove('running'); bargeEl.textContent = ''; }
        if (window.OtisSound) {
          OtisSound.stopAmbient('bots');
          OtisSound.playSFX('bots');
        }
        _buildBotRows('returning');
        _clearTimer = setTimeout(function() { clear(); }, 8000);
      }

      function clear() {
        _clearTimers();
        _clearBots();
        var bargeEl = document.getElementById('anim-barge');
        if (bargeEl) { bargeEl.classList.remove('running'); bargeEl.textContent = ''; }
        if (window.OtisSound) OtisSound.stopAmbient('bots');
        if (window.mazeResume) window.mazeResume();
      }

      return { startBargeSequence: startBargeSequence, startBotsReturn: startBotsReturn, clear: clear };
    }());
    window.AnimWindow = AnimWindow;

    function handleBargeArrival() {
        if (gameState.state.dropActive) return;
        // BUG 14 fix: call checkActProgression() BEFORE reading the act so that the
        // very first Act-3 barge uses Act-3 drop sizes (26–32 items) rather than
        // Act-2 sizes.  checkActProgression() is idempotent when the act hasn't
        // changed, so calling it here is safe.
        checkActProgression();
        // Lock immediately to prevent double-firing during the staged delay windows
        gameState.state.dropActive = true;
        // Build manifest synchronously so data is ready when belt eventually starts
        var manifest = [];
        if (gameState.state.day === 1) {
            // Day 1 scripted drop: 4 Common items, all Used condition, no easter eggs
            var commonPool = MANIFEST_POOL.filter(function(i) {
                return i.rarity === 'Common';
            });
            for (var si = commonPool.length - 1; si > 0; si--) {
                var sj = Math.floor(Math.random() * (si + 1));
                var st = commonPool[si]; commonPool[si] = commonPool[sj]; commonPool[sj] = st;
            }
            manifest = commonPool.slice(0, 4).map(function(i) {
                return Object.assign({}, i, { condition: 'Used' });
            });
        } else {
            var act = gameState.state.act;
            var count;
            if (act === 1) count = TIMING.DROP_SIZE_ACT1;
            else if (act === 2) count = TIMING.DROP_SIZE_ACT2_MIN + Math.floor(Math.random() * (TIMING.DROP_SIZE_ACT2_MAX - TIMING.DROP_SIZE_ACT2_MIN + 1));
            else count = TIMING.DROP_SIZE_ACT3_MIN + Math.floor(Math.random() * (TIMING.DROP_SIZE_ACT3_MAX - TIMING.DROP_SIZE_ACT3_MIN + 1));
            var s2 = gameState.state;
            shuffleDropPool(s2.confirmedPickChoice || s2.pickListChoice || {});
            for (var k = 0; k < count; k++) manifest.push(weightedPickItem());
            // 10% chance to append one easter egg item to the drop
            if (Math.random() < 0.10) {
                var eeItem = Object.assign({}, EASTER_EGG_POOL[Math.floor(Math.random() * EASTER_EGG_POOL.length)]);
                manifest.push(eeItem);
            }
        }
        gameState.state.manifestItems = manifest.slice();
        gameState.state.bargeActive = true;
        gameState.state.dropItemsRemaining = manifest.length;
        gameState.state.dropStartSize = manifest.length;
        gameState.state.currentDropScrapped = 0;
        gameState._save();

        // Stage 1 — wait 3 s, then play bargedrop sound + show OTIS manifest summary
        setTimeout(function() {
            if (window.OtisSound) OtisSound.playSFX('bargedrop');
            AnimWindow.startBargeSequence();
            var bargeSummary = buildManifestSummary(manifest);
            // Append pick list status so OTIS can comment on whether Vernon confirmed it
            var confirmed = gameState.state.confirmedPickChoice;
            if (confirmed && confirmed.mode !== 'DROP') {
                bargeSummary += ' Pick list confirmed: ' + confirmed.mode
                    + (confirmed.category ? ' / ' + confirmed.category : '') + '.';
            } else {
                bargeSummary += ' No pick list confirmed for this drop.';
            }
            appendOTIS(bargeSummary, 'BARGE_IMMINENT');
            renderManifestSummary(manifest);

            // Stage 2 — wait 2 s, then deploy bots
            setTimeout(function() {
                var scanBtn = document.getElementById('btn-scan-belt');
                if (scanBtn) scanBtn.disabled = false;
                setBotDots(true);
                showBotAnimation(4000);
                renderPickList();

                // Stage 3 — wait 2 s, then start belt
                setTimeout(function() {
                    updateBeltUI('DELIVERING');
                    startBeltDelivery();
                    deliverNextBeltItem();
                }, 2000);
            }, 2000);
        }, 3000);
    }

    window.handleBargeArrival = handleBargeArrival;

    // Pull the next available item from the storeroom buffer onto the belt.
    function handlePullNextStoreroomItem() {
        var s = gameState.state;
        if (!s.storeroomBuffer || s.storeroomBuffer.length === 0) return;
        if (currentItem !== null) return;
        handlePullFromBuffer(0);
        _updatePullStoreroomBtn();
    }

    // Sync the pull-storeroom button state to current buffer / belt state.
    function _updatePullStoreroomBtn() {
        var btn = document.getElementById('btn-pull-storeroom');
        if (!btn) return;
        var buf = (gameState.state.storeroomBuffer || []).length;
        btn.disabled = (buf === 0 || currentItem !== null);
    }

    function setBotDots(active) {
        ['bot-dot-1','bot-dot-2','bot-dot-3','sys-bot-dot-1','sys-bot-dot-2','sys-bot-dot-3'].forEach(function(id) {
            var d = document.getElementById(id); if (d) d.className = 'dot' + (active ? ' amber' : '');
        });
        if (window.OtisSound) {
            if (active) OtisSound.startAmbient('bots');
            else OtisSound.stopAmbient('bots');
        }
    }

    window.handlePullNextStoreroomItem = handlePullNextStoreroomItem;
    window._updatePullStoreroomBtn = _updatePullStoreroomBtn;
    window.setBotDots = setBotDots;

    function showBotAnimation(durationMs) {
        var panel = document.getElementById('arm-bot-anim');
        if (!panel) return;
        panel.style.display = '';
        setTimeout(function() { panel.style.display = 'none'; }, durationMs);
    }
    window.showBotAnimation = showBotAnimation;

    // ITEM QUEUE UI
    function setItemInQueue(item) {
        currentItem = Object.assign({}, item, { consultedExamine: false, consultedWorth: false, consultedGeorge: false });
        gameState.state.itemDisplayedAt = Date.now();
        gameState.state.beltJammed = false;
        renderItemQueue();
        _updatePullStoreroomBtn();
    }
    function clearItemQueue() { currentItem = null; renderItemQueue(); _updatePullStoreroomBtn(); }

    function renderItemQueue() {
        var emptyEl = document.getElementById('item-queue-empty');
        var present = document.getElementById('item-queue-present');
        var nameEl  = document.getElementById('item-queue-name');
        var tagsEl  = document.getElementById('item-tags');
        var estEl   = document.getElementById('otis-estimate');
        var declEl  = document.getElementById('item-declaration');
        if (currentItem) {
            if (emptyEl) emptyEl.style.display = 'none';
            if (present) present.style.display = '';
            if (nameEl)  nameEl.textContent = currentItem.name;
            if (tagsEl) {
                var rc = { Common:'tag-common', Uncommon:'tag-uncommon', Rare:'tag-rare', Anomalous:'tag-anomalous' };
                tagsEl.innerHTML =
                    '<span class="tag tag-common">' + escapeHtml(currentItem.category) + '</span> ' +
                    '<span class="tag ' + (rc[currentItem.rarity]||'tag-common') + '">' + escapeHtml(currentItem.rarity) + '</span> ' +
                    '<span class="tag tag-common">' + escapeHtml(currentItem.condition) + '</span>';
            }
            if (estEl) {
                if (currentItem.consultedWorth) {
                    var isUnk = getEffectiveValue(currentItem) === 0 && (currentItem.rarity === 'Anomalous' || currentItem.category === 'Unknown');
                    estEl.textContent = isUnk ? 'OTIS ESTIMATE: ERROR \u2014 NO COMPARABLE' : 'OTIS ESTIMATE: ' + getEffectiveValue(currentItem) + ' cr';
                    estEl.style.display = '';
                } else estEl.style.display = 'none';
            }
            var any = currentItem.consultedExamine || currentItem.consultedWorth || currentItem.consultedGeorge;
            if (declEl) declEl.style.display = any ? 'flex' : 'none';
            var cc = { 'cc-examine': 'consultedExamine', 'cc-george': 'consultedGeorge' };
            Object.keys(cc).forEach(function(id) { var b = document.getElementById(id); if (b) b.classList.toggle('consulted', !!currentItem[cc[id]]); });
            // Easter egg ASCII art for belt items
            var artEl = document.getElementById('item-queue-ascii');
            if (artEl) {
                if (currentItem.asciiFile) {
                    artEl.textContent = '[ART PENDING]';
                    var safeColor = /^#[0-9a-fA-F]{3,8}$/.test(currentItem.asciiColor) ? currentItem.asciiColor : '';
                    artEl.style.color = safeColor;
                    artEl.style.display = '';
                    fetch(currentItem.asciiFile).then(function(r){return r.text();}).then(function(txt){
                        if (artEl) artEl.textContent = txt;
                    }).catch(function(){
                        if (artEl) artEl.textContent = '[ART PENDING]';
                    });
                } else {
                    artEl.style.display = 'none';
                }
            }
            // Bin button state management
            if (currentItem) {
                var itemCat = currentItem.category;
                var itemRar = currentItem.rarity;
                var s = gameState.state;
                var mayBtn    = document.getElementById('btn-to-may');
                var brokerBtn = document.getElementById('btn-to-broker');
                var svenBtn   = document.getElementById('btn-to-sven');
                if (mayBtn) {
                    var mayOk = (itemCat === 'Civilian' || itemCat === 'Settlement');
                    mayBtn.disabled = !mayOk || (s.mayBin||[]).length >= 12;
                    mayBtn.title = mayOk ? 'May bin: ' + (s.mayBin||[]).length + '/12' : 'May only takes Civilian and Settlement';
                }
                if (brokerBtn) {
                    brokerBtn.disabled = (s.brokerBin||[]).length >= 10;
                    brokerBtn.title = 'Broker bin: ' + (s.brokerBin||[]).length + '/10';
                }
                if (svenBtn) {
                    var svenOk = (itemRar === 'Rare' || itemRar === 'Anomalous');
                    svenBtn.disabled = !svenOk || (s.svenBin||[]).length >= 3;
                    svenBtn.title = svenOk ? 'Sven bin: ' + (s.svenBin||[]).length + '/3 \u2014 auto-ships at 2' : 'Sven only takes Rare and Anomalous';
                }
            }
        } else {
            if (emptyEl) emptyEl.style.display = '';
            if (present) present.style.display = 'none';
            if (declEl)  declEl.style.display = 'none';
        }
        updateModuleLights();
    }

    window.setItemInQueue = setItemInQueue;
    window.clearItemQueue = clearItemQueue;
    window.renderItemQueue = renderItemQueue;

    function buildItemContext(item) {
        if (!item) return '';
        var ev = getEffectiveValue(item);
        var est = (ev === 0 && (item.rarity === 'Anomalous' || item.category === 'Unknown'))
            ? 'OTIS estimate: ERROR \u2014 NO COMPARABLE.' : 'OTIS estimate: ' + ev + ' cr (condition: ' + (item.condition || 'Used') + ').';
        return 'Item: ' + item.name + '. Category: ' + item.category + '. Rarity: ' + item.rarity + '. Condition: ' + item.condition + '. ' + est;
    }
    window.buildItemContext = buildItemContext;

    function handleSkip() {
        if (!currentItem) return;
        gameState.state.skipCount = (gameState.state.skipCount || 0) + 1;
        gameState.state.beltJammed = false;
        gameState.state.itemDisplayedAt = null;
        gameState._save();
        var declEl = document.getElementById('item-declaration'); if (declEl) declEl.style.display = 'flex';
        var n = gameState.state.skipCount;
        var tierMsg = null;
        if (n === 7) tierMsg = SKIP_TIER_MSGS[7];
        else if (n === 5) tierMsg = SKIP_TIER_MSGS[5];
        else if (n === 3) tierMsg = SKIP_TIER_MSGS[3];
        var msg = tierMsg || SKIP_SHORTS[Math.floor(Math.random() * SKIP_SHORTS.length)];
        if (tierMsg) {
            appendOTIS(msg, 'ITEM_SCAN');
        } else {
            otisLines.push({ role: 'otis', text: msg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(msg);
        }
    }
    window.handleSkip = handleSkip;

    // NOTE: handleConsult and handleConsultMerged are intentionally separate.
    // - handleConsult(trigger) — used by GEORGE ARCHIVE path; always hits the API
    // - handleConsultMerged() — used by EXAMINE & VALUE path; short-circuits Common rarity to a hardcoded line
    // They share the consultedExamine/consultedWorth flags but follow different prompt paths.
    // Do not merge — the Common-rarity short-circuit is a deliberate cost optimization.
    function handleConsult(trigger) {
        if (!currentItem) return;
        var ctx = buildItemContext(currentItem);
        if (trigger === 'CONSULT_GEORGE') currentItem.consultedGeorge = true;
        renderItemQueue();
        if (trigger === 'CONSULT_GEORGE') {
            var georgeCtx = '[GEORGE ARCHIVE REQUEST] ' + ctx
                + ' Vernon is asking specifically what George knew about this type of item.'
                + ' Surface a specific memory, method, or comparable — not general knowledge.';
            appendOTIS(georgeCtx, 'CONSULT_GEORGE');
        } else {
            appendOTIS(ctx, trigger);
        }
        if (gameState.state.tutorialStep === 2) tutorialAdvance();
    }
    window.handleConsult = handleConsult;

    function handleConsultMerged() {
        if (!currentItem) return;
        currentItem.consultedExamine = true;
        currentItem.consultedWorth = true;
        renderItemQueue();
        if (gameState.state.tutorialStep === 2) tutorialAdvance();

        // Common items: no API call — display hardcoded assessment
        if (currentItem.rarity === 'Common') {
            var ev = getEffectiveValue(currentItem);
            var condNote = currentItem.condition !== 'Used'
                ? ' ' + currentItem.condition + ' condition.'
                : '';
            var msg = currentItem.category + '. Common salvage.' + condNote
                + ' OTIS estimate: ' + ev + ' credits.';
            otisLines.push({ role: 'otis', text: msg });
            renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(msg);
            return;
        }

        // Uncommon, Rare, Anomalous, George items — full API call
        appendOTIS(buildItemContext(currentItem), 'CONSULT_EXAMINE');
    }

    window.handleConsultMerged = handleConsultMerged;

    var SCRAP_SHORTS = ['Canned.','Logged.','Processed.','To May.','Binned.','Filed as scrap.'];

    function handleDeclare(method) {
        if (!currentItem) return;
        var item = currentItem;
        var ctx  = buildItemContext(item);
        var ev   = getEffectiveValue(item);
        var eeMultiplier = item.easterEgg ? 3 : 1;
        // Advance tutorial step 3 before item processing
        if (gameState.state.tutorialStep === 3) tutorialAdvance();
        // Clear belt jam state on any player declaration
        gameState.state.beltJammed = false;
        gameState.state.itemDisplayedAt = null;
        var jamWarn = document.getElementById('conveyor-jam-warning');
        var jamClr  = document.getElementById('conveyor-jam-clear');
        if (jamWarn) jamWarn.style.display = 'none';
        if (jamClr)  jamClr.style.display  = 'none';
        // Phase 5: George item sell / scrap protection
        var isSellOrScrap = (method === 'MAY_BIN' || method === 'BROKER_BIN' || method === 'SVEN_BIN' || method === 'SCRAP');
        if (isSellOrScrap && item.targetNodeID) {
            var _gwItem = null;
            for (var _gi = 0; _gi < GEORGE_WAREHOUSE.length; _gi++) {
                if (GEORGE_WAREHOUSE[_gi].targetNodeID === item.targetNodeID) { _gwItem = GEORGE_WAREHOUSE[_gi]; break; }
            }
            if (_gwItem && (gameState.state.installedNodes || []).indexOf(item.targetNodeID) === -1) {
                var _confirmSell = window.confirm('OTIS: This item is required for the Master Integration Schematic. Selling it will permanently disable one station node. Proceed?');
                if (!_confirmSell) return;
                // Mark node as permanently offline
                var _failedNodes = gameState.state.failedNodes || [];
                if (_failedNodes.indexOf(item.targetNodeID) === -1) {
                    _failedNodes.push(item.targetNodeID);
                    gameState.state.failedNodes = _failedNodes;
                }
                // OTIS item sold dialogue
                var _soldItemName = item.name;
                setTimeout(function() {
                    var _sm = 'You sold the ' + _soldItemName + ' for credits? George spent years waiting for that to arrive. I hope the debt payment was worth the silence.';
                    otisLines.push({ role: 'otis', text: _sm }); renderOTIS();
                    if (window.OtisTTS) OtisTTS.speak(_sm);
                    renderSchematic();
                }, 500);
            }
        }
        if (method === 'MAY_BIN') {
            var allowed = (item.category === 'Civilian' || item.category === 'Settlement');
            if (!allowed) {
                var wrongMsg = item.name.substring(0,22) + ' \u2014 May only takes Civilian and Settlement.';
                otisLines.push({ role:'otis', text: wrongMsg }); renderOTIS();
                return;
            }
            var mayBin = gameState.state.mayBin || [];
            if (mayBin.length >= 12) {
                var fullMsg = 'May bin at capacity. Ship before sorting more.';
                otisLines.push({ role:'otis', text: fullMsg }); renderOTIS();
                return;
            }
            mayBin.push({ name: item.name, category: item.category, rarity: item.rarity, condition: item.condition, otisValue: item.otisValue, addedDay: gameState.state.day });
            gameState.state.mayBin = mayBin;
            gameState._save();
            trackOTISLearning('SELL', item);
            clearItemQueue();
            renderBinPanel();
            recordOrderProgress(item.category, item.rarity);
            var binMsg = item.name.substring(0,22) + ' to May bin. ' + mayBin.length + '/12.';
            otisLines.push({ role:'otis', text: binMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(binMsg);
        } else if (method === 'BROKER_BIN') {
            var brokerBin = gameState.state.brokerBin || [];
            if (brokerBin.length >= 10) {
                var bfMsg = 'Broker bin at capacity. Ship before sorting more.';
                otisLines.push({ role:'otis', text: bfMsg }); renderOTIS();
                return;
            }
            brokerBin.push({ name: item.name, category: item.category, rarity: item.rarity, condition: item.condition, otisValue: item.otisValue, addedDay: gameState.state.day, eeMultiplier: item.easterEgg ? 3 : 1 });
            gameState.state.brokerBin = brokerBin;
            gameState._save();
            trackOTISLearning('SELL', item);
            clearItemQueue();
            renderBinPanel();
            recordOrderProgress(item.category, item.rarity);
            var bbMsg = item.name.substring(0,22) + ' to broker. ' + brokerBin.length + '/10.';
            otisLines.push({ role:'otis', text: bbMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(bbMsg);
        } else if (method === 'SVEN_BIN') {
            var allowedSven = (item.rarity === 'Rare' || item.rarity === 'Anomalous');
            if (!allowedSven) {
                var swMsg = 'Sven only takes Rare and Anomalous. This is ' + item.rarity + '.';
                otisLines.push({ role:'otis', text: swMsg }); renderOTIS();
                return;
            }
            var svenBin = gameState.state.svenBin || [];
            if (svenBin.length >= 3) {
                var sfMsg = 'Sven bin full. He pays when it hits 2 \u2014 it should have shipped.';
                otisLines.push({ role:'otis', text: sfMsg }); renderOTIS();
                return;
            }
            var svenValue = Math.floor(getEffectiveValue(item) * 0.65);
            if (item.rarity === 'Anomalous') {
                svenValue = Math.floor((Math.random() * (TIMING.ANOMALOUS_RESERVE_MAX - TIMING.ANOMALOUS_RESERVE_MIN) + TIMING.ANOMALOUS_RESERVE_MIN) * 0.65);
            }
            // Sven rare refusal standing order: track complicity when routing Rare items to Sven
            if (item.rarity === 'Rare' && gameState.state.svenRareRefusalActive) {
                gameState.state.svenComplicity = (gameState.state.svenComplicity || 0) + 1;
            }
            svenBin.push({ name: item.name, category: item.category, rarity: item.rarity, condition: item.condition, otisValue: item.otisValue, svenValue: svenValue, addedDay: gameState.state.day });
            gameState.state.svenBin = svenBin;
            gameState._save();
            trackOTISLearning('SELL', item);
            clearItemQueue();
            renderBinPanel();
            recordOrderProgress(item.category, item.rarity);
            var svMsg = item.name.substring(0,22) + ' to Sven. His offer: ' + svenValue + ' cr. Bin: ' + svenBin.length + '/3.';
            otisLines.push({ role:'otis', text: svMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(svMsg);
            // Auto-pay when bin reaches 2 items
            if (svenBin.length >= 2) {
                setTimeout(handleSvenBinShip, 1500);
            }
        } else if (method === 'KEEP') {
            var _keepEntry = { name: item.name, day: gameState.state.day, keepDay: gameState.state.day, condition: item.condition, otisValue: item.otisValue, baseValue: item.otisValue, category: item.category, rarity: item.rarity };
            if (item.targetNodeID) _keepEntry.targetNodeID = item.targetNodeID;
            if (item.evidenceID)   _keepEntry.evidenceID   = item.evidenceID;
            gameState.state.keepLog.push(_keepEntry);
            gameState.state.keepLog = gameState.state.keepLog.slice(0, getStorageCap());
            // Humanity archive tracking
            if (item.category === 'Civilian' || item.category === 'Settlement') {
                gameState.state.humanityArchive = (gameState.state.humanityArchive || 0) + 1;
                gameState.state.humanityLog = gameState.state.humanityLog || [];
                if (gameState.state.humanityLog.length < 50) {
                    gameState.state.humanityLog.push(item.name.substring(0, 30));
                }
            }
            gameState._save();
            trackOTISLearning('KEEP', item);
            clearItemQueue();
            var kn = gameState.state.keepLog.length;
            if (kn >= getStorageCap() - 2) {
                narratorLine(DECLARE_KEEP_FULL_POOL, { N: kn });
            } else {
                // Skip the last 2 entries (George-reference lines) for low keep counts
                var keepPool = DECLARE_KEEP_POOL.slice(0, -2);
                var keepMsg = keepPool[Math.floor(Math.random() * keepPool.length)]
                    .replace('{N}', kn);
                keepMsg = item.name.substring(0, 22) + '. ' + keepMsg;
                otisLines.push({ role: 'otis', text: keepMsg }); renderOTIS();
                if (window.OtisTTS) OtisTTS.speak(keepMsg);
            }
        } else if (method === 'SCRAP') {
            gameState.state.scrapFill = Math.min(100, (gameState.state.scrapFill || 0) + 12);
            gameState.state.currentDropScrapped = (gameState.state.currentDropScrapped || 0) + 1;
            gameState._save();
            trackOTISLearning('SCRAP', item);
            clearItemQueue();
            recordOrderProgress(item.category, item.rarity);
            var msg = SCRAP_SHORTS[Math.floor(Math.random() * SCRAP_SHORTS.length)];
            otisLines.push({ role: 'otis', text: msg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(msg);
        }
        gameState._updateUI();
        // B3 — SCRAP_HEAP ending: track George item sells and civilian/settlement scraps.
        var _isSell = (method === 'MAY_BIN' || method === 'BROKER_BIN' || method === 'SVEN_BIN');
        if (_isSell && item.targetNodeID) {
            var _gs = gameState.state;
            _gs.georgeItemsSold = (_gs.georgeItemsSold || 0) + 1;
            gameState._save();
            if (_gs.georgeItemsSold > 5 && (_gs.civilianScrapped || 0) > 50 && !_gs.endingTriggered) {
                setTimeout(function() { triggerEnding('SCRAP_HEAP'); }, 500);
            }
        }
        if (method === 'SCRAP' && (item.category === 'Civilian' || item.category === 'Settlement')) {
            var _cs = gameState.state;
            _cs.civilianScrapped = (_cs.civilianScrapped || 0) + 1;
            gameState._save();
            if ((_cs.georgeItemsSold || 0) > 5 && _cs.civilianScrapped > 50 && !_cs.endingTriggered) {
                setTimeout(function() { triggerEnding('SCRAP_HEAP'); }, 500);
            }
        }
        // B1/B4 — McGuffin no longer goes on the visible belt; it auto-sells via
        // spawnMcGuffin().  The old in-belt mcguffin resolution branch is removed.
    }
    window.handleDeclare = handleDeclare;

    function handleRouteToStoreroom() {
        var s = gameState.state;
        var toBuffer = s.manifestItems.splice(0, TIMING.BUFFER_ROUTE_COUNT);
        toBuffer.forEach(function(item) {
            item.condition = assignCondition();
            s.storeroomBuffer.push(item);
        });
        s.dropItemsRemaining = s.manifestItems.length;
        gameState._save();
        gameState._updateUI();
        renderStoreroomBuffer();
        var warn = document.getElementById('storeroom-overflow-warning');
        if (warn) warn.style.display = 'none';
        var rsMsg = 'Routing items to storeroom buffer. ' + s.storeroomBuffer.length + ' held.';
        otisLines.push({ role: 'otis', text: rsMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(rsMsg);
    }
    window.handleRouteToStoreroom = handleRouteToStoreroom;

    function handlePullFromBuffer(index) {
        var s = gameState.state;
        if (!s.storeroomBuffer || !s.storeroomBuffer[index]) return;
        if (currentItem !== null) return; // only one item at a time — belt must be clear first
        var item = s.storeroomBuffer.splice(index, 1)[0];
        setItemInQueue(item);
        gameState._save();
        renderStoreroomBuffer();
        gameState._updateUI();
    }

    // BOT DEGRADATION
    window.handlePullFromBuffer = handlePullFromBuffer;

    function getBotDeliveryMs() {
        var base = TIMING.DEBUG_FAST_MODE ? Math.floor(TIMING.BELT_DELIVERY_MS / TIMING.DEBUG_SPEED_MULTIPLIER) : TIMING.BELT_DELIVERY_MS;
        var bots = gameState.state.bots || [];
        var hasRed = bots.some(function(b) { return b.status === 'RED'; });
        var hasOffline = bots.some(function(b) { return b.status === 'OFFLINE'; });
        if (hasOffline) return Math.floor(base * 2.0);
        if (hasRed) return Math.floor(base * 1.5);
        return base;
    }

    window.getBotDeliveryMs = getBotDeliveryMs;

    function rollConveyorJam() {
        gameState.state.dropsSinceLastJam = (gameState.state.dropsSinceLastJam || 0) + 1;
        if (gameState.state.dropsSinceLastJam < 3) return;
        if (Math.random() >= 0.15 * getJamRateMultiplier()) return;
        gameState.state.dropsSinceLastJam = 0;
        gameState.state.conveyorJammed = true;
        gameState.state.daysUntilNextDrop = (gameState.state.daysUntilNextDrop || TIMING.DAYS_BETWEEN_DROPS) + 1;
        gameState._save();
        var warn = document.getElementById('conveyor-jam-warning');
        var clr  = document.getElementById('conveyor-jam-clear');
        if (warn) warn.style.display = '';
        if (clr)  clr.style.display  = '';
        var jamMsg = 'Conveyor jam. Belt stalled.';
        otisLines.push({ role: 'otis', text: jamMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(jamMsg);
    }

    function checkBeltJam() {
        var s = gameState.state;
        if (!currentItem) return;
        if ((s.manifestItems || []).length < 3) return;
        if (!s.itemDisplayedAt) return;
        if (Date.now() - s.itemDisplayedAt < 30000) return;
        if (s.beltJammed) return;
        s.beltJammed = true;
        gameState._save();
        var backMsg = 'Belt backed up. Clear the queue.';
        otisLines.push({ role: 'otis', text: backMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(backMsg);
        updateArmSprite('CONVEYOR_JAM');
        setLight('light-belt', 'light-amber');
        var w = document.getElementById('conveyor-jam-warning');
        var b = document.getElementById('conveyor-jam-clear');
        if (w) w.style.display = '';
        if (b) b.style.display = '';
    }

    function handleClearJam() {
        gameState.state.conveyorJammed = false;
        gameState.state.beltJammed = false;
        gameState.state.itemDisplayedAt = null;
        gameState._save();
        var warn = document.getElementById('conveyor-jam-warning');
        var clr  = document.getElementById('conveyor-jam-clear');
        if (warn) warn.style.display = 'none';
        if (clr)  clr.style.display  = 'none';
        var clearMsg = 'Jam cleared. Belt running.';
        otisLines.push({ role: 'otis', text: clearMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(clearMsg);
        updateBeltUI(gameState.state.dropActive ? 'DELIVERING' : 'CLEAR');
    }
    window.rollConveyorJam = rollConveyorJam;
    window.checkBeltJam = checkBeltJam;
    window.handleClearJam = handleClearJam;

    function setPickMode(mode) {
        var s = gameState.state;
        if (!s.pickListChoice) s.pickListChoice = { mode: 'DROP', category: null };
        s.pickListChoice.mode = mode;
        gameState._save();
        renderPickList();
    }
    window.setPickMode = setPickMode;

    function getAppraisedValue(keepItem) {
        var base = keepItem.baseValue || keepItem.otisValue || 0;
        if (keepItem.rarity === 'Anomalous' || base === 0) return base;
        var daysHeld = Math.max(0, (gameState.state.day || 1) - (keepItem.keepDay || keepItem.day || 1));
        var mult = Math.pow(1.02, daysHeld);
        return Math.floor(base * mult * (CONDITION_MULTIPLIERS[keepItem.condition] || 1.0));
    }
    window.getAppraisedValue = getAppraisedValue;
