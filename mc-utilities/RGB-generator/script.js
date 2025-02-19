let colorPairCount = 0;

function showError(message) {
    const errorPopup = document.getElementById("errorPopup");
    errorPopup.innerHTML = message;
    errorPopup.style.display = "block";
    errorPopup.style.opacity = "1";

    setTimeout(() => {
        errorPopup.style.opacity = "0";
        setTimeout(() => {
            errorPopup.style.display = "none";
        }, 500);
    }, 5000);
}

function createColorPair() {
    const pairId = colorPairCount++;
    const colorPairHtml = `
        <div class="color-pair" id="colorPair${pairId}">
            <div class="color-container">
                <input type="color" id="color${pairId}" class="color-input" value="#ff8c00" oninput="updateColorLabel('color${pairId}')">
                <input type="text" id="colorLabel${pairId}" class="color-label" value="#ff8c00" oninput="updateFromLabel(this, 'color${pairId}')" spellcheck="false">
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
        if (label.value.length === 0) {
            showError("You have to provide a hex color!");
            label.value = "#ff8c00";
        } else {
            showError("Invalid color format. Please use a hex format like #rrggbb.");
        }
    }
}

function addColorPair() {
    createColorPair();
    updatePreview();
}

function removeColorPair(id) {
    const element = document.getElementById(`colorPair${id}`);
    element.remove();
    updatePreview();
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
        (g.toString(16).padStart(2, '0')) +
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
}

function validateNumberInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    
    if (parseInt(input.value) < 1) {
        input.value = 1;
        showError("You cannot set the value lower than 1 character per color!");
    } else if (input.value.length === 0) {
        showError("You have to provide a value!")
        input.value = 1;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    addColorPair();
    addColorPair();

    document.getElementById('inputText').addEventListener('input', updatePreview);
    document.getElementById('charsPerColor').addEventListener('input', updatePreview);
    document.getElementById('formatBold').addEventListener('change', updatePreview);
    document.getElementById('formatItalic').addEventListener('change', updatePreview);
    document.getElementById('formatUnderline').addEventListener('change', updatePreview);
    document.getElementById('formatStrike').addEventListener('change', updatePreview);
    
    updatePreview();
});