// URLSearchParams.set() on an existing key updates it in place without moving it, so
// whichever of "tab"/"user" gets written first would stay first forever. Rebuild the
// query string from scratch each time instead, so the order is always tab, then user.
function setUrlParams(updates) {
  const url = new URL(window.location);
  const tab = updates.tab ?? url.searchParams.get('tab');
  const user = updates.user ?? url.searchParams.get('user');
  url.search = '';
  if (tab) url.searchParams.set('tab', tab);
  if (user) url.searchParams.set('user', user);
  window.history.replaceState(null, '', url);
}

function showViewer(which) {
  const tabs = { '3d': 'viewer-3d', position: 'viewer-position', static: 'viewer-static', share: 'viewer-share' };
  for (const [key, panelId] of Object.entries(tabs)) {
    document.getElementById(panelId).classList.toggle('hidden', key !== which);
    document.getElementById(`tab-${key}-btn`).classList.toggle('active', key === which);
  }
  if (which === '3d' || which === 'position') moveCanvasMount(which);

  setUrlParams({ tab: which });
}

// The 3D Viewer and Position tabs share a single live WebGL canvas (the avatar-maker
// engine only ever creates one). appendChild on a node already in the DOM moves it
// without tearing down its WebGL context, so the pose/rotation survives the switch.
function moveCanvasMount(which) {
  const mount = document.getElementById('canvas-mount');
  const target = document.getElementById(which === '3d' ? 'viewer-3d' : 'viewer-position');
  target.appendChild(mount);
}

function revealAdvancedTabs() {
  document.getElementById('tab-position-btn').classList.remove('hidden');
  document.getElementById('tab-share-btn').classList.remove('hidden');
}

function loadUsername() {
  const input = document.getElementById('username');
  const name = input.value.trim();
  if (!name) return;

  loadSkin(name)
    .then(() => {
      setUrlParams({ user: name });
      updateRenderPreview();
    })
    .catch(err => {
      console.error(err);
      const status = document.getElementById('status');
      if (status) status.textContent = err.message;
    });
}

async function shareCurrentView() {
  const btn = document.getElementById('share-link-btn');
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: `${skin3d.username}'s Minecraft skin`, url });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = originalText; }, 1500);
  } catch (err) {
    console.error(err);
    alert('Could not copy the link. Please copy it from the address bar instead.');
  }
}

// Mirrors the yaw values used by VZGE's own "Quick Render" widget: Bust/Full
// (and Front Full, though 2D renders ignore angle) flip to y=-40, everything
// else flips to y=70, and "Back" always adds 180 on top of that.
function computeRenderYaw(type, flip, back) {
  let yaw = 0;
  if (flip) {
    yaw = (type === 'full' || type === 'frontfull' || type === 'bust') ? -40 : 70;
  }
  if (back) yaw += 180;
  return yaw;
}

const RENDER_SIZE = 512;

function vzgeUrl(type, size) {
  const flip = document.getElementById('render-flip').checked;
  const back = document.getElementById('render-back').checked;
  const yaw = computeRenderYaw(type, flip, back);
  const query = yaw !== 0 ? `?y=${yaw}` : '';
  return `https://vzge.me/${type}/${size}/${skin3d.uuid}${query}`;
}

let renderPreviewTimer = null;
function updateRenderPreview() {
  if (!skin3d.uuid) return;
  if (renderPreviewTimer) clearTimeout(renderPreviewTimer);
  renderPreviewTimer = setTimeout(() => {
    const type = document.getElementById('render-type').value;
    document.getElementById('render-preview').src = vzgeUrl(type, RENDER_SIZE);
  }, 300);
}

async function downloadRender() {
  if (!skin3d.uuid) return;
  const type = document.getElementById('render-type').value;
  const size = RENDER_SIZE;
  const btn = document.getElementById('render-download');
  const originalText = btn.textContent;
  btn.textContent = 'Downloading...';
  btn.disabled = true;

  try {
    const res = await fetch(vzgeUrl(type, size));
    if (!res.ok) throw new Error('Render failed');
    const blob = await res.blob();
    const flip = document.getElementById('render-flip').checked;
    const back = document.getElementById('render-back').checked;
    const suffix = [flip && 'flipped', back && 'back'].filter(Boolean).join('-');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${skin3d.username}-${type}-${size}${suffix ? '-' + suffix : ''}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (err) {
    console.error(err);
    alert('Could not download that render. Please try again.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

document.getElementById('render-type').addEventListener('input', updateRenderPreview);
document.getElementById('render-flip').addEventListener('input', updateRenderPreview);
document.getElementById('render-back').addEventListener('input', updateRenderPreview);
document.getElementById('render-download').addEventListener('click', downloadRender);

const initialUser = new URLSearchParams(window.location.search).get('user');
if (initialUser) {
  document.getElementById('username').value = initialUser;
}
loadUsername();

const initialTab = new URLSearchParams(window.location.search).get('tab');
if (['3d', 'position', 'static', 'share'].includes(initialTab)) {
  showViewer(initialTab);
}
