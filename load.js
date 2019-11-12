'use strict';

let prod = true;
// let prod = false;
let updateFound = false;
let newInstall = false;

window.onload = () => {
  console.log(`window.onload:      ${Date.now()}`);
  if (prod) {
    swEvents();
  } else {
    loadApp();
  }
};

let swEvents = () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.ready.then(() => {
      console.log(`sw.ready:           ${Date.now()}`);
      if (!updateFound) {
        loadApp();
      } else {
        newInstall = true;
        console.log(`new install:        ${Date.now()}`);
      }
    }).catch((error) => {
      console.log(`sw.ready error: ${error.message}`);
    });
  }

  navigator.serviceWorker.register('./sw.js').then((reg) => {
    console.log(`sw registered:      ${Date.now()}`);
    reg.onupdatefound = () => {
      updateFound = true;
      console.log(`reg.updatefound:    ${Date.now()}`);
      const newWorker = reg.installing;
      newWorker.onstatechange = (event) => {
        if (event.target.state === 'activated') {
          console.log(`nw.activated:       ${Date.now()}`);
          if (newInstall) {
            loadApp();
          } else {
            refresh();
          }
        }
      };
    };
  }).catch((error) => {
    console.log(`reg.error: ${error.message}`);
  });
};

let refresh = () => {
  console.log(`refresh():          ${Date.now()}`);
  // window.location.reload(true);
};

let loadApp = () => {
  console.log(`loadApp():          ${Date.now()}`);

  let loading = document.querySelector('.loading');
  loading.classList.add('loading--hide');

  let css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './css/kjs.css';
  document.head.appendChild(css);

  let font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = './css/font.css';
  document.head.appendChild(font);

  let script = document.createElement('script');
  script.type = 'module';
  script.src = './js/app.js';
  document.body.appendChild(script);
};
