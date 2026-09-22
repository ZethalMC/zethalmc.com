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

const DEFAULT_COLORS = ['#17A398', '#0A4D4A'];
const MAX_COLORS = 8;
const MIN_COLORS = 2;

const FORMAT_FLAGS = [
    { flag: 'bold', legacy: 'l', mini: 'bold' },
    { flag: 'italic', legacy: 'o', mini: 'italic' },
    { flag: 'underline', legacy: 'n', mini: 'underlined' },
    { flag: 'strikethrough', legacy: 'm', mini: 'strikethrough' },
    { flag: 'obfuscated', legacy: 'k', mini: 'obfuscated' },
];

const colorStopsContainer = document.getElementById('colorStops');
const gradientBar = document.getElementById('gradientBar');
const addColorButton = document.getElementById('addColor');
const textInput = document.getElementById('textInput');
const formatToggles = Array.from(document.querySelectorAll('.fmt-toggle'));
const formatButtons = Array.from(document.querySelectorAll('.format-btn'));
const output = document.getElementById('output');
const preview = document.getElementById('preview');

let colors = DEFAULT_COLORS.slice();
let selectedFormat = 'ampersand';

function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
    return { r: lerp(c1.r, c2.r, t), g: lerp(c1.g, c2.g, t), b: lerp(c1.b, c2.b, t) };
}

function buildGradient(length, stopHexes) {
    const stopsRgb = stopHexes.map(hexToRgb);
    if (length <= 1) return [rgbToHex(stopsRgb[0])];

    const segments = stopsRgb.length - 1;
    const result = [];
    for (let i = 0; i < length; i++) {
        const t = i / (length - 1);
        const segPos = t * segments;
        let segIndex = Math.floor(segPos);
        if (segIndex >= segments) segIndex = segments - 1;
        const localT = segPos - segIndex;
        result.push(rgbToHex(lerpColor(stopsRgb[segIndex], stopsRgb[segIndex + 1], localT)));
    }
    return result;
}

function activeFormatFlags() {
    return FORMAT_FLAGS.filter(f => formatToggles.find(btn => btn.dataset.flag === f.flag).classList.contains('active'));
}

function renderGradientBar() {
    gradientBar.style.background = colors.length > 1
        ? `linear-gradient(to right, ${colors.join(', ')})`
        : colors[0];
}

function renderColorStops() {
    colorStopsContainer.innerHTML = '';
    colors.forEach((hex, index) => {
        const row = document.createElement('div');
        row.className = 'color-stop';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = hex;

        const textInputEl = document.createElement('input');
        textInputEl.type = 'text';
        textInputEl.value = hex;
        textInputEl.maxLength = 7;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-color';
        removeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeButton.disabled = colors.length <= MIN_COLORS;
        removeButton.setAttribute('aria-label', 'Remove color');

        colorInput.addEventListener('input', () => {
            const hexValue = colorInput.value.toUpperCase();
            colors[index] = hexValue;
            textInputEl.value = hexValue;
            update();
        });

        textInputEl.addEventListener('input', () => {
            let value = textInputEl.value.trim();
            if (!value.startsWith('#')) value = '#' + value;
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                const hexValue = value.toUpperCase();
                colors[index] = hexValue;
                colorInput.value = hexValue;
                textInputEl.classList.remove('error');
                update();
            } else {
                textInputEl.classList.add('error');
            }
        });

        removeButton.addEventListener('click', () => {
            if (colors.length <= MIN_COLORS) return;
            colors.splice(index, 1);
            renderColorStops();
            update();
        });

        row.appendChild(colorInput);
        row.appendChild(textInputEl);
        row.appendChild(removeButton);
        colorStopsContainer.appendChild(row);
    });

    addColorButton.disabled = colors.length >= MAX_COLORS;
}

addColorButton.addEventListener('click', () => {
    if (colors.length >= MAX_COLORS) return;
    const last = hexToRgb(colors[colors.length - 1]);
    const first = hexToRgb(colors[0]);
    colors.push(rgbToHex(lerpColor(first, last, 0.5)));
    renderColorStops();
    update();
});

function escapeMiniMessage(text) {
    return text.replace(/\\/g, '\\\\').replace(/</g, '\\<');
}

function buildLegacyOutput(text, gradientColors, flags, prefixChar) {
    const formatCodes = flags.map(f => prefixChar + f.legacy).join('');
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') {
            out += '\n';
            continue;
        }
        const hex = gradientColors[i].replace('#', '');
        out += prefixChar + 'x';
        for (const digit of hex) out += prefixChar + digit;
        out += formatCodes + ch;
    }
    return out;
}

function buildAmpersandOutput(text, gradientColors, flags) {
    const formatCodes = flags.map(f => '&' + f.legacy).join('');
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') {
            out += '\n';
            continue;
        }
        out += '&#' + gradientColors[i].replace('#', '') + formatCodes + ch;
    }
    return out;
}

