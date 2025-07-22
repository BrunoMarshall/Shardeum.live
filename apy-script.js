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
const netDailyReturnSpan = document.getElementById('net-daily-return');
const netRoiSpan = document.getElementById('net-roi');
const estimatedApySpan = document.getElementById('estimated-apy');
const probabilitySpan = document.getElementById('probability');
const nodeRewardDisplaySpan = document.getElementById('node-reward-display');
const totalNodesSpan = document.getElementById('total-nodes');
const communityNodesSpan = document.getElementById('community-nodes');
const standbyNodesSpan = document.getElementById('standby-nodes');
const nodeRewardSpan = document.getElementById('node-reward');
const cycleDurationSpan = document.getElementById('cycle-duration');
const rewardsChartCanvas = document.getElementById('rewards-chart');

// Cache for node counts, reward, and cycle duration
let cachedTotalNodes = null;
let cachedCommunityNodes = null;
let cachedStandbyNodes = null;
let cachedNodeReward = null;
let cachedCycleDuration = null;
let nodeCacheTimestamp = null;
const NODE_CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

// Cache for SHM price
let cachedShmPrice = null;
let shmPriceCacheTimestamp = null;
const SHM_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Constants
const ACTIVE_PERIOD_HOURS = 4;
const SELECTIONS_PER_DAY = 24 / ACTIVE_PERIOD_HOURS; // 6 selections/day

// Fetch Total Nodes from Shardeum API
async function fetchTotalNodes() {
    const now = Date.now();
    if (cachedTotalNodes !== null && nodeCacheTimestamp && (now - nodeCacheTimestamp < NODE_CACHE_DURATION)) {
        console.log('Using cached total nodes:', cachedTotalNodes);
        return cachedTotalNodes;
    }

    try {
        const response = await fetch('https://api.shardeum.org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'shardeum_getNodeList',
                params: [{ page: 1, limit: 1 }],
                id: 1,
                jsonrpc: '2.0'
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch total nodes`);
        const data = await response.json();
        if (!data.result || typeof data.result.totalNodes !== 'number') {
            throw new Error('Invalid total nodes response');
        }
        cachedTotalNodes = data.result.totalNodes;
        nodeCacheTimestamp = now;
        console.log('Fetched total nodes:', cachedTotalNodes);
        return cachedTotalNodes;
    } catch (error) {
        console.error('Error fetching total nodes:', error);
        return 'N/A';
    }
}

// Fetch Community Nodes from Shardeum API
async function fetchCommunityNodes() {
    const now = Date.now();
    if (cachedCommunityNodes !== null && nodeCacheTimestamp && (now - nodeCacheTimestamp < NODE_CACHE_DURATION)) {
        console.log('Using cached community nodes:', cachedCommunityNodes);
        return cachedCommunityNodes;
    }

    try {
        const response = await fetch('https://api.shardeum.org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'shardeum_getNodeList',
                params: [{ page: 1, limit: 1000 }],
                id: 1,
                jsonrpc: '2.0'
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch community nodes`);
        const data = await response.json();
        if (!data.result || !Array.isArray(data.result.nodes)) {
            throw new Error('Invalid community nodes response');
        }
        const communityNodes = data.result.nodes.filter(node => !node.foundationNode).length;
        cachedCommunityNodes = communityNodes;
        nodeCacheTimestamp = now;
        console.log('Fetched community nodes:', cachedCommunityNodes);
        return communityNodes;
    } catch (error) {
        console.error('Error fetching community nodes:', error);
        return 'N/A';
    }
}

