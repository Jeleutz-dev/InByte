import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBgBJP3T_-IX68jvkZiUhbpAT076CQAWAQ",
    authDomain: "inbyte-95cd5.firebaseapp.com",
    projectId: "inbyte-95cd5",
    storageBucket: "inbyte-95cd5.firebasestorage.app",
    messagingSenderId: "12505561820",
    appId: "1:12505561820:web:f54fdb68af65a52b1d9219",
    measurementId: "G-3JW84GNH49"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const invitesListContainer = document.getElementById('invitesList');
const searchInput = document.getElementById('inviteSearchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

const MAIN_ADMIN_EMAIL = "admin@inbyte.date";
let currentUserId = null;
let allInvitesData = []; 
let currentFilter = 'active';

let currentEditDocId = null;
let currentEditData = null;
window.docToDelete = null; 
let editUploadedImageUrl = ""; 
let removeExistingImage = false;

window.editQuill = new Quill('#editQuillEditor', {
    theme: 'snow',
    placeholder: 'Write your success message here...',
    modules: { toolbar: [['bold', 'italic', 'underline']] }
});

const editImageInput = document.getElementById('editImage');
const editUploadStatus = document.getElementById('editUploadStatus');

if (editImageInput) {
    editImageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        editUploadStatus.textContent = "Uploading to cloud... ⏳";
        editUploadStatus.style.color = "#ffaa00";

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'inbyte_uploads'); 
        const cloudName = 'jg9iv8mc'; 

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST', body: formData
            });
            const data = await response.json();
            if (data.secure_url) {
                editUploadedImageUrl = data.secure_url;
                editUploadStatus.textContent = "Upload complete! ✅";
                editUploadStatus.style.color = "#00cc44"; 
            } else { throw new Error("Failed to get URL"); }
        } catch (error) {
            editUploadStatus.textContent = "Upload failed. Try again. ❌";
            editUploadStatus.style.color = "#ff0000"; 
        }
    });
}

window.closeEditModal = function() { document.getElementById('editModal').classList.remove('active'); };
window.closeDeleteModal = function() { document.getElementById('deleteModal').classList.remove('active'); window.docToDelete = null; };

document.getElementById('editModal').addEventListener('click', function(e) { if (e.target === this) window.closeEditModal(); });
document.getElementById('deleteModal').addEventListener('click', function(e) { if (e.target === this) window.closeDeleteModal(); });
document.getElementById('cancelDeleteBtn').addEventListener('click', window.closeDeleteModal);
document.getElementById('removeImgBtn').addEventListener('click', function() {
    removeExistingImage = true;
    document.getElementById('currentImageContainer').style.display = 'none';
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        document.querySelector('.dashboard-container').style.visibility = 'visible';
        fetchAllInvites(user.uid);
    } else {
        window.location.href = './login.html';
    }
});

