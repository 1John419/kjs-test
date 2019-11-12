'use strict';

import { bus } from '../EventBus.js';

import { tome } from '../Tome/tome.js';

import {
  idxBook,
  idxLongName,
  idxShortName
} from '../tomeIdx.js';

import {
  templateElement,
  templatePage,
  templateScroll,
  templateToolbarLower,
  templateToolbarUpper
} from '../template.js';

const greekFirstIdx = 39;
const indices = [...Array(66).keys()];

const lowerToolSet = [
  { type: 'btn', icon: 'back', label: 'Back' },
  { type: 'btn', icon: 'navigator-chapter', label: 'Chapter' }
];

const upperToolSet = [
  { type: 'banner', modifier: 'navigator-book', text: 'Book' }
];

class NavigatorBookView {

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
  }

  bookChange(bookIdx) {
    let activeBtn = this.list.querySelector('.btn-book--active');
    if (activeBtn) {
      activeBtn.classList.remove('btn-book--active');
    }
    let selector = `.btn-book[data-book-idx="${bookIdx}"]`;
    activeBtn = this.list.querySelector(selector);
    activeBtn.classList.add('btn-book--active');
  }

  buildBookDivider() {
    let divider = document.createElement('hr');
    divider.classList.add('book-divider');
    return divider;
  }

  buildBooklist() {
    let booksHebrew = this.buildHebrewList();
    let booksGreek = this.buildGreekList();
    let divider = this.buildBookDivider();
    this.list.appendChild(booksHebrew);
    this.list.appendChild(divider);
    this.list.appendChild(booksGreek);
  }

  buildBtnBook(book) {
    let btn = document.createElement('button');
    btn.classList.add('btn-book');
    btn.dataset.bookIdx = book[idxBook];
    btn.textContent = book[idxShortName];
    btn.setAttribute('aria-label', book[idxLongName]);
    return btn;
  }

  buildGreekList() {
    let booksGreek = document.createElement('div');
    booksGreek.classList.add('content', 'content--greek-book');
    let greekIndices = indices.slice(greekFirstIdx);
    for (let idx of greekIndices) {
      let btn = this.buildBtnBook(tome.books[idx]);
      booksGreek.appendChild(btn);
    }
    return booksGreek;
  }

  buildHebrewList() {
    let booksHebrew = document.createElement('div');
    booksHebrew.classList.add('content', 'content--hebrew-book');
    let hebrewIndices = indices.slice(0, greekFirstIdx);
    for (let idx of hebrewIndices) {
      let btn = this.buildBtnBook(tome.books[idx]);
      booksHebrew.appendChild(btn);
    }
    return booksHebrew;
  }

  buildPage() {
    this.page = templatePage('navigator-book');

    this.toolbarUpper = templateToolbarUpper(upperToolSet);
    this.page.appendChild(this.toolbarUpper);

    this.scroll = templateScroll('navigator-book');
    this.list = templateElement('div', 'list', 'navigator-book', null, null);
    this.scroll.appendChild(this.list);
    this.page.appendChild(this.scroll);

    this.toolbarLower = templateToolbarLower(lowerToolSet);
    this.page.appendChild(this.toolbarLower);

    let container = document.querySelector('.container');
    container.appendChild(this.page);
  }

  contentClick(btn) {
    let bookIdx = btn.dataset.bookIdx;
    bus.publish('navigator-book.select', bookIdx);
  }

  getElements() {
    this.btnBack = this.toolbarLower.querySelector('.btn-icon--back');
    this.btnChapter = this.toolbarLower.querySelector('.btn-icon--navigator-chapter');
  }

  hide() {
    this.page.classList.add('page--hide');
  }

  initialize() {
    this.buildPage();
    this.getElements();
    this.addListeners();
    this.subscribe();

    this.buildBooklist();
  }

  listClick(event) {
    event.preventDefault();
    let target = event.target.closest('button');
    if (target) {
      if (target.classList.contains('btn-book')) {
        this.contentClick(target);
      }
    }
  }

  show() {
    this.page.classList.remove('page--hide');
  }

  panesUpdate(panes) {
    if (panes === 1) {
      this.btnBack.classList.remove('btn-icon--hide');
    } else {
      this.btnBack.classList.add('btn-icon--hide');
    }
  }

  subscribe() {
    bus.subscribe('book.change', (bookIdx) => {
      this.bookChange(bookIdx);
    });

    bus.subscribe('navigator-book.hide', () => {
      this.hide();
    });
    bus.subscribe('navigator-book.show', () => {
      this.show();
    });

    bus.subscribe('panes.update', (panes) => {
      this.panesUpdate(panes);
    });
  }

  toolbarLowerClick(event) {
    event.preventDefault();
    let target = event.target.closest('button');
    if (target) {
      if (target === this.btnBack) {
        bus.publish('navigator.back', null);
      } else if (target === this.btnChapter) {
        bus.publish('navigator-chapter', null);
      }
    }
  }

}

export { NavigatorBookView };
