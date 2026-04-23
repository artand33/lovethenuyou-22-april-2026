const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
if (menuToggle) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('active'));
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', () => nav.classList.remove('active'));
    });
}

// Scroll animations
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.animation = entry.target.dataset.animation || 'fadeInUp 0.6s ease-out forwards';
            scrollObserver.unobserve(entry.target);
        } else {
            entry.target.style.opacity = '0';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.service-card, .pillar, .testimonial-carousel, section h2').forEach((el, idx) => {
    el.style.opacity = '0';
    el.dataset.animation = 'fadeInUp 0.6s ease-out forwards';
    el.style.animationDelay = (idx * 0.1) + 's';
    scrollObserver.observe(el);
});

document.querySelectorAll('.before-after-slider').forEach(slider => {
    slider.addEventListener('mousemove', (e) => {
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        slider.style.setProperty('--divider-pos', percent + '%');
        slider.style.setProperty('--clip-path', percent + '%');
    });
    slider.addEventListener('touchmove', (e) => {
        const rect = slider.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        slider.style.setProperty('--divider-pos', percent + '%');
        slider.style.setProperty('--clip-path', percent + '%');
    }, { passive: true });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.service-card').forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

const servicePrices = {
    botox: 13.50,
    fillers: 700,
    microneedling: 1000,
    kybella: 700,
    prp: 600,
    semaglutide: 299
};
const serviceSelect = document.getElementById('service-select');
const quantityInput = document.getElementById('quantity-input');
const resultPrice = document.getElementById('result-price');
if (serviceSelect && quantityInput && resultPrice) {
    const updatePricingCalculator = () => {
        const unit = servicePrices[serviceSelect.value] || 0;
        const n = Math.min(10, Math.max(1, parseInt(quantityInput.value, 10) || 1));
        if (String(quantityInput.value) !== String(n)) quantityInput.value = n;
        resultPrice.textContent = '$' + (unit * n).toFixed(2);
    };
    serviceSelect.addEventListener('change', updatePricingCalculator);
    quantityInput.addEventListener('input', updatePricingCalculator);
    updatePricingCalculator();
}

// --- 6-step booking (primary modal #bookingModal) ---

const BOOKING_TITLES = {
    1: 'Select Service Category',
    2: 'Choose a Service',
    3: 'Select Your Provider',
    4: 'Date & Time',
    5: 'Your Information',
    6: 'Review Your Booking'
};

const CATEGORY_LABELS = {
    injectables: 'Injectables',
    skin: 'Skin Care',
    body: 'Body',
    wellness: 'Wellness',
    hair: 'Hair',
    events: 'Events'
};

const SERVICES_BY_CATEGORY = {
    injectables: [
        { name: 'Botox / Dysport', duration: '30 min' },
        { name: 'Dermal Fillers', duration: '45 min' },
        { name: 'Daxxify', duration: '30 min' }
    ],
    skin: [
        { name: 'RF Microneedling', duration: '60 min' },
        { name: 'Laser Resurfacing', duration: '45 min' },
        { name: 'Chemical Peel', duration: '30 min' }
    ],
    body: [
        { name: 'Body Contouring', duration: '60 min' },
        { name: 'Sculptra BBL', duration: '90 min' },
        { name: 'Kybella', duration: '45 min' }
    ],
    wellness: [
        { name: 'Medical Weight Loss Consult', duration: '30 min' },
        { name: 'Semaglutide / Tirzepatide', duration: '20 min' },
        { name: 'NAD+ Infusion', duration: '60 min' }
    ],
    hair: [
        { name: 'PRP Hair Restoration', duration: '60 min' },
        { name: 'Exosome Scalp Therapy', duration: '45 min' }
    ],
    events: [
        { name: 'Wedding & Event Prep Plan', duration: '45 min' },
        { name: 'Special Occasion Glow Package', duration: '60 min' }
    ]
};

const PROVIDERS = [
    { id: 'carter', name: 'Dr. Emily Carter, MMS, PA-C', title: 'Founder & Lead Injection Artist' },
    { id: 'bennett', name: 'Sarah Bennett, MSN, APRN, FNP-C', title: 'Skin & Injection Specialist' },
    { id: 'hayes', name: 'Dr. Morgan Hayes, MD', title: 'Medical Director' }
];

const TIME_CHOICES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const BUSY_DATES = ['2026-04-25', '2026-04-26', '2026-05-01'];

let bookingStep = 1;
const bookingState = {
    categoryKey: '',
    serviceName: '',
    serviceDuration: '',
    provider: '',
    date: '',
    time: '',
    firstName: '', lastName: '', email: '', phone: '', goals: ''
};

function getBookingModal() {
    return document.getElementById('bookingModal');
}

function showStepError(msg) {
    const el = document.getElementById('stepError');
    if (!el) return;
    if (msg) {
        el.textContent = msg;
        el.style.display = 'block';
    } else {
        el.textContent = '';
        el.style.display = 'none';
    }
}

function openBookingModal() {
    const m = getBookingModal();
    if (!m) return;
    m.classList.add('active');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    resetBookingFlow();
}

function closeBookingModal() {
    const m = getBookingModal();
    if (m) {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
    }
    const legacy = document.getElementById('bookingModalLegacy');
    if (legacy) legacy.classList.remove('active');
    const s = document.getElementById('bookingSuccess');
    if (s) s.style.display = 'none';
    document.body.style.overflow = '';
    showStepError('');
}

function resetBookingFlow() {
    bookingStep = 1;
    Object.assign(bookingState, {
        categoryKey: '', serviceName: '', serviceDuration: '', provider: '', date: '', time: '',
        firstName: '', lastName: '', email: '', phone: '', goals: ''
    });
    document.querySelectorAll('#bookingModal .category-tile').forEach(t => t.classList.remove('selected'));
    const form = document.getElementById('bookingForm');
    if (form) form.reset();
    updateBookingUI();
}

function updateBookingUI() {
    document.querySelectorAll('#bookingModal .booking-step').forEach(s => s.classList.remove('active'));
    const cur = document.getElementById('step' + bookingStep);
    if (cur) cur.classList.add('active');

    const title = document.getElementById('stepTitle');
    if (title) title.textContent = BOOKING_TITLES[bookingStep] || '';

    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = (bookingStep / 6) * 100 + '%';

    document.querySelectorAll('#bookingModal .step-dot').forEach(dot => {
        const n = parseInt(dot.dataset.step, 10);
        dot.classList.toggle('active', n === bookingStep);
    });

    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');
    if (btnBack) btnBack.style.display = bookingStep > 1 ? 'inline-flex' : 'none';
    if (btnNext) {
        if (bookingStep === 6) btnNext.textContent = 'Confirm booking';
        else if (bookingStep === 5) btnNext.textContent = 'Review →';
        else btnNext.textContent = 'Next →';
    }

    if (bookingStep === 2) renderServiceList();
    if (bookingStep === 3) renderProviderList();
    if (bookingStep === 4) {
        initCalendarDates();
        if (bookingState.date) {
            const cal = document.getElementById('calendarDates');
            const btn = cal && cal.querySelector(`.cal-day[data-date="${bookingState.date}"]`);
            if (btn) btn.classList.add('selected');
        }
        renderTimeSlotsIfReady();
    }
    if (bookingStep === 6) renderReview();
}

function selectCategory(el, key) {
    showStepError('');
    document.querySelectorAll('#bookingModal .category-tile').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    bookingState.categoryKey = key;
    bookingState.serviceName = '';
    bookingState.serviceDuration = '';
}

function renderServiceList() {
    const box = document.getElementById('serviceList');
    if (!box) return;
    const list = SERVICES_BY_CATEGORY[bookingState.categoryKey] || [];
    if (!list.length) {
        box.innerHTML = '<p class="step-hint">Please go back and select a category.</p>';
        return;
    }
    box.innerHTML = list.map(
        (s, i) => '<button type="button" class="service-pill" data-idx="' + i + '">' + s.name
            + ' <span class="svc-dur">· ' + s.duration + '</span></button>'
    ).join('');

    list.forEach((s, i) => {
        if (s.name === bookingState.serviceName) {
            const b = box.querySelector('.service-pill[data-idx="' + i + '"]');
            if (b) b.classList.add('selected');
        }
    });

    box.querySelectorAll('.service-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
            const i = +btn.dataset.idx;
            const s = list[i];
            bookingState.serviceName = s.name;
            bookingState.serviceDuration = s.duration;
            box.querySelectorAll('.service-pill').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            showStepError('');
        });
    });
}