async function fetchAllInvites(userId) {
    try {
        const q = query(collection(db, "invites"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        allInvitesData = [];
        querySnapshot.forEach((docSnap) => {
            allInvitesData.push({ id: docSnap.id, ...docSnap.data() });
        });

        allInvitesData.sort((a, b) => {
            const aTime = a.updatedAt || (a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0);
            const bTime = b.updatedAt || (b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0);
            return bTime - aTime;
        });
        
        applyFilters();
    } catch (error) {
        console.error("Error fetching invites:", error);
        invitesListContainer.innerHTML = `<p style="text-align:center; color: red;">Error loading invites.</p>`;
    }
}

function applyFilters() {
    const searchTerm = (searchInput.value || '').toLowerCase();
    
    const filtered = allInvitesData.filter(invite => {
        const status = invite.status || 'active';
        const statusMatch = status === currentFilter || (currentFilter === 'active' && status !== 'deleted');
        const nameMatch = (invite.name || invite.partnerName || '').toLowerCase().includes(searchTerm);
        const movieMatch = (invite.movie || invite.movieTitle || '').toLowerCase().includes(searchTerm);
        return statusMatch && (nameMatch || movieMatch);
    });

    renderInvites(filtered);
}

function renderInvites(invites) {
    invitesListContainer.innerHTML = '';
    
    if (invites.length === 0) {
        invitesListContainer.innerHTML = `<p style="text-align:center; opacity: 0.7; padding: 20px;">No ${currentFilter} invites found.</p>`;
        return;
    }

    const isAdmin = auth.currentUser && auth.currentUser.email === MAIN_ADMIN_EMAIL;

    invites.forEach((data) => {
        const docId = data.id;
        const status = data.status || 'active';
        const isDeleted = status === 'deleted';
        const showDeleteButton = !(isDeleted && !isAdmin);

        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = `display: flex; justify-content: space-between; align-items: flex-start; padding: 25px 0; border-bottom: 1px solid var(--border-color); text-align: left; gap: 15px;`;
        
        let statusBadge = '';
        if (isDeleted) statusBadge = `<span style="font-size: 0.75rem; background: #E23636; color: white; padding: 2px 6px; border-radius: 4px; margin-left: 10px;">Deleted</span>`;

        const infoDiv = document.createElement('div');
        infoDiv.style.flex = "1";
        infoDiv.innerHTML = `
            <h4 style="margin: 0; color: var(--primary-color); font-size: 1.15rem;">${data.name || data.partnerName || 'Movie Date'} ${statusBadge}</h4>
            <p style="margin: 5px 0 5px 0; font-size: 0.85rem; opacity: 0.8;">${data.movie || data.movieTitle || 'No Movie'} • ${data.date || 'TBA'}</p>
            <p style="margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--text-color); opacity: 0.9;">
                ${data.views || 0} <span style="font-weight: normal; opacity: 0.7;">Views</span>
            </p>
        `;

        const rightColumn = document.createElement('div');
        rightColumn.style.cssText = "display: flex; align-items: stretch; gap: 8px;";

        const primaryBtn = document.createElement('button');
        primaryBtn.className = 'action-btn view-btn';
        primaryBtn.style.display = 'flex';
        primaryBtn.style.alignItems = 'center';

        const kebabContainer = document.createElement('div');
        kebabContainer.className = 'kebab-container';

        const kebabBtn = document.createElement('button');
        kebabBtn.className = 'kebab-btn';
        kebabBtn.innerHTML = '⋮';

        const dropdown = document.createElement('div');
        dropdown.className = 'action-dropdown';

        if (status === 'active' || status !== 'deleted') {
            primaryBtn.textContent = 'View ↗';
            primaryBtn.onclick = () => window.open(`https://inbyte.date/invite/?id=${docId}&m=${encodeURIComponent(data.movie || data.movieTitle || '')}`, '_blank');

            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit';
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => { dropdown.classList.remove('show'); window.openEditModal(docId, data); };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => { dropdown.classList.remove('show'); window.confirmDeleteInvite(docId); };
            
            dropdown.appendChild(editBtn);
            dropdown.appendChild(deleteBtn);

        } else if (isDeleted) {
            primaryBtn.textContent = 'Restore';
            primaryBtn.onclick = () => window.restoreInvite(docId);
        }

        rightColumn.appendChild(primaryBtn);

        if (dropdown.children.length > 0) {
            kebabBtn.onclick = (e) => {
                e.stopPropagation();
                document.querySelectorAll('.action-dropdown').forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
                dropdown.classList.toggle('show');
            };
            kebabContainer.appendChild(kebabBtn);
            kebabContainer.appendChild(dropdown);
            rightColumn.appendChild(kebabContainer);
        }

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(rightColumn);
        invitesListContainer.appendChild(itemDiv);
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        applyFilters();
    });
});

if (searchInput) searchInput.addEventListener('input', applyFilters);

window.confirmDeleteInvite = function(docId) {
    window.docToDelete = docId;
    document.getElementById('deleteModal').classList.add('active');
};

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!window.docToDelete) return;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.textContent = "Deleting...";
    confirmBtn.disabled = true;

    try {
        await updateDoc(doc(db, "invites", window.docToDelete), { status: 'deleted', updatedAt: Date.now() });
        const target = allInvitesData.find(inv => inv.id === window.docToDelete);
        if (target) target.status = 'deleted';
        window.closeDeleteModal();
        applyFilters();
    } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete the invite.");
    } finally {
        confirmBtn.textContent = "Delete";
        confirmBtn.disabled = false;
    }
});

