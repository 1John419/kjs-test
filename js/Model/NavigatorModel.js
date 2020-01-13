'use strict';

import { bus } from '../EventBus.js';
import {
  tomeChapters,
  tomeDb
} from '../data/tomeDb.js';
import {
  chapterBookIdx,
  chapterFirstVerseIdx,
  chapterLastVerseIdx
} from '../data/tomeIdx.js';
import {
  appPrefix,
  range
} from '../util.js';

const validTasks = ['navigator-book', 'navigator-chapter'];

const IDX_GENESIS_1 = 0;

class NavigatorModel {

  constructor() {
    this.initialize();
  }

  chapterNext() {
    let nextChapterIdx = this.chapterIdx + 1;
    if (nextChapterIdx >= tomeChapters.length) {
      nextChapterIdx = 0;
    }
    this.chapterIdxChange(nextChapterIdx);
  }

  chapterPrev() {
    let prevChapterIdx = this.chapterIdx - 1;
    if (prevChapterIdx < 0) {
      prevChapterIdx = tomeChapters.length - 1;
    }
    this.chapterIdxChange(prevChapterIdx);
  }

  initialize() {
    this.subscribe();
  }

  async chapterIdxChange(chapterIdx) {
    this.chapterIdx = chapterIdx;
    this.saveChapterIdx();
    await this.updateVerses();
    let bookIdx = tomeChapters[this.chapterIdx][chapterBookIdx];
    bus.publish('bookIdx.change', bookIdx);
    bus.publish('chapterIdx.update', this.chapterIdx);
  }

  restore() {
    this.restoreTask();
    this.restoreChapterIdx();
  }

  restoreChapterIdx() {
    let defaultIdx = IDX_GENESIS_1;
    let chapterIdx = localStorage.getItem(`${appPrefix}-chapterIdx`);
    if (!chapterIdx) {
      chapterIdx = defaultIdx;
    } else {
      try {
        chapterIdx = JSON.parse(chapterIdx);
      } catch (error) {
        chapterIdx = defaultIdx;
      }
      if (!tomeChapters.includes(chapterIdx)) {
        chapterIdx = defaultIdx;
      }
    }
    this.chapterIdxChange(chapterIdx);
  }

  restoreTask() {
    let defaultTask = 'navigator-book';
    let navigatorTask = localStorage.getItem(`${appPrefix}-navigatorTask`);
    if (!navigatorTask) {
      navigatorTask = defaultTask;
    } else {
      try {
        navigatorTask = JSON.parse(navigatorTask);
      } catch (error) {
        navigatorTask = defaultTask;
      }
    }
    if (!validTasks.includes(navigatorTask)) {
      navigatorTask = defaultTask;
    }
    this.taskChange(navigatorTask);
  }

  saveChapterIdx() {
    localStorage.setItem(`${appPrefix}-chapterIdx`,
      JSON.stringify(this.chapterIdx));
  }

  saveNavigatorTask() {
    localStorage.setItem(`${appPrefix}-navigatorTask`,
      JSON.stringify(this.navigatorTask));
  }

  subscribe() {
    bus.subscribe('chapter.next', () => {
      this.chapterNext();
    });
    bus.subscribe('chapter.prev', () => {
      this.chapterPrev();
    });

    bus.subscribe('chapterIdx.change', (chapterIdx) => {
      this.chapterIdxChange(chapterIdx);
    });

    bus.subscribe('navigator.restore', () => {
      this.restore();
    });
    bus.subscribe('navigator.task.change', (navigatorTask) => {
      this.taskChange(navigatorTask);
    });
  }

  taskChange(navigatorTask) {
    this.navigatorTask = navigatorTask;
    this.saveNavigatorTask();
    bus.publish('navigator.task.update', this.navigatorTask);
  }

  async updateVerses() {
    let chapter = tomeChapters[this.chapterIdx];
    let keys = range(chapter[chapterFirstVerseIdx],
      chapter[chapterLastVerseIdx] + 1);
    this.verseObjs = await tomeDb.verses.bulkGet(keys);
    bus.publish('navigator.verses.update', this.verseObjs);
  }

}

export { NavigatorModel };
