// --- DATA: Embedded ---
const videos = [
    {
        "id": "1",
        "title": "Big Buck Bunny",
        "description": "A large and lovable rabbit deals with three tiny bullies.",
        "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "duration": "09:56"
    },
    {
        "id": "2",
        "title": "Elephants Dream",
        "description": "The world's first open movie, made entirely with open source.",
        "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/800px-Elephants_Dream_s5_both.jpg",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "duration": "10:53"
    },
    {
        "id": "3",
        "title": "Sintel",
        "description": "A lonely young woman, Sintel, helps and befriends a dragon.",
        "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sintel_poster.png/800px-Sintel_poster.png",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        "duration": "14:48"
    },
    {
        "id": "4",
        "title": "Tears of Steel",
        "description": "Warriors and scientists gather at the Oude Kerk in Amsterdam.",
        "thumbnail": "https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        "duration": "12:14"
    },
    {
        "id": "5",
        "title": "Cosmos Laundromat",
        "description": "Franck, a depressed sheep, sees his life change.",
        "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Cosmos_Laundromat_-_Poster.jpg",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", /* Placeholder */
        "duration": "12:10"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentIndex = 0;
    let currentList = [...videos];

    // --- Elements ---
    const cardDeck = document.getElementById('card-deck');
    const searchToggle = document.getElementById('search-toggle');
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');
    
    // Bottom Dock Elements
    const btnLike = document.getElementById('dock-like');
    const btnDownload = document.getElementById('dock-download');
    const btnShare = document.getElementById('dock-share');

    // Player Elements
    const playerOverlay = document.getElementById('player-overlay');
    const videoWrapper = document.getElementById('video-wrapper');
    const videoPlayer = document.getElementById('main-video');
    const closeBtn = document.getElementById('close-player');
    const playPauseBtn = document.getElementById('play-pause');
    const centerPlayBtn = document.getElementById('center-play');
    const seekSlider = document.getElementById('seek-slider');
    const progressFill = document.getElementById('progress-fill');
    const timeDisplay = document.getElementById('time-display');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    // --- 1. Startup & Animation Handling ---
    const lockIcon = document.getElementById('splash-lock');
    setTimeout(() => {
        // Change icon mid-animation
        lockIcon.textContent = 'lock_open';
    }, 1200);

    // --- 2. Render Deck ---
    function renderDeck() {
        cardDeck.innerHTML = '';
        if(currentList.length === 0) {
            document.getElementById('no-results').classList.remove('hidden');
            return;
        }
        document.getElementById('no-results').classList.add('hidden');

        currentList.forEach((video, index) => {
            const card = document.createElement('div');
            card.className = `video-card ${getCardState(index)}`;
            card.dataset.index = index;
            
            card.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="card-content">
                    <h2>${video.title}</h2>
                    <span class="card-meta">${video.duration} • 4K</span>
                </div>
            `;
            
            // Interaction
            card.onclick = () => {
                if(index === currentIndex) openPlayer(video);
                else {
                    currentIndex = index;
                    updateDeckVisuals();
                }
            };

            cardDeck.appendChild(card);
        });
        updateDock();
    }

    function getCardState(index) {
        if (index === currentIndex) return 'active';
        if (index === currentIndex - 1) return 'prev';
        if (index === currentIndex + 1) return 'next';
        return 'hidden';
    }

    function updateDeckVisuals() {
        const cards = document.querySelectorAll('.video-card');
        cards.forEach((card, index) => {
            card.className = `video-card ${getCardState(index)}`;
        });
        updateDock(); // Reset like button state for new video
    }

    // --- 3. Swipe Logic (Touch & Mouse) ---
    let startX = 0;
    let isDragging = false;

    document.querySelector('.card-deck-wrapper').addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    document.querySelector('.card-deck-wrapper').addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const endX = e.changedTouches[0].clientX;
        handleSwipe(startX, endX);
        isDragging = false;
    });

    // Mouse support for desktop testing
    document.querySelector('.card-deck-wrapper').addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
    });

    document.querySelector('.card-deck-wrapper').addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        handleSwipe(startX, e.clientX);
        isDragging = false;
    });

    function handleSwipe(start, end) {
        const threshold = 50;
        const diff = start - end;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swiped Left -> Next Video
                if (currentIndex < currentList.length - 1) currentIndex++;
            } else {
                // Swiped Right -> Prev Video
                if (currentIndex > 0) currentIndex--;
            }
            updateDeckVisuals();
        }
    }

    // --- 4. Search ---
    searchToggle.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) searchInput.focus();
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        currentList = videos.filter(v => v.title.toLowerCase().includes(term));
        currentIndex = 0;
        renderDeck();
    });

    // --- 5. Dock Actions ---
    function updateDock() {
        // Reset like button visual
        btnLike.classList.remove('liked');
        btnLike.querySelector('span').textContent = 'favorite';
    }

    btnLike.addEventListener('click', () => {
        btnLike.classList.toggle('liked');
        const icon = btnLike.querySelector('span');
        icon.textContent = btnLike.classList.contains('liked') ? 'favorite' : 'favorite'; // Filled vs outlined handled by CSS/Font
    });

    btnDownload.addEventListener('click', () => {
        const video = currentList[currentIndex];
        const link = getDirectLink(video.videoUrl);
        window.open(link, '_blank');
    });

    btnShare.addEventListener('click', () => {
        const video = currentList[currentIndex];
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Watch ${video.title} on VaultStreaming!`,
                url: window.location.href
            });
        } else {
            alert('Link copied to clipboard!');
        }
    });

    // --- 6. Player Logic ---
    function getDirectLink(url) {
        if (url.includes('drive.google.com')) {
            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
        return url;
    }

    function openPlayer(video) {
        const src = getDirectLink(video.videoUrl);
        videoPlayer.src = src;
        document.getElementById('player-title').textContent = video.title;
        
        playerOverlay.classList.remove('hidden');
        videoWrapper.classList.remove('paused');
        
        // Try auto-fullscreen on mobile
        if(window.innerWidth < 768) {
            // Browsers often block this without direct interaction, but we try
            // or we just rely on the layout being immersive
        }

        videoPlayer.play().then(() => updatePlayIcon(true))
        .catch(() => updatePlayIcon(false));
    }

    closeBtn.addEventListener('click', () => {
        playerOverlay.classList.add('hidden');
        videoPlayer.pause();
        videoPlayer.src = "";
    });

    function togglePlay() {
        if (videoPlayer.paused) {
            videoPlayer.play();
            updatePlayIcon(true);
        } else {
            videoPlayer.pause();
            updatePlayIcon(false);
        }
    }

    function updatePlayIcon(isPlaying) {
        const icon = isPlaying ? 'pause' : 'play_arrow';
        playPauseBtn.querySelector('span').textContent = icon;
        centerPlayBtn.querySelector('span').textContent = icon;
        if(isPlaying) {
            centerPlayBtn.style.opacity = '0';
            centerPlayBtn.style.transform = 'translate(-50%, -50%) scale(1.5)';
            videoWrapper.classList.remove('paused');
        } else {
            centerPlayBtn.style.opacity = '1';
            centerPlayBtn.style.transform = 'translate(-50%, -50%) scale(1)';
            videoWrapper.classList.add('paused');
        }
    }

    // Player Gestures & Inputs
    playPauseBtn.addEventListener('click', togglePlay);
    centerPlayBtn.addEventListener('click', togglePlay);
    videoWrapper.addEventListener('click', (e) => {
        if(!e.target.closest('.controls-layer') && !e.target.closest('button')) togglePlay();
    });

    videoPlayer.addEventListener('timeupdate', () => {
        if(!videoPlayer.duration) return;
        const pct = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressFill.style.width = `${pct}%`; 
        seekSlider.value = pct; 
        timeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
    });

    seekSlider.addEventListener('input', (e) => {
        const time = (e.target.value / 100) * videoPlayer.duration;
        videoPlayer.currentTime = time;
    });

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sc = Math.floor(s % 60);
        return `${m}:${sc < 10 ? '0'+sc : sc}`;
    }

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) videoWrapper.requestFullscreen().catch(e=>console.log(e));
        else document.exitFullscreen();
    });

    // Initialize
    renderDeck();
});
