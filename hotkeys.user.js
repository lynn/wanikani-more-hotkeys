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
  var haveInfo = function()   { return $('#item-info h2').is(':visible') }
  var waitInfo = function(cb) { haveInfo() ? cb() : setTimeout(function() { waitInfo(cb) }, 100) }
  var withInfo = function(cb) { haveInfo() ? cb() : ($('#option-item-info').trigger('click'), waitInfo(cb)) }
  var focusInputIn = function(selector) { var input = $(selector + ' textarea')[0] || $(selector + ' input')[0]; input.focus(); }
  var editNote = function(selector, buttonSelector) {
    buttonSelector = buttonSelector || selector;
    withInfo(function() {
      if ($(selector).is(':visible')) {
        $(buttonSelector).trigger('click');
        setTimeout(function() { focusInputIn(selector) }, 50);
      } else {
        $('#all-info').trigger('click');
        setTimeout(function() { editNote(selector, buttonSelector) }, 1);
      }
    });
  }
  var addSynonym = function() { editNote('.user-synonyms', '.user-synonyms-add-btn'); }

  $(document).on('keydown.reviewScreen', function(e) {
    // Don't fire hotkeys until the review UI is visible.
    if (!$('#reviews').is(':visible')) return;

    // The main hotkeys.
    if (!$('input, textarea').is(':focus')) {
      switch (e.key.toLowerCase()) {
        case '?': $('#hotkeys').click();        e.preventDefault(); break;
        case 'w': $('#option-wrap-up').click(); e.preventDefault(); break;
        case 's': addSynonym();                 e.preventDefault(); break;
        case 'm': editNote('div.note-meaning'); e.preventDefault(); break;
        case 'r': editNote('div.note-reading'); e.preventDefault(); break;
        default: break;
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
      } else if ($('#hotkeys>table').is(':visible')) {
        $('#hotkeys').trigger('click');
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
