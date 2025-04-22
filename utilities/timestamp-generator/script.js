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

const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const outputElements = {
    't': document.getElementById('code-t'),
    'T': document.getElementById('code-T'),
    'd': document.getElementById('code-d'),
    'D': document.getElementById('code-D'),
    'f': document.getElementById('code-f'),
    'F': document.getElementById('code-F'),
    'R': document.getElementById('code-R'),
};
const previewElements = {
    't': document.getElementById('preview-t'),
    'T': document.getElementById('preview-T'),
    'd': document.getElementById('preview-d'),
    'D': document.getElementById('preview-D'),
    'f': document.getElementById('preview-f'),
    'F': document.getElementById('preview-F'),
    'R': document.getElementById('preview-R'),
};
const copyAll = document.getElementById('copy');
const current = document.getElementById('current');

dateInput.onchange = updateOutput;
timeInput.onchange = updateOutput;

document.querySelectorAll('input[type="text"]').forEach(input => {
    input.onclick = function () {
        this.select();
    };
});

copyAll.onclick = async () => {
    const allCodes = Object.values(outputElements).map(el => el.value).join('\n');
    try {
        await navigator.clipboard.writeText(allCodes);
        showNotif("Copied all timestamps to clipboard!");
    } catch (e) {
        showNotif(e.message);
    }
}

document.querySelectorAll('.copy-btn').forEach(button => {
    button.onclick = async () => {
        const type = button.getAttribute('data-type');
        const codeToCopy = outputElements[type].value;
        try {
            await navigator.clipboard.writeText(codeToCopy);
            showNotif(`Copied timestamp to clipboard!`);
        } catch (e) {
            showNotif(e.message);
        }
    };
});

const onload = _ => {
    const now = new Date();
    dateInput.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    timeInput.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    updateOutput();
}
window.onload = onload;
current.onclick = onload;

const typeFormats = {
    't': { timeStyle: 'short' },
    'T': { timeStyle: 'medium' },
    'd': { dateStyle: 'short' },
    'D': { dateStyle: 'long' },
    'f': { dateStyle: 'long', timeStyle: 'short' },
    'F': { dateStyle: 'full', timeStyle: 'short' },
    'R': { style: 'long', numeric: 'auto' },
};

function automaticRelativeDifference(d) {
    const diff = -((new Date().getTime() - d.getTime()) / 1000) | 0;
    const absDiff = Math.abs(diff);
    if (absDiff > 86400 * 30 * 12) {
        return { duration: Math.round(diff / (86400 * 365)), unit: 'years' };
    }
    if (absDiff > 86400 * 29) {
        return { duration: Math.round(diff / (86400 * 30)), unit: 'months' };
    }
    if (absDiff > 3600 * 23) {
        return { duration: Math.round(diff / 86400), unit: 'days' };
    }
    if (absDiff > 60 * 59) {
        return { duration: Math.round(diff / 3600), unit: 'hours' };
    }
    if (absDiff > 59) {
        return { duration: Math.round(diff / 60), unit: 'minutes' };
    }
    return { duration: diff, unit: 'seconds' };
}

function updateRelativeTime() {
    const selectedDate = new Date(dateInput.valueAsNumber + timeInput.valueAsNumber + new Date(dateInput.valueAsNumber + timeInput.valueAsNumber).getTimezoneOffset() * 60000);
    const diff = automaticRelativeDifference(selectedDate);
    const absDiff = Math.abs(diff.duration);

    let updateInterval;

    if (absDiff < 60) {
        updateInterval = 1000;
    } else if (absDiff < 3600) {
        updateInterval = 60000;
    } else if (absDiff < 86400) {
        updateInterval = 3600000;
    } else if (absDiff < 2592000) {
        updateInterval = 86400000;
    } else if (absDiff < 31536000) {
        updateInterval = 2592000000;
    } else {
        updateInterval = 31536000000;
    }

    const formatter = new Intl.RelativeTimeFormat(navigator.language || 'en', typeFormats['R']);
    previewElements['R'].textContent = formatter.format(diff.duration, diff.unit);

    clearInterval(relativeTimeInterval);
    relativeTimeInterval = setInterval(updateRelativeTime, updateInterval);
}

let relativeTimeInterval = setInterval(updateRelativeTime, 1000);

function updateOutput() {
    const selectedDate = new Date(dateInput.valueAsNumber + timeInput.valueAsNumber + new Date(dateInput.valueAsNumber + timeInput.valueAsNumber).getTimezoneOffset() * 60000);
    console.log(selectedDate)
    const ts = selectedDate.getTime().toString();

    for (const type in typeFormats) {
        outputElements[type].value = `<t:${ts.substr(0, ts.length - 3)}:${type}>`;
        const formatter = type === 'R'
            ? new Intl.RelativeTimeFormat(navigator.language || 'en', typeFormats[type] || {})
            : new Intl.DateTimeFormat(navigator.language || 'en', typeFormats[type] || {});

        const previewText = type === 'R'
            ? formatter.format(automaticRelativeDifference(selectedDate).duration, automaticRelativeDifference(selectedDate).unit)
            : formatter.format(selectedDate);

        previewElements[type].textContent = previewText;
    }
    updateRelativeTime();
}
setInterval(updateRelativeTime, 1000);

// feedback form
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
            title: isContactForm ? "User Contact" : (isBugReport ? "Timestamp Bug Report" : "Timestamp Feedback"),
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