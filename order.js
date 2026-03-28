const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const calcButton = document.getElementById('calc');
const submitButton = document.getElementById('submit');
const resultBlock = document.getElementById('result');
const orderForm = document.getElementById('orderForm');
const orderSuccess = document.getElementById('orderSuccess');
const orderId = document.getElementById('orderId');
const distanceValue = document.getElementById('distanceValue');
const durationValue = document.getElementById('durationValue');
const rateValue = document.getElementById('rateValue');
const totalValue = document.getElementById('totalValue');
const customerNameInput = document.getElementById('customerName');
const customerPhoneInput = document.getElementById('customerPhone');
const commentInput = document.getElementById('comment');

const RATES = {
    xs: 9,
    s: 13,
    m: 20,
    l: 27,
    xl: 35,
    max: 70
};

let calculation = null;

// Элементы карточек размеров
const sizes = document.querySelectorAll('.main-size-card');

// Элементы карточек скоростей
const speeds = document.querySelectorAll('.main-speed-card');

function getActiveValue(selector) {
    const activeElement = document.querySelector(`${selector}.is-active`);
    return activeElement ? activeElement.dataset.value : '';
}

function calculateDistance(from, to) {
    const source = `${from.trim().toLowerCase()}|${to.trim().toLowerCase()}`;

    if (!source.replace('|', '')) {
        return 0;
    }

    let hash = 0;

    for (let i = 0; i < source.length; i += 1) {
        hash = (hash * 31 + source.charCodeAt(i)) % 100000;
    }

    return 3 + (hash % 997) / 10;
}

function resetResultView() {
    distanceValue.textContent = '—';
    durationValue.textContent = '—';
    rateValue.textContent = '—';
    totalValue.textContent = '—';
}

function resetCalculation() {
    calculation = null;
    submitButton.disabled = true;
    orderForm.style.display = 'block';
    orderSuccess.style.display = 'none';
    resetResultView();
}

function updateCalcButtonState() {
    calcButton.disabled = !(fromInput.value.trim() && toInput.value.trim());
}

function renderInfo() {
    resetCalculation();
    updateCalcButtonState();
}

// Логика выбора размера посылки и скорости доставки
[sizes, speeds].forEach((group) => {
    group.forEach((element) => {
        element.addEventListener('click', () => {
            group.forEach((c) =>
                c.classList.toggle('is-active', c.dataset.value === element.dataset.value)
            );
            renderInfo();
        });
    });
});

[fromInput, toInput].forEach((input) => {
    input.addEventListener('input', renderInfo);
});

calcButton.addEventListener('click', () => {
    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    const size = getActiveValue('.main-size-card');

    if (!from || !to || !size) {
        updateCalcButtonState();
        return;
    }

    const km = calculateDistance(from, to);
    let total = Math.ceil(km * RATES[size]);

    // Просчитываем длительность доставки
    let duration = Math.min(30, 1 + Math.ceil(km / 80));

    // Увеличиваем на 15% и сокращаем время на 30%
    const speed = document.querySelector('.main-speed-card.is-active').dataset.value;
    if (speed === 'fast') {
        total = Math.ceil(total * 1.15);
        duration = Math.ceil(duration - duration * 0.3);
    }

    calculation = {
        from: fromInput.value,
        to: toInput.value,
        size: size,
        distance: km.toFixed(1),
        duration: duration,
        rate: RATES[size],
        total: total,
        speed: speed
    };

    distanceValue.textContent = `${calculation.distance} км`;
    durationValue.textContent = `${calculation.duration} дн.`;
    rateValue.textContent = `${calculation.rate} ₽/км`;
    totalValue.textContent = `${calculation.total} ₽`;
    submitButton.disabled = false;
});

submitButton.addEventListener('click', () => {
    if (!calculation) {
        return;
    }

    const payload = {
        ...calculation,
        customerName: customerNameInput.value.trim(),
        customerPhone: customerPhoneInput.value.trim(),
        comment: commentInput.value.trim()
    };

    console.log(payload);

    orderId.textContent = `D-${Date.now().toString().slice(-6)}`;
    orderForm.style.display = 'none';
    orderSuccess.style.display = 'flex';
});

resetCalculation();
updateCalcButtonState();
