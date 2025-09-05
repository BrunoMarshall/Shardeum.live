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
const resultsDiv = document.getElementById('results');
const shmPriceSpan = document.getElementById('shm-price');
const initialInvestmentSpan = document.getElementById('initial-investment');
const dailyNodesCostSpan = document.getElementById('daily-nodes-cost');
const monthlyNodesCostSpan = document.getElementById('monthly-nodes-cost');
const annualNodesCostSpan = document.getElementById('annual-nodes-cost');
const netAnnualProfitSpan = document.getElementById('net-annual-profit');
const weeklyRewardsSpan = document.getElementById('weekly-rewards');
const monthlyRewardsSpan = document.getElementById('monthly-rewards');
const totalMonthlyProfitSpan = document.getElementById('total-monthly-profit');
const netDailyReturnSpan = document.getElementById('net-daily-return');
const netRoiSpan = document.getElementById('net-roi');
const estimatedApySpan = document.getElementById('estimated-apy');
const probabilitySpan = document.getElementById('probability');
const rewardSpan = document.getElementById('node-reward');
const totalNodesSpan = document.getElementById('total-nodes');
const standbyNodesSpan = document.getElementById('standby-nodes');
const communityNodesSpan = document.getElementById('community-nodes');
const foundationNodesSpan = document.getElementById('foundation-nodes');
const foundationRatioSpan = document.getElementById('foundation-ratio');
const communityRatioSpan = document.getElementById('community-ratio');
const cycleDurationSpan = document.getElementById('cycle-duration');
const rewardsChartCanvas = document.getElementById('rewards-chart');
const noteProbabilitySpan = document.getElementById('note-probability');
const noteRewardSpan = document.getElementById('note-reward');
const visitCounterSpan = document.getElementById('visit-counter');

// Initialize Sliders with Error Handling
const sliders = [
    { id: 'node-price-slider', instance: null, config: { start: 0, connect: 'lower', range: { min: 0, max: 200 }, step: 1 } },
    { id: 'num-servers-slider', instance: null, config: { start: 1, connect: 'lower', range: { min: 1, max: 100 }, step: 1 } },
    { id: 'running-costs-slider', instance: null, config: { start: 0, connect: 'lower', range: { min: 0, max: 50 }, step: 0.5 } },
    { id: 'node-stake-slider', instance: null, config: { start: 2400, connect: 'lower', range: { min: 2400, max: 100000 }, step: 100 } },
    { id: 'custom-probability-slider', instance: null, config: { start: 55, connect: 'lower', range: { min: 0, max: 100 }, step: 0.1 } },
    { id: 'weekly-validations-slider', instance: null, config: { start: 3.85, connect: 'lower', range: { min: 0, max: 7 }, step: 0.1 } }
];

sliders.forEach(slider => {
    const element = document.getElementById(slider.id);
    if (element) {
        try {
            slider.instance = noUiSlider.create(element, slider.config);
            console.log(`Initialized slider: ${slider.id}`);
        } catch (error) {
            console.error(`Failed to initialize slider ${slider.id}:`, error);
        }
    } else {
        console.error(`Slider element not found: ${slider.id}`);
    }
});

const nodePriceSlider = sliders.find(s => s.id === 'node-price-slider').instance;
const numServersSlider = sliders.find(s => s.id === 'num-servers-slider').instance;
const runningCostsSlider = sliders.find(s => s.id === 'running-costs-slider').instance;
const nodeStakeSlider = sliders.find(s => s.id === 'node-stake-slider').instance;
const customProbabilitySlider = sliders.find(s => s.id === 'custom-probability-slider').instance;
const weeklyValidationsSlider = sliders.find(s => s.id === 'weekly-validations-slider').instance;

// Sync sliders with inputs and update results
if (nodePriceSlider) {
    nodePriceSlider.on('update', (values) => {
        nodePriceInput.value = parseFloat(values[0]).toFixed(2);
        calculateEarnings();
    });
}
if (numServersSlider) {
    numServersSlider.on('update', (values) => {
        numServersInput.value = Math.round(values[0]);
        calculateEarnings();
    });
}
if (runningCostsSlider) {
    runningCostsSlider.on('update', (values) => {
        runningCostsInput.value = parseFloat(values[0]).toFixed(2);
        calculateEarnings();
    });
}
if (nodeStakeSlider) {
    nodeStakeSlider.on('update', (values) => {
        nodeStakeInput.value = Math.round(values[0]);
        calculateEarnings();
    });
}
if (customProbabilitySlider) {
    customProbabilitySlider.on('update', (values) => {
        customProbabilityInput.value = parseFloat(values[0]).toFixed(1);
        if (customProbability.checked) calculateEarnings();
    });
}
if (weeklyValidationsSlider) {
    weeklyValidationsSlider.on('update', (values) => {
        weeklyValidationsInput.value = parseFloat(values[0]).toFixed(1);
        if (weeklyValidations.checked) calculateEarnings();
    });
}

