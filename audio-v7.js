(() => {
  'use strict';

  const PREF_KEY = 'faithWordsAudioPrefsV1';
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); }
    catch { return {}; }
  })();

  const prefs = window.FaithWordsPrefs = {
    musicEnabled: stored.musicEnabled !== false,
    sfxEnabled: stored.sfxEnabled !== false
  };

  const ui = {
    menuButton: document.getElementById('menuButton'),
    menu: document.getElementById('audioMenu'),
    musicToggle: document.getElementById('musicToggle'),
    sfxToggle: document.getElementById('sfxToggle'),
    nowPlaying: document.getElementById('nowPlaying'),
    startButton: document.getElementById('startButton')
  };

  const tracks = [
    {
      name: 'Amazing Grace',
      type: 'Hymn',
      bpm: 76,
      notes: [
        [62,1],[67,2],[71,1],[67,1],[71,2],[69,1],[67,2],[64,1],[62,2],
        [62,1],[67,2],[71,1],[67,1],[71,2],[69,1],[74,3],
        [71,1],[74,2],[71,1],[74,1],[71,2],[67,1],[64,2],[67,1],[67,2],
        [62,1],[67,2],[71,1],[67,1],[71,2],[69,1],[67,3]
      ]
    },
    {
      name: 'Ode to Joy — Beethoven',
      type: 'Classical',
      bpm: 92,
      notes: [
        [64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],
        [60,1],[60,1],[62,1],[64,1],[64,1.5],[62,.5],[62,2],
        [64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],
        [60,1],[60,1],[62,1],[64,1],[62,1.5],[60,.5],[60,2],
        [62,1],[62,1],[64,1],[60,1],[62,1],[64,.5],[65,.5],[64,1],[60,1],
        [62,1],[64,.5],[65,.5],[64,1],[62,1],[60,1],[62,1],[55,2]
      ]
    },
    {
      name: 'Prelude in C — Bach',
      type: 'Classical',
      bpm: 78,
      arpeggio: true,
      notes: [
        [60,.5],[64,.5],[67,.5],[72,.5],[76,.5],[67,.5],[72,.5],[76,.5],
        [59,.5],[62,.5],[67,.5],[71,.5],[74,.5],[67,.5],[71,.5],[74,.5],
        [57,.5],[60,.5],[64,.5],[69,.5],[72,.5],[64,.5],[69,.5],[72,.5],
        [55,.5],[59,.5],[62,.5],[67,.5],[71,.5],[62,.5],[67,.5],[71,.5],
        [53,.5],[57,.5],[60,.5],[65,.5],[69,.5],[60,.5],[65,.5],[69,.5],
        [55,.5],[60,.5],[64,.5],[67,.5],[72,.5],[64,.5],[67,.5],[72,.5],
        [60,.5],[64,.5],[67,.5],[72,.5],[76,.5],[67,.5],[72,.5],[76,.5]
      ]
    },
    {
      name: 'Holy, Holy, Holy',
      type: 'Hymn',
      bpm: 82,
      notes: [
        [67,1],[67,1],[71,1],[71,1],[72,1],[71,1],[69,1],[67,2],
        [69,1],[69,1],[67,1],[64,1],[62,1],[64,1],[67,2],
        [67,1],[67,1],[71,1],[71,1],[72,1],[74,1],[72,1],[71,2],
        [69,1],[67,1],[64,1],[62,1],[60,1],[62,1],[67,3]
      ]
    }
  ];

  let audioCtx = null;
  let musicGain = null;
  let trackTimer = null;
  let activeNodes = new Set();
  let trackIndex = Math.floor(Math.random() * tracks.length);
  let playing = false;
  let playHasStarted = false;

  function persist() {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  }

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      musicGain = audioCtx.createGain();
      musicGain.gain.value = 0.20;
      musicGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function scheduleNote(midi, when, duration, volume, arpeggio = false) {
    if (!audioCtx || !musicGain) return;

    const osc = audioCtx.createOscillator();
    const overtone = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const overtoneGain = audioCtx.createGain();
    const freq = midiToFrequency(midi);

    osc.type = arpeggio ? 'sine' : 'triangle';
    overtone.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    overtone.frequency.setValueAtTime(freq * 2, when);

    const attack = Math.min(.05, duration * .18);
    const releaseStart = Math.max(when + attack, when + duration - .16);
    gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + attack);
    gain.gain.setValueAtTime(volume, releaseStart);
    gain.gain.exponentialRampToValueAtTime(.0001, when + duration);

    overtoneGain.gain.setValueAtTime(.0001, when);
    overtoneGain.gain.exponentialRampToValueAtTime(volume * .18, when + attack);
    overtoneGain.gain.setValueAtTime(volume * .18, releaseStart);
    overtoneGain.gain.exponentialRampToValueAtTime(.0001, when + duration);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    gain.connect(musicGain);
    overtoneGain.connect(musicGain);

    activeNodes.add(osc);
    activeNodes.add(overtone);
    const cleanup = () => {
      activeNodes.delete(osc);
      activeNodes.delete(overtone);
    };
    overtone.addEventListener('ended', cleanup, { once: true });

    osc.start(when);
    overtone.start(when);
    osc.stop(when + duration + .02);
    overtone.stop(when + duration + .02);
  }

  function scheduleTrack(track) {
    const ctx = ensureAudio();
    if (!ctx || !prefs.musicEnabled || !playHasStarted) return;

    const beat = 60 / track.bpm;
    let cursor = ctx.currentTime + .12;
    const noteVolume = track.arpeggio ? .050 : .042;

    for (const [midi, beats] of track.notes) {
      const duration = Math.max(.16, beat * beats * .90);
      scheduleNote(midi, cursor, duration, noteVolume, !!track.arpeggio);
      cursor += beat * beats;
    }

    if (ui.nowPlaying) {
      ui.nowPlaying.innerHTML = `<strong>${track.type}:</strong> ${track.name}<br><span>Gentle synthesized arrangement of a public-domain melody.</span>`;
    }

    const delayMs = Math.max(1000, (cursor - ctx.currentTime + 2.2) * 1000);
    trackTimer = setTimeout(() => {
      if (!prefs.musicEnabled || !playHasStarted) return;
      trackIndex = (trackIndex + 1) % tracks.length;
      scheduleTrack(tracks[trackIndex]);
    }, delayMs);
  }

  function stopMusic() {
    clearTimeout(trackTimer);
    trackTimer = null;
    activeNodes.forEach(node => {
      try { node.stop(); } catch {}
    });
    activeNodes.clear();
    playing = false;
    if (musicGain && audioCtx) {
      try {
        musicGain.gain.cancelScheduledValues(audioCtx.currentTime);
        musicGain.gain.setValueAtTime(.0001, audioCtx.currentTime);
      } catch {}
    }
  }

  function startMusic() {
    if (!prefs.musicEnabled || !playHasStarted || playing) return;
    ensureAudio();
    if (musicGain && audioCtx) {
      musicGain.gain.cancelScheduledValues(audioCtx.currentTime);
      musicGain.gain.setValueAtTime(.20, audioCtx.currentTime);
    }
    playing = true;
    scheduleTrack(tracks[trackIndex]);
  }

  function setMusicEnabled(enabled) {
    prefs.musicEnabled = !!enabled;
    persist();
    updateControls();
    if (prefs.musicEnabled) startMusic();
    else stopMusic();
  }

  function setSfxEnabled(enabled) {
    prefs.sfxEnabled = !!enabled;
    persist();
    updateControls();
  }

  function updateControls() {
    if (ui.musicToggle) ui.musicToggle.checked = prefs.musicEnabled;
    if (ui.sfxToggle) ui.sfxToggle.checked = prefs.sfxEnabled;
    if (ui.menuButton) {
      const muted = !prefs.musicEnabled && !prefs.sfxEnabled;
      ui.menuButton.setAttribute('aria-label', muted ? 'Open menu, audio off' : 'Open menu');
    }
    if (ui.nowPlaying && !prefs.musicEnabled) {
      ui.nowPlaying.innerHTML = '<strong>Music off.</strong><br><span>Turn it on to hear hymns and classical melodies.</span>';
    }
  }

  function toggleMenu(force) {
    if (!ui.menu || !ui.menuButton) return;
    const open = typeof force === 'boolean' ? force : !ui.menu.classList.contains('open');
    ui.menu.classList.toggle('open', open);
    ui.menuButton.setAttribute('aria-expanded', String(open));
  }

  ui.menuButton?.addEventListener('click', event => {
    event.stopPropagation();
    toggleMenu();
  });

  ui.menu?.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('click', () => toggleMenu(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') toggleMenu(false);
  });

  ui.musicToggle?.addEventListener('change', () => setMusicEnabled(ui.musicToggle.checked));
  ui.sfxToggle?.addEventListener('change', () => setSfxEnabled(ui.sfxToggle.checked));

  ui.startButton?.addEventListener('click', () => {
    playHasStarted = true;
    if (prefs.musicEnabled) startMusic();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopMusic();
    } else if (prefs.musicEnabled && playHasStarted) {
      startMusic();
    }
  });

  window.addEventListener('pagehide', stopMusic);

  window.FaithWordsAudio = {
    get musicEnabled() { return prefs.musicEnabled; },
    get sfxEnabled() { return prefs.sfxEnabled; },
    setMusicEnabled,
    setSfxEnabled,
    startMusic,
    stopMusic
  };

  updateControls();
})();
