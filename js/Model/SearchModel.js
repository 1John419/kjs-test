'use strict';

import { bus } from '../EventBus.js';

import { appPrefix } from '../util.js';

import { SearchEngine } from '../SearchEngine.js';

const validTasks = ['search-result', 'search-lookup', 'search-filter',
  'search-history'
];

class SearchModel {

  constructor() {
    this.initialize();
  }

  addHistory() {
    if (this.searchHistory.indexOf(this.serachQuery) === -1) {
      this.searchHistory = [this.serachQuery, ...this.searchHistory];
      this.updateHistory();
    }
  }

  filterChange(searchFilter) {
    this.searchFilter = searchFilter;
    this.saveFilter();
    bus.publish('search.filter.update', this.searchFilter);
  }

  filterIsValid(searchFilter) {
    let result = false;
    if (typeof searchFilter === 'object') {
      if (searchFilter.bookIdx && searchFilter.chapterIdx) {
        result = true;
      }
    }
    return result;
  }

  historyChange(searchHistory) {
    this.searchHistory = searchHistory;
    this.saveHistory();
    bus.publish('search.history.update', this.searchHistory);
  }

  historyClear() {
    this.searchHistory = [];
    this.updateHistory();
  }

  historyDelete(str) {
    let index = this.searchHistory.indexOf(str);
    this.searchHistory.splice(index, 1);
    this.updateHistory();
  }

  historyDown(str) {
    let index = this.searchHistory.indexOf(str);
    if (index !== (this.searchHistory.length - 1) && index !== -1) {
      this.reorderHistory(index, index + 1);
      this.updateHistory();
    }
  }

  historyIsValid(searchHistory) {
    return searchHistory.some((x) => {
      return typeof x === 'string';
    });
  }

  historyUp(str) {
    let index = this.searchHistory.indexOf(str);
    if (index !== 0 && index !== -1) {
      this.reorderHistory(index, index - 1);
      this.updateHistory();
    }
  }

  initialize() {
    this.engine = new SearchEngine();
    this.subscribe();
  }

  modeChange(strongMode) {
    this.strongMode = strongMode;
    this.saveMode();
    bus.publish('search.strong.mode.update', this.strongMode);
  }

  modeToogle() {
    this.modeChange(!this.strongMode);
  }

  queryChange(searchQuery) {
    let rig = this.engine.performSearch(searchQuery);
    if (rig.state === 'ERROR') {
      let message;
      if (rig.type === 'EMPTY') {
        message = 'Enter a search expression.';
      } else if (rig.type === 'INVALID') {
        message = 'Invalid query expression.';
      } else if (rig.tomeWords !== 'OK') {
        message = rig.tomeWords;
      }
      bus.publish('search.query.error', message);
    } else {
      this.rig = rig;
      this.serachQuery = searchQuery;
      this.saveQuery();
      this.addHistory();
      bus.publish('search.query.update', this.serachQuery);
      bus.publish('rig.update', this.rig);
      this.resetFilter();
    }
  }

  reorderHistory(fromIdx, toIdx) {
    this.searchHistory.splice(toIdx, 0, this.searchHistory.splice(fromIdx, 1)[0]);
  }

  resetFilter() {
    let filter = this.tomeFilter();
    this.filterChange(filter);
  }

  restore() {
    this.restoreHistory();
    this.restoreQuery();
    this.restoreFilter();
    this.restoreMode();
    this.restoreTask();
  }

  restoreFilter() {
    let defaultFilter = this.tomeFilter();
    let searchFilter = localStorage.getItem(`${appPrefix}-searchFilter`);
    if (!searchFilter) {
      searchFilter = defaultFilter;
    } else {
      try {
        searchFilter = JSON.parse(searchFilter);
      } catch (error) {
        searchFilter = defaultFilter;
      }
      if (!this.filterIsValid(searchFilter)) {
        searchFilter = defaultFilter;
      }
    }
    this.filterChange(searchFilter);
  }

