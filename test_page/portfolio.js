// Portfolio projects displayed in the carousel
const portfolioItems = [
    {
        title: "Mapping the Metal-Insulator Phase Diagram",
        description: "Fast-forwarded quantum dynamics paired with error-mitigated experiments to recover DMFT observables on today's hardware.",
        details: "Using Cartan decomposition to algebraically fast-forward the Anderson impurity model let us keep circuit depths fixed while still reaching long time evolution. Pairing that with zero-noise extrapolation on IBM devices revealed the Mott transition in the Hubbard model, demonstrating a robust hybrid quantum-classical workflow.",
        tags: ["Quantum Computing", "Error Mitigation", "DMFT"],
        image: "images/error_mitigation.jpeg",
        imageAlt: "Visualization of error mitigation on a quantum device",
        link: {
            href: "https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.5.023198",
            label: "Read the PRR paper"
        }
    },
    {
        title: "Fixed-Depth Hamiltonian Simulation",
        description: "Derived a Cartan decomposition approach for simulating fermionic lattices with a circuit depth independent of evolution time.",
        details: "The method maps target Hamiltonians into a control sequence that reuses a limited gate alphabet. Minimising the resulting cost function lets us fast-forward certain free-fermion models and provide analytic gradients for variational ansätze.",
        tags: ["Hamiltonian Simulation", "Algorithms", "Cartan Decomposition"],
        image: "images/cartan.jpg",
        imageAlt: "Cartan decomposition visual with Lie algebra elements",
        link: {
            href: "https://arxiv.org/abs/2104.00728",
            label: "View the preprint"
        }
    },
    {
        title: "Resource Optimisation for Noisy Quantum Systems",
        description: "Explored scheduling strategies and calibration-aware compilation to squeeze more performance out of constrained processors.",
        details: "I built tooling that ingests live calibration data, ranks qubit layouts, and proposes pulse-level compensation routines. The work feeds directly into ongoing projects on adaptive error mitigation in QuICS.",
        tags: ["Scheduling", "Noise Mitigation", "Compiler"],
        image: "images/door.jpeg",
        imageAlt: "Stylised circuit board illustrating optimisation",
        link: null
    },
    {
        title: "Charge Transport in Ultrathin Polymer Films",
        description: "Demonstrated that water-floated N2200 films retain high electron mobility at nanometre thicknesses.",
        details: "By combining floating-transfer fabrication with grazing-incidence X-ray scattering we connected microstructure to device performance, enabling transparent, low-material-cost OTFTs for flexible electronics.",
        tags: ["Organic Electronics", "Experiment", "Mobility"],
        image: "images/30mins.jpeg",
        imageAlt: "Microscope image of polymer thin film",
        link: {
            href: "Adv%20Elect%20Materials%20-%202022%20-%20Steckmann%20-%20Ultrathin%20P%20NDI2OD%E2%80%90T2%20Films%20with%20High%20Electron%20Mobility%20in%20Both%20Bottom%E2%80%90Gate%20and.pdf",
            label: "Download the manuscript"
        }
    },
    {
        title: "Quantum Error Mitigation Toolkit",
        description: "Built a modular Python package bundling zero-noise extrapolation, probabilistic error cancellation, and symmetry checks.",
        details: "The toolkit integrates with Qiskit Runtime and offers declarative recipes for composing mitigation layers. It powers several benchmarking studies for near-term applications run by the QuICS team.",
        tags: ["Software", "Open Source", "Error Mitigation"],
        image: "images/error_mitigation.jpeg",
        imageAlt: "Schematic of quantum error mitigation workflow",
        link: null
    }
];

const carouselElement = document.getElementById('portfolioCarousel');

if (!carouselElement) {
    console.warn('Portfolio carousel element was not found; skipping carousel initialisation.');
}

const carouselInner = carouselElement?.querySelector('.carousel-inner');
const indicatorsWrapper = carouselElement?.querySelector('.carousel-indicators');
const prevControl = carouselElement?.querySelector('.carousel-control-prev');
const nextControl = carouselElement?.querySelector('.carousel-control-next');

let carouselInstance = null;
let currentItemsPerSlide = null;

const debounce = (fn, delay = 150) => {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fn.apply(null, args), delay);
    };
};

const getItemsPerSlide = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 3;
    if (width >= 768) return 2;
    return 1;
};

const createCardMarkup = (item, index) => {
    const tagsMarkup = item.tags.map(tag => `<span class="badge bg-primary-subtle text-primary-emphasis me-2 mb-2">${tag}</span>`).join('');
    const imageMarkup = item.image ? `<img src="${item.image}" alt="${item.imageAlt}" class="card-img-top rounded-top">` : '';

    return `
        <article class="portfolio-card card h-100 border-0 shadow-sm" data-card-index="${index}" role="button" tabindex="0" aria-label="View details for ${item.title}">
            ${imageMarkup}
            <div class="card-body d-flex flex-column">
                <h3 class="card-title h5">${item.title}</h3>
                <p class="card-text flex-grow-1">${item.description}</p>
                <div class="card-tags d-flex flex-wrap mt-3">${tagsMarkup}</div>
                <span class="stretched-link" aria-hidden="true"></span>
            </div>
        </article>
    `;
};

