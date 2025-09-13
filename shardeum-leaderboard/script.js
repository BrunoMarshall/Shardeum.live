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
        const communityValidators = currentValidators.filter(v => !v.foundation); // Show only community nodes
        const limit = Math.min(2000, communityValidators.length); // Changed to 2000
        const leaderboard = communityValidators.slice(0, limit);
        
        // Clear previous content
        while (leaderboardDiv.firstChild) {
            leaderboardDiv.removeChild(leaderboardDiv.firstChild);
        }
        loserboardDiv.innerHTML = '';

        if (leaderboard.length === 0) {
            const noData = document.createElement('p');
            noData.className = 'text-gray-600';
            noData.textContent = 'No community validators available for this period.';
            leaderboardDiv.appendChild(noData);
            return;
        }

        leaderboard.forEach((v, index) => {
            const card = createValidatorCard(v, currentPeriod + 'Count', index + 1);
            leaderboardDiv.appendChild(card);
        });

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
        const limit = Math.min(2000, currentStandbyNodes.length); // Changed to 2000
        const loserboard = currentStandbyNodes.slice(0, limit);

        // Clear previous content
        while (loserboardDiv.firstChild) {
            loserboardDiv.removeChild(loserboardDiv.firstChild);
        }
        leaderboardDiv.innerHTML = '';

        if (loserboard.length === 0) {
            const noData = document.createElement('p');
            noData.className = 'text-gray-600';
            noData.textContent = 'No standby nodes available.';
            loserboardDiv.appendChild(noData);
            return;
        }

        loserboard.forEach((n, index) => {
            const card = createStandbyNodeCard(n, index + 1);
            loserboardDiv.appendChild(card);
        });

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
        console.log(`Validator ${validator.address}: ${countKey} = ${validator[countKey]}`); // Debug log
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        const avatar = validator.avatar || 'default-avatar.png';
        const nodeType = 'Community Node';
        const ipAddress = validator.identifier || 'N/A';
        const address = validator.address || 'N/A';
        const truncatedAddress = address.length > 10 ? `${address.slice(0, 5)}…${address.slice(-5)}` : address;
        const escapedAlias = escapeHtml(validator.alias || 'Unknown');

        const card = document.createElement('a');
        card.href = `https://explorer.shardeum.org/account/${encodeURIComponent(address)}`;
        card.target = '_blank';
        card.className = 'validator-card community-node';

        const rankSpan = document.createElement('span');
        rankSpan.className = 'rank';
        rankSpan.textContent = rank;
        card.appendChild(rankSpan);

        const img = document.createElement('img');
        img.src = `assets/${avatar}`;
        img.alt = escapedAlias;
        img.className = 'w-12 h-12';
        card.appendChild(img);

        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';

        const nameSpan = document.createElement('span');
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = 'Name: ';
        nameSpan.appendChild(nameStrong);
        nameSpan.appendChild(document.createTextNode(escapedAlias));
        textContainer.appendChild(nameSpan);

        const addressSpan = document.createElement('span');
        const addressStrong = document.createElement('strong');
        addressStrong.textContent = 'Address: ';
        addressSpan.appendChild(addressStrong);
        addressSpan.appendChild(document.createTextNode(truncatedAddress));
        textContainer.appendChild(addressSpan);

        const countSpan = document.createElement('span');
        const countStrong = document.createElement('strong');
        countStrong.textContent = 'Number of Activations: ';
        countSpan.appendChild(countStrong);
        countSpan.appendChild(document.createTextNode(validator[countKey] || 0));
        textContainer.appendChild(countSpan);

        card.appendChild(textContainer);

        const nodeInfo = document.createElement('div');
        nodeInfo.className = 'node-info';

        const typeSpan = document.createElement('span');
        const typeStrong = document.createElement('strong');
        typeStrong.textContent = nodeType;
        typeSpan.appendChild(typeStrong);
        nodeInfo.appendChild(typeSpan);

        const ipSpan = document.createElement('span');
        const ipStrong = document.createElement('strong');
        ipStrong.textContent = 'IP address: ';
        ipSpan.appendChild(ipStrong);
        ipSpan.appendChild(document.createTextNode(escapeHtml(ipAddress)));
        nodeInfo.appendChild(ipSpan);

        card.appendChild(nodeInfo);

        return card;
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

        const card = document.createElement('a');
        card.href = `https://explorer.shardeum.org/account/${encodeURIComponent(address)}`;
        card.target = '_blank';
        card.className = 'validator-card community-node';

        const rankSpan = document.createElement('span');
        rankSpan.className = 'rank';
        rankSpan.textContent = rank;
        card.appendChild(rankSpan);

        const img = document.createElement('img');
        img.src = 'assets/default-avatar.png';
        img.alt = 'Standby Node';
        img.className = 'w-12 h-12';
        card.appendChild(img);

        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';

        const nameSpan = document.createElement('span');
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = 'Name: ';
        nameSpan.appendChild(nameStrong);
        nameSpan.appendChild(document.createTextNode('Unknown'));
        textContainer.appendChild(nameSpan);

        const addressSpan = document.createElement('span');
        const addressStrong = document.createElement('strong');
        addressStrong.textContent = 'Address: ';
        addressSpan.appendChild(addressStrong);
        addressSpan.appendChild(document.createTextNode(truncatedAddress));
        textContainer.appendChild(addressSpan);

        const standbySpan = document.createElement('span');
        const standbyStrong = document.createElement('strong');
        standbyStrong.textContent = 'Standby Time: ';
        standbySpan.appendChild(standbyStrong);
        standbySpan.appendChild(document.createTextNode(`${node.standby_hours.toFixed(2)} hours (${node.standby_days} days)`));
        textContainer.appendChild(standbySpan);

        card.appendChild(textContainer);

        const nodeInfo = document.createElement('div');
        nodeInfo.className = 'node-info';

        const typeSpan = document.createElement('span');
        const typeStrong = document.createElement('strong');
        typeStrong.textContent = 'Community Node';
        typeSpan.appendChild(typeStrong);
        nodeInfo.appendChild(typeSpan);

        const ipSpan = document.createElement('span');
        const ipStrong = document.createElement('strong');
        ipStrong.textContent = 'IP address: ';
        ipSpan.appendChild(ipStrong);
        ipSpan.appendChild(document.createTextNode(escapeHtml(ipAddress)));
        nodeInfo.appendChild(ipSpan);

        card.appendChild(nodeInfo);

        return card;
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