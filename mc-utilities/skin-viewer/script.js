function loadUsername() {
  const input = document.getElementById('username');
  const name = input.value.trim();
  if (!name) return;

  loadSkin(name).catch(err => {
    console.error(err);
    const status = document.getElementById('status');
    if (status) status.textContent = err.message;
  });
}

loadUsername();
