console.log('script.js loaded');

const backendUrl = 'https://leaderboard.shardeum.live';
let currentValidators = [];
let currentStandbyNodes = [];
let currentPeriod = 'weekly';
let currentFilter = 'default';
let searchQuery = '';
let activeTab = 'leaderboard';
let isFetching = false;

const leaderboardDiv = document.getElementById('leaderboard');
const loserboardDiv = document.getElementById('loserboard');
const periodSelect = document.getElementById('period-select');
const showBtn = document.getElementById('show-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const loserboardBtn = document.getElementById('loserboard-btn');
const selectionContainer = document.getElementById('selection-container');
let filterSelect = document.getElementById('filter-select');
let searchInput = document.getElementById('search-input');

// Log missing elements
if (!leaderboardDiv) console.error('leaderboardDiv is null: Element with id="leaderboard" not found');
if (!loserboardDiv) console.error('loserboardDiv is null: Element with id="loserboard" not found');
if (!periodSelect) console.error('periodSelect is null: Element with id="period-select" not found');
if (!showBtn) console.error('showBtn is null: Element with id="show-btn" not found');
if (!leaderboardBtn) console.error('leaderboardBtn is null: Element with id="leaderboard-btn" not found');
if (!loserboardBtn) console.error('loserboardBtn is null: Element with id="loserboard-btn" not found');
if (!selectionContainer) console.error('selectionContainer is null: Element with id="selection-container" not found');
if (!filterSelect) console.warn('filterSelect is null: Element with id="filter-select" not found, will be created dynamically');
if (!searchInput) console.warn('searchInput is null: Element with id="search-input" not found, will be created dynamically');

function createIndicator() {
    console.log('Creating indicator with CSS animation');
    const indicator = document.createElement('span');
    indicator.className = 'ml-2 inline-block h-3 w-3 bg-white rounded-full animate-pulse';
    return indicator;
}

function removeIndicator() {
    const indicators = document.querySelectorAll('.animate-pulse');
    indicators.forEach(indicator => indicator.remove());
}

function showLoadingBar() {
    const loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';
    document.body.appendChild(loadingBar);
    const interval = setInterval(() => {
        loadingBar.style.width = `${Math.min(parseInt(loadingBar.style.width || 0) + 10, 100)}%`;
    }, 100);
    return interval;
}

function hideLoadingBar(interval) {
    clearInterval(interval);
    const loadingBar = document.querySelector('.loading-bar');
    if (loadingBar) {
        loadingBar.style.width = '100%';
        setTimeout(() => loadingBar.remove(), 300);
    }
}

function formatSHM(amount, decimals = 2) {
    if (!amount) return '0 SHM';
    const value = Number(amount) / 1e18;
    return `${value.toFixed(decimals)} SHM`;
}

function parseSHM(amount) {
    if (!amount) return 0;
    return Number(amount) / 1e18;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

function createMonthCalendar(activationDays) {
    console.log('Creating month calendar with activation days:', activationDays);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const calendar = document.createElement('div');
    calendar.className = 'calendar mt-2';
    const monthName = today.toLocaleString('default', { month: 'long' });
    const title = document.createElement('div');
    title.className = 'font-semibold';
    title.textContent = `${monthName} ${year}`;
    calendar.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-1 mt-1';
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'text-center font-medium';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = `text-center p-1 ${activationDays.includes(day) ? 'bg-green-500 text-white rounded' : ''}`;
        dayDiv.textContent = day;
        grid.appendChild(dayDiv);
    }
    calendar.appendChild(grid);
    return calendar;
}

function createValidatorCard(validator, countKey, rank) {
    console.log(`createValidatorCard: Creating card for validator ${validator.address || 'unknown'}:`, {
        [countKey]: validator[countKey],
        status: validator.status,
        stake_lock: validator.stake_lock,
        reward: validator.reward,
        nominator: validator.nominator,
        reward_start_time: validator.reward_start_time,
        reward_end_time: validator.reward_end_time,
        penalty: validator.penalty,
        activationDays: validator.activationDays
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    const avatar = validator.avatar || 'default-avatar.png';
    const nodeType = validator.foundation ? 'Foundation Node' : 'Community Node';
    const ipAddress = validator.identifier || 'N/A';
    const address = validator.address || 'N/A';
    const truncatedAddress = address.length > 10 ? `${address.slice(0, 5)}…${address.slice(-5)}` : address;
    const nominator = validator.nominator || 'N/A';
    const truncatedNominator = nominator.length > 10 ? `${nominator.slice(0, 5)}…${nominator.slice(-5)}` : nominator;
    const escapedAlias = escapeHtml(validator.alias || '');

    const card = document.createElement('a');
    card.href = `https://explorer.shardeum.org/account/${encodeURIComponent(address)}`;
    card.target = '_blank';
    card.className = `validator-card ${validator.foundation ? 'foundation-node' : 'community-node'}`;

    const rankSpan = document.createElement('span');
    rankSpan.className = 'rank';
    rankSpan.textContent = rank;
    card.appendChild(rankSpan);

    const img = document.createElement('img');
    img.src = `assets/${avatar}`;
    img.alt = escapedAlias;
    img.className = 'w-12 h-12';
    img.onerror = () => { img.src = 'assets/default-avatar.png'; };
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

    const calendar = createMonthCalendar(validator.activationDays || []);
    nodeInfo.appendChild(calendar);

    card.appendChild(nodeInfo);

    return card;
}

function createStandbyNodeCard(node, rank) {
    console.log(`createStandbyNodeCard: Creating card for node ${node.address || 'unknown'}:`, {
        standby_hours: node.standby_hours,
        standby_days: node.standby_days
    });

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
    img.onerror = () => { img.src = 'assets/default-avatar.png'; };
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
    standbySpan.appendChild(document.createTextNode(
        node.standby_hours != null ? `${node.standby_hours.toFixed(2)} hours (${node.standby_days.toFixed(0)} days)` : 'N/A'
    ));
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

async function fetchValidators(period) {
    if (isFetching) {
        console.log('fetchValidators: Skipping due to ongoing fetch');
        return;
    }
    isFetching = true;
    const loadingInterval = showLoadingBar();
    try {
        console.log(`fetchValidators: Fetching validators for period: ${period}`);
        const response = await fetch(`${backendUrl}/api/validators?period=${period}`, {
            mode: 'cors',
            headers: { 'User-Agent': 'Shardeum-Leaderboard/1.0' }
        });
        if (!response.ok) {
            throw new Error(`fetchValidators: Network response was not ok: ${response.status}`);
        }
        const validators = await response.json();
        console.log(`fetchValidators: Received ${validators.length} validators:`, validators);

        if (!Array.isArray(validators) || validators.length === 0) {
            throw new Error('fetchValidators: No validators returned or invalid data format');
        }

        for (const validator of validators) {
            try {
                const response = await fetch(`${backendUrl}/api/validator-increments/${encodeURIComponent(validator.address)}/monthly`, {
                    mode: 'cors',
                    headers: { 'User-Agent': 'Shardeum-Leaderboard/1.0' }
                });
                if (response.ok) {
                    validator.activationDays = await response.json();
                    console.log(`Fetched activation days for validator ${validator.address}:`, validator.activationDays);
                } else {
                    validator.activationDays = [];
                    console.warn(`Failed to fetch activation days for validator ${validator.address}: ${response.status}`);
                }
            } catch (error) {
                validator.activationDays = [];
                console.error(`Error fetching activation days for validator ${validator.address}:`, error.message);
            }
        }

        currentValidators = [...validators];
        currentPeriod = period;
        showLeaderboard();
    } catch (error) {
        console.error('fetchValidators: Error fetching validators:', error);
        if (leaderboardDiv) {
            leaderboardDiv.innerHTML = '<p class="text-red-600">Error loading validators. Please try again later.</p>';
        }
        if (loserboardDiv) {
            loserboardDiv.innerHTML = '';
        }
    } finally {
        hideLoadingBar(loadingInterval);
        isFetching = false;
    }
}

async function fetchStandbyNodes() {
    if (isFetching) {
        console.log('fetchStandbyNodes: Skipping due to ongoing fetch');
        return;
    }
    isFetching = true;
    const loadingInterval = showLoadingBar();
    try {
        console.log('fetchStandbyNodes: Fetching standby nodes');
        const response = await fetch(`${backendUrl}/api/standby-nodes`, {
            mode: 'cors',
            headers: { 'User-Agent': 'Shardeum-Leaderboard/1.0' }
        });
        if (!response.ok) {
            throw new Error(`fetchStandbyNodes: Network response was not ok: ${response.status}`);
        }
        const standbyNodes = await response.json();
        console.log('fetchStandbyNodes: Received standby nodes:', standbyNodes);
        currentStandbyNodes = Array.isArray(standbyNodes) ? [...standbyNodes].sort((a, b) => b.standby_hours - a.standby_hours) : [];
        showLoserboard();
    } catch (error) {
        console.error('fetchStandbyNodes: Error fetching standby nodes:', error);
        currentStandbyNodes = [];
        showLoserboard();
    } finally {
        hideLoadingBar(loadingInterval);
        isFetching = false;
    }
}

function showLeaderboard() {
    activeTab = 'leaderboard';
    if (!leaderboardDiv || !loserboardDiv) {
        console.error('showLeaderboard: Missing leaderboardDiv or loserboardDiv');
        return;
    }
    const communityValidators = currentValidators.filter(v => !v.foundation);
    console.log(`showLeaderboard: Found ${communityValidators.length} community validators before filtering`);

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
    console.log(`showLeaderboard: After search filter, ${filteredValidators.length} validators remain`);

    const limit = Math.min(2000, filteredValidators.length);
    let leaderboard = filteredValidators.slice(0, limit);

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

    console.log(`showLeaderboard: Rendering ${leaderboard.length} validators, period: ${currentPeriod}, filter: ${currentFilter}, search: ${searchQuery}`);

    while (leaderboardDiv.firstChild) {
        leaderboardDiv.removeChild(leaderboardDiv.firstChild);
    }
    loserboardDiv.innerHTML = '';

    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
        searchContainer.classList.remove('hidden');
    } else {
        console.warn('searchContainer not found');
    }

    if (leaderboard.length === 0) {
        console.warn('showLeaderboard: No validators to display');
        const noData = document.createElement('p');
        noData.className = 'text-gray-600 mt-4';
        noData.textContent = searchQuery ? 'No validators match your search.' : 'No community validators available for this period.';
        leaderboardDiv.appendChild(noData);
        removeIndicator();
        if (leaderboardBtn) {
            leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
            leaderboardBtn.appendChild(createIndicator());
            leaderboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
        }
        if (loserboardBtn) {
            loserboardBtn.innerHTML = 'Loserboard (Least Active)';
            loserboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
        }
        return;
    }

    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container mt-4';
    leaderboard.forEach((v, index) => {
        console.log(`showLeaderboard: Creating card for validator ${v.address}`);
        const card = createValidatorCard(v, `${currentPeriod}_count`, index + 1);
        cardContainer.appendChild(card);
    });
    leaderboardDiv.appendChild(cardContainer);

    removeIndicator();
    if (leaderboardBtn) {
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.appendChild(createIndicator());
        leaderboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
    }
    if (loserboardBtn) {
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
    }
}

function showLoserboard() {
    activeTab = 'loserboard';
    if (!leaderboardDiv || !loserboardDiv) {
        console.error('showLoserboard: Missing leaderboardDiv or loserboardDiv');
        return;
    }
    const limit = Math.min(2000, currentStandbyNodes.length);
    const loserboard = currentStandbyNodes.slice(0, limit);

    console.log('showLoserboard: Showing loserboard with', loserboard.length, 'standby nodes');

    while (loserboardDiv.firstChild) {
        loserboardDiv.removeChild(loserboardDiv.firstChild);
    }
    leaderboardDiv.innerHTML = '';
    if (selectionContainer) {
        selectionContainer.innerHTML = '';
        selectionContainer.classList.add('hidden');
    }

    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
        searchContainer.classList.add('hidden');
    }

    if (loserboard.length === 0) {
        console.warn('showLoserboard: No standby nodes to display');
        const noData = document.createElement('p');
        noData.className = 'text-gray-600 mt-4';
        noData.textContent = 'No standby nodes available at this time.';
        loserboardDiv.appendChild(noData);
        removeIndicator();
        if (leaderboardBtn) {
            leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
            leaderboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
        }
        if (loserboardBtn) {
            loserboardBtn.innerHTML = 'Loserboard (Least Active)';
            loserboardBtn.appendChild(createIndicator());
            loserboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
        }
        return;
    }

    loserboard.forEach((n, index) => {
        console.log(`showLoserboard: Creating card for standby node ${n.address}`);
        const card = createStandbyNodeCard(n, index + 1);
        loserboardDiv.appendChild(card);
    });

    removeIndicator();
    if (leaderboardBtn) {
        leaderboardBtn.innerHTML = 'Leaderboard (Most Active)';
        leaderboardBtn.className = 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300';
    }
    if (loserboardBtn) {
        loserboardBtn.innerHTML = 'Loserboard (Least Active)';
        loserboardBtn.appendChild(createIndicator());
        loserboardBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';
    }
}

function updateSelectionContainer() {
    console.log('updateSelectionContainer: Updating with period:', currentPeriod);
    if (!selectionContainer) {
        console.error('updateSelectionContainer: selectionContainer is null');
        return;
    }
    selectionContainer.innerHTML = '';
    selectionContainer.classList.remove('hidden');
    const select = document.createElement('select');
    select.id = 'filter-select';
    select.className = 'p-2 border rounded-lg';
    const options = [
        { value: 'default', text: 'Sort by Activations' },
        { value: 'stake', text: 'Sort by Stake' },
        { value: 'reward', text: 'Sort by Reward' },
        { value: 'status', text: 'Sort by Status' }
    ];
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        if (opt.value === currentFilter) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    selectionContainer.appendChild(select);
    const searchContainer = document.createElement('div');
    searchContainer.id = 'search-container';
    searchContainer.className = 'mt-2';
    const searchInputEl = document.createElement('input');
    searchInputEl.id = 'search-input';
    searchInputEl.type = 'text';
    searchInputEl.placeholder = 'Search by name, address, nominator, or IP';
    searchInputEl.className = 'p-2 border rounded-lg w-full';
    searchInputEl.value = searchQuery;
    searchContainer.appendChild(searchInputEl);
    selectionContainer.appendChild(searchContainer);

    // Update global references
    filterSelect = select;
    searchInput = searchInputEl;

    // Attach event listeners after creating elements
    filterSelect.addEventListener('change', () => {
        console.log('filterSelect: Changed to', filterSelect.value);
        currentFilter = filterSelect.value;
        showLeaderboard();
    });

    searchInput.addEventListener('input', () => {
        console.log('searchInput: Input changed to', searchInput.value);
        searchQuery = searchInput.value;
        showLeaderboard();
    });
}

function initializeEventListeners() {
    if (periodSelect) {
        periodSelect.addEventListener('change', () => {
            console.log('periodSelect: Changed to', periodSelect.value);
            currentPeriod = periodSelect.value;
            updateSelectionContainer();
        });
    }
    if (showBtn) {
        showBtn.addEventListener('click', () => {
            console.log('showBtn: Fetching validators for period:', periodSelect?.value || currentPeriod);
            fetchValidators(periodSelect?.value || currentPeriod);
        });
    }
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            console.log('leaderboardBtn: Clicked');
            if (activeTab !== 'leaderboard') {
                fetchValidators(currentPeriod);
            }
            updateSelectionContainer();
        });
    }
    if (loserboardBtn) {
        loserboardBtn.addEventListener('click', () => {
            console.log('loserboardBtn: Clicked');
            if (activeTab !== 'loserboard') {
                fetchStandbyNodes();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: Initializing');
    updateSelectionContainer();
    initializeEventListeners();
    fetchValidators(currentPeriod);
});