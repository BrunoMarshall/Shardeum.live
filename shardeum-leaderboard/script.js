document.addEventListener('DOMContentLoaded', () => {
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const periodSelector = document.getElementById('period-selector');
    const backendUrl = 'https://leaderboard.shardeum.live:3000';

    // Blinking green light
    const indicator = document.createElement('span');
    indicator.id = 'status-indicator';
    setInterval(() => {
        indicator.style.backgroundColor = indicator.style.backgroundColor === 'green' ? 'transparent' : 'green';
    }, 500);

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
            displayValidators(validators, period);
        } catch (error) {
            console.error('Error fetching validators:', error);
            leaderboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
            loserboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
        }
    }

    function displayValidators(validators, period) {
        console.log('Displaying validators:', validators);
        const sortedValidators = [...validators].sort((a, b) => {
            const countA = a[period + 'Count'] || 0;
            const countB = b[period + 'Count'] || 0;
            return countB - countA;
        });

        const leaderboard = sortedValidators.slice(0, 10);
        leaderboardDiv.innerHTML = leaderboard.length ?
            `<h2 class="title">Leaderboard (Most Active) <span id="status-indicator"></span></h2>${leaderboard.map((v, index) => createValidatorCard(v, period + 'Count', index + 1)).join('')}` :
            '<p class="text-gray-600">No validators available for this period.</p>';

        const loserboard = sortedValidators.slice(-10).reverse();
        loserboardDiv.innerHTML = loserboard.length ?
            `<h2 class="title">Loserboard (Least Active)</h2>${loserboard.map((v, index) => createValidatorCard(v, period + 'Count', sortedValidators.length - index)).join('')}` :
            '<p class="text-gray-600">No validators available for this period.</p>';
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

    periodSelector.addEventListener('change', () => {
        console.log('Period changed to:', periodSelector.value);
        fetchValidators(periodSelector.value);
    });
    fetchValidators('weekly');
});