// Fetch Standby Nodes and Cycle Duration from Shardeum API
async function fetchStandbyNodesAndCycle() {
    const now = Date.now();
    if (cachedStandbyNodes !== null && cachedCycleDuration !== null && nodeCacheTimestamp && (now - nodeCacheTimestamp < NODE_CACHE_DURATION)) {
        console.log('Using cached standby nodes:', cachedStandbyNodes, 'and cycle duration:', cachedCycleDuration);
        return { standbyNodes: cachedStandbyNodes, cycleDuration: cachedCycleDuration };
    }

    try {
        const response = await fetch('https://api.shardeum.org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'shardeum_getCycleInfo',
                params: [null],
                id: 1,
                jsonrpc: '2.0'
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch standby nodes and cycle duration`);
        const data = await response.json();
        if (!data.result || !data.result.cycleInfo || typeof data.result.cycleInfo.nodes.standby !== 'number' || typeof data.result.cycleInfo.duration !== 'number') {
            throw new Error('Invalid standby nodes or cycle duration response');
        }
        cachedStandbyNodes = data.result.cycleInfo.nodes.standby;
        cachedCycleDuration = data.result.cycleInfo.duration;
        nodeCacheTimestamp = now;
        console.log('Fetched standby nodes:', cachedStandbyNodes, 'cycle duration:', cachedCycleDuration);
        return { standbyNodes: cachedStandbyNodes, cycleDuration: cachedCycleDuration };
    } catch (error) {
        console.error('Error fetching standby nodes and cycle duration:', error);
        return { standbyNodes: 'N/A', cycleDuration: 'N/A' };
    }
}

// Fetch Node Reward from Shardeum API
async function fetchNodeReward() {
    const now = Date.now();
    if (cachedNodeReward !== null && nodeCacheTimestamp && (now - nodeCacheTimestamp < NODE_CACHE_DURATION)) {
        console.log('Using cached node reward:', cachedNodeReward);
        return cachedNodeReward;
    }

    try {
        const response = await fetch('https://api.shardeum.org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'shardeum_getNetworkAccount',
                params: [],
                id: 1,
                jsonrpc: '2.0'
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch node reward`);
        const data = await response.json();
        if (!data.result || !data.result.reward || typeof data.result.reward.amount !== 'string') {
            throw new Error('Invalid node reward response');
        }
        const rewardWei = parseInt(data.result.reward.amount, 16);
        const rewardShm = rewardWei / 1e18; // Hourly reward
        cachedNodeReward = rewardShm;
        nodeCacheTimestamp = now;
        console.log('Fetched node reward:', cachedNodeReward, 'SHM per hour');
        return cachedNodeReward;
    } catch (error) {
        console.error('Error fetching node reward:', error);
        return 'N/A';
    }
}

// Calculate Community Probability
async function calculateCommunityProbability() {
    try {
        const [communityNodes, { standbyNodes, cycleDuration }] = await Promise.all([
            fetchCommunityNodes(),
            fetchStandbyNodesAndCycle()
        ]);
        if (communityNodes === 'N/A' || standbyNodes === 'N/A' || communityNodes + standbyNodes === 0) {
            console.warn('Invalid node counts for probability calculation, using default 0.2412');
            return 0.2412; // Fallback to ~24.12%
        }
        const perSelectionProbability = communityNodes / (communityNodes + standbyNodes);
        const dailyProbability = 1 - Math.pow(1 - perSelectionProbability, SELECTIONS_PER_DAY);
        console.log('Per-selection probability:', perSelectionProbability, 'Daily probability:', dailyProbability);
        return dailyProbability;
    } catch (error) {
        console.error('Error calculating community probability:', error);
        return 0.2412; // Fallback to ~24.12%
    }
}