  restoreHistory() {
    let defaultHistory = [];
    let searchHistory = localStorage.getItem(`${appPrefix}-searchHistory`);
    if (!searchHistory) {
      searchHistory = defaultHistory;
    } else {
      try {
        searchHistory = JSON.parse(searchHistory);
      } catch (error) {
        searchHistory = defaultHistory;
      }
      if (!Array.isArray(searchHistory)) {
        searchHistory = defaultHistory;
      } else {
        if (!this.historyIsValid(searchHistory)) {
          searchHistory = defaultHistory;
        }
      }
    }
    this.historyChange(searchHistory);
  }

  restoreMode() {
    let defaultMode = false;
    let strongMode = localStorage.getItem(`${appPrefix}-searchStrongMode`);
    if (!strongMode) {
      strongMode = defaultMode;
    } else {
      try {
        strongMode = JSON.parse(strongMode);
      } catch (error) {
        strongMode = defaultMode;
      }
      if (typeof strongMode !== 'boolean') {
        strongMode = defaultMode;
      }
    }
    this.modeChange(strongMode);
  }

  restoreQuery() {
    let defaultQuery = 'day of the lord';
    let searchQuery = localStorage.getItem(`${appPrefix}-searchQuery`);
    if (!searchQuery) {
      searchQuery = defaultQuery;
    } else {
      try {
        searchQuery = JSON.parse(searchQuery);
      } catch (error) {
        searchQuery = defaultQuery;
      }
      if (typeof searchQuery !== 'string') {
        searchQuery = defaultQuery;
      }
    }
    this.queryChange(searchQuery);
  }

  restoreTask() {
    let defaultTask = 'search-result';
    let searchTask = localStorage.getItem(`${appPrefix}-searchTask`);
    if (!searchTask) {
      searchTask = defaultTask;
    } else {
      searchTask = JSON.parse(searchTask);
    }
    if (!validTasks.includes(searchTask)) {
      searchTask = defaultTask;
    }
    this.taskChange(searchTask);
  }

  saveFilter() {
    localStorage.setItem(`${appPrefix}-searchFilter`,
      JSON.stringify(this.searchFilter));
  }

  saveHistory() {
    localStorage.setItem(`${appPrefix}-searchHistory`,
      JSON.stringify(this.searchHistory));
  }

  saveMode() {
    localStorage.setItem(`${appPrefix}-searchStrongMode`,
      JSON.stringify(this.strongMode));
  }

  saveQuery() {
    localStorage.setItem(`${appPrefix}-searchQuery`,
      JSON.stringify(this.serachQuery));
  }

  saveTask() {
    localStorage.setItem(`${appPrefix}-searchTask`,
      JSON.stringify(this.searchTask));
  }

  subscribe() {
    bus.subscribe('search.filter.change', (filter) => {
      this.filterChange(filter);
    });

    bus.subscribe('search.history.clear', () => {
      this.historyClear();
    });
    bus.subscribe('search.history.delete', (query) => {
      this.historyDelete(query);
    });
    bus.subscribe('search.history.down', (query) => {
      this.historyDown(query);
    });
    bus.subscribe('search.history.up', (query) => {
      this.historyUp(query);
    });

    bus.subscribe('search.query.change', (query) => {
      this.queryChange(query);
    });

    bus.subscribe('search.restore', () => {
      this.restore();
    });
    bus.subscribe('search.strong.mode.toggle', () => {
      this.modeToogle();
    });
    bus.subscribe('search.task.change', (searchTask) => {
      this.taskChange(searchTask);
    });
  }

  taskChange(searchTask) {
    this.searchTask = searchTask;
    this.saveTask();
    bus.publish('search.task.update', this.searchTask);
  }

  tomeFilter() {
    return {
      bookIdx: -1,
      chapterIdx: -1
    };
  }

  updateHistory() {
    this.saveHistory();
    bus.publish('search.history.update', this.searchHistory);
  }

}

export { SearchModel };
