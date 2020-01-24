'use strict';

import { bus } from '../EventBus.js';
import {
  tomeAcrostics,
  tomeChapters
} from '../data/tomeDb.js';
import {
  chapterName,
  verseNum,
  verseText
} from '../data/tomeIdx.js';
import {
  templateElement,
  templateToolbarLower,
  templatePage,
  templateScroll,
  templateToolbarUpper
} from '../template.js';
import {
  centerScrollElement,
  removeAllChildren,
  sideScrollElement
} from '../util.js';

const lowerToolSet = [
  { type: 'btn', icon: 'navigator', label: 'Navigator' },
  { type: 'btn', icon: 'bookmark', label: 'Bookmark' },
  { type: 'btn', icon: 'search', label: 'Search' },
  { type: 'btn', icon: 'strong', label: 'Strong' },
  { type: 'btn', icon: 'setting', label: 'Setting' },
  { type: 'btn', icon: 'help', label: 'Help' },
  { type: 'btn', icon: 'column-mode', label: 'Column Mode' },
  { type: 'btn', icon: 'strong-mode', label: 'Strong Mode' }
];

const upperToolSet = [
  { type: 'btn', icon: 'prev', label: 'Previous Chapter' },
  { type: 'banner', modifier: 'read', text: null },
  { type: 'btn', icon: 'next', label: 'Next Chapter' }
];

class ReadView {

  constructor() {
    this.initialize();
  }

  addListeners() {
    this.list.addEventListener('click', (event) => {
      this.listClick(event);
    });
    this.toolbarLower.addEventListener('click', (event) => {
      this.toolbarLowerClick(event);
    });
    this.toolbarUpper.addEventListener('click', (event) => {
      this.toolbarUpperClick(event);
    });
    window.addEventListener('resize', (event) => {
      this.windowResize(event);
    });
  }

  bookmarkHide() {
    if (this.sidebar !== 'bookmark') {
      this.btnBookmark.classList.remove('btn-icon--active');
    }
  }

  bookmarkShow() {
    this.btnBookmark.classList.add('btn-icon--active');
  }

  buildAcrosticSpan(verseIdx) {
    let acrosticSpan = undefined;
    if (tomeAcrostics) {
      let acrostic = tomeAcrostics[verseIdx];
      if (acrostic) {
        acrosticSpan = templateElement(
          'span', 'verse-acrostic', null, null, acrostic + ' ');
      }
    }
    return acrosticSpan;
  }

  buildPage() {
    this.page = templatePage('read');

    this.toolbarUpper = templateToolbarUpper(upperToolSet);
    this.page.appendChild(this.toolbarUpper);

    this.scroll = templateScroll('read');
    this.list = templateElement('div', 'list', 'read', null, null);
    this.scroll.appendChild(this.list);
    this.page.appendChild(this.scroll);

    this.toolbarLower = templateToolbarLower(lowerToolSet);
    this.page.appendChild(this.toolbarLower);

    let container = document.querySelector('.container');
    container.appendChild(this.page);
  }

  buildVerse(verseObj) {
    let verse = templateElement('div', 'verse', null, null, null);
    verse.dataset.verseIdx = verseObj.k;
    let verseNum = this.buildVerseNum(verseObj);
    verse.appendChild(verseNum);
    let acrostic = this.buildAcrosticSpan(verseObj.k);
    if (acrostic) {
      verse.appendChild(acrostic);
    }
    let text = this.buildVerseText(verseObj);
    verse.appendChild(text);
    return verse;
  }

  buildVerseNum(verseObj) {
    let num = templateElement('span', 'verse-num', null, null,
      verseObj.v[verseNum] + ' ');
    return num;
  }

  buildVerseText(verseObj) {
    let text = templateElement('span', 'verse-text', null, null,
      verseObj.v[verseText]);
    return text;
  }

  changeTheme() {
    if (this.lastTheme) {
      this.body.classList.remove(this.lastTheme.themeClass);
    }
    this.body.classList.add(this.theme.themeClass);
  }

  chapterIdxUpdate(chapterIdx) {
    this.chapterIdx = chapterIdx;
    this.updateBanner();
    this.updateVerses();
    this.refreshVerseBookmarks();
  }

  columnModeUpdate(columnMode) {
    this.columnMode = columnMode;
    this.updateColumnModeBtn();
    this.updateColumnMode();
  }

  folderUpdate(folder) {
    this.folder = folder;
    this.refreshVerseBookmarks();
  }

  fontSizeUpdate(fontSize) {
    this.fontSize = fontSize;
    this.updateFontSize();
    this.lastFontSize = this.fontSize;
  }

  fontUpdate(font) {
    this.font = font;
    this.updateFont();
    this.lastFont = this.font;
  }

  hide() {
    this.page.classList.add('page--hide');
  }

