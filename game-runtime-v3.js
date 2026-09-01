(() => {
  'use strict';

  async function boot() {
    const response = await fetch('./game-v3.js?build=wordscapes-ramp-v3', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load FaithWords (${response.status})`);
    let source = await response.text();

    source = source.replace(
      "const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';",
      "const DICTIONARY_API = 'https://freedictionaryapi.com/api/v1/entries/en/';"
    );

    // Keep the Grace crossword connected: GEAR remains a valid bonus word,
    // but is not required on the board.
    source = source.replace(
      "theme: 'Grace', letters: 'GRACE', words: ['GRACE', 'RACE', 'CARE', 'GEAR', 'AGE'],",
      "theme: 'Grace', letters: 'GRACE', words: ['GRACE', 'RACE', 'CARE', 'AGE'],"
    );

    // A disconnected fallback must never spin forever if a future word set
    // cannot cross cleanly with the current board.
    source = source.replace(
      "        let nextRow = Math.max(...rows) + 2;\n        while (!canPlace(item.word, nextRow, 0, 'h')) nextRow += 2;\n        place(item, nextRow, 0, 'h');",
      "        const nextRow = Math.max(...rows) + 2;\n        place(item, nextRow, 0, 'h');"
    );

    const script = document.createElement('script');
    script.textContent = `${source}\n//# sourceURL=faithwords-runtime-v3.js`;
    document.head.appendChild(script);
  }

  boot().catch(error => {
    console.error(error);
    const message = document.getElementById('message');
    if (message) {
      message.textContent = 'Reload FaithWords to continue.';
      message.classList.add('bad');
    }
  });
})();
