// ===== Table of Contents =====
// 1. Preloader
// 2. Custom Cursor
// 3. Navigation & Mobile Menu
// 4. Scroll Effects
// 5. Skills Filtering
// 6. Projects Filtering
// 7. Testimonials Slider
// 8. Contact Form
// 9. Theme Toggle
// 10. Back to Top Button
// 11. Year Update
// 12. Animations & Interactions

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== 1. Preloader =====
    const loader = document.querySelector('.loader');
    const progressBar = document.querySelector('.progress-bar');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('hide');
                document.body.style.overflow = 'visible';
                animateOnScroll();
            }, 500);
        }
    }, 200);
    
    // ===== 2. Custom Cursor =====
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.width = '8px';
        cursor.style.height = '8px';
        cursorFollower.style.width = '40px';
        cursorFollower.style.height = '40px';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursorFollower.style.width = '30px';
        cursorFollower.style.height = '30px';
    });
    
    document.querySelectorAll('a, button, .project-card, .skill-card').forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.style.width = '0px';
            cursor.style.height = '0px';
            cursorFollower.style.width = '50px';
            cursorFollower.style.height = '50px';
            cursorFollower.style.borderColor = 'var(--primary-color)';
            cursorFollower.style.backgroundColor = 'rgba(108, 99, 255, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            cursor.style.width = '10px';
            cursor.style.height = '10px';
            cursorFollower.style.width = '30px';
            cursorFollower.style.height = '30px';
            cursorFollower.style.borderColor = 'var(--primary-color)';
            cursorFollower.style.backgroundColor = 'transparent';
        });
    });
    
    // Hide cursor and follower on mobile devices
    if (window.innerWidth <= 768) {
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
    }
    
    // ===== 3. Navigation & Mobile Menu =====
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        if (hamburger.classList.contains('active')) {
            hamburger.querySelector('.bar:nth-child(1)').style.transform = 'rotate(45deg) translate(6px, 6px)';
            hamburger.querySelector('.bar:nth-child(2)').style.opacity = '0';
            hamburger.querySelector('.bar:nth-child(3)').style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            hamburger.querySelector('.bar:nth-child(1)').style.transform = 'none';
            hamburger.querySelector('.bar:nth-child(2)').style.opacity = '1';
            hamburger.querySelector('.bar:nth-child(3)').style.transform = 'none';
        }
    });
    
    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            
            hamburger.querySelector('.bar:nth-child(1)').style.transform = 'none';
            hamburger.querySelector('.bar:nth-child(2)').style.opacity = '1';
            hamburger.querySelector('.bar:nth-child(3)').style.transform = 'none';
        });
    });
    
    // ===== 4. Scroll Effects =====
    function animateOnScroll() {
        const elements = document.querySelectorAll('.section-header, .about-image, .about-text, .skill-card, .project-card, .testimonial-card, .contact-info, .contact-form-container');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, {threshold: 0.1});
        
        elements.forEach(el => {
            observer.observe(el);
            el.classList.add('fade-in');
        });
    }
    
    // ===== 5. Skills Filtering =====
    const categoryBtns = document.querySelectorAll('.category-btn');
    const skillCards = document.querySelectorAll('.skill-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            
            skillCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hide');
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.classList.add('hide');
                    }, 300);
                }
            });
        });
    });
          // ===== 6. Projects Filtering =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('hide');
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.classList.add('hide');
                    }, 300);
                }
            });
        });
    });
    
    // ===== 7. Testimonials Slider =====
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-arrow.prev');
    const nextBtn = document.querySelector('.testimonial-arrow.next');
    let currentIndex = 0;
    
    function showTestimonial(index) {
        testimonials.forEach(testimonial => {
            testimonial.classList.remove('active');
        });
        
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        testimonials[index].classList.add('active');
        dots[index].classList.add('active');
    }
    
    nextBtn.addEventListener('click', () => {
        currentIndex++;
        if (currentIndex >= testimonials.length) {
            currentIndex = 0;
        }
        showTestimonial(currentIndex);
    });
    
    prevBtn.addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = testimonials.length - 1;
        }
        showTestimonial(currentIndex);
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            showTestimonial(currentIndex);
        });
    });
    
    // Auto slide testimonials
    let testimonialInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex >= testimonials.length) {
            currentIndex = 0;
        }
        showTestimonial(currentIndex);
    }, 5000);
    
    // Pause auto slide on hover
    document.querySelector('.testimonials-slider').addEventListener('mouseenter', () => {
        clearInterval(testimonialInterval);
    });
    
    document.querySelector('.testimonials-slider').addEventListener('mouseleave', () => {
        testimonialInterval = setInterval(() => {
            currentIndex++;
            if (currentIndex >= testimonials.length) {
                currentIndex = 0;
            }
            showTestimonial(currentIndex);
        }, 5000);
    });
    
    // ===== 8. Contact Form =====
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Change button state to loading
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.btn-text').textContent = 'Sending...';
        
        // Simulate form submission (replace with actual form submission)
        setTimeout(() => {
            // Reset form
            contactForm.reset();
            
            // Change button state to success
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            submitBtn.querySelector('.btn-text').textContent = 'Message Sent!';
            submitBtn.querySelector('i').className = 'fas fa-check';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.classList.remove('success');
                submitBtn.querySelector('.btn-text').textContent = 'Send Message';
                submitBtn.querySelector('i').className = 'fas fa-paper-plane';
            }, 3000);
        }, 2000);
    });
    
    // ===== 9. Theme Toggle =====
    const themeBtn = document.querySelector('.theme-btn');
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // ===== 10. Back to Top Button =====
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ===== 11. Year Update =====
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // ===== 12. Animations & Interactions =====
    // Animate skill levels on scroll
    const skillLevels = document.querySelectorAll('.level-bar');
    
    const observeSkills = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => {
                    entry.target.style.width = width;
                }, 300);
                observeSkills.unobserve(entry.target);
            }
        });
    }, {threshold: 0.5});
    
    skillLevels.forEach(level => {
        observeSkills.observe(level);
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Parallax effect on hero section
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        if (scrollPosition < window.innerHeight) {
            const heroContent = document.querySelector('.hero-content');
            const heroImage = document.querySelector('.hero-image');
            
            heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
            heroImage.style.transform = `translateY(${scrollPosition * 0.1}px)`;
        }
    });
    
    // Initialize AOS library if it exists
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }
});
    
    document.querySelector('.testimonials-slider').addEventListener('mouseleave', () => {
        testimonialInterval = setInterval(() => {
            currentIndex++;
            if (currentIndex >= testimonials.length) {
                currentIndex = 0;
            }
            showTestimonial(currentIndex);
        }, 5000);
    });
    
    // ===== 8. Contact Form =====
    const contactForm = document.getElementById('contact-form');