// OTIS standing-orders subsystem — order offers, accept/decline, fulfillment tracking, render. Extracted from index.html in Phase 11 of the monolith refactor.

    // ── STANDING ORDERS ───────────────────────────────────────────────────────
    // Gated by Comm Boost Tier I. Arrive via COMMS with [STANDING ORDER] prefix.
    // Each order: { id, npc, desc, rewardCredits, rewardNote, expiresOnDay, accepted, requirementKey, requirementQty, fulfilled }

    // _orderIdCounter is initialized from gameState.state.nextOrderId in DOMContentLoaded
    // to survive page reloads. Mutate via _nextOrderId() only.
    function _nextOrderId() {
        var id = _orderIdCounter++;
        gameState.state.nextOrderId = _orderIdCounter;
        gameState._save();
        return id;
    }

    function checkStandingOrders() {
        var s = gameState.state;
        var cap = getCommOrderCap();
        if (cap === 0) return; // Comm Boost not installed
        if (!s.activeOrders) s.activeOrders = [];

        // Expire old orders; clean up side-effects
        s.activeOrders = s.activeOrders.filter(function(o) {
            if (s.day > o.expiresOnDay && !o.fulfilled) {
                var expMsg = '[STANDING ORDER EXPIRED] ' + o.npc + ': ' + o.desc.substring(0, 60) + '...';
                otisLines.push({ role: 'otis', text: expMsg }); renderOTIS();
                // Reset Sven interference when his rare refusal order expires
                if (o.requirementKey === 'svenRareRefusal' && o.accepted) {
                    s.svenRareRefusalActive = false;
                    s.svenInterferencePct = 20;
                }
                return false;
            }
            return true;
        });

        // Check fulfilment on active orders
        s.activeOrders.forEach(function(o) {
            if (o.fulfilled || o.requirementKey === 'svenRareRefusal') return;
            var fulfilled = checkOrderFulfilment(o, s);
            if (fulfilled) {
                o.fulfilled = true;
                applyOrderReward(o, s);
            }
        });

        // Possibly generate a new order
        if (s.activeOrders.length < cap && Math.random() < 0.5) {
            // Pick a template at random (avoid duplicating active npc/key combos)
            var activeKeys = s.activeOrders.map(function(o) { return o.requirementKey; });
            var available = STANDING_ORDER_TEMPLATES.filter(function(t) {
                return activeKeys.indexOf(t.requirementKey) === -1;
            });
            if (available.length > 0) {
                var tmpl = available[Math.floor(Math.random() * available.length)];
                var newOrder = {
                    id: _nextOrderId(),
                    npc: tmpl.npc,
                    desc: tmpl.makeDesc(s.day),
                    rewardCredits: tmpl.rewardCredits,
                    rewardNote: tmpl.rewardNote || '',
                    expiresOnDay: s.day + tmpl.durationDays,
                    accepted: !tmpl.hasAcceptDecline, // auto-accepted unless it has explicit accept/decline
                    requirementKey: tmpl.requirementKey,
                    requirementQty: tmpl.requirementQty,
                    fulfilled: false,
                    hasAcceptDecline: !!tmpl.hasAcceptDecline,
                    progressQty: 0,
                };
                s.activeOrders.push(newOrder);
                var soMsg = '[STANDING ORDER] ' + newOrder.desc + ' Expires: Day ' + newOrder.expiresOnDay + '.';
                if (newOrder.rewardNote) soMsg += ' Note: ' + newOrder.rewardNote + '.';
                otisLines.push({ role: 'otis', text: soMsg }); renderOTIS();
                if (window.OtisTTS) OtisTTS.speak('[STANDING ORDER] ' + newOrder.npc + ' — ' + newOrder.desc.substring(0, 60));
                setLight('light-comms', 'light-amber');
            }
        }

        gameState._save();
        renderActiveOrders();
    }
    window.checkStandingOrders = checkStandingOrders;

    function checkOrderFulfilment(order, s) {
        var key = order.requirementKey;
        if (key === 'allBotsNominal') {
            return (s.bots || []).every(function(b) { return b.status === 'NOMINAL'; });
        }
        if (key === 'processedItems') {
            return (order.progressQty || 0) >= order.requirementQty;
        }
        if (key === 'settlementItems' || key === 'vesselItems' || key === 'industrialItems' || key === 'anomalousItem') {
            return (order.progressQty || 0) >= order.requirementQty;
        }
        return false;
    }
    window.checkOrderFulfilment = checkOrderFulfilment;

    function applyOrderReward(order, s) {
        var rewardMsg = '[STANDING ORDER COMPLETE] ' + order.npc + ': ' + order.desc.substring(0, 50) + '...';
        if (order.rewardCredits > 0) {
            if (order.rewardNote && order.rewardNote.indexOf('arrears') !== -1) {
                s.outstandingDebt = Math.max(0, (s.outstandingDebt || 0) - order.rewardCredits);
                rewardMsg += ' ' + order.rewardCredits + ' cr arrears waived.';
            } else if (order.rewardNote && order.rewardNote.indexOf('debt') !== -1) {
                s.debt = Math.max(0, (s.debt || 0) - order.rewardCredits);
                rewardMsg += ' ' + order.rewardCredits + ' cr debt reduction.';
            } else {
                s.credits = (s.credits || 0) + order.rewardCredits;
                rewardMsg += ' +' + order.rewardCredits + ' cr.';
            }
        }
        otisLines.push({ role: 'otis', text: rewardMsg }); renderOTIS();
        if (window.OtisTTS) OtisTTS.speak(rewardMsg);
        gameState._save();
        gameState._updateUI();
    }
    window.applyOrderReward = applyOrderReward;

    function handleAcceptStandingOrder(orderId) {
        var s = gameState.state;
        var order = (s.activeOrders || []).find(function(o) { return o.id === orderId; });
        if (!order) return;
        order.accepted = true;
        if (order.requirementKey === 'svenRareRefusal') {
            // Drop interference; complicity is tracked when Rare items are actually routed to Sven
            s.svenInterferencePct = 5;
            s.svenRareRefusalActive = true;
            s.svenRareRefusalExpiresDay = order.expiresOnDay;
            // LORE
            var acceptMsg = '[STANDING ORDER ACCEPTED] Sven: First refusal on Rares active. Interference at 5% for 7 days. Route Rare items to Sven this cycle to honour the deal. George never made this agreement. He said the interference was the honest version of the relationship.';
            otisLines.push({ role: 'otis', text: acceptMsg }); renderOTIS();
            if (window.OtisTTS) OtisTTS.speak(acceptMsg);
        }
        gameState._save();
        renderActiveOrders();
    }
    window.handleAcceptStandingOrder = handleAcceptStandingOrder;

    function handleDeclineStandingOrder(orderId) {
        var s = gameState.state;
        s.activeOrders = (s.activeOrders || []).filter(function(o) { return o.id !== orderId; });
        // LORE
        var declineMsg = 'Standing order declined. Sven will note it. George used to say no to him once a month on principle. I do not know if it helped.';
        otisLines.push({ role: 'otis', text: declineMsg }); renderOTIS();
        gameState._save();
        renderActiveOrders();
    }
    window.handleDeclineStandingOrder = handleDeclineStandingOrder;

    function recordOrderProgress(category, rarity) {
        var s = gameState.state;
        if (!s.activeOrders) return;
        s.activeOrders.forEach(function(o) {
            if (o.fulfilled || !o.accepted) return;
            var key = o.requirementKey;
            var matched = false;
            if (key === 'settlementItems' && category === 'Settlement') matched = true;
            if (key === 'vesselItems' && category === 'Vessel') matched = true;
            if (key === 'industrialItems' && category === 'Industrial') matched = true;
            if (key === 'anomalousItem' && rarity === 'Anomalous') matched = true;
            if (key === 'processedItems') matched = true;
            if (matched) {
                o.progressQty = (o.progressQty || 0) + 1;
                if (checkOrderFulfilment(o, s)) {
                    o.fulfilled = true;
                    applyOrderReward(o, s);
                }
            }
        });
        gameState._save();
        renderActiveOrders();
    }
    window.recordOrderProgress = recordOrderProgress;

    function renderActiveOrders() {
        var section = document.getElementById('active-orders-section');
        var list = document.getElementById('active-orders-list');
        if (!section || !list) return;
        var s = gameState.state;
        var cap = getCommOrderCap();
        if (cap === 0) { section.style.display = 'none'; return; }
        var orders = (s.activeOrders || []).filter(function(o) { return !o.fulfilled; });
        section.style.display = '';
        if (orders.length === 0) {
            list.innerHTML = '<p class="zone-hint">No active orders.</p>';
            return;
        }
        list.innerHTML = orders.map(function(o) {
            var daysLeft = Math.max(0, o.expiresOnDay - s.day);
            var progressStr = (o.requirementQty > 1)
                ? ' [' + (o.progressQty || 0) + '/' + o.requirementQty + ']'
                : '';
            var actionsHtml = '';
            if (o.hasAcceptDecline && !o.accepted) {
                actionsHtml = '<div class="so-actions">'
                    + '<button onclick="handleAcceptStandingOrder(' + o.id + ')">ACCEPT</button>'
                    + '<button class="btn-warn" onclick="handleDeclineStandingOrder(' + o.id + ')">DECLINE</button>'
                    + '</div>';
            }
            return '<div class="standing-order-entry">'
                + '<div class="so-header">[STANDING ORDER] ' + escapeHtml(o.npc) + '</div>'
                + '<div class="so-desc">' + escapeHtml(o.desc) + progressStr + '</div>'
                + '<div class="so-meta">Reward: ' + (o.rewardCredits > 0 ? o.rewardCredits + ' cr' : '') + (o.rewardNote ? ' ' + escapeHtml(o.rewardNote) : '') + ' — Expires Day ' + o.expiresOnDay + ' (' + daysLeft + 'd)</div>'
                + actionsHtml
                + '</div>';
        }).join('');
    }
    window.renderActiveOrders = renderActiveOrders;
