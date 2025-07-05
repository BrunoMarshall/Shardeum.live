// DOM Elements
const nodePriceInput = document.getElementById('node-price');
const nodePriceCurrency = document.getElementById('node-price-currency');
const numServersInput = document.getElementById('num-servers');
const runningCostsInput = document.getElementById('running-costs');
const runningCostsCurrency = document.getElementById('running-costs-currency');
const nodeStakeInput = document.getElementById('node-stake');
const calculateBtn = document.getElementById('calculate-btn');
const resultsDiv = document.getElementById('results');
const shmPriceSpan = document.getElementById('shm-price');
const initialInvestmentSpan = document.getElementById('initial-investment');
const monthlyRewardsSpan = document.getElementById('monthly-rewards');
const weeklyRewardsSpan = document.getElementById('weekly-rewards');
const netRoiSpan = document.getElementById('net-roi');
const estimatedApySpan = document.getElementById('estimated-apy');
const probabilitySpan = document.getElementById('probability');
const rewardSpan = document.getElementById('reward');
const rewardsChartCanvas = document.getElementById('rewards-chart');

// Initialize Sliders
const nodePriceSlider = noUiSlider.create(document.getElementById('node-price-slider'), {
    start: 0,
    connect: 'lower',
    range: { min: 0, max: 200 },
    step: 1
});
const numServersSlider = noUiSlider.create(document.getElementById('num-servers-slider'), {
    start: 1,
    connect: 'lower',
    range: { min: 1, max: 100 },
    step: 1
});
const runningCostsSlider = noUiSlider.create(document.getElementById('running-costs-slider'), {
    start: 0,
    connect: 'lower',
    range: { min: 0, max: 50 },
    step: 0.5
});
const nodeStakeSlider = noUiSlider.create(document.getElementById('node-stake-slider'), {
    start: 2400,
    connect: 'lower',
    range: { min: 2400, max: 100000 },
    step: 100
});

// Sync sliders with inputs
nodePriceSlider.on('update', (values) => {
    nodePriceInput.value = parseFloat(values[0]).toFixed(2);
});
numServersSlider.on('update', (values) => {
    numServersInput.value = Math.round(values[0]);
});
runningCostsSlider.on('update', (values) => {
    runningCostsInput.value = parseFloat(values[0]).toFixed(2);
});
nodeStakeInput.addEventListener('input', () => {
    nodeStakeSlider.set(nodeStakeInput.value);
});
nodePriceInput.addEventListener('input', () => {
    nodePriceSlider.set(nodePriceInput.value);
});
numServersInput.addEventListener('input', () => {
    numServersSlider.set(numServersInput.value);
});
runningCostsInput.addEventListener('input', () => {
    runningCostsSlider.set(runningCostsInput.value);
});
nodeStakeSlider.on('update', (values) => {
    nodeStakeInput.value = Math.round(values[0]);
});

// Fetch Config from JSON
async function fetchConfig() {
    try {
        const response = await fetch('assets/config.json');
        if (!response.ok) throw new Error('Failed to fetch config.json');
        const data = await response.json();
        return {
            probability: data.probability || 0.55,
            reward: data.reward || 40
        };
    } catch (error) {
        console.error('Error fetching config:', error);
        return { probability: 0.55, reward: 40 };
    }
}

// Fetch SHM Price from CoinGecko
async function fetchShmPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur,inr');
        const data = await response.json();
        return {
            usd: data.shardeum.usd || 0,
            eur: data.shardeum.eur || 0,
            inr: data.shardeum.inr || 0
        };
    } catch (error) {
        console.error('Error fetching SHM price:', error);
        return { usd: 0, eur: 0, inr: 0 };
    }
}

