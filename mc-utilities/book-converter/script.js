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
        button.addEventListener("click", () => saveBookFormat(books, title, extension));
        buttonContainer.appendChild(button);
    };

    createButton(books.length > 1 ? "Save Stendhal Books" : "Save Stendhal Book", "Will save as .Stendhal files", 'stendhal');
    createButton(books.length > 1 ? "Save as Text Files" : "Save as .txt File", "Will save as .txt files", 'txt');

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

function saveBookFormat(books, title, format) {
    const extension = format === 'stendhal' ? 'stendhal' : 'txt';
    books.forEach((book, index) => {
        const blob = new Blob([book], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${title} ${index + 1}-${books.length}.${extension}`;
        link.click();
    })
}

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