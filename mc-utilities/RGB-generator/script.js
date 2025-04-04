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

    if (format === 'MiniMessage' && colorCount > 1) {
        const segmentLength = Math.ceil(text.length / (colorCount - 1));
        let output = '';
        let currentIndex = 0;

        for (let i = 0; i < colorCount - 1; i++) {
            const start = currentIndex;
            const end = Math.min(currentIndex + segmentLength, text.length);
            const segment = text.slice(start, end);
            const hexColorStart = colors[i].substring(1);
            const hexColorEnd = colors[i + 1].substring(1);

            output += `<gradient:${hexColorStart}:${hexColorEnd}>${segment}</gradient>`;
            currentIndex += segmentLength;
        }

        if (currentIndex < text.length) {
            output += text.slice(currentIndex);
        }

        document.getElementById('output').textContent = output;
        preview.innerHTML = output;
        return;
    }

    if (colorCount === 1) {
        preview.innerHTML = `<span style="color: ${colors[0]}">${text}</span>`;
    }

    let output = '';
    if (extraCommandSection.style.display === 'block' && validateCommand(command)) {
        output += command + ' ';
    }

    for (let i = 0; i < text.length; i++) {
        const ratio = i / (text.length - 1);
        const colorIndex = Math.floor(ratio * (colorCount - 1));
        const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1);
        const colorRatio = (ratio * (colorCount - 1)) - colorIndex;
        const color = interpolateColor(colors[colorIndex], colors[nextColorIndex], colorRatio);
        const hexColor = color.substring(1);

        let formattedText = text[i];
        if (document.getElementById('formatBold').checked) {
            formattedText = `&l${formattedText}`;
        }
        if (document.getElementById('formatItalic').checked) {
            formattedText = `&o${formattedText}`;
        }
        if (document.getElementById('formatUnderline').checked) {
            formattedText = `&n${formattedText}`;
        }
        if (document.getElementById('formatStrike').checked) {
            formattedText = `&m${formattedText}`;
        }

        switch (format) {
            case '&#':
                output += `&#${hexColor}${formattedText}`;
                break;
            case '&':
                output += `&${hexColor}${formattedText}`;
                break;
            case 'Â§':
                output += `Â§x${hexColor.split('').map(c => 'Â§' + c).join('')}${formattedText}`;
                break;
            case '&x':
                output += `&x${hexColor.split('').map(c => '&' + c).join('')}${formattedText}`;
                break;
            case '<#':
                output += `<#${hexColor}>${formattedText}`;
                break;
            case '<##':
                output += `<##${hexColor}>${formattedText}`;
                break;
            case '[C':
                output += `[COLOR=${hexColor}]${formattedText}[/COLOR]`;
                break;
            default:
                output += `&${hexColor}${formattedText}`;
        }
    }

    document.getElementById('output').textContent = output;
}

function generateOutputForSingleCharacter(character, hexColor, format) {
    let output = '';
    const formattedCharacter = character;

    if (document.getElementById('formatBold').checked) {
        formattedCharacter = `&l${formattedCharacter}`;
    }
    if (document.getElementById('formatItalic').checked) {
        formattedCharacter = `&o${formattedCharacter}`;
    }
    if (document.getElementById('formatUnderline').checked) {
        formattedCharacter = `&n${formattedCharacter}`;
    }
    if (document.getElementById('formatStrike').checked) {
        formattedCharacter = `&m${formattedCharacter}`;
    }

    switch (format) {
        case '&#':
            output += `&#${hexColor}${formattedCharacter}`;
            break;
        case '&':
            output += `&${hexColor}${formattedCharacter}`;
            break;
        case 'Â§':
            output += `Â§x${hexColor.split('').map(c => 'Â§' + c).join('')}${formattedCharacter}`;
            break;
        case '&x':
            output += `&x${hexColor.split('').map(c => '&' + c).join('')}${formattedCharacter}`;
            break;
        case '<#':
            output += `<#${hexColor}>${formattedCharacter}`;
            break;
        case '<##':
            output += `<##${hexColor}>${formattedCharacter}`;
            break;
        case '[C':
            output += `[COLOR=${hexColor}]${formattedCharacter}[/COLOR]`;
            break;
        case 'MiniMessage':
            output += `<gradient:${hexColor}:${hexColor}>${formattedCharacter}</gradient>`;
            break;
        default:
            output += `&${hexColor}${formattedCharacter}`;
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

// feedback popup
const DISCORD_FEEDBACK_WEBHOOK_URL = "https://discord.com/api/webhooks/1354062580095782984/lChk-_8-ltoG4PXnJZaWaFAFHilWzs_t-PHpZQa-0rRCG82ESNY2sV61BIv0849NsSOH";
const DISCORD_CONTACT_WEBHOOK_URL = "https://discord.com/api/webhooks/1354099421884846130/9r1YIgKTzDS_YUe195-IGzb9R-ljOrFBjTRZjGRZD17ZlnaLXh_MPkqAk5g-I_jFcrAp";
const DISCORD_BUG_WEBHOOK_URL = "https://discord.com/api/webhooks/1354062580095782984/lChk-_8-ltoG4PXnJZaWaFAFHilWzs_t-PHpZQa-0rRCG82ESNY2sV61BIv0849NsSOH";

function togglePopup() {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const isVisible = popup.classList.contains('show');

    if (isVisible) {
        popup.classList.remove('show');
        overlay.style.display = 'none';
    } else {
        popup.classList.add('show');
        overlay.style.display = 'block';
    }
}

document.querySelectorAll('.checkbox-container input').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        toggleCheckbox(this.id);
    });
});