// Calculate Earnings
async function calculateEarnings() {
    console.log("Calculator updated with user-selected currency results and node stake");
    const nodePrice = parseFloat(nodePriceInput.value) || 0;
    const numServers = parseInt(numServersInput.value) || 1;
    const runningCosts = parseFloat(runningCostsInput.value) || 0;
    const nodeStake = parseFloat(nodeStakeInput.value) || 2400; // Default to minimum stake
    const nodeCurrency = nodePriceCurrency.value;
    const runningCurrency = runningCostsCurrency.value;

    // Fetch config and SHM price
    const config = await fetchConfig();
    const shmPrice = await fetchShmPrice();

    // Update probability and reward display
    probabilitySpan.textContent = (config.probability * 100).toFixed(0);
    rewardSpan.textContent = config.reward.toFixed(0);

    // Convert inputs to SHM
    let nodePriceShm = nodePrice;
    let runningCostsShm = runningCosts;
    if (nodeCurrency === 'USD') nodePriceShm = shmPrice.usd > 0 ? nodePrice / shmPrice.usd : 0;
    else if (nodeCurrency === 'EUR') nodePriceShm = shmPrice.eur > 0 ? nodePrice / shmPrice.eur : 0;
    else if (nodeCurrency === 'INR') nodePriceShm = shmPrice.inr > 0 ? nodePrice / shmPrice.inr : 0;
    if (runningCurrency === 'USD') runningCostsShm = shmPrice.usd > 0 ? runningCosts / shmPrice.usd : 0;
    else if (runningCurrency === 'EUR') runningCostsShm = shmPrice.eur > 0 ? runningCosts / shmPrice.eur : 0;
    else if (runningCurrency === 'INR') runningCostsShm = shmPrice.inr > 0 ? runningCosts / shmPrice.inr : 0;

    // Calculate rewards (per server, multiplied by number of servers)
    const dailyRewardsShm = config.probability * config.reward * numServers;
    const weeklyRewardsShm = dailyRewardsShm * 7;
    const monthlyRewardsShm = dailyRewardsShm * 30;
    const annualRewardsShm = dailyRewardsShm * 365;

    // Convert rewards to selected currency
    let monthlyRewardsSelected, weeklyRewardsSelected;
    let currencySymbol = runningCurrency === 'USD' ? '$' : runningCurrency === 'EUR' ? '€' : runningCurrency === 'INR' ? '₹' : '';
    if (runningCurrency === 'USD') {
        monthlyRewardsSelected = monthlyRewardsShm * shmPrice.usd;
        weeklyRewardsSelected = weeklyRewardsShm * shmPrice.usd;
    } else if (runningCurrency === 'EUR') {
        monthlyRewardsSelected = monthlyRewardsShm * shmPrice.eur;
        weeklyRewardsSelected = weeklyRewardsShm * shmPrice.eur;
    } else if (runningCurrency === 'INR') {
        monthlyRewardsSelected = monthlyRewardsShm * shmPrice.inr;
        weeklyRewardsSelected = weeklyRewardsShm * shmPrice.inr;
    } else {
        monthlyRewardsSelected = monthlyRewardsShm;
        weeklyRewardsSelected = weeklyRewardsShm;
        currencySymbol = 'SHM';
    }

    // Calculate ROI and APY
    const annualRunningCostsShm = runningCostsShm * 12 * numServers; // Total annual running costs
    const netAnnualProfitShm = annualRewardsShm - annualRunningCostsShm;
    const totalInvestmentShm = (nodePriceShm * numServers) + (nodeStake * numServers); // Include stake
    let roi;
    if (totalInvestmentShm > 0) {
        roi = (netAnnualProfitShm / totalInvestmentShm) * 100; // ROI based on hardware and stake
    } else {
        roi = null; // No investment or stake, ROI is undefined
    }
    const apy = roi; // Simplified APY (no compounding)

    // Display results in selected currencies
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    initialInvestmentSpan.textContent = `${currencySymbol}${(nodePrice * numServers).toFixed(2)} ${nodeCurrency} + ${nodeStake * numServers} SHM (${totalInvestmentShm.toFixed(2)} SHM total)`;
    monthlyRewardsSpan.textContent = `${currencySymbol}${monthlyRewardsSelected.toFixed(2)} ${runningCurrency} (${monthlyRewardsShm.toFixed(2)} SHM)`;
    weeklyRewardsSpan.textContent = `${currencySymbol}${weeklyRewardsSelected.toFixed(2)} ${runningCurrency} (${weeklyRewardsShm.toFixed(2)} SHM)`;
    netRoiSpan.textContent = roi !== null ? `${roi.toFixed(2)}%` : 'N/A';
    estimatedApySpan.textContent = apy !== null ? `${apy.toFixed(2)}%` : 'N/A';

    // Show results
    resultsDiv.classList.remove('hidden');

    // Render Chart
    new Chart(rewardsChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Weekly Rewards', 'Monthly Rewards'],
            datasets: [{
                label: `Rewards (${runningCurrency})`,
                data: [weeklyRewardsSelected, monthlyRewardsSelected],
                backgroundColor: ['#2563eb', '#1e40af']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: runningCurrency }
                }
            }
        }
    });
}

// Event Listener for Calculate Button
calculateBtn.addEventListener('click', calculateEarnings);

// Fetch SHM price and config on page load
Promise.all([fetchShmPrice(), fetchConfig()]).then(([shmPrice, config]) => {
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    probabilitySpan.textContent = (config.probability * 100).toFixed(0);
    rewardSpan.textContent = config.reward.toFixed(0);
});