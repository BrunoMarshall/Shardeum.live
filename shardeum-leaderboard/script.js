document.addEventListener('DOMContentLoaded', () => {
    const leaderboardDiv = document.getElementById('leaderboard');
    const loserboardDiv = document.getElementById('loserboard');
    const periodSelector = document.getElementById('period-selector');
    const profileForm = document.getElementById('profile-form');
    const backendUrl = 'https://leaderboard.shardeum.live:3000';

    async function fetchValidators(period) {
        try {
            const response = await fetch(`${backendUrl}/validators?period=${period}`, {
                mode: 'cors'
            });
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const validators = await response.json();
            displayValidators(validators, period);
        } catch (error) {
            console.error('Error fetching validators:', error);
            leaderboardDiv.innerHTML = '<p>Error loading data. Please accept the certificate for https://173.249.43.10:3000 and try again.</p>';
            loserboardDiv.innerHTML = '<p>Error loading data. Please accept the certificate for https://173.249.43.10:3000 and try again.</p>';
        }
    }

    function displayValidators(validators, period) {
        // Sort validators by period-specific count (descending)
        const sortedValidators = [...validators].sort((a, b) => {
            const countA = a[period + 'Count'] || 0;
            const countB = b[period + 'Count'] || 0;
            return countB - countA;
        });

        // First 10 nodes for Leaderboard
        const leaderboard = sortedValidators.slice(0, 10);
        leaderboardDiv.innerHTML = leaderboard.length ? 
            leaderboard.map(v => createValidatorCard(v, period + 'Count')).join('') : 
            '<p>No data available</p>';

        // Last 10 nodes for Loserboard
        const loserboard = sortedValidators.slice(-10).reverse();
        loserboardDiv.innerHTML = loserboard.length ? 
            loserboard.map(v => createValidatorCard(v, period + 'Count')).join('') : 
            '<p>No data available</p>';
    }

    function createValidatorCard(validator, countKey) {
        return `
            <div class="validator-card">
                <img src="assets/${validator.avatar || 'default-avatar.png'}" alt="${validator.alias || 'Unknown'}">
                <div class="details">
                    <p><strong>Alias:</strong> ${validator.alias || 'Unknown'}</p>
                    <p><strong>Identifier:</strong> ${validator.identifier}</p>
                    <p><strong>Public Key:</strong> ${validator.publicKey.slice(0, 8)}...</p>
                    <p><strong>Activity Count:</strong> ${validator[countKey] || 0}</p>
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
                body: JSON.stringify({ identifier, alias, avatar }),
                mode: 'cors'
            });
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const result = await response.json();
            alert(result.message || 'Profile updated successfully!');
            fetchValidators(periodSelector.value); // Refresh data
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please accept the certificate for https://173.249.43.10:3000 and try again.');
        }
    });

    periodSelector.addEventListener('change', () => fetchValidators(periodSelector.value));
    fetchValidators('weekly');
});