// ==UserScript==
// @name          WaniKani More Hotkeys
// @namespace     https://www.wanikani.com
// @description   Press 'S/M/R' to add a synonym/meaning/reading note, and 'Shift+W' to wrap up. Try '?' for more hotkey info.
// @version       1.4.0
// @include       *://www.wanikani.com/lesson/session*
// @include       *://www.wanikani.com/review/session*
// @grant         none
// ==/UserScript==

(function() {
  'use strict';

  // Helper functions.
  var toggleHotkeys = () => $('#hotkeys').trigger('click');
  var wrapUp = () => $('#option-wrap-up').trigger('click');
  var infoLoaded = () => $('#item-info h2').is(':visible');
  var canGetInfo = () => !$('#option-item-info').is('.disabled');
  var clickShowInfo = () => $('#option-item-info').trigger('click');
  var clickShowAllInfo = () => $('#all-info').trigger('click');
  var canClickAudioButton = () => !$('#option-audio').is('.disabled');
  var clickAudioButton = () => $('#option-audio').trigger('click');
  var hasLightningMode = () => $('#lightning-mode').length > 0;
  var toggleLightningMode = () => $('#lightning-mode').trigger('click');

  // Expand flashcard info until `selector` is visible, then call `cb`.
  var withInfo_Review = function(selector, cb, _clicked) {
    if (infoLoaded()) {
      if ($(selector).is(':visible')) {
        cb();
      } else {
        clickShowAllInfo();
        setTimeout(cb, 1);
      }
    } else if (canGetInfo()) {
      if (!_clicked) clickShowInfo();
      setTimeout(() => withInfo_Review(selector, cb, true), 100);
    }
  }

  // If `#lesson` is visible:
  //     If `lessonTab` is given and visible, click that and call `cb`.
  // Otherwise (quiz or review):
  //     Expand flashcard info until `selector` is visible, then call `cb`.
  var withInfo = (selector, lessonTab, cb) => {
    if ($('#lesson').is(':visible')) {
      if (lessonTab && $(lessonTab).is(':visible')) {
        $(lessonTab).trigger('click');
        cb();
      }
    } else {
      withInfo_Review(selector, cb);
    }
  };

  // Expand info until `selector` is visible. Then click `button` and focus `input`.
  // (In lesson mode, click `lessonTab`, then `button`, then focus `input`.)
  var clickEdit = (selector, button, input, lessonTab) => {
    withInfo(selector, lessonTab, () => {
      $(button).trigger('click');
      setTimeout(() => $(input).focus(), 50);
    });
  }

  var addSynonym = () => clickEdit('.user-synonyms', '.user-synonyms-add-btn', '.user-synonyms input');
  var editMeaning = () => clickEdit('.note-meaning', '.note-meaning:visible', '.note-meaning textarea', '#supplement-nav li:contains("meaning")');
  var editReading = () => clickEdit('.note-reading', '.note-reading:visible', '.note-reading textarea', '#supplement-nav li:contains("reading")');

  // Play the preferred or non-preferred audio file.
  // This will use the big audio button if it's available.
  // Otherwise, it expands and uses the little item-info audio players.
  var playAudio = (preferred) => {
    if (preferred && canClickAudioButton()) {
      clickAudioButton();
    } else {
      withInfo('.audio-player', '#supplement-nav li:contains("reading")', () => {
        var audio = $('.audio-player>audio').filter((i, e) => $(e).is('.preferred') === preferred)[0];
        if (audio) audio.play();
      });
    }
  };

  $(document).on('keydown.moreHotkeys', (e) => {
    // The main hotkeys.
    var shift = e.shiftKey;
    if (e.key === 'W' || !$('input, textarea').is(':focus')) {
      switch (e.key.toLowerCase()) {
        case 'w': wrapUp();          e.preventDefault(); break;
        case 's': addSynonym();      e.preventDefault(); break;
        case 'm': editMeaning();     e.preventDefault(); break;
        case 'r': editReading();     e.preventDefault(); break;
        case 'j': playAudio(!shift); e.preventDefault(); break;
        default: break;
      }
    }

    if (e.key === '?') { toggleHotkeys(); e.preventDefault(); }
    if (e.key === '\\' && hasLightningMode()) { toggleLightningMode(); e.preventDefault(); }

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

  // Disable lesson screen `keyup` J handler. (It caused to audios to play when Shift+J is pressed: one on keydown, one on keyup.)
  // Trick: WaniKani's handler is bound on `document`, so we bind ours on `html` and stop propagation to `document` from there.
  $('html').on('keyup.moreHotkeys', (e) => {
    if (e.key.toLowerCase() === 'j') {
      e.stopPropagation();
    }
  });

  // Update hotkey list.
  $(document).ready(() => setTimeout(function() {
    $('#hotkeys>table>tbody:last').after(
      '<tbody style="color:purple;">' +
      ' <tr><td colspan="2"><hr></td></tr>' +
      ' <tr><td><span>S</span></td><td>Add Synonym</td></tr>' +
      ' <tr><td><span>M</span></td><td>Add Meaning Note</td></tr>' +
      ' <tr><td><span>R</span></td><td>Add Reading Note</td></tr>' +
      ' <tr><td><span>Shift+W</span></td><td>Wrap Up</td></tr>' +
      ' <tr><td><span>Shift+J</span></td><td>Other Audio</td></tr>' +
      (hasLightningMode() ? ' <tr><td><span>\\</span></td><td>Lightning Mode</td></tr>' : '') +
      ' <tr><td><span>?</span></td><td>Show Hotkeys</td></tr>' +
      '</tbody>'
    );
  }, 500));
})();
