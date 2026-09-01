(() => {
  'use strict';

  const button = document.getElementById('googleAuthButton');
  const status = document.getElementById('googleAccountStatus');
  if (!button || !status) return;

  const CLIENT_ID = (document.querySelector('meta[name="faithwords-google-client-id"]')?.content || '').trim();
  const PROGRESS_KEY = 'faithWordsProgressV3';
  const FILE_NAME = 'faithwords-progress.json';
  const SCOPE = 'openid email profile https://www.googleapis.com/auth/drive.appdata';

  let tokenClient = null;
  let accessToken = '';
  let fileId = '';
  let signedIn = false;
  let saveTimer = null;

  function setStatus(text) {
    status.textContent = text;
  }

  function currentProgress() {
    if (window.FaithWordsGame?.exportProgress) return window.FaithWordsGame.exportProgress();
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
    catch { return {}; }
  }

  function progressScore(progress) {
    const unlocked = Number(progress?.unlocked) || 1;
    const completed = Object.values(progress?.completed || {}).filter(Boolean).length;
    const hintPoints = Number(progress?.hintPoints) || 0;
    return unlocked * 100000 + completed * 1000 + hintPoints;
  }

  function loadGoogleIdentity() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('googleIdentityScript');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = 'googleIdentityScript';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('Google sign-in could not load.')), { once: true });
      document.head.append(script);
    });
  }

  function authHeaders(extra = {}) {
    return { Authorization: `Bearer ${accessToken}`, ...extra };
  }

  async function getUserEmail() {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: authHeaders()
    });
    if (!response.ok) return '';
    const data = await response.json();
    return data.email || data.name || '';
  }

  async function findProgressFile() {
    const params = new URLSearchParams({
      spaces: 'appDataFolder',
      q: `name='${FILE_NAME}' and trashed=false`,
      fields: 'files(id,name,modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: '1'
    });
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: authHeaders()
    });
    if (!response.ok) throw new Error('Could not read Google Drive progress.');
    const data = await response.json();
    fileId = data.files?.[0]?.id || '';
    return fileId;
  }

  async function readRemoteProgress() {
    if (!fileId && !(await findProgressFile())) return null;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
      headers: authHeaders()
    });
    if (!response.ok) throw new Error('Could not restore Google progress.');
    return response.json();
  }

  async function createRemoteProgress(snapshot) {
    const boundary = `faithwords_${Math.random().toString(36).slice(2)}`;
    const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] });
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metadata,
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      JSON.stringify(snapshot),
      `--${boundary}--`,
      ''
    ].join('\r\n');

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': `multipart/related; boundary=${boundary}` }),
      body
    });
    if (!response.ok) throw new Error('Could not create Google progress save.');
    const data = await response.json();
    fileId = data.id || '';
  }

  async function writeRemoteProgress(progress = currentProgress()) {
    if (!signedIn || !accessToken) return;
    const snapshot = { version: 1, savedAt: Date.now(), progress };
    if (!fileId) await findProgressFile();

    if (!fileId) {
      await createRemoteProgress(snapshot);
    } else {
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(snapshot)
      });
      if (!response.ok) throw new Error('Could not update Google progress.');
    }
    setStatus('Progress saved to Google');
  }

  async function syncAfterSignIn() {
    setStatus('Checking saved progress…');
    const local = currentProgress();
    const remote = await readRemoteProgress();

    if (remote?.progress && progressScore(remote.progress) > progressScore(local)) {
      if (window.FaithWordsGame?.importProgress) {
        window.FaithWordsGame.importProgress(remote.progress);
      } else {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(remote.progress));
      }
      setStatus('Google progress restored');
      return;
    }

    await writeRemoteProgress(local);
  }

  function requestAccessToken() {
    return new Promise((resolve, reject) => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        prompt: 'select_account',
        callback: response => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          accessToken = response.access_token || '';
          resolve();
        }
      });
      tokenClient.requestAccessToken();
    });
  }

  async function signIn() {
    if (!CLIENT_ID) {
      setStatus('Google sign-in needs OAuth setup');
      return;
    }

    button.disabled = true;
    setStatus('Opening Google sign-in…');
    try {
      await loadGoogleIdentity();
      await requestAccessToken();
      signedIn = true;
      const email = await getUserEmail();
      button.textContent = 'Sign out';
      button.classList.add('connected');
      setStatus(email ? `Signed in as ${email}` : 'Signed in with Google');
      await syncAfterSignIn();
    } catch (error) {
      console.error(error);
      signedIn = false;
      accessToken = '';
      setStatus('Google sign-in was not completed');
    } finally {
      button.disabled = false;
    }
  }

  function signOut() {
    if (accessToken && window.google?.accounts?.oauth2?.revoke) {
      try { window.google.accounts.oauth2.revoke(accessToken); } catch {}
    }
    clearTimeout(saveTimer);
    accessToken = '';
    fileId = '';
    signedIn = false;
    button.textContent = 'Sign in';
    button.classList.remove('connected');
    setStatus('Save progress across devices');
  }

  button.addEventListener('click', () => signedIn ? signOut() : signIn());

  window.addEventListener('faithwords-progress-changed', () => {
    if (!signedIn) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      writeRemoteProgress().catch(error => {
        console.error(error);
        setStatus('Google save will retry next change');
      });
    }, 1400);
  });
})();
