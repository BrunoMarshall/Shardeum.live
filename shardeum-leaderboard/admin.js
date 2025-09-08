document.addEventListener('DOMContentLoaded', () => {
    const validatorList = document.getElementById('validator-list');
    const API_URL = 'https://leaderboard.shardeum.live/api/admin/validators';

    async function fetchValidators() {
        try {
            const username = prompt('Enter admin username:');
            const password = prompt('Enter admin password:');
            if (!username || !password) {
                alert('Credentials required');
                validatorList.innerHTML = '<p class="text-red-600">Credentials required.</p>';
                return;
            }

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`),
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                alert(`Authentication failed: ${errorData.error || 'Unknown error'}`);
                validatorList.innerHTML = '<p class="text-red-600">Authentication failed. Please check your credentials.</p>';
                return;
            }
            const validators = await response.json();
            if (!Array.isArray(validators)) {
                alert('Invalid data format received from server');
                validatorList.innerHTML = '<p class="text-red-600">Invalid data format received from server.</p>';
                return;
            }

            validatorList.innerHTML = '';
            validators.forEach(validator => {
                const card = document.createElement('div');
                card.className = `validator-card ${validator.foundation ? 'foundation-node' : 'community-node'}`;
                const publicKey = validator.public_key || 'N/A';
                const truncatedKey = publicKey.length > 10 ? `${publicKey.slice(0, 5)}…${publicKey.slice(-5)}` : publicKey;
                card.innerHTML = `
                    <img src="assets/${validator.avatar || 'default-avatar.png'}" alt="${validator.alias || 'Unknown'}">
                    <div class="text-container">
                        <span><strong>Name:</strong> ${validator.alias || 'Unknown'}</span>
                        <span><strong>Address:</strong> ${truncatedKey}</span>
                        <span><strong>IP:</strong> ${validator.ip || 'N/A'}</span>
                        <input type="text" class="alias-input w-full p-2 border rounded mt-2" placeholder="Enter new alias" value="${validator.alias === 'Unknown' ? '' : validator.alias || ''}">
                        <select class="avatar-select w-full p-2 border rounded mt-2">
                            <option value="default-avatar.png" ${validator.avatar === 'default-avatar.png' ? 'selected' : ''}>Default Avatar</option>
                            <option value="foundation_validator.png" ${validator.avatar === 'foundation_validator.png' ? 'selected' : ''}>Foundation Validator</option>
                            <option value="avatar1.png" ${validator.avatar === 'avatar1.png' ? 'selected' : ''}>Avatar 1</option>
                            <option value="avatar2.png" ${validator.avatar === 'avatar2.png' ? 'selected' : ''}>Avatar 2</option>
                            <option value="avatar3.png" ${validator.avatar === 'avatar3.png' ? 'selected' : ''}>Avatar 3</option>
                        </select>
                        <button class="update-btn bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700" data-address="${publicKey}">Update</button>
                    </div>
                    <div class="node-info">
                        <span><strong>${validator.foundation ? 'Foundation Node' : 'Community Node'}</strong></span>
                    </div>
                `;
                validatorList.appendChild(card);
            });

            document.querySelectorAll('.update-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const publicKey = button.getAttribute('data-address');
                    const aliasInput = button.previousElementSibling.previousElementSibling;
                    const avatarSelect = button.previousElementSibling;
                    const alias = aliasInput.value.trim();
                    const avatar = avatarSelect.value;
                    if (!alias) {
                        alert('Please enter a valid alias');
                        return;
                    }

                    try {
                        const aliasResponse = await fetch('https://leaderboard.shardeum.live/api/set-alias', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                            },
                            body: JSON.stringify({ publicKey, alias })
                        });
                        const avatarResponse = await fetch('https://leaderboard.shardeum.live/api/set-avatar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                            },
                            body: JSON.stringify({ publicKey, avatar })
                        });
                        if (aliasResponse.ok && avatarResponse.ok) {
                            alert('Alias and avatar updated successfully');
                            fetchValidators();
                        } else {
                            const errorData = await aliasResponse.json().catch(() => ({}));
                            alert(`Failed to update: ${errorData.error || 'Unknown error'}`);
                        }
                    } catch (error) {
                        console.error('Error updating validator:', error);
                        alert('Error updating validator');
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching validators:', error);
            validatorList.innerHTML = '<p class="text-red-600">Error fetching validators. Please try again later.</p>';
        }
    }

    fetchValidators();
});