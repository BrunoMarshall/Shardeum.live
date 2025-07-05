// DOM Elements
const nodePriceInput = document.getElementById('node-price');
const nodePriceCurrency = document.getElementById('node-price-currency');
const numServersInput = document.getElementById('num-servers');
const runningCostsInput = document.getElementById('running-costs');
const runningCostsCurrency = document.getElementById('running-costs-currency');
const nodeStakeInput = document.getElementById('node-stake');
const useCommunityProbability = document.getElementById('use-community-probability');
const customProbability = document.getElementById('custom-probability');
const weeklyValidations = document.getElementById('weekly-validations');
const customProbabilityInput = document.getElementById('custom-probability-input');
const weeklyValidationsInput = document.getElementById('weekly-validations-input');
const calculateBtn = document.getElementById('calculate-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsDiv = document.getElementById('results');
const shmPriceSpan = document.getElementById('shm-price');
const initialInvestmentSpan = document.getElementById('initial-investment');
const dailyNodesCostSpan = document.getElementById('daily-nodes-cost');
const monthlyNodesCostSpan = document.getElementById('monthly-nodes-cost');
const annualNodesCostSpan = document.getElementById('annual-nodes-cost');
const netAnnualProfitSpan = document.getElementById('net-annual-profit');
const weeklyRewardsSpan = document.getElementById('weekly-rewards');
const monthlyRewardsSpan = document.getElementById('monthly-rewards');
const netDailyReturnSpan = document.getElementById('net-daily-return');
const netRoiSpan = document.getElementById('net-roi');
const estimatedApySpan = document.getElementById('estimated-apy');
const probabilitySpan = document.getElementById('probability');
const rewardSpan = document.getElementById('reward');
const rewardsChartCanvas = document.getElementById('rewards-chart');

// Debounce function to limit rapid calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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
const customProbabilitySlider = noUiSlider.create(document.getElementById('custom-probability-slider'), {
    start: 55,
    connect: 'lower',
    range: { min: 0, max: 100 },
    step: 0.1
});
const weeklyValidationsSlider = noUiSlider.create(document.getElementById('weekly-validations-slider'), {
    start: 3.85, // Equivalent to 0.55 * 7
    connect: 'lower',
    range: { min: 0, max: 7 },
    step: 0.1
});

// Debounced calculateEarnings
const debouncedCalculateEarnings = debounce(calculateEarnings, 300);

// Sync sliders with inputs and trigger calculation
nodePriceSlider.on('update', (values) => {
    nodePriceInput.value = parseFloat(values[0]).toFixed(2);
    debouncedCalculateEarnings();
});
numServersSlider.on('update', (values) => {
    numServersInput.value = Math.round(values[0]);
    console.log(`Number of Servers updated to: ${numServersInput.value}`);
    debouncedCalculateEarnings();
});
runningCostsSlider.on('update', (values) => {
    runningCostsInput.value = parseFloat(values[0]).toFixed(2);
    debouncedCalculateEarnings();
});
nodeStakeSlider.on('update', (values) => {
    nodeStakeInput.value = Math.round(values[0]);
    debouncedCalculateEarnings();
});
customProbabilitySlider.on('update', (values) => {
    customProbabilityInput.value = parseFloat(values[0]).toFixed(1);
    if (customProbability.checked) debouncedCalculateEarnings();
});
weeklyValidationsSlider.on('update', (values) => {
    weeklyValidationsInput.value = parseFloat(values[0]).toFixed(1);
    if (weeklyValidations.checked) debouncedCalculateEarnings();
});

// Sync inputs with sliders and trigger calculation
nodePriceInput.addEventListener('input', () => {
    const value = parseFloat(nodePriceInput.value);
    if (!isNaN(value) && value >= 0) {
        nodePriceSlider.set(value);
        debouncedCalculateEarnings();
    }
});
numServersInput.addEventListener('input', () => {
    const value = parseInt(numServersInput.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
        numServersSlider.set(value);
        console.log(`Number of Servers input changed to: ${numServersInput.value}`);
        debouncedCalculateEarnings();
    }
});
runningCostsInput.addEventListener('input', () => {
    const value = parseFloat(runningCostsInput.value);
    if (!isNaN(value) && value >= 0) {
        runningCostsSlider.set(value);
        debouncedCalculateEarnings();
    }
});
nodeStakeInput.addEventListener('input', () => {
    const value = parseInt(nodeStakeInput.value);
    if (!isNaN(value) && value >= 2400 && value <= 100000) {
        nodeStakeSlider.set(value);
        debouncedCalculateEarnings();
    }
});
customProbabilityInput.addEventListener('input', () => {
    const value = parseFloat(customProbabilityInput.value);
    if (!isNaN(value) && value >= 0 && value <= 100 && customProbability.checked) {
        customProbabilitySlider.set(value);
        debouncedCalculateEarnings();
    }
});
weeklyValidationsInput.addEventListener('input', () => {
    const value = parseFloat(weeklyValidationsInput.value);
    if (!isNaN(value) && value >= 0 && value <= 7 && weeklyValidations.checked) {
        weeklyValidationsSlider.set(value);
        debouncedCalculateEarnings();
    }
});

// Add change listeners for dropdowns and radio buttons
nodePriceCurrency.addEventListener('change', debouncedCalculateEarnings);
runningCostsCurrency.addEventListener('change', debouncedCalculateEarnings);
useCommunityProbability.addEventListener('change', () => {
    toggleProbabilityInputs();
    debouncedCalculateEarnings();
});
customProbability.addEventListener('change', () => {
    toggleProbabilityInputs();
    debouncedCalculateEarnings();
});
weeklyValidations.addEventListener('change', () => {
    toggleProbabilityInputs();
    debouncedCalculateEarnings();
});

// Toggle probability input visibility
function toggleProbabilityInputs() {
    const probabilityInputs = document.getElementById('probability-inputs');
    const customProbabilityInput = document.getElementById('custom-probability-input');
    const weeklyValidationsInput = document.getElementById('weekly-validations-input');
    const customProbabilitySlider = document.getElementById('custom-probability-slider');
    const weeklyValidationsSlider = document.getElementById('weekly-validations-slider');

    customProbabilityInput.classList.add('hidden');
    weeklyValidationsInput.classList.add('hidden');
    customProbabilitySlider.classList.add('hidden');
    weeklyValidationsSlider.classList.add('hidden');

    if (customProbability.checked) {
        customProbabilityInput.classList.remove('hidden');
        customProbabilitySlider.classList.remove('hidden');
    } else if (weeklyValidations.checked) {
        weeklyValidationsInput.classList.remove('hidden');
        weeklyValidationsSlider.classList.remove('hidden');
    }
}

// Fetch Config from JSON with cache busting
async function fetchConfig(bustCache = false) {
    try {
        const url = bustCache ? `assets/config.json?t=${new Date().getTime()}` : 'assets/config.json';
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch config.json');
        const data = await response.json();
        console.log('Fetched config:', data);
        return {
            probability: data.probability || 0.55,
            reward: data.reward || 40
        };
    } catch (error) {
        console.error('Error fetching config:', error);
        return { probability: 0.55, reward: 40 };
    }
}

// Fetch SHM Price from CoinGecko with cache busting
async function fetchShmPrice(bustCache = false) {
    try {
        const url = bustCache
            ? `https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur,inr&t=${new Date().getTime()}`
            : 'https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur,inr';
        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();
        console.log('Fetched SHM price:', data);
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
async function calculateEarnings(bustCache = false) {
    loadingIndicator.classList.remove('hidden');
    console.log("Calculating earnings with inputs: ", {
        numServers: numServersInput.value,
        runningCosts: runningCostsInput.value,
        nodeStake: nodeStakeInput.value,
        nodePrice: nodePriceInput.value,
        probabilityOption: document.querySelector('input[name="probability-option"]:checked').value,
        customProbability: customProbabilityInput.value,
        weeklyValidations: weeklyValidationsInput.value
    });

    const nodePrice = parseFloat(nodePriceInput.value) || 0;
    const numServers = parseInt(numServersInput.value) || 1;
    const runningCosts = parseFloat(runningCostsInput.value) || 0;
    const nodeStake = parseFloat(nodeStakeInput.value) || 2400;
    const nodeCurrency = nodePriceCurrency.value;
    const runningCurrency = runningCostsCurrency.value;

    // Fetch config and SHM price
    const config = await fetchConfig(bustCache);
    const shmPrice = await fetchShmPrice(bustCache);

    // Determine probability
    let probability;
    if (useCommunityProbability.checked) {
        probability = config.probability;
    } else if (customProbability.checked) {
        probability = (parseFloat(customProbabilityInput.value) || 0) / 100;
    } else if (weeklyValidations.checked) {
        const weeklyValidationsValue = parseFloat(weeklyValidationsInput.value) || 0;
        probability = weeklyValidationsValue / 7;
    }

    // Update probability and reward display
    probabilitySpan.textContent = (probability * 100).toFixed(1);
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

    // Calculate rewards
    const dailyRewardsShm = probability * config.reward * numServers;
    const weeklyRewardsShm = dailyRewardsShm * 7;
    const monthlyRewardsShm = dailyRewardsShm * 30;
    const annualRewardsShm = dailyRewardsShm * 365;

    // Convert rewards and costs to selected currency
    let monthlyRewardsSelected, weeklyRewardsSelected, monthlyNodesCostSelected, dailyNodesCostSelected, annualNodesCostSelected, netAnnualProfitSelected;
    let currencySymbol = runningCurrency === 'USD' ? '$' : runningCurrency === 'EUR' ? '€' : runningCurrency === 'INR' ? '₹' : '';
    if (runningCurrency === 'USD') {
        monthlyRewardsSelected = monthlyRewardsShm * shmPrice.usd;
        weeklyRewardsSelected = weeklyRewardsShm * shmPrice.usd;
        monthlyNodesCostSelected = runningCostsShm * numServers * shmPrice.usd;
        dailyNodesCostSelected = (runningCostsShm * numServers / 30) * shmPrice.usd;
        annualNodesCostSelected = runningCostsShm * 12 * numServers * shmPrice.usd;
        netAnnualProfitSelected = (annualRewardsShm - (runningCostsShm * 12 * numServers)) * shmPrice.usd;
    } else if (runningCurrency === 'EUR') {
        monthlyRewardsSelected = monthlyRewardsShm * shmPrice.eur;
        weeklyRewardsSelected = weeklyRewardsShm * shmPrice.eur;
        monthlyNodesCostSelected = runningCostsShm * numServers * shmPrice.eur;
        dailyNodesCostSelected = (runningCostsShm * numServers / 30) * shmPrice.eur;
        annualNodesCostSelected = runningCostsShm * 12 * numServers * shmPrice.eur;
        netAnnualProfitSelected = (annualRewardsShm - (runningCostsShm * 12 * numServers)) * shmPrice.eur;
    } else if (runningCurrency === 'INR') {
        monthlyRewardsSelected = monthlyRewardsShm * shmPrice.inr;
        weeklyRewardsSelected = weeklyRewardsShm * shmPrice.inr;
        monthlyNodesCostSelected = runningCostsShm * numServers * shmPrice.inr;
        dailyNodesCostSelected = (runningCostsShm * numServers / 30) * shmPrice.inr;
        annualNodesCostSelected = runningCostsShm * 12 * numServers * shmPrice.inr;
        netAnnualProfitSelected = (annualRewardsShm - (runningCostsShm * 12 * numServers)) * shmPrice.inr;
    } else {
        monthlyRewardsSelected = monthlyRewardsShm;
        weeklyRewardsSelected = weeklyRewardsShm;
        monthlyNodesCostSelected = runningCostsShm * numServers;
        dailyNodesCostSelected = runningCostsShm * numServers / 30;
        annualNodesCostSelected = runningCostsShm * 12 * numServers;
        netAnnualProfitSelected = annualRewardsShm - (runningCostsShm * 12 * numServers);
        currencySymbol = 'SHM';
    }

    // Calculate ROI, APY, and Daily Return
    const annualRunningCostsShm = runningCostsShm * 12 * numServers;
    const monthlyNodesCostShm = runningCostsShm * numServers;
    const dailyNodesCostShm = monthlyNodesCostShm / 30;
    const netAnnualProfitShm = annualRewardsShm - annualRunningCostsShm;
    const totalInvestmentShm = (nodePriceShm * numServers) + (nodeStake * numServers);
    let roi, netDailyReturn;
    if (totalInvestmentShm > 0) {
        roi = (netAnnualProfitShm / totalInvestmentShm) * 100;
        netDailyReturn = ((dailyRewardsShm - dailyNodesCostShm) / totalInvestmentShm) * 100;
    } else {
        roi = null;
        netDailyReturn = null;
    }
    const apy = roi;

    // Display results
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    initialInvestmentSpan.textContent = `${currencySymbol}${(nodePrice * numServers).toFixed(2)} ${nodeCurrency} + ${nodeStake * numServers} SHM (${totalInvestmentShm.toFixed(2)} SHM total)`;
    dailyNodesCostSpan.textContent = `${currencySymbol}${dailyNodesCostSelected.toFixed(2)} ${runningCurrency} (${dailyNodesCostShm.toFixed(2)} SHM)`;
    monthlyNodesCostSpan.textContent = `${currencySymbol}${monthlyNodesCostSelected.toFixed(2)} ${runningCurrency} (${monthlyNodesCostShm.toFixed(2)} SHM)`;
    annualNodesCostSpan.textContent = `${currencySymbol}${annualNodesCostSelected.toFixed(2)} ${runningCurrency} (${annualRunningCostsShm.toFixed(2)} SHM)`;
    netAnnualProfitSpan.textContent = `${currencySymbol}${netAnnualProfitSelected.toFixed(2)} ${runningCurrency} (${netAnnualProfitShm.toFixed(2)} SHM)`;
    weeklyRewardsSpan.textContent = `${currencySymbol}${weeklyRewardsSelected.toFixed(2)} ${runningCurrency} (${weeklyRewardsShm.toFixed(2)} SHM)`;
    monthlyRewardsSpan.textContent = `${currencySymbol}${monthlyRewardsSelected.toFixed(2)} ${runningCurrency} (${monthlyRewardsShm.toFixed(2)} SHM)`;
    netDailyReturnSpan.textContent = netDailyReturn !== null ? `${netDailyReturn.toFixed(2)}%` : 'N/A';
    netRoiSpan.textContent = roi !== null ? `${roi.toFixed(2)}%` : 'N/A';
    estimatedApySpan.textContent = apy !== null ? `${apy.toFixed(2)}%` : 'N/A';

    // Show results and hide loading
    resultsDiv.classList.remove('hidden');
    loadingIndicator.classList.add('hidden');

    // Render Chart
    if (window.rewardsChart) window.rewardsChart.destroy();
    window.rewardsChart = new Chart(rewardsChartCanvas, {
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

// Event Listener for Calculate Button with cache busting
calculateBtn.addEventListener('click', () => {
    console.log('Calculate button clicked, forcing cache refresh');
    calculateEarnings(true); // Pass bustCache=true
});

// Fetch SHM price and config on page load
Promise.all([fetchShmPrice(), fetchConfig()]).then(([shmPrice, config]) => {
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    probabilitySpan.textContent = (config.probability * 100).toFixed(1);
    rewardSpan.textContent = config.reward.toFixed(0);
    customProbabilityInput.value = (config.probability * 100).toFixed(1);
    weeklyValidationsInput.value = (config.probability * 7).toFixed(1);
    customProbabilitySlider.set(config.probability * 100);
    weeklyValidationsSlider.set(config.probability * 7);
    calculateEarnings(); // Initial calculation
});

// Initialize probability inputs
toggleProbabilityInputs();