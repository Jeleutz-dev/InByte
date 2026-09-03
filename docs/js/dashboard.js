import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

let currentUserId = null;
let currentEditDocId = null;
let currentEditData = null;
window.docToDelete = null; 

window.editQuill = new Quill('#editQuillEditor', {
    theme: 'snow',
    placeholder: 'Write your success message here...',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline']
        ]
    }
});

let editUploadedImageUrl = ""; 
let removeExistingImage = false;

const editImageInput = document.getElementById('editImage');
const editUploadStatus = document.getElementById('editUploadStatus');

window.closeEditModal = function() { 
    document.getElementById('editModal').classList.remove('active'); 
};
window.closeDeleteModal = function() { 
    document.getElementById('deleteModal').classList.remove('active'); 
    window.docToDelete = null; 
};

document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) window.closeEditModal();
});

document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) window.closeDeleteModal();
});

document.getElementById('cancelDeleteBtn').addEventListener('click', window.closeDeleteModal);

document.getElementById('removeImgBtn').addEventListener('click', function() {
    removeExistingImage = true;
    document.getElementById('currentImageContainer').style.display = 'none';
});

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
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.secure_url) {
                editUploadedImageUrl = data.secure_url;
                editUploadStatus.textContent = "Upload complete! ✅";
                editUploadStatus.style.color = "#00cc44"; 
            } else {
                throw new Error("Failed to get URL");
            }
        } catch (error) {
            console.error("Upload error:", error);
            editUploadStatus.textContent = "Upload failed. Try again. ❌";
            editUploadStatus.style.color = "#ff0000"; 
        }
    });
}

async function loadDashboardData(uid) {
    const q = query(collection(db, "invites"), where("userId", "==", uid));
    const invitesList = document.getElementById('invitesList');
    
    try {
        const querySnapshot = await getDocs(q);
        let totalInvitesCount = querySnapshot.size; 
        let activeLinksCount = 0;
        let totalViewsCount = 0;
        
        let invitesArray = [];
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                totalViewsCount += (data.views || 0);
                
                if (data.status !== 'deleted') {
                    invitesArray.push({ id: docSnap.id, ...data });
                    activeLinksCount++;
                }
            });

            invitesArray.sort((a, b) => {
                const aTime = a.updatedAt || (a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0);
                const bTime = b.updatedAt || (b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0);
                return bTime - aTime;
            });
            
            invitesList.innerHTML = ''; 

            if (invitesArray.length > 0) {
                invitesArray.forEach((data) => {
                    const docId = data.id;
                    
                    const itemDiv = document.createElement('div');
                    itemDiv.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 25px 0; border-bottom: 1px solid var(--border-color); text-align: left; gap: 15px; flex-wrap: wrap;`;

                    const infoDiv = document.createElement('div');
                    infoDiv.style.flex = "1";
                    infoDiv.style.minWidth = "200px";
                    infoDiv.innerHTML = `
                        <h4 style="margin: 0; color: var(--primary-color); font-size: 1.15rem;">${data.name || 'Movie Date'}</h4>
                        <p style="margin: 5px 0 5px 0; font-size: 0.85rem; opacity: 0.8;">${data.movie} • ${data.date || 'TBA'}</p>
                        <p style="margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--text-color); opacity: 0.9;">
                            ${data.views || 0} <span style="font-weight: normal; opacity: 0.7;">Views</span>
                        </p>
                    `;

                    const rightColumn = document.createElement('div');
                    rightColumn.style.cssText = "display: flex; align-items: stretch; gap: 8px;";

                    const viewBtn = document.createElement('button');
                    viewBtn.className = 'action-btn view-btn';
                    viewBtn.textContent = 'View ↗';
                    viewBtn.style.display = 'flex';
                    viewBtn.style.alignItems = 'center';
                    viewBtn.onclick = () => window.open(`https://inbyte.date/invite/?id=${docId}&m=${encodeURIComponent(data.movie)}`, '_blank');

                    const kebabContainer = document.createElement('div');
                    kebabContainer.className = 'kebab-container';

                    const kebabBtn = document.createElement('button');
                    kebabBtn.className = 'kebab-btn';
                    kebabBtn.innerHTML = '⋮';

                    const dropdown = document.createElement('div');
                    dropdown.className = 'action-dropdown';

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

                    kebabBtn.onclick = (e) => {
                        e.stopPropagation();
                        document.querySelectorAll('.action-dropdown').forEach(d => {
                            if (d !== dropdown) d.classList.remove('show');
                        });
                        dropdown.classList.toggle('show');
                    };

                    kebabContainer.appendChild(kebabBtn);
                    kebabContainer.appendChild(dropdown);

                    rightColumn.appendChild(viewBtn);
                    rightColumn.appendChild(kebabContainer);

                    itemDiv.appendChild(infoDiv);
                    itemDiv.appendChild(rightColumn);
                    invitesList.appendChild(itemDiv);
                });
            } else {
                invitesList.innerHTML = `<p>You don't have any active invites right now.</p>`;
            }
            
            document.getElementById('totalInvites').textContent = totalInvitesCount;
            document.getElementById('totalViews').textContent = totalViewsCount;
            document.getElementById('activeLinks').textContent = activeLinksCount; 
            
        } else {
            invitesList.innerHTML = `
                <p>You haven't created any invites yet.</p>
                <p>Click the button above to get started!</p>
            `;
            document.getElementById('totalInvites').textContent = "0";
            document.getElementById('totalViews').textContent = "0";
            document.getElementById('activeLinks').textContent = "0";
        }
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        invitesList.innerHTML = `<p style="color: red;">Failed to load data. Please refresh.</p>`;
    }
}

