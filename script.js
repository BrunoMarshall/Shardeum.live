document.addEventListener('DOMContentLoaded', () => {
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
    const probabilityForm = document.getElementById('probability-form');
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
    const errorMessage = document.createElement('p');
    errorMessage.className = 'text-red-600 text-center mt-2 hidden';
    resultsDiv.parentElement.insertBefore(errorMessage, resultsDiv);

    // Verify DOM elements
    console.log('DOM elements loaded:', {
        probabilityForm: !!probabilityForm,
        useCommunityProbability: !!useCommunityProbability,
        customProbability: !!customProbability,
        weeklyValidations: !!weeklyValidations,
        customProbabilityInput: !!customProbabilityInput,
        weeklyValidationsInput: !!weeklyValidationsInput,
        customProbabilitySlider: !!document.getElementById('custom-probability-slider'),
        weeklyValidationsSlider: !!document.getElementById('weekly-validations-slider')
    });

    // Initialize Sliders
    let nodePriceSlider, numServersSlider, runningCostsSlider, nodeStakeSlider, customProbabilitySlider, weeklyValidationsSlider;
    try {
        nodePriceSlider = noUiSlider.create(document.getElementById('node-price-slider'), {
            start: 0,
            connect: 'lower',
            range: { min: 0, max: 200 },
            step: 1
        });
        numServersSlider = noUiSlider.create(document.getElementById('num-servers-slider'), {
            start: 1,
            connect: 'lower',
            range: { min: 1, max: 100 },
            step: 1
        });
        runningCostsSlider = noUiSlider.create(document.getElementById('running-costs-slider'), {
            start: 0,
            connect: 'lower',
            range: { min: 0, max: 50 },
            step: 0.5
        });
        nodeStakeSlider = noUiSlider.create(document.getElementById('node-stake-slider'), {
            start: 2400,
            connect: 'lower',
            range: { min: 2400, max: 100000 },
            step: 100
        });
        if (document.getElementById('custom-probability-slider')) {
            customProbabilitySlider = noUiSlider.create(document.getElementById('custom-probability-slider'), {
                start: 55,
                connect: 'lower',
                range: { min: 0, max: 100 },
                step: 0.1
            });
        }
        if (document.getElementById('weekly-validations-slider')) {
            weeklyValidationsSlider = noUiSlider.create(document.getElementById('weekly-validations-slider'), {
                start: 3.85,
                connect: 'lower',
                range: { min: 0, max: 7 },
                step: 0.1
            });
        }
    } catch (error) {
        console.error('Slider initialization error:', error);
        errorMessage.textContent = 'Failed to initialize sliders, possibly due to CSP restrictions';
        errorMessage.classList.remove('hidden');
    }

    // Debounce function
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

    // Debounced calculateEarnings
    const debouncedCalculateEarnings = debounce(calculateEarnings, 300);

    // Sync sliders with inputs
    if (nodePriceSlider) {
        nodePriceSlider.on('update', (values) => {
            nodePriceInput.value = parseFloat(values[0]).toFixed(2);
            debouncedCalculateEarnings();
        });
    }
    if (numServersSlider) {
        numServersSlider.on('update', (values) => {
            numServersInput.value = Math.round(values[0]);
            console.log(`Number of Servers updated to: ${numServersInput.value}`);
            debouncedCalculateEarnings();
        });
    }
    if (runningCostsSlider) {
        runningCostsSlider.on('update', (values) => {
            runningCostsInput.value = parseFloat(values[0]).toFixed(2);
            debouncedCalculateEarnings();
        });
    }
    if (nodeStakeSlider) {
        nodeStakeSlider.on('update', (values) => {
            nodeStakeInput.value = Math.round(values[0]);
            debouncedCalculateEarnings();
        });
    }
    if (customProbabilitySlider) {
        customProbabilitySlider.on('update', (values) => {
            customProbabilityInput.value = parseFloat(values[0]).toFixed(1);
            if (customProbability?.checked) debouncedCalculateEarnings();
        });
    }
    if (weeklyValidationsSlider) {
        weeklyValidationsSlider.on('update', (values) => {
            weeklyValidationsInput.value = parseFloat(values[0]).toFixed(1);
            if (weeklyValidations?.checked) debouncedCalculateEarnings();
        });
    }

    // Sync inputs with sliders
    nodePriceInput.addEventListener('input', () => {
        const value = parseFloat(nodePriceInput.value);
        if (!isNaN(value) && value >= 0 && nodePriceSlider) {
            nodePriceSlider.set(value);
            debouncedCalculateEarnings();
        }
    });
    numServersInput.addEventListener('input', () => {
        const value = parseInt(numServersInput.value);
        if (!isNaN(value) && value >= 1 && value <= 100 && numServersSlider) {
            numServersSlider.set(value);
            console.log(`Number of Servers input changed to: ${numServersInput.value}`);
            debouncedCalculateEarnings();
        }
    });
    runningCostsInput.addEventListener('input', () => {
        const value = parseFloat(runningCostsInput.value);
        if (!isNaN(value) && value >= 0 && runningCostsSlider) {
            runningCostsSlider.set(value);
            debouncedCalculateEarnings();
        }
    });
    nodeStakeInput.addEventListener('input', () => {
        const value = parseInt(nodeStakeInput.value);
        if (!isNaN(value) && value >= 2400 && value <= 100000 && nodeStakeSlider) {
            nodeStakeSlider.set(value);
            debouncedCalculateEarnings();
        }
    });
    customProbabilityInput.addEventListener('input', () => {
        const value = parseFloat(customProbabilityInput.value);
        if (!isNaN(value) && value >= 0 && value <= 100 && customProbability?.checked && customProbabilitySlider) {
            customProbabilitySlider.set(value);
            debouncedCalculateEarnings();
        }
    });
    weeklyValidationsInput.addEventListener('input', () => {
        const value = parseFloat(weeklyValidationsInput.value);
        if (!isNaN(value) && value >= 0 && value <= 7 && weeklyValidations?.checked && weeklyValidationsSlider) {
            weeklyValidationsSlider.set(value);
            debouncedCalculateEarnings();
        }
    });

    // Add change listeners
    nodePriceCurrency.addEventListener('change', debouncedCalculateEarnings);
    runningCostsCurrency.addEventListener('change', debouncedCalculateEarnings);
    if (probabilityForm) {
        probabilityForm.addEventListener('change', (e) => {
            console.log('Probability form changed, target:', e.target.id);
            toggleProbabilityInputs();
            debouncedCalculateEarnings();
        });
    } else {
        console.warn('Probability form not found, using individual radio listeners');
        if (useCommunityProbability) {
            useCommunityProbability.addEventListener('change', () => {
                console.log('useCommunityProbability changed');
                toggleProbabilityInputs();
                debouncedCalculateEarnings();
            });
        }
        if (customProbability) {
            customProbability.addEventListener('change', () => {
                console.log('customProbability changed');
                toggleProbabilityInputs();
                debouncedCalculateEarnings();
            });
        }
        if (weeklyValidations) {
            weeklyValidations.addEventListener('change', () => {
                console.log('weeklyValidations changed');
                toggleProbabilityInputs();
                debouncedCalculateEarnings();
            });
        }
    }

    // Toggle probability inputs
    function toggleProbabilityInputs() {
        console.log('toggleProbabilityInputs called');
        console.log('Radio states:', {
            useCommunityProbability: useCommunityProbability?.checked,
            customProbability: customProbability?.checked,
            weeklyValidations: weeklyValidations?.checked
        });
        const customInput = customProbabilityInput;
        const weeklyInput = weeklyValidationsInput;
        const customSlider = document.getElementById('custom-probability-slider');
        const weeklySlider = document.getElementById('weekly-validations-slider');
        if (customInput && weeklyInput && customSlider && weeklySlider) {
            customInput.classList.add('hidden');
            weeklyInput.classList.add('hidden');
            customSlider.classList.add('hidden');
            weeklySlider.classList.add('hidden');
            if (customProbability?.checked) {
                console.log('Showing Custom Probability input and slider');
                customInput.classList.remove('hidden');
                customSlider.classList.remove('hidden');
            } else if (weeklyValidations?.checked) {
                console.log('Showing Weekly Validations input and slider');
                weeklyInput.classList.remove('hidden');
                weeklySlider.classList.remove('hidden');
            }
        } else {
            console.error('Missing probability inputs/sliders:', {
                customInput: !!customInput,
                weeklyInput: !!weeklyInput,
                customSlider: !!customSlider,
                weeklySlider: !!weeklySlider
            });
            errorMessage.textContent = 'Missing probability inputs or sliders';
            errorMessage.classList.remove('hidden');
        }
    }

    // Cache SHM price with timestamp
    function cacheShmPrice(shmPrice) {
        localStorage.setItem('shmPrice', JSON.stringify({
            prices: shmPrice,
            timestamp: Date.now()
        }));
        console.log('Cached SHM price:', shmPrice);
    }

    // Retrieve cached SHM price
    function getCachedShmPrice() {
        const cached = localStorage.getItem('shmPrice');
        if (cached) {
            const { prices, timestamp } = JSON.parse(cached);
            const age = (Date.now() - timestamp) / 1000 / 60;
            if (age < 10) {
                console.log('Using cached SHM price:', prices);
                return prices;
            }
        }
        return null;
    }

    // Fetch Config
    async function fetchConfig(bustCache = false) {
        try {
            const url = bustCache ? `assets/config.json?t=${new Date().getTime()}` : 'assets/config.json';
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Failed to fetch config.json: ${response.status}`);
            const data = await response.json();
            console.log('Fetched config:', data);
            return {
                probability: data.probability || 0.55,
                reward: data.reward || 40
            };
        } catch (error) {
            console.error('Error fetching config:', error);
            errorMessage.textContent = 'Failed to fetch config, using default values';
            errorMessage.classList.remove('hidden');
            return { probability: 0.55, reward: 40 };
        }
    }

    // Fetch SHM Price
    async function fetchShmPrice(bustCache = false) {
        if (!bustCache) {
            const cachedPrice = getCachedShmPrice();
            if (cachedPrice) return cachedPrice;
        }
        try {
            const url = bustCache
                ? `https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur,inr&t=${new Date().getTime()}`
                : 'https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd,eur,inr';
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (!data.shardeum) throw new Error('No SHM price data');
            const shmPrice = {
                usd: data.shardeum.usd || 0,
                eur: data.shardeum.eur || 0,
                inr: data.shardeum.inr || 0
            };
            console.log('Fetched SHM price:', shmPrice);
            cacheShmPrice(shmPrice);
            errorMessage.textContent = '';
            errorMessage.classList.add('hidden');
            return shmPrice;
        } catch (error) {
            console.error('Error fetching SHM price:', error);
            const cachedPrice = getCachedShmPrice();
            if (cachedPrice) {
                errorMessage.textContent = `Failed to fetch SHM price (${error.message}), using cached price`;
                errorMessage.classList.remove('hidden');
                return cachedPrice;
            }
            errorMessage.textContent = `Failed to fetch SHM price (${error.message}), using default price (0)`;
            errorMessage.classList.remove('hidden');
            return { usd: 0, eur: 0, inr: 0 };
        }
    }

    // Calculate Earnings
    async function calculateEarnings(bustCache = false) {
        loadingIndicator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        console.log("Calculating earnings with inputs: ", {
            numServers: numServersInput.value,
            runningCosts: runningCostsInput.value,
            nodeStake: nodeStakeInput.value,
            nodePrice: nodePriceInput.value,
            probabilityOption: document.querySelector('input[name="probability-option"]:checked')?.value,
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
        if (useCommunityProbability?.checked) {
            probability = config.probability;
        } else if (customProbability?.checked) {
            probability = (parseFloat(customProbabilityInput.value) || 0) / 100;
        } else if (weeklyValidations?.checked) {
            const weeklyValidationsValue = parseFloat(weeklyValidationsInput.value) || 0;
            probability = weeklyValidationsValue / 7;
        } else {
            probability = config.probability;
            console.warn('No probability option selected, using default:', probability);
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

        // Convert to selected currency
        let monthlyRewardsSelected, weeklyRewardsSelected, monthlyNodesCostSelected, dailyNodesCostSelected, annualNodesCostSelected, netAnnualProfitSelected;
        let currencySymbol = runningCurrency === 'USD' ? '$' : runningCurrency === 'EUR' ? '€' : runningCurrency === 'INR' ? '₹' : 'SHM';
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
        }

        // Calculate ROI, APY, Daily Return
        const annualRunningCostsShm = runningCostsShm * 12 * numServers;
        const monthlyNodesCostShm = runningCostsShm * numServers;
        const dailyNodesCostShm = Kernighan
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

        // Show results
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

    // Event Listener for Calculate Button
    calculateBtn.addEventListener('click', () => {
        console.log('Calculate button clicked, forcing cache refresh');
        localStorage.removeItem('shmPrice');
        calculateEarnings(true);
    });

    // Fetch on page load
    Promise.all([fetchShmPrice(), fetchConfig()]).then(([shmPrice, config]) => {
        shmPriceSpan.textContent = `$${shmPrice.usd.toFixed(2)} / €${shmPrice.eur.toFixed(2)} / ₹${shmPrice.inr.toFixed(2)}`;
        probabilitySpan.textContent = (config.probability * 100).toFixed(1);
        rewardSpan.textContent = config.reward.toFixed(0);
        if (customProbabilityInput) customProbabilityInput.value = (config.probability * 100).toFixed(1);
        if (weeklyValidationsInput) weeklyValidationsInput.value = (config.probability * 7).toFixed(1);
        if (customProbabilitySlider) customProbabilitySlider.set(config.probability * 100);
        if (weeklyValidationsSlider) weeklyValidationsSlider.set(config.probability * 7);
        calculateEarnings();
    });

    // Initialize probability inputs
    toggleProbabilityInputs();
});