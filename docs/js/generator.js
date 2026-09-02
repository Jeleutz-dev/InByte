import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, onSnapshot, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// Helper to bundle form data cleanly
function getFormData() {
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

    return {
        name: document.getElementById('genName').value,
        movie: document.getElementById('genMovie').value,
        date: formattedDate,
        loc: document.getElementById('genLoc').value,
        msg: richMessage, 
        mainQ: document.getElementById('genMainQ').value,
        subQ: document.getElementById('genSubQ').value,
        img: uploadedImageUrl
    };
}

function displayFinalLink(inviteId, movieName) {
    const finalUrl = `https://inbyte.date/invite/?id=${inviteId}&m=${encodeURIComponent(movieName || '')}`;
    const resultBox = document.getElementById('resultBox');
    const resultLink = document.getElementById('resultLink');
    const genBtn = document.getElementById('generateBtn');

    if (resultBox) resultBox.style.display = 'block';
    if (resultLink) {
        resultLink.href = finalUrl;
        resultLink.textContent = finalUrl;
    }
    if (genBtn) genBtn.style.display = 'none';
}

// Admin only direct link generator (bypasses PayMongo payment)
async function adminGenerateLink() {
    const genBtn = document.getElementById('generateBtn');
    if (genBtn) {
        genBtn.disabled = true;
        genBtn.innerText = "Generating admin invite... ⏳";
    }

    const inviteData = {
        ...getFormData(),
        userId: currentUser.uid,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: Date.now(),
        views: 0
    };

    try {
        const docRef = await addDoc(collection(db, "invites"), inviteData);
        displayFinalLink(docRef.id, inviteData.movie);
    } catch (e) {
        console.error("Admin bypass failed:", e);
        alert("Failed to generate link.");
        if (genBtn) {
            genBtn.disabled = false;
            genBtn.innerText = "Generate Custom Link";
        }
    }
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

// --- WIZARD NAVIGATION LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    let currentStep = 1;
    const totalSteps = 5;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const stepIndicator = document.getElementById('stepIndicator');
    const dateTypeSelect = document.getElementById('genDateType');
    const themeContainer = document.getElementById('movieThemeContainer');
    const genBtn = document.getElementById('generateBtn');

    if (genBtn) {
        genBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser && currentUser.email === 'jeleutz19@gmail.com') {
                adminGenerateLink();
            }
        });
    }

    function updateWizard() {
        if (stepIndicator) stepIndicator.innerText = `Step ${currentStep} of ${totalSteps}`;

        for (let i = 1; i <= totalSteps; i++) {
            const stepDiv = document.getElementById(`step${i}`);
            if (stepDiv) stepDiv.style.display = (i === currentStep) ? 'block' : 'none';
        }

        if (prevBtn) prevBtn.style.display = (currentStep === 1) ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = (currentStep === totalSteps) ? 'none' : 'block';

        // Step 5 handling
        if (currentStep === totalSteps) {
            const paymentSection = document.getElementById('paymentSection');
            const generateSection = document.getElementById('generateSection');
            const step5Title = document.getElementById('step5Title');
            const generateSubtext = document.getElementById('generateSubtext');

            if (currentUser && currentUser.email === 'jeleutz19@gmail.com') {
                // Admin Bypass View
                if (paymentSection) paymentSection.style.display = 'none';
                if (generateSection) generateSection.style.display = 'block';
                if (step5Title) step5Title.innerText = 'Admin Access Granted';
                if (generateSubtext) generateSubtext.innerText = 'Payment bypassed. Ready to create.';
            } else {
                // Regular User View
                if (paymentSection) paymentSection.style.display = 'block';
                if (generateSection) generateSection.style.display = 'none';
                if (step5Title) step5Title.innerText = 'Complete Your Order';
            }
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (currentStep < totalSteps) {
                currentStep++;
                updateWizard();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentStep > 1) {
                currentStep--;
                updateWizard();
            }
        });
    }

    if (dateTypeSelect && themeContainer) {
        dateTypeSelect.addEventListener('change', (e) => {
            themeContainer.style.display = (e.target.value === 'Movie date') ? 'block' : 'none';
        });
    }

    // --- PAYMONGO CHECKOUT TRIGGER ---
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!currentUser) {
                alert("Please log in before proceeding.");
                return;
            }

            payBtn.innerText = "Creating Secure Checkout... ⏳";
            payBtn.disabled = true;

            const inviteData = getFormData();

            try {
                const response = await fetch("https://us-central1-inbyte-95cd5.cloudfunctions.net/createCheckout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        inviteData: inviteData,
                        userId: currentUser.uid
                    })
                });

                const session = await response.json();

                if (session.data && session.data.attributes && session.data.attributes.checkout_url) {
                    window.location.href = session.data.attributes.checkout_url;
                } else {
                    throw new Error("Missing checkout_url from PayMongo response.");
                }
            } catch (err) {
                console.error("Payment error:", err);
                alert("Failed to initialize payment gateway. Please try again.");
                payBtn.innerText = "Pay to Unlock";
                payBtn.disabled = false;
            }
        });
    }

    // --- HANDLE RETURN URL AFTER PAYMENT ---
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const returnInviteId = urlParams.get('invite_id');

    if (paymentStatus === 'success' || paymentStatus === 'cancelled') {
        currentStep = 5; 
        updateWizard();
        
        const paymentSection = document.getElementById('paymentSection');
        const generateSection = document.getElementById('generateSection');
        const step5Title = document.getElementById('step5Title');
        const generateSubtext = document.getElementById('generateSubtext');

        if (paymentStatus === 'success') {
            if (paymentSection) paymentSection.style.display = 'none';
            if (generateSection) generateSection.style.display = 'block';
            
            if (step5Title) step5Title.innerText = 'Payment Confirmed! Finalizing Link... ⏳';
            if (generateSubtext) {
                generateSubtext.innerText = 'Waiting for PayMongo webhook verification... Please wait.';
                generateSubtext.style.color = '#ffaa00';
            }

            if (returnInviteId) {
                // Listen to the document in real time. As soon as the webhook sets status to 'active', render the link.
                const unsubscribe = onSnapshot(doc(db, "invites", returnInviteId), (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        if (data.status === 'active') {
                            unsubscribe();
                            window.history.replaceState({}, document.title, window.location.pathname);
                            if (step5Title) step5Title.innerText = 'Invitation Created! 🎉';
                            if (generateSubtext) {
                                generateSubtext.innerText = 'Your custom link is ready and verified!';
                                generateSubtext.style.color = '#28a745';
                            }
                            displayFinalLink(returnInviteId, data.movie);
                        }
                    }
                }, (error) => {
                    console.error("Snapshot error:", error);
                });
            }
        } else if (paymentStatus === 'cancelled') {
            window.history.replaceState({}, document.title, window.location.pathname);
            if (step5Title) step5Title.innerText = 'Payment Cancelled';
            if (generateSubtext) {
                generateSubtext.innerText = 'Your transaction was cancelled. No charges were made.';
                generateSubtext.style.color = '#dc3545';
            }
            if (paymentSection) paymentSection.style.display = 'block';
            if (generateSection) generateSection.style.display = 'none';
        }
    } else {
        updateWizard();
    }
});