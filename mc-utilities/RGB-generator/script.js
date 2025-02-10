let colorPairCount = 0;

function createColorPair() {
    const pairId = colorPairCount++;
    const colorPairHtml = `
        <div class="color-pair" id="colorPair${pairId}">
            <div class="color-container">
                <input type="color" id="color${pairId}" class="color-input" value="#6B46C1" oninput="updateColorLabel('color${pairId}')">
                <input type="text" id="colorLabel${pairId}" class="color-label" value="#6B46C1" oninput="updateFromLabel(this, 'color${pairId}')" spellcheck="false">
            </div>
            ${pairId > 1 ? `
            <button onclick="removeColorPair(${pairId})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                Remove
            </button>
            ` : ''}
        </div>
    `;
    document.getElementById('colorPairs').insertAdjacentHTML('beforeend', colorPairHtml);
}

function updateColorLabel(inputId) {
    const input = document.getElementById(inputId);
    const labelId = 'colorLabel' + inputId.replace('color', '');
    const label = document.getElementById(labelId);
    if (input && label) {
        label.value = input.value.toUpperCase();
        updatePreview();
    }
}

function updateFromLabel(label, colorId) {
    const colorInput = document.getElementById(colorId);
    let value = label.value.trim();
    
    if (value.length === 6 && !value.startsWith('#')) {
        value = '#' + value;
        label.value = value;
    }
    
    if (validateHexColor(value)) {
        colorInput.value = value;
        label.style.color = 'white';
        updatePreview();
    } else {
        label.style.color = '#ff6b6b';
    }
}

function addColorPair() {
    createColorPair();
    updatePreview();
    saveSettingsToCookies();
}

function removeColorPair(id) {
    const element = document.getElementById(`colorPair${id}`);
    element.remove();
    updatePreview();
    saveSettingsToCookies();
}

function getAllColors() {
    const colors = [];
    for (let i = 0; i < colorPairCount; i++) {
        const colorElement = document.getElementById(`color${i}`);
        if (colorElement) {
            colors.push(colorElement.value);
        }
    }
    return colors.length > 0 ? colors : ['#6B46C1', '#9F7AEA'];
}

function copyOutput() {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.textContent)
        .then(() => {
            const button = output.nextElementSibling;
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = 'Copy', 2000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
}

function validateHexColor(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1,3), 16);
    const g1 = parseInt(color1.substring(3,5), 16);
    const b1 = parseInt(color1.substring(5,7), 16);
    
    const r2 = parseInt(color2.substring(1,3), 16);
    const g2 = parseInt(color2.substring(3,5), 16);
    const b2 = parseInt(color2.substring(5,7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return '#' + 
        (r.toString(16).padStart(2, '0')) +
        (g.toString (16).padStart(2, '0')) +
        (b.toString(16).padStart(2, '0'));
}

function getFormattingCodes() {
    let codes = '';
    if (document.getElementById('formatBold').checked) codes += '&l';
    if (document.getElementById('formatItalic').checked) codes += '&o';
    if (document.getElementById('formatUnderline').checked) codes += '&n';
    if (document.getElementById('formatStrike').checked) codes += '&m';
    return codes;
}

function saveSettingsToCookies() {
    const settings = {
        inputText: document.getElementById('inputText').value,
        charsPerColor: document.getElementById('charsPerColor').value,
        formatBold: document.getElementById('formatBold').checked,
        formatItalic: document.getElementById('formatItalic').checked,
        formatUnderline: document.getElementById('formatUnderline').checked,
        formatStrike: document.getElementById('formatStrike').checked,
        colorFormat: document.getElementById('colorFormat').value,
        colors: getAllColors()
    };

    document.cookie = `gradientSettings=${JSON.stringify(settings)};max-age=2592000;path=/`;
}

function loadSettingsFromCookies() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('gradientSettings='));

    if (cookieValue) {
        try {
            const settings = JSON.parse(cookieValue.split('=')[1]);
            
            document.getElementById('inputText').value = settings.inputText || 'Your Text Here';
            document.getElementById('charsPerColor').value = settings.charsPerColor || '1';
            document.getElementById('formatBold').checked = settings.formatBold || false;
            document.getElementById('formatItalic').checked = settings.formatItalic || false;
            document.getElementById('formatUnderline').checked = settings.formatUnderline || false;
            document.getElementById('formatStrike').checked = settings.formatStrike || false;
            document.getElementById('colorFormat').value = settings.colorFormat || '&#';
            
            if (settings.colors && settings.colors.length > 0) {
                const container = document.getElementById('colorPairs');
                container.innerHTML = '';
                colorPairCount = 0;
                
                settings.colors.forEach((color, index) => {
                    createColorPair();
                    const colorInput = document.getElementById(`color${index}`);
                    if (colorInput) {
                        colorInput.value = color;
                        updateColorLabel(`color${index}`);
                    }
                });
            } else {
                addColorPair();
                addColorPair();
            }
            
            updatePreview();
        } catch (error) {
            console.error('Error loading settings:', error);
            addColorPair();
            addColorPair();
        }
    } else {
        addColorPair();
        addColorPair();
    }
}

