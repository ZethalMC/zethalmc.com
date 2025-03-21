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

function toggleExtraCommand() {
    const section = document.getElementById('extraCommandSection');
    section.style.display = section.style.display === 'none' || section.style.display === '' ? 'block' : 'none';
    updatePreview();
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
    let textToCopy = output.textContent;

    navigator.clipboard.writeText(textToCopy)
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
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return '#' +
        (r.toString(16).padStart(2, '0')) +
        (g.toString(16).padStart(2, '0')) +
        (b.toString(16).padStart(2, '0'));
}

function getFormattingCodes() {
    const format = document.getElementById('colorFormat').value;
    let codes = '';
    
    switch (format) {
        case '&#':
        case '&':
        case '<#':
        case '<##':
        case '&x':
            if (document.getElementById('formatBold').checked) codes += '&l';
            if (document.getElementById('formatItalic').checked) codes += '&o';
            if (document.getElementById('formatUnderline').checked) codes += '&n';
            if (document.getElementById('formatStrike').checked) codes += '&m';
            break;
        case 'Â§':
            if (document.getElementById('formatBold').checked) codes += '§l';
            if (document.getElementById('formatItalic').checked) codes += '§o';
            if (document.getElementById('formatUnderline').checked) codes += '§n';
            if (document.getElementById('formatStrike').checked) codes += '§m';
            break;
        case 'MiniMessage':
            if (document.getElementById('formatBold').checked) codes += '<b>';
            if (document.getElementById('formatItalic').checked) codes += '<i>';
            if (document.getElementById('formatUnderline').checked) codes += '<u>';
            if (document.getElementById('formatStrike').checked) codes += '<st>';
            break;
        case '[C':
            if (document.getElementById('formatBold').checked) codes += '[BOLD]';
            if (document.getElementById('formatItalic').checked) codes += '[ITALIC]';
            if (document.getElementById('formatUnderline').checked) codes += '[UNDERLINE]';
            if (document.getElementById('formatStrike').checked) codes += '[STRIKETHROUGH]';
            break;
    }
    return codes;
}

function updatePreview() {
    const text = document.getElementById('inputText').value;
    const colors = getAllColors();
    const format = document.getElementById('colorFormat').value;
    const command = document.getElementById('extraCommand').value.trim();
    const extraCommandSection = document.getElementById('extraCommandSection');

    const preview = document.getElementById('preview');
    preview.innerHTML = '';

    const colorCount = colors.length;

    if (text.length === 1) {
        const hexColor = colors[0].substring(1);
        const output = generateOutputForSingleCharacter(text, hexColor, format);
        document.getElementById('output').textContent = output;
        preview.innerHTML = `<span style="color: ${colors[0]}">${text}</span>`;
        return;
    }

    if (colorCount === 1) {
        preview.innerHTML = `<span style="color: ${colors[0]}">${text}</span>`;
    }

    const textLength = text.length;

    for (let i = 0; i < textLength; i++) {
        const ratio = i / (textLength - 1);

        const colorIndex = Math.floor(ratio * (colorCount - 1));
        const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1);
        const colorRatio = (ratio * (colorCount - 1)) - colorIndex;

        const color = interpolateColor(colors[colorIndex], colors[nextColorIndex], colorRatio);

        const span = document.createElement('span');
        span.style.color = color;
        span.textContent = text[i];
        preview.appendChild(span);
    }

    let output = '';
    if (extraCommandSection.style.display === 'block' && validateCommand(command)) {
        output += command + ' ';
    }

    for (let i = 0; i < text.length; i++) {
        const ratio = i / (textLength - 1);
        const colorIndex = Math.floor(ratio * (colorCount - 1));
        const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1);
        const colorRatio = (ratio * (colorCount - 1)) - colorIndex;
        const color = interpolateColor(colors[colorIndex], colors[nextColorIndex], colorRatio);
        const hexColor = color.substring(1);

        switch (format) {
            case '&#':
                output += `&#${hexColor}${text[i]}`;
                break;
            case '&':
                output += `&${hexColor}${text[i]}`;
                break;
            case 'Â§':
                output += `Â§x${hexColor.split('').map(c => 'Â§' + c).join('')}${text[i]}`;
                break;
            case '&x':
                output += `&x${hexColor.split('').map(c => '&' + c).join('')}${text[i]}`;
                break;
            case '<#':
                output += `<#${hexColor}>${text[i]}`;
                break;
            case '<##':
                output += `<##${hexColor}>${text[i]}`;
                break;
            case '[C':
                output += `[COLOR=${hexColor}]${text[i]}[/COLOR]`;
                break;
            case 'MiniMessage':
                if (i === 0) {
                    output += `<gradient:${hexColor}:${colors[colorCount - 1].substring(1)}>`;
                }
                output += text[i];
                if (i === text.length - 1) {
                    output += `</gradient>`;
                }
                break;
            default:
                output += `&${hexColor}${text[i]}`;
        }
    }

    document.getElementById('output').textContent = output;
}

function generateOutputForSingleCharacter(character, hexColor, format) {
    let output = '';
    switch (format) {
        case '&#':
            output += `&#${hexColor}${character}`;
            break;
        case '&':
            output += `&${hexColor}${character}`;
            break;
        case 'Â§':
            output += `Â§x${hexColor.split('').map(c => 'Â§' + c).join('')}${character}`;
            break;
        case '&x':
            output += `&x${hexColor.split('').map(c => '&' + c).join('')}${character}`;
            break;
        case '<#':
            output += `<#${hexColor}>${character}`;
            break;
        case '<##':
            output += `<##${hexColor}>${character}`;
            break;
        case '[C':
            output += `[COLOR=${hexColor}]${character}[/COLOR]`;
            break;
        case 'MiniMessage':
            output += `<gradient:${hexColor}:${hexColor}>${character}</gradient>`;
            break;
        default:
            output += `&${hexColor}${character}`;
    }
    return output;
}

function validateCommand(command) {
    return command.trim() !== '';
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

document.addEventListener('DOMContentLoaded', function () {
    addColorPair();
    addColorPair();

    document.getElementById('inputText').addEventListener('input', updatePreview);
    // document.getElementById('charsPerColor').addEventListener('input', updatePreview);
    document.getElementById('formatBold').addEventListener('change', updatePreview);
    document.getElementById('formatItalic').addEventListener('change', updatePreview);
    document.getElementById('formatUnderline').addEventListener('change', updatePreview);
    document.getElementById('formatStrike').addEventListener('change', updatePreview);
    document.getElementById('extraCommand').addEventListener('input', updatePreview);

    updatePreview();
});

// https://www.w3schools.com/howto/howto_custom_select.asp
var x, i, j, l, ll, selElmnt, a, b, c;
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function (e) {
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
            }
            updatePreview();
            h.click();
        });
        b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}
function closeAllSelect(elmnt) {
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

document.addEventListener("click", closeAllSelect);