function toggleCheckbox(checkedId) {
    const contactCheckbox = document.getElementById('contactCheckbox');
    const bugCheckbox = document.getElementById('bugCheckbox');
    const textBoxTitle = document.getElementById('textBoxTitle');
    const textBox = document.getElementById('textBox');
    const notificationElement = document.getElementById('notification');

    const contactContainer = contactCheckbox.closest('.checkbox-container');
    const bugContainer = bugCheckbox.closest('.checkbox-container');

    if (checkedId === 'contactCheckbox') {
        if (contactCheckbox.checked) {
            bugCheckbox.checked = false;
            bugContainer.classList.remove('checked');
        } else {
            contactContainer.classList.remove('checked');
        }
    } else if (checkedId === 'bugCheckbox') {
        if (bugCheckbox.checked) {
            contactCheckbox.checked = false;
            contactContainer.classList.remove('checked');
        } else {
            bugContainer.classList.remove('checked');
        }
    }

    if (contactCheckbox.checked) {
        textBoxTitle.textContent = "Contact Reason:";
        textBox.placeholder = "Enter the reason...";
        contactContainer.classList.add('checked');
    } else if (bugCheckbox.checked) {
        textBoxTitle.textContent = "Bug Report:";
        textBox.placeholder = "Describe the bug in detail...";
        bugContainer.classList.add('checked');
    } else {
        textBoxTitle.textContent = "Your Feedback:";
        textBox.placeholder = "Enter your feedback here...";
    }
}

async function submitFeedback() {
    const discordUsername = document.getElementById('discord').value.trim();
    const feedbackText = document.getElementById('textBox').value.trim();
    const isContactForm = document.getElementById('contactCheckbox').checked;
    const isBugReport = document.getElementById('bugCheckbox').checked;

    if (!discordUsername || !feedbackText) {
        showNotification('Please fill in all fields.');
        return;
    }

    const payload = {
        embeds: [{
            title: isContactForm ? "User Contact" : (isBugReport ? "RGB-Generator Bug Report" : "RGB-Generator Feedback"),
            color: isBugReport ? 0xff0000 : 3066993,
            fields: [
                {
                    name: "Discord Username",
                    value: discordUsername,
                    inline: true
                },
                {
                    name: "Message",
                    value: feedbackText,
                    inline: false
                }
            ]
        }]
    };

    const webhookUrl = isContactForm ? DISCORD_CONTACT_WEBHOOK_URL : (isBugReport ? DISCORD_BUG_WEBHOOK_URL : DISCORD_FEEDBACK_WEBHOOK_URL);

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (isBugReport) {
            showNotification('Bug report submitted successfully! Thank you for pointing it out!');
        } else if (isContactForm) {
            showNotification('Contact request submitted successfully! I\'ll get back to you soon!');
        } else {
            showNotification('Feedback submitted successfully! Thank you for your input!');
        }

        document.getElementById('discord').value = '';
        document.getElementById('textBox').value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to submit message. Please try again later.');
    }
}

function showNotification(message) {
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;

    notificationElement.style.display = 'block';

    requestAnimationFrame(() => {
        notificationElement.classList.add('show');
    });

    setTimeout(() => {
        notificationElement.classList.remove('show');

        setTimeout(() => {
            notificationElement.style.display = 'none';
        }, 400);
    }, 3000);
}