// Update Node Counts Display (Independent of Calculator)
async function updateNodeCounts() {
    try {
        const [totalNodes, { standbyNodes, cycleDuration }, communityNodes, nodeReward] = await Promise.all([
            fetchTotalNodes(),
            fetchStandbyNodesAndCycle(),
            fetchCommunityNodes(),
            fetchNodeReward()
        ]);
        totalNodesSpan.textContent = totalNodes === 'N/A' ? 'N/A' : totalNodes.toString();
        standbyNodesSpan.textContent = standbyNodes === 'N/A' ? 'N/A' : standbyNodes.toString();
        communityNodesSpan.textContent = communityNodes === 'N/A' ? 'N/A' : communityNodes.toString();
        nodeRewardSpan.textContent = nodeReward === 'N/A' ? 'N/A' : nodeReward.toFixed(2);
        cycleDurationSpan.textContent = cycleDuration === 'N/A' ? 'N/A' : cycleDuration.toString();
        nodeRewardDisplaySpan.textContent = nodeReward === 'N/A' ? 'N/A' : nodeReward.toFixed(2);
    } catch (error) {
        console.error('Error updating node counts:', error);
        totalNodesSpan.textContent = 'N/A';
        standbyNodesSpan.textContent = 'N/A';
        communityNodesSpan.textContent = 'N/A';
        nodeRewardSpan.textContent = 'N/A';
        cycleDurationSpan.textContent = 'N/A';
        nodeRewardDisplaySpan.textContent = 'N/A';
    }
}

// Initialize Sliders
const sliders = [
    { id: 'node-price-slider', instance: null, config: { start: 0, connect: 'lower', range: { min: 0, max: 200 }, step: 0.01 } },
    { id: 'num-servers-slider', instance: null, config: { start: 1, connect: 'lower', range: { min: 1, max: 100 }, step: 1 } },
    { id: 'running-costs-slider', instance: null, config: { start: 0, connect: 'lower', range: { min: 0, max: 50 }, step: 0.01 } },
    { id: 'node-stake-slider', instance: null, config: { start: 2400, connect: 'lower', range: { min: 2400, max: 100000 }, step: 100 } },
    { id: 'custom-probability-slider', instance: null, config: { start: 24.1, connect: 'lower', range: { min: 0, max: 100 }, step: 0.1 } },
    { id: 'weekly-validations-slider', instance: null, config: { start: 1.69, connect: 'lower', range: { min: 0, max: 7 }, step: 0.1 } }
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

// Sync sliders with inputs
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
    customProbabilityInput.classList.add('hidden');
    weeklyValidationsInput.classList.add('hidden');
    document.getElementById('custom-probability-slider').classList.add('hidden');
    document.getElementById('weekly-validations-slider').classList.add('hidden');

    if (customProbability.checked) {
        customProbabilityInput.classList.remove('hidden');
        document.getElementById('custom-probability-slider').classList.remove('hidden');
    } else if (weeklyValidations.checked) {
        weeklyValidationsInput.classList.remove('hidden');
        document.getElementById('weekly-validations-slider').classList.remove('hidden');
    }
    calculateEarnings();
}

useCommunityProbability.addEventListener('change', toggleProbabilityInputs);
customProbability.addEventListener('change', toggleProbabilityInputs);
weeklyValidations.addEventListener('change', toggleProbabilityInputs);

