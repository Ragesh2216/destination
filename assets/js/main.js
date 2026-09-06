
// =============================================
// CLEAN REBUILT MAIN.JS
// =============================================

function initMain() {
    // 1. Sticky Header
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    // 3. Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }

    // 4. Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    if (cursor && follower && typeof gsap !== 'undefined') {
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
        gsap.ticker.add(() => {
            posX += (mouseX - posX) / 7;
            posY += (mouseY - posY) / 7;
            gsap.set(follower, { left: posX, top: posY });
            gsap.set(cursor, { left: mouseX, top: mouseY });
        });
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
        });
    }
}
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initMain();
} else {
    document.addEventListener('DOMContentLoaded', initMain);
}


// =============================================
// HERO SLIDER LOGIC
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const thumbs = document.querySelectorAll('.hero-thumb');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    const heroSection = document.querySelector('.premium-hero');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        const totalSlides = slides.length;
        let slideInterval;
        
        const goToSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            thumbs.forEach(thumb => thumb.classList.remove('active'));
            
            currentSlide = index;
            if(currentSlide < 0) currentSlide = totalSlides - 1;
            if(currentSlide >= totalSlides) currentSlide = 0;
            
            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
            if (thumbs[currentSlide]) thumbs[currentSlide].classList.add('active');
            
            // Change background dynamically if needed
            const bg = slides[currentSlide].getAttribute('data-bg');
            if (bg && heroSection) heroSection.style.backgroundColor = bg;
        };
        
        const nextSlide = () => goToSlide(currentSlide + 1);
        const prevSlide = () => goToSlide(currentSlide - 1);
        
        const startSlideShow = () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        };
        
        const stopSlideShow = () => {
            clearInterval(slideInterval);
        };
        
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startSlideShow(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startSlideShow(); });
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => { goToSlide(index); startSlideShow(); });
        });
        
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => { goToSlide(index); startSlideShow(); });
        });
        
        if (heroSection) {
            // hover logic removed to keep auto-scroll active
            // Mobile Swipe Support
            let touchStartX = 0;
            let touchEndX = 0;
            
            heroSection.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopSlideShow();
            }, { passive: true });
            
            heroSection.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) nextSlide();
                if (touchEndX - touchStartX > 50) prevSlide();
                startSlideShow();
            }, { passive: true });
        }
        
        // Init
        goToSlide(0);
        startSlideShow();
    }
});

// =============================================
// RIPPLE EFFECT FOR CANDY BUTTON
// =============================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-candy');
    if (btn) {
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        
        const rect = btn.getBoundingClientRect();
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');
        
        const existingRipple = btn.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        btn.appendChild(circle);
        
        // Remove after animation completes
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            // Toggle active classes
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');

            // Update accessibility attribute
            const isExpanded = menuBtn.classList.contains('active');
            menuBtn.setAttribute('aria-expanded', isExpanded);
        });

        // Optional: Close menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuBtn.contains(e.target) && navLinks.classList.contains('active')) {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
});