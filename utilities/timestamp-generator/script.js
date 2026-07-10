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