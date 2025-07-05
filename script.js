// Hardcoded values (update manually)
const ACTIVE_PROBABILITY = 0.55; // 55% chance of being active
const REWARD_PER_SLOT = 40; // 40 SHM per active slot

// DOM Elements
const nodePriceInput = document.getElementById('node-price');
const nodePriceCurrency = document.getElementById('node-price-currency');
const runningCostsInput = document.getElementById('running-costs');
const runningCostsCurrency = document.getElementById('running-costs-currency');
const calculateBtn = document.getElementById('calculate-btn');
const resultsDiv = document.getElementById('results');
const shmPriceSpan = document.getElementById('shm-price');
const initialInvestmentSpan = document.getElementById('initial-investment');
const monthlyRewardsSpan = document.getElementById('monthly-rewards');
const weeklyRewardsSpan = document.getElementById('weekly-rewards');
const netRoiSpan = document.getElementById('net-roi');
const estimatedApySpan = document.getElementById('estimated-apy');
const rewardsChartCanvas = document.getElementById('rewards-chart');

// Initialize Sliders
const nodePriceSlider = noUiSlider.create(document.getElementById('node-price-slider'), {
    start: 1000,
    connect: 'lower',
    range: { min: 0, max: 10000 },
    step: 10
});
const runningCostsSlider = noUiSlider.create(document.getElementById('running-costs-slider'), {
    start: 50,
    connect: 'lower',
    range: { min: 0, max: 500 },
    step: 1
});

// Sync sliders with inputs
nodePriceSlider.on('update', (values) => {
    nodePriceInput.value = parseFloat(values[0]).toFixed(2);
});
runningCostsSlider.on('update', (values) => {
    runningCostsInput.value = parseFloat(values[0]).toFixed(2);
});
nodePriceInput.addEventListener('input', () => {
    nodePriceSlider.set(nodePriceInput.value);
});
runningCostsInput.addEventListener('input', () => {
    runningCostsSlider.set(runningCostsInput.value);
});

// Fetch SHM Price from CoinGecko
async function fetchShmPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur');
        const data = await response.json();
        return {
            usd: data.shardeum.usd,
            eur: data.shardeum.eur
        };
    } catch (error) {
        console.error('Error fetching SHM price:', error);
        return { usd: 0, eur: 0 };
    }
}

// Calculate Earnings
async function calculateEarnings() {
    const nodePrice = parseFloat(nodePriceInput.value) || 0;
    const runningCosts = parseFloat(runningCostsInput.value) || 0;
    const nodeCurrency = nodePriceCurrency.value;
    const runningCurrency = runningCostsCurrency.value;

    // Fetch SHM price
    const shmPrice = await fetchShmPrice();

    // Convert inputs to SHM
    let nodePriceShm = nodePrice;
    let runningCostsShm = runningCosts;
    if (nodeCurrency === 'USD') nodePriceShm = nodePrice / shmPrice.usd;
    else if (nodeCurrency === 'EUR') nodePriceShm = nodePrice / shmPrice.eur;
    if (runningCurrency === 'USD') runningCostsShm = runningCosts / shmPrice.usd;
    else if (runningCurrency === 'EUR') runningCostsShm = runningCosts / shmPrice.eur;

    // Calculate rewards
    const dailyRewardsShm = ACTIVE_PROBABILITY * REWARD_PER_SLOT;
    const weeklyRewardsShm = dailyRewardsShm * 7;
    const monthlyRewardsShm = dailyRewardsShm * 30;
    const annualRewardsShm = dailyRewardsShm * 365;

    // Convert rewards to USD and EUR
    const monthlyRewardsUsd = monthlyRewardsShm * shmPrice.usd;
    const monthlyRewardsEur = monthlyRewardsShm * shmPrice.eur;
    const weeklyRewardsUsd = weeklyRewardsShm * shmPrice.usd;
    const weeklyRewardsEur = weeklyRewardsShm * shmPrice.eur;

    // Calculate ROI and APY
    const annualRunningCostsShm = runningCostsShm * 12;
    const netAnnualProfitShm = annualRewardsShm - annualRunningCostsShm;
    const roi = (netAnnualProfitShm / nodePriceShm) * 100; // ROI in percentage
    const apy = roi; // Simplified APY (no compounding)

    // Display results
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)}`;
    initialInvestmentSpan.textContent = `${nodePriceShm.toFixed(2)} SHM (${nodePrice.toFixed(2)} ${nodeCurrency})`;
    monthlyRewardsSpan.textContent = `${monthlyRewardsShm.toFixed(2)} SHM ($${monthlyRewardsUsd.toFixed(2)} / €${monthlyRewardsEur.toFixed(2)})`;
    weeklyRewardsSpan.textContent = `${weeklyRewardsShm.toFixed(2)} SHM ($${weeklyRewardsUsd.toFixed(2)} / €${weeklyRewardsEur.toFixed(2)})`;
    netRoiSpan.textContent = `${roi.toFixed(2)}%`;
    estimatedApySpan.textContent = `${apy.toFixed(2)}%`;

    // Show results
    resultsDiv.classList.remove('hidden');

    // Render Chart
    new Chart(rewardsChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Weekly Rewards', 'Monthly Rewards'],
            datasets: [{
                label: 'Rewards (SHM)',
                data: [weeklyRewardsShm, monthlyRewardsShm],
                backgroundColor: ['#2563eb', '#1e40af']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'SHM' }
                }
            }
        }
    });
}

// Event Listener for Calculate Button
calculateBtn.addEventListener('click', calculateEarnings);

// Fetch SHM price on page load
fetchShmPrice().then(shmPrice => {
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)}`;
});