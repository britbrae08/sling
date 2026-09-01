(() => {
  'use strict';

  const levelPickerButton = document.getElementById('levelPickerButton');
  const levelDrawer = document.getElementById('levelDrawer');
  const audioMenu = document.getElementById('audioMenu');
  const menuButton = document.getElementById('menuButton');

  if (!levelPickerButton || !levelDrawer) return;

  levelPickerButton.addEventListener('click', () => {
    audioMenu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    levelDrawer.classList.add('open');
  });
})();
