document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded');
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const periodSelector = document.getElementById('period-selector');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const loserboardBtn = document.getElementById('loserboard-btn');
    const backendUrl = 'https://leaderboard.shardeum.live';
    let currentValidators = [];
    let currentStandbyNodes = [];
    let currentPeriod = 'weekly';

    function createIndicator() {
        console.log('Creating indicator with CSS animation');
        const indicator = document.createElement('span');
        indicator.id = 'status-indicator';
        indicator.style.cssText = `
            width: 10px;
            height: 10px;
            background-color: green;
            border-radius: 50%;
            margin-left: 0.5rem;
            display: inline-block;
            vertical-align: middle;
            animation: blink 1s infinite;
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes blink {
                0%, 50% { background-color: green; }
                51%, 100% { background-color: transparent; }
            }
        `;
        document.head.appendChild(styleSheet);
        return indicator;
    }

    function removeIndicator() {
        const indicator = document.getElementById('status-indicator');
        if (indicator) indicator.remove();
    }

    // Convert hexadecimal wei to SHM (1 SHM = 10^18 wei)
    function formatSHM(value, decimals = 10) {
        try {
            if (!value || value === '0' || value === '' || value === null || value === undefined) {
                console.log(`formatSHM: Invalid or zero value: ${value}`);
                return '0 SHM';
            }
            const num = parseInt(value, 16); // Parse hex string to decimal
            const shm = num / 1e18; // Divide by 10^18 for SHM
            const result = `${shm.toFixed(decimals)} SHM`;
            console.log(`formatSHM: Input: ${value}, Output: ${result}`);
            return result;
        } catch (error) {
            console.error(`formatSHM: Error formatting value: ${value}`, error);
            return '0 SHM';
        }
    }

    // Convert timestamp to readable UTC date
    function formatTimestamp(timestamp) {
        if (!timestamp || timestamp === 0 || timestamp === '0' || timestamp === null) {
            console.log(`formatTimestamp: Invalid timestamp: ${timestamp}`);
            return '0'; // Return '0' for null or invalid
        }
        try {
            const date = new Date(Number(timestamp) * 1000);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of today in UTC
            const isToday = date.toDateString() === today.toDateString();
            if (isToday) {
                const result = date.toLocaleString('en-US', {
                    timeZone: 'UTC',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).replace(',', '') + ' UTC';
                console.log(`formatTimestamp: Input: ${timestamp}, Output: Today at ${result}`);
                return `Today at ${result}`;
            } else {
                const result = date.toLocaleString('en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    timeZone: 'UTC'
                }).replace(',', '');
                console.log(`formatTimestamp: Input: ${timestamp}, Output: ${result}`);
                return result;
            }
        } catch (error) {
            console.error(`formatTimestamp: Error formatting timestamp: ${timestamp}`, error);
            return '0';
        }
    }

    async function fetchValidators(period) {
        try {
            console.log(`fetchValidators: Fetching validators for period: ${period}`);
            const response = await fetch(`${backendUrl}/api/validators?period=${period}`, {
                mode: 'cors',
                headers: { 'User-Agent': 'Shardeum-Leaderboard/1.0' }
            });
            if (!response.ok) throw new Error(`fetchValidators: Network response was not ok: ${response.status}`);
            const validators = await response.json();
            console.log(`fetchValidators: Validators received from backend:`, validators.map(v => ({
                address: v.address,
                foundation: v.foundation,
                [`${period}count`]: v[`${period}count`],
                status: v.status,
                stake_lock: v.stake_lock
            })));

            if (!Array.isArray(validators) || validators.length === 0) {
                throw new Error('fetchValidators: No validators returned or invalid data format');
            }
            currentValidators = [...validators].sort((a, b) => {
                const countA = a[`${period}count`] || 0;
                const countB = b[`${period}count`] || 0;
                return countB - countA;
            });
            currentPeriod = period;
            showLeaderboard();
        } catch (error) {
            console.error('fetchValidators: Error fetching validators:', error);
            leaderboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
            loserboardDiv.innerHTML = '';
        }
    }

    async function fetchStandbyNodes() {
        try {
            console.log('fetchStandbyNodes: Fetching standby nodes');
            const response = await fetch(`${backendUrl}/api/standby-nodes`, {
                mode: 'cors',
                headers: { 'User-Agent': 'Shardeum-Leaderboard/1.0' }
            });
            if (!response.ok) throw new Error(`fetchStandbyNodes: Network response was not ok: ${response.status}`);
            const standbyNodes = await response.json();
            console.log('fetchStandbyNodes: Standby nodes received:', standbyNodes);
            if (!Array.isArray(standbyNodes) || standbyNodes.length === 0) {
                throw new Error('fetchStandbyNodes: No standby nodes returned or invalid data format');
            }
            currentStandbyNodes = [...standbyNodes].sort((a, b) => b.standby_hours - a.standby_hours);
            showLoserboard();
        } catch (error) {
            console.error('fetchStandbyNodes: Error fetching standby nodes:', error);
            loserboardDiv.innerHTML = '<p class="text-red-600">Error loading loserboard. Please try again later.</p>';
            leaderboardDiv.innerHTML = '';
        }
    }

    function showLeaderboard() {
        const communityValidators = currentValidators.filter(v => !v.foundation);
        const limit = Math.min(2000, communityValidators.length);
        const leaderboard = communityValidators.slice(0, limit);

        console.log('showLeaderboard: Showing leaderboard with', leaderboard.length, 'community validators');

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
            const card = createValidatorCard(v, `${currentPeriod}count`, index + 1);
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
        const limit = Math.min(2000, currentStandbyNodes.length);
        const loserboard = currentStandbyNodes.slice(0, limit);

        console.log('showLoserboard: Showing loserboard with', loserboard.length, 'standby nodes');

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
        console.log(`createValidatorCard: Creating card for validator ${validator.address}:`, {
            [countKey]: validator[countKey],
            status: validator.status,
            stake_lock: validator.stake_lock,
            formatted_stake: formatSHM(validator.stake_lock, 0),
            reward: validator.reward,
            formatted_reward: formatSHM(validator.reward, 1),
            nominator: validator.nominator,
            reward_start_time: validator.reward_start_time,
            formatted_start_time: formatTimestamp(validator.reward_start_time),
            reward_end_time: validator.reward_end_time,
            formatted_end_time: formatTimestamp(validator.reward_end_time),
            penalty: validator.penalty
        });

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
        const nominator = validator.nominator || 'N/A';
        const truncatedNominator = nominator.length > 10 ? `${nominator.slice(0, 5)}…${nominator.slice(-5)}` : nominator;
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

        const leftContainer = document.createElement('div');
        leftContainer.className = 'left-container flex flex-col';
        const nameSpan = document.createElement('span');
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = 'Name: ';
        nameSpan.appendChild(nameStrong);
        nameSpan.appendChild(document.createTextNode(escapedAlias));
        leftContainer.appendChild(nameSpan);

        const addressSpan = document.createElement('span');
        const addressStrong = document.createElement('strong');
        addressStrong.textContent = 'Address: ';
        addressSpan.appendChild(addressStrong);
        addressSpan.appendChild(document.createTextNode(truncatedAddress));
        leftContainer.appendChild(addressSpan);

        const countSpan = document.createElement('span');
        const countStrong = document.createElement('strong');
        countStrong.textContent = 'Number of Activations: ';
        countSpan.appendChild(countStrong);
        countSpan.appendChild(document.createTextNode(validator[countKey] || 0));
        leftContainer.appendChild(countSpan);

        card.appendChild(leftContainer);

        const rightContainer = document.createElement('div');
        rightContainer.className = 'right-container flex flex-col';
        const statusSpan = document.createElement('span');
        const statusStrong = document.createElement('strong');
        statusStrong.textContent = 'Node Status: ';
        statusSpan.appendChild(statusStrong);
        statusSpan.appendChild(document.createTextNode(validator.status || 'N/A'));
        rightContainer.appendChild(statusSpan);

        const nominatorSpan = document.createElement('span');
        const nominatorStrong = document.createElement('strong');
        nominatorStrong.textContent = 'Nominator: ';
        nominatorSpan.appendChild(nominatorStrong);
        nominatorSpan.appendChild(document.createTextNode(truncatedNominator));
        rightContainer.appendChild(nominatorSpan);

        const rewardSpan = document.createElement('span');
        const rewardStrong = document.createElement('strong');
        rewardStrong.textContent = 'Current Reward: ';
        rewardSpan.appendChild(rewardStrong);
        rewardSpan.appendChild(document.createTextNode(formatSHM(validator.reward, 1)));
        rightContainer.appendChild(rewardSpan);

        const stakeSpan = document.createElement('span');
        const stakeStrong = document.createElement('strong');
        stakeStrong.textContent = 'Staked Amount: ';
        stakeSpan.appendChild(stakeStrong);
        stakeSpan.appendChild(document.createTextNode(formatSHM(validator.stake_lock, 0)));
        rightContainer.appendChild(stakeSpan);

        const rewardStartSpan = document.createElement('span');
        const rewardStartStrong = document.createElement('strong');
        rewardStartStrong.textContent = 'Reward Start: ';
        rewardStartSpan.appendChild(rewardStartStrong);
        rewardStartSpan.appendChild(document.createTextNode(formatTimestamp(validator.reward_start_time)));
        rightContainer.appendChild(rewardStartSpan);

        const rewardEndSpan = document.createElement('span');
        const rewardEndStrong = document.createElement('strong');
        rewardEndStrong.textContent = 'Reward End: ';
        rewardEndSpan.appendChild(rewardEndStrong);
        rewardEndSpan.appendChild(document.createTextNode(formatTimestamp(validator.reward_end_time)));
        rightContainer.appendChild(rewardEndSpan);

        const penaltySpan = document.createElement('span');
        const penaltyStrong = document.createElement('strong');
        penaltyStrong.textContent = 'Penalty: ';
        penaltySpan.appendChild(penaltyStrong);
        penaltySpan.appendChild(document.createTextNode(formatSHM(validator.penalty, 0)));
        rightContainer.appendChild(penaltySpan);

        card.appendChild(rightContainer);

        const nodeInfo = document.createElement('div');
        nodeInfo.className = 'node-info flex justify-end';
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
            div.textContent = text || '';
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
        console.log('periodSelector: Period changed to:', periodSelector.value);
        fetchValidators(periodSelector.value);
    });

    leaderboardBtn.addEventListener('click', () => {
        console.log('leaderboardBtn: Clicked');
        if (currentValidators.length > 0) {
            showLeaderboard();
        } else {
            fetchValidators(currentPeriod);
        }
    });

    loserboardBtn.addEventListener('click', () => {
        console.log('loserboardBtn: Clicked');
        if (currentStandbyNodes.length > 0) {
            showLoserboard();
        } else {
            fetchStandbyNodes();
        }
    });

    fetchValidators('weekly');
    fetchStandbyNodes();
});