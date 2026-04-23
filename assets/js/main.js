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
    category: '',
    treatment: '',
    duration: '',
    provider: '',
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    goals: ''
};

function openBookingModal() {
    document.getElementById('bookingModal').classList.add('active');
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
    document.getElementById('treatmentDescription').textContent = `Experience our professional ${treatment} treatment.`;
    document.getElementById('treatmentDuration').textContent = duration;

    updateSidebar();
    document.getElementById('stepBtn1').disabled = false;
}

function selectProvider(el, provider) {
    document.querySelectorAll('.provider-card').forEach(card => card.classList.remove('selected'));
    el.classList.add('selected');
    bookingData.provider = provider;
    updateSidebar();
    document.getElementById('stepBtn3').disabled = false;
}

function nextStep() {
    if (currentStep < 5) {
        if (currentStep === 4) {
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

    const progress = (currentStep / 5) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('stepLabel').textContent = `Step ${currentStep} of 5`;
}

function updateSidebar() {
    document.getElementById('sidebarTreatment').textContent = bookingData.treatment || '-';
    document.getElementById('sidebarCategory').textContent = bookingData.category || '-';
    document.getElementById('sidebarProvider').textContent = bookingData.provider || '-';
    document.getElementById('sidebarDuration').textContent = bookingData.duration || '-';
}

function updateConfirmation() {
    document.getElementById('confirmTreatment').textContent = bookingData.treatment;
    document.getElementById('confirmProvider').textContent = bookingData.provider;
    document.getElementById('confirmDate').textContent = bookingData.date || 'Select date';
    document.getElementById('confirmTime').textContent = bookingData.time || 'Select time';
    document.getElementById('confirmDuration').textContent = bookingData.duration;
    document.getElementById('confirmName').textContent = bookingData.firstName + ' ' + bookingData.lastName;
    document.getElementById('confirmEmail').textContent = bookingData.email;
    document.getElementById('confirmPhone').textContent = bookingData.phone;
    document.getElementById('confirmGoals').textContent = bookingData.goals;
}

function submitBooking() {
    console.log('Booking submitted:', bookingData);
    alert('Booking submitted! We will contact you shortly to confirm.');
    closeBookingModal();
}

// Open modal from BOOK NOW button
document.querySelector('.book-now')?.addEventListener('click', openBookingModal);

// Simple Calendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const today = new Date();
    const busyDates = ['2026-04-25', '2026-04-26', '2026-05-01', '2026-05-02'];
    const busyTimes = { '2026-04-24': ['09:00', '10:00', '14:00'] };

    let html = '<div style="font-size:0.9rem;">';
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isBusy = busyDates.includes(dateStr);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();

        const style = isBusy ? 'opacity: 0.5; cursor: not-allowed;' : 'cursor: pointer;';
        html += `<div style="${style} padding:8px; margin:4px 0; background:#f0f0f0; border-radius:4px;" onclick="${isBusy ? '' : `bookingData.date='${dateStr}'; alert('Date selected: ${dateStr}')`}">${dayName} - ${dayNum}</div>`;
    }

    html += '</div>';
    calendarEl.innerHTML = html;
}

window.addEventListener('load', initCalendar);
