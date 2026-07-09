function loadUsername() {
  const input = document.getElementById('username');
  const name = input.value.trim();
  if (!name) return;

  loadSkin(name)
    .then(() => {
      const url = new URL(window.location);
      url.searchParams.set('user', name);
      window.history.replaceState(null, '', url);
    })
    .catch(err => {
      console.error(err);
      const status = document.getElementById('status');
      if (status) status.textContent = err.message;
    });
}

const initialUser = new URLSearchParams(window.location.search).get('user');
if (initialUser) {
  document.getElementById('username').value = initialUser;
}
loadUsername();
