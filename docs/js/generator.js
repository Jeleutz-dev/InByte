import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

let currentUser = null;

// Initialize Quill
const quill = new Quill('#quillEditor', {
    theme: 'snow',
    placeholder: 'Write your success message here...',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline']
        ]
    }
});

// Cloudinary Logic
const imageInput = document.getElementById('clientImage');
const uploadStatus = document.getElementById('uploadStatus');
let uploadedImageUrl = ""; 

if (imageInput) {
    imageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        uploadStatus.textContent = "Uploading to cloud... ⏳";
        uploadStatus.style.color = "#ffaa00";

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
                uploadedImageUrl = data.secure_url;
                uploadStatus.textContent = "Upload complete! ✅";
                uploadStatus.style.color = "#00cc44"; 
            } else {
                throw new Error("Failed to get URL");
            }
        } catch (error) {
            console.error("Upload error:", error);
            uploadStatus.textContent = "Upload failed. Try again. ❌";
            uploadStatus.style.color = "#ff0000"; 
        }
    });
}

// Authentication & Logout
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.querySelector('.generator-container').style.visibility = 'visible';
    } else {
        window.location.replace("../pages/login.html");
    }
});

customElements.whenDefined('private-header').then(() => {
    setTimeout(() => {
        const logoutBtn = document.getElementById('privateLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    window.location.replace('../pages/login.html'); 
                });
            });
        }
    }, 50);
});

// Generator Logic
window.generateLink = async function() {
    if (!currentUser) {
        alert("You must be logged in to create an invite.");
        return;
    }

    let dateVal = document.getElementById('genDate').value;
    let timeVal = document.getElementById('genTime').value;
    let formattedDate = "";
    
    if (dateVal) {
        let [year, month, day] = dateVal.split('-');
        let d = new Date(year, month - 1, day);
        let datePart = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        if (timeVal) {
            let [hours, minutes] = timeVal.split(':');
            let ampm = hours >= 12 ? 'PM' : 'AM';
            let h = hours % 12;
            h = h ? h : 12; 
            formattedDate = datePart + " @ " + h + ":" + minutes + " " + ampm;
        } else {
            formattedDate = datePart; 
        }
    }

    let richMessage = quill.root.innerHTML;
    if (richMessage === '<p><br></p>') {
        richMessage = "";
    }

    const inviteData = {
        userId: currentUser.uid,
        name: document.getElementById('genName').value,
        movie: document.getElementById('genMovie').value,
        date: formattedDate,
        loc: document.getElementById('genLoc').value,
        msg: richMessage, 
        mainQ: document.getElementById('genMainQ').value,
        subQ: document.getElementById('genSubQ').value,
        img: uploadedImageUrl,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: Date.now(),
        views: 0
    };

    try {
        const docRef = await addDoc(collection(db, "invites"), inviteData);
        
        let baseUrl = 'https://inbyte.date/invite/';
        const finalUrl = baseUrl + '?id=' + docRef.id + '&m=' + encodeURIComponent(inviteData.movie);
        
        const resultBox = document.getElementById('resultBox');
        const resultLink = document.getElementById('resultLink');
        
        resultBox.style.display = 'block';
        resultLink.href = finalUrl;
        resultLink.textContent = finalUrl;

    } catch (e) {
        console.error("Error saving document to Firestore: ", e);
        alert("Failed to generate link. Check console for details.");
    }
};

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});