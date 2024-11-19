function convertText() {
    const convertButton = document.getElementById("buttonConvert");

    convertButton.disabled = true;

    setTimeout(() => {
        convertButton.disabled = false;
    }, 3000);

    document.getElementById("error").innerHTML = "";

    var text = document.getElementById("bookText").value;
    var title = document.getElementById("bookTitle").value;
    var author = document.getElementById("bookAuthor").value;

    if (text.length === 0) {
        document.getElementById("error").innerHTML = "Error: There is no text.";
        return;
    }
    if (title.length === 0) {
        document.getElementById("error").innerHTML =
            "Error: Please specify a book title.";
        return;
    }
    if (author.length === 0) {
        document.getElementById("error").innerHTML =
            "Error: Please specify a book author.";
        return;
    }

    document.getElementById("container").innerHTML = "";

    var slider = document.getElementById("maxCharSlider");
    var size = slider.value;

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

    var saveButton = document.createElement("button");
    document.getElementById("container").appendChild(saveButton);

    if (books.length > 1) saveButton.innerHTML = "Save Stendhal Books";
    else saveButton.innerHTML = "Save Stendhal Book";

    saveButton.addEventListener("click", (event) => {
        saveBook();
    });

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
    output.value = slider.value;
}

function maxCharTextHandler() {
    const slider = document.getElementById("maxCharSlider");
    const output = document.getElementById("maxCharText");
    slider.value = output.value;
}

function saveBook() {
    var books = document.getElementById("container").children;

    for (var i = 1; i < books.length; i++) {
        let textarea = books[i].children[0];
        let title = document.getElementById("bookTitle").value;
        let text = textarea.value;

        const a = document.createElement("a");
        const file = new Blob([text], { type: "text/plain" });

        a.href = URL.createObjectURL(file);
        a.download = title + " " + i + "-" + (books.length - 1) + ".txt";
        a.click();

        URL.revokeObjectURL(a.href);
    }
}