window.restoreInvite = async function(docId) {
    try {
        await updateDoc(doc(db, "invites", docId), { status: 'active', updatedAt: Date.now() });
        const target = allInvitesData.find(inv => inv.id === docId);
        if (target) target.status = 'active';
        applyFilters();
    } catch (error) {
        console.error("Error restoring invite:", error);
        alert("Failed to restore the invite.");
    }
};

window.openEditModal = function(docId, data) {
    currentEditDocId = docId;
    currentEditData = data;
    
    document.getElementById('editName').value = data.name || data.partnerName || "";
    document.getElementById('editMovie').value = data.movie || data.movieTitle || "";
    document.getElementById('editMainQ').value = data.mainQ || data.mainQuestion || "";
    document.getElementById('editSubQ').value = data.subQ || data.subText || "";
    document.getElementById('editLoc').value = data.loc || data.location || "";
    
    window.editQuill.root.innerHTML = data.msg || data.successMessage || "";
    
    document.getElementById('currentDateDisplay').textContent = `(Currently: ${data.date || 'TBA'} - Leave blank below to keep current)`;
    document.getElementById('editDate').value = "";
    document.getElementById('editTime').value = "";
    
    editUploadedImageUrl = ""; 
    removeExistingImage = false;
    document.getElementById('editUploadStatus').textContent = "";
    document.getElementById('editImage').value = "";

    const imgContainer = document.getElementById('currentImageContainer');
    if (data.img && data.img.trim() !== "") {
        document.getElementById('editCurrentImgPreview').src = data.img;
        imgContainer.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
    }

    document.getElementById('editModal').classList.add('active');
};

document.getElementById('saveEditBtn').addEventListener('click', async () => {
    if (!currentEditDocId) return;

    const saveBtn = document.getElementById('saveEditBtn');
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    let dateVal = document.getElementById('editDate').value;
    let timeVal = document.getElementById('editTime').value;
    let newFormattedDate = currentEditData.date; 
    
    if (dateVal) {
        let [year, month, day] = dateVal.split('-');
        let d = new Date(year, month - 1, day);
        let datePart = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        if (timeVal) {
            let [hours, minutes] = timeVal.split(':');
            let ampm = hours >= 12 ? 'PM' : 'AM';
            let h = hours % 12 || 12;
            newFormattedDate = datePart + " @ " + h + ":" + minutes + " " + ampm;
        } else {
            newFormattedDate = datePart; 
        }
    }

    let finalImage = currentEditData.img;
    if (editUploadedImageUrl !== "") { finalImage = editUploadedImageUrl; } 
    else if (removeExistingImage) { finalImage = ""; }

    let richMessage = window.editQuill.root.innerHTML;
    if (richMessage === '<p><br></p>') { richMessage = ""; }

    const updatedData = {
        mainQ: document.getElementById('editMainQ').value,
        subQ: document.getElementById('editSubQ').value,
        loc: document.getElementById('editLoc').value,
        msg: richMessage,
        date: newFormattedDate,
        img: finalImage,
        updatedAt: Date.now()
    };

    try {
        await updateDoc(doc(db, "invites", currentEditDocId), updatedData);
        const target = allInvitesData.find(inv => inv.id === currentEditDocId);
        if (target) Object.assign(target, updatedData);
        window.closeEditModal();
        applyFilters(); 
    } catch (error) {
        console.error("Error updating document:", error);
        alert("Failed to update invite.");
    } finally {
        saveBtn.textContent = "Save Changes";
        saveBtn.disabled = false;
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.kebab-container')) {
        document.querySelectorAll('.action-dropdown.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});