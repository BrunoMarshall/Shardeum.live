# 🚀 Automating Alerts for Shardeum Validator Node Monitoring - Telegram Alerts in your smartphone

Keeping your Shardeum validator node online (LIVE! 😊) is essential for network stability and maximizing rewards. We've all felt the frustration of logging into the Shardeum dashboard and seeing that the validator has stopped. 😔 This is my contribution to Shardeum and a guide to help you set up an automated monitoring script that:    
#### ✅ Regularly checks automatically your Shardeum validator node status  
#### ✅ Sends a Telegram alert automatically if the node stops  
#### ✅ Attempts to restart the node automatically  

By following this guide, you'll have a reliable system in place to minimize downtime with instant notifications in your smartphone and automated recovery.

# What do you will need:
1- A running Shardeum validator node - I assume that you are using a VPS, you can install it and run it following Shardium documentation:  
```
https://docs.shardeum.org/docs/node/run/validator/self-host#download-and-install-validator
```  
2- A Telegram bot for notifications (I will show you how to do it, I choose telegram because is the easy and it is free)  
3- Your Telegram Bot Token and Chat ID (I will show you how to do it)  


Why is it necessary?  
- Telegram Bot API: The script uses the Telegram Bot API to send notifications (e.g., alerts when your validator node stops or experiences issues). This is done by interacting with the Telegram Bot using the Bot Token.  
- Authentication: The Bot Token authenticates your script with Telegram, allowing it to send messages to a specific chat. Without it, the script won’t be able to communicate with Telegram and send you notifications.  

# Step 1: How to Get a Telegram Bot Token
Open Telegram and search for @BotFather  
Type /newbot and follow the setup instructions  
Copy the Bot Token given at the end  
# Step 2 :How to Get Your Chat ID  
Send any message to your newly created bot  
Open a browser and copy/paste your (<BOT_TOKEN>)in the link:  
```
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```  
Find your Chat ID in the response  


# Step 3: Create the Monitoring Script  
🔹 Connect to Your VPS  
If you're using a VPS like Contabo or AWS, log in to your server

🔹 Start a tmux Session  
To keep the script running in the background when you close the vps, use tmux:   
```
tmux new-session -s shardeum-monitor
```
This opens a new terminal session named shardeum-monitor.  

🔹 Navigate to Your Shardeum Directory  
Run:  
```
cd ~/shardeum
    
./shell.sh  
```

## Copy/paste the full Monitoring Script below and use your "YOUR_BOT_TOKEN" and "YOUR_CHAT_ID"  
```  
#!/bin/bash  

# Set your Bot Token and Chat ID  
BOT_TOKEN="YOUR_BOT_TOKEN"  
CHAT_ID="YOUR_CHAT_ID"  

# Infinite loop to check the node's status  
while true; do  
  echo "Checking node status at $(date)..."  
  
  # Get node status  
  STATUS_OUTPUT=$(operator-cli status)  
  
  if [ $? -ne 0 ]; then  
    echo "Error: Failed to run operator-cli status"  
    sleep 10  
    continue  
  fi  
  
  echo "Status output: $STATUS_OUTPUT"  
  
  # Check if the node is stopped  
  if echo "$STATUS_OUTPUT" | grep -q "state: stopped"; then  
    echo -e "\033[31mNode is stopped. Restarting...\033[0m"  
    
    # Send Telegram alert  
    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \  
      -d chat_id="${CHAT_ID}" \  
      -d text="⚠️ ALERT: Node stopped at $(date). Restarting now!"  
    
    # Restart node  
    operator-cli gui start  
    
    if [ $? -ne 0 ]; then  
      echo -e "\033[33mError: Failed to restart node\033[0m"  
      sleep 10  
      continue  
    fi  
    echo "✅ Node restarted at $(date)."  
  else  
    echo -e "\033[32m✅ Node is running normally at $(date).\033[0m"  
  fi  

  # Wait before the next check  
  sleep 60  
done  
```

# Step 4: Press Enter to start the script and watch it check the node status every 60 seconds. If you'd like to see updates faster, you can modify the sleep time by changing 60 to 10 seconds in the script.  

While the script is running, go to the Shardeum Validator Dashboard and stop the node. You should receive an alert message in Telegram if everything is set up correctly.  
If you close your SSH session, the script will stop running. To keep it running in the background, detach the tmux session by pressing:

CTRL + B, then D
This will allow the script to continue running even after you log out.

To reattach later and check the logs:  
```
tmux attach-session -t shardeum-monitor
```

# 🎯 Conclusion  
Now, your shardeum validator node will:  
✔ Be monitored 24/7  
✔ Send alerts if it stops  
✔ Restart automatically ----- Based on Shardeum testnet experience, if there's a version update, it's best to reinstall the new version rather than attempting to restart the node, as it may not work properly with the old version.  

If you have any questions or improvements, feel free to contribute! 🚀  

### PS: If you suceedd to install the bot and is running, as i´m sure you will, pls contribute here for beer:  0x01c3e3f01042Ef49ee11C85C70Fa2eB9e7EE15B5  
