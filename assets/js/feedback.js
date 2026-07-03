const FEEDBACK_WEBHOOKS_ENABLED = false;

const DISCORD_FEEDBACK_WEBHOOK_URL = "https://discord.com/api/webhooks/1359431303451250800/Id-ZlPvafLcT-5uOIeFYNzJ6P6kMdI8PhlRQO9JjCqMCIxr7Tal-Hh0iDiGexUSfibxQ";
const DISCORD_CONTACT_WEBHOOK_URL = "https://discord.com/api/webhooks/1359431734487290008/fY_TkHqt77WWNM_MyO9GBV2P8UrcTJliCvkeI_B6R1pvAnDTp6VudX9pE60BxlnFcVPR";
const DISCORD_BUG_WEBHOOK_URL = "https://discord.com/api/webhooks/1359431602211393627/ciKTnWxImniKbDZTGaiVR6FbEwRc9h85WCloWuxS5droG6OSXJuNzJvRPyrowrfcL6iA";

const FEEDBACK_SOURCE = window.FEEDBACK_SOURCE || "Site";

const FEEDBACK_BUTTON_DOCKED_QUERY = window.matchMedia('(max-width: 600px)');

function syncFeedbackButtonSpacing() {
    const feedbackButton = document.querySelector('.feedback-button');
    if (!feedbackButton) return;

    if (FEEDBACK_BUTTON_DOCKED_QUERY.matches) {
        document.body.style.paddingBottom = '';
    } else {
        document.body.style.paddingBottom = (24 + feedbackButton.offsetHeight + 24) + 'px';
    }
}

syncFeedbackButtonSpacing();
window.addEventListener('resize', syncFeedbackButtonSpacing);

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

function renderFeedbackDisabledNotice() {
    if (FEEDBACK_WEBHOOKS_ENABLED) return;

    const popup = document.getElementById('popup');
    if (!popup || document.getElementById('feedbackDisabledNotice')) return;

    const notice = document.createElement('p');
    notice.id = 'feedbackDisabledNotice';
    notice.className = 'feedback-disabled-notice';
    notice.innerHTML = 'Direct submissions are paused for now — please reach out on ' +
        '<a href="https://discord.com/users/zethal_" target="_blank" rel="noopener">Discord (zethal_)</a> ' +
        'or email <a href="mailto:ZethalMC@gmail.com">ZethalMC@gmail.com</a> instead.';

    const heading = popup.querySelector('h1');
    if (heading) {
        heading.insertAdjacentElement('afterend', notice);
    } else {
        popup.prepend(notice);
    }
}

renderFeedbackDisabledNotice();

async function submitFeedback() {
    const discordUsername = document.getElementById('discord').value.trim();
    const feedbackText = document.getElementById('textBox').value.trim();
    const isContactForm = document.getElementById('contactCheckbox').checked;
    const isBugReport = document.getElementById('bugCheckbox').checked;

    if (!discordUsername || !feedbackText) {
        showNotification('Please fill in all fields.');
        return;
    }

    if (!FEEDBACK_WEBHOOKS_ENABLED) {
        showNotification('Submissions are paused right now... Please reach out on Discord (zethal_) or email ZethalMC@gmail.com instead. Thanks!');
        return;
    }

    const payload = {
        embeds: [{
            title: isContactForm ? "User Contact" : (isBugReport ? `${FEEDBACK_SOURCE} Bug Report` : `${FEEDBACK_SOURCE} Feedback`),
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
