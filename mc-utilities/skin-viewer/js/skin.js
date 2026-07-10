const skin3d = {
  uuid: null,
  username: null
};

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    let image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load texture: ${url}`));
    image.src = url;
  });
}

function feedViewerEngine(image) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Could not encode skin texture'));
      const file = new File([blob], 'skin.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const loadSkinInput = document.getElementById('load_skin');
      loadSkinInput.files = dataTransfer.files;
      loadSkinInput.dispatchEvent(new Event('change', { bubbles: true }));
      resolve();
    }, 'image/png');
  });
}

function updateSceneCharacterIcon(image) {
  const steve = document.querySelector('.light-steve');
  if (!steve) return;
  const scale = image.width / 64;
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 8 * scale, 8 * scale, 8 * scale, 8 * scale, 0, 0, 8, 8);
  steve.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
}

function waitForAvatarEngine() {
  return new Promise((resolve) => {
    const output = document.getElementById('output');
    if (output.querySelector('img.ava')) return resolve();
    const observer = new MutationObserver(() => {
      if (output.querySelector('img.ava')) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(output, { childList: true });
  });
}

async function loadSkin(username) {
  const status = document.getElementById('status');
  const info = document.getElementById('player-info');
  if (status) status.textContent = `Loading skin for ${username}...`;
  if (info) info.textContent = '';

  const res = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error(`Player "${username}" not found`);
  const json = await res.json();
  const player = json.data.player;

  const skinImg = await loadTexture(player.skin_texture);

  if (status) status.textContent = '';
  if (info) {
    info.innerHTML = '';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-name';
    nameSpan.textContent = player.username;
    const uuidSpan = document.createElement('span');
    uuidSpan.className = 'player-uuid';
    uuidSpan.textContent = player.id;
    info.appendChild(nameSpan);
    info.appendChild(uuidSpan);
  }
  skin3d.uuid = player.id;
  skin3d.username = player.username;
  updateSceneCharacterIcon(skinImg);

  await feedViewerEngine(skinImg);
  waitForAvatarEngine().then(revealAdvancedTabs);
}