nodePriceInput.addEventListener('input', () => {
    const value = parseFloat(nodePriceInput.value);
    if (!isNaN(value) && nodePriceSlider) {
        nodePriceSlider.set(value);
        calculateEarnings();
    }
});

numServersInput.addEventListener('input', () => {
    const value = parseInt(numServersInput.value);
    if (!isNaN(value) && numServersSlider) {
        numServersSlider.set(value);
        calculateEarnings();
    }
});

runningCostsInput.addEventListener('input', () => {
    const value = parseFloat(runningCostsInput.value);
    if (!isNaN(value) && runningCostsSlider) {
        runningCostsSlider.set(value);
        calculateEarnings();
    }
});

nodeStakeInput.addEventListener('input', () => {
    const value = parseInt(nodeStakeInput.value);
    if (!isNaN(value) && nodeStakeSlider) {
        nodeStakeSlider.set(value);
        calculateEarnings();
    }
});

customProbabilityInput.addEventListener('input', () => {
    const value = parseFloat(customProbabilityInput.value);
    if (!isNaN(value) && customProbabilitySlider) {
        customProbabilitySlider.set(value);
        if (customProbability.checked) calculateEarnings();
    }
});

weeklyValidationsInput.addEventListener('input', () => {
    const value = parseFloat(weeklyValidationsInput.value);
    if (!isNaN(value) && weeklyValidationsSlider) {
        weeklyValidationsSlider.set(value);
        if (weeklyValidations.checked) calculateEarnings();
    }
});

// Toggle probability input visibility
function toggleProbabilityInputs() {
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
    calculateEarnings(); // Update results when probability option changes
}

useCommunityProbability.addEventListener('change', toggleProbabilityInputs);
customProbability.addEventListener('change', toggleProbabilityInputs);
weeklyValidations.addEventListener('change', toggleProbabilityInputs);

// Cache for SHM price
let cachedShmPrice = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Update Visit Counter
function updateVisitCounter() {
    let visits = parseInt(localStorage.getItem('pageVisits') || '0');
    visits += 1;
    localStorage.setItem('pageVisits', visits);
    if (visitCounterSpan) {
        visitCounterSpan.textContent = visits;
    }
}

// Fetch Config from JSON
async function fetchConfig() {
    try {
        const response = await fetch('assets/config.json');
        if (!response.ok) throw new Error('Failed to fetch config.json');
        const data = await response.json();
        console.log('Fetched config:', data);
        if (data.totalNodes < data.communityNodes) {
            console.warn('Invalid config: totalNodes less than communityNodes');
            data.communityNodes = data.totalNodes;
        }
        return {
            probability: Math.min(Math.max(data.probability || 0.55, 0), 1),
            reward: Math.max(data.reward || 40, 0),
            totalNodes: Math.max(data.totalNodes || 0, 0),
            standbyNodes: Math.max(data.standbyNodes || 0, 0),
            communityNodes: Math.max(data.communityNodes || 0, 0),
            cycleDuration: Math.max(data.cycleDuration || 0, 0)
        };
    } catch (error) {
        console.error('Error fetching config:', error);
        return {
            probability: 0.55,
            reward: 40,
            totalNodes: 0,
            standbyNodes: 0,
            communityNodes: 0,
            cycleDuration: 0
        };
    }
}

// Fetch SHM Price from CoinGecko with caching
async function fetchShmPrice() {
    const now = Date.now();
    if (cachedShmPrice && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        console.log('Using cached SHM price:', cachedShmPrice);
        return cachedShmPrice;
    }
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur,inr');
        if (!response.ok) throw new Error('Failed to fetch SHM price');
        const data = await response.json();
        cachedShmPrice = {
            usd: data.shardeum.usd || 0,
            eur: data.shardeum.eur || 0,
            inr: data.shardeum.inr || 0
        };
        cacheTimestamp = now;
        console.log('Fetched new SHM price:', cachedShmPrice);
        return cachedShmPrice;
    } catch (error) {
        console.error('Error fetching SHM price:', error);
        return cachedShmPrice || { usd: 0, eur: 0, inr: 0 };
    }
}

// Calculate Earnings
async function calculateEarnings() {
    console.log('Starting calculateEarnings');
    try {
        const nodePrice = parseFloat(nodePriceInput.value) || 0;
        const numServers = parseInt(numServersInput.value) || 1;
        const runningCosts = parseFloat(runningCostsInput.value) || 0;
        const nodeStake = parseFloat(nodeStakeInput.value) || 2400;
        const nodeCurrency = nodePriceCurrency.value;
        const runningCurrency = runningCostsCurrency.value;

        console.log('Inputs:', { nodePrice, numServers, runningCosts, nodeStake, nodeCurrency, runningCurrency });

        // Fetch config and SHM price
        const config = await fetchConfig();
        const shmPrice = await fetchShmPrice();

        console.log('Config:', config, 'SHM Price:', shmPrice);

        // Update network stats
        totalNodesSpan.textContent = config.totalNodes;
        standbyNodesSpan.textContent = config.standbyNodes;
        communityNodesSpan.textContent = config.communityNodes;
        foundationNodesSpan.textContent = config.totalNodes - config.communityNodes;
        cycleDurationSpan.textContent = config.cycleDuration;

        // Calculate Foundation and Community Ratios
        const totalNodes = config.totalNodes;
        const foundationNodes = config.totalNodes - config.communityNodes;
        const foundationRatio = totalNodes > 0 ? ((foundationNodes / totalNodes) * 100).toFixed(1) : 0;
        const communityRatio = totalNodes > 0 ? ((config.communityNodes / totalNodes) * 100).toFixed(1) : 0;
        foundationRatioSpan.textContent = foundationRatio;
        communityRatioSpan.textContent = communityRatio;

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

        // Set probability and reward to 0 if totalNodes is 0
        if (config.totalNodes === 0) {
            probability = 0;
            config.reward = 0;
        }

        console.log('Probability:', probability);

        // Update probability, reward, and note display
        probabilitySpan.textContent = (probability * 100).toFixed(1);
        rewardSpan.textContent = config.reward.toFixed(0);
        if (noteProbabilitySpan) noteProbabilitySpan.textContent = (probability * 100).toFixed(1);
        if (noteRewardSpan) noteRewardSpan.textContent = config.reward.toFixed(2);

        // Convert inputs to SHM
        let nodePriceShm = nodePrice;
        let runningCostsShm = runningCosts;
        if (nodeCurrency === 'USD') nodePriceShm = shmPrice.usd > 0 ? nodePrice / shmPrice.usd : 0;
        else if (nodeCurrency === 'EUR') nodePriceShm = shmPrice.eur > 0 ? nodePrice / shmPrice.eur : 0;
        else if (nodeCurrency === 'INR') nodePriceShm = shmPrice.inr > 0 ? nodePrice / shmPrice.inr : 0;
        if (runningCurrency === 'USD') runningCostsShm = shmPrice.usd > 0 ? runningCosts / shmPrice.usd : 0;
        else if (runningCurrency === 'EUR') runningCostsShm = shmPrice.eur > 0 ? runningCosts / shmPrice.eur : 0;
        else if (runningCurrency === 'INR') runningCostsShm = shmPrice.inr > 0 ? runningCosts / shmPrice.inr : 0;

        console.log('Converted to SHM:', { nodePriceShm, runningCostsShm });

        // Calculate rewards (per server, multiplied by number of servers)
        const dailyRewardsShm = probability * config.reward * numServers;
        const weeklyRewardsShm = dailyRewardsShm * 7;
        const monthlyRewardsShm = dailyRewardsShm * 30;
        const annualRewardsShm = dailyRewardsShm * 365;

        console.log('Rewards (SHM):', { dailyRewardsShm, weeklyRewardsShm, monthlyRewardsShm, annualRewardsShm });

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

        console.log('Converted to selected currency:', { monthlyRewardsSelected, weeklyRewardsSelected, monthlyNodesCostSelected, dailyNodesCostSelected, annualNodesCostSelected, netAnnualProfitSelected });

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

        console.log('Calculations:', { roi, netDailyReturn, apy });

        // Display results in selected currencies
        shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
        initialInvestmentSpan.textContent = `${currencySymbol}${(nodePrice * numServers).toFixed(2)} ${nodeCurrency} + ${nodeStake * numServers} SHM (${totalInvestmentShm.toFixed(2)} SHM total)`;
        dailyNodesCostSpan.textContent = `${currencySymbol}${dailyNodesCostSelected.toFixed(2)} ${runningCurrency} (${dailyNodesCostShm.toFixed(2)} SHM)`;
        monthlyNodesCostSpan.textContent = `${currencySymbol}${monthlyNodesCostSelected.toFixed(2)} ${runningCurrency} (${monthlyNodesCostShm.toFixed(2)} SHM)`;
        annualNodesCostSpan.textContent = `${currencySymbol}${annualNodesCostSelected.toFixed(2)} ${runningCurrency} (${annualRunningCostsShm.toFixed(2)} SHM)`;
        netAnnualProfitSpan.textContent = `${currencySymbol}${netAnnualProfitSelected.toFixed(2)} ${runningCurrency} (${netAnnualProfitShm.toFixed(2)} SHM)`;
        weeklyRewardsSpan.textContent = `${currencySymbol}${weeklyRewardsSelected.toFixed(2)} ${runningCurrency} (${weeklyRewardsShm.toFixed(2)} SHM)`;
        monthlyRewardsSpan.textContent = `${currencySymbol}${monthlyRewardsSelected.toFixed(2)} ${runningCurrency} (${monthlyRewardsShm.toFixed(2)} SHM)`;
        totalMonthlyProfitSpan.textContent = `${currencySymbol}${(monthlyRewardsSelected - monthlyNodesCostSelected).toFixed(2)} ${runningCurrency} (${(monthlyRewardsShm - monthlyNodesCostShm).toFixed(2)} SHM)`;
        netDailyReturnSpan.textContent = netDailyReturn !== null ? `${netDailyReturn.toFixed(2)}%` : 'N/A';
        netRoiSpan.textContent = roi !== null ? `${roi.toFixed(2)}%` : 'N/A';
        estimatedApySpan.textContent = apy !== null ? `${apy.toFixed(2)}%` : 'N/A';

        // Show results
        resultsDiv.classList.remove('hidden');
        console.log('Results displayed');

        // Render Chart
        if (rewardsChartCanvas.chart) {
            rewardsChartCanvas.chart.data.datasets[0].data = [weeklyRewardsSelected, monthlyRewardsSelected];
            rewardsChartCanvas.chart.data.datasets[0].label = `Rewards (${runningCurrency})`;
            rewardsChartCanvas.chart.options.scales.y.title.text = runningCurrency;
            rewardsChartCanvas.chart.update();
            console.log('Updated existing chart');
        } else {
            rewardsChartCanvas.chart = new Chart(rewardsChartCanvas, {
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
            console.log('Created new chart');
        }
    } catch (error) {
        console.error('Error in calculateEarnings:', error);
        resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error calculating earnings. Please try again.</p>';
        resultsDiv.classList.remove('hidden');
    }
}

// Event Listener for Currency Changes
nodePriceCurrency.addEventListener('change', () => {
    console.log('Node price currency changed');
    calculateEarnings();
});

runningCostsCurrency.addEventListener('change', () => {
    console.log('Running costs currency changed');
    calculateEarnings();
});

// Fetch SHM price and config on page load and calculate earnings
Promise.all([fetchShmPrice(), fetchConfig()]).then(([shmPrice, config]) => {
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    totalNodesSpan.textContent = config.totalNodes;
    standbyNodesSpan.textContent = config.standbyNodes;
    communityNodesSpan.textContent = config.communityNodes;
    foundationNodesSpan.textContent = config.totalNodes - config.communityNodes;
    cycleDurationSpan.textContent = config.cycleDuration;
    const totalNodes = config.totalNodes;
    const foundationNodes = config.totalNodes - config.communityNodes;
    const foundationRatio = totalNodes > 0 ? ((foundationNodes / totalNodes) * 100).toFixed(1) : 0;
    const communityRatio = totalNodes > 0 ? ((config.communityNodes / totalNodes) * 100).toFixed(1) : 0;
    foundationRatioSpan.textContent = foundationRatio;
    communityRatioSpan.textContent = communityRatio;
    probabilitySpan.textContent = (config.probability * 100).toFixed(1);
    rewardSpan.textContent = config.reward.toFixed(0);
    if (noteProbabilitySpan) noteProbabilitySpan.textContent = (config.probability * 100).toFixed(1);
    if (noteRewardSpan) noteRewardSpan.textContent = config.reward.toFixed(2);
    customProbabilityInput.value = (config.probability * 100).toFixed(1);
    weeklyValidationsInput.value = (config.probability * 7).toFixed(1);
    if (customProbabilitySlider) customProbabilitySlider.set(config.probability * 100);
    if (weeklyValidationsSlider) weeklyValidationsSlider.set(config.probability * 7);
    console.log('Page load: SHM price and config fetched');
    updateVisitCounter(); // Update visit counter on page load
    calculateEarnings(); // Trigger initial calculation
}).catch(error => {
    console.error('Error on page load:', error);
    resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error loading initial data. Please refresh the page.</p>';
    resultsDiv.classList.remove('hidden');
});

// Initialize probability inputs
toggleProbabilityInputs();