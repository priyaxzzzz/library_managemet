document.addEventListener('DOMContentLoaded', function() {

    loadMembers();

    const username = localStorage.getItem('username');

    if (username) {
        document.getElementById('adminName').textContent = username;
    }

    document.getElementById('memberForm').addEventListener('submit', function(event) {

        event.preventDefault();

        const member = {
            id: getValue('memberId'),
            name: getValue('memberName'),
            department: getValue('department'),
            email: getValue('email'),
            phone: getValue('phone')
        };

        let members = JSON.parse(localStorage.getItem('members')) || [];

        const editIndex = document.getElementById('editIndex').value;

        const duplicate = members.some(function(m, i) {
            return m.id.toLowerCase() === member.id.toLowerCase()
                && i !== Number(editIndex);
        });

        if (duplicate) {
            alert('This Member ID already exists.');
            return;
        }

        if (editIndex !== '') {
            members[Number(editIndex)] = member;
            alert('✅ Member Updated Successfully!');
        } else {
            members.push(member);
            alert('✅ Member Added Successfully!');
        }

        localStorage.setItem('members', JSON.stringify(members));

        cancelMemberForm();
        loadMembers();

    });

});

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function showMemberForm() {

    document.getElementById('memberForm').reset();
    document.getElementById('editIndex').value = '';

    document.getElementById('formTitle').textContent = '➕ Add New Member';
    document.getElementById('saveButton').textContent = '💾 Add Member';

    document.getElementById('memberFormSection').style.display = 'block';

    document.getElementById('memberFormSection').scrollIntoView({
        behavior: 'smooth'
    });

}

function cancelMemberForm() {

    document.getElementById('memberForm').reset();
    document.getElementById('editIndex').value = '';

    document.getElementById('memberFormSection').style.display = 'none';

    document.getElementById('formTitle').textContent = '➕ Add New Member';
    document.getElementById('saveButton').textContent = '💾 Add Member';

}

function loadMembers() {

    const members = JSON.parse(localStorage.getItem('members')) || [];

    const body = document.getElementById('membersTableBody');

    body.replaceChildren();

    if (members.length === 0) {

        const tr = document.createElement('tr');
        const td = document.createElement('td');

        td.colSpan = 6;
        td.textContent = '👥 No members added yet.';
        td.style.textAlign = 'center';

        tr.appendChild(td);
        body.appendChild(tr);

        return;
    }

    members.forEach(function(member, index) {

        const tr = document.createElement('tr');

        [
            member.id,
            member.name,
            member.department,
            member.email,
            member.phone
        ].forEach(function(value) {

            const td = document.createElement('td');

            td.textContent = value ?? '';

            tr.appendChild(td);

        });

        const actionCell = document.createElement('td');
        const actionDiv = document.createElement('div');

        actionDiv.className = 'action-buttons';

        const viewButton = document.createElement('button');
        viewButton.className = 'view-btn';
        viewButton.textContent = '👁 View';
        viewButton.addEventListener('click', function() {
            viewMember(index);
        });

        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.textContent = '✏ Edit';
        editButton.addEventListener('click', function() {
            editMember(index);
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = '🗑 Delete';
        deleteButton.addEventListener('click', function() {
            deleteMember(index);
        });

        actionDiv.append(viewButton, editButton, deleteButton);

        actionCell.appendChild(actionDiv);
        tr.appendChild(actionCell);

        body.appendChild(tr);

    });

}

function viewMember(index) {

    const members = JSON.parse(localStorage.getItem('members')) || [];

    const member = members[index];

    if (!member) {
        return;
    }

    const box = document.getElementById('memberDetails');

    box.replaceChildren();

    [
        ['Member ID', member.id],
        ['Member Name', member.name],
        ['Department', member.department],
        ['Email', member.email],
        ['Phone Number', member.phone]
    ].forEach(function(item) {

        const row = document.createElement('div');
        row.className = 'member-detail';

        const strong = document.createElement('strong');
        strong.textContent = item[0];

        const span = document.createElement('span');
        span.textContent = item[1] ?? '';

        row.append(strong, span);

        box.appendChild(row);

    });

    document.getElementById('viewModal').style.display = 'flex';

}

function closeViewModal() {

    document.getElementById('viewModal').style.display = 'none';

}

function editMember(index) {

    const members = JSON.parse(localStorage.getItem('members')) || [];

    const member = members[index];

    if (!member) {
        return;
    }

    document.getElementById('memberFormSection').style.display = 'block';

    document.getElementById('formTitle').textContent = '✏ Edit Member';
    document.getElementById('saveButton').textContent = '💾 Update Member';

    document.getElementById('editIndex').value = index;

    document.getElementById('memberId').value = member.id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('department').value = member.department;
    document.getElementById('email').value = member.email;
    document.getElementById('phone').value = member.phone;

    document.getElementById('memberFormSection').scrollIntoView({
        behavior: 'smooth'
    });

}

function deleteMember(index) {

    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }

    const members = JSON.parse(localStorage.getItem('members')) || [];

    members.splice(index, 1);

    localStorage.setItem('members', JSON.stringify(members));

    loadMembers();

    alert('🗑️ Member Deleted Successfully!');

}