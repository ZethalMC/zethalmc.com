function showNotif(message) {
    const notifPopup = document.getElementById("notifPopup");
    notifPopup.innerHTML = message;
    notifPopup.style.display = "block";
    notifPopup.style.opacity = "1";

    setTimeout(() => {
        notifPopup.style.opacity = "0";
        setTimeout(() => {
            notifPopup.style.display = "none";
        }, 500);
    }, 5000);
}

const permissions = [
    { id: 'generalViewChannels', bit: 1024, label: 'View Channels', group: 'general' },
    { id: 'generalManageChannels', bit: 16, label: 'Manage Channels', group: 'general', twoFa: true },
    { id: 'generalManageRoles', bit: 268435456, label: 'Manage Roles', group: 'general', twoFa: true },
    { id: 'generalManageEmojis', bit: 1073741824, label: 'Manage Emojis and Stickers', group: 'general', twoFa: true },
    { id: 'generalViewAuditLog', bit: 128, label: 'View Audit Log', group: 'general' },
    { id: 'generalViewGuildInsights', bit: 524288, label: 'View Server Insights', group: 'general' },
    { id: 'generalManageWebhooks', bit: 536870912, label: 'Manage Webhooks', group: 'general', twoFa: true },
    { id: 'generalManageGuild', bit: 32, label: 'Manage Server', group: 'general', twoFa: true },
    { id: 'generalCreateInvite', bit: 1, label: 'Create Invite', group: 'general' },
    { id: 'generalChangeNickname', bit: 67108864, label: 'Change Nickname', group: 'general' },
    { id: 'generalManageNicknames', bit: 134217728, label: 'Manage Nicknames', group: 'general' },
    { id: 'generalKickMembers', bit: 2, label: 'Kick Members', group: 'general', twoFa: true },
    { id: 'generalBanMembers', bit: 4, label: 'Ban Members', group: 'general', twoFa: true },
    { id: 'generalManageEvents', bit: 8589934592, label: 'Manage Events', group: 'general', twoFa: true },
    { id: 'generalAdministrator', bit: 8, label: 'Administrator', group: 'general', twoFa: true },

    { id: 'textSendMessages', bit: 2048, label: 'Send Messages', group: 'text' },
    { id: 'textSendMessagesThreads', bit: 274877906944, label: 'Send Messages in Threads', group: 'text' },
    { id: 'textCreatePublicThreads', bit: 34359738368, label: 'Create Public Threads', group: 'text' },
    { id: 'textCreatePrivateThreads', bit: 68719476736, label: 'Create Private Threads', group: 'text' },
    { id: 'textEmbedLinks', bit: 16384, label: 'Embed Links', group: 'text' },
    { id: 'textAttachFiles', bit: 32768, label: 'Attach Files', group: 'text' },
    { id: 'textAddReactions', bit: 64, label: 'Add Reactions', group: 'text' },
    { id: 'textUseExternalEmojis', bit: 262144, label: 'Use External Emoji', group: 'text' },
    { id: 'textUseExternalStickers', bit: 137438953472, label: 'Use External Stickers', group: 'text' },
    { id: 'textMentionEveryone', bit: 131072, label: 'Mention @everyone, @here, and All Roles', group: 'text' },
    { id: 'textManageMessages', bit: 8192, label: 'Manage Messages', group: 'text', twoFa: true },
    { id: 'textManageThreads', bit: 17179869184, label: 'Manage Threads', group: 'text', twoFa: true },
    { id: 'textReadMessageHistory', bit: 65536, label: 'Read Message History', group: 'text' },
    { id: 'textSendTTSMessages', bit: 4096, label: 'Send Text-to-Speech Messages', group: 'text' },
    { id: 'textUseSlashCommands', bit: 2147483648, label: 'Use Application Commands', group: 'text' },

    { id: 'voiceConnect', bit: 1048576, label: 'Connect', group: 'voice' },
    { id: 'voiceSpeak', bit: 2097152, label: 'Speak', group: 'voice' },
    { id: 'voiceStream', bit: 512, label: 'Video', group: 'voice' },
    { id: 'voiceStartActivities', bit: 549755813888, label: 'Start Activities', group: 'voice' },
    { id: 'voiceUseVAD', bit: 33554432, label: 'Use Voice Activity', group: 'voice' },
    { id: 'voicePrioritySpeaker', bit: 256, label: 'Priority Speaker', group: 'voice' },
    { id: 'voiceMuteMembers', bit: 4194304, label: 'Mute Members', group: 'voice' },
    { id: 'voiceDeafenMembers', bit: 8388608, label: 'Deafen Members', group: 'voice' },
    { id: 'voiceMoveMembers', bit: 16777216, label: 'Move Members', group: 'voice' },
    { id: 'voiceStageRequestSpeak', bit: 4294967296, label: 'Request to Speak', group: 'voice' },
];