  getElements() {
    this.body = document.querySelector('body');

    this.btnPrev = this.toolbarUpper.querySelector('.btn-icon--prev');
    this.banner = this.toolbarUpper.querySelector('.banner--read');
    this.btnNext = this.toolbarUpper.querySelector('.btn-icon--next');

    this.btnNavigator = this.toolbarLower.querySelector('.btn-icon--navigator');
    this.btnBookmark = this.toolbarLower.querySelector('.btn-icon--bookmark');
    this.btnSearch = this.toolbarLower.querySelector('.btn-icon--search');
    this.btnStrong = this.toolbarLower.querySelector('.btn-icon--strong');
    this.btnStrongMode = this.toolbarLower.querySelector('.btn-icon--strong-mode');
    this.btnSetting = this.toolbarLower.querySelector('.btn-icon--setting');
    this.btnHelp = this.toolbarLower.querySelector('.btn-icon--help');
    this.btnColumnMode = this.toolbarLower.querySelector('.btn-icon--column-mode');
    this.columnBtns = [
      this.btnColumnOne, this.btnColumnTwo, this.btnColumnThree
    ];
  }

  helpHide() {
    if (this.sidebar !== 'help') {
      this.btnHelp.classList.remove('btn-icon--active');
    }
  }

  helpShow() {
    this.btnHelp.classList.add('btn-icon--active');
  }

  initialize() {
    this.buildPage();
    this.getElements();
    this.addListeners();
    this.subscribe();
    this.lastFont = null;
    this.lastFontSize = null;
  }

  listClick(event) {
    event.preventDefault();
    if (!document.getSelection().toString()) {
      let verse = event.target.closest('div.verse');
      if (verse) {
        this.verseClick(verse);
      }
    }
  }

  navigatorHide() {
    this.btnNavigator.classList.remove('btn-icon--active');
  }

  navigatorShow() {
    this.btnNavigator.classList.add('btn-icon--active');
  }

  navigatorVersesUpdate(verseObjs) {
    this.verseObjs = verseObjs;
  }

  panesUpdate(panes) {
    if (panes < 3) {
      this.btnColumnMode.classList.add('btn-icon--hide');
    } else {
      this.btnColumnMode.classList.remove('btn-icon--hide');
    }
  }

  refreshBookmarks(element) {
    let verseIdx = parseInt(element.dataset.verseIdx);
    if (this.folder.bookmarks.indexOf(verseIdx) === -1) {
      element.classList.remove('verse--bookmark');
    } else {
      element.classList.add('verse--bookmark');
    }
  }

  refreshVerseBookmarks() {
    let verses = [...this.list.querySelectorAll('.verse')];
    for (let element of verses) {
      this.refreshBookmarks(element);
    }
  }

  scrollToTop() {
    this.scroll.scrollTop = 0;
    this.scroll.scrollLeft = 0;
  }

  scrollToVerse(verseIdx) {
    let element = this.list.querySelector(
      `[data-verse-idx="${verseIdx}"]`);
    if (element) {
      if (this.columnMode) {
        sideScrollElement(this.scroll, element);
      } else {
        centerScrollElement(this.scroll, element);
      }
    }
  }

  searchHide() {
    if (this.sidebar !== 'search') {
      this.btnSearch.classList.remove('btn-icon--active');
    }
  }

  searchShow() {
    this.btnSearch.classList.add('btn-icon--active');
  }

  settingHide() {
    this.btnSetting.classList.remove('btn-icon--active');
  }

  settingShow() {
    this.btnSetting.classList.add('btn-icon--active');
  }

  show() {
    this.page.classList.remove('page--hide');
  }

  sidebarUpdate(sidebar) {
    this.sidebar = sidebar;
  }

  strongHide() {
    if (this.sidebar !== 'strong') {
      this.btnStrong.classList.remove('btn-icon--active');
    }
  }

  strongModeUpdate(strongMode) {
    this.strongMode = strongMode;
    if (this.strongMode) {
      this.btnStrongMode.classList.add('btn-icon--active');
    } else {
      this.btnStrongMode.classList.remove('btn-icon--active');
    }
  }

  strongShow() {
    this.btnStrong.classList.add('btn-icon--active');
  }

