import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
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

let allInvitesData = []; 
let currentFilter = 'active';
let currentUser = null;

const MAIN_ADMIN_EMAIL = "jeleutz19@gmail.com";

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
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
        querySnapshot.forEach((doc) => {
            allInvitesData.push({ id: doc.id, ...doc.data() });
        });

        allInvitesData.sort((a, b) => b.createdAt - a.createdAt);
        applyFilters();
    } catch (error) {
        console.error("Error fetching invites:", error);
        invitesListContainer.innerHTML = `<p style="text-align:center; color: red;">Error loading invites.</p>`;
    }
}

function applyFilters() {
    const searchTerm = (searchInput.value || '').toLowerCase();
    
    const filtered = allInvitesData.filter(invite => {
        const statusMatch = (invite.status || 'active') === currentFilter;
        const nameMatch = (invite.partnerName || invite.name || '').toLowerCase().includes(searchTerm);
        const movieMatch = (invite.movieTitle || invite.movie || '').toLowerCase().includes(searchTerm);
        return statusMatch && (nameMatch || movieMatch);
    });

    renderInvites(filtered);
}

function renderInvites(invites) {
    invitesListContainer.innerHTML = '';
    
    if (invites.length === 0) {
        invitesListContainer.innerHTML = `<p style="text-align:center; opacity: 0.7;">No ${currentFilter} invites found.</p>`;
        return;
    }

    const isAdmin = currentUser && currentUser.email === MAIN_ADMIN_EMAIL;

    invites.forEach(invite => {
        const name = invite.partnerName || invite.name || 'Unnamed Invite';
        const movie = invite.movieTitle || invite.movie || 'Not specified';
        const status = invite.status || 'active';

        // Check if delete button should be shown
        // Hide delete button in the 'deleted' tab unless user is main admin
        const showDeleteButton = !(status === 'deleted' && !isAdmin);

        const card = document.createElement('div');
        card.className = 'invite-card'; 
        card.style.display = 'flex'; 
        card.style.justifyContent = 'space-between';
        card.style.padding = '15px 0';
        card.style.borderBottom = '1px solid var(--border-color)';
        
        card.innerHTML = `
            <div class="invite-info">
                <h3 style="margin:0 0 5px 0;">${name}</h3>
                <p style="margin:0; font-size:0.9rem; opacity:0.8;">Movie: ${movie}</p>
                <span class="status-badge ${status}" style="font-size:0.75rem; padding:3px 8px; border-radius:12px; display:inline-block; margin-top:5px; text-transform:uppercase;">${status}</span>
            </div>
            <div class="invite-actions" style="display:flex; gap:10px; align-items:center;">
                ${status === 'active' ? `<button class="action-btn view-btn" data-id="${invite.id}">View</button>` : ''}
                ${showDeleteButton ? `<button class="action-btn delete-btn" data-id="${invite.id}" style="color:var(--primary-color); border-color:var(--primary-color);">Delete</button>` : ''}
            </div>
        `;
        invitesListContainer.appendChild(card);
    });

    attachActionListeners();
}

// Filter Button Clicks
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        applyFilters();
    });
});

if (searchInput) searchInput.addEventListener('input', applyFilters);

function attachActionListeners() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => window.open(`../invite/index.html?id=${e.target.dataset.id}`, '_blank'));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const inviteId = e.target.dataset.id;
            if(confirm("Move this invite to deleted?")) {
                try {
                    await updateDoc(doc(db, "invites", inviteId), { status: 'deleted' });
                    const targetInvite = allInvitesData.find(inv => inv.id === inviteId);
                    if (targetInvite) targetInvite.status = 'deleted';
                    applyFilters();
                } catch (error) {
                    console.error("Error updating status: ", error);
                }
            }
        });
    });
}