(function () {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
            });
        });
    }

    var sections = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('#nav a');

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    // Cycles the hero portrait between live VZGE renders of Zethal_'s current skin
    // (head from a few angles, plus a bust) so it always reflects whatever skin is
    // equipped, without baking any static image files.
    var portraitCycle = document.getElementById('portrait-cycle');
    if (portraitCycle) {
        var portraitImgs = Array.prototype.slice.call(portraitCycle.querySelectorAll('img'));
        var portraitIndex = 0;

        portraitImgs.forEach(function (img) {
            img.addEventListener('error', function () {
                var wasActive = img.classList.contains('active');
                var idx = portraitImgs.indexOf(img);
                if (idx === -1) return;
                portraitImgs.splice(idx, 1);
                img.remove();
                if (wasActive && portraitImgs.length) {
                    portraitIndex = idx % portraitImgs.length;
                    portraitImgs[portraitIndex].classList.add('active');
                }
            });
        });

        setInterval(function () {
            if (portraitImgs.length < 2) return;
            portraitImgs[portraitIndex].classList.remove('active');
            portraitIndex = (portraitIndex + 1) % portraitImgs.length;
            portraitImgs[portraitIndex].classList.add('active');
        }, 4000);
    }

    // To add a server, just add an entry here — the card, live logo, and
    // popup are all generated from this list.
    var SERVERS = [
        {
            name: 'Stoneworks',
            address: 'play.stoneworks.gg',
            tagline: 'A creative Minecraft server where I develop lore, stories, and other interactive experiences.'
        },
        {
            name: 'Raveris',
            address: 'play.raveris.cc',
            tagline: 'A seasonal server with interactive events.'
        }
    ];

    var serverGrid = document.getElementById('serverGrid');
    var serverModal = document.getElementById('serverModal');
    var serverModalOverlay = document.getElementById('serverModalOverlay');
    var serverModalClose = document.getElementById('serverModalClose');
    var serverModalLogo = document.getElementById('serverModalLogo');
    var serverModalTitle = document.getElementById('serverModalTitle');
    var serverModalStatus = document.getElementById('serverModalStatus');
    var serverModalStatusLoading = document.getElementById('serverModalStatusLoading');
    var serverModalStatusContent = document.getElementById('serverModalStatusContent');
    var serverModalStatusError = document.getElementById('serverModalStatusError');
    var serverModalBadge = document.getElementById('serverModalBadge');
    var serverModalPlayers = document.getElementById('serverModalPlayers');
    var serverModalMotd = document.getElementById('serverModalMotd');
    var lastFocusedCard = null;
    var statusRequestId = 0;
    var serverDataCache = {};

    if (serverGrid && SERVERS.length && serverModal && serverModalOverlay) {
        function getServerData(address) {
            if (!serverDataCache[address]) {
                serverDataCache[address] = fetch('https://api.mcsrvstat.us/3/' + encodeURIComponent(address))
                    .then(function (response) {
                        if (!response.ok) throw new Error('Bad response');
                        return response.json();
                    });
            }
            return serverDataCache[address];
        }

        function renderLogoImage(container, iconUrl, name) {
            var img = document.createElement('img');
            img.src = iconUrl;
            img.alt = name + ' logo';
            container.innerHTML = '';
            container.appendChild(img);
            container.classList.remove('server-logo-placeholder');
        }

        function buildServerCard(server) {
            var card = document.createElement('div');
            card.className = 'server-card';
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-haspopup', 'dialog');
            card.setAttribute('data-server-address', server.address);
            card.setAttribute('data-server-name', server.name);

            var logo = document.createElement('div');
            logo.className = 'server-logo server-logo-placeholder';
            logo.setAttribute('aria-hidden', 'true');
            logo.textContent = server.name.charAt(0).toUpperCase();

            var title = document.createElement('h3');
            title.textContent = server.name;

            var tagline = document.createElement('p');
            tagline.textContent = server.tagline;

            var hint = document.createElement('span');
            hint.className = 'server-card-hint';
            hint.textContent = 'View live status →';

            card.appendChild(logo);
            card.appendChild(title);
            card.appendChild(tagline);
            card.appendChild(hint);

            getServerData(server.address).then(function (data) {
                if (data && data.icon) {
                    renderLogoImage(logo, data.icon, server.name);
                }
            }).catch(function () {
                // Keep the letter placeholder if the API is unreachable.
            });

            return card;
        }

        SERVERS.forEach(function (server) {
            serverGrid.appendChild(buildServerCard(server));
        });

        var serverCards = serverGrid.querySelectorAll('.server-card');

        function showServerStatus(view) {
            serverModalStatusLoading.hidden = view !== 'loading';
            serverModalStatusContent.hidden = view !== 'content';
            serverModalStatusError.hidden = view !== 'error';
        }

        function loadServerStatus(address, requestId) {
            getServerData(address)
                .then(function (data) {
                    if (requestId !== statusRequestId) return;

                    if (data && data.icon) {
                        renderLogoImage(serverModalLogo, data.icon, serverModalTitle.textContent);
                    }

                    if (!data || !data.online) {
                        serverModalBadge.textContent = 'Offline';
                        serverModalBadge.className = 'server-status-badge offline';
                        serverModalPlayers.textContent = '';
                        serverModalMotd.textContent = '';
                        showServerStatus('content');
                        return;
                    }

                    serverModalBadge.textContent = 'Online';
                    serverModalBadge.className = 'server-status-badge online';
                    serverModalPlayers.textContent = data.players ?
                        data.players.online + ' / ' + data.players.max + ' players online' : '';
                    serverModalMotd.textContent = data.motd && data.motd.clean ? data.motd.clean.join('\n').trim() : '';
                    showServerStatus('content');
                })
                .catch(function () {
                    if (requestId !== statusRequestId) return;
                    showServerStatus('error');
                });
        }

        function openServerModal(card) {
            var logo = card.querySelector('.server-logo');
            var name = card.getAttribute('data-server-name');
            var address = card.getAttribute('data-server-address');

            serverModalLogo.innerHTML = logo ? logo.innerHTML : '';
            serverModalLogo.className = 'server-modal-logo' + (logo && logo.classList.contains('server-logo-placeholder') ? ' server-logo-placeholder' : '');
            serverModalTitle.textContent = name || '';

            statusRequestId += 1;
            if (address) {
                serverModalStatus.hidden = false;
                showServerStatus('loading');
                loadServerStatus(address, statusRequestId);
            } else {
                serverModalStatus.hidden = true;
            }

            lastFocusedCard = card;
            serverModal.hidden = false;
            serverModalOverlay.classList.add('show');
            requestAnimationFrame(function () {
                serverModal.classList.add('show');
            });
            serverModalClose.focus();
        }

        function closeServerModal() {
            serverModal.classList.remove('show');
            serverModalOverlay.classList.remove('show');
            setTimeout(function () {
                serverModal.hidden = true;
            }, 200);
            if (lastFocusedCard) {
                lastFocusedCard.focus();
            }
        }

        serverCards.forEach(function (card) {
            card.addEventListener('click', function () {
                openServerModal(card);
            });
            card.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openServerModal(card);
                }
            });
        });

        serverModalClose.addEventListener('click', closeServerModal);
        serverModalOverlay.addEventListener('click', closeServerModal);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && serverModal.classList.contains('show')) {
                closeServerModal();
            }
        });
    }
})();