  subscribe() {
    bus.subscribe('bookmark.hide', () => {
      this.bookmarkHide();
    });
    bus.subscribe('bookmark.show', () => {
      this.bookmarkShow();
    });

    bus.subscribe('chapterIdx.update', (chapterIdx) => {
      this.chapterIdxUpdate(chapterIdx);
    });

    bus.subscribe('folder.update', (folder) => {
      this.folderUpdate(folder);
    });

    bus.subscribe('font.update', (font) => {
      this.fontUpdate(font);
    });

    bus.subscribe('font-size.update', (fontSize) => {
      this.fontSizeUpdate(fontSize);
    });

    bus.subscribe('help.hide', () => {
      this.helpHide();
    });
    bus.subscribe('help.show', () => {
      this.helpShow();
    });

    bus.subscribe('navigator.hide', () => {
      this.navigatorHide();
    });
    bus.subscribe('navigator.show', () => {
      this.navigatorShow();
    });
    bus.subscribe('navigator.verses.update', (verseObjs) => {
      this.navigatorVersesUpdate(verseObjs);
    });

    bus.subscribe('panes.update', (panes) => {
      this.panesUpdate(panes);
    });

    bus.subscribe('read.column-mode.update', (columnMode) => {
      this.columnModeUpdate(columnMode);
    });
    bus.subscribe('read.hide', () => {
      this.hide();
    });
    bus.subscribe('read.scroll-to-top', () => {
      this.scrollToTop();
    });
    bus.subscribe('read.scroll-to-verse', (verseIdx) => {
      this.scrollToVerse(verseIdx);
    });
    bus.subscribe('read.show', () => {
      this.show();
    });
    bus.subscribe('read.strong-mode.update', (strongMode) => {
      this.strongModeUpdate(strongMode);
    });

    bus.subscribe('search.hide', () => {
      this.searchHide();
    });
    bus.subscribe('search.show', () => {
      this.searchShow();
    });

    bus.subscribe('setting.hide', () => {
      this.settingHide();
    });
    bus.subscribe('setting.show', () => {
      this.settingShow();
    });

    bus.subscribe('strong.hide', () => {
      this.strongHide();
    });
    bus.subscribe('strong.show', () => {
      this.strongShow();
    });

    bus.subscribe('sidebar.update', (sidebar) => {
      this.sidebarUpdate(sidebar);
    });

    bus.subscribe('theme.update', (theme) => {
      this.themeUpdate(theme);
    });
  }

  toolbarLowerClick(event) {
    event.preventDefault();
    let target = event.target.closest('button');
    if (target) {
      if (target === this.btnStrongMode ||
        target === this.btnColumnMode ||
        !target.classList.contains('btn-icon--active')
      ) {
        if (target === this.btnNavigator) {
          bus.publish('sidebar.select', 'navigator');
        } else if (target === this.btnBookmark) {
          bus.publish('sidebar.select', 'bookmark');
        } else if (target === this.btnSearch) {
          bus.publish('sidebar.select', 'search');
        } else if (target === this.btnStrong) {
          bus.publish('sidebar.select', 'strong');
        } else if (target === this.btnSetting) {
          bus.publish('sidebar.select', 'setting');
        } else if (target === this.btnHelp) {
          bus.publish('sidebar.select', 'help');
        } else if (target === this.btnColumnMode) {
          bus.publish('read.column-mode.click', null);
        } else if (target === this.btnStrongMode) {
          bus.publish('read.strong-mode.click', null);
        }
      }
    }
  }

  toolbarUpperClick(event) {
    event.preventDefault();
    let target = event.target.closest('button');
    if (target) {
      if (target === this.btnPrev) {
        bus.publish('read.prev.chapter', 1);
      } else if (target === this.btnNext) {
        bus.publish('read.next.chapter', 2);
      }
    }
  }

  themeUpdate(theme) {
    this.theme = theme;
    this.changeTheme();
    this.lastTheme = this.theme;
  }

  updateBanner() {
    this.banner.textContent = tomeChapters[this.chapterIdx][chapterName];
  }

  updateColumnMode() {
    if (this.columnMode) {
      this.list.classList.add('list--read-column');
    } else {
      this.list.classList.remove('list--read-column');
    }
  }

  updateColumnModeBtn() {
    if (this.columnMode) {
      this.btnColumnMode.classList.add('btn-icon--active');
    } else {
      this.btnColumnMode.classList.remove('btn-icon--active');
    }
  }

  updateFont() {
    if (this.lastFont) {
      this.list.classList.remove(this.lastFont.fontClass);
    }
    this.list.classList.add(this.font.fontClass);
  }

  updateFontSize() {
    if (this.lastFontSize) {
      this.list.classList.remove(this.lastFontSize);
    }
    this.list.classList.add(this.fontSize);
  }

  updateVerses() {
    removeAllChildren(this.list);
    let fragment = document.createDocumentFragment();
    for (let verseObj of this.verseObjs) {
      let verse = this.buildVerse(verseObj);
      fragment.appendChild(verse);
    }
    let lastVerse = templateElement('div', 'verse-last', null, null, null);
    fragment.appendChild(lastVerse);
    this.list.appendChild(fragment);
  }

  verseClick(verse) {
    let verseIdx = parseInt(verse.dataset.verseIdx);
    if (this.strongMode) {
      bus.publish('read.strong.select', verseIdx);
    } else if (verse.classList.contains('verse--bookmark')) {
      bus.publish('read.bookmark.delete', verseIdx);
    } else {
      bus.publish('read.bookmark.add', verseIdx);
    }
  }

  windowResize() {
    bus.publish('window.resize', null);
  }

}

export { ReadView };
