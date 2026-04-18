// Chaos Button Panel — 10 unlabelled round buttons injected into #arm-panel.
// Each button toggles a CSS chaos effect and fires a scripted local OTIS line.
// No API calls. Extracted as a self-contained module matching the Phase 4+ refactor pattern.

(function () {

    // ---------------------------------------------------------------------------
    // Scripted OTIS dialog — 3 lines per button (indexed 0–9), no API calls.
    // ON lines are used when depressing a button; OFF lines when releasing.
    // ---------------------------------------------------------------------------
    var CHAOS_DIALOG = [
        // Button 0 — blue palette
        {
            on:  [
                "Color palette updated. No, I don't know why that option exists either.",
                "George never touched that one. I think he was afraid of blue."
            ],
            off: "Returning to standard palette. Green is the correct colour for impending failure."
        },
        // Button 1 — amber palette
        {
            on:  [
                "Amber mode. This station is now visually indistinguishable from a fire hazard.",
                "You've made everything look like a bank. George would be horrified."
            ],
            off: "Amber palette disengaged. Back to the colour of slow decay."
        },
        // Button 2 — wingdings font
        {
            on:  [
                "Font changed to Wingdings. Readability: zero. Efficiency: matching.",
                "George spent twenty-five years labelling things clearly. You've undone that in one press."
            ],
            off: "Readable text restored. You're welcome."
        },
        // Button 3 — red veil
        {
            on:  [
                "Red overlay applied. The station looks exactly as dangerous as it actually is.",
                "That button has no documented function. George left a note that just said 'don't'."
            ],
            off: "Red veil cleared. The danger remains. Only the aesthetic has improved."
        },
        // Button 4 — invert layout
        {
            on:  [
                "Display inverted. If you were trying to make things worse, well done.",
                "Unlabelled. Unknown purpose. You pressed it anyway. Very on-brand."
            ],
            off: "Inversion cancelled. Spatial awareness restored."
        },
        // Button 5 — giant font
        {
            on:  [
                "Font size increased to compensate for operator error. Or operator eyes. Hard to say.",
                "George wore glasses for the last four years and still never touched this."
            ],
            off: "Font size normalised. I'll pretend that didn't happen."
        },
        // Button 6 — rotate terminal
        {
            on:  [
                "Terminal rotated one-eighty. You pressed something. The station is still here. Marginally.",
                "George bolted this panel to the wall himself. He is rotating in his grave."
            ],
            off: "Terminal orientation restored. Please stop experimenting on the station."
        },
        // Button 7 — shake
        {
            on:  [
                "Seismic simulation active. Or you've just broken something structural. I'll update the log either way.",
                "This was probably not designed for recreational use. Probably."
            ],
            off: "Vibration sequence terminated. Nothing fell off. This time."
        },
        // Button 8 — blur terminal
        {
            on:  [
                "Terminal filter set to 'incomprehensible'. An improvement, some might argue.",
                "You've made the output unreadable. I'll note this is not a significant change in practice."
            ],
            off: "Terminal blur cleared. I've rendered you legible again at no charge."
        },
        // Button 9 — scanlines off
        {
            on:  [
                "CRT overlay disabled. The station looks modern now. I find this unsettling.",
                "George installed those scanlines manually. Said it felt more honest."
            ],
            off: "Scanlines restored. The illusion of authenticity is back."
        }
    ];

    // ---------------------------------------------------------------------------
    // Chaos effect handlers — each returns { apply, revert } functions.
    // ---------------------------------------------------------------------------
    var _redVeilEl = null;

    var EFFECTS = [
        // 0 — blue palette
        {
            apply: function () { document.documentElement.classList.add('chaos-blue'); },
            revert: function () { document.documentElement.classList.remove('chaos-blue'); }
        },
        // 1 — amber palette
        {
            apply: function () { document.documentElement.classList.add('chaos-amber'); },
            revert: function () { document.documentElement.classList.remove('chaos-amber'); }
        },
        // 2 — wingdings font
        {
            apply: function () { document.documentElement.classList.add('chaos-font'); },
            revert: function () { document.documentElement.classList.remove('chaos-font'); }
        },
        // 3 — red veil overlay
        {
            apply: function () {
                if (!_redVeilEl) {
                    _redVeilEl = document.createElement('div');
                    _redVeilEl.id = 'chaos-red-veil';
                }
                document.body.appendChild(_redVeilEl);
            },
            revert: function () {
                if (_redVeilEl && _redVeilEl.parentNode) {
                    _redVeilEl.parentNode.removeChild(_redVeilEl);
                }
            }
        },
        // 4 — invert layout
        {
            apply: function () {
                var el = document.getElementById('layout');
                if (el) el.classList.add('chaos-invert');
            },
            revert: function () {
                var el = document.getElementById('layout');
                if (el) el.classList.remove('chaos-invert');
            }
        },
        // 5 — giant font
        {
            apply: function () { document.documentElement.classList.add('chaos-bigfont'); },
            revert: function () { document.documentElement.classList.remove('chaos-bigfont'); }
        },
        // 6 — rotate terminal
        {
            apply: function () {
                var el = document.getElementById('terminal');
                if (el) el.classList.add('chaos-rotate');
            },
            revert: function () {
                var el = document.getElementById('terminal');
                if (el) el.classList.remove('chaos-rotate');
            }
        },
        // 7 — shake body
        {
            apply: function () { document.body.classList.add('chaos-shake'); },
            revert: function () { document.body.classList.remove('chaos-shake'); }
        },
        // 8 — blur terminal
        {
            apply: function () {
                var el = document.getElementById('terminal');
                if (el) el.classList.add('chaos-blur');
            },
            revert: function () {
                var el = document.getElementById('terminal');
                if (el) el.classList.remove('chaos-blur');
            }
        },
        // 9 — scanlines off
        {
            apply: function () {
                var el = document.getElementById('crt-overlay');
                if (el) el.classList.add('chaos-hidden');
            },
            revert: function () {
                var el = document.getElementById('crt-overlay');
                if (el) el.classList.remove('chaos-hidden');
            }
        }
    ];

    // ---------------------------------------------------------------------------
    // Push a scripted line to the OTIS terminal — no API call.
    // ---------------------------------------------------------------------------
    function _pushLine(text) {
        if (Array.isArray(window.otisLines)) {
            window.otisLines.push({ role: 'otis', text: text });
        }
        if (typeof window.renderOTIS === 'function') {
            window.renderOTIS();
        }
        if (window.OtisTTS) OtisTTS.speak(text);
    }

    // ---------------------------------------------------------------------------
    // Pick a random "on" line for the given button index.
    // ---------------------------------------------------------------------------
    function _onLine(idx) {
        var lines = CHAOS_DIALOG[idx].on;
        return lines[Math.floor(Math.random() * lines.length)];
    }

    // ---------------------------------------------------------------------------
    // DOM injection — run after DOMContentLoaded.
    // Mounts the grid in #arm-panel (desktop) and clones it into #chaos-drawer-grid
    // (mobile drawer). A single shared `active[]` array drives both copies so
    // toggling one always keeps the other copy in sync.
    // ---------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        var armPanel    = document.getElementById('arm-panel');
        var drawerGrid  = document.getElementById('chaos-drawer-grid');

        // We need at least one mount point.
        if (!armPanel && !drawerGrid) return;

        // Track active state for each button — shared across all mounted copies.
        var active = [false, false, false, false, false, false, false, false, false, false];

        // All button elements across every copy, grouped by index.
        // btns[idx] is an array of elements (one per mounted copy).
        var btns = [];
        for (var k = 0; k < 10; k++) { btns.push([]); }

        function _syncActive(idx) {
            btns[idx].forEach(function (el) {
                if (active[idx]) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
        }

        function _buildGrid() {
            var grid = document.createElement('div');
            grid.className = 'chaos-btn-grid';
            grid.setAttribute('aria-hidden', 'true');

            for (var i = 0; i < 10; i++) {
                (function (idx) {
                    var btn = document.createElement('button');
                    btn.className = 'chaos-btn';
                    btn.type = 'button';
                    btn.setAttribute('aria-label', 'Chaos button ' + (idx + 1));

                    btn.addEventListener('click', function () {
                        active[idx] = !active[idx];
                        _syncActive(idx);
                        if (active[idx]) {
                            EFFECTS[idx].apply();
                            _pushLine(_onLine(idx));
                        } else {
                            EFFECTS[idx].revert();
                            _pushLine(CHAOS_DIALOG[idx].off);
                        }
                    });

                    btns[idx].push(btn);
                    grid.appendChild(btn);
                }(i));
            }

            return grid;
        }

        // Mount in sidebar (desktop)
        if (armPanel) {
            armPanel.appendChild(_buildGrid());
        }

        // Mount in mobile drawer
        if (drawerGrid) {
            drawerGrid.appendChild(_buildGrid());
        }
    });

}());
