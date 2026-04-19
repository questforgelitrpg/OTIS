// OTIS upgrades subsystem — purchase handler, tier-effect getters, render. Extracted from index.html in Phase 11 of the monolith refactor.

    // ── UPGRADE HELPERS — centralized lookups, never scatter state.upgrades refs ──
    function getScannerBonus() {
        var t = ((gameState.state.upgrades)||{}).scanner||0;
        return [0, 0.08, 0.18, 0.30][t] || 0;
    }
    window.getScannerBonus = getScannerBonus;
    function getStorageCap() {
        var t = ((gameState.state.upgrades)||{}).storeroom||0;
        return 12 + ([0, 3, 7, 12][t] || 0);
    }
    window.getStorageCap = getStorageCap;
    function getJamRateMultiplier() {
        var t = ((gameState.state.upgrades)||{}).belt||0;
        return [1.0, 0.85, 0.70, 0.50][t] || 1.0;
    }
    window.getJamRateMultiplier = getJamRateMultiplier;
    function getDegradationMultiplier() {
        var t = ((gameState.state.upgrades)||{}).power||0;
        return [1.0, 0.90, 0.80, 0.67][t] || 1.0;
    }
    window.getDegradationMultiplier = getDegradationMultiplier;
    function getCommOrderCap() {
        var t = ((gameState.state.upgrades)||{}).comm||0;
        return [0, 3, 4, 5][t] || 0;
    }
    window.getCommOrderCap = getCommOrderCap;
    function getHullPatchFactor() {
        var t = ((gameState.state.upgrades)||{}).hull||0;
        return [1.0, 0.75, 0.50, 0.25][t] || 1.0;
    }
    window.getHullPatchFactor = getHullPatchFactor;
    function getCoolingBonus() {
        var t = ((gameState.state.upgrades)||{}).cooling||0;
        return [0, 0.15, 0.30, 0.50][t] || 0;
    }
    window.getCoolingBonus = getCoolingBonus;

    // Returns a multiplier applied to fatigue tier thresholds.
    // Based on cooling upgrade level — thematically: a better-cooled station keeps the operator sharper longer.
    // Tier I: +15%, Tier II: +30%, Tier III: +30% (capped at II for fatigue purposes)
    function getFatigueThresholdMultiplier() {
        var t = ((gameState.state.upgrades) || {}).cooling || 0;
        return t >= 2 ? 1.30 : t >= 1 ? 1.15 : 1.0;
    }
    window.getFatigueThresholdMultiplier = getFatigueThresholdMultiplier;

    // Returns a jam rate multiplier applied when fatigue is HIGH or CRITICAL.
    function getFatigueJamMultiplier() {
        var tier = window.getFatigueTier ? window.getFatigueTier() : 'NONE';
        if (tier === 'CRITICAL') return 1.75;
        if (tier === 'HIGH')     return 1.35;
        return 1.0;
    }
    window.getFatigueJamMultiplier = getFatigueJamMultiplier;

    // Returns a bot degradation multiplier applied when fatigue is HIGH or CRITICAL.
    function getFatigueDegradationMultiplier() {
        var tier = window.getFatigueTier ? window.getFatigueTier() : 'NONE';
        if (tier === 'CRITICAL') return 1.50;
        if (tier === 'HIGH')     return 1.25;
        return 1.0;
    }
    window.getFatigueDegradationMultiplier = getFatigueDegradationMultiplier;

    // Returns a belt slow factor applied to fetch/return durations at HIGH fatigue.
    function getFatigueBeltSlowFactor() {
        var tier = window.getFatigueTier ? window.getFatigueTier() : 'NONE';
        if (tier === 'CRITICAL') return 1.0; // belt is stopped at CRITICAL — this factor is moot
        if (tier === 'HIGH')     return 1.40; // 40% slower at HIGH
        return 1.0;
    }
    window.getFatigueBeltSlowFactor = getFatigueBeltSlowFactor;

    function renderUpgrades() {
        var el = document.getElementById('upgrades-list');
        if (!el) return;
        var upgrades = gameState.state.upgrades || {};
        var credits = gameState.state.credits || 0;
        el.innerHTML = UPGRADE_CATALOG.map(function(upg) {
            var tier = upgrades[upg.key] || 0;
            var tierLabel = tier === 0 ? 'NOT INSTALLED' : ('TIER ' + ['I','II','III'][tier-1] + ' / III');
            var nextTier = tier + 1;
            var canUpgrade = nextTier <= 3;
            var cost = canUpgrade ? upg.costs[nextTier - 1] : 0;
            var effectStr = tier > 0 ? upg.effects[tier - 1] : '—';
            var loreStr = tier < 3 ? upg.lore[tier] : upg.lore[2];
            var costHtml = canUpgrade
                ? '<div class="upgrade-cost">TIER ' + ['I','II','III'][nextTier-1] + ': ' + cost.toLocaleString() + ' cr'
                    + '<button style="margin-left:0.5rem;font-size:13px;padding:0.1rem 0.4rem;min-height:22px"'
                    + (credits < cost ? ' disabled' : '')
                    + ' onclick="handlePurchaseUpgrade(\'' + upg.key + '\')">'
                    + (credits < cost ? 'NEED ' + (cost - credits) + ' cr' : 'INSTALL')
                    + '</button></div>'
                : '<div class="upgrade-maxed">FULLY UPGRADED</div>';
            return '<div class="upgrade-entry">'
                + '<div class="upgrade-name">' + escapeHtml(upg.name) + '</div>'
                + '<div class="upgrade-tier">' + tierLabel + (tier > 0 ? ' — ' + escapeHtml(effectStr) : '') + '</div>'
                + '<div class="upgrade-lore">' + escapeHtml(loreStr) + '</div>'
                + costHtml
                + '</div>';
        }).join('');
    }
    window.renderUpgrades = renderUpgrades;

    function handlePurchaseUpgrade(key) {
        var s = gameState.state;
        if (!s.upgrades) s.upgrades = { scanner: 0, belt: 0, storeroom: 0, comm: 0, power: 0, hull: 0, cooling: 0 };
        var upg = UPGRADE_CATALOG.find(function(u) { return u.key === key; });
        if (!upg) return;
        var currentTier = s.upgrades[key] || 0;
        var nextTier = currentTier + 1;
        if (nextTier > 3) return;
        var cost = upg.costs[nextTier - 1];
        if (s.credits < cost) {
            var msg = 'Insufficient credits. ' + upg.name + ' Tier ' + ['I','II','III'][nextTier-1] + ': ' + cost.toLocaleString() + ' cr required.';
            otisLines.push({ role: 'otis', text: msg }); renderOTIS();
            return;
        }
        s.credits -= cost;
        s.upgrades[key] = nextTier;
        gameState._save();
        gameState._updateUI();
        renderUpgrades();
        var tierRoman = ['I','II','III'][nextTier-1];
        // LORE — installation acknowledgement
        var installLines = {
            scanner: 'Scanner Sensitivity upgraded to Tier ' + tierRoman + '. Detection range adjusted. George would have noted this in the maintenance log.',
            belt:    'Belt Governor upgraded to Tier ' + tierRoman + '. Jam probability reduced. George never got around to this. You did.',
            storeroom: 'Storeroom Expansion completed. Tier ' + tierRoman + '. George drew up those plans in year 11. The chalk is finally gone.',
            comm:    nextTier === 1
                ? 'Comm Boost Tier I installed. Standing Orders channel now active. NPCs can reach you directly. George had this. He used it constantly.'
                : 'Comm Boost upgraded to Tier ' + tierRoman + '. Order capacity increased. More channels open.',
            power:   'Power Regulator upgraded to Tier ' + tierRoman + '. Bot degradation rate reduced. George would have called this overdue.',
            hull:    'Hull Patch upgraded to Tier ' + tierRoman + '. Inspection penalty reduction active. George patched the rest. You patched the last section.',
            cooling: 'Cooling Loop upgraded to Tier ' + tierRoman + '. Bot thermal tolerance improved. The refrigeration unit George used is finally retired.',
        };
        var installMsg = installLines[key] || (upg.name + ' Tier ' + tierRoman + ' installed.');
        otisLines.push({ role: 'otis', text: installMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(installMsg);
        if (window.Achievements) Achievements.check();
    }
    window.handlePurchaseUpgrade = handlePurchaseUpgrade;
