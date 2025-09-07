document.addEventListener('DOMContentLoaded', () => {
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const periodSelector = document.getElementById('period-selector');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const loserboardBtn = document.getElementById('loserboard-btn');
    const backendUrl = 'https://leaderboard.shardeum.live:3000';

    let currentValidators = []; // Store sorted validators for toggling
    let currentPeriod = 'weekly';

    // Blinking green light (appended dynamically when leaderboard is shown)
    function createIndicator() {
        const indicator = document.createElement('span');
        indicator.id = 'status-indicator';
        setInterval(() => {
            indicator.style.backgroundColor = indicator.style.backgroundColor === 'green' ? 'transparent' : 'green';
        }, 500);
        return indicator;
    }

    async function fetchValidators(period) {
        try {
            console.log(`Fetching validators for period: ${period}`);
            const response = await fetch(`${backendUrl}/validators?period=${period}`, {
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
                return countB - countA;
            });
            currentPeriod = period;
            showLeaderboard(); // Default to leaderboard on load/period change
        } catch (error) {
            console.error('Error fetching validators:', error);
            leaderboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
            loserboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
        }
    }

    function showLeaderboard() {
        const limit = Math.min(500, currentValidators.length);
        const note = limit < 500 ? `<p class="text-gray-600 text-sm mb-2">Showing all ${limit} most active validators (fewer than 500 available).</p>` : `<p class="text-gray-600 text-sm mb-2">Showing top 500 most active validators.</p>`;
        const leaderboard = currentValidators.slice(0, limit);
        leaderboardDiv.innerHTML = leaderboard.length ?
            `<h2 class="title">Leaderboard (Most Active) ${document.getElementById('status-indicator') ? '' : ''}<span id="status-indicator"></span></h2>${note}${leaderboard.map((v, index) => createValidatorCard(v, currentPeriod + 'Count', index + 1)).join('')}` :
            '<p class="text-gray-600">No validators available for this period.</p>';
        // Ensure indicator is created if not exists
        if (!document.getElementById('status-indicator')) {
            const indicator = createIndicator();
            const title = leaderboardDiv.querySelector('h2');
            if (title) title.appendChild(indicator);
        }
        loserboardDiv.innerHTML = ''; // Hide loserboard
        leaderboardBtn.classList.add('bg-blue-600', 'text-white');
        leaderboardBtn.classList.remove('bg-gray-200', 'text-gray-700');
        loserboardBtn.classList.add('bg-gray-200', 'text-gray-700');
        loserboardBtn.classList.remove('bg-blue-600', 'text-white');
    }

    function showLoserboard() {
        const limit = Math.min(500, currentValidators.length);
        const note = limit < 500 ? `<p class="text-gray-600 text-sm mb-2">Showing all ${limit} least active validators (fewer than 500 available).</p>` : `<p class="text-gray-600 text-sm mb-2">Showing bottom 500 least active validators.</p>`;
        const loserboard = currentValidators.slice(-limit).reverse();
        loserboardDiv.innerHTML = loserboard.length ?
            `<h2 class="title">Loserboard (Least Active)</h2>${note}${loserboard.map((v, index) => createValidatorCard(v, currentPeriod + 'Count', index + 1)).join('')}` :
            '<p class="text-gray-600">No validators available for this period.</p>';
        leaderboardDiv.innerHTML = ''; // Hide leaderboard
        leaderboardBtn.classList.add('bg-gray-200', 'text-gray-700');
        leaderboardBtn.classList.remove('bg-blue-600', 'text-white');
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
        const publicKey = validator.publicKey || 'N/A';
        const truncatedAddress = publicKey.length > 10 ? `${publicKey.slice(0, 5)}…${publicKey.slice(-5)}` : publicKey;
        const escapedAlias = escapeHtml(validator.alias || 'Unknown');
        return `
            <a href="https://explorer.shardeum.org/account/${encodeURIComponent(publicKey)}" target="_blank" class="validator-card ${validator.foundation ? 'foundation-node' : 'community-node'}">
                <span class="rank">${rank}</span>
                <img src="assets/${avatar}" alt="${escapedAlias}">
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

    // Event listeners
    periodSelector.addEventListener('change', () => {
        console.log('Period changed to:', periodSelector.value);
        fetchValidators(periodSelector.value);
    });

    leaderboardBtn.addEventListener('click', () => {
        if (currentValidators.length > 0) {
            showLeaderboard();
        } else {
            fetchValidators(currentPeriod); // Refetch if no data
        }
    });

    loserboardBtn.addEventListener('click', () => {
        if (currentValidators.length > 0) {
            showLoserboard();
        } else {
            fetchValidators(currentPeriod); // Refetch if no data
        }
    });

    fetchValidators('weekly'); // Initial load
});