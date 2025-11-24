// --- DATA: Embedded to prevent "Fetch" errors on local files ---
const videos = [
    {
        "id": "1",
        "title": "Big Buck Bunny",
        "description": "A large and lovable rabbit deals with three tiny bullies, led by a flying squirrel.",
        "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "duration": "09:56",
        "rating": 4
    },
    {
        "id": "2",
        "title": "Elephants Dream",
        "description": "The world's first open movie, made entirely with open source graphics software.",
        "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/800px-Elephants_Dream_s5_both.jpg",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "duration": "10:53",
        "rating": 3
    },
    {
        "id": "3",
        "title": "Sintel",
        "description": "A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales.",
        "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sintel_poster.png/800px-Sintel_poster.png",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        "duration": "14:48",
        "rating": 5
    },
    {
        "id": "4",
        "title": "Tears of Steel",
        "description": "A group of warriors and scientists gather at the Oude Kerk in Amsterdam.",
        "thumbnail": "https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg",
        "videoUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        "duration": "12:14",
        "rating": 4
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const videoGrid = document.getElementById('video-grid');
    const videoCount = document.getElementById('video-count');
    const searchToggle = document.getElementById('search-toggle');
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');

    // Player Elements
    const playerOverlay = document.getElementById('player-overlay');
    const videoWrapper = document.getElementById('video-wrapper');
    const videoPlayer = document.getElementById('main-video');
    const closeBtn = document.getElementById('close-player');
    const downloadBtn = document.getElementById('download-btn');
    const playPauseBtn = document.getElementById('play-pause');
    const centerPlayBtn = document.getElementById('center-play');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // Progress Bar
    const seekSlider = document.getElementById('seek-slider');
    const progressFill = document.getElementById('progress-fill');
    const timeDisplay = document.getElementById('time-display');

    // --- 1. Splash Screen Cleanup (Safety) ---
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.style.display = 'none'; // Force hide in case CSS fails
    }, 2600);

    // --- 2. Initialize ---
    renderVideos(videos);
    videoCount.textContent = `${videos.length} Videos`;

    function renderVideos(list) {
        videoGrid.innerHTML = '';
        if(list.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
            list.forEach(video => {
                const card = document.createElement('div');
                card.classList.add('video-card');
                card.onclick = () => openPlayer(video);
                card.innerHTML = `
                    <div class="thumbnail-container">
                        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                        <span class="duration-badge">${video.duration}</span>
                    </div>
                    <div class="card-info">
                        <h3 class="card-title">${video.title}</h3>
                        <div class="card-meta">
                            <span>${video.rating || 0} ★</span>
                            <span class="material-symbols-rounded" style="font-size:18px; color:var(--accent)">play_circle</span>
                        </div>
                    </div>
                `;
                videoGrid.appendChild(card);
            });
        }
    }

    // --- 3. Search ---
    searchToggle.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) searchInput.focus();
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = videos.filter(v => v.title.toLowerCase().includes(term));
        renderVideos(filtered);
    });

    // --- 4. Player Logic ---
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
        videoPlayer.poster = video.thumbnail;
        
        document.getElementById('player-title').textContent = video.title;
        document.getElementById('info-title').textContent = video.title;
        document.getElementById('info-desc').textContent = video.description;
        document.getElementById('info-duration').textContent = video.duration;
        
        downloadBtn.onclick = () => window.open(src, '_blank');
        updateRatingUI(video.rating || 0);
        
        playerOverlay.classList.remove('hidden');
        videoWrapper.classList.remove('paused');
        
        videoPlayer.play().then(() => updatePlayIcon(true))
        .catch(e => { console.log("Autoplay blocked"); updatePlayIcon(false); });
    }

    closeBtn.addEventListener('click', () => {
        playerOverlay.classList.add('hidden');
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoPlayer.src = "";
    });

    // Play/Pause
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

    playPauseBtn.addEventListener('click', togglePlay);
    centerPlayBtn.addEventListener('click', togglePlay);
    
    // --- 5. Progress Bar Logic ---
    videoPlayer.addEventListener('timeupdate', () => {
        if(!videoPlayer.duration) return;
        
        const pct = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        
        progressFill.style.width = `${pct}%`; 
        seekSlider.value = pct; 
        
        timeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
    });

    seekSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const time = (val / 100) * videoPlayer.duration;
        videoPlayer.currentTime = time;
        progressFill.style.width = `${val}%`;
    });

    function formatTime(s) {
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0'+sec : sec}`;
    }

    // --- 6. Gestures & Shortcuts ---
    function skip(amount) {
        videoPlayer.currentTime += amount;
        triggerGestureAnim(amount > 0 ? 'right' : 'left');
    }

    function triggerGestureAnim(side) {
        const el = document.getElementById(`feedback-${side}`);
        el.classList.remove('active');
        void el.offsetWidth; // Trigger reflow
        el.classList.add('active');
    }

    rewindBtn.onclick = () => skip(-10);
    forwardBtn.onclick = () => skip(10);

    // Click Detection (Play vs Double Click)
    let lastClick = 0;
    videoWrapper.addEventListener('click', (e) => {
        if(e.target.closest('.controls-bottom') || e.target.closest('.controls-top')) return;

        const now = new Date().getTime();
        const rect = videoWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x > width * 0.35 && x < width * 0.65) {
            togglePlay();
            return;
        }

        if (now - lastClick < 300) {
            if (x < width * 0.35) skip(-10);
            if (x > width * 0.65) skip(10);
        } 
        lastClick = now;
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if(playerOverlay.classList.contains('hidden')) return;
        switch(e.key) {
            case ' ': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight': skip(10); break;
            case 'ArrowLeft': skip(-10); break;
            case 'f': toggleFullScreen(); break;
        }
    });

    fullscreenBtn.addEventListener('click', toggleFullScreen);
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            videoWrapper.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    }

    // Rating
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            updateRatingUI(this.dataset.value);
        });
    });

    function updateRatingUI(val) {
        stars.forEach(s => {
            if(parseInt(s.dataset.value) <= val) s.classList.add('active');
            else s.classList.remove('active');
        });
    }
});