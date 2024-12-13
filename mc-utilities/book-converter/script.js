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

    // Stendhal download button
    var saveButtonStendhal = document.createElement("button");
    saveButtonStendhal.className = "tt";
    if (books.length > 1) {
        saveButtonStendhal.innerHTML = "Save Stendhal Books";
        saveButtonStendhal.innerHTML += `<span data-text-end="Saved!" data-text-initial="Will save as .Stendhal files" class="tooltip"></span>`;
    }
    else {
        saveButtonStendhal.innerHTML = "Save Stendhal Book";
        saveButtonStendhal.innerHTML += `<span data-text-end="Saved!" data-text-initial="Will save as .Stendhal file" class="tooltip"></span>`;
    }

    saveButtonStendhal.addEventListener("click", (event) => {
        saveBookStendhalFormat(books, title);
    });

    buttonContainer.appendChild(saveButtonStendhal);

    // Text download button
    var saveButtonTxt = document.createElement("button");
    saveButtonTxt.className = "tt";
    if (books.length > 1) {
        saveButtonTxt.innerHTML = "Save as Text Files";
        saveButtonTxt.innerHTML += `<span data-text-end="Saved!" data-text-initial="Will save as .txt files" class="tooltip"></span>`;
    }
    else {
        saveButtonTxt.innerHTML = "Save as .txt File";
        saveButtonTxt.innerHTML += `<span data-text-end="Saved!" data-text-initial="Will save as .txt file" class="tooltip"></span>`;
    }

    saveButtonTxt.addEventListener("click", (event) => {
        saveBookTxtFormat(books, title);
    });

    buttonContainer.appendChild(saveButtonTxt);

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

function saveBookStendhalFormat(books, title) {
    books.forEach((book, index) => {
        const blob = new Blob([book], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${title}-part${index + 1}.stendhal`;
        link.click();
    });
}

function saveBookTxtFormat(books, title) {
    books.forEach((book, index) => {
        const blob = new Blob([book], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${title}-part${index + 1}.txt`;
        link.click();
    });
}

const popup = document.getElementById('popup');
const showPopupButton = document.getElementById('showPopup');
const closePopupButton = document.getElementById('closePopup');

showPopupButton.addEventListener('click', () => {
    popup.classList.add('visible');
    popup.classList.remove('hidden');
});

closePopupButton.addEventListener('click', () => {
    popup.classList.remove('visible');
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 300);
});

popup.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.classList.remove('visible');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }
});