// Fetch SHM Price from CoinGecko with caching
async function fetchShmPrice() {
    const now = Date.now();
    if (cachedShmPrice && shmPriceCacheTimestamp && (now - shmPriceCacheTimestamp < SHM_CACHE_DURATION)) {
        console.log('Using cached SHM price:', cachedShmPrice);
        return cachedShmPrice;
    }

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur,inr');
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch SHM price`);
        const data = await response.json();
        if (!data.shardeum) throw new Error('Invalid SHM price response');
        cachedShmPrice = {
            usd: data.shardeum.usd || 0,
            eur: data.shardeum.eur || 0,
            inr: data.shardeum.inr || 0
        };
        shmPriceCacheTimestamp = now;
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

        // Fetch node reward and SHM price
        const [nodeReward, shmPrice] = await Promise.all([
            fetchNodeReward(),
            fetchShmPrice()
        ]);

        console.log('Node Reward:', nodeReward, 'SHM Price:', shmPrice);

        // Determine probability
        let probability;
        if (useCommunityProbability.checked) {
            probability = await calculateCommunityProbability();
        } else if (customProbability.checked) {
            probability = (parseFloat(customProbabilityInput.value) || 0) / 100;
        } else if (weeklyValidations.checked) {
            const weeklyValidationsValue = parseFloat(weeklyValidationsInput.value) || 0;
            probability = weeklyValidationsValue / 7;
        }

        console.log('Daily Probability:', probability);

        // Update probability and reward display
        probabilitySpan.textContent = (probability * 100).toFixed(1);
        nodeRewardDisplaySpan.textContent = nodeReward === 'N/A' ? 'N/A' : nodeReward.toFixed(2);

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

        // Calculate rewards: 10 SHM/hour for 4 hours = 40 SHM per selection
        const rewardPerSelection = nodeReward * ACTIVE_PERIOD_HOURS; // 10 * 4 = 40 SHM
        const dailyRewardsShm = probability * rewardPerSelection * numServers;
        const weeklyRewardsShm = dailyRewardsShm * 7;
        const monthlyRewardsShm = dailyRewardsShm * 30;
        const annualRewardsShm = dailyRewardsShm * 365;

        console.log('Rewards (SHM):', { dailyRewardsShm, weeklyRewardsShm, monthlyRewardsShm, annualRewardsShm });

        // Convert rewards and costs to selected currency
        let monthlyRewardsSelected, weeklyRewardsSelected, monthlyNodesCostSelected, dailyNodesCostSelected, annualNodesCostSelected, netAnnualProfitSelected;
        let currencySymbol = runningCurrency === 'USD' ? '$' : runningCurrency === 'EUR' ? '€' : runningCurrency === 'INR' ? '₹' : 'SHM';
        if (runningCurrency === 'USD') {
            monthlyRewardsSelected = monthlyRewardsShm * shmPrice.usd;
            weeklyRewardsSelected = weeklyRewardsShm * shmPrice.usd;
            monthlyNodesCostSelected = runningCosts * numServers;
            dailyNodesCostSelected = runningCosts * numServers / 30;
            annualNodesCostSelected = runningCosts * 12 * numServers;
            netAnnualProfitSelected = (annualRewardsShm * shmPrice.usd) - (runningCosts * 12 * numServers);
        } else if (runningCurrency === 'EUR') {
            monthlyRewardsSelected = monthlyRewardsShm * shmPrice.eur;
            weeklyRewardsSelected = weeklyRewardsShm * shmPrice.eur;
            monthlyNodesCostSelected = runningCosts * numServers;
            dailyNodesCostSelected = runningCosts * numServers / 30;
            annualNodesCostSelected = runningCosts * 12 * numServers;
            netAnnualProfitSelected = (annualRewardsShm * shmPrice.eur) - (runningCosts * 12 * numServers);
        } else if (runningCurrency === 'INR') {
            monthlyRewardsSelected = monthlyRewardsShm * shmPrice.inr;
            weeklyRewardsSelected = weeklyRewardsShm * shmPrice.inr;
            monthlyNodesCostSelected = runningCosts * numServers;
            dailyNodesCostSelected = runningCosts * numServers / 30;
            annualNodesCostSelected = runningCosts * 12 * numServers;
            netAnnualProfitSelected = (annualRewardsShm * shmPrice.inr) - (runningCosts * 12 * numServers);
        } else {
            monthlyRewardsSelected = monthlyRewardsShm;
            weeklyRewardsSelected = weeklyRewardsShm;
            monthlyNodesCostSelected = runningCostsShm * numServers;
            dailyNodesCostSelected = runningCostsShm * numServers / 30;
            annualNodesCostSelected = runningCostsShm * 12 * numServers;
            netAnnualProfitSelected = annualRewardsShm - (runningCostsShm * 12 * numServers);
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

        // Display results
        shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
        initialInvestmentSpan.textContent = `${currencySymbol}${(nodePrice * numServers).toFixed(2)} ${nodeCurrency} + ${nodeStake * numServers} SHM (${totalInvestmentShm.toFixed(2)} SHM total)`;
        dailyNodesCostSpan.textContent = `${currencySymbol}${dailyNodesCostSelected.toFixed(2)} (${dailyNodesCostShm.toFixed(2)} SHM)`;
        monthlyNodesCostSpan.textContent = `${currencySymbol}${monthlyNodesCostSelected.toFixed(2)} (${monthlyNodesCostShm.toFixed(2)} SHM)`;
        annualNodesCostSpan.textContent = `${currencySymbol}${annualNodesCostSelected.toFixed(2)} (${annualRunningCostsShm.toFixed(2)} SHM)`;
        netAnnualProfitSpan.textContent = `${currencySymbol}${netAnnualProfitSelected.toFixed(2)} (${netAnnualProfitShm.toFixed(2)} SHM)`;
        weeklyRewardsSpan.textContent = `${currencySymbol}${weeklyRewardsSelected.toFixed(2)} (${weeklyRewardsShm.toFixed(2)} SHM)`;
        monthlyRewardsSpan.textContent = `${currencySymbol}${monthlyRewardsSelected.toFixed(2)} (${monthlyRewardsShm.toFixed(2)} SHM)`;
        netDailyReturnSpan.textContent = netDailyReturn !== null ? `${netDailyReturn.toFixed(2)}%` : 'N/A';
        netRoiSpan.textContent = roi !== null ? `${roi.toFixed(2)}%` : 'N/A';
        estimatedApySpan.textContent = apy !== null ? `${apy.toFixed(2)}%` : 'N/A';

        // Show results
        resultsDiv.classList.remove('hidden');
        console.log('Results displayed');

        // Update chart
        if (rewardsChartCanvas.chart) {
            rewardsChartCanvas.chart.data.datasets[0].data = [weeklyRewardsSelected, monthlyRewardsSelected];
            rewardsChartCanvas.chart.data.datasets[0].label = `Rewards (${runningCurrency})`;
            rewardsChartCanvas.chart.options.scales.y.title.text = runningCurrency;
            rewardsChartCanvas.chart.update();
        } else {
            rewardsChartCanvas.chart = new Chart(rewardsChartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Weekly', 'Monthly'],
                    datasets: [{
                        label: `Rewards (${runningCurrency})`,
                        data: [weeklyRewardsSelected, monthlyRewardsSelected],
                        backgroundColor: ['#3B82F6', '#60A5FA'],
                        borderColor: ['#1D4ED8', '#3B82F6'],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: runningCurrency }
                        }
                    },
                    plugins: {
                        legend: { display: true },
                        title: { display: true, text: 'Estimated Rewards' }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error in calculateEarnings:', error);
        resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error calculating earnings. Please try again.</p>';
        resultsDiv.classList.remove('hidden');
    }
}

// Event listeners for currency changes
nodePriceCurrency.addEventListener('change', calculateEarnings);
runningCostsCurrency.addEventListener('change', calculateEarnings);

// Initialize page
updateNodeCounts(); // Fetch node counts, reward, and cycle duration independently
setInterval(updateNodeCounts, NODE_CACHE_DURATION); // Update every 1 minute

Promise.all([fetchShmPrice(), fetchNodeReward(), calculateCommunityProbability()]).then(([shmPrice, nodeReward, communityProbability]) => {
    shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
    probabilitySpan.textContent = (communityProbability * 100).toFixed(1);
    nodeRewardDisplaySpan.textContent = nodeReward === 'N/A' ? 'N/A' : nodeReward.toFixed(2);
    customProbabilityInput.value = (communityProbability * 100).toFixed(1);
    weeklyValidationsInput.value = (communityProbability * 7).toFixed(1);
    if (customProbabilitySlider) customProbabilitySlider.set(communityProbability * 100);
    if (weeklyValidationsSlider) weeklyValidationsSlider.set(communityProbability * 7);
    toggleProbabilityInputs();
    calculateEarnings();
}).catch(error => {
    console.error('Error on page load:', error);
    shmPriceSpan.textContent = 'N/A';
    nodeRewardDisplaySpan.textContent = 'N/A';
    resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error loading initial data. Please refresh the page.</p>';
    resultsDiv.classList.remove('hidden');
});