function updatePreview() {
    const text = document.getElementById('inputText').value;
    const charsPerColor = parseInt(document.getElementById('charsPerColor').value) || 1;
    const colors = getAllColors();
    const format = document.getElementById('colorFormat').value;
    
    const preview = document.getElementById('preview');
    const gradientColors = colors.join(', ');
    
    preview.style.fontWeight = document.getElementById('formatBold').checked ? 'bold' : 'normal';
    preview.style.fontStyle = document.getElementById('formatItalic').checked ? 'italic' : 'normal';
    preview.style.textDecoration = [
        document.getElementById('formatUnderline').checked ? 'underline' : '',
        document.getElementById('formatStrike').checked ? 'line-through' : ''
    ].filter(Boolean).join(' ');
    
    preview.style.setProperty('--gradient', `linear-gradient(to right, ${gradientColors})`);
    preview.innerHTML = `<span class="gradient-text">${text}</span>`;

    const formatCodes = getFormattingCodes();

    let output = '';
    let currentColorIndex = 0;
    let charsInCurrentColor = 0;
    
    for (let i = 0; i < text.length; i++) {
        if (charsInCurrentColor >= charsPerColor) {
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            charsInCurrentColor = 0;
        }

        const color = colors[currentColorIndex];
        const nextColor = colors[(currentColorIndex + 1) % colors.length];
        const factor = charsInCurrentColor / charsPerColor;
        const interpolatedColor = interpolateColor(color, nextColor, factor);
        const hex = interpolatedColor.substring(1);

        switch(format) {
            case '&#':
                output += '&#' + hex + formatCodes + text[i];
                break;
            case '&':
                output += '&#' + hex + text[i];
                break;
            case 'MiniMessage':
                output += '<#' + hex + '>' + text[i];
                break;
            case 'Â§':
                output += 'Â§x' + hex.split('').map(c => 'Â§' + c).join('') + text[i];
                break;
            case '<#':
                output += '<#' + hex + '>' + text[i];
                break;
        }
        
        charsInCurrentColor++;
    }

    document.getElementById('output').textContent = output;
    saveSettingsToCookies();
}

function applyPreset() {
    const preset = document.getElementById('colorPresets').value;
    if (!preset) return;
    
    const container = document.getElementById('colorPairs');
    container.innerHTML = '';
    colorPairCount = 0;
    
    addColorPair();
    addColorPair();
    
    const colorPairs = document.querySelectorAll('.color-pair');
    const [startColor, endColor] = preset.split(',');
    
    const colorInputs = document.querySelectorAll('input[type="color"]');
    if (colorInputs.length >= 2) {
        colorInputs[0].value = startColor;
        colorInputs[1].value = endColor;
        
        updateColorLabel('color0');
        updateColorLabel('color1');
        updatePreview();
    }
    saveSettingsToCookies();
}

document.addEventListener('DOMContentLoaded', function() {
    loadSettingsFromCookies();

    const inputs = [
        'inputText',
        'charsPerColor',
        'formatBold',
        'formatItalic',
        'formatUnderline',
        'formatStrike',
        'colorFormat'
    ];

    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('change', saveSettingsToCookies);
            element.addEventListener('input', saveSettingsToCookies);
        }
    });
});

addColorPair();
addColorPair();

document.getElementById('inputText').addEventListener('input', updatePreview);
document.getElementById('charsPerColor').addEventListener('input', updatePreview);
document.getElementById('formatBold').addEventListener('change', updatePreview);
document.getElementById('formatItalic').addEventListener('change', updatePreview);
document.getElementById('formatUnderline').addEventListener('change', updatePreview);
document.getElementById('formatStrike').addEventListener('change', updatePreview);

updatePreview();