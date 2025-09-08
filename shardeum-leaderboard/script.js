let currentValidators = [];
let currentPeriod = 'weekly';

async function fetchValidators(period) {
    console.log(`Fetching validators for period: ${period}`);
    try {
        const response = await fetch(`https://leaderboard.shardeum.live/api/validators?period=${period}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const validators = await response.json();
        console.log(`Response status: ${response.status}`);
        console.log(`Validators received:`, validators);
        currentValidators = [...validators].sort((a, b) => {
            const countA = a[period + 'Count'] || 0;
            const countB = b[period + 'Count'] || 0;
            return countB - countA;
        });
        updateLeaderboard();
        updateLoserboard();
    } catch (error) {
        console.error('Error fetching validators:', error.message);
    }
}

async function fetchStandbyNodes() {
    try {
        const response = await fetch('https://leaderboard.shardeum.live/api/standby-nodes');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const standbyNodes = await response.json();
        console.log(`Standby nodes received:`, standbyNodes);
        return standbyNodes;
    } catch (error) {
        console.error('Error fetching standby nodes:', error.message);
        return [];
    }
}

function updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '<h3 class="text-xl font-semibold mb-4">Leaderboard (Most Active)</h3>';
    const topValidators = currentValidators.slice(0, 10);
    topValidators.forEach((validator, index) => {
        const validatorElement = document.createElement('div');
        validatorElement.className = 'p-4 border rounded-lg flex items-center';
        validatorElement.innerHTML = `
            <span class="font-bold mr-2">${index + 1}.</span>
            <img src="${validator.avatar || 'assets/default-avatar.png'}" alt="Avatar" class="w-10 h-10 mr-4">
            <div>
                <p><strong>${validator.alias || validator.address.slice(0, 6) + '...' + validator.address.slice(-4)}</strong></p>
                <p>IP: ${validator.identifier}</p>
                <p>Number of Activations: ${validator[currentPeriod + 'Count'] || 0}</p>
            </div>
        `;
        leaderboard.appendChild(validatorElement);
    });
}

function updateLoserboard() {
    const loserboard = document.getElementById('loserboard');
    loserboard.innerHTML = '<h3 class="text-xl font-semibold mb-4">Loserboard (Least Active)</h3>';
    fetchStandbyNodes().then(standbyNodes => {
        const topStandby = standbyNodes.slice(0, 10);
        topStandby.forEach((node, index) => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'p-4 border rounded-lg flex items-center';
            nodeElement.innerHTML = `
                <span class="font-bold mr-2">${index + 1}.</span>
                <img src="assets/default-avatar.png" alt="Avatar" class="w-10 h-10 mr-4">
                <div>
                    <p><strong>${node.address.slice(0, 6) + '...' + node.address.slice(-4)}</strong></p>
                    <p>IP: ${node.identifier}</p>
                    <p>Standby Time: ${node.standby_hours.toFixed(2)} hours (${node.standby_days} days)</p>
                </div>
            `;
            loserboard.appendChild(nodeElement);
        });
    });
}

document.getElementById('period-selector').addEventListener('change', (event) => {
    currentPeriod = event.target.value;
    fetchValidators(currentPeriod);
});

document.getElementById('leaderboard-btn').addEventListener('click', () => {
    document.getElementById('leaderboard').style.display = 'block';
    document.getElementById('loserboard').style.display = 'none';
    document.getElementById('leaderboard-btn').classList.add('bg-blue-600', 'text-white');
    document.getElementById('leaderboard-btn').classList.remove('bg-gray-200', 'text-gray-700');
    document.getElementById('loserboard-btn').classList.add('bg-gray-200', 'text-gray-700');
    document.getElementById('loserboard-btn').classList.remove('bg-blue-600', 'text-white');
});

document.getElementById('loserboard-btn').addEventListener('click', () => {
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('loserboard').style.display = 'block';
    document.getElementById('loserboard-btn').classList.add('bg-blue-600', 'text-white');
    document.getElementById('loserboard-btn').classList.remove('bg-gray-200', 'text-gray-700');
    document.getElementById('leaderboard-btn').classList.add('bg-gray-200', 'text-gray-700');
    document.getElementById('leaderboard-btn').classList.remove('bg-blue-600', 'text-white');
    updateLoserboard();
});

fetchValidators(currentPeriod);