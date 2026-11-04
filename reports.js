
document.addEventListener("DOMContentLoaded", function () {

    const refreshButton = document.getElementById("refreshReport");
    const logoutLink = document.getElementById("logoutLink");

    // Display username
    const username = localStorage.getItem("username");
    const adminName = document.getElementById("adminName");

    if (username && adminName) {
        adminName.textContent = username;
    }

    // Load report
    loadReports();

    // Refresh button
    refreshButton.addEventListener("click", loadReports);

    // Logout
    logoutLink.addEventListener("click", function () {
        localStorage.removeItem("username");
    });


    // Read localStorage safely
    function getData(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }


    // Support common Book ID field names
    function getBookId(book) {
        return String(
            book.bookId ??
            book.id ??
            book.bookID ??
            ""
        );
    }


    // Support common Book Name field names
    function getBookName(book) {
        return (
            book.bookName ??
            book.title ??
            book.name ??
            ""
        );
    }


    // Load all reports
    function loadReports() {

        const books = getData("books");
        const members = getData("members");
        const issuedRecords = getData("issuedBooks");
        const returnedRecords = getData("returnedBooks");

        // Only books not yet returned
        const currentlyIssued = issuedRecords.filter(function (record) {
            return record.status === "Issued";
        });


        // Count issued copies by Book ID
        const issuedCountByBook = {};

        currentlyIssued.forEach(function (record) {

            const id = String(record.bookId ?? record.bookID ?? "");

            issuedCountByBook[id] =
                (issuedCountByBook[id] || 0) + 1;

        });


        // Calculate summary
        let totalBooks = 0;
        let availableBooks = 0;

        books.forEach(function (book) {

            const available = Math.max(
                0,
                Number(book.quantity ?? book.availableQuantity) || 0
            );

            const issued =
                issuedCountByBook[getBookId(book)] || 0;

            // Current quantity is treated as available quantity
            totalBooks += available + issued;
            availableBooks += available;

        });


        // Update summary cards
        setText("totalBooks", totalBooks);
        setText("totalMembers", members.length);
        setText("availableBooks", availableBooks);
        setText("issuedBooks", currentlyIssued.length);


        // Update all tables
        loadInventory(books, issuedCountByBook);
        loadCurrentlyIssued(currentlyIssued);
        loadReturnHistory(returnedRecords);


        // Update time
        setText(
            "lastUpdated",
            "Last updated: " + new Date().toLocaleString()
        );

    }


    // Set text
    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }


    // Add table cell
    function addCell(row, value) {
        const cell = document.createElement("td");

        cell.textContent = value ?? "";

        row.appendChild(cell);
    }


    // Empty table message
    function addEmptyRow(tbody, columns, message) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = columns;
        cell.textContent = message;
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tbody.appendChild(row);
    }


    // =================================
    // BOOK INVENTORY
    // =================================

    function loadInventory(books, issuedCountByBook) {

        const tbody = document.getElementById("inventoryTableBody");

        tbody.replaceChildren();

        if (books.length === 0) {
            addEmptyRow(tbody, 6, "No books found.");
            return;
        }

        books.forEach(function (book) {

            const id = getBookId(book);
            const name = getBookName(book);
            const author = book.author ?? book.authorName ?? "";

            const available = Math.max(
                0,
                Number(book.quantity ?? book.availableQuantity) || 0
            );

            const issued = issuedCountByBook[id] || 0;
            const total = available + issued;

            const row = document.createElement("tr");

            addCell(row, id);
            addCell(row, name);
            addCell(row, author);
            addCell(row, total);
            addCell(row, available);

            const status = document.createElement("td");

            if (available > 0) {
                status.textContent = "Available";
                status.className = "available-status";
            } else {
                status.textContent = "Not Available";
                status.className = "unavailable-status";
            }

            row.appendChild(status);
            tbody.appendChild(row);

        });
    }


    // =================================
    // CURRENTLY ISSUED BOOKS
    // =================================

    function loadCurrentlyIssued(records) {

        const tbody = document.getElementById("issuedTableBody");

        tbody.replaceChildren();

        if (records.length === 0) {
            addEmptyRow(tbody, 6, "No books are currently issued.");
            return;
        }

        records.slice().reverse().forEach(function (record) {

            const row = document.createElement("tr");

            addCell(row, record.memberName ?? "");
            addCell(row, record.memberId ?? "");
            addCell(row, record.bookName ?? record.title ?? "");
            addCell(row, record.bookId ?? record.bookID ?? "");
            addCell(row, record.issueDate ?? "");
            addCell(row, record.returnDate ?? "");

            tbody.appendChild(row);

        });
    }


    // =================================
    // RETURN HISTORY
    // =================================

    function loadReturnHistory(records) {

        const tbody =
            document.getElementById("returnHistoryTableBody");

        tbody.replaceChildren();

        if (records.length === 0) {
            addEmptyRow(tbody, 7, "No books returned yet.");
            return;
        }

        records.slice().reverse().forEach(function (record) {

            const row = document.createElement("tr");

            addCell(row, record.memberName ?? "");
            addCell(row, record.memberId ?? "");
            addCell(row, record.bookName ?? record.title ?? "");
            addCell(row, record.bookId ?? record.bookID ?? "");
            addCell(row, record.issueDate ?? "");

            addCell(
                row,
                record.actualReturnDate ?? record.returnDate ?? ""
            );

            const status = document.createElement("td");

            status.textContent = "Returned";
            status.className = "available-status";

            row.appendChild(status);
            tbody.appendChild(row);

        });
    }

});
