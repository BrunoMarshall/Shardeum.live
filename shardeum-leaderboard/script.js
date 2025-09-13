async function fetchValidators(period) {
    try {
        console.log(`Fetching validators for period: ${period}`);
        const response = await fetch(`${backendUrl}/api/validators?period=${period}`, {
            mode: 'cors'
        });
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
        const validators = await response.json();
        console.log('Validators received:', validators.map(v => ({
            address: v.address,
            foundation: v.foundation,
            weekly: v.weeklycount, // Updated field name
            daily: v.dailycount,   // Adjust based on API
            monthly: v.monthlycount, // Adjust based on API
            all: v.allcount       // Adjust based on API
        })));
        if (!Array.isArray(validators) || validators.length === 0) {
            throw new Error('No validators returned or invalid data format');
        }
        currentValidators = [...validators].sort((a, b) => {
            const countA = a[`${period}count`] || 0; // Updated to use dynamic field name
            const countB = b[`${period}count`] || 0;
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

function createValidatorCard(validator, countKey, rank) {
    console.log(`Validator ${validator.address}: ${countKey} = ${validator[countKey]}`); // Debug log
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
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
    countSpan.appendChild(document.createTextNode(validator[countKey] || 0)); // Uses dynamic countKey
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