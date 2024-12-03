// Create portfolio items dynamically
const portfolioItems = [
    {
        title: "Quantum Computing Research",
        description: "Research on near term applications for quantum computers, error mitigation strategies, and resource optimization.",
        tags: ["Quantum Computing", "Error Mitigation", "Research"]
    },
    {
        title: "Hamiltonian Simulation",
        description: "Work on algorithms for Hamiltonian simulation, fast-forwarding, and Dynamical Mean Field Theory.",
        tags: ["Algorithms", "Physics", "Simulation"]
    },
    {
        title: "Organic Semiconductors",
        description: "Experimental research in organic semiconductors and polymer electronics.",
        tags: ["Experimental", "Electronics", "Research"]
    }
];

// Initialize the carousel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create carousel items
    const carouselInner = document.querySelector('.carousel-inner');
    const indicators = document.querySelector('.carousel-indicators');
    
    portfolioItems.forEach((item, index) => {
        // Create carousel item
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        
        // Create portfolio card
        carouselItem.innerHTML = `
            <div class="portfolio-card">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description}</p>
                    <div class="card-tags">
                        ${item.tags.map(tag => `<span class="badge bg-primary me-2">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        carouselInner.appendChild(carouselItem);
        
        // Create indicator
        const indicator = document.createElement('button');
        indicator.setAttribute('type', 'button');
        indicator.setAttribute('data-bs-target', '#portfolioCarousel');
        indicator.setAttribute('data-bs-slide-to', index.toString());
        if (index === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-current', index === 0 ? 'true' : 'false');
        indicator.setAttribute('aria-label', `Slide ${index + 1}`);
        indicators.appendChild(indicator);
    });
    
    // Initialize Bootstrap carousel
    const carousel = new bootstrap.Carousel(document.getElementById('portfolioCarousel'), {
        interval: 5000
    });
    
    // Handle card expansion
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', function() {
            // Pause the carousel
            carousel.pause();
            
            // Create and show expanded card
            const content = this.innerHTML;
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.innerHTML = `
                <div class="portfolio-card expanded">
                    <button type="button" class="btn-close position-absolute top-0 end-0 m-3"></button>
                    ${content}
                </div>
            `;
            document.body.appendChild(overlay);
            
            // Handle closing
            const closeBtn = overlay.querySelector('.btn-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                overlay.remove();
                carousel.cycle();
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    carousel.cycle();
                }
            });
        });
    });
});