document.addEventListener('DOMContentLoaded', () => {
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const periodSelector = document.getElementById('period-selector');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const loserboardBtn = document.getElementById('loserboard-btn');
    const backendUrl = 'https://leaderboard.shardeum.live';
    let currentValidators = [];
    let currentStandbyNodes = [];
    let currentPeriod = 'weekly';

    // Blinking green light
    function createIndicator() {
        const indicator = document.createElement('span');
        indicator.id = 'status-indicator';
        setInterval(() => {
            indicator.style.backgroundColor = indicator.style.backgroundColor === 'green' ? 'transparent' : 'green';
        }, 500);
        indicator.style.cssText = 'width: 10px; height: 10px; background-color: green; border-radius: 50%; margin-left: 0.5rem; display: inline-block; vertical-align: middle; line-height: 1;';
        return indicator;
    }

    function removeIndicator() {
        const indicator = document.getElementById('status-indicator');
        if (indicator) indicator.remove();
    }

    async function fetchValidators(period) {
        try {
            console.log(`Fetching validators for period: ${period}`);
            const response = await fetch(`${backendUrl}/api/validators?period=${period}`, {
                mode: 'cors'
            });
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const validators = await response.json();
            console.log('Validators received:', validators);
            if (!Array.isArray(validators) || validators.length === 0) {
                throw new Error('No validators returned or invalid data format');
            }
            currentValidators = [...validators].sort((a, b) => {
                const countA = a[period + 'Count'] || 0;
                const countB = b[period + 'Count'] || 0;
                return countB - countA; // Descending for leaderboard
            });
            currentPeriod = period;
            showLeaderboard();
        } catch (error) {
            console.error('Error fetching validators:', error);
            leaderboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
            loserboardDiv.innerHTML = '';
        }
    }

    async function fetchStandbyNodes() {
        try {
            console.log('Fetching standby nodes');
            const response = await fetch(`${backendUrl}/api/standby-nodes`, {
                mode: 'cors'
            });
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const standbyNodes = await response.json();
            console.log('Standby nodes received:', standbyNodes);
            if (!Array.isArray(standbyNodes) || standbyNodes.length === 0) {
                throw new Error('No standby nodes returned or invalid data format');
            }
            currentStandbyNodes = [...standbyNodes].sort((a, b) => b.standby_hours - a.standby_hours); // Descending by standby time
            showLoserboard();
        } catch (error) {
            console.error('Error fetching standby nodes:', error);
            loserboardDiv.innerHTML = '<p class="text-red-600">Error loading loserboard. Please try again later.</p>';
            leaderboardDiv.innerHTML = '';
        }
    }

    function showLeaderboard() {
        const limit = Math.min(500, currentValidators.length);
        const leaderboard = currentValidators.slice(0, limit);
        leaderboardDiv.innerHTML = leaderboard.length ?
            `${leaderboard.map((v, index) => createValidatorCard(v, currentPeriod + 'Count', index + 1)).join('')}` :
            '<p class="text-gray-600">No validators available for this period.</p>';
        loserboardDiv.innerHTML = '';
        removeIndicator();
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.appendChild(createIndicator());
        leaderboardBtn.classList.add('bg-blue-600', 'text-white');
        leaderboardBtn.classList.remove('bg-gray-200', 'text-gray-700');
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.classList.add('bg-gray-200', 'text-gray-700');
        loserboardBtn.classList.remove('bg-blue-600', 'text-white');
    }

    function showLoserboard() {
        const limit = Math.min(500, currentStandbyNodes.length);
        const loserboard = currentStandbyNodes.slice(0, limit);
        loserboardDiv.innerHTML = loserboard.length ?
            `${loserboard.map((n, index) => createStandbyNodeCard(n, index + 1)).join('')}` :
            '<p class="text-gray-600">No standby nodes available.</p>';
        leaderboardDiv.innerHTML = '';
        removeIndicator();
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.classList.add('bg-gray-200', 'text-gray-700');
        leaderboardBtn.classList.remove('bg-blue-600', 'text-white');
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.appendChild(createIndicator());
        loserboardBtn.classList.add('bg-blue-600', 'text-white');
        loserboardBtn.classList.remove('bg-gray-200', 'text-gray-700');
    }

    function createValidatorCard(validator, countKey, rank) {
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        const avatar = validator.foundation ? 'foundation_validator.png' : validator.avatar || 'default-avatar.png';
        const nodeType = validator.foundation ? 'Foundation Node' : 'Community Node';
        const ipAddress = validator.identifier || 'N/A';
        const address = validator.address || 'N/A';
        const truncatedAddress = address.length > 10 ? `${address.slice(0, 5)}…${address.slice(-5)}` : address;
        const escapedAlias = escapeHtml(validator.alias || 'Unknown');
        return `
            <a href="https://explorer.shardeum.org/account/${encodeURIComponent(address)}" target="_blank" class="validator-card ${validator.foundation ? 'foundation-node' : 'community-node'}">
                <span class="rank">${rank}</span>
                <img src="assets/${avatar}" alt="${escapedAlias}" class="w-12 h-12">
                <div class="text-container">
                    <span><strong>Name:</strong> ${escapedAlias}</span>
                    <span><strong>Address:</strong> ${escapeHtml(truncatedAddress)}</span>
                    <span><strong>Number of Activations:</strong> ${validator[countKey] || 0}</span>
                </div>
                <div class="node-info">
                    <span><strong>${nodeType}</strong></span>
                    <span><strong>IP address:</strong> ${escapeHtml(ipAddress)}</span>
                </div>
            </a>
        `;
    }

    function createStandbyNodeCard(node, rank) {
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        const ipAddress = node.identifier || 'N/A';
        const address = node.address || 'N/A';
        const truncatedAddress = address.length > 10 ? `${address.slice(0, 5)}…${address.slice(-5)}` : address;
        return `
            <a href="https://explorer.shardeum.org/account/${encodeURIComponent(address)}" target="_blank" class="validator-card community-node">
                <span class="rank">${rank}</span>
                <img src="assets/default-avatar.png" alt="Standby Node" class="w-12 h-12">
                <div class="text-container">
                    <span><strong>Name:</strong> Unknown</span>
                    <span><strong>Address:</strong> ${escapeHtml(truncatedAddress)}</span>
                    <span><strong>Standby Time:</strong> ${node.standby_hours.toFixed(2)} hours (${node.standby_days} days)</span>
                </div>
                <div class="node-info">
                    <span><strong>Community Node</strong></span>
                    <span><strong>IP address:</strong> ${escapeHtml(ipAddress)}</span>
                </div>
            </a>
        `;
    }

    periodSelector.addEventListener('change', () => {
        console.log('Period changed to:', periodSelector.value);
        fetchValidators(periodSelector.value);
    });

    leaderboardBtn.addEventListener('click', () => {
        if (currentValidators.length > 0) {
            showLeaderboard();
        } else {
            fetchValidators(currentPeriod);
        }
    });

    loserboardBtn.addEventListener('click', () => {
        if (currentStandbyNodes.length > 0) {
            showLoserboard();
        } else {
            fetchStandbyNodes();
        }
    });

    fetchValidators('weekly');
    fetchStandbyNodes();
});