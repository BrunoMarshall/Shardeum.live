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

// Sync sliders with inputs and trigger calculation
nodePriceSlider.on('update', (values) => {
    nodePriceInput.value = parseFloat(values[0]).toFixed(2);
    calculateEarnings();
});
numServersSlider.on('update', (values) => {
    numServersInput.value = Math.round(values[0]);
    console.log(`Number of Servers updated to: ${numServersInput.value}`);
    calculateEarnings();
});
runningCostsSlider.on('update', (values) => {
    runningCostsInput.value = parseFloat(values[0]).toFixed(2);
    calculateEarnings();
});
nodeStakeSlider.on('update', (values) => {
    nodeStakeInput.value = Math.round(values[0]);
    calculateEarnings();
});
customProbabilitySlider.on('update', (values) => {
    customProbabilityInput.value = parseFloat(values[0]).toFixed(1);
    if (customProbability.checked) calculateEarnings();
});
weeklyValidationsSlider.on('update', (values) => {
    weeklyValidationsInput.value = parseFloat(values[0]).toFixed(1);
    if (weeklyValidations.checked) calculateEarnings();
});

// Sync inputs with sliders and trigger calculation
nodePriceInput.addEventListener('input', () => {
    nodePriceSlider.set(nodePriceInput.value);
    calculateEarnings();
});
numServersInput.addEventListener('input', () => {
    numServersSlider.set(numServersInput.value);
    console.log(`Number of Servers input changed to: ${numServersInput.value}`);
    calculateEarnings();
});
runningCostsInput.addEventListener('input', () => {
    runningCostsSlider.set(runningCostsInput.value);
    calculateEarnings();
});
nodeStakeInput.addEventListener('input', () => {
    nodeStakeSlider.set(nodeStakeInput.value);
    calculateEarnings();
});
customProbabilityInput.addEventListener('input', () => {
    customProbabilitySlider.set(customProbabilityInput.value);
    if (customProbability.checked) calculateEarnings();
});
weeklyValidationsInput.addEventListener('input', () => {
    weeklyValidationsSlider.set(weeklyValidationsInput.value);
    if (weeklyValidations.checked) calculateEarnings();
});

// Add change listeners for dropdowns and radio buttons
nodePriceCurrency.addEventListener('change', calculateEarnings);
runningCostsCurrency.addEventListener('change', calculateEarnings);
useCommunityProbability.addEventListener('change', () => {
    toggleProbabilityInputs();
    calculateEarnings();
});
customProbability.addEventListener('change', () => {
    toggleProbabilityInputs();
    calculateEarnings();
});
weeklyValidations.addEventListener('change', () => {
    toggleProbabilityInputs();
    calculateEarnings();
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
    const nodeStake = parseFloat(nodeStakeInput.value) || 2400; // Default to minimum stake
    const nodeCurrency = nodePriceCurrency.value;
    const runningCurrency = runningCostsCurrency.value;

    // Fetch config and SHM price
    const config = await fetchConfig();
    const shmPrice = await fetchShmPrice();

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

    // Calculate rewards (per server, multiplied by number of servers)
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
    const annualRunningCostsShm = runningCostsShm * 12 * numServers; // Total annual running costs
    const monthlyNodesCostShm = runningCostsShm * numServers; // Monthly nodes cost
    const dailyNodesCostShm = monthlyNodesCostShm / 30; // Daily nodes cost
    const netAnnualProfitShm = annualRewardsShm - annualRunningCostsShm;
    const totalInvestmentShm = (nodePriceShm * numServers) + (nodeStake * numServers); // Include stake per server
    let roi, netDailyReturn;
    if (totalInvestmentShm > 0) {
        roi = (netAnnualProfitShm / totalInvestmentShm) * 100; // ROI based on hardware and stake
        netDailyReturn = ((dailyRewardsShm - dailyNodesCostShm) / totalInvestmentShm) * 100; // Net daily return
    } else {
        roi = null; // No investment or stake, ROI is undefined
        netDailyReturn = null; // No investment, daily return is undefined
    }
    const apy = roi; // Simplified APY (no compounding)

    // Display results in selected currencies
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

    // Show results
    resultsDiv.classList.remove('hidden');

    // Render Chart
    if (window.rewardsChart) window.rewardsChart.destroy(); // Destroy existing chart to prevent overlap
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

// Event Listener for Calculate Button
calculateBtn.addEventListener('click', calculateEarnings);

// Fetch SHM price and config on page load
Promise.all([fetchShmPrice(), fetchConfig()]).then(([shmPrice, config]) => {
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    probabilitySpan.textContent = (config.probability * 100).toFixed(1);
    rewardSpan.textContent = config.reward.toFixed(0);
    customProbabilityInput.value = (config.probability * 100).toFixed(1);
    weeklyValidationsInput.value = (config.probability * 7).toFixed(1);
    customProbabilitySlider.set(config.probability * 100);
    weeklyValidationsSlider.set(config.probability * 7);
    calculateEarnings(); // Initial calculation on page load
});

// Initialize probability inputs
toggleProbabilityInputs();