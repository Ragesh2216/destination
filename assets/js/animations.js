document.addEventListener('DOMContentLoaded', () => {
    // GSAP Hero Animation
    if (typeof gsap !== 'undefined') {
        const heroTl = gsap.timeline();
        
        heroTl.fromTo('.hero-model-box', 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }
        );
        
        // Mouse Movement Parallax for Hero
        const heroSection = document.querySelector('.hero-section');
        const floatItems = document.querySelectorAll('.float-item');
        
        if (heroSection && floatItems.length > 0) {
            heroSection.addEventListener('mousemove', (e) => {
                const xPos = (e.clientX / window.innerWidth - 0.5) * 20;
                const yPos = (e.clientY / window.innerHeight - 0.5) * 20;
                
                floatItems.forEach((item, index) => {
                    const depth = (index + 1) * 1.5;
                    gsap.to(item, {
                        x: xPos * depth,
                        y: yPos * depth,
                        duration: 1,
                        ease: 'power2.out'
                    });
                });
            });
        }
    }

    // Intersection Observer for Counters
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    const startCounters = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const updateCount = () => {
                    const count = +counter.innerText;
                    const inc = target / speed;
                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 10);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    };

    const counterObserver = new IntersectionObserver(startCounters, {
        threshold: 0.5
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Testimonial Auto Slider
    const track = document.getElementById('testimonial-track');
    let currentIndex = 0;
    
    if (track) {
        const slides = track.querySelectorAll('.testimonial-slide');
        const slideCount = slides.length;
        
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slideCount;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 5000); // Slide every 5 seconds
    }
});

