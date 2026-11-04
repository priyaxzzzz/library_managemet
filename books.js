document.addEventListener('DOMContentLoaded', function() {

    loadBooks();

    const username = localStorage.getItem('username');

    if (username) {
        document.getElementById('adminName').textContent = username;
    }

    document.getElementById('bookForm').addEventListener('submit', function(event) {

        event.preventDefault();

        const book = {
            id: val('bookId'),
            name: val('bookName'),
            author: val('author'),
            category: val('category'),
            publisher: val('publisher'),
            year: val('year'),
            quantity: val('quantity')
        };

        let books = JSON.parse(localStorage.getItem('books')) || [];
        const editIndex = document.getElementById('editIndex').value;

        if (editIndex !== '') {
            books[Number(editIndex)] = book;
            alert('✅ Book Updated Successfully!');
        } else {
            if (books.some(b => b.id.toLowerCase() === book.id.toLowerCase())) {
                alert('This Book ID already exists.');
                return;
            }

            books.push(book);
            alert('✅ Book Added Successfully!');
        }

        localStorage.setItem('books', JSON.stringify(books));

        cancelBookForm();
        loadBooks();

    });

});

function val(id) {
    return document.getElementById(id).value.trim();
}

function showAddBookForm() {

    document.getElementById('bookForm').reset();
    document.getElementById('editIndex').value = '';

    document.getElementById('formTitle').textContent = '➕ Add New Book';
    document.getElementById('saveButton').textContent = '💾 Add Book';

    document.getElementById('addBookForm').style.display = 'block';

    document.getElementById('addBookForm').scrollIntoView({
        behavior: 'smooth'
    });

}

function cancelBookForm() {

    document.getElementById('bookForm').reset();
    document.getElementById('editIndex').value = '';

    document.getElementById('addBookForm').style.display = 'none';

    document.getElementById('formTitle').textContent = '➕ Add New Book';
    document.getElementById('saveButton').textContent = '💾 Add Book';

}

function loadBooks() {

    const books = JSON.parse(localStorage.getItem('books')) || [];
    const body = document.getElementById('booksTableBody');

    body.replaceChildren();

    if (!books.length) {

        const tr = document.createElement('tr');
        const td = document.createElement('td');

        td.colSpan = 8;
        td.textContent = '📚 No books added yet.';
        td.style.textAlign = 'center';

        tr.appendChild(td);
        body.appendChild(tr);

        return;
    }

    books.forEach((b, i) => {

        const tr = document.createElement('tr');

        [b.id, b.name, b.author, b.category, b.publisher, b.year, b.quantity].forEach(v => {

            const td = document.createElement('td');
            td.textContent = v ?? '';

            tr.appendChild(td);

        });

        const td = document.createElement('td');

        td.innerHTML = '<div class="action-buttons"><button class="view-btn" onclick="viewBook(' + i + ')">👁 View</button> <button class="edit-btn" onclick="editBook(' + i + ')">✏ Edit</button> <button class="delete-btn" onclick="deleteBook(' + i + ')">🗑 Delete</button></div>';

        tr.appendChild(td);
        body.appendChild(tr);

    });

}

function viewBook(i) {

    const b = (JSON.parse(localStorage.getItem('books')) || [])[i];

    if (!b) {
        return;
    }

    const box = document.getElementById('bookDetails');

    box.replaceChildren();

    [
        ['Book ID', b.id],
        ['Book Name', b.name],
        ['Author', b.author],
        ['Category', b.category],
        ['Publisher', b.publisher],
        ['Published Year', b.year],
        ['Quantity', b.quantity]
    ].forEach(([label, value]) => {

        const row = document.createElement('div');
        row.className = 'book-detail';

        const strong = document.createElement('strong');
        strong.textContent = label;

        const span = document.createElement('span');
        span.textContent = value ?? '';

        row.append(strong, span);
        box.appendChild(row);

    });

    document.getElementById('viewModal').style.display = 'flex';

}

function closeViewModal() {

    document.getElementById('viewModal').style.display = 'none';

}

function editBook(i) {

    const b = (JSON.parse(localStorage.getItem('books')) || [])[i];

    if (!b) {
        return;
    }

    document.getElementById('addBookForm').style.display = 'block';

    document.getElementById('formTitle').textContent = '✏ Edit Book';
    document.getElementById('saveButton').textContent = '💾 Update Book';
    document.getElementById('editIndex').value = i;

    [
        ['bookId', 'id'],
        ['bookName', 'name'],
        ['author', 'author'],
        ['category', 'category'],
        ['publisher', 'publisher'],
        ['year', 'year'],
        ['quantity', 'quantity']
    ].forEach(([id, key]) => {

        document.getElementById(id).value = b[key] ?? '';

    });

    document.getElementById('addBookForm').scrollIntoView({
        behavior: 'smooth'
    });

}

function deleteBook(i) {

    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    const books = JSON.parse(localStorage.getItem('books')) || [];

    books.splice(i, 1);

    localStorage.setItem('books', JSON.stringify(books));

    loadBooks();

    alert('🗑️ Book Deleted Successfully!');

}