const buildSlides = (itemsPerSlide) => {
    if (!carouselInner || !indicatorsWrapper) return 0;

    carouselInner.innerHTML = '';
    indicatorsWrapper.innerHTML = '';

    const slides = [];
    for (let i = 0; i < portfolioItems.length; i += itemsPerSlide) {
        slides.push(portfolioItems.slice(i, i + itemsPerSlide));
    }

    slides.forEach((slideItems, slideIndex) => {
        const slide = document.createElement('div');
        slide.className = `carousel-item ${slideIndex === 0 ? 'active' : ''}`;

        const row = document.createElement('div');
        row.className = 'row g-4 justify-content-center';

        slideItems.forEach((item, offset) => {
            const cardCol = document.createElement('div');
            cardCol.className = itemsPerSlide === 1 ? 'col-12' : itemsPerSlide === 2 ? 'col-md-6' : 'col-xl-4 col-md-6';
            const globalIndex = slideIndex * itemsPerSlide + offset;
            cardCol.innerHTML = createCardMarkup(item, globalIndex);
            row.appendChild(cardCol);
        });

        slide.appendChild(row);
        carouselInner.appendChild(slide);

        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', '#portfolioCarousel');
        indicator.setAttribute('data-bs-slide-to', slideIndex.toString());
        indicator.setAttribute('aria-label', `Go to slide ${slideIndex + 1}`);
        if (slideIndex === 0) {
            indicator.classList.add('active');
            indicator.setAttribute('aria-current', 'true');
        }
        indicatorsWrapper.appendChild(indicator);
    });

    const multipleSlides = slides.length > 1;
    [prevControl, nextControl].forEach(control => {
        if (control) {
            control.classList.toggle('d-none', !multipleSlides);
        }
    });
    indicatorsWrapper.classList.toggle('d-none', !multipleSlides);

    return slides.length;
};

const teardownOverlay = overlay => {
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    overlay?.remove();
    if (carouselInstance && carouselInstance._config.interval) {
        carouselInstance.cycle();
    }
};

const showProjectOverlay = (item) => {
    if (carouselInstance) {
        carouselInstance.pause();
    }

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
        <article class="portfolio-card expanded shadow-lg">
            <button type="button" class="btn-close position-absolute top-0 end-0 m-3" aria-label="Close project details"></button>
            <div class="card-body">
                ${item.image ? `<img src="${item.image}" alt="${item.imageAlt}" class="img-fluid rounded mb-3">` : ''}
                <h2 class="h4">${item.title}</h2>
                <p class="lead">${item.description}</p>
                <p>${item.details}</p>
                <div class="card-tags d-flex flex-wrap mt-4">
                    ${item.tags.map(tag => `<span class="badge bg-primary-subtle text-primary-emphasis me-2 mb-2">${tag}</span>`).join('')}
                </div>
                ${item.link ? `<a class="btn btn-outline-primary mt-4" href="${item.link.href}" target="_blank" rel="noopener">${item.link.label}</a>` : ''}
            </div>
        </article>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');

    const closeBtn = overlay.querySelector('.btn-close');
    closeBtn.focus();

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            teardownOverlay(overlay);
        }
    });

    closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        teardownOverlay(overlay);
    });

    overlay.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            teardownOverlay(overlay);
        }
    });
};

const attachCardInteractions = () => {
    if (!carouselInner) return;

    const cards = carouselInner.querySelectorAll('.portfolio-card[data-card-index]');
    cards.forEach(card => {
        const index = Number(card.getAttribute('data-card-index'));
        const item = portfolioItems[index];
        const handleInteraction = (event) => {
            event.preventDefault();
            showProjectOverlay(item);
        };

        card.addEventListener('click', handleInteraction);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                handleInteraction(event);
            }
        });
    });
};

const initialiseCarousel = () => {
    if (!carouselElement || !carouselInner || !indicatorsWrapper) return;

    const itemsPerSlide = getItemsPerSlide();
    if (itemsPerSlide === currentItemsPerSlide && carouselInstance) {
        return;
    }

    currentItemsPerSlide = itemsPerSlide;

    if (carouselInstance) {
        carouselInstance.dispose();
        carouselInstance = null;
    }

    const slideCount = buildSlides(itemsPerSlide);
    attachCardInteractions();

    carouselInstance = new bootstrap.Carousel(carouselElement, {
        interval: false,
        ride: false,
        pause: false,
        keyboard: true,
        wrap: slideCount > 1
    });
};

document.addEventListener('DOMContentLoaded', () => {
    if (!carouselElement) return;

    initialiseCarousel();
    window.addEventListener('resize', debounce(() => initialiseCarousel(), 200));
});