const groupLists = {
    general: document.getElementById('generalGroup'),
    text: document.getElementById('textGroup'),
    voice: document.getElementById('voiceGroup'),
};

permissions.forEach(perm => {
    const li = document.createElement('li');
    const container = document.createElement('div');
    container.className = 'checkbox-container';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = perm.id;

    const labelText = document.createElement('span');
    labelText.className = 'label-text';
    labelText.innerHTML = perm.twoFa
        ? `${perm.label} <span class="twofa-badge">2FA</span>`
        : perm.label;

    container.appendChild(input);
    container.appendChild(labelText);
    li.appendChild(container);
    groupLists[perm.group].appendChild(li);

    input.addEventListener('change', function () {
        container.classList.toggle('checked', this.checked);
        recalculate();
    });
});

const clientIdInput = document.getElementById('clientID');
const scopesInput = document.getElementById('oauthScopes');
const redirectInput = document.getElementById('oauthRedirect');
const codeGrantInput = document.getElementById('oauthCodeGrant');
const inviteLink = document.getElementById('invite');

let currentTotal = 0;

function computeTotal() {
    let total = 0;
    const parts = [];
    permissions.forEach(perm => {
        if (document.getElementById(perm.id).checked) {
            total += perm.bit;
            parts.push('0x' + perm.bit.toString(16));
        }
    });
    return { total, parts };
}

function updateInviteLink(total) {
    const clientId = clientIdInput.value.trim();

    if (clientId && /^\d{17,20}$/.test(clientId)) {
        clientIdInput.classList.remove('error');
        clientIdInput.classList.add('success');

        const scopes = scopesInput.value.trim() || 'bot';
        let url = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=${encodeURIComponent(scopes)}&permissions=${total}`;

        if (codeGrantInput.checked) {
            url += '&response_type=code';
        }
        const redirect = redirectInput.value.trim();
        if (redirect) {
            url += `&redirect_uri=${encodeURIComponent(redirect)}`;
        }

        inviteLink.href = url;
        inviteLink.textContent = url;
        inviteLink.classList.remove('disabled');
    } else {
        clientIdInput.classList.remove('success');
        clientIdInput.classList.toggle('error', !!clientId);

        inviteLink.href = '#';
        inviteLink.textContent = `https://discord.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=${total}`;
        inviteLink.classList.add('disabled');
    }
}

function refreshInviteLink() {
    updateInviteLink(currentTotal);
}

function recalculate(skipHash) {
    const { total, parts } = computeTotal();
    currentTotal = total;

    document.getElementById('number').textContent = total;
    document.getElementById('equation').textContent = parts.length ? `= ${parts.join(' | ')}` : '';

    if (!skipHash) setHash(String(total));
    updateInviteLink(total);
}

function getHash(hash) {
    hash = hash || window.location.hash;
    return hash && hash.length > 1 ? hash.substring(1) : null;
}

function setHash(value) {
    if (history.pushState) {
        history.pushState(null, null, '#' + value);
    } else {
        window.location.hash = '#' + value;
    }
}

function hasBit(total, bit) {
    if (bit >= 4294967296) {
        return Math.floor(total / 4294967296) & Math.floor(bit / 4294967296);
    }
    return Math.floor(total % 4294967296) & bit;
}

function syncCheckboxes(total) {
    permissions.forEach(perm => {
        const checkbox = document.getElementById(perm.id);
        const checked = !!hasBit(total, perm.bit);
        checkbox.checked = checked;
        checkbox.closest('.checkbox-container').classList.toggle('checked', checked);
    });
}

clientIdInput.addEventListener('input', refreshInviteLink);
scopesInput.addEventListener('input', refreshInviteLink);
redirectInput.addEventListener('input', refreshInviteLink);
codeGrantInput.addEventListener('change', function () {
    this.closest('.checkbox-container').classList.toggle('checked', this.checked);
    refreshInviteLink();
});

document.getElementById('copyInvite').addEventListener('click', async () => {
    if (inviteLink.classList.contains('disabled')) {
        showNotif('Enter a valid Client ID first!');
        return;
    }
    try {
        await navigator.clipboard.writeText(inviteLink.href);
        showNotif('Copied invite link to clipboard!');
    } catch (e) {
        showNotif(e.message);
    }
});

window.onpopstate = e => {
    syncCheckboxes(+getHash(e.target.location.hash) || 0);
    recalculate(true);
};
window.onhashchange = e => {
    syncCheckboxes(+getHash(e.target.location.hash) || 0);
    recalculate(true);
};

const DEFAULT_TOTAL = permissions.find(perm => perm.id === 'generalAdministrator').bit;
const initialHash = getHash();
syncCheckboxes(initialHash !== null ? (+initialHash || 0) : DEFAULT_TOTAL);
recalculate(true);
