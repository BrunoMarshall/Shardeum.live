document.addEventListener('DOMContentLoaded', () => {
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const periodSelector = document.getElementById('period-selector');
    const profileForm = document.getElementById('profile-form');
    const backendUrl = 'http://173.249.43.10:3000';

    async function fetchValidators(period) {
        try {
            const response = await fetch(`${backendUrl}/validators?period=${period}`);
            const validators = await response.json();
            displayValidators(validators, period);
        } catch (error) {
            console.error('Error fetching validators:', error);
            leaderboardDiv.innerHTML = '<p class="text-red-500">Error loading data</p>';
            loserboardDiv.innerHTML = '<p class="text-red-500">Error loading data</p>';
        }
    }

    function displayValidators(validators, period) {
    const leaderboard = validators.slice(0, 10); // First 10 nodes
    const loserboard = validators.slice(-10); // Last 10 nodes

    leaderboardDiv.innerHTML = leaderboard.map(v => createValidatorCard(v, 'weeklyCount')).join('');
    loserboardDiv.innerHTML = loserboard.map(v => createValidatorCard(v, 'weeklyCount')).join('');
}

    function createValidatorCard(validator, countKey) {
        return `
            <div class="validator-card">
                <img src="assets/${validator.avatar}" alt="${validator.alias}">
                <div class="details">
                    <p><strong>Alias:</strong> ${validator.alias}</p>
                    <p><strong>Identifier:</strong> ${validator.identifier}</p>
                    <p><strong>Public Key:</strong> ${validator.publicKey.slice(0, 8)}...</p>
                    <p><strong>Activity Count:</strong> ${validator[countKey]}</p>
                    <p><strong>Foundation:</strong> ${validator.foundation ? 'Yes' : 'No'}</p>
                </div>
            </div>
        `;
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('validator-identifier').value;
        const alias = document.getElementById('validator-alias').value;
        const avatar = document.getElementById('validator-avatar').value;

        try {
            const response = await fetch(`${backendUrl}/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, alias, avatar })
            });
            if (response.ok) {
                alert('Profile updated successfully!');
                fetchValidators(periodSelector.value);
            } else {
                alert('Error updating profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    });

    periodSelector.addEventListener('change', () => fetchValidators(periodSelector.value));
    fetchValidators('weekly');
});