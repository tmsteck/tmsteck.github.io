// Portfolio projects displayed in the carousel
const portfolioItems = [
    {
        title: "A quantum computing approach to efficiently simulating correlated materials",
        snippet: "Develops a framework for efficient quantum impurity solvers  using compressed circuits with Gaussian states to push DMFT simulations onto near-term quantum hardware.",
        overview: [
            "Impurity solvers are a bottleneck for dynamical mean-field theory (DMFT), so we engineer a superposition-of-Gaussian-states basis that captures the interacting ground state while keeping the subspace compact enough to reuse throughout the self-consistency loop.",
            "We pair the SGS solver with partial compression of Trotterized impurity circuits, restructuring matchgates and controls to cut the two-qubit budget and make 8-qubit experiments feasible on current hardware.",
            "Hardware data is denoised with positive-semidefinite Gram projections, enabling Matsubara reconstructions, DMFT convergence, and a roadmap toward near-term quantum advantage in materials simulation."
        ],
        tags: ["DMFT", "Quantum Computing", "Gaussian States", "Circuit Compression"],
        image: "impurity.png",
        imageAlt: "Example figure of a multi-impurity model",
        links: [
            {
                href: "https://arxiv.org/abs/2508.05738",
                label: "arxiv"
            }
        ]
    },
    {
        title: "Error mitigation of shot-to-shot fluctuations in analog quantum simulators",
        snippet: "Extended the zero-noise extrapolation framework to include quasistatic sources of noise, such as those common in AMO type quantum simulators. Proposed and demonstrated an error mitigation method for long chain trapped ion analog quantum simulators",
        overview: [
            "Error mitigation has typically been explored in the context of digital quantum computing, but less so in the context of noisy analog quantum simulators. Such devices do not have the ultimate goal of fault-tolerant universal quantum computing, so will benefit greatly from error mitigation and calibration techniques.",
            "In this work, we focus on mitigating a source of errors which is dominant in many AMO platforms: shot-to-shot fluctuations of the control Hamiltonian. This type of noise arises from slow drifts in experimental parameters, such as laser intensity or magnetic field fluctuations, which vary between experimental runs but remain constant during a single run. We extend the zero-noise extrapolation framework to account for this type of noise and propose a mitigation strategy that leverages the quasistatic nature of the errors.",
            "We demonstrate our method on long chain trapped ion experiments, showing that it can accurately recover observables such as magnetization and correlations in the presence of significant shot-to-shot fluctuations. Our approach is general and can be applied to other analog quantum simulation platforms facing similar noise challenges.",
        ],
        tags: ["Analog Quantum Simulation", "Error Mitigation", "Zero Noise Extrapolation", "Trapped Ions"],
        image: "IonTrap.png",
        imageAlt: "Thermal noise in an ion trap quantum simulator",
        links: [
            {
                href: "https://arxiv.org/abs/2506.16509",
                label: "Arxiv preprint"
            }
        ]
    },
    {
        title: "Dynamical Mean-Field Theory on Noisy Quantum Hardware",
        snippet: "Exploits Hamiltonian Cartan decomposition and error mitigation to access the long-time dynamics required to compute the 2-site Anderson impurity model on IBM hardware.",
        overview: [
            "We focus on understanding and mitigating the impact of noise for hybrid quantum-classical dynamical mean-field theory (DMFT) algorithms, which require long-time evolution to self-consistently compute Green's functions.",
            "Using our recently developed Cartan decomposition techniques, we fast-forward the Anderson impurity model to reach long evolution times with fixed-depth circuits. This allows us to recover dynamical observables that typically decohere away on near-term quantum devices.",
            "Focuses on error mitigation, Hamiltonian simulation, hybrid algorithms, and signal processing."
        ],
        tags: ["Hamiltonian Simulation", "Error Mitigation", "DMFT"],
        image: "DMFT_phase_diagram.png",
        imageAlt: "Phase diagram of the Hubbard model showing the Mott transition",
        links: [
            {
                href: "https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.5.023198",
                label: "Physical Review Research"
            }
        ]
    },
    {
        title: "Fixed-Depth Hamiltonian Simulation",
        snippet: "Developed a framework using Cartan Lie algebras to compile fast-forwarding circuits for Hamiltonian dynamics",
        overview: [
            "Adapted a method for unitary compiling to generate Hamiltonian simulation fast-forwarding circuits. Produced a Cartan decomposition software package which has been widely used to study short-depth fermionic and spin models, including to generate insight into polynomial depth fast-forwarding circuits for free-fermionic models and non-interacting spin chains.",
            "Introduces the notion of using dynamical Lie algebras for studying Hamiltonian complexity, and developed a framework for compressing time evolution into short-depth circuits.",
        ],
        tags: ["Hamiltonian Simulation", "Algorithms", "Cartan Decomposition"],
        image: "Cartan_chart.png",
        imageAlt: "Lie algebraic structure of Cartan decomposition",
        links: [
            {
                href:"https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.129.070501",
                label: "Physical Review Letters"
            },
            {
                href: "https://arxiv.org/abs/2104.00728",
                label: "Preprint"
            }
        ]
    },
    
    {
        title: "Charge Transport in Ultrathin Polymer Films",
        snippet: "Demonstrated that water-floated N2200 films retain high electron mobility at ultrathin nanometer-scale thicknesses",
        overview: [
            "Combining a floating-transfer fabrication technique with grazing-incidence X-ray scattering connected microstructure to device performance, enabling transparent, low-material-cost OTFTs for flexible electronics.",
            "The process reduces materials waste while unlocking device geometries that thicker coatings cannot support, pointing toward greener manufacturing pipelines for polymer electronics."
        ],
        tags: ["Organic Electronics", "Experiment", "Mobility"],
        image: "basictransistor.png",
        imageAlt: "OFET device structure",
        links: [
            {
                href: "",
                label: "Email for a copy"
            },
            {
                href: "https://advanced.onlinelibrary.wiley.com/doi/10.1002/aelm.202101324",
                label: "Advanced Electronic Materials"
            }
        ]
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
        <article class="portfolio-card card h-100 border-0 shadow-sm" data-card-index="${index}">
            ${imageMarkup}
            <div class="card-body d-flex flex-column">
                <h3 class="card-title h5">${item.title}</h3>
                <p class="card-text flex-grow-1">${item.snippet}</p>
                <div class="card-tags d-flex flex-wrap mt-3">${tagsMarkup}</div>
                <div class="mt-4">
                    <button type="button" class="btn btn-outline-primary w-100 js-card-more" data-card-index="${index}" aria-label="More about ${item.title}">More</button>
                </div>
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

const buildLinksMarkup = (links = []) => {
    if (!links.length) return '';
    const linkItems = links.map(link => `
        <li class="list-inline-item mb-2">
            <a class="btn btn-sm btn-outline-primary" href="${link.href}" target="_blank" rel="noopener">${link.label}</a>
        </li>
    `).join('');
    return `
        <div class="mt-4">
            <h3 class="h6 text-uppercase text-primary fw-semibold mb-3">Additional links</h3>
            <ul class="list-inline">
                ${linkItems}
            </ul>
        </div>
    `;
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
                ${item.image ? `<img src="${item.image}" alt="${item.imageAlt}" class="img-fluid rounded mb-4">` : ''}
                <h2 class="h4">${item.title}</h2>
                <div class="card-tags d-flex flex-wrap mt-4">
                    ${item.tags.map(tag => `<span class="badge bg-primary-subtle text-primary-emphasis me-2 mb-2">${tag}</span>`).join('')}
                </div>
                <div class="overlay-copy mt-4">
                    ${item.overview.map(paragraph => `<p class="mb-3">${paragraph}</p>`).join('')}
                </div>
                ${buildLinksMarkup(item.links)}
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

    const moreButtons = carouselInner.querySelectorAll('.js-card-more');
    moreButtons.forEach(button => {
        const index = Number(button.getAttribute('data-card-index'));
        const item = portfolioItems[index];
        const handleInteraction = (event) => {
            event.preventDefault();
            showProjectOverlay(item);
        };

        button.addEventListener('click', handleInteraction);
        button.addEventListener('keydown', (event) => {
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