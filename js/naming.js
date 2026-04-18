// OTIS naming subsystem — tier progression and OTIS name lookup. Extracted from index.html in Phase 12 of the monolith refactor.
// NOTE: NAMING_TIERS is duplicated in otis.js. Cross-file dedupe is Phase 13 cleanup.

    function recalculateNamingTier() {
        var s = gameState.state;
        var dup = (s.daysUntilPayment != null) ? s.daysUntilPayment : TIMING.PAYMENT_CYCLE_DAYS;
        var arrears = s.outstandingDebt || 0;
        var skips = s.skipCount || 0;
        var reserves = s.reserveSuccesses || 0;
        var missed = s.missedPayments || 0;

        var target = 0;
        if (reserves >= 3) target = 1;
        if (reserves >= 6) target = 2;
        if (reserves >= 10) target = 3;

        if (skips >= 5) target = Math.max(0, target - 1);
        if (dup <= 2) target = Math.max(0, target - 1);
        if (arrears > 500) target = Math.max(0, target - 1);
        if (missed >= 1) target = Math.max(0, target - 2);
        if (missed >= 2) target = 0;

        target = Math.max(0, Math.min(NAMING_TIERS.length - 1, target));
        if (target !== s.namingTier) {
            s.namingTier = target;
            gameState._save();
            gameState._updateUI();
        }
    }
    window.recalculateNamingTier = recalculateNamingTier;
