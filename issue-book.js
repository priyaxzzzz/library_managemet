
document.addEventListener("DOMContentLoaded", function () {
    const issueForm = document.getElementById("issueForm");
    const memberSelect = document.getElementById("memberSelect");
    const bookSelect = document.getElementById("bookSelect");
    const issueDate = document.getElementById("issueDate");
    const returnDate = document.getElementById("returnDate");
    const message = document.getElementById("message");
    const availability = document.getElementById("bookAvailability");
    const tableBody = document.getElementById("issuedTableBody");

    const adminName = localStorage.getItem("username");

    if (adminName) {
        document.getElementById("adminName").textContent = adminName;
    }

    // Set today's date as the default issue date.
    const today = getToday();

    issueDate.value = today;
    issueDate.min = today;
    returnDate.min = today;

    loadMembers();
    loadBooks();
    loadIssuedBooks();

    // Load members from localStorage.
    function loadMembers() {
        const members = JSON.parse(
            localStorage.getItem("members")
        ) || [];

        memberSelect.innerHTML = '<option value="">Select Member</option>';

        members.forEach(function (member) {
            const option = document.createElement("option");

            option.value = member.id;
            option.textContent = member.name + " (" + member.id + ")";

            memberSelect.appendChild(option);
        });

        if (members.length === 0) {
            memberSelect.innerHTML =
                '<option value="">No members available</option>';
        }
    }

    // Load books and show their available quantity.
    function loadBooks() {
        const books = JSON.parse(
            localStorage.getItem("books")
        ) || [];

        bookSelect.innerHTML = '<option value="">Select Book</option>';

        books.forEach(function (book) {
            const option = document.createElement("option");

            option.value = book.id;
            option.textContent =
                book.name + " (Available: " + book.quantity + ")";

            if (Number(book.quantity) <= 0) {
                option.disabled = true;
                option.textContent += " - Not Available";
            }

            bookSelect.appendChild(option);
        });

        if (books.length === 0) {
            bookSelect.innerHTML =
                '<option value="">No books available</option>';
        }
    }

    // Show the selected book's availability.
    bookSelect.addEventListener("change", function () {
        const books = JSON.parse(
            localStorage.getItem("books")
        ) || [];

        const selectedBook = books.find(function (book) {
            return String(book.id) === bookSelect.value;
        });

        if (!selectedBook) {
            availability.textContent =
                "Select a book to check availability.";
            return;
        }

        if (Number(selectedBook.quantity) > 0) {
            availability.textContent =
                "Available quantity: " + selectedBook.quantity;
        } else {
            availability.textContent = "This book is not available.";
        }
    });

    // Issue the selected book.
    issueForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const members = JSON.parse(
            localStorage.getItem("members")
        ) || [];

        const books = JSON.parse(
            localStorage.getItem("books")
        ) || [];

        const issuedBooks = JSON.parse(
            localStorage.getItem("issuedBooks")
        ) || [];

        const selectedMember = members.find(function (member) {
            return String(member.id) === memberSelect.value;
        });

        const selectedBook = books.find(function (book) {
            return String(book.id) === bookSelect.value;
        });

        // Check whether the member exists.
        if (!selectedMember) {
            showMessage("Please select a valid member.", "error");
            return;
        }

        // Check whether the book exists.
        if (!selectedBook) {
            showMessage("Please select a valid book.", "error");
            return;
        }

        // Check available quantity.
        if (Number(selectedBook.quantity) <= 0) {
            showMessage("Sorry, this book is not available.", "error");
            return;
        }

        // Check issue and return dates.
        if (!issueDate.value || !returnDate.value) {
            showMessage("Please select both dates.", "error");
            return;
        }

        if (returnDate.value < issueDate.value) {
            showMessage(
                "Return date cannot be earlier than issue date.",
                "error"
            );
            return;
        }

        // Reduce the available book quantity.
        selectedBook.quantity = Number(selectedBook.quantity) - 1;

        // Create the issue record.
        const issueRecord = {
            id: Date.now(),
            memberId: selectedMember.id,
            memberName: selectedMember.name,
            bookId: selectedBook.id,
            bookName: selectedBook.name,
            issueDate: issueDate.value,
            returnDate: returnDate.value,
            status: "Issued"
        };

        // Save the updated book quantity.
        localStorage.setItem("books", JSON.stringify(books));

        // Save the issue record.
        issuedBooks.push(issueRecord);

        localStorage.setItem(
            "issuedBooks",
            JSON.stringify(issuedBooks)
        );

        showMessage(
            "Book issued successfully!",
            "success"
        );

        issueForm.reset();

        issueDate.value = getToday();
        issueDate.min = getToday();
        returnDate.min = getToday();

        availability.textContent =
            "Select a book to check availability.";

        loadBooks();
        loadIssuedBooks();
    });

    // Display all issued book records.
    function loadIssuedBooks() {
        const issuedBooks = JSON.parse(
            localStorage.getItem("issuedBooks")
        ) || [];

        tableBody.replaceChildren();

        if (issuedBooks.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = "No books issued yet.";
            cell.style.textAlign = "center";

            row.appendChild(cell);
            tableBody.appendChild(row);

            return;
        }

        issuedBooks.slice().reverse().forEach(function (record) {
            const row = document.createElement("tr");

            addCell(row, record.memberName);
            addCell(row, record.memberId);
            addCell(row, record.bookName);
            addCell(row, record.bookId);
            addCell(row, record.issueDate);
            addCell(row, record.returnDate);
            addCell(row, record.status || "Issued");

            tableBody.appendChild(row);
        });
    }

    // Create a table cell safely.
    function addCell(row, value) {
        const cell = document.createElement("td");

        cell.textContent = value ?? "";

        row.appendChild(cell);
    }

    // Display success or error messages.
    function showMessage(text, type) {
        message.textContent = text;
        message.className = type;
    }

    // Get today's date in YYYY-MM-DD format.
    function getToday() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    // Clear the message when the form is reset.
    issueForm.addEventListener("reset", function () {
        message.textContent = "";
        message.className = "";
    });

    // Logout.
    document.getElementById("logoutLink").addEventListener(
        "click",
        function () {
            localStorage.removeItem("username");
        }
    );
});
