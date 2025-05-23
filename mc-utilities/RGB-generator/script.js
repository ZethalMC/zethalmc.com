// let colorPairCount = 0;

// function showNotif(message) {
//     const notifPopup = document.getElementById("notifPopup");
//     notifPopup.innerHTML = message;
//     notifPopup.style.display = "block";
//     notifPopup.style.opacity = "1";

//     setTimeout(() => {
//         notifPopup.style.opacity = "0";
//         setTimeout(() => {
//             notifPopup.style.display = "none";
//         }, 500);
//     }, 5000);
// }

// function toggleExtraCommand() {
//     const section = document.getElementById('extraCommandSection');
//     section.style.display = section.style.display === 'none' || section.style.display === '' ? 'block' : 'none';
//     updatePreview();
// }

// function createColorPair() {
//     const pairId = colorPairCount++;
//     const colorPairHtml = `
//         <div class="color-pair" id="colorPair${pairId}">
//             <div class="color-container">
//                 <input type="color" id="color${pairId}" class="color-input" value="#ff8c00" oninput="updateColorLabel('color${pairId}')">
//                 <input type="text" id="colorLabel${pairId}" class="color-label" value="#ff8c00" oninput="updateFromLabel(this, 'color${pairId}')" spellcheck="false">
//             </div>
//             ${pairId > 1 ? `
//             <button onclick="removeColorPair(${pairId})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
//                 Remove
//             </button>
//             ` : ''}
//         </div>
//     `;
//     document.getElementById('colorPairs').insertAdjacentHTML('beforeend', colorPairHtml);
//     document.getElementById('addColorButton').disabled = colorPairCount >= 6;
// }

// function updateColorLabel(inputId) {
//     const input = document.getElementById(inputId);
//     const labelId = 'colorLabel' + inputId.replace('color', '');
//     const label = document.getElementById(labelId);
//     if (input && label) {
//         label.value = input.value.toUpperCase();
//         updatePreview();
//     }
// }

// function updateFromLabel(label, colorId) {
//     const colorInput = document.getElementById(colorId);
//     let value = label.value.trim();

//     if (value.length === 6 && !value.startsWith('#')) {
//         value = '#' + value;
//         label.value = value;
//     }

//     if (validateHexColor(value)) {
//         colorInput.value = value;
//         label.style.color = 'white';
//         updatePreview();
//     } else {
//         if (label.value.length === 0) {
//             showNotif("You have to provide a hex color!");
//             label.value = "#ff8c00";
//         } else {
//             showNotif("Invalid color format. Please use a hex format like #rrggbb.");
//         }
//     }
// }

// function addColorPair() {
//     if (colorPairCount < 6) {
//         createColorPair();
//         updatePreview();
//     }
//     document.getElementById('addColorButton').disabled = colorPairCount >= 6;
// }

// function removeColorPair(id) {
//     const element = document.getElementById(`colorPair${id}`);
//     element.remove();
//     colorPairCount--;
//     document.getElementById('addColorButton').disabled = colorPairCount >= 6;
//     updatePreview();
// }

// function getAllColors() {
//     const colors = [];
//     for (let i = 0; i < colorPairCount; i++) {
//         const colorElement = document.getElementById(`color${i}`);
//         if (colorElement) {
//             colors.push(colorElement.value);
//         }
//     }
//     return colors.length > 0 ? colors : ['#6B46C1', '#9F7AEA'];
// }

// function copyOutput() {
//     const output = document.getElementById('output');
//     let textToCopy = output.textContent;

//     navigator.clipboard.writeText(textToCopy)
//         .then(() => {
//             const button = output.nextElementSibling;
//             button.textContent = 'Copied!';
//             setTimeout(() => button.textContent = 'Copy', 2000);
//         })
//         .catch(err => console.error('Failed to copy text: ', err));
// }

// function validateHexColor(hex) {
//     return /^#[0-9A-Fa-f]{6}$/.test(hex);
// }