function buildMiniMessageOutput(text, gradientColors, flags) {
    const stopTags = colors.join(':');
    const openTags = flags.map(f => `<${f.mini}>`).join('');
    const closeTags = flags.slice().reverse().map(f => `</${f.mini}>`).join('');
    return `<gradient:${stopTags}>${openTags}${escapeMiniMessage(text)}${closeTags}</gradient>`;
}

function renderPreview(text, gradientColors, flags) {
    preview.innerHTML = '';
    const style = {
        fontWeight: flags.some(f => f.flag === 'bold') ? '700' : '400',
        fontStyle: flags.some(f => f.flag === 'italic') ? 'italic' : 'normal',
    };
    const decorations = [];
    if (flags.some(f => f.flag === 'underline')) decorations.push('underline');
    if (flags.some(f => f.flag === 'strikethrough')) decorations.push('line-through');

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') {
            preview.appendChild(document.createElement('br'));
            continue;
        }
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.color = gradientColors[i];
        span.style.fontWeight = style.fontWeight;
        span.style.fontStyle = style.fontStyle;
        if (decorations.length) span.style.textDecoration = decorations.join(' ');
        preview.appendChild(span);
    }
}

function update() {
    renderGradientBar();
    syncHash();

    const text = textInput.value;
    if (!text.length) {
        output.value = '';
        preview.innerHTML = '';
        return;
    }

    const gradientColors = buildGradient(text.length, colors);
    const flags = activeFormatFlags();

    if (selectedFormat === 'legacy') {
        output.value = buildLegacyOutput(text, gradientColors, flags, '§');
    } else if (selectedFormat === 'ampersand') {
        output.value = buildAmpersandOutput(text, gradientColors, flags);
    } else {
        output.value = buildMiniMessageOutput(text, gradientColors, flags);
    }

    renderPreview(text, gradientColors, flags);
}

function syncHash() {
    const params = new URLSearchParams();
    if (textInput.value) params.set('t', textInput.value);
    params.set('c', colors.map(c => c.replace('#', '')).join(','));

    const activeFlags = FORMAT_FLAGS
        .filter(f => formatToggles.find(btn => btn.dataset.flag === f.flag).classList.contains('active'))
        .map(f => f.flag);
    if (activeFlags.length) params.set('f', activeFlags.join(','));

    if (selectedFormat !== 'ampersand') params.set('o', selectedFormat);

    history.replaceState(null, '', '#' + params.toString());
}

function loadFromHash() {
    const raw = window.location.hash.replace(/^#/, '');
    if (!raw) return;
    const params = new URLSearchParams(raw);

    if (params.has('t')) textInput.value = params.get('t');

    if (params.has('c')) {
        const parsedColors = params.get('c').split(',')
            .map(h => '#' + h.toUpperCase())
            .filter(h => /^#[0-9A-F]{6}$/.test(h));
        if (parsedColors.length >= MIN_COLORS) colors = parsedColors.slice(0, MAX_COLORS);
    }

    const activeFlags = new Set(params.has('f') ? params.get('f').split(',') : []);
    formatToggles.forEach(btn => {
        const isActive = activeFlags.has(btn.dataset.flag);
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });

    const requestedFormat = params.get('o');
    if (['legacy', 'ampersand', 'minimessage'].includes(requestedFormat)) {
        selectedFormat = requestedFormat;
    }
    formatButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.format === selectedFormat));
}

document.getElementById('copyShareLink').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        showNotif('Copied share link to clipboard!');
    } catch (e) {
        showNotif(e.message);
    }
});

window.addEventListener('hashchange', () => {
    loadFromHash();
    renderColorStops();
    update();
});

textInput.addEventListener('input', update);

formatToggles.forEach(btn => {
    btn.addEventListener('click', () => {
        const isActive = btn.classList.toggle('active');
        btn.setAttribute('aria-pressed', String(isActive));
        update();
    });
});

formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        formatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
        update();
    });
});

document.getElementById('copyOutput').addEventListener('click', async () => {
    if (!output.value) {
        showNotif('Nothing to copy yet!');
        return;
    }
    try {
        await navigator.clipboard.writeText(output.value);
        showNotif('Copied gradient text to clipboard!');
    } catch (e) {
        showNotif(e.message);
    }
});

function decodeFormatting(input) {
    return input
        .replace(/[§&]x(?:[§&][0-9a-fA-F]){6}/g, '')
        .replace(/[§&]#[0-9a-fA-F]{6}/g, '')
        .replace(/[§&][0-9a-fk-or]/gi, '');
}

document.getElementById('decodeButton').addEventListener('click', () => {
    const decodeInput = document.getElementById('decodeInput');
    const decodeOutput = document.getElementById('decodeOutput');
    decodeOutput.value = decodeFormatting(decodeInput.value);
});

document.getElementById('copyDecoded').addEventListener('click', async () => {
    const decodeOutput = document.getElementById('decodeOutput');
    if (!decodeOutput.value) {
        showNotif('Nothing to copy yet!');
        return;
    }
    try {
        await navigator.clipboard.writeText(decodeOutput.value);
        showNotif('Copied decoded text to clipboard!');
    } catch (e) {
        showNotif(e.message);
    }
});

loadFromHash();
renderColorStops();
update();
