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

function scrollTo(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

document.querySelectorAll('.service-card, .pillar, .testimonial-card, section h2').forEach((el, idx) => {
    el.style.opacity = '0';
    el.dataset.animation = 'fadeInUp 0.6s ease-out forwards';
    el.style.animationDelay = (idx * 0.1) + 's';
    scrollObserver.observe(el);
});

document.querySelectorAll('.before-after-slider').forEach(slider => {
    const afterSide = slider.querySelector('.after-side');
    const divider = slider.querySelector('.slider-divider');
    
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

const prices = { botox: 13.50, fillers: 700, microneedling: 1000 };
const calcService = document.getElementById('calc-service');
const calcQty = document.getElementById('calc-quantity');
const calcResult = document.getElementById('calc-result');
if (calcService) {
    const update = () => calcResult.textContent = '$' + (prices[calcService.value] * (calcQty.value || 1)).toFixed(2);
    calcService.addEventListener('change', update);
    calcQty.addEventListener('input', update);
}

let currentStep = 1;
let bookingData = {
    category: '', treatment: '', duration: '', provider: '',
    date: '', firstName: '', lastName: '', email: '', phone: '', goals: ''
};

function openBookingModal() {
    document.getElementById('bookingModal').classList.add('active');
    updateButtonGroup();
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    currentStep = 1;
    updateStep();
}

function toggleCategory(el) {
    el.classList.toggle('open');
}

function selectService(el, category, treatment, duration) {
    bookingData.category = category;
    bookingData.treatment = treatment;
    bookingData.duration = duration;
    document.getElementById('treatmentTitle').textContent = treatment;
    document.getElementById('treatmentDescription').textContent = `Experience our professional ${treatment} service.`;
    document.getElementById('treatmentDuration').textContent = duration;
    updateSidebar();
    updateButtonGroup();
}

function selectProvider(el, provider) {
    document.querySelectorAll('.provider-card').forEach(card => card.classList.remove('selected'));
    el.classList.add('selected');
    bookingData.provider = provider;
    updateSidebar();
    updateButtonGroup();
}

/** Pick a calendar day; `el` is the clicked row (fixes reliance on global `event`). */
function selectDate(dateStr, el) {
    bookingData.date = dateStr;
    document.querySelectorAll('.calendar-date').forEach(d => {
        if (!d.classList.contains('calendar-date--busy')) d.classList.remove('selected');
    });
    if (el) el.classList.add('selected');
    updateSidebar();
    updateButtonGroup();
}

function nextStep() {
    if (currentStep === 5) {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const goals = document.getElementById('goals').value;

        if (!firstName || !lastName || !email || !phone || !goals) {
            alert('Please fill in all fields');
            return;
        }

        bookingData.firstName = firstName;
        bookingData.lastName = lastName;
        bookingData.email = email;
        bookingData.phone = phone;
        bookingData.goals = goals;
        updateConfirmation();
    }

    if (currentStep < 6) {
        currentStep++;
        updateStep();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

function updateStep() {
    document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step' + currentStep).classList.add('active');

    const progress = (currentStep / 6) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('stepLabel').textContent = `Step ${currentStep} of 6`;

    updateButtonGroup();
}

function updateButtonGroup() {
    const buttonGroup = document.getElementById('buttonGroup');
    if (!buttonGroup) return;
    buttonGroup.innerHTML = '';

    if (currentStep === 6) {
        const backBtn = document.createElement('button');
        backBtn.className = 'btn-back';
        backBtn.textContent = '← Back';
        backBtn.onclick = prevStep;
        buttonGroup.appendChild(backBtn);

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-submit';
        submitBtn.textContent = 'Confirm & Book';
        submitBtn.onclick = submitBooking;
        buttonGroup.appendChild(submitBtn);
        return;
    }

    if (currentStep > 1) {
        const backBtn = document.createElement('button');
        backBtn.className = 'btn-back';
        backBtn.textContent = '← Back';
        backBtn.onclick = prevStep;
        buttonGroup.appendChild(backBtn);
    }

    if (currentStep < 6) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-next';
        nextBtn.textContent = currentStep === 5 ? 'Review Booking' : 'Next';
        nextBtn.id = 'stepBtn' + currentStep;
        const gate =
            (currentStep === 1 && !bookingData.treatment) ||
            (currentStep === 3 && !bookingData.provider) ||
            (currentStep === 4 && !bookingData.date);
        nextBtn.disabled = gate;
        nextBtn.onclick = nextStep;
        buttonGroup.appendChild(nextBtn);
    }
}

function updateSidebar() {
    document.getElementById('sidebarTreatment').textContent = bookingData.treatment || '-';
    document.getElementById('sidebarProvider').textContent = bookingData.provider || '-';
    document.getElementById('sidebarDate').textContent = bookingData.date || '-';
}

function updateConfirmation() {
    document.getElementById('confirmTreatment').textContent = bookingData.treatment;
    document.getElementById('confirmProvider').textContent = bookingData.provider;
    document.getElementById('confirmDate').textContent = bookingData.date;
    document.getElementById('confirmName').textContent = bookingData.firstName + ' ' + bookingData.lastName;
    document.getElementById('confirmEmail').textContent = bookingData.email;
}

function submitBooking() {
    console.log('Booking submitted:', bookingData);
    alert('Booking submitted! We will contact you shortly.');
    closeBookingModal();
}

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
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
        const isBusy = busyDates.includes(dateStr);

        if (isBusy) {
            html += `<div class="calendar-date calendar-date--busy">${dayName} - ${dayNum}</div>`;
        } else {
            html += `<div class="calendar-date" onclick="selectDate('${dateStr}', this)">${dayName} - ${dayNum}</div>`;
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

document.querySelector('.book-now')?.addEventListener('click', openBookingModal);
window.addEventListener('load', () => {
    initCalendar();
    updateButtonGroup();
});
