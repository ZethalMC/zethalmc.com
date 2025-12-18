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

function convertText() {
    const convertButton = document.getElementById("buttonConvert");
    const size = parseInt(document.getElementById("maxCharSlider").value);

    convertButton.disabled = true;

    setTimeout(() => {
        convertButton.disabled = false;
    }, 3000);

    document.getElementById("errorPopup").innerHTML = "";

    var text = document.getElementById("bookText").value;
    var title = document.getElementById("bookTitle").value;
    var author = document.getElementById("bookAuthor").value;

    if (text.length === 0) {
        showError("Error: There is no text.");
        return;
    }
    if (title.length === 0) {
        showError("Error: Please specify a book title.");
        return;
    }
    if (author.length === 0) {
        showError("Error: Please specify a book author.");
        return;
    }

    document.getElementById("container").innerHTML = "";

    textBooks = text.replace(/(\r\n|\n|\r)/gm, " ");

    let pages = [];
    let pageCount = 0;
    while (textBooks.length > 0) {
        let pageFull = textBooks.substr(0, Math.min(size));
        let pageSize;
        if (pageFull.length < size) pageSize = pageFull.length;
        else pageSize = pageFull.lastIndexOf(" ");
        let pageNoCut = pageFull.substr(0, pageSize);

        pages[pageCount] = "#- " + pageNoCut;

        textBooks = textBooks.substr(pageSize + 1, textBooks.length);

        if (pageSize < 0) break;

        pageCount++;
    }

    let books = [];
    let bookCount = 0;
    let bookBuffer = "";
    let fullindex = 1;
    let i = 0;
    while (i < pages.length) {
        while (fullindex <= 100) {
            let page = pages[i];
            if (page === undefined) break;

            if (fullindex === 1) books[bookCount] = page;
            else books[bookCount] = books[bookCount] + "\n" + page;

            fullindex++;
            i++;
        }
        bookCount++;
        fullindex = 1;
    }

    createSaveButtons(books, title, author);
}

function createSaveButtons(books, title, author) {
    // buttons separately in a div
    var buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";

    // save buttons
    const createButton = (text, tooltipText, extension) => {
        const button = document.createElement("button");
        button.className = "tt";
        button.innerHTML = text + `<span data-text-end="Saved!"data-text-initial="${tooltipText}" class="tooltip"></span>`;
        button.addEventListener("click", () => saveBookFormat(books, title, author, extension));
        buttonContainer.appendChild(button);
    };

    createButton(books.length > 1 ? "Save Stendhal Books" : "Save Stendhal Book", "Will save as .Stendhal files", 'stendhal');
    createButton(books.length > 1 ? "Save as Text Files" : "Save as .txt File", "Will save as .txt files", 'txt');

    // Download ZIP buttons (separate for .stendhal and .txt)
    const zipButtonStendhal = document.createElement("button");
    zipButtonStendhal.className = "tt";
    zipButtonStendhal.innerHTML = "Download ZIP (.stendhal)" + `<span data-text-end="Saved!"data-text-initial="Will download a ZIP with all .stendhal books" class="tooltip"></span>`;
    zipButtonStendhal.addEventListener("click", () => downloadBooksZip(books, title, author, 'stendhal'));
    buttonContainer.appendChild(zipButtonStendhal);

    const zipButtonTxt = document.createElement("button");
    zipButtonTxt.className = "tt";
    zipButtonTxt.innerHTML = "Download ZIP (.txt)" + `<span data-text-end="Saved!"data-text-initial="Will download a ZIP with all .txt books" class="tooltip"></span>`;
    zipButtonTxt.addEventListener("click", () => downloadBooksZip(books, title, author, 'txt'));
    buttonContainer.appendChild(zipButtonTxt);

    document.getElementById("container").appendChild(buttonContainer);

    let bookNumb = 1;

    books.forEach((book) => {
        var parent = document.createElement("span");
        var result = document.createElement("textarea");
        document.getElementById("container").appendChild(parent);

        result.value +=
            "title: " +
            title +
            " " +
            bookNumb +
            "-" +
            books.length +
            "\nauthor: " +
            author +
            "\npages:\n";

        result.value += book;

        parent.appendChild(result);
        bookNumb++;
    });
}