window.confirmDeleteInvite = function(docId) {
    window.docToDelete = docId;
    document.getElementById('deleteModal').classList.add('active');
};

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!window.docToDelete) return;

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = "Deleting...";
    confirmBtn.disabled = true;

    try {
        await updateDoc(doc(db, "invites", window.docToDelete), { 
            status: 'deleted',
            updatedAt: Date.now()
        });
        window.closeDeleteModal();
        loadDashboardData(currentUserId); 
    } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete the invite.");
    } finally {
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
});

window.openEditModal = function(docId, data) {
    currentEditDocId = docId;
    currentEditData = data;
    
    document.getElementById('editName').value = data.name || "";
    document.getElementById('editMovie').value = data.movie || "";
    document.getElementById('editMainQ').value = data.mainQ || "";
    document.getElementById('editSubQ').value = data.subQ || "";
    document.getElementById('editLoc').value = data.loc || "";
    
    window.editQuill.root.innerHTML = data.msg || "";
    
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
    if (editUploadedImageUrl !== "") {
        finalImage = editUploadedImageUrl; 
    } else if (removeExistingImage) {
        finalImage = ""; 
    }

    let richMessage = window.editQuill.root.innerHTML;
    if (richMessage === '<p><br></p>') {
        richMessage = "";
    }

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
        window.closeEditModal();
        loadDashboardData(currentUserId); 
    } catch (error) {
        console.error("Error updating document:", error);
        alert("Failed to update invite.");
    } finally {
        saveBtn.textContent = "Save Changes";
        saveBtn.disabled = false;
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        document.getElementById('userName').textContent = user.displayName ? user.displayName.split(' ')[0] : 'User';
        document.querySelector('.dashboard-container').style.visibility = 'visible';
        loadDashboardData(user.uid);
    } else {
        window.location.replace("login.html");
    }
});

customElements.whenDefined('private-header').then(() => {
    setTimeout(() => {
        const logoutBtn = document.getElementById('privateLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    window.location.replace('login.html'); 
                });
            });
        }
    }, 50);
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.kebab-container')) {
        document.querySelectorAll('.action-dropdown.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});