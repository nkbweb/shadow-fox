// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to a server
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Thank you for your message! I will get back to you soon.');
        
        // Reset form
        this.reset();
    });
}

// Add scroll-based animations
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
            section.classList.add('visible');
        }
    });
});

// Add mobile menu functionality
const navLinks = document.querySelector('.nav-links');
const menuButton = document.createElement('button');
menuButton.classList.add('menu-button');
menuButton.innerHTML = '☰';

if (window.innerWidth <= 768) {
    document.querySelector('nav').appendChild(menuButton);
    navLinks.style.display = 'none';
    
    menuButton.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'none' ? 'flex' : 'none';
    });
}

// Add CSS for mobile menu button
const style = document.createElement('style');
style.textContent = `
    .menu-button {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
    }
    
    @media (max-width: 768px) {
        .menu-button {
            display: block;
        }
        
        .nav-links {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .nav-links li {
            margin: 1rem 0;
        }
    }
`;
document.head.appendChild(style); 