function renderProviderList() {
    const box = document.getElementById('providerList');
    if (!box) return;
    box.innerHTML = PROVIDERS.map(p => '<button type="button" class="provider-tile" data-id="' + p.id + '"><strong>'
        + p.name + '</strong><span>' + p.title + '</span></button>').join('');

    if (bookingState.provider) {
        const match = PROVIDERS.find(p => p.name === bookingState.provider);
        if (match) {
            const b = box.querySelector('.provider-tile[data-id="' + match.id + '"]');
            if (b) b.classList.add('selected');
        }
    }

    box.querySelectorAll('.provider-tile').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const p = PROVIDERS.find(x => x.id === id);
            bookingState.provider = p ? p.name : '';
            box.querySelectorAll('.provider-tile').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            showStepError('');
        });
    });
}

function initCalendarDates() {
    const cal = document.getElementById('calendarDates');
    if (!cal) return;
    const today = new Date();
    let html = '';
    for (let i = 0; i < 21; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (BUSY_DATES.indexOf(iso) !== -1) {
            html += '<div class="cal-day cal-day--busy">' + label + '</div>';
        } else {
            html += '<button type="button" class="cal-day" data-date="' + iso + '">' + label + '</button>';
        }
    }
    cal.innerHTML = html;
    cal.querySelectorAll('.cal-day[data-date]').forEach(btn => {
        btn.addEventListener('click', () => {
            cal.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
            btn.classList.add('selected');
            bookingState.date = btn.dataset.date;
            bookingState.time = '';
            renderTimeSlots();
            showStepError('');
        });
    });
}