function maxCharSliderHandler() {
    const slider = document.getElementById("maxCharSlider");
    const output = document.getElementById("maxCharText");
    const text = document.getElementById("bookText").value;
    output.value = slider.value;

    if (text.length > 0) {
        const words = text.split(/\s+/);
        const longestWordLength = Math.max(...words.map(word => word.length));

        if (slider.value < longestWordLength) {
            slider.value = longestWordLength;
        }
        output.value = slider.value;
    }
}

function maxCharTextHandler() {
    const slider = document.getElementById("maxCharSlider");
    const output = document.getElementById("maxCharText");
    const text = document.getElementById("bookText").value;
    slider.value = output.value;

    if (text.length > 0) {
        const words = text.split(/\s+/);
        const longestWordLength = Math.max(...words.map(word => word.length));

        if (parseInt(output.value) > 250) {
            showError(`You cannot place the value above 250`);
            output.value = 250;
            slider.value = 250;
        } else if (parseInt(output.value) < longestWordLength) {
            showError(`You cannot place the value below ${longestWordLength}`);
            output.value = longestWordLength;
            slider.value = longestWordLength;
        }
    }
}

function saveBookFormat(books, title, author, format) {
    const extension = format === 'stendhal' ? 'stendhal' : 'txt';
    const safeTitle = sanitizeFileName(title) || 'book';
    const safeAuthor = sanitizeFileName(author) || 'author';
    books.forEach((book, index) => {
        const blob = new Blob([book], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${safeTitle} - ${safeAuthor} ${index + 1}-${books.length}.${extension}`;
        link.click();
    })
}

function sanitizeFileName(name) {
    return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}

function downloadBooksZip(books, title, author, extension = 'stendhal') {
    if (typeof JSZip === 'undefined') {
        showError('ZIP library not loaded.');
        return;
    }

    const zip = new JSZip();
    const safeTitle = sanitizeFileName(title) || 'books';
    const safeAuthor = sanitizeFileName(author) || 'author';

    books.forEach((book, index) => {
        const filename = `${safeTitle} - ${safeAuthor} ${index + 1}-${books.length}.${extension}`;
        const fileContent = `title: ${title} ${index + 1}-${books.length}\nauthor: ${author}\npages:\n` + String(book || "");
        zip.file(filename, fileContent);
    });

    zip.generateAsync({ type: 'blob' }).then((blob) => {
        const url = URL.createObjectURL(blob);
        window.zipDownloadData = {
            url: url,
            filename: `${safeTitle} - ${safeAuthor} - ${extension}.zip`
        };
        showZipWarning();
    }).catch((err) => {
        console.error('ZIP generation error:', err);
        showError('Failed to create ZIP file.');
    });
}

// feedback form
const DISCORD_FEEDBACK_WEBHOOK_URL = "https://discord.com/api/webhooks/1359431303451250800/Id-ZlPvafLcT-5uOIeFYNzJ6P6kMdI8PhlRQO9JjCqMCIxr7Tal-Hh0iDiGexUSfibxQ";
const DISCORD_CONTACT_WEBHOOK_URL = "https://discord.com/api/webhooks/1359431734487290008/fY_TkHqt77WWNM_MyO9GBV2P8UrcTJliCvkeI_B6R1pvAnDTp6VudX9pE60BxlnFcVPR";
const DISCORD_BUG_WEBHOOK_URL = "https://discord.com/api/webhooks/1359431602211393627/ciKTnWxImniKbDZTGaiVR6FbEwRc9h85WCloWuxS5droG6OSXJuNzJvRPyrowrfcL6iA";

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
            title: isContactForm ? "User Contact" : (isBugReport ? "Book Converter Bug Report" : "Book Converter Feedback"),
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

function showZipWarning() {
    const popup = document.getElementById('zipWarningPopup');
    const overlay = document.getElementById('zipWarningOverlay');
    popup.classList.add('show');
    overlay.style.display = 'block';
}

function closeZipWarning(shouldDownload = false) {
    const popup = document.getElementById('zipWarningPopup');
    const overlay = document.getElementById('zipWarningOverlay');
    
    if (shouldDownload && window.zipDownloadData) {
        const a = document.createElement('a');
        a.href = window.zipDownloadData.url;
        a.download = window.zipDownloadData.filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(window.zipDownloadData.url), 1000);
        window.zipDownloadData = null;
    }
    
    popup.classList.remove('show');
    overlay.style.display = 'none';
}