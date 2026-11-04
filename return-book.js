
document.addEventListener("DOMContentLoaded", function () {

    const returnForm = document.getElementById("returnForm");
    const issuedSelect = document.getElementById("issuedSelect");
    const actualReturnDate = document.getElementById("actualReturnDate");
    const bookDetails = document.getElementById("bookDetails");
    const message = document.getElementById("message");
    const returnedTableBody = document.getElementById("returnedTableBody");

    // Display username
    const username = localStorage.getItem("username");
    const adminName = document.getElementById("adminName");

    if (username && adminName) {
        adminName.textContent = username;
    }

    // Get today's date
    function getToday() {
        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    actualReturnDate.value = getToday();
    actualReturnDate.max = getToday();

    // Read localStorage
    function getData(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    // Save localStorage data
    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Show messages
    function showMessage(text, type) {
        message.textContent = text;
        message.className = type;
        message.style.display = "block";
    }

    function clearMessage() {
        message.textContent = "";
        message.className = "";
        message.style.display = "none";
    }

    // Convert date
    function parseDate(value) {
        if (!value) return null;

        const date = new Date(value + "T00:00:00");

        return Number.isNaN(date.getTime()) ? null : date;
    }

    // Load currently issued books
    function loadIssuedBooks() {
        const issuedBooks = getData("issuedBooks");

        issuedSelect.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select an issued book";

        issuedSelect.appendChild(defaultOption);

        const activeBooks = issuedBooks.filter(function (record) {
            return record.status === "Issued";
        });

        activeBooks.forEach(function (record) {
            const option = document.createElement("option");

            option.value = String(record.id);
            option.textContent =
                (record.bookName || "Unknown Book") +
                " - " +
                (record.memberName || "Unknown Member") +
                " (" + (record.memberId || "") + ")";

            issuedSelect.appendChild(option);
        });

        if (activeBooks.length === 0) {
            defaultOption.textContent = "No books currently issued";

            bookDetails.textContent =
                "There are no books waiting to be returned.";
        }
    }

    // Show selected book details
    issuedSelect.addEventListener("change", function () {
        clearMessage();

        const issuedBooks = getData("issuedBooks");

        const selectedRecord = issuedBooks.find(function (record) {
            return String(record.id) === issuedSelect.value &&
                record.status === "Issued";
        });

        if (!selectedRecord) {
            bookDetails.textContent =
                "Choose an issued book to see its details.";
            return;
        }

        bookDetails.textContent =
            "Member: " + (selectedRecord.memberName || "") +
            " | Member ID: " + (selectedRecord.memberId || "") +
            " | Book: " + (selectedRecord.bookName || "") +
            " | Book ID: " + (selectedRecord.bookId || "") +
            " | Issue Date: " + (selectedRecord.issueDate || "") +
            " | Due Date: " +
            (selectedRecord.dueDate || selectedRecord.returnDate || "");
    });

    // Return book
    returnForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearMessage();

        const issuedBooks = getData("issuedBooks");
        const books = getData("books");
        const returnedBooks = getData("returnedBooks");

        const index = issuedBooks.findIndex(function (record) {
            return String(record.id) === issuedSelect.value &&
                record.status === "Issued";
        });

        if (index === -1) {
            showMessage("Please select a valid issued book.", "error");
            return;
        }

        const selectedRecord = issuedBooks[index];
        const actualDate = actualReturnDate.value;

        if (!actualDate) {
            showMessage("Please select the actual return date.", "error");
            return;
        }

        const issueDate = parseDate(selectedRecord.issueDate);
        const selectedDate = parseDate(actualDate);
        const today = parseDate(getToday());

        if (!issueDate || !selectedDate) {
            showMessage("Please check the selected dates.", "error");
            return;
        }

        if (selectedDate < issueDate) {
            showMessage(
                "Return date cannot be earlier than issue date.",
                "error"
            );
            return;
        }

        if (selectedDate > today) {
            showMessage(
                "Actual return date cannot be in the future.",
                "error"
            );
            return;
        }

        // Find matching book
        const bookIndex = books.findIndex(function (book) {
            return String(book.bookId ?? book.id) ===
                String(selectedRecord.bookId);
        });

        if (bookIndex === -1) {
            showMessage(
                "Book record not found. Check the Books section.",
                "error"
            );
            return;
        }

        const quantity = Number(books[bookIndex].quantity);

        if (!Number.isFinite(quantity) || quantity < 0) {
            showMessage("Book quantity is invalid.", "error");
            return;
        }

        // Increase available quantity
        books[bookIndex].quantity = quantity + 1;

        // Save actual return date in issue record
        selectedRecord.status = "Returned";
        selectedRecord.actualReturnDate = actualDate;

        // Create return history record
        const returnRecord = {
            id: selectedRecord.id,
            memberId: selectedRecord.memberId,
            memberName: selectedRecord.memberName,
            bookId: selectedRecord.bookId,
            bookName: selectedRecord.bookName,
            issueDate: selectedRecord.issueDate,
            dueDate: selectedRecord.dueDate || selectedRecord.returnDate || "",
            actualReturnDate: actualDate,
            status: "Returned"
        };

        // Update records
        issuedBooks[index] = selectedRecord;
        returnedBooks.push(returnRecord);

        saveData("books", books);
        saveData("issuedBooks", issuedBooks);
        saveData("returnedBooks", returnedBooks);

        showMessage(
            "Book returned successfully! Actual return date saved.",
            "success"
        );

        returnForm.reset();

        actualReturnDate.value = getToday();
        actualReturnDate.max = getToday();

        bookDetails.textContent =
            "Choose an issued book to see its details.";

        loadIssuedBooks();
        loadReturnHistory();
    });

    // Display return history
    function loadReturnHistory() {
        const issuedBooks = getData("issuedBooks");
        const returnedBooks = getData("returnedBooks");

        returnedTableBody.replaceChildren();

        const allRecords = [];

        // Add returned records
        returnedBooks.forEach(function (record) {
            allRecords.push({
                ...record,
                status: "Returned"
            });
        });

        // Add currently issued records
        issuedBooks.forEach(function (record) {
            if (record.status === "Issued") {
                allRecords.push(record);
            }
        });

        if (allRecords.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 8;
            cell.textContent = "No issue or return records found.";
            cell.style.textAlign = "center";

            row.appendChild(cell);
            returnedTableBody.appendChild(row);
            return;
        }

        allRecords.reverse().forEach(function (record) {
            const row = document.createElement("tr");

            addCell(row, record.memberName);
            addCell(row, record.memberId);
            addCell(row, record.bookName);
            addCell(row, record.bookId);
            addCell(row, record.issueDate);

            // Due date
            addCell(
                row,
                record.dueDate || record.returnDate || "—"
            );

            // Actual Return Date
            const actualDate =
                record.actualReturnDate ||
                record.actualReturn ||
                record.returnedDate ||
                "—";

            addCell(row, actualDate);

            // Status
            const statusCell = document.createElement("td");

            if (record.status === "Returned") {
                statusCell.textContent = "✅ Returned";
                statusCell.className = "returned-status";
            } else {
                const dueDate = parseDate(
                    record.dueDate || record.returnDate
                );

                const today = parseDate(getToday());

                if (dueDate && today && dueDate < today) {
                    statusCell.textContent = "⚠️ Overdue";
                    statusCell.className = "overdue-status";
                } else {
                    statusCell.textContent = "📚 Issued";
                    statusCell.className = "issued-status";
                }
            }

            row.appendChild(statusCell);
            returnedTableBody.appendChild(row);
        });
    }

    // Add table cell
    function addCell(row, value) {
        const cell = document.createElement("td");
        cell.textContent = value ?? "—";
        row.appendChild(cell);
    }

    // Clear message on reset
    returnForm.addEventListener("reset", function () {
        clearMessage();
    });

    // Logout
    const logoutLink = document.getElementById("logoutLink");

    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.removeItem("username");
        });
    }

    // Load data when page opens
    loadIssuedBooks();
    loadReturnHistory();

});