function renderTimeSlots() {
    const el = document.getElementById('timeSlots');
    if (!el) return;
    if (!bookingState.date) {
        el.innerHTML = '<p class="time-hint">Select a date first</p>';
        return;
    }
    el.innerHTML = TIME_CHOICES.map(
        t => '<button type="button" class="time-slot" data-t="' + t + '">' + t + '</button>').join('');

    if (bookingState.time) {
        const s = el.querySelector('.time-slot[data-t="' + bookingState.time + '"]');
        if (s) s.classList.add('selected');
    }

    el.querySelectorAll('.time-slot').forEach(btn => {
        btn.addEventListener('click', () => {
            el.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            bookingState.time = btn.dataset.t;
            showStepError('');
        });
    });
}

function renderTimeSlotsIfReady() {
    if (bookingState.date) renderTimeSlots();
    else {
        const el = document.getElementById('timeSlots');
        if (el) el.innerHTML = '<p class="time-hint">Select a date first</p>';
    }
}

function nextStep() {
    showStepError('');

    if (bookingStep === 6) {
        submitBookingV2();
        return;
    }
    if (bookingStep === 1) {
        if (!bookingState.categoryKey) {
            showStepError('Please select a service category.');
            return;
        }
    } else if (bookingStep === 2) {
        if (!bookingState.serviceName) {
            showStepError('Please select a service.');
            return;
        }
    } else if (bookingStep === 3) {
        if (!bookingState.provider) {
            showStepError('Please select a provider.');
            return;
        }
    } else if (bookingStep === 4) {
        if (!bookingState.date) {
            showStepError('Please select a date.');
            return;
        }
        if (!bookingState.time) {
            showStepError('Please select a time.');
            return;
        }
    } else if (bookingStep === 5) {
        const f = document.getElementById('firstName').value.trim();
        const l = document.getElementById('lastName').value.trim();
        const e = document.getElementById('email').value.trim();
        const p = document.getElementById('phone').value.trim();
        if (!f || !l || !e || !p) {
            showStepError('Please complete all required fields.');
            return;
        }
        bookingState.firstName = f;
        bookingState.lastName = l;
        bookingState.email = e;
        bookingState.phone = p;
        bookingState.goals = (document.getElementById('goals').value || '').trim();
    }

    if (bookingStep < 6) {
        bookingStep++;
        updateBookingUI();
    }
}

function prevStep() {
    if (bookingStep > 1) {
        bookingStep--;
        showStepError('');
        updateBookingUI();
    }
}

