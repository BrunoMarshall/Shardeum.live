document.addEventListener('DOMContentLoaded', () => {
    const validatorList = document.getElementById('validator-list');
    const backendUrl = 'https://leaderboard.shardeum.live:3000';

    async function fetchValidators() {
        try {
            // Prompt for credentials
            const username = prompt('Enter admin username:');
            const password = prompt('Enter admin password:');
            if (!username || !password) {
                alert('Credentials required');
                return;
            }

            const response = await fetch(`${backendUrl}/api/admin/validators`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            if (!response.ok) {
                alert('Authentication failed. Please check your credentials.');
                return;
            }
            const validators = await response.json();
            
            validatorList.innerHTML = '';
            validators.forEach(validator => {
                const card = document.createElement('div');
                card.className = `validator-card ${validator.foundation ? 'foundation-node' : 'community-node'}`;
                card.innerHTML = `
                    <img src="assets/${validator.avatar}" alt="${validator.alias}">
                    <div class="text-container">
                        <span><strong>Name:</strong> ${validator.alias}</span>
                        <span><strong>Address:</strong> ${validator.publicKey.length > 10 ? `${validator.publicKey.slice(0, 5)}…${validator.publicKey.slice(-5)}` : validator.publicKey}</span>
                        <span><strong>IP:</strong> ${validator.identifier}</span>
                        <input type="text" class="alias-input w-full p-2 border rounded mt-2" placeholder="Enter new alias" value="${validator.alias === 'Unknown' ? '' : validator.alias}">
                        <select class="avatar-select w-full p-2 border rounded mt-2">
                            <option value="default-avatar.png" ${validator.avatar === 'default-avatar.png' ? 'selected' : ''}>Default Avatar</option>
                            <option value="foundation_validator.png" ${validator.avatar === 'foundation_validator.png' ? 'selected' : ''}>Foundation Validator</option>
                            <option value="avatar1.png" ${validator.avatar === 'avatar1.png' ? 'selected' : ''}>Avatar 1</option>
                            <option value="avatar2.png" ${validator.avatar === 'avatar2.png' ? 'selected' : ''}>Avatar 2</option>
                            <option value="avatar3.png" ${validator.avatar === 'avatar3.png' ? 'selected' : ''}>Avatar 3</option>
                        </select>
                        <button class="update-btn bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700" data-address="${validator.publicKey}">Update</button>
                    </div>
                    <div class="node-info">
                        <span><strong>${validator.foundation ? 'Foundation Node' : 'Community Node'}</strong></span>
                    </div>
                `;
                validatorList.appendChild(card);
            });

            // Add event listeners for update buttons
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
                        const aliasResponse = await fetch(`${backendUrl}/api/set-alias`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                            },
                            body: JSON.stringify({ publicKey, alias })
                        });
                        const avatarResponse = await fetch(`${backendUrl}/api/set-avatar`, {
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
                            alert('Failed to update alias or avatar');
                        }
                    } catch (error) {
                        console.error('Error updating validator:', error);
                        alert('Error updating validator');
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching validators:', error);
            alert('Error fetching validators');
        }
    }

    fetchValidators();
});