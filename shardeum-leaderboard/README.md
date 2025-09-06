# Shardeum Validator Leaderboard

This project displays a leaderboard and loserboard of Shardeum validators based on their activity frequency, fetched via the Shardeum RPC API every 5 minutes. It is hosted on GitHub Pages and uses a MongoDB database on a Contabo VPS to store validator data.

## Features
- **Leaderboard**: Displays the top 10 most active validators (weekly, monthly, all-time).
- **Loserboard**: Displays the bottom 10 active validators (excluding zero activity).
- **Avatar System**: Validators can select from `default-avatar.png`, `avatar1.png`, `avatar2.png`, `avatar3.png`, or `foundation_validator.png` for foundation nodes.
- **Alias Customization**: Users can set a custom alias for their validator.
- **Responsive Design**: Built with Tailwind CSS, matching the Shardeum.live style.

## Setup
1. **Backend (Contabo VPS)**:
   - Install MongoDB and Node.js on the VPS (`root@173.249.43.10`).
   - Clone the backend script and run it to fetch validator data every 5 minutes.
   - See backend setup instructions in the repository.

2. **Frontend (GitHub Pages)**:
   - Hosted under `shardeum-leaderboard/` in the `Shardeum.live` repository.
   - Uses Tailwind CSS and custom styles to match the main site.

3. **Assets**:
   - Avatars: `default-avatar.png`, `foundation_validator.png`, `avatar1.png`, `avatar2.png`, `avatar3.png`.
   - Branding: `shardeum_live_favicon.png`, `shardeum_live_logo.png`.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
MIT License