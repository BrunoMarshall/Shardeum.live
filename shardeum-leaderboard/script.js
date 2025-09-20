document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded');
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const loserboardBtn = document.getElementById('loserboard-btn');
    const selectionContainer = document.getElementById('selection-container');
    const loadingBar = document.getElementById('loading-bar');
    const backendUrl = 'https://leaderboard.shardeum.live';
    let currentValidators = [];
    let currentStandbyNodes = [];
    let currentPeriod = 'weekly';
    let currentFilter = 'default';
    let activeTab = null;
    let searchQuery = '';

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

    function showLoadingBar() {
        loadingBar.classList.remove('hidden');
        const progress = loadingBar.querySelector('div');
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                width = 0; // Reset to 0 to loop
            } else {
                width += 2; // Increment by 2% every 160ms to complete in ~8 seconds
            }
            progress.style.width = `${width}%`;
        }, 160);
        return interval;
    }

    function hideLoadingBar(interval) {
        clearInterval(interval);
        loadingBar.classList.add('hidden');
        loadingBar.querySelector('div').style.width = '0%';
    }

    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function formatSHM(value, decimals = 10) {
        try {
            if (!value || value === '0' || value === '' || value === null || value === undefined) {
                console.log(`formatSHM: Invalid or zero value: ${value}`);
                return '0 SHM';
            }
            const num = parseInt(value, 16);
            const shm = num / 1e18;
            const result = `${shm.toFixed(decimals)} SHM`;
            console.log(`formatSHM: Input: ${value}, Output: ${result}`);
            return result;
        } catch (error) {
            console.error(`formatSHM: Error formatting value: ${value}`, error);
            return '0 SHM';
        }
    }

    function parseSHM(value) {
        try {
            if (!value || value === '0' || value === '' || value === null || value === undefined) {
                return 0;
            }
            return parseInt(value, 16) / 1e18;
        } catch (error) {
            console.error(`parseSHM: Error parsing value: ${value}`, error);
            return 0;
        }
    }

    function formatTimestamp(timestamp) {
        if (!timestamp || timestamp === 0 || timestamp === '0' || timestamp === null) {
            console.log(`formatTimestamp: Invalid timestamp: ${timestamp}`);
            return 'N/A';
        }
        try {
            const date = new Date(Number(timestamp) * 1000);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = date.toDateString() === today.toDateString();

            const utcOptions = {
                timeZone: 'UTC',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            const utcTime = date.toLocaleString('en-US', utcOptions).replace(',', '');

            const cetOptions = {
                timeZone: 'Europe/Berlin',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            const cetTime = date.toLocaleString('en-US', cetOptions).replace(',', '');

            const datePrefix = isToday
                ? 'Today'
                : date.toLocaleString('en-US', {
                      dateStyle: 'short',
                      timeZone: 'UTC'
                  }).replace(',', '');

            const result = `${datePrefix} at ${utcTime} UTC (${cetTime} CET)`;
            console.log(`formatTimestamp: Input: ${timestamp}, Output: ${result}`);
            return result;
        } catch (error) {
            console.error(`formatTimestamp: Error formatting timestamp: ${timestamp}`, error);
            return 'N/A';
        }
    }

    async function fetchValidators(period) {
        const loadingInterval = showLoadingBar();
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
                [`${period}_count`]: v[`${period}_count`],
                status: v.status,
                stake_lock: v.stake_lock
            })));

            if (!Array.isArray(validators) || validators.length === 0) {
                throw new Error('fetchValidators: No validators returned or invalid data format');
            }

            // Fetch activation days for each validator
            for (const validator of validators) {
                try {
                    const response = await fetch(`${backendUrl}/api/validator-increments/${encodeURIComponent(validator.address)}/monthly?period=${period}`, {
                        mode: 'cors',
                        headers: { 'User-Agent': 'Shardeum-Leaderboard/1.0' }
                    });
                    if (response.ok) {
                        validator.activationDays = await response.json();
                        console.log(`Fetched activation days for validator ${validator.address} (period: ${period}):`, validator.activationDays);
                    } else {
                        validator.activationDays = [];
                        console.warn(`Failed to fetch activation days for validator ${validator.address} (period: ${period}): ${response.status}`);
                    }
                } catch (error) {
                    validator.activationDays = [];
                    console.error(`Error fetching activation days for validator ${validator.address} (period: ${period}):`, error.message);
                }
            }

            currentValidators = [...validators];
            currentPeriod = period;
            showLeaderboard();
        } catch (error) {
            console.error('fetchValidators: Error fetching validators:', error);
            leaderboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
            loserboardDiv.innerHTML = '';
        } finally {
            hideLoadingBar(loadingInterval);
        }
    }

    async function fetchStandbyNodes() {
        const loadingInterval = showLoadingBar();
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
                console.warn('fetchStandbyNodes: No standby nodes returned or invalid data format');
                currentStandbyNodes = [];
                showLoserboard();
                return;
            }
            currentStandbyNodes = [...standbyNodes].sort((a, b) => b.standby_hours - a.standby_hours);
            showLoserboard();
        } catch (error) {
            console.error('fetchStandbyNodes: Error fetching standby nodes:', error);
            loserboardDiv.innerHTML = '<p class="text-red-600">Error loading loserboard. Please try again later.</p>';
            leaderboardDiv.innerHTML = '';
        } finally {
            hideLoadingBar(loadingInterval);
        }
    }

    function createMonthCalendar(activationDays) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const monthName = now.toLocaleString('en-US', { month: 'long' });
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

        const calendar = document.createElement('div');
        calendar.className = 'month-calendar';

        const title = document.createElement('div');
        title.className = 'calendar-title';
        title.textContent = `${monthName} ${year}`;
        calendar.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // Add weekday headers
        const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            grid.appendChild(emptyCell);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.classList.add(activationDays.includes(day) ? 'active' : 'inactive');
            dayCell.textContent = day;
            grid.appendChild(dayCell);
        }

        calendar.appendChild(grid);
        return calendar;
    }

    function showLeaderboard() {
        activeTab = 'leaderboard';
        const communityValidators = currentValidators.filter(v => !v.foundation);

        // Assign original ranks before filtering
        let sortedValidators = [...communityValidators];
        if (currentFilter === 'stake') {
            sortedValidators.sort((a, b) => parseSHM(b.stake_lock) - parseSHM(a.stake_lock));
        } else if (currentFilter === 'reward') {
            sortedValidators.sort((a, b) => parseSHM(b.reward) - parseSHM(a.reward));
        } else if (currentFilter === 'status') {
            sortedValidators.sort((a, b) => {
                const statusA = a.status === 'Active' ? 1 : 0;
                const statusB = b.status === 'Active' ? 1 : 0;
                if (statusA !== statusB) return statusB - statusA;
                return (b[`${currentPeriod}_count`] || 0) - (a[`${currentPeriod}_count`] || 0);
            });
        } else {
            sortedValidators.sort((a, b) => (b[`${currentPeriod}_count`] || 0) - (a[`${currentPeriod}_count`] || 0));
        }

        // Create a map of validators to their original ranks
        const rankMap = new Map();
        sortedValidators.forEach((v, index) => {
            rankMap.set(v.address, index + 1);
        });

        // Apply search filter
        const filteredValidators = communityValidators.filter(v => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                (v.alias && v.alias.toLowerCase().includes(query)) ||
                (v.address && v.address.toLowerCase().includes(query)) ||
                (v.nominator && v.nominator.toLowerCase().includes(query)) ||
                (v.identifier && v.identifier.toLowerCase().includes(query))
            );
        });

        const limit = Math.min(2000, filteredValidators.length);
        let leaderboard = filteredValidators.slice(0, limit);

        // Sort filtered validators according to currentFilter
        if (currentFilter === 'stake') {
            leaderboard.sort((a, b) => parseSHM(b.stake_lock) - parseSHM(a.stake_lock));
        } else if (currentFilter === 'reward') {
            leaderboard.sort((a, b) => parseSHM(b.reward) - parseSHM(a.reward));
        } else if (currentFilter === 'status') {
            leaderboard.sort((a, b) => {
                const statusA = a.status === 'Active' ? 1 : 0;
                const statusB = b.status === 'Active' ? 1 : 0;
                if (statusA !== statusB) return statusB - statusA;
                return (b[`${currentPeriod}_count`] || 0) - (a[`${currentPeriod}_count`] || 0);
            });
        } else {
            leaderboard.sort((a, b) => (b[`${currentPeriod}_count`] || 0) - (a[`${currentPeriod}_count`] || 0));
        }

        console.log(`showLeaderboard: Showing leaderboard with ${leaderboard.length} community validators, period: ${currentPeriod}, filter: ${currentFilter}, search: ${searchQuery}`);

        while (leaderboardDiv.firstChild) {
            leaderboardDiv.removeChild(leaderboardDiv.firstChild);
        }
        loserboardDiv.innerHTML = '';

        if (leaderboard.length === 0) {
            const noData = document.createElement('p');
            noData.className = 'text-gray-600 mt-4';
            noData.textContent = searchQuery ? 'No validators match your search.' : 'No community validators available for this period.';
            leaderboardDiv.appendChild(noData);
            removeIndicator();
            leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
            leaderboardBtn.appendChild(createIndicator());
            leaderboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
            loserboardBtn.innerHTML = 'Loserboard (Least Active)';
            loserboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
            return;
        }

        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container mt-4';
        leaderboard.forEach(v => {
            const originalRank = rankMap.get(v.address);
            const card = createValidatorCard(v, `${currentPeriod}_count`, originalRank);
            cardContainer.appendChild(card);
        });
        leaderboardDiv.appendChild(cardContainer);

        removeIndicator();
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.appendChild(createIndicator());
        leaderboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
    }

    function showLoserboard() {
        activeTab = 'loserboard';
        const limit = Math.min(2000, currentStandbyNodes.length);
        const loserboard = currentStandbyNodes.slice(0, limit);

        console.log('showLoserboard: Showing loserboard with', loserboard.length, 'standby nodes');

        while (loserboardDiv.firstChild) {
            loserboardDiv.removeChild(loserboardDiv.firstChild);
        }
        leaderboardDiv.innerHTML = '';
        selectionContainer.innerHTML = '';
        selectionContainer.classList.add('hidden');

        if (loserboard.length === 0) {
            const noData = document.createElement('p');
            noData.className = 'text-gray-600 mt-4';
            noData.textContent = 'No standby nodes available.';
            loserboardDiv.appendChild(noData);
            removeIndicator();
            leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
            leaderboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
            loserboardBtn.innerHTML = 'Loserboard (Least Active)';
            loserboardBtn.appendChild(createIndicator());
            loserboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
            return;
        }

        loserboard.forEach((n, index) => {
            const card = createStandbyNodeCard(n, index + 1);
            loserboardDiv.appendChild(card);
        });

        removeIndicator();
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.appendChild(createIndicator());
        loserboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
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
            penalty: validator.penalty,
            activationDays: validator.activationDays
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
        const escapedAlias = escapeHtml(validator.alias || '');

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

        const statusSpan = document.createElement('span');
        const statusStrong = document.createElement('strong');
        statusStrong.textContent = 'Node Status: ';
        statusSpan.appendChild(statusStrong);
        statusSpan.appendChild(document.createTextNode(validator.status || 'N/A'));
        textContainer.appendChild(statusSpan);

        const nominatorSpan = document.createElement('span');
        const nominatorStrong = document.createElement('strong');
        nominatorStrong.textContent = 'Nominator: ';
        nominatorSpan.appendChild(nominatorStrong);
        nominatorSpan.appendChild(document.createTextNode(truncatedNominator));
        textContainer.appendChild(nominatorSpan);

        const rewardSpan = document.createElement('span');
        const rewardStrong = document.createElement('strong');
        rewardStrong.textContent = 'Current Reward: ';
        rewardSpan.appendChild(rewardStrong);
        rewardSpan.appendChild(document.createTextNode(formatSHM(validator.reward, 1)));
        textContainer.appendChild(rewardSpan);

        const stakeSpan = document.createElement('span');
        const stakeStrong = document.createElement('strong');
        stakeStrong.textContent = 'Staked Amount: ';
        stakeSpan.appendChild(stakeStrong);
        stakeSpan.appendChild(document.createTextNode(formatSHM(validator.stake_lock, 0)));
        textContainer.appendChild(stakeSpan);

        const rewardStartSpan = document.createElement('span');
        const rewardStartStrong = document.createElement('strong');
        rewardStartStrong.textContent = 'Reward Start: ';
        rewardStartSpan.appendChild(rewardStartStrong);
        rewardStartSpan.appendChild(document.createTextNode(formatTimestamp(validator.reward_start_time)));
        textContainer.appendChild(rewardStartSpan);

        const rewardEndSpan = document.createElement('span');
        const rewardEndStrong = document.createElement('strong');
        rewardEndStrong.textContent = 'Reward End: ';
        rewardEndSpan.appendChild(rewardEndStrong);
        rewardEndSpan.appendChild(document.createTextNode(formatTimestamp(validator.reward_end_time)));
        textContainer.appendChild(rewardEndSpan);

        const penaltySpan = document.createElement('span');
        const penaltyStrong = document.createElement('strong');
        penaltyStrong.textContent = 'Penalty: ';
        penaltySpan.appendChild(penaltyStrong);
        penaltySpan.appendChild(document.createTextNode(formatSHM(validator.penalty, 0)));
        textContainer.appendChild(penaltySpan);

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

        // Add monthly calendar
        const calendar = createMonthCalendar(validator.activationDays || []);
        nodeInfo.appendChild(calendar);

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
        nameSpan.appendChild(document.createTextNode('N/A'));
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
        standbySpan.appendChild(document.createTextNode(`${node.standby_hours.toFixed(2)} hours (${node.standby_days.toFixed(0)} days)`));
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

    function showLeaderboardSelection() {
        activeTab = 'leaderboard';
        searchQuery = ''; // Reset search query
        leaderboardDiv.innerHTML = '';
        loserboardDiv.innerHTML = '';
        selectionContainer.classList.remove('hidden');
        selectionContainer.innerHTML = `
            <div class="flex space-x-4">
                <div>
                    <label for="period-selector" class="text-gray-700 font-medium mr-2">Select Period:</label>
                    <select id="period-selector" class="p-2 border rounded">
                        <option value="daily" ${currentPeriod === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${currentPeriod === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="monthly" ${currentPeriod === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="all" ${currentPeriod === 'all' ? 'selected' : ''}>All Time</option>
                    </select>
                </div>
                <div>
                    <label for="filter-selector" class="text-gray-700 font-medium mr-2">Sort By:</label>
                    <select id="filter-selector" class="p-2 border rounded">
                        <option value="default" ${currentFilter === 'default' ? 'selected' : ''}>Default (${currentPeriod} activations)</option>
                        <option value="stake" ${currentFilter === 'stake' ? 'selected' : ''}>Node Stake</option>
                        <option value="reward" ${currentFilter === 'reward' ? 'selected' : ''}>Current Rewards</option>
                        <option value="status" ${currentFilter === 'status' ? 'selected' : ''}>Node Status</option>
                    </select>
                </div>
            </div>
            <div class="search-container">
                <label for="search-input" class="text-gray-700 font-medium mr-2">Search:</label>
                <input type="text" id="search-input" class="search-input" placeholder="Name, Address, Nominator, or IP">
                <button id="clear-search" class="clear-search" title="Clear search">&times;</button>
            </div>
            <button id="show-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Show</button>
        `;
        removeIndicator();
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.appendChild(createIndicator());
        leaderboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';

        const periodSelector = selectionContainer.querySelector('#period-selector');
        const filterSelector = selectionContainer.querySelector('#filter-selector');
        const searchInput = selectionContainer.querySelector('#search-input');
        const clearSearchBtn = selectionContainer.querySelector('#clear-search');
        const showBtn = selectionContainer.querySelector('#show-btn');

        periodSelector.addEventListener('change', () => {
            console.log('periodSelector: Period changed to:', periodSelector.value);
            currentPeriod = periodSelector.value;
            filterSelector.querySelector('option[value="default"]').textContent = `Default (${currentPeriod} activations)`;
        });

        filterSelector.addEventListener('change', () => {
            console.log('filterSelector: Filter changed to:', filterSelector.value);
            currentFilter = filterSelector.value;
            if (currentValidators.length > 0) {
                showLeaderboard();
            }
        });

        let debounceTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                searchQuery = sanitizeInput(searchInput.value.trim());
                console.log('searchInput: Search query updated:', searchQuery);
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
                if (activeTab === 'leaderboard' && currentValidators.length > 0) {
                    showLeaderboard();
                }
            }, 300);
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            console.log('clearSearchBtn: Search query cleared');
            if (activeTab === 'leaderboard' && currentValidators.length > 0) {
                showLeaderboard();
            }
        });

        showBtn.addEventListener('click', () => {
            console.log('showBtn: Fetching validators for period:', currentPeriod);
            fetchValidators(currentPeriod);
        });
    }

    leaderboardBtn.addEventListener('click', () => {
        console.log('leaderboardBtn: Clicked');
        showLeaderboardSelection();
    });

    loserboardBtn.addEventListener('click', () => {
        console.log('loserboardBtn: Clicked');
        searchQuery = ''; // Reset search query when switching to Loserboard
        fetchStandbyNodes();
    });
});