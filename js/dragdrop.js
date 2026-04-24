// OTIS drag-and-drop subsystem — pointer-event-based item sorting into bins.
// Supplements (does not replace) the click-to-declare buttons already on #item-declaration.
// handleDeclare(method) from belt.js is called on a successful drop, completely unchanged.

(function () {
    'use strict';

    var _clone      = null;
    var _isDragging = false;
    var _offsetX    = 0;
    var _offsetY    = 0;

    // Dragging is only permitted after the player has made an initial decision
    // (Examine, George Archive, or Skip). This is mirrored by #item-declaration
    // becoming visible in renderItemQueue() / handleSkip().
    function _canDrag() {
        var declEl = document.getElementById('item-declaration');
        return !!(declEl && declEl.style.display !== 'none' && window.currentItem);
    }

    function _getBeltItem() {
        return document.getElementById('belt-item');
    }

    function _getBins() {
        return Array.prototype.slice.call(document.querySelectorAll('.bin'));
    }

    function _hitTest(x, y, el) {
        var r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    function _cleanupClone() {
        if (_clone && _clone.parentNode) {
            _clone.parentNode.removeChild(_clone);
        }
        _clone = null;
    }

    function _resetBeltItem() {
        var el = _getBeltItem();
        if (el) el.style.opacity = '';
    }

    function _clearBinHover() {
        _getBins().forEach(function (bin) { bin.classList.remove('bin-hover'); });
    }

    // ── POINTER DOWN ──────────────────────────────────────────────────────────
    document.addEventListener('pointerdown', function (e) {
        if (!_canDrag()) return;

        var beltItem = _getBeltItem();
        if (!beltItem || !beltItem.contains(e.target)) return;

        e.preventDefault();

        var rect = beltItem.getBoundingClientRect();
        _offsetX    = e.clientX - rect.left;
        _offsetY    = e.clientY - rect.top;
        _isDragging = true;

        // Build a visual clone that follows the cursor so the original stays in
        // the layout flow (avoids reflowing the modal while dragging).
        _clone = beltItem.cloneNode(true);
        _clone.removeAttribute('id');
        _clone.classList.add('drag-clone', 'dragging');
        _clone.style.position    = 'fixed';
        _clone.style.left        = rect.left + 'px';
        _clone.style.top         = rect.top  + 'px';
        _clone.style.width       = rect.width + 'px';
        _clone.style.margin      = '0';
        _clone.style.pointerEvents = 'none';
        _clone.style.zIndex      = '10000';
        document.body.appendChild(_clone);

        // Dim the source element to signal it is being dragged.
        beltItem.style.opacity = '0.35';

        document.addEventListener('pointermove',   _onPointerMove);
        document.addEventListener('pointerup',     _onPointerUp);
        document.addEventListener('pointercancel', _onPointerCancel);
    }, { passive: false });

    // ── POINTER MOVE ──────────────────────────────────────────────────────────
    function _onPointerMove(e) {
        if (!_isDragging || !_clone) return;

        var x = e.clientX;
        var y = e.clientY;

        _clone.style.left = (x - _offsetX) + 'px';
        _clone.style.top  = (y - _offsetY) + 'px';

        // Bin hover highlight + scale snap when over a target.
        var overAny = false;
        _getBins().forEach(function (bin) {
            var over = _hitTest(x, y, bin);
            bin.classList.toggle('bin-hover', over);
            if (over) overAny = true;
        });

        _clone.style.transform = overAny ? 'scale(1.08)' : 'scale(1)';
    }

    // ── POINTER UP ────────────────────────────────────────────────────────────
    function _onPointerUp(e) {
        if (!_isDragging) return;
        _isDragging = false;

        document.removeEventListener('pointermove',   _onPointerMove);
        document.removeEventListener('pointerup',     _onPointerUp);
        document.removeEventListener('pointercancel', _onPointerCancel);

        _clearBinHover();

        var x = e.clientX;
        var y = e.clientY;

        // Find the first bin element under the pointer.
        var targetBin = null;
        _getBins().forEach(function (bin) {
            if (!targetBin && _hitTest(x, y, bin)) targetBin = bin;
        });

        if (targetBin && typeof window.handleDeclare === 'function') {
            // Valid drop — fade clone out, then call the existing declare logic.
            if (_clone) {
                _clone.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
                _clone.style.opacity    = '0';
                _clone.style.transform  = 'scale(0.75)';
            }
            var binMethod = targetBin.dataset.bin;
            setTimeout(function () {
                _cleanupClone();
                _resetBeltItem();
                window.handleDeclare(binMethod);
            }, 200);
        } else {
            // Invalid drop — restore item immediately, no side effects.
            _resetBeltItem();
            _cleanupClone();
        }
    }

    // ── POINTER CANCEL (touch interrupt, stylus lift, etc.) ───────────────────
    function _onPointerCancel() {
        if (!_isDragging) return;
        _isDragging = false;

        document.removeEventListener('pointermove',   _onPointerMove);
        document.removeEventListener('pointerup',     _onPointerUp);
        document.removeEventListener('pointercancel', _onPointerCancel);

        _clearBinHover();
        _resetBeltItem();
        _cleanupClone();
    }

}());