function esc(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderReview() {
    const r = document.getElementById('reviewSummary');
    if (!r) return;
    const d = bookingState.date ? new Date(bookingState.date + 'T12:00:00') : null;
    const dStr = d
        ? d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
    const cat = CATEGORY_LABELS[bookingState.categoryKey] || bookingState.categoryKey || '—';
    r.innerHTML = '<div class="review-line"><span>Category</span><strong>' + esc(cat) + '</strong></div>'
        + '<div class="review-line"><span>Service</span><strong>' + esc(bookingState.serviceName || '—') + '</strong></div>'
        + '<div class="review-line"><span>Provider</span><strong>' + esc(bookingState.provider || '—') + '</strong></div>'
        + '<div class="review-line"><span>Date &amp; time</span><strong>' + esc(dStr) + ' · ' + esc(bookingState.time || '—') + '</strong></div>'
        + '<div class="review-line"><span>Contact</span><strong>' + esc((bookingState.firstName + ' ' + bookingState.lastName).trim() || '—') + '</strong></div>'
        + '<div class="review-line"><span>Email</span><strong>' + esc(bookingState.email || '—') + '</strong></div>'
        + '<div class="review-line"><span>Phone</span><strong>' + esc(bookingState.phone || '—') + '</strong></div>'
        + (bookingState.goals
            ? '<div class="review-goals"><span>Notes</span><p>' + esc(bookingState.goals) + '</p></div>' : '');
}

function submitBookingV2() {
    console.log('Booking submitted', bookingState);
    const m = getBookingModal();
    if (m) {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
    }
    const suc = document.getElementById('bookingSuccess');
    if (suc) suc.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    bookingStep = 1;
}

// —— Legacy booking modal (HTML retained; keep handlers & calendar working) ——
function toggleCategory(el) {
    if (el && el.classList) el.classList.toggle('open');
}

function selectService(el, category, treatment, duration) {
    const title = document.getElementById('treatmentTitleLegacy');
    if (title) title.textContent = treatment;
    const desc = document.getElementById('treatmentDescriptionLegacy');
    if (desc) desc.textContent = 'Experience our professional ' + treatment + ' service.';
    const dur = document.getElementById('treatmentDurationLegacy');
    if (dur) dur.textContent = duration;
    const st = document.getElementById('sidebarTreatmentLegacy');
    if (st) st.textContent = treatment;
}

function selectProvider(el, provider) {
    document.querySelectorAll('#bookingModalLegacy .provider-card').forEach(c => c.classList.remove('selected'));
    if (el) {
        el.classList.add('selected');
        const sp = document.getElementById('sidebarProviderLegacy');
        if (sp) sp.textContent = provider;
    }
}

function selectDate(dateStr, el) {
    document.querySelectorAll('#bookingModalLegacy .calendar-date').forEach(d => {
        if (!d.classList.contains('calendar-date--busy')) d.classList.remove('selected');
    });
    if (el) el.classList.add('selected');
    const sd = document.getElementById('sidebarDateLegacy');
    if (sd) sd.textContent = dateStr;
}

function initCalendarLegacy() {
    const calendarEl = document.getElementById('calendarLegacy');
    if (!calendarEl) return;

    const today = new Date();
    let html = '';

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        const busyDates = ['2026-04-25', '2026-04-26', '2026-05-01'];
        const isBusy = busyDates.indexOf(dateStr) !== -1;
        if (isBusy) {
            html += '<div class="calendar-date calendar-date--busy">' + dayName + ' - ' + dayNum + '</div>';
        } else {
            html += '<div class="calendar-date" onclick="selectDate(\'' + dateStr + '\', this)">'
                + dayName + ' - ' + dayNum + '</div>';
        }
    }
    calendarEl.innerHTML = html;
}

if (!document.getElementById('booking-calendar-styles')) {
    const style = document.createElement('style');
    style.id = 'booking-calendar-styles';
    style.textContent = `
.calendar-date {
    padding: 8px;
    margin: 4px 0;
    background: #f0f0f0;
    border-radius: 4px;
    transition: all 0.3s;
    cursor: pointer;
}
.calendar-date--busy {
    opacity: 0.5;
    cursor: not-allowed;
}
.calendar-date:not(.calendar-date--busy):hover {
    background: #D4A574;
}
.calendar-date.selected {
    background: #D4A574;
    color: #1A1A1A;
    font-weight: 600;
}
`;
    document.head.appendChild(style);
}

function initTestimonialCarousel() {
    const root = document.getElementById('testimonials');
    if (!root) return;
    const carousel = root.querySelector('.testimonial-carousel');
    const viewport = carousel && carousel.querySelector('.carousel-viewport');
    const track = document.getElementById('testimonialTrack');
    const cards = track && track.querySelectorAll('.testimonial-card');
    const prev = document.getElementById('testimonialPrev');
    const next = document.getElementById('testimonialNext');
    if (!carousel || !viewport || !track || !cards || !cards.length || !prev || !next) return;

    let index = 0;
    const count = cards.length;

    const slideWidth = () => viewport.getBoundingClientRect().width;

    const goTo = (newIdx) => {
        index = ((newIdx % count) + count) % count;
        track.style.transform = 'translateX(' + (-index * slideWidth()) + 'px)';
    };

    const onResize = () => {
        track.style.transition = 'none';
        const w = slideWidth();
        cards.forEach((card) => {
            card.style.flex = '0 0 ' + w + 'px';
        });
        track.style.transform = 'translateX(' + (-index * w) + 'px)';
        requestAnimationFrame(() => {
            track.style.transition = '';
        });
    };

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(viewport);
    }
    window.addEventListener('resize', onResize);

    prev.addEventListener('click', () => goTo(index - 1));
    next.addEventListener('click', () => goTo(index + 1));

    onResize();
}

window.addEventListener('load', () => {
    initCalendarLegacy();
    initTestimonialCarousel();
    const btn = document.getElementById('btnNext');
    if (btn) btn.addEventListener('click', nextStep);
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (bookingStep === 5) nextStep();
        });
    }
    const modal = getBookingModal();
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeBookingModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const m = getBookingModal();
        if (m && m.classList.contains('active')) {
            e.preventDefault();
            closeBookingModal();
        } else {
            const s = document.getElementById('bookingSuccess');
            if (s && s.style.display !== 'none' && s.style.display !== '') closeBookingModal();
        }
    });
});
