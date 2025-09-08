document.addEventListener('DOMContentLoaded', () => {
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const periodSelector = document.getElementById('period-selector');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const loserboardBtn = document.getElementById('loserboard-btn');
    const backendUrl = 'https://leaderboard.shardeum.live';

    let currentValidators = [];
    let currentPeriod = 'weekly';

    // Blinking green indicator
    function createIndicator() {
        const indicator = document.createElement('span');
        indicator.id = 'status-indicator';
        indicator.style.cssText = 'width: 10px; height: 10px; background-color: green; border-radius: 50%; margin-left: 0.5rem; display: inline-block; vertical-align: middle; line-height: 1;';
        setInterval(() => {
            indicator.style.backgroundColor = indicator.style.backgroundColor === 'green' ? 'transparent' : 'green';
        }, 500);
        return indicator;
    }

    function removeIndicator() {
        const indicator = document.getElementById('status-indicator');
        if (indicator) indicator.remove();
    }

    // Fetch validators
    async function fetchValidators(period) {
        console.log(`Fetching validators for period: ${period}`);
        try {
            const response = await fetch(`${backendUrl}/api/validators?period=${period}`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const validators = await response.json();

            currentValidators = [...validators].sort((a, b) => {
                const countA = a[period + 'Count'] || 0;
                const countB = b[period + 'Count'] || 0;
                return countB - countA;
            });
            currentPeriod = period;

            showLeaderboard();
        } catch (error) {
            console.error('Error fetching validators:', error.message);
            leaderboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
            loserboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
        }
    }

    // Fetch standby nodes
    async function fetchStandbyNodes() {
        try {
            const response = await fetch(`${backendUrl}/api/standby-nodes`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching standby nodes:', error.message);
            return [];
        }
    }

    // Create validator card
    function createValidatorCard(validator, countKey, rank) {
        const avatar = validator.foundation ? 'foundation_validator.png' : validator.avatar || 'default-avatar.png';
        const nodeType = validator.foundation ? 'Foundation Node' : 'Community Node';
        const ipAddress = validator.identifier || 'N/A';
        const address = validator.address || 'N/A';
        const truncatedAddress = address.length > 10 ? `${address.slice(0, 5)}…${address.slice(-5)}` : address;
        const escapedAlias = validator.alias || 'Unknown';
        const backgroundClass = validator.foundation ? 'foundation-node' : 'community-node';

        return `
            <a href="https://explorer.shardeum.org/account/${encodeURIComponent(address)}" target="_blank" class="validator-card ${backgroundClass} flex items-center p-4 mb-2 border rounded-lg">
                <span class="rank font-bold mr-4">${rank}</span>
                <img src="assets/${avatar}" alt="${escapedAlias}" class="w-10 h-10 mr-4 rounded-full">
                <div>
                    <p><strong>${escapedAlias}</strong></p>
                    <p>${nodeType}</p>
                    <p>IP: ${ipAddress}</p>
                    <p>Activations: ${validator[countKey] || 0}</p>
                </div>
            </a>
        `;
    }

    // Display leaderboard
    function showLeaderboard() {
        leaderboardDiv.innerHTML = '';
        const topValidators = currentValidators.slice(0, 10);
        topValidators.forEach((validator, index) => {
            leaderboardDiv.insertAdjacentHTML('beforeend', createValidatorCard(validator, currentPeriod + 'Count', index + 1));
        });
        loserboardDiv.innerHTML = '';

        removeIndicator();
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.appendChild(createIndicator());
        leaderboardBtn.classList.add('bg-blue-600', 'text-white');
        leaderboardBtn.classList.remove('bg-gray-200', 'text-gray-700');
        loserboardBtn.classList.add('bg-gray-200', 'text-gray-700');
        loserboardBtn.classList.remove('bg-blue-600', 'text-white');
    }

    // Display loserboard
    async function showLoserboard() {
        loserboardDiv.innerHTML = '';
        const standbyNodes = await fetchStandbyNodes();
        const topStandby = standbyNodes.slice(0, 10);
        topStandby.forEach((node, index) => {
            const avatar = 'default-avatar.png';
            const truncatedAddress = node.address.slice(0, 6) + '...' + node.address.slice(-4);
            loserboardDiv.insertAdjacentHTML('beforeend', `
                <a class="validator-card community-node flex items-center p-4 mb-2 border rounded-lg">
                    <span class="rank font-bold mr-4">${index + 1}</span>
                    <img src="assets/${avatar}" alt="${truncatedAddress}" class="w-10 h-10 mr-4 rounded-full">
                    <div>
                        <p><strong>${truncatedAddress}</strong></p>
                        <p>IP: ${node.identifier}</p>
                        <p>Standby Time: ${node.standby_hours.toFixed(2)} hours (${node.standby_days} days)</p>
                    </div>
                </a>
            `);
        });

        leaderboardDiv.innerHTML = '';

        removeIndicator();
        leaderboardBtn.classList.add('bg-gray-200', 'text-gray-700');
        leaderboardBtn.classList.remove('bg-blue-600', 'text-white');
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.appendChild(createIndicator());
        loserboardBtn.classList.add('bg-blue-600', 'text-white');
        loserboardBtn.classList.remove('bg-gray-200', 'text-gray-700');
    }

    // Event listeners
    periodSelector.addEventListener('change', (event) => {
        currentPeriod = event.target.value;
        fetchValidators(currentPeriod);
    });

    leaderboardBtn.addEventListener('click', () => showLeaderboard());
    loserboardBtn.addEventListener('click', () => showLoserboard());

    // Initial load
    fetchValidators(currentPeriod);
});
