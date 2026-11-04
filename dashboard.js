document.addEventListener('DOMContentLoaded', function() {

    const books = JSON.parse(localStorage.getItem('books')) || [];
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const issued = JSON.parse(localStorage.getItem('issuedBooks')) || [];
    const returned = JSON.parse(localStorage.getItem('returnedBooks')) || [];

    document.getElementById('totalBooks').textContent = books.length;
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('totalIssued').textContent = issued.length;
    document.getElementById('totalReturned').textContent = returned.length;

    const username = localStorage.getItem('username');

    if (username) {
        document.getElementById('adminName').textContent = username;
    }

    const list = document.getElementById('dashboardBooks');

    if (!books.length) {
        list.innerHTML = '<div class="recent-book-card"><h3>📚 No Books Yet</h3><p>Add your first book from the Books section.</p></div>';
        return;
    }

    books.slice(-3).reverse().forEach(function(book) {

        const card = document.createElement('div');
        card.className = 'recent-book-card';

        const h = document.createElement('h3');
        h.textContent = '📖 ' + book.name;

        const a = document.createElement('p');
        a.textContent = '👤 ' + book.author;

        const c = document.createElement('p');
        c.textContent = '🏷️ ' + book.category;

        const q = document.createElement('p');
        q.textContent = '📦 Quantity: ' + book.quantity;

        card.append(h, a, c, q);

        list.appendChild(card);

    });

});