// function interpolateColor(color1, color2, factor) {
//     const r1 = parseInt(color1.substring(1, 3), 16);
//     const g1 = parseInt(color1.substring(3, 5), 16);
//     const b1 = parseInt(color1.substring(5, 7), 16);

//     const r2 = parseInt(color2.substring(1, 3), 16);
//     const g2 = parseInt(color2.substring(3, 5), 16);
//     const b2 = parseInt(color2.substring(5, 7), 16);

//     const r = Math.round(r1 + (r2 - r1) * factor);
//     const g = Math.round(g1 + (g2 - g1) * factor);
//     const b = Math.round(b1 + (b2 - b1) * factor);

//     return '#' +
//         (r.toString(16).padStart(2, '0')) +
//         (g.toString(16).padStart(2, '0')) +
//         (b.toString(16).padStart(2, '0'));
// }

// function updatePreview() {
//     const text = document.getElementById('inputText').value;
//     const colors = getAllColors();
//     const format = document.getElementById('colorFormat').value;
//     const command = document.getElementById('extraCommand').value.trim();
//     const preview = document.getElementById('preview');
//     let output = '';

//     preview.innerHTML = '';
//     const gradientColors = colors.join(', ');

//     if (text.length === 0) {
//         document.getElementById('output').textContent = '';
//         return;
//     }

//     preview.style.fontWeight = document.getElementById('formatBold').checked ? 'bold' : 'normal';
//     preview.style.fontStyle = document.getElementById('formatItalic').checked ? 'italic' : 'normal';
//     preview.style.textDecoration = [
//         document.getElementById('formatUnderline').checked ? 'underline' : '',
//         document.getElementById('formatStrike').checked ? 'line-through' : ''
//     ].filter(Boolean).join(' ');

//     preview.style.setProperty('--gradient', `linear-gradient(to right, ${gradientColors})`);
//     preview.innerHTML = `<span class="gradient-text">${text}</span>`;

//     const formatCodes = getFormattingCodes();

//     let currentColorIndex = 0;

//     for (let i = 0; i < text.length; i++) {
//         const color = colors[currentColorIndex];
//         const hex = color.substring(1);

//         switch (format) {
//             case '&#':
//                 output += '&#' + hex + formatCodes + text[i];
//                 break;
//             case '&':
//                 output += '&' + hex + formatCodes + text[i];
//                 break;
//             case '<#':
//                 output += '<#' + hex + '>' + formatCodes + text[i];
//                 break;
//             case "<##":
//                 output += '<##' + hex + '>' + formatCodes + text[i];
//                 break;
//         }

//         currentColorIndex = (currentColorIndex + 1) % colors.length;
//     }

//     if (command) {
//         output = command + ' ' + output;
//     }

//     document.getElementById('output').textContent = output;
//     preview.innerHTML = `<span class="gradient-text">${text}</span>`;

//     if (output.length > 255) {
//         showNotif("Warning: The output exceeds 255 characters.");
//     }
// }

// function getAllColors() {
//     const colors = [];
//     for (let i = 0; i < colorPairCount; i++) {
//         const colorElement = document.getElementById(`color${i}`);
//         if (colorElement) {
//             colors.push(colorElement.value);
//         }
//     }
//     return colors.length > 0 ? colors : ['#6B46C1', '#9F7AEA'];
// }

// function getFormattingCodes() {
//     let codes = '';
//     if (document.getElementById('formatBold').checked) codes += '&l';
//     if (document.getElementById('formatItalic').checked) codes += '&o';
//     if (document.getElementById('formatUnderline').checked) codes += '&n';
//     if (document.getElementById('formatStrike').checked) codes += '&m';
//     return codes;
// }

// function validateCommand(command) {
//     return command.trim() !== '';
// }

// function validateNumberInput(input) {
//     input.value = input.value.replace(/[^0-9]/g, '');

//     if (parseInt(input.value) < 1) {
//         input.value = 1;
//         showNotif("You cannot set the value lower than 1 character per color!");
//     } else if (input.value.length === 0) {
//         showNotif("You have to provide a value!")
//         input.value = 1;
//     }
// }

