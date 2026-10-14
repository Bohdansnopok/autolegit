 // Mobile Nav
        const openMenu = document.getElementById('openMenu');
        const closeMenu = document.getElementById('closeMenu');
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('overlay');

        const toggleMenu = () => {
            mobileNav.classList.toggle('active');
            overlay.classList.toggle('active');
        };

        openMenu.onclick = toggleMenu;
        closeMenu.onclick = toggleMenu;
        overlay.onclick = toggleMenu;
        mobileNav.querySelectorAll('a').forEach(l => l.onclick = toggleMenu);

        // FAQ
        document.querySelectorAll('.faq-trigger').forEach(btn => {
            btn.onclick = () => {
                const item = btn.parentElement;
                const isActive = item.classList.contains('active');
                
                // Reset all items
                document.querySelectorAll('.faq-item').forEach(i => {
                    i.classList.remove('active');
                    const span = i.querySelector('.faq-trigger span');
                    if (span) span.innerText = '+';
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    const span = btn.querySelector('span');
                    if (span) span.innerText = '-';
                }
            };
        });

        // Reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { 
                if(e.isIntersecting) {
                    e.target.classList.add('appeared'); // МІНЯЄМО НА appeared
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Reviews Slider
        const track = document.getElementById('reviewsTrack');
        const prevBtn = document.getElementById('prevReview');
        const nextBtn = document.getElementById('nextReview');
        const dotsContainer = document.getElementById('sliderDots');
        const slides = document.querySelectorAll('.review-slide');
        
        let currentIndex = 0;
        let slidesPerPage = 1;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;

        const updateConfig = () => {
            slidesPerPage = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1);
            createDots();
            updateSlider();
        };

        const createDots = () => {
            dotsContainer.innerHTML = '';
            const totalDots = slides.length - slidesPerPage + 1;
            if (totalDots <= 1) return;

            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.onclick = () => goToSlide(i);
                dotsContainer.appendChild(dot);
            }
        };

        const updateSlider = () => {
            const slideWidth = 100 / slidesPerPage;
            currentTranslate = -currentIndex * slideWidth;
            prevTranslate = currentTranslate;
            setSliderPosition();
            
            // Update dots
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Update buttons state
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            
            const maxIndex = slides.length - slidesPerPage;
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
        };

        const setSliderPosition = () => {
            track.style.transform = `translateX(${currentTranslate}%)`;
        };

        const goToSlide = (index) => {
            currentIndex = index;
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            updateSlider();
        };

        nextBtn.onclick = () => {
            const maxIndex = slides.length - slidesPerPage;
            if (currentIndex < maxIndex) {
                currentIndex++;
                track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                updateSlider();
            }
        };

        prevBtn.onclick = () => {
            if (currentIndex > 0) {
                currentIndex--;
                track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                updateSlider();
            }
        };

        // Drag & Touch Logic
        const getPositionX = (event) => {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        };

        const touchStart = (index) => {
            return (event) => {
                if (event.type === 'mousedown') {
                    // Prevent text selection/ghost image on desktop
                    event.preventDefault();
                }
                isDragging = true;
                startPos = getPositionX(event);
                animationID = requestAnimationFrame(animation);
                track.style.transition = 'none';
                track.style.cursor = 'grabbing';
            };
        };

        const touchEnd = () => {
            isDragging = false;
            cancelAnimationFrame(animationID);
            track.style.cursor = 'grab';
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

            const movedBy = currentTranslate - prevTranslate;
            const threshold = 5; // percentage of container width

            if (movedBy < -threshold && currentIndex < slides.length - slidesPerPage) {
                currentIndex += 1;
            }

            if (movedBy > threshold && currentIndex > 0) {
                currentIndex -= 1;
            }

            updateSlider();
        };

        const touchMove = (event) => {
            if (isDragging) {
                // Prevent vertical scroll while swiping
                if (event.type === 'touchmove') {
                    event.preventDefault();
                }
                const currentPosition = getPositionX(event);
                const diff = ((currentPosition - startPos) / track.parentElement.offsetWidth) * 100;
                currentTranslate = prevTranslate + diff;
            }
        };

        const animation = () => {
            setSliderPosition();
            if (isDragging) requestAnimationFrame(animation);
        };

        // Event Listeners
        track.addEventListener('touchstart', touchStart());
        track.addEventListener('touchend', touchEnd);
        track.addEventListener('touchmove', touchMove, { passive: false });

        track.addEventListener('mousedown', touchStart());
        track.addEventListener('mouseup', touchEnd);
        track.addEventListener('mouseleave', touchEnd);
        track.addEventListener('mousemove', touchMove);
        
        // Prevent context menu on long press
        track.oncontextmenu = (e) => {
            if (window.innerWidth < 1024) e.preventDefault();
        };

        window.addEventListener('resize', updateConfig);
        updateConfig();
        track.style.cursor = 'grab';


        // Floating Buttons Logic
        const fixedTgBtn = document.getElementById('fixedTgBtn');
        const backTopBtn = document.getElementById('backTopBtn');

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            // Telegram button visibility (50px)
            if (scrollY > 50) {
                fixedTgBtn.classList.add('visible');
            } else {
                fixedTgBtn.classList.remove('visible');
            }

            // Back to top button visibility (100px)
            if (scrollY > 150) {
                backTopBtn.classList.add('visible');
            } else {
                backTopBtn.classList.remove('visible');
            }
        });

        backTopBtn.onclick = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };