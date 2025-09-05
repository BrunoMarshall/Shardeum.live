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
const visitCounterSpan = document.getElementById('visit-counter'); // Add this to your HTML

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
    calculateEarnings();
}

useCommunityProbability.addEventListener('change', toggleProbabilityInputs);
customProbability.addEventListener('change', toggleProbabilityInputs);
weeklyValidations.addEventListener('change', toggleProbabilityInputs);

// Cache for SHM price and Shardeum data
let cachedShmPrice = null;
let cacheTimestamp = null;
let cachedShardeumData = null;
let shardeumCacheTimestamp = null;
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

// Fetch Reward from config.json
async function fetchConfig() {
    try {
        const response = await fetch('assets/config.json');
        if (!response.ok) throw new Error(`Failed to fetch config.json: ${response.status}`);
        const data = await response.json();
        console.log('Fetched config:', data);
        return {
            reward: parseFloat(data.reward) || 40 // Ensure reward is a number
        };
    } catch (error) {
        console.error('Error fetching config:', error);
        return {
            reward: 40
        };
    }
}

// Fetch Shardeum Network Data with caching
async function fetchShardeumData() {
    const now = Date.now();
    if (cachedShardeumData && shardeumCacheTimestamp && (now - shardeumCacheTimestamp < CACHE_DURATION)) {
        console.log('Using cached Shardeum data:', cachedShardeumData);
        return cachedShardeumData;
    }
    try {
        // Fetch node list
        const nodeListResponse = await fetch('https://api.shardeum.org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'shardeum_getNodeList',
                params: [{ page: 1, limit: 1000 }],
                id: 1,
                jsonrpc: '2.0'
            })
        });
        if (!nodeListResponse.ok) throw new Error(`Failed to fetch node list: ${nodeListResponse.status}`);
        const nodeListData = await nodeListResponse.json();
        if (!nodeListData.result) throw new Error('Invalid node list response');
        const nodes = nodeListData.result.nodes || [];
        const totalNodes = nodeListData.result.totalNodes || 255; // Fallback for calculations
        const communityNodes = nodes.filter(node => !node.foundationNode).length || 22; // Fallback
        const foundationNodes = totalNodes - communityNodes || 233; // Fallback

        // Fetch cycle info
        const cycleInfoResponse = await fetch('https://api.shardeum.org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'shardeum_getCycleInfo',
                params: [null],
                id: 1,
                jsonrpc: '2.0'
            })
        });
        if (!cycleInfoResponse.ok) throw new Error(`Failed to fetch cycle info: ${cycleInfoResponse.status}`);
        const cycleInfoData = await cycleInfoResponse.json();
        if (!cycleInfoData.result) throw new Error('Invalid cycle info response');
        const cycleDuration = cycleInfoData.result.cycleInfo?.duration || 60; // Fallback
        const standbyNodes = cycleInfoData.result.cycleInfo?.nodes?.standby || 415; // Fallback
        const activeNodes = cycleInfoData.result.cycleInfo?.nodes?.active || totalNodes;
        const desiredNodes = cycleInfoData.result.cycleInfo?.nodes?.desired || totalNodes;

        // Calculate probability (assuming 6 selections per day, 4 hours each)
        const probability = desiredNodes > 0 ? Math.min(1, activeNodes / desiredNodes / 6) : 0.55;

        cachedShardeumData = {
            totalNodes,
            standbyNodes,
            communityNodes,
            foundationNodes,
            cycleDuration,
            probability,
            apiSuccess: true
        };
        shardeumCacheTimestamp = now;
        console.log('Fetched new Shardeum data:', cachedShardeumData);
        return cachedShardeumData;
    } catch (error) {
        console.error('Error fetching Shardeum data:', error);
        // Display 0 in UI
        totalNodesSpan.textContent = '0';
        standbyNodesSpan.textContent = '0';
        communityNodesSpan.textContent = '0';
        foundationNodesSpan.textContent = '0';
        cycleDurationSpan.textContent = '0';
        foundationRatioSpan.textContent = '0';
        communityRatioSpan.textContent = '0';
        // Use fallback values for calculations, but set probability to 0
        cachedShardeumData = cachedShardeumData || {
            totalNodes: 255,
            standbyNodes: 415,
            communityNodes: 22,
            foundationNodes: 233,
            cycleDuration: 60,
            probability: 0, // No rewards when API fails
            apiSuccess: false
        };
        shardeumCacheTimestamp = now;
        return cachedShardeumData;
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
        if (!response.ok) throw new Error(`Failed to fetch SHM price: ${response.status}`);
        const data = await response.json();
        cachedShmPrice = {
            usd: data.shardeum?.usd || 0.06, // Fallback to current price
            eur: data.shardeum?.eur || 0.05,
            inr: data.shardeum?.inr || 5.47
        };
        cacheTimestamp = now;
        console.log('Fetched new SHM price:', cachedShmPrice);
        return cachedShmPrice;
    } catch (error) {
        console.error('Error fetching SHM price:', error);
        return cachedShmPrice || { usd: 0.06, eur: 0.05, inr: 5.47 };
    }
}

// Visit Counter
function updateVisitCounter() {
    if (!visitCounterSpan) {
        console.warn('Visit counter element not found');
        return;
    }
    let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    visitCount += 1;
    localStorage.setItem('visitCount', visitCount);
    visitCounterSpan.textContent = visitCount;
    console.log(`Visit count updated: ${visitCount}`);
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

        // Fetch config and Shardeum data
        const config = await fetchConfig();
        const shardeumData = await fetchShardeumData();
        const shmPrice = await fetchShmPrice();

        console.log('Config:', config, 'Shardeum Data:', shardeumData, 'SHM Price:', shmPrice);

        // Update network stats (only if API succeeded or cache is valid)
        if (shardeumData.apiSuccess) {
            totalNodesSpan.textContent = shardeumData.totalNodes;
            standbyNodesSpan.textContent = shardeumData.standbyNodes;
            communityNodesSpan.textContent = shardeumData.communityNodes;
            foundationNodesSpan.textContent = shardeumData.foundationNodes;
            cycleDurationSpan.textContent = shardeumData.cycleDuration;
            const totalNodes = shardeumData.totalNodes;
            const foundationRatio = totalNodes > 0 ? ((shardeumData.foundationNodes / totalNodes) * 100).toFixed(1) : 0;
            const communityRatio = totalNodes > 0 ? ((shardeumData.communityNodes / totalNodes) * 100).toFixed(1) : 0;
            foundationRatioSpan.textContent = foundationRatio;
            communityRatioSpan.textContent = communityRatio;
        }

        // Determine probability
        let probability;
        if (useCommunityProbability.checked) {
            probability = shardeumData.probability;
        } else if (customProbability.checked) {
            probability = (parseFloat(customProbabilityInput.value) || 0) / 100;
        } else if (weeklyValidations.checked) {
            const weeklyValidationsValue = parseFloat(weeklyValidationsInput.value) || 0;
            probability = weeklyValidationsValue / 7;
        }

        console.log('Probability:', probability);

        // Update probability and reward display
        probabilitySpan.textContent = (probability * 100).toFixed(1);
        rewardSpan.textContent = parseFloat(config.reward).toFixed(0); // Ensure reward is a number

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

        // Calculate rewards (per server, multiplied by number of servers, 4 hours active per selection)
        const dailyRewardsShm = probability * config.reward * numServers * 4;
        const weeklyRewardsShm = dailyRewardsShm * 7;
        const monthlyRewardsShm = dailyRewardsShm * 30;
        const annualRewardsShm = dailyRewardsShm * 365;

        console.log('Rewards (SHM):', { dailyRewardsShm, weeklyRewardsShm, monthlyRewardsShm, annualRewardsShm });

        // Convert rewards and costs to selected currency
        let monthlyRewardsSelected, weeklyRewardsSelected, monthlyNodesCostSelected, dailyNodesCostSelected, annualNodesCostSelected, netAnnualProfitSelected, totalMonthlyProfitSelected;
        let currencySymbol = runningCurrency === 'USD' ? '$' : runningCurrency === 'EUR' ? '€' : runningCurrency === 'INR' ? '₹' : '';
        if (runningCurrency === 'USD') {
            monthlyRewardsSelected = monthlyRewardsShm * shmPrice.usd;
            weeklyRewardsSelected = weeklyRewardsShm * shmPrice.usd;
            monthlyNodesCostSelected = runningCosts * numServers;
            dailyNodesCostSelected = runningCosts * numServers / 30;
            annualNodesCostSelected = runningCosts * 12 * numServers;
            netAnnualProfitSelected = (annualRewardsShm * shmPrice.usd) - (runningCosts * 12 * numServers);
            totalMonthlyProfitSelected = monthlyRewardsSelected - monthlyNodesCostSelected;
        } else if (runningCurrency === 'EUR') {
            monthlyRewardsSelected = monthlyRewardsShm * shmPrice.eur;
            weeklyRewardsSelected = weeklyRewardsShm * shmPrice.eur;
            monthlyNodesCostSelected = runningCosts * numServers;
            dailyNodesCostSelected = runningCosts * numServers / 30;
            annualNodesCostSelected = runningCosts * 12 * numServers;
            netAnnualProfitSelected = (annualRewardsShm * shmPrice.eur) - (runningCosts * 12 * numServers);
            totalMonthlyProfitSelected = monthlyRewardsSelected - monthlyNodesCostSelected;
        } else if (runningCurrency === 'INR') {
            monthlyRewardsSelected = monthlyRewardsShm * shmPrice.inr;
            weeklyRewardsSelected = weeklyRewardsShm * shmPrice.inr;
            monthlyNodesCostSelected = runningCosts * numServers;
            dailyNodesCostSelected = runningCosts * numServers / 30;
            annualNodesCostSelected = runningCosts * 12 * numServers;
            netAnnualProfitSelected = (annualRewardsShm * shmPrice.inr) - (runningCosts * 12 * numServers);
            totalMonthlyProfitSelected = monthlyRewardsSelected - monthlyNodesCostSelected;
        } else {
            monthlyRewardsSelected = monthlyRewardsShm;
            weeklyRewardsSelected = weeklyRewardsShm;
            monthlyNodesCostSelected = runningCostsShm * numServers;
            dailyNodesCostSelected = runningCostsShm * numServers / 30;
            annualNodesCostSelected = runningCostsShm * 12 * numServers;
            netAnnualProfitSelected = annualRewardsShm - (runningCostsShm * 12 * numServers);
            totalMonthlyProfitSelected = monthlyRewardsShm - (runningCostsShm * numServers);
            currencySymbol = 'SHM';
        }

        console.log('Converted to selected currency:', { monthlyRewardsSelected, weeklyRewardsSelected, monthlyNodesCostSelected, dailyNodesCostSelected, annualNodesCostSelected, netAnnualProfitSelected, totalMonthlyProfitSelected });

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
        totalMonthlyProfitSpan.textContent = `${currencySymbol}${totalMonthlyProfitSelected.toFixed(2)} ${runningCurrency} (${(monthlyRewardsShm - monthlyNodesCostShm).toFixed(2)} SHM)`;
        netDailyReturnSpan.textContent = netDailyReturn !== null ? `${netDailyReturn.toFixed(2)}%` : 'N/A';
        netRoiSpan.textContent = roi !== null ? `${roi.toFixed(2)}%` : 'N/A';
        estimatedApySpan.textContent = apy !== null ? `${apy.toFixed(2)}%` : 'N/A';

        // Show results
        resultsDiv.classList.remove('hidden');
        console.log('Results displayed');

        // Render Chart
        if (rewardsChartCanvas.chart) {
            rewardsChartCanvas.chart.data.labels = ['Weekly Rewards', 'Monthly Rewards', 'Total Monthly Profit'];
            rewardsChartCanvas.chart.data.datasets[0].data = [weeklyRewardsSelected, monthlyRewardsSelected, totalMonthlyProfitSelected];
            rewardsChartCanvas.chart.data.datasets[0].label = `Financials (${runningCurrency})`;
            rewardsChartCanvas.chart.options.scales.y.title.text = runningCurrency;
            rewardsChartCanvas.chart.update();
            console.log('Updated existing chart');
        } else {
            rewardsChartCanvas.chart = new Chart(rewardsChartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Weekly Rewards', 'Monthly Rewards', 'Total Monthly Profit'],
                    datasets: [{
                        label: `Financials (${runningCurrency})`,
                        data: [weeklyRewardsSelected, monthlyRewardsSelected, totalMonthlyProfitSelected],
                        backgroundColor: ['#2563eb', '#1e40af', '#4b0082'] // Added color for Total Monthly Profit
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
        resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error calculating earnings. Please try again or check network status.</p>';
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

// Fetch SHM price, config, and Shardeum data on page load and calculate earnings
Promise.all([fetchShmPrice(), fetchConfig(), fetchShardeumData()]).then(([shmPrice, config, shardeumData]) => {
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    if (!shardeumData.apiSuccess) {
        totalNodesSpan.textContent = '0';
        standbyNodesSpan.textContent = '0';
        communityNodesSpan.textContent = '0';
        foundationNodesSpan.textContent = '0';
        cycleDurationSpan.textContent = '0';
        foundationRatioSpan.textContent = '0';
        communityRatioSpan.textContent = '0';
        resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error loading network data. Calculations reflect server costs only.</p>';
        resultsDiv.classList.remove('hidden');
    } else {
        totalNodesSpan.textContent = shardeumData.totalNodes;
        standbyNodesSpan.textContent = shardeumData.standbyNodes;
        communityNodesSpan.textContent = shardeumData.communityNodes;
        foundationNodesSpan.textContent = shardeumData.foundationNodes;
        cycleDurationSpan.textContent = shardeumData.cycleDuration;
        const totalNodes = shardeumData.totalNodes;
        const foundationRatio = totalNodes > 0 ? ((shardeumData.foundationNodes / totalNodes) * 100).toFixed(1) : 0;
        const communityRatio = totalNodes > 0 ? ((shardeumData.communityNodes / totalNodes) * 100).toFixed(1) : 0;
        foundationRatioSpan.textContent = foundationRatio;
        communityRatioSpan.textContent = communityRatio;
    }
    probabilitySpan.textContent = (shardeumData.probability * 100).toFixed(1);
    rewardSpan.textContent = parseFloat(config.reward).toFixed(0);
    customProbabilityInput.value = (shardeumData.probability * 100).toFixed(1);
    weeklyValidationsInput.value = (shardeumData.probability * 7).toFixed(1);
    if (customProbabilitySlider) customProbabilitySlider.set(shardeumData.probability * 100);
    if (weeklyValidationsSlider) weeklyValidationsSlider.set(shardeumData.probability * 7);
    console.log('Page load: SHM price, config, and Shardeum data fetched');
    updateVisitCounter(); // Update visit counter on page load
    calculateEarnings();
}).catch(error => {
    console.error('Error on page load:', error);
    totalNodesSpan.textContent = '0';
    standbyNodesSpan.textContent = '0';
    communityNodesSpan.textContent = '0';
    foundationNodesSpan.textContent = '0';
    cycleDurationSpan.textContent = '0';
    foundationRatioSpan.textContent = '0';
    communityRatioSpan.textContent = '0';
    resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error loading network data. Calculations reflect server costs only.</p>';
    resultsDiv.classList.remove('hidden');
    updateVisitCounter(); // Update visit counter even on error
    calculateEarnings();
});

// Initialize probability inputs
toggleProbabilityInputs();