// document.addEventListener('DOMContentLoaded', function () {
//     addColorPair();
//     addColorPair();

//     document.getElementById('inputText').addEventListener('input', updatePreview);
//     document.getElementById('formatBold').addEventListener('change', updatePreview);
//     document.getElementById('formatItalic').addEventListener('change', updatePreview);
//     document.getElementById('formatUnderline').addEventListener('change', updatePreview);
//     document.getElementById('formatStrike').addEventListener('change', updatePreview);
//     document.getElementById('extraCommand').addEventListener('input', updatePreview);

//     updatePreview();
// });

// feedback popup
const DISCORD_FEEDBACK_WEBHOOK_URL = "https://l.webhook.party/hook/5vNGcwWcRkk9wS0uEBAw9AOYZRBTgCLaoCktm1hLzCDNu%2F3Q%2BSFeZc6G8p0g5Eu7dKNDrvgboUj8eD%2BKFTLrpPupkkeVO9J5IcUwMm%2BKJcIonGa7NVTzrIU8f78XGXhsBT6gY7d%2FTuXVbQPwpeCVXresFynpiBWaMB1ucJjh%2Bhe2loq95v%2BVdrhXWT%2FdytoSQ2sdAwIYK0nFZtPDUrnrvjStbx521Khi%2BEXzGWM%2F1D8uMcOfL9nHEmprnMTX3g3BOHXa07gk7J1dxgrG%2BgV3%2BuBXFJhM%2Flk1C08fiiLG5A6u%2FZ7HWaTn4QMlb9FiUt7w0RGZ0QyKJG1Tdh6hAZAC%2BbtsHK597sonjTNPm3NAAeWlMBYPJkW%2F2iNOyEhRjSCMnqHwVbS1XLw%3D/zaIFZR3Syq8uYqO%2F";
const DISCORD_CONTACT_WEBHOOK_URL = "https://l.webhook.party/hook/CXBW6bGVtjK4dImq%2B1vSN303vR35GKywkL%2B1dVN0EousD0IGTESd7FfMcKYr7FMt0nyDnVc9Ybk%2BKOx5tu%2B1kZuDI9V%2FftZNhx0HFxHi4O7m0a7npUKg%2FymcbZksrWmzv0gVHS4DXug3VrFhkTnzlxfOnReDg%2BfP8wWm9T99rV73LSU711Y7NNhHDoR6%2B3y%2FFGeiq5pbPjbbkomQbGQDmq5mqUtWntbTHCWZKaHkOw5jahID%2F%2FTMjPiiVQrId7sAuyQH0XIz2R5vMcU41i26%2Frh54hCCSmabR2rqaXCeGYKBsL%2BJ5JfwrhtSB0zuKrlvy%2Fa5qWfRzYPkT4uBMl%2BFTPBzX1K9SPs0Uk5EfCGieq%2BAfTI8Ujzq4pqk5zmJBj7v80fUgyELvsE%3D/7Qyj2VD70Wh9jm%2BX";
const DISCORD_BUG_WEBHOOK_URL = "https://l.webhook.party/hook/%2FoPVVK1G27327NFcrw74kX91wNq81gWRfkz8KSok8gw%2Bw4Jc9WcrrQldtx%2BaijpyHYry4T4qVjxhabI2bu27eftitNxemGRMDsY8FMwSDMcMtUM0cg4qaVtzfWewHqixu1ZPg9t1HRueViO8qQMS8rRD34Zg0qigNH6s0fjnHp4U0gsivY1u45F%2B%2BYI5AqIoiHuqTdDyf2IvO%2F2MmCbFUpQJYP3fJBsmb36zYgt4cI%2FSXctOGmT6%2F28PBLySfemdQnLpqj0O8Ks0ZUEAMd7wtMoJYsvxYtZylT1oUsz5mqYmn5ArjdjkD8tMMtDxnTI%2FSBKHNAIf0vd2wDjq%2FDDSSvDsio2Fsigkj9oWFTXxdR4jGx8jvzuIk93bq65%2B4thlBlyWaopSO60%3D/MauWsew80SyOnxl%2B";

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