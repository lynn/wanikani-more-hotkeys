// ==UserScript==
// @name          WaniKani More Hotkeys
// @namespace     https://www.wanikani.com
// @description   In kanji info, press 'S/M/R' to add synonym/meaning/reading note. Press 'W' to wrap up.
// @version       1.0.0
// @include       *://www.wanikani.com/lesson/session*
// @include       *://www.wanikani.com/review/session*
// @grant         none
// ==/UserScript==

(function() {
  'use strict';
  $(document).on('keydown.reviewScreen', function(e) {
    // Don't fire hotkeys until the review UI is visible.
    if (!$('#reviews').is(':visible')) return;

    // The main hotkeys.
    if (!$('input, textarea').is(':focus')) {
      if (e.key === '?') {
        $('#hotkeys').trigger('click');
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'w') {
        $('#option-wrap-up').trigger('click');
        e.preventDefault();
      } else if (e.key.toLowerCase() === 's' && $('section.user-synonyms').is(':visible')) {
        $('.user-synonyms-add-btn').trigger('click');
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'm' && $('div.note-meaning').is(':visible')) {
        $('div.note-meaning').trigger('click');
        $('div.note-meaning textarea').focus();
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'r' && $('div.note-reading').is(':visible')) {
        $('div.note-reading').trigger('click');
        $('div.note-reading textarea').focus();
        e.preventDefault();
      }
    }

    // Bonus: accept Ctrl+Enter in meaning/reading note editor.
    if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
      if ($('div.note-meaning textarea').is(':focus')) {
        $('div.note-meaning button[type=submit]').trigger('click');
        e.preventDefault();
      } else if ($('div.note-reading textarea').is(':focus')) {
        $('div.note-reading button[type=submit]').trigger('click');
        e.preventDefault();
      }
    }

    // Bonus: accept Esc in synonym/meaning/reading note editor.
    if (e.keyCode == 27) { // esc
      if ($('div.note-meaning textarea').is(':focus')) {
        $('div.note-meaning button.btn-cancel').trigger('click');
        e.preventDefault();
      } else if ($('div.note-reading textarea').is(':focus')) {
        $('div.note-reading button.btn-cancel').trigger('click');
        e.preventDefault();
      } else if ($('.user-synonyms ul li.user-synonyms-add-form form input').is(':focus')) {
        $('.user-synonyms ul li.user-synonyms-add-form form button[type=button]').trigger('click');
        e.preventDefault();
      }
    }
  });

  // Update hotkey list.
  $(document).ready(function() {
    $('#hotkeys tr:nth-child(2)').after(
      '<tr><td><span>S</span></td><td>Add Synonym</td></tr>' +
      '<tr><td><span>M</span></td><td>Add Meaning Note</td></tr>' +
      '<tr><td><span>R</span></td><td>Add Reading Note</td></tr>' +
      '<tr><td><span>W</span></td><td>Wrap Up</td></tr>'
    );
    $('#hotkeys tr:last').after('<tr><td><span>?</span></td><td>Show Hotkeys</td></tr>');
  });
})();
