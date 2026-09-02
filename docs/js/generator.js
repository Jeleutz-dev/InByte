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

    // 1. Target the button and disable it immediately to block spam clicks
    const genBtn = document.getElementById('generateBtn');
    if (genBtn) {
        genBtn.disabled = true;
        genBtn.innerText = "Saving... ⏳";
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

        // 2. Hide the button entirely once generation is successful
        if (genBtn) {
            genBtn.style.display = 'none';
        }

    } catch (e) {
        console.error("Error saving document to Firestore: ", e);
        alert("Failed to generate link. Check console for details.");
        
        // 3. Re-enable the button if there is an error so they can try again
        if (genBtn) {
            genBtn.disabled = false;
            genBtn.innerText = "Generate Custom Link";
        }
    }
};

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

    function updateWizard() {
        if (stepIndicator) stepIndicator.innerText = `Step ${currentStep} of ${totalSteps}`;

        for (let i = 1; i <= totalSteps; i++) {
            const stepDiv = document.getElementById(`step${i}`);
            if (stepDiv) stepDiv.style.display = (i === currentStep) ? 'block' : 'none';
        }

        if (prevBtn) prevBtn.style.display = (currentStep === 1) ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = (currentStep === totalSteps) ? 'none' : 'block';

        // Admin Bypass & Payment Logic for Step 5
        if (currentStep === totalSteps) {
            const paymentSection = document.getElementById('paymentSection');
            const generateSection = document.getElementById('generateSection');
            const step5Title = document.getElementById('step5Title');
            const generateSubtext = document.getElementById('generateSubtext');

            if (currentUser && currentUser.email === 'jeleutz19@gmail.com') {
                // Admin Bypass
                if (paymentSection) paymentSection.style.display = 'none';
                if (generateSection) generateSection.style.display = 'block';
                if (step5Title) step5Title.innerText = 'Admin Access Granted';
                if (generateSubtext) generateSubtext.innerText = 'Payment bypassed. Ready to create.';
            } else {
                // Standard User
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

    // --- PAYMONGO CHECKOUT LOGIC (TEST MODE ONLY) ---
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // 1. Save all wizard input values to sessionStorage before leaving the page
            const formDataToSave = {
                name: document.getElementById('genName')?.value || '',
                movie: document.getElementById('genMovie')?.value || '',
                mainQ: document.getElementById('genMainQ')?.value || '',
                subQ: document.getElementById('genSubQ')?.value || '',
                date: document.getElementById('genDate')?.value || '',
                time: document.getElementById('genTime')?.value || '',
                loc: document.getElementById('genLoc')?.value || '',
                msg: quill.root.innerHTML,
                img: uploadedImageUrl
            };
            sessionStorage.setItem('pendingInviteData', JSON.stringify(formDataToSave));

            payBtn.innerText = "Connecting to PayMongo... ⏳";
            payBtn.disabled = true;

            try {
                // Ping your secure backend (which handles the secret key and payload)
                const response = await fetch("https://us-central1-inbyte-95cd5.cloudfunctions.net/createCheckout", {
                    method: "POST"
                });

                const data = await response.json();

                if (data.data && data.data.attributes.checkout_url) {
                    window.location.href = data.data.attributes.checkout_url;
                } else {
                    console.error("PayMongo Error:", data);
                    throw new Error("Unable to create checkout session");
                }
            } catch (err) {
                console.error("Payment error:", err);
                alert("Failed to initialize payment. Check console for details.");
                payBtn.innerText = "Pay to Unlock";
                payBtn.disabled = false;
            }
        });
    }

    // --- HANDLE RETURN URL AFTER PAYMENT ---
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success' || paymentStatus === 'cancelled') {
        currentStep = 5; 
        
        // Restore the saved form inputs from sessionStorage
        const savedDataJson = sessionStorage.getItem('pendingInviteData');
        if (savedDataJson) {
            const data = JSON.parse(savedDataJson);
            if (document.getElementById('genName')) document.getElementById('genName').value = data.name;
            if (document.getElementById('genMovie')) document.getElementById('genMovie').value = data.movie;
            if (document.getElementById('genMainQ')) document.getElementById('genMainQ').value = data.mainQ;
            if (document.getElementById('genSubQ')) document.getElementById('genSubQ').value = data.subQ;
            if (document.getElementById('genDate')) document.getElementById('genDate').value = data.date;
            if (document.getElementById('genTime')) document.getElementById('genTime').value = data.time;
            if (document.getElementById('genLoc')) document.getElementById('genLoc').value = data.loc;
            if (data.msg && data.msg !== '<p><br></p>') quill.root.innerHTML = data.msg;
            if (data.img) uploadedImageUrl = data.img;
            
            // Clear storage so it doesn't linger
            sessionStorage.removeItem('pendingInviteData');
        }

        window.history.replaceState({}, document.title, window.location.pathname);
        updateWizard();
        
        const paymentSection = document.getElementById('paymentSection');
        const generateSection = document.getElementById('generateSection');
        const step5Title = document.getElementById('step5Title');
        const generateSubtext = document.getElementById('generateSubtext');

        if (paymentStatus === 'success') {
            if (paymentSection) paymentSection.style.display = 'none';
            if (generateSection) generateSection.style.display = 'block';
            
            // 1. Show a loading state to prevent the user from leaving
            if (step5Title) step5Title.innerText = 'Payment Successful! Generating Link... ⏳';
            if (generateSubtext) {
                generateSubtext.innerText = 'Please do not close this page. We are saving your invitation...';
                generateSubtext.style.color = '#ffaa00'; // Orange loading text
            }

            // 2. Automatically trigger the generation function after a tiny delay to ensure the DOM is ready
            setTimeout(async () => {
                try {
                    await window.generateLink();
                    
                    // 3. Update text to success once Firestore saves the data
                    if (step5Title) step5Title.innerText = 'Invitation Created! 🎉';
                    if (generateSubtext) {
                        generateSubtext.innerText = 'Your custom link is ready and safely saved to your dashboard.';
                        generateSubtext.style.color = '#28a745'; // Green success text
                    }
                } catch (err) {
                    console.error("Auto-generate failed:", err);
                    if (step5Title) step5Title.innerText = 'Payment Received!';
                    if (generateSubtext) {
                        generateSubtext.innerText = 'Auto-generation lagged. Please click the generate button below to finish.';
                        generateSubtext.style.color = '#dc3545'; // Red error text
                    }
                }
            }, 800);
        } else if (paymentStatus === 'cancelled') {
            if (step5Title) step5Title.innerText = 'Payment Cancelled';
            if (generateSubtext) {
                generateSubtext.innerText = 'Your transaction was not completed. You can click below to try again.';
                generateSubtext.style.color = '#dc3545'; // Red text for cancelled
            }
            if (paymentSection) paymentSection.style.display = 'block';
            if (generateSection) generateSection.style.display = 'none';
        }
    } else {
        updateWizard();
    }
});