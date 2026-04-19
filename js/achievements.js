// OTIS Achievements module — definitions, unlock checks, modal rendering, toast notifications.
// Exposed as window.Achievements (IIFE pattern matching other modules).

(function () {

    // ─── ACHIEVEMENT DEFINITIONS ─────────────────────────────────────────────
    // Each achievement: { id, section, name, desc, progress(state), unlocked(state) }
    // progress returns { current, target } — used for display only.
    // unlocked returns bool — canonical unlock test.

    var ACHIEVEMENTS = [

        // ── A. Belt / Scanning ────────────────────────────────────────────────
        { id: 'scan_first',  section: 'Belt / Scanning',  name: 'First Scan',
          desc: 'Scan your first item on the belt.',
          progress: function(s) { return { current: Math.min(s.itemsScannedTotal||0, 1), target: 1 }; },
          unlocked: function(s) { return (s.itemsScannedTotal||0) >= 1; } },
        { id: 'scan_25',     section: 'Belt / Scanning',  name: 'Operator',
          desc: 'Scan 25 items.',
          progress: function(s) { return { current: Math.min(s.itemsScannedTotal||0, 25), target: 25 }; },
          unlocked: function(s) { return (s.itemsScannedTotal||0) >= 25; } },
        { id: 'scan_100',    section: 'Belt / Scanning',  name: 'Veteran',
          desc: 'Scan 100 items.',
          progress: function(s) { return { current: Math.min(s.itemsScannedTotal||0, 100), target: 100 }; },
          unlocked: function(s) { return (s.itemsScannedTotal||0) >= 100; } },
        { id: 'scan_500',    section: 'Belt / Scanning',  name: "George's Pace",
          desc: 'Scan 500 items.',
          progress: function(s) { return { current: Math.min(s.itemsScannedTotal||0, 500), target: 500 }; },
          unlocked: function(s) { return (s.itemsScannedTotal||0) >= 500; } },

        // ── B. George's Warehouse ─────────────────────────────────────────────
        { id: 'gw_first_find', section: "George's Warehouse", name: 'First Find',
          desc: 'Discover the first item in the warehouse.',
          progress: function(s) { return { current: Math.min((s.georgeWarehouseFound||[]).length, 1), target: 1 }; },
          unlocked: function(s) { return (s.georgeWarehouseFound||[]).length >= 1; } },
        { id: 'gw_half',     section: "George's Warehouse", name: 'Halfway',
          desc: 'Find 4 warehouse items.',
          progress: function(s) { return { current: Math.min((s.georgeWarehouseFound||[]).length, 4), target: 4 }; },
          unlocked: function(s) { return (s.georgeWarehouseFound||[]).length >= 4; } },
        { id: 'gw_all',      section: "George's Warehouse", name: 'Catalogued',
          desc: 'Find all 8 warehouse items.',
          progress: function(s) { return { current: Math.min((s.georgeWarehouseFound||[]).length, 8), target: 8 }; },
          unlocked: function(s) { return (s.georgeWarehouseFound||[]).length >= 8; } },
        { id: 'gw_first_move', section: "George's Warehouse", name: 'Vernon Inherits',
          desc: 'Move 1 item from the warehouse to the belt.',
          progress: function(s) { return { current: Math.min((s.georgeWarehouseSold||[]).length, 1), target: 1 }; },
          unlocked: function(s) { return (s.georgeWarehouseSold||[]).length >= 1; } },
        { id: 'gw_all_moved', section: "George's Warehouse", name: 'Cleared the Back Section',
          desc: 'Move all 8 warehouse items to the belt.',
          progress: function(s) { return { current: Math.min((s.georgeWarehouseSold||[]).length, 8), target: 8 }; },
          unlocked: function(s) { return (s.georgeWarehouseSold||[]).length >= 8; } },

        // ── C. Easter Eggs ────────────────────────────────────────────────────
        { id: 'ee_first',    section: 'Easter Eggs', name: 'Unlisted Find',
          desc: 'Find your first easter egg item.',
          progress: function(s) { return { current: Math.min(s.easterEggsFoundTotal||0, 1), target: 1 }; },
          unlocked: function(s) { return (s.easterEggsFoundTotal||0) >= 1; } },
        { id: 'ee_3',        section: 'Easter Eggs', name: 'Pop-Culture Curator',
          desc: 'Find 3 easter egg items.',
          progress: function(s) { return { current: Math.min(s.easterEggsFoundTotal||0, 3), target: 3 }; },
          unlocked: function(s) { return (s.easterEggsFoundTotal||0) >= 3; } },
        { id: 'ee_7',        section: 'Easter Eggs', name: 'Collector',
          desc: 'Find 7 easter egg items.',
          progress: function(s) { return { current: Math.min(s.easterEggsFoundTotal||0, 7), target: 7 }; },
          unlocked: function(s) { return (s.easterEggsFoundTotal||0) >= 7; } },
        { id: 'ee_all',      section: 'Easter Eggs', name: 'Pool Cleared',
          desc: 'Find every easter egg in the pool.',
          progress: function(s) {
              var total = window.EASTER_EGG_POOL ? EASTER_EGG_POOL.length : 21;
              return { current: Math.min(s.easterEggsFoundTotal||0, total), target: total };
          },
          unlocked: function(s) {
              var total = window.EASTER_EGG_POOL ? EASTER_EGG_POOL.length : 21;
              return (s.easterEggsFoundTotal||0) >= total;
          } },

        // ── D. George's Diary ─────────────────────────────────────────────────
        { id: 'dia_first',   section: "George's Diary", name: 'First Page',
          desc: 'Unlock the first diary entry.',
          progress: function(s) { return { current: Math.min((s.georgesDiaryFound||[]).length, 1), target: 1 }; },
          unlocked: function(s) { return (s.georgesDiaryFound||[]).length >= 1; } },
        { id: 'dia_5',       section: "George's Diary", name: 'Five Entries',
          desc: 'Unlock 5 diary entries.',
          progress: function(s) { return { current: Math.min((s.georgesDiaryFound||[]).length, 5), target: 5 }; },
          unlocked: function(s) { return (s.georgesDiaryFound||[]).length >= 5; } },
        { id: 'dia_half',    section: "George's Diary", name: 'Halfway',
          desc: 'Unlock 14 diary entries.',
          progress: function(s) { return { current: Math.min((s.georgesDiaryFound||[]).length, 14), target: 14 }; },
          unlocked: function(s) { return (s.georgesDiaryFound||[]).length >= 14; } },
        { id: 'dia_year14',  section: "George's Diary", name: 'Year 14',
          desc: 'Unlock diary entry 15.',
          progress: function(s) {
              var found = s.georgesDiaryFound || [];
              return { current: found.indexOf(15) !== -1 ? 1 : 0, target: 1 };
          },
          unlocked: function(s) { return (s.georgesDiaryFound||[]).indexOf(15) !== -1; } },
        { id: 'dia_all',     section: "George's Diary", name: 'The Whole Diary',
          desc: 'Unlock all 28 diary entries.',
          progress: function(s) { return { current: Math.min((s.georgesDiaryFound||[]).length, 28), target: 28 }; },
          unlocked: function(s) { return (s.georgesDiaryFound||[]).length >= 28; } },

        // ── E. Standing Orders ────────────────────────────────────────────────
        { id: 'ord_first',   section: 'Standing Orders', name: 'First Order',
          desc: 'Complete your first standing order.',
          progress: function(s) { return { current: Math.min(s.ordersCompletedTotal||0, 1), target: 1 }; },
          unlocked: function(s) { return (s.ordersCompletedTotal||0) >= 1; } },
        { id: 'ord_5',       section: 'Standing Orders', name: 'Reliable',
          desc: 'Complete 5 standing orders.',
          progress: function(s) { return { current: Math.min(s.ordersCompletedTotal||0, 5), target: 5 }; },
          unlocked: function(s) { return (s.ordersCompletedTotal||0) >= 5; } },
        { id: 'ord_15',      section: 'Standing Orders', name: 'Trusted Operator',
          desc: 'Complete 15 standing orders.',
          progress: function(s) { return { current: Math.min(s.ordersCompletedTotal||0, 15), target: 15 }; },
          unlocked: function(s) { return (s.ordersCompletedTotal||0) >= 15; } },
        { id: 'ord_30',      section: 'Standing Orders', name: 'Fixer',
          desc: 'Complete 30 standing orders.',
          progress: function(s) { return { current: Math.min(s.ordersCompletedTotal||0, 30), target: 30 }; },
          unlocked: function(s) { return (s.ordersCompletedTotal||0) >= 30; } },

        // ── F. Upgrades ───────────────────────────────────────────────────────
        { id: 'up_first',    section: 'Station Upgrades', name: 'First Install',
          desc: 'Install any upgrade tier.',
          progress: function(s) {
              var ups = s.upgrades || {};
              var any = Object.keys(ups).some(function(k) { return ups[k] >= 1; }) ? 1 : 0;
              return { current: any, target: 1 };
          },
          unlocked: function(s) {
              var ups = s.upgrades || {};
              return Object.keys(ups).some(function(k) { return ups[k] >= 1; });
          } },
        { id: 'up_one_each', section: 'Station Upgrades', name: 'One of Each',
          desc: 'Install at least Tier I in every upgrade category.',
          progress: function(s) {
              var ups = s.upgrades || {};
              var keys = ['scanner','belt','storeroom','comm','power','hull','cooling'];
              var done = keys.filter(function(k) { return (ups[k]||0) >= 1; }).length;
              return { current: done, target: keys.length };
          },
          unlocked: function(s) {
              var ups = s.upgrades || {};
              var keys = ['scanner','belt','storeroom','comm','power','hull','cooling'];
              return keys.every(function(k) { return (ups[k]||0) >= 1; });
          } },
        { id: 'up_half',     section: 'Station Upgrades', name: 'Half Maxed',
          desc: 'Reach a combined upgrade tier sum of 10 or more.',
          progress: function(s) {
              var ups = s.upgrades || {};
              var sum = Object.keys(ups).reduce(function(a,k) { return a + (ups[k]||0); }, 0);
              return { current: Math.min(sum, 10), target: 10 };
          },
          unlocked: function(s) {
              var ups = s.upgrades || {};
              return Object.keys(ups).reduce(function(a,k) { return a + (ups[k]||0); }, 0) >= 10;
          } },
        { id: 'up_full',     section: 'Station Upgrades', name: 'Fully Outfitted',
          desc: 'Max out all 7 upgrade categories to Tier III.',
          progress: function(s) {
              var ups = s.upgrades || {};
              var sum = Object.keys(ups).reduce(function(a,k) { return a + (ups[k]||0); }, 0);
              return { current: Math.min(sum, 21), target: 21 };
          },
          unlocked: function(s) {
              var ups = s.upgrades || {};
              var keys = ['scanner','belt','storeroom','comm','power','hull','cooling'];
              return keys.every(function(k) { return (ups[k]||0) === 3; });
          } },
        { id: 'up_comm1',    section: 'Station Upgrades', name: 'Standing Orders Online',
          desc: 'Install Comm Boost Tier I.',
          progress: function(s) { return { current: Math.min((s.upgrades||{}).comm||0, 1), target: 1 }; },
          unlocked: function(s) { return ((s.upgrades||{}).comm||0) >= 1; } },
        { id: 'up_power3',   section: 'Station Upgrades', name: 'Power III',
          desc: 'Upgrade Power Regulator to Tier III.',
          progress: function(s) { return { current: Math.min((s.upgrades||{}).power||0, 3), target: 3 }; },
          unlocked: function(s) { return ((s.upgrades||{}).power||0) >= 3; } },
        { id: 'up_hull3',    section: 'Station Upgrades', name: 'Hull III',
          desc: 'Upgrade Hull Patch to Tier III.',
          progress: function(s) { return { current: Math.min((s.upgrades||{}).hull||0, 3), target: 3 }; },
          unlocked: function(s) { return ((s.upgrades||{}).hull||0) >= 3; } },
        { id: 'up_cool3',    section: 'Station Upgrades', name: 'Cooling III',
          desc: 'Upgrade Cooling Loop to Tier III.',
          progress: function(s) { return { current: Math.min((s.upgrades||{}).cooling||0, 3), target: 3 }; },
          unlocked: function(s) { return ((s.upgrades||{}).cooling||0) >= 3; } },

        // ── G. Endings ────────────────────────────────────────────────────────
        { id: 'end_first',   section: 'Endings', name: 'First Ending',
          desc: 'Reach any ending.',
          progress: function(s) { return { current: Math.min((s.endingsSeen||[]).length, 1), target: 1 }; },
          unlocked: function(s) { return (s.endingsSeen||[]).length >= 1; } },
        { id: 'end_3',       section: 'Endings', name: 'Three Paths',
          desc: 'Reach 3 different endings.',
          progress: function(s) { return { current: Math.min((s.endingsSeen||[]).length, 3), target: 3 }; },
          unlocked: function(s) { return (s.endingsSeen||[]).length >= 3; } },
        { id: 'end_5',       section: 'Endings', name: 'Five Paths',
          desc: 'Reach 5 different endings.',
          progress: function(s) { return { current: Math.min((s.endingsSeen||[]).length, 5), target: 5 }; },
          unlocked: function(s) { return (s.endingsSeen||[]).length >= 5; } },
        { id: 'end_legacy',  section: 'Endings', name: 'Return Address',
          desc: 'Reach the LEGACY ending.',
          progress: function(s) {
              return { current: (s.endingsSeen||[]).indexOf('LEGACY') !== -1 ? 1 : 0, target: 1 };
          },
          unlocked: function(s) { return (s.endingsSeen||[]).indexOf('LEGACY') !== -1; } },
        { id: 'end_maze_master', section: 'Endings', name: 'Hidden Win',
          desc: 'Reach the MAZE_MASTER ending.',
          progress: function(s) {
              return { current: (s.endingsSeen||[]).indexOf('MAZE_MASTER') !== -1 ? 1 : 0, target: 1 };
          },
          unlocked: function(s) { return (s.endingsSeen||[]).indexOf('MAZE_MASTER') !== -1; } },
        { id: 'end_all',     section: 'Endings', name: 'All Endings',
          desc: 'Reach all 8 endings.',
          progress: function(s) { return { current: Math.min((s.endingsSeen||[]).length, 8), target: 8 }; },
          unlocked: function(s) { return (s.endingsSeen||[]).length >= 8; } },

        // ── H. Maze ───────────────────────────────────────────────────────────
        { id: 'maze_first',  section: 'Maze', name: 'First Maze',
          desc: 'Complete your first maze.',
          progress: function(s) { return { current: Math.min(s.mazesCompletedTotal||0, 1), target: 1 }; },
          unlocked: function(s) { return (s.mazesCompletedTotal||0) >= 1; } },
        { id: 'maze_20',     section: 'Maze', name: 'Egg Reward',
          desc: 'Complete 20 mazes.',
          progress: function(s) { return { current: Math.min(s.mazesCompletedTotal||0, 20), target: 20 }; },
          unlocked: function(s) { return (s.mazesCompletedTotal||0) >= 20; } },
        { id: 'maze_42',     section: 'Maze', name: 'Forty-Two',
          desc: 'Complete 42 mazes.',
          progress: function(s) { return { current: Math.min(s.mazesCompletedTotal||0, 42), target: 42 }; },
          unlocked: function(s) { return (s.mazesCompletedTotal||0) >= 42; } },
        { id: 'maze_64',     section: 'Maze', name: 'Sixty-Four',
          desc: 'Complete 64 mazes.',
          progress: function(s) { return { current: Math.min(s.mazesCompletedTotal||0, 64), target: 64 }; },
          unlocked: function(s) { return (s.mazesCompletedTotal||0) >= 64; } },
        { id: 'maze_102',    section: 'Maze', name: '102',
          desc: 'Complete 102 mazes.',
          progress: function(s) { return { current: Math.min(s.mazesCompletedTotal||0, 102), target: 102 }; },
          unlocked: function(s) { return (s.mazesCompletedTotal||0) >= 102; } },
        { id: 'maze_master', section: 'Maze', name: 'Maze Master',
          desc: 'Complete 103 mazes.',
          progress: function(s) { return { current: Math.min(s.mazesCompletedTotal||0, 103), target: 103 }; },
          unlocked: function(s) { return (s.mazesCompletedTotal||0) >= 103; } },

        // ── I. Buttons ────────────────────────────────────────────────────────
        { id: 'btn_5',       section: 'Buttons', name: 'Just Pushing Buttons',
          desc: 'Press 5 distinct tracked buttons.',
          progress: function(s) {
              var pressed = Object.keys(s.buttonsPressed||{}).filter(function(k) { return (s.buttonsPressed||{})[k]; }).length;
              return { current: Math.min(pressed, 5), target: 5 };
          },
          unlocked: function(s) {
              return Object.keys(s.buttonsPressed||{}).filter(function(k) { return (s.buttonsPressed||{})[k]; }).length >= 5;
          } },
        { id: 'btn_15',      section: 'Buttons', name: 'Curious Operator',
          desc: 'Press 15 distinct tracked buttons.',
          progress: function(s) {
              var pressed = Object.keys(s.buttonsPressed||{}).filter(function(k) { return (s.buttonsPressed||{})[k]; }).length;
              return { current: Math.min(pressed, 15), target: 15 };
          },
          unlocked: function(s) {
              return Object.keys(s.buttonsPressed||{}).filter(function(k) { return (s.buttonsPressed||{})[k]; }).length >= 15;
          } },
        { id: 'btn_all',     section: 'Buttons', name: 'Press Every Button',
          desc: 'Press every button in the whitelist.',
          progress: function(s) {
              var pressed = Object.keys(s.buttonsPressed||{}).filter(function(k) { return (s.buttonsPressed||{})[k]; }).length;
              return { current: pressed, target: BTN_WHITELIST.length };
          },
          unlocked: function(s) {
              return BTN_WHITELIST.every(function(id) { return (s.buttonsPressed||{})[id]; });
          } },
        { id: 'btn_chaos_all', section: 'Buttons', name: 'Chaos Connoisseur',
          desc: 'Toggle every chaos button at least once.',
          progress: function(s) {
              return { current: Math.min((s.chaosButtonsPressed||[]).length, 10), target: 10 };
          },
          unlocked: function(s) { return (s.chaosButtonsPressed||[]).length >= 10; } },

        // ── J. Schematic ──────────────────────────────────────────────────────
        { id: 'sch_first_node', section: 'Schematic', name: 'First Node',
          desc: 'Install the first schematic node.',
          progress: function(s) { return { current: Math.min((s.installedNodes||[]).length, 1), target: 1 }; },
          unlocked: function(s) { return (s.installedNodes||[]).length >= 1; } },
        { id: 'sch_half',    section: 'Schematic', name: 'Half Wired',
          desc: 'Install 4 schematic nodes.',
          progress: function(s) { return { current: Math.min((s.installedNodes||[]).length, 4), target: 4 }; },
          unlocked: function(s) { return (s.installedNodes||[]).length >= 4; } },
        { id: 'sch_all',     section: 'Schematic', name: 'Pattern Match 100%',
          desc: 'Install all 8 schematic nodes.',
          progress: function(s) { return { current: Math.min((s.installedNodes||[]).length, 8), target: 8 }; },
          unlocked: function(s) { return (s.installedNodes||[]).length >= 8; } },

        // ── K. Bots ───────────────────────────────────────────────────────────
        { id: 'bot_calibrate', section: 'Bots', name: 'First Calibration',
          desc: 'Successfully calibrate a bot.',
          progress: function(s) { return { current: s.botFirstCalibrated ? 1 : 0, target: 1 }; },
          unlocked: function(s) { return !!s.botFirstCalibrated; } },
        { id: 'bot_parts',   section: 'Bots', name: 'Parts En Route',
          desc: 'Order parts for a bot.',
          progress: function(s) { return { current: s.botFirstPartsOrdered ? 1 : 0, target: 1 }; },
          unlocked: function(s) { return !!s.botFirstPartsOrdered; } },
        { id: 'bot_all_nominal', section: 'Bots', name: 'All Green',
          desc: 'Get all 3 bots to NOMINAL after at least one was degraded.',
          progress: function(s) {
              var bots = s.bots || [];
              var allNominal = bots.length >= 3 && bots.every(function(b) { return b.status === 'NOMINAL'; });
              return { current: (allNominal && s.botEverDegraded) ? 1 : 0, target: 1 };
          },
          unlocked: function(s) {
              if (!s.botEverDegraded) return false;
              var bots = s.bots || [];
              return bots.length >= 3 && bots.every(function(b) { return b.status === 'NOMINAL'; });
          } },

        // ── L. Story Beats ────────────────────────────────────────────────────
        { id: 'story_toaster', section: 'Story Beats', name: 'Survived the Toaster',
          desc: 'Experience the toaster incident.',
          progress: function(s) { return { current: s.toasterIncidentFired ? 1 : 0, target: 1 }; },
          unlocked: function(s) { return !!s.toasterIncidentFired; } },
        { id: 'story_mcguffin', section: 'Story Beats', name: 'McGuffin Cashed',
          desc: 'Handle the McGuffin item.',
          progress: function(s) { return { current: s.mcguffinFired ? 1 : 0, target: 1 }; },
          unlocked: function(s) { return !!s.mcguffinFired; } },
        { id: 'story_act2',  section: 'Story Beats', name: 'Pressure',
          desc: 'Reach Act 2.',
          progress: function(s) { return { current: Math.min(s.act||1, 2), target: 2 }; },
          unlocked: function(s) { return (s.act||1) >= 2; } },
        { id: 'story_act3',  section: 'Story Beats', name: 'The Find',
          desc: 'Reach Act 3.',
          progress: function(s) { return { current: Math.min(s.act||1, 3), target: 3 }; },
          unlocked: function(s) { return (s.act||1) >= 3; } },
        { id: 'story_naming_max', section: 'Story Beats', name: 'Earned the Name',
          desc: 'Reach naming tier 3 (Buddy).',
          progress: function(s) { return { current: Math.min(s.namingTier||0, 3), target: 3 }; },
          unlocked: function(s) { return (s.namingTier||0) >= 3; } },

        // ── M. Debt ───────────────────────────────────────────────────────────
        { id: 'debt_first_pay', section: 'Debt', name: 'First Payment Cleared',
          desc: 'Complete your first loan installment.',
          progress: function(s) { return { current: Math.min(s.paymentsCleared||0, 1), target: 1 }; },
          unlocked: function(s) { return (s.paymentsCleared||0) >= 1; } },
        { id: 'debt_under_10k', section: 'Debt', name: 'Under 10k',
          desc: 'Reduce your debt below 10,000 cr.',
          progress: function(s) {
              var d = s.debt || 0;
              var pct = d > 10000 ? 0 : Math.round(((10000 - d) / 10000) * 100);
              return { current: d < 10000 ? 1 : 0, target: 1 };
          },
          unlocked: function(s) { return (s.debt||0) < 10000; } },
        { id: 'debt_under_1k', section: 'Debt', name: 'Under 1k',
          desc: 'Reduce your debt below 1,000 cr.',
          progress: function(s) { return { current: (s.debt||0) < 1000 ? 1 : 0, target: 1 }; },
          unlocked: function(s) { return (s.debt||0) < 1000; } },
        { id: 'debt_clear',  section: 'Debt', name: 'Loan Cleared',
          desc: 'Clear the loan entirely.',
          progress: function(s) { return { current: (s.debt||0) <= 0 && (s.outstandingDebt||0) <= 0 ? 1 : 0, target: 1 }; },
          unlocked: function(s) { return (s.debt||0) <= 0 && (s.outstandingDebt||0) <= 0; } },

        // ── N. Sven ───────────────────────────────────────────────────────────
        { id: 'sven_complaint_1', section: 'Sven', name: 'Filed a Complaint',
          desc: 'File 1 complaint against Sven.',
          progress: function(s) { return { current: Math.min(s.svenComplaints||0, 1), target: 1 }; },
          unlocked: function(s) { return (s.svenComplaints||0) >= 1; } },
        { id: 'sven_complaint_10', section: 'Sven', name: 'Squeaky Wheel',
          desc: 'File 10 complaints against Sven.',
          progress: function(s) { return { current: Math.min(s.svenComplaints||0, 10), target: 10 }; },
          unlocked: function(s) { return (s.svenComplaints||0) >= 10; } },
        { id: 'sven_complaint_50', section: 'Sven', name: 'Career Filer',
          desc: 'File 50 complaints against Sven.',
          progress: function(s) { return { current: Math.min(s.svenComplaints||0, 50), target: 50 }; },
          unlocked: function(s) { return (s.svenComplaints||0) >= 50; } },
        { id: 'sven_first_refusal', section: 'Sven', name: 'First Refusal Honoured',
          desc: 'Fulfil a svenRareRefusal standing order.',
          progress: function(s) { return { current: s.svenFirstRefusalDone ? 1 : 0, target: 1 }; },
          unlocked: function(s) { return !!s.svenFirstRefusalDone; } },

        // ── O. Humor ──────────────────────────────────────────────────────────
        { id: 'joke_10',     section: 'Humor', name: 'Heard Ten',
          desc: "Hear 10 of OTIS's dad jokes.",
          progress: function(s) { return { current: Math.min(s.dadJokesHeard||0, 10), target: 10 }; },
          unlocked: function(s) { return (s.dadJokesHeard||0) >= 10; } },
        { id: 'joke_50',     section: 'Humor', name: 'Audience of One',
          desc: "Hear 50 of OTIS's dad jokes.",
          progress: function(s) { return { current: Math.min(s.dadJokesHeard||0, 50), target: 50 }; },
          unlocked: function(s) { return (s.dadJokesHeard||0) >= 50; } },

        // ── P. Completionist (must be last) ───────────────────────────────────
        { id: 'completionist', section: 'Completionist', name: 'All Achievements Unlocked',
          desc: 'Unlock every other achievement.',
          progress: function(s) {
              var nonMeta = ACHIEVEMENTS.filter(function(a) { return a.id !== 'completionist'; });
              var unlocked = nonMeta.filter(function(a) { return a.unlocked(s); }).length;
              return { current: unlocked, target: nonMeta.length };
          },
          unlocked: function(s) {
              var nonMeta = ACHIEVEMENTS.filter(function(a) { return a.id !== 'completionist'; });
              return nonMeta.every(function(a) { return a.unlocked(s); });
          } },
    ];

    // ─── BUTTON WHITELIST ─────────────────────────────────────────────────────
    // Curated list of meaningful operator buttons tracked for "Buttons" achievements.
    var BTN_WHITELIST = [
        'btn-login', 'tts-btn', 'tts-skip-btn', 'sfx-btn', 'ach-btn',
        'module-btn-belt', 'module-btn-comms', 'module-btn-systems', 'module-btn-auxiliary',
        'btn-search-warehouse', 'btn-pull-storeroom', 'btn-scan-belt',
        'chaos-drawer-toggle', 'clear-save-btn',
        'btn-answer-bank', 'btn-answer-may', 'btn-answer-sven',
        'btn-ignore-sven', 'btn-file-complaint',
        'btn-transmit-452b',
    ];

    // ─── CORE: check() ────────────────────────────────────────────────────────
    function check() {
        if (!window.gameState) return;
        var s = window.gameState.state;
        if (!s) return;
        if (!Array.isArray(s.achievementsUnlocked)) s.achievementsUnlocked = [];

        var newlyUnlocked = [];
        ACHIEVEMENTS.forEach(function(a) {
            if (s.achievementsUnlocked.indexOf(a.id) !== -1) return; // already unlocked
            try {
                if (a.unlocked(s)) {
                    s.achievementsUnlocked.push(a.id);
                    newlyUnlocked.push(a);
                }
            } catch(e) { /* swallow errors in individual achievement checks */ }
        });

        if (newlyUnlocked.length > 0) {
            window.gameState._save();
            newlyUnlocked.forEach(function(a) { _showToast(a.name); });
            render();
        }
    }

    // ─── TOAST ────────────────────────────────────────────────────────────────
    function _showToast(name) {
        var stack = document.getElementById('ach-toast-stack');
        if (!stack) {
            stack = document.createElement('div');
            stack.id = 'ach-toast-stack';
            document.body.appendChild(stack);
        }
        var toast = document.createElement('div');
        toast.className = 'ach-toast';
        toast.textContent = '\uD83C\uDFC6 ACHIEVEMENT \u2014 ' + name;
        stack.appendChild(toast);
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 4200);
    }

    // ─── RENDER (modal body) ──────────────────────────────────────────────────
    function render() {
        var body = document.getElementById('ach-modal-body');
        if (!body) return;
        var s = window.gameState ? window.gameState.state : {};
        var unlocked = s.achievementsUnlocked || [];

        // Group achievements by section preserving definition order
        var sections = [];
        var sectionMap = {};
        ACHIEVEMENTS.forEach(function(a) {
            if (!sectionMap[a.section]) {
                sectionMap[a.section] = [];
                sections.push(a.section);
            }
            sectionMap[a.section].push(a);
        });

        var totalUnlocked = unlocked.length;
        var totalAch = ACHIEVEMENTS.length;

        // Update header summary — show only unlocked count, not total (player should
        // not know how many achievements exist in each section or overall).
        var summary = document.getElementById('ach-summary');
        if (summary) summary.textContent = totalUnlocked + ' unlocked';

        var html = '';
        sections.forEach(function(sec) {
            var group = sectionMap[sec];
            html += '<div class="ach-section">';
            html += '<div class="ach-section-title">' + escapeHtmlAch(sec.toUpperCase()) + '</div>';
            // Progressive reveal: show all unlocked entries, then show the FIRST locked
            // entry as a redacted placeholder (####), stop before any further locked entries.
            for (var i = 0; i < group.length; i++) {
                var a = group[i];
                var isUnlocked = unlocked.indexOf(a.id) !== -1;
                if (!isUnlocked) {
                    // Render this one as redacted, then stop — player sees one hint only
                    html += '<div class="ach-entry locked ach-redacted">';
                    html += '<span class="ach-icon">?</span>';
                    html += '<span class="ach-name">####</span>';
                    html += '<span class="ach-desc">####</span>';
                    html += '<span class="ach-progress">####</span>';
                    html += '</div>';
                    break; // hide all remaining locked entries in this section
                }
                var prog = { current: 0, target: 1 };
                try { prog = a.progress(s); } catch(e) {}
                var progText = (prog.target > 1) ? (prog.current + ' / ' + prog.target) : 'Done';
                html += '<div class="ach-entry unlocked">';
                html += '<span class="ach-icon">\u2713</span>';
                html += '<span class="ach-name">' + escapeHtmlAch(a.name) + '</span>';
                html += '<span class="ach-desc">' + escapeHtmlAch(a.desc) + '</span>';
                html += '<span class="ach-progress">' + progText + '</span>';
                html += '</div>';
            }
            html += '</div>';
        });
        body.innerHTML = html;
    }

    function escapeHtmlAch(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ─── MODAL OPEN / CLOSE ───────────────────────────────────────────────────
    function openAchievements() {
        render();
        var modal = document.getElementById('modal-achievements');
        if (modal) { modal.classList.add('open'); }
    }

    function closeAchievements() {
        var modal = document.getElementById('modal-achievements');
        if (modal) { modal.classList.remove('open'); }
    }

    // ─── DELEGATED BUTTON CLICK LISTENER ─────────────────────────────────────
    document.addEventListener('click', function(e) {
        var target = e.target;
        if (!target || !window.gameState) return;
        var id = target.id || target.getAttribute('data-ach-id');
        if (!id) return;
        if (BTN_WHITELIST.indexOf(id) === -1) return;
        var s = window.gameState.state;
        if (!s.buttonsPressed) s.buttonsPressed = {};
        if (!s.buttonsPressed[id]) {
            s.buttonsPressed[id] = true;
            check();
        }
    }, true /* capture phase so it runs before onclick handlers */);

    // ─── EXPOSE PUBLIC API ────────────────────────────────────────────────────
    window.Achievements = { check: check, render: render };
    window.openAchievements  = openAchievements;
    window.closeAchievements = closeAchievements;

}());
