# Kindle Compatibility Notes

## `confirm()` / `alert()` / `prompt()`
These native browser dialogs **do not work** on Kindle's experimental browser. The dialog renders invisible and blocks JS execution. Always use a custom modal overlay (`.modal-overlay` + `.modal-content`) instead.

## Layout modal pattern
See the `#reset-modal` in `games/tictactoe.html` for the standard approach:
- `<div id="X-modal" class="modal-overlay" style="display:none">` at bottom of container
- `<div class="modal-content">` with `<p>` for message and `.btn` buttons
- Toggle visibility with `element.style.display = 'block' / 'none'`
