<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Movie Date RSVP</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/spideyyy.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <!-- Using Playfair Display for an elegant RSVP look -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">
    
    <style>
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            
            /* Add the background image here */
            background-image: url('{{ asset('assets/wallpaper/spiderman_bg.png') }}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            
            font-family: 'Poppins', sans-serif;
            color: #e0e0e0; 
            overflow: hidden;
        }

        .card {
            background: rgba(255,255,255,.08);
            padding: 3rem 4rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            text-align: center;
            max-width: 500px;
            backdrop-filter: blur(18px);
            border: 1px solid rgba(255,255,255,.15);
        }

        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.2rem;
            color: #ffffff;
            margin-bottom: 2rem;
            line-height: 1.3;
            text-shadow: 0 2px 15px rgba(255, 255, 255, 0.15);
        }

        .details {
            margin-bottom: 2.5rem;
            font-size: 1.1rem;
            line-height: 1.8;
            color: #f5f5f5;
        }

        .highlight {
            font-weight: 500;
            color: #ff4d4d; /* Spiderman Red */
            text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
        }

        .buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            position: relative;
        }

        button {
            padding: 12px 36px;
            font-size: 1.1rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: transform 0.2s, background-color 0.2s;
        }

        .btn-yes {
            background-color: #E23636; /* Spidey Red */
            color: white;
            box-shadow: 0 4px 15px rgba(226, 54, 54, 0.3);
        }

        .btn-yes:hover {
            background-color: #C62828;
            transform: scale(1.05);
        }

        .btn-no {
            background-color: #2B5292; /* Muted Web-Slinger Blue */
            color: white;
            transition: left 0.4s ease-out, top 0.4s ease-out, transform 0.2s, background-color 0.2s;
            z-index: 50;
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            
            /* Smooth fade in */
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
            z-index: 1000;
        }

        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Web 1: The Shooting String */
        .web-shoot {
            position: fixed;
            top: 58%;
            left: 48%;
            width: 100vw; 
            height: 100vh;
            object-fit: cover;
            z-index: 2000; 
            pointer-events: none;
            opacity: 0;
        }

        /* Web 2: The Splat */
        .web-splat {
            position: absolute;
            top: 58%;
            left: 48%;
            width: 100vw; 
            height: 100vh;
            object-fit: cover;
            /* Layered IN FRONT of the modal to correctly "pull" it */
            z-index: 3; 
            pointer-events: none;
            opacity: 0;
        }

        /* The Modal Card */
        .modal-content {
            position: relative;
            z-index: 2; 
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px); 
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 3rem;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5); 
            color: #f5f5f5; 
            
            /* Hidden until pulled by the web */
            opacity: 0; 
        }

        /* --- THE ANIMATION TIMELINE --- */
        
        /* Phase 1: Shoot from camera to screen */
        @keyframes shootWeb {
            0% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        /* Phase 2: Splat against the screen */
        @keyframes splatIn {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        /* Phase 3: Webs zoom out toward the camera and fade out gracefully */
        @keyframes pullOutWeb {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-70%, 60%) scale(5); opacity: 0; }
        }

        /* Phase 3: Modal is pulled from the screen toward the camera */
        @keyframes pullModal {
            0% { transform: scale(0.2); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }

        .modal-title {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #ff4d4d; 
            text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
        }
    </style>
</head>
<body>

    <div class="card">
        <!-- Added id="inviteTitle" -->
        <h1 id="inviteTitle">Will you go on a movie date with me? <br><em>I bought tickets!</em></h1>
        
        <div class="details">
            <!-- Added id="movieName", id="dateTime", and id="locationPlace" -->
            <p><strong>Movie:</strong> <span class="highlight" id="movieName">Spiderman: Brand New Day</span></p>
            <p><strong>Date & Time:</strong> <span id="dateTime">July 31, 2026 @ 9:15 PM</span></p>
            <p><strong>Location:</strong> <span id="locationPlace">SM MOA ScreenX</span></p>
        </div>

        <div class="buttons">
            <button class="btn-yes" id="yesBtn">Yes</button>
            <button class="btn-no" id="noBtn">No</button>
        </div>
    </div>

    <!-- Web String: Hidden by default, shoots from the camera -->
    <img src="{{ asset('assets/wallpaper/web1.png') }}" id="web1" class="web-shoot" alt="Web String">

    <!-- Modal Overlay -->
    <div class="modal-overlay" id="successModal">
        <!-- Splat Image -->
        <img src="{{ asset('assets/wallpaper/web2.png') }}" id="web2" class="web-splat" alt="Web Splat">
        
        <div class="modal-content">
            <div class="modal-title">Best decision you've made all day!</div>
            <p id="modalMessage">See you on the 31st!</p>
        </div>
    </div>
    
    <script>
        // --- URL PARAMETER LOGIC ---
        // This grabs any custom text packed into the web link
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('name')) {
            document.getElementById('inviteTitle').innerHTML = params.get('name') + ", will you go on a movie date with me? <br><em>I bought tickets!</em>";
        }
        if (params.has('movie')) {
            document.getElementById('movieName').textContent = params.get('movie');
        }
        if (params.has('date')) {
            document.getElementById('dateTime').textContent = params.get('date');
        }
        if (params.has('loc')) {
            document.getElementById('locationPlace').textContent = params.get('loc');
        }
        if (params.has('msg')) {
            document.getElementById('modalMessage').innerHTML = params.get('msg');
        }
        // ---------------------------
        
        const noBtn = document.getElementById('noBtn');
        const yesBtn = document.getElementById('yesBtn');
        const modal = document.getElementById('successModal');

        // The Smooth "Runaway" No Button Logic
        noBtn.addEventListener('mouseover', function() {
            if (this.style.position !== 'fixed') {
                const rect = this.getBoundingClientRect();
                
                // Detach from the .card and attach directly to the <body>
                document.body.appendChild(this);

                this.style.position = 'fixed';
                this.style.left = rect.left + 'px';
                this.style.top = rect.top + 'px';
                
                this.getBoundingClientRect(); 
            }

            const maxX = window.innerWidth - this.offsetWidth;
            const maxY = window.innerHeight - this.offsetHeight;
            
            const randomX = Math.max(0, Math.floor(Math.random() * maxX));
            const randomY = Math.max(0, Math.floor(Math.random() * maxY));
            
            this.style.left = randomX + 'px';
            this.style.top = randomY + 'px';
        });

        // The "Yes" Button Action Sequence
        yesBtn.addEventListener('click', function() {
            const web1 = document.getElementById('web1');
            const web2 = document.getElementById('web2');
            const modalContent = document.querySelector('.modal-content');
            
            // Activate overlay immediately to darken the background
            modal.classList.add('active');
            
            // Phase 1: Shoot web1 (Duration: 0.5s)
            web1.style.animation = 'shootWeb 0.25s ease-out forwards';
            
            // Phase 2: Wait 0.5s, then Splat web2 (Duration: 0.5s)
            setTimeout(() => {
                web2.style.animation = 'splatIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                
                // Phase 3: Wait 0.5s, then fade webs out while pulling modal in
                setTimeout(() => {
                    web1.style.animation = 'pullOutWeb 0.25s ease-in forwards';
                    web2.style.animation = 'pullOutWeb 0.25s ease-in forwards';
                    
                    // The modal uses the elastic bezier curve to "pop" into its final place
                    modalContent.style.animation = 'pullModal 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                    
                }, 250); 
                
            }, 250); 
        });
    </script>
</body>
</html>
