/* ==========================================================================
   Modern JavaScript Logic for Shoshty's Eid Adha Celebration Website
   Controls counters, custom cursor glow, Spotify player, Love Capsule & canvas.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Page Preloader Fadeout ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            initParticles();
        }, 1500);
    });

    // Fallback if load event doesn't fire
    setTimeout(() => {
        if (preloader.style.opacity !== '0') {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            initParticles();
        }
    }, 4500);



    // --- TOGETHER COUNTERS ---
    const firstTalkDate = new Date("2025-11-15T00:00:00").getTime();
    const loveStartDate = new Date("2026-03-20T00:00:00").getTime();

    function updateCounter(milestoneTime, counterId) {
        const counterElement = document.getElementById(counterId);
        if (!counterElement) return;

        const daysSpan = counterElement.querySelector('.days');
        const hoursSpan = counterElement.querySelector('.hours');
        const minutesSpan = counterElement.querySelector('.minutes');
        const secondsSpan = counterElement.querySelector('.seconds');

        function refresh() {
            const now = Date.now();
            const difference = now - milestoneTime;

            if (difference < 0) {
                daysSpan.innerText = "00";
                hoursSpan.innerText = "00";
                minutesSpan.innerText = "00";
                secondsSpan.innerText = "00";
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            daysSpan.innerText = String(days).padStart(2, '0');
            hoursSpan.innerText = String(hours).padStart(2, '0');
            minutesSpan.innerText = String(minutes).padStart(2, '0');
            secondsSpan.innerText = String(seconds).padStart(2, '0');
        }

        refresh();
        setInterval(refresh, 1000);
    }

    updateCounter(firstTalkDate, 'counter-talk');
    updateCounter(loveStartDate, 'counter-love');


    // --- SPOTIFY-STYLE AUDIO WIDGET ---
    const bgAudio = document.getElementById('bg-audio');
    const playPauseBtn = document.getElementById('spotify-play-pause');
    const albumContainer = document.getElementById('spotify-album-container');
    const progressFill = document.getElementById('track-progress-fill');
    const progressBar = document.getElementById('track-progress-bar');
    const timeElapsedLabel = document.getElementById('track-time-elapsed');
    const timeDurationLabel = document.getElementById('track-time-duration');
    const spotifyTip = document.querySelector('.spotify-tip-bubble');

    let isPlaying = false;
    let fallbackTimer = null;
    let fakeProgress = 0; // fallback in case music doesn't load

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function playAudio() {
        bgAudio.play().catch(err => {
            console.log("Audio play failed:", err);
        });
    }

    function pauseAudio() {
        bgAudio.pause();
    }

    // Sync UI with actual audio state (handles autoplay correctly)
    bgAudio.addEventListener('play', () => onPlayStateChange(true));
    bgAudio.addEventListener('pause', () => onPlayStateChange(false));

    function onPlayStateChange(playing) {
        isPlaying = playing;
        const visualizer = document.getElementById('audio-visualizer');
        
        if (playing) {
            playPauseBtn.innerText = "âڈ¸";
            albumContainer.classList.add('playing');
            if (spotifyTip) spotifyTip.classList.add('hidden');
            if (visualizer) {
                visualizer.classList.remove('hidden');
                visualizer.classList.add('playing');
            }
            
            // Start progress tracking
            if (fallbackTimer) clearInterval(fallbackTimer);
            fallbackTimer = setInterval(trackProgress, 1000);
        } else {
            playPauseBtn.innerText = "â–¶";
            albumContainer.classList.remove('playing');
            if (visualizer) {
                visualizer.classList.remove('playing');
                visualizer.classList.add('hidden');
            }
            if (fallbackTimer) clearInterval(fallbackTimer);
        }
    }

    function trackProgress() {
        if (!isPlaying) return;

        // If actual audio file has loaded and is playing
        if (bgAudio.duration && !isNaN(bgAudio.duration)) {
            const percent = (bgAudio.currentTime / bgAudio.duration) * 100;
            progressFill.style.width = `${percent}%`;
            timeElapsedLabel.innerText = formatTime(bgAudio.currentTime);
            timeDurationLabel.innerText = formatTime(bgAudio.duration);
        } else {
            // Emulate progress for offline/testing if file doesn't exist
            fakeProgress += 1;
            const duration = 204; // 3:24
            if (fakeProgress > duration) fakeProgress = 0;
            const percent = (fakeProgress / duration) * 100;
            progressFill.style.width = `${percent}%`;
            timeElapsedLabel.innerText = formatTime(fakeProgress);
            timeDurationLabel.innerText = formatTime(duration);
        }
    }

    // Toggle play state
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    // Support clicking on progress bar to seek (only if audio loaded)
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPercent = clickX / width;
        
        if (bgAudio.duration && !isNaN(bgAudio.duration)) {
            bgAudio.currentTime = clickPercent * bgAudio.duration;
            progressFill.style.width = `${clickPercent * 100}%`;
            timeElapsedLabel.innerText = formatTime(bgAudio.currentTime);
        } else {
            // Emulate seek
            fakeProgress = clickPercent * 204;
            progressFill.style.width = `${clickPercent * 100}%`;
            timeElapsedLabel.innerText = formatTime(fakeProgress);
        }
    });

    // Auto-play music on first user click anywhere on page
    document.body.addEventListener('click', () => {
        if (!isPlaying) {
            playAudio();
        }
    }, { once: true });

    // Attempt autoplay immediately
    setTimeout(() => {
        if (!isPlaying) {
            playAudio();
        }
    }, 500);

    // --- SMART VIDEO/AUDIO SYNC ---
    let wasAudioPlayingBeforeVideo = false;
    const allVideos = document.querySelectorAll('video');
    
    allVideos.forEach(video => {
        video.addEventListener('play', () => {
            if (isPlaying) {
                wasAudioPlayingBeforeVideo = true;
                pauseAudio();
            }
        });

        const handleVideoStop = () => {
            // Check if ALL videos are paused/ended
            const isAnyVideoPlaying = Array.from(allVideos).some(v => !v.paused && !v.ended);
            if (!isAnyVideoPlaying && wasAudioPlayingBeforeVideo) {
                playAudio();
                wasAudioPlayingBeforeVideo = false;
            }
        };

        video.addEventListener('pause', handleVideoStop);
        video.addEventListener('ended', handleVideoStop);
    });

    // --- AUTO-PLAY VIDEOS ON SCROLL ---
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const vid = entry.target;
            // Ignore the surprise modal video, it must be triggered manually
            if (vid.id === 'surprise-video') return;

            if (entry.isIntersecting) {
                // Play when it enters the viewport
                vid.play().catch(e => console.log("Auto-play on scroll blocked by browser:", e));
            } else {
                // Pause when it leaves the viewport
                if (!vid.paused) {
                    vid.pause();
                }
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });

    allVideos.forEach(video => {
        videoObserver.observe(video);
    });


    // --- DIGITAL LOVE CAPSULE & ENVELOPE OPENING ---
    const loveCapsule = document.getElementById('love-capsule');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const envelope = document.getElementById('envelope');

    loveCapsule.addEventListener('click', function() {
        // Trigger capsule dissolution
        this.classList.add('open');
        playBeep(450, 'triangle', 0.2);
        setTimeout(() => playBeep(650, 'triangle', 0.3), 150);

        // Show the envelope with smooth fade in
        setTimeout(() => {
            envelopeWrapper.classList.remove('hidden');
            envelopeWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
    });

    envelope.addEventListener('click', function(e) {
        if (e.target.closest('.letter') && this.classList.contains('open')) {
            return; 
        }

        const isOpen = this.classList.toggle('open');
        if (isOpen) {
            // Particle explosion
            const rect = this.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            explodeParticles(x, y);

            playBeep(520, 'sine', 0.1);
            setTimeout(() => playBeep(720, 'sine', 0.2), 100);
            setTimeout(() => playBeep(920, 'sine', 0.3), 200);
        }
    });


    // --- CUTE SOUND SYNTHESIS FOR SHEEP "BAA" ---
    function playSheepBleat() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(235, audioCtx.currentTime); // Middle sheep bleat pitch
            
            // Bandpass filter to shape the vowel sound
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(950, audioCtx.currentTime);
            filter.Q.setValueAtTime(2.2, audioCtx.currentTime);

            // Frequency Modulation (Vibrato)
            const vibrato = audioCtx.createOscillator();
            const vibratoGain = audioCtx.createGain();
            vibrato.frequency.value = 17; // speed of bleat wave (Hz)
            vibratoGain.gain.value = 35; // depth of modulation
            
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // Envelope timing
            const now = audioCtx.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.4, now + 0.08); // attack
            
            gainNode.gain.setValueAtTime(0.4, now + 0.08);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.35); // wobble down
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9); // decay
            
            filter.frequency.setValueAtTime(950, now);
            filter.frequency.exponentialRampToValueAtTime(480, now + 0.8);

            vibrato.start();
            osc.start();
            
            vibrato.stop(now + 0.95);
            osc.stop(now + 0.95);
        } catch (e) {
            console.log("Sheep synthesizer failed: ", e);
        }
    }

    function playBeep(freq, type, duration) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch(e){}
    }


    // --- SURPRISE VIDEO BUTTON EVENTS ---
    const surpriseBtn = document.getElementById('surprise-video-btn');
    const surpriseModal = document.getElementById('unskippable-video-modal');
    const surpriseVideo = document.getElementById('surprise-video');

    if (surpriseBtn && surpriseModal && surpriseVideo) {
        surpriseBtn.addEventListener('click', () => {
            surpriseModal.classList.remove('hidden');
            surpriseVideo.play().catch(e => console.log("Video play error:", e));
        });

        surpriseVideo.addEventListener('ended', () => {
            surpriseModal.classList.add('hidden');
        });
        
        // Prevent closing by clicking outside
        surpriseModal.addEventListener('click', (e) => {
            e.stopPropagation(); // Cannot close it
        });
    }



    // --- CANVAS PARTICLES SYSTEM ---
    let canvas, ctx;
    const sheepEmojis = ['🐑', '🐏', '🐐'];
    const heartEmojis = ['💖', '💕', '💗', '💓', '💝'];
    let particles = [];

    function initParticles() {
        canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);

        // Background floating particles loop - lightweight
        setInterval(() => {
            if (particles.length < 25) {
                particles.push(createParticle(Math.random() * canvas.width, canvas.height + 20, true)); if (!animationId) animateParticles(); }
        }, 800);

        animateParticles();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle(x, y, isBackground = false) {
        const rand = Math.random();
        let content = '';

        if (rand < 0.65) {
            content = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        } else if (rand < 0.85) {
            content = 'â­گ';
        } else {
            content = sheepEmojis[Math.floor(Math.random() * sheepEmojis.length)];
        }

        return {
            x: x,
            y: y,
            size: isBackground ? Math.random() * 12 + 8 : Math.random() * 24 + 16,
            speedY: isBackground ? -(Math.random() * 0.8 + 0.4) : -(Math.random() * 2.5 + 1.2),
            speedX: Math.random() * 1.2 - 0.6,
            opacity: 1,
            fadeRate: isBackground ? 0.001 : Math.random() * 0.008 + 0.004,
            content: content,
            angle: Math.random() * 360,
            spinSpeed: Math.random() * 1.5 - 0.75
        };
    }

    let animationId = null; function animateParticles() { if (particles.length === 0) { ctx.clearRect(0, 0, canvas.width, canvas.height); animationId = null; return; } ctx.clearRect(0, 0, canvas.width, canvas.height); for (let i = 0; i < particles.length; i++) { const p = particles[i]; p.y += p.speedY; p.x += p.speedX; p.angle += p.spinSpeed; p.opacity -= p.fadeRate; if (p.opacity <= 0 || p.y < -40) { particles.splice(i, 1); i--; continue; } ctx.save(); ctx.globalAlpha = p.opacity; ctx.translate(p.x, p.y); ctx.rotate(p.angle * Math.PI / 180); ctx.font = `${p.size}px sans-serif`; ctx.fillText(p.char, -p.size/2, p.size/2); ctx.restore(); } animationId = requestAnimationFrame(animateParticles); }

    function explodeParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            const p = createParticle(x, y, false);
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 5 + 2;
            p.speedX = Math.cos(angle) * velocity;
            p.speedY = Math.sin(angle) * velocity - 1;
            p.fadeRate = Math.random() * 0.015 + 0.01;
            particles.push(p); } if (!animationId) animateParticles(); }

    // Flying DOM text generator
    function spawnFlyingText(x, y) {
        const span = document.createElement('span');
        const isSheep = Math.random() > 0.5;
        span.innerText = isSheep ? 
            sheepEmojis[Math.floor(Math.random() * sheepEmojis.length)] : 
            heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        
        span.style.position = 'fixed';
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;
        span.style.fontSize = `${Math.random() * 18 + 18}px`;
        span.style.pointerEvents = 'none';
        span.style.zIndex = '9999';
        span.style.textShadow = '0 0 8px rgba(255,0,127,0.4)';
        span.style.transition = 'all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        document.body.appendChild(span);
        
        const destX = x + (Math.random() * 260 - 130);
        const destY = y - (Math.random() * 180 + 90);
        
        setTimeout(() => {
            span.style.transform = `translate(${destX - x}px, ${destY - y}px) scale(0.6) rotate(${Math.random() * 180 - 90}deg)`;
            span.style.opacity = '0';
        }, 50);
        
        setTimeout(() => span.remove(), 950);
    }


    // --- MEDIA UTILS ---
    window.showRealImage = function(imgElement) {
        imgElement.classList.remove('hidden');
        const placeholder = imgElement.previousElementSibling;
        if (placeholder && (placeholder.classList.contains('photo-placeholder') || placeholder.classList.contains('placeholder-img'))) {
            placeholder.classList.add('hidden');
        }
    };

    window.hideRealImage = function(imgElement) {
        imgElement.classList.add('hidden');
        const placeholder = imgElement.previousElementSibling;
        if (placeholder && (placeholder.classList.contains('photo-placeholder') || placeholder.classList.contains('placeholder-img'))) {
            placeholder.classList.remove('hidden');
        }
    };

    const customVideo = document.getElementById('custom-video');
    const videoPlaceholder = document.getElementById('video-placeholder');
    
    if (customVideo && videoPlaceholder) {
        customVideo.addEventListener('error', () => {
            customVideo.style.display = 'none';
            videoPlaceholder.classList.remove('hidden');
        });
        
        customVideo.addEventListener('loadeddata', () => {
            customVideo.style.display = 'block';
            videoPlaceholder.classList.add('hidden');
        });
        
        setTimeout(() => {
            if (customVideo.readyState < 1) {
                customVideo.style.display = 'none';
                videoPlaceholder.classList.remove('hidden');
            }
        }, 1200);
    }

    // --- JOY METER LOGIC ---
    const joySlider = document.getElementById('joy-slider');
    const joyText = document.getElementById('joy-text');
    const joyEmoji = document.getElementById('joy-emoji');
    let hasExploded = false;

    if (joySlider) {
        // Initialize background track
        joySlider.style.background = `linear-gradient(to left, var(--neon-pink) 0%, rgba(255, 255, 255, 0.1) 0%)`;

        joySlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            
            // Dynamic track fill for RTL (to left)
            joySlider.style.background = `linear-gradient(to left, var(--neon-pink) ${val}%, rgba(255, 255, 255, 0.1) ${val}%)`;

            if (val < 25) {
                joyEmoji.innerText = "ًںکگ";
                joyText.innerText = "ظ„ط³ظ‡ ظ…ط¹ظ…ظ„طھظٹط´ ط­ط§ط¬ط©..";
                joyText.classList.remove('max-joy');
                hasExploded = false;
            } else if (val < 50) {
                joyEmoji.innerText = "ًں¥°";
                joyText.innerText = "ط´ظˆظٹط© طµط؛ظٹط±ط©";
                joyText.classList.remove('max-joy');
                hasExploded = false;
            } else if (val < 75) {
                joyEmoji.innerText = "ًںکچ";
                joyText.innerText = "ظ…ط¨ط³ظˆط·ط© ط¬ط¯ط§ظ‹";
                joyText.classList.remove('max-joy');
                hasExploded = false;
            } else if (val < 100) {
                joyEmoji.innerText = "ًں’–";
                joyText.innerText = "ط£ط­ظ„ظ‰ ط¹ظٹط¯ ظپظٹ ط­ظٹط§طھظٹ!";
                joyText.classList.remove('max-joy');
                hasExploded = false;
            } else if (val === 100) {
                joyEmoji.innerText = "ًںژ†â‌¤ï¸ڈًں”¥";
                joyText.innerText = "ط·ط§ظٹط±ط© ظ…ظ† ط§ظ„ظپط±ط­ط©!! ًںڑ€";
                joyText.classList.add('max-joy');
                
                if (!hasExploded) {
                    hasExploded = true;
                    // Trigger massive fireworks from canvas
                    const rect = joySlider.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top;
                    
                    explodeParticles(centerX, centerY);
                    setTimeout(() => explodeParticles(centerX - 100, centerY - 50), 200);
                    setTimeout(() => explodeParticles(centerX + 100, centerY - 50), 400);
                    setTimeout(() => explodeParticles(centerX, centerY - 100), 600);
                    
                    // Happy sounds! (reuse the playBeep function)
                    try {
                        playBeep(800, 'sine', 0.1);
                        setTimeout(() => playBeep(1000, 'sine', 0.2), 150);
                        setTimeout(() => playBeep(1200, 'sine', 0.4), 300);
                    } catch(e){}
                }
            }
        });
    }

    // --- SCRATCH CARD LOGIC ---
    const scratchCanvas = document.getElementById('scratch-canvas');

    if (scratchCanvas) {
        const scratchCtx = scratchCanvas.getContext('2d');
        let isDrawing = false;
        let isRevealed = false;
        let scratchCount = 0;

        function initScratchCard() {
            const width = scratchCanvas.offsetWidth;
            const height = scratchCanvas.offsetHeight;
            scratchCanvas.width = width;
            scratchCanvas.height = height;

            // Draw a shiny silver/pink gradient background
            const gradient = scratchCtx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#ff007f');
            gradient.addColorStop(0.5, '#6a0dad');
            gradient.addColorStop(1, '#ff66b2');
            scratchCtx.fillStyle = gradient;
            scratchCtx.fillRect(0, 0, width, height);

            // Add text overlay
            scratchCtx.fillStyle = '#ffffff';
            scratchCtx.font = "bold 26px var(--font-arabic), sans-serif";
            scratchCtx.textAlign = "center";
            scratchCtx.textBaseline = "middle";
            scratchCtx.shadowColor = "rgba(0,0,0,0.5)";
            scratchCtx.shadowBlur = 10;
            scratchCtx.fillText("امسحي هنا لاكتشاف هديتك!", width / 2, height / 2);
            
            // Add an emoji
            scratchCtx.font = "40px sans-serif";
            scratchCtx.fillText("🎁", width / 2, height / 2 + 50);

            // Set composite operation to 'destination-out' so drawing erases
            scratchCtx.globalCompositeOperation = 'destination-out';
        }

        setTimeout(initScratchCard, 500);

        function getMousePos(evt) {
            const rect = scratchCanvas.getBoundingClientRect();
            let clientX, clientY;
            if (evt.touches) {
                clientX = evt.touches[0].clientX;
                clientY = evt.touches[0].clientY;
            } else {
                clientX = evt.clientX;
                clientY = evt.clientY;
            }
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function scratch(e) {
            if (!isDrawing || isRevealed) return;
            if (e.cancelable) e.preventDefault(); // Prevent scrolling on mobile while scratching

            const pos = getMousePos(e);
            
            // Erase a circle
            scratchCtx.beginPath();
            scratchCtx.arc(pos.x, pos.y, 35, 0, Math.PI * 2);
            scratchCtx.fill();

            scratchCount++;
            if (scratchCount > 30) {
                revealCard();
            }
        }

        function revealCard() {
            if (isRevealed) return;
            isRevealed = true;
            scratchCanvas.classList.add('revealed');
            
            // Wait slightly so they see the "Congrats" message, then pop the modal
            setTimeout(() => {
                const yusefModal = document.getElementById('yusef-video-modal');
                const yusefVideo = document.getElementById('yusef-video');
                
                if (yusefModal && yusefVideo) {
                    yusefModal.classList.remove('hidden');
                    
                    if (isPlaying) {
                        wasAudioPlayingBeforeVideo = true;
                        pauseAudio(); 
                    }
                    
                    yusefVideo.play().catch(e => console.log("Video auto-play blocked", e));
                }
            }, 600);
        }

        // Close modal logic
        const closeYusefModalBtn = document.getElementById('close-yusef-modal');
        if (closeYusefModalBtn) {
            closeYusefModalBtn.addEventListener('click', () => {
                const yusefModal = document.getElementById('yusef-video-modal');
                const yusefVideo = document.getElementById('yusef-video');
                yusefModal.classList.add('hidden');
                yusefVideo.pause();
                
                // Audio will resume via the global handleVideoStop logic
            });
        }

        // Event listeners
        scratchCanvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        scratchCanvas.addEventListener('mousemove', scratch);
        scratchCanvas.addEventListener('mouseup', () => { isDrawing = false; });
        scratchCanvas.addEventListener('mouseleave', () => { isDrawing = false; });

        scratchCanvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
        scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
        scratchCanvas.addEventListener('touchend', () => { isDrawing = false; });
    }

    // --- LOVE PUZZLE LOGIC ---
    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleSuccess = document.getElementById('puzzle-success');
    
    if (puzzleContainer) {
        // 3x3 Grid positions for 300x300 image
        const positions = [
            '0px 0px', '-100px 0px', '-200px 0px',
            '0px -100px', '-100px -100px', '-200px -100px',
            '0px -200px', '-100px -200px', '-200px -200px'
        ];
        
        let pieces = positions.map((pos, index) => {
            return { pos, index };
        });
        
        // Shuffle pieces
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        
        let selectedPiece = null;
        
        function checkWin() {
            const currentPieces = Array.from(puzzleContainer.children);
            const isWin = currentPieces.every((p, i) => parseInt(p.dataset.index) === i);
            if (isWin) {
                puzzleSuccess.classList.remove('hidden');
                puzzleContainer.style.border = "3px solid #00ff00";
                puzzleContainer.style.boxShadow = "0 0 30px #00ff00";
                
                // Winning effects
                try {
                    playBeep(800, 'sine', 0.1);
                    setTimeout(() => playBeep(1000, 'sine', 0.2), 150);
                    setTimeout(() => playBeep(1200, 'sine', 0.4), 300);
                    
                    const rect = puzzleContainer.getBoundingClientRect();
                    explodeParticles(rect.left + rect.width/2, rect.top + rect.height/2);
                } catch(e){}
            }
        }
        
        pieces.forEach(p => {
            const div = document.createElement('div');
            div.className = 'puzzle-piece';
            div.style.backgroundPosition = p.pos;
            div.dataset.index = p.index;
            
            div.addEventListener('click', () => {
                // If the game is already won, do nothing
                if (!puzzleSuccess.classList.contains('hidden')) return;

                if (!selectedPiece) {
                    selectedPiece = div;
                    div.classList.add('selected');
                    try { playBeep(500, 'triangle', 0.05); } catch(e){}
                } else {
                    if (selectedPiece !== div) {
                        // Swap background and index
                        const tempPos = selectedPiece.style.backgroundPosition;
                        const tempIndex = selectedPiece.dataset.index;

                        selectedPiece.style.backgroundPosition = div.style.backgroundPosition;
                        selectedPiece.dataset.index = div.dataset.index;

                        div.style.backgroundPosition = tempPos;
                        div.dataset.index = tempIndex;

                        try { playBeep(600, 'triangle', 0.05); } catch(e){}
                        checkWin();
                    }
                    selectedPiece.classList.remove('selected');
                    selectedPiece = null;
                }
            });
            puzzleContainer.appendChild(div);
        });
    }

    // --- LOVE COMPASS LOGIC ---
    const loveCompass = document.getElementById('love-compass');
    const compassNeedle = document.getElementById('compass-needle');
    const compassMessage = document.getElementById('compass-message');
    let compassSpun = false;

    if (loveCompass && compassNeedle && compassMessage) {
        loveCompass.addEventListener('click', () => {
            if (compassSpun) return;
            compassSpun = true;
            
            try { playBeep(900, 'sine', 0.1); } catch(e){}

            // Spin needle extremely fast, then settle at 180deg (South -> Shoshty)
            // 360 * 6 (spins) + 180 (target)
            const targetRotation = (360 * 6) + 180;
            compassNeedle.style.transform = `rotate(${targetRotation}deg)`;

            setTimeout(() => {
                compassMessage.classList.remove('hidden');
                try { playBeep(1200, 'sine', 0.3); } catch(e){}
                const rect = loveCompass.getBoundingClientRect();
                explodeParticles(rect.left + rect.width/2, rect.top + rect.height/2);
            }, 3000); // matches CSS transition 3s
        });
    }

    // --- CATCH THE SHEEP LOGIC ---
    const catchSheep = document.getElementById('catch-sheep');
    if (catchSheep) {
        let sheepInterval;
        let isCaught = false;

        function moveSheep() {
            if (isCaught) return;
            const maxX = window.innerWidth - 60;
            const maxY = window.innerHeight - 60;
            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY);
            
            catchSheep.style.left = randomX + 'px';
            catchSheep.style.top = randomY + 'px';
        }

        // Start moving after a short delay
        setTimeout(() => {
            moveSheep();
            sheepInterval = setInterval(moveSheep, 2000); // Moves every 2 seconds
        }, 5000);

        catchSheep.addEventListener('click', () => {
            if (isCaught) return;
            isCaught = true;
            clearInterval(sheepInterval);
            
            try { playBeep(1000, 'sine', 0.2); } catch(e){}
            
            catchSheep.innerHTML = 'ًں’–';
            catchSheep.style.transform = 'scale(2)';
            
            const rect = catchSheep.getBoundingClientRect();
            explodeParticles(rect.left + rect.width/2, rect.top + rect.height/2);

            setTimeout(() => {
                alert("مسكتيني زي ما مسكتي قلبي! 💘\nبحبك يا شوشتى وكل عيد وإنتي معايا.");
                catchSheep.style.display = 'none';
            }, 600);
        });
    }
});

// --- LIGHTBOX GALLERY FUNCTIONS ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

window.openLightbox = function(cardElement) {
    const realImg = cardElement.querySelector('.real-photo');
    if (!realImg || realImg.classList.contains('hidden')) {
        return; 
    }
    
    lightboxImg.src = realImg.src;
    lightboxCaption.innerText = realImg.alt || "طµظˆط±طھظ†ط§ ط§ظ„ط­ظ„ظˆط©";
    lightbox.classList.remove('hidden');
};

window.closeLightbox = function() {
    lightbox.classList.add('hidden');
};


