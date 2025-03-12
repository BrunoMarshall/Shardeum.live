Automating Telegram Alerts for Shardeum Validator Node Monitoring
Ensuring your validator node stays online is crucial for maintaining network stability and maximizing rewards. This is my attempt to guide you to setting up an automated monitoring script that:
✅ Regularly checks your Shardeum validator node status
✅ Sends a Telegram alert if the node stops
✅ Attempts to restart the node automatically

By following this guide, you'll have a reliable system in place to minimize downtime with instant notifications and automated recovery.

Step 1: Prerequisites
Before starting, make sure you have:

A running Shardeum validator node
operator-cli installed and accessible
A Telegram bot for notifications
Your Telegram Bot Token and Chat ID
How to Get a Telegram Bot Token
Open Telegram and search for BotFather
Type /newbot and follow the setup instructions
Copy the Bot Token given at the end
How to Get Your Chat ID
Send any message to your newly created bot
Open a browser and visit:
bash
Copy
Edit
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
Find your Chat ID in the response
Step 2: Create the Monitoring Script
Create a new file and add the following script:

bash
Copy
Edit
#!/bin/bash

# Set up your Bot Token and Chat ID here
BOT_TOKEN="YOUR_BOT_TOKEN"
CHAT_ID="YOUR_CHAT_ID"

# Infinite loop to check the node's status
while true; do
  echo "Checking node status at $(date)..."
  
  # Run the status command directly
  STATUS_OUTPUT=$(operator-cli status)
  
  if [ $? -ne 0 ]; then
    echo "Error: Failed to run operator-cli status"
    sleep 10
    continue
  fi
  
  echo "Status output: $STATUS_OUTPUT"
  
  # Check if the node is stopped
  if echo "$STATUS_OUTPUT" | grep -q "state: stopped"; then
    echo -e "\033[31mNode is stopped. Restarting immediately...\033[0m"
    
    # Send Telegram Notification
    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
      -d chat_id="${CHAT_ID}" \
      -d text="ALERT: Node is stopped at $(date). Restarting now!"
    
    # Restart the node
    operator-cli gui start
    
    if [ $? -ne 0 ]; then
      echo -e "\033[33mError: Failed to restart the node\033[0m"
      sleep 10
      continue
    fi
    echo "Node was stopped and has been restarted at $(date)."
  elif echo "$STATUS_OUTPUT" | grep -q "state: waiting-for-network"; then
    echo -e "\033[33mNode is waiting for network. Checking again after 60 seconds...\033[0m"
    sleep 60
    continue
  else
    echo -e "\033[32mNode is validating the blockchain at $(date).\033[0m"
  fi
  
  echo "Waiting for the next check... $(date)"
  sleep 5
done
Step 3: Make the Script Executable
Save the script as monitor.sh and give it executable permissions:

bash
Copy
Edit
chmod +x monitor.sh
Step 4: Run the Script
Run the script in the background so it keeps monitoring your node:

bash
Copy
Edit
./monitor.sh &
The script will now:
✔ Check your node status every 5 seconds
✔ Restart the node if it stops
✔ Send an alert to your Telegram bot

Conclusion
With this setup, you’ll always be notified if your validator node goes offline and have automatic recovery in place. If you have any improvements, feel free to contribute to this guide!


