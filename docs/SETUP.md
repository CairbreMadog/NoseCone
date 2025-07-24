# NoseCone Bot Setup Instructions

This guide will walk you through setting up the NoseCone Discord bot to integrate with your n8n workflows.

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js v16.0.0 or higher** installed on your system
- **npm or yarn** package manager
- A **Discord Developer Account** and server where you can add the bot
- An **n8n instance** (self-hosted or cloud) with webhook access
- Basic knowledge of Discord bot setup and n8n workflows

## Step 1: Discord Bot Setup

### 1.1 Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "NoseCone Bot")
3. Navigate to the "Bot" section in the left sidebar
4. Click "Add Bot" to create a bot user
5. Copy the **Bot Token** - you'll need this later

### 1.2 Configure Bot Permissions

In the Discord Developer Portal:

1. Go to the "OAuth2" > "URL Generator" section
2. Select the following scopes:
   - `bot`
   - `applications.commands`
3. Select the following bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Use Slash Commands
   - Read Message History
   - Send Messages in Threads (optional)

### 1.3 Get Required IDs

From the same OAuth2 section, copy:
- **Client ID** (Application ID)
- **Client Secret** (if you plan to use advanced OAuth flows)

## Step 2: n8n Webhook Setup

### 2.1 Create Webhook in n8n

1. Open your n8n instance
2. Create a new workflow
3. Add a "Webhook" node as the first node
4. Configure the webhook:
   - **HTTP Method**: POST
   - **Path**: `/discord-bot` (or any path you prefer)
   - **Authentication**: None or Header Auth (recommended)
5. Save and activate the workflow
6. Copy the **Webhook URL** from the node

### 2.2 Optional: Secondary Webhook

If you want separate handling for commands:
1. Create another webhook node or workflow
2. Set the path to `/discord-commands`
3. Copy this **Secondary Webhook URL**

## Step 3: Project Installation

### 3.1 Download and Install

```bash
# Clone the repository (or download the project files)
git clone <repository-url>
cd NoseCone

# Install dependencies
npm install
```

### 3.2 Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your configuration:
   ```env
   # Discord Configuration
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_CLIENT_SECRET=your_client_secret_here

   # n8n Configuration
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/discord-bot
   N8N_WEBHOOK_TOKEN=optional_webhook_authentication_token
   N8N_SECONDARY_WEBHOOK=https://your-n8n-instance.com/webhook/discord-commands

   # Bot Configuration
   BOT_PREFIX=!
   COMMAND_CHANNEL_ID=optional_specific_channel_id
   DEBUG_MODE=false
   ```

### 3.3 Environment Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_BOT_TOKEN` | Yes | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Yes | Application ID from Discord Developer Portal |
| `DISCORD_CLIENT_SECRET` | No | Client secret for advanced OAuth (optional) |
| `N8N_WEBHOOK_URL` | Yes | Primary n8n webhook URL |
| `N8N_WEBHOOK_TOKEN` | No | Authentication token for webhooks |
| `N8N_SECONDARY_WEBHOOK` | No | Secondary webhook for commands |
| `BOT_PREFIX` | No | Command prefix (default: `!`) |
| `COMMAND_CHANNEL_ID` | No | Specific channel ID to monitor |
| `DEBUG_MODE` | No | Enable debug logging (default: `false`) |

## Step 4: Bot Deployment

### 4.1 Add Bot to Discord Server

1. Use the OAuth2 URL generated in Step 1.2
2. Select your Discord server
3. Authorize the bot with the required permissions

### 4.2 Start the Bot

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 4.3 Verify Setup

1. Check the console logs for successful startup messages
2. In Discord, use `/help` to verify the bot is responding
3. Use `/workflow test` to verify n8n connectivity
4. Send a test message to verify message processing

## Step 5: Testing and Verification

### 5.1 Test Slash Commands

```
/workflow test      # Test n8n webhook connectivity
/workflow status    # Check bot and integration status
/help              # Display help information
```

### 5.2 Test Message Processing

1. Send a regular message in a monitored channel
2. Send a command message (e.g., `!test message`)
3. Send a direct message to the bot
4. Check your n8n workflow for incoming data

### 5.3 Verify n8n Data Reception

In your n8n workflow, you should receive JSON payloads like:

```json
{
  "messageType": "channel",
  "message": {
    "id": "message_id",
    "content": "Hello, world!",
    "timestamp": "2023-01-01T12:00:00Z",
    "author": {
      "id": "user_id",
      "username": "username",
      "discriminator": "0000",
      "roles": ["role_id_1", "role_id_2"]
    },
    "channel": {
      "id": "channel_id",
      "name": "general",
      "type": "GUILD_TEXT"
    },
    "guild": {
      "id": "guild_id",
      "name": "My Server"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Bot Not Responding**
   - Check if the bot token is correct
   - Verify bot permissions in Discord server
   - Check console logs for error messages

2. **n8n Webhook Not Receiving Data**
   - Verify webhook URL is accessible
   - Check webhook authentication settings
   - Test webhook manually with a tool like Postman

3. **Permission Errors**
   - Ensure bot has required permissions in Discord
   - Check channel-specific permissions
   - Verify bot role hierarchy

4. **Environment Variable Issues**
   - Double-check `.env` file syntax
   - Ensure no trailing spaces in values
   - Restart the bot after making changes

### Debug Mode

Enable debug mode in your `.env` file:
```env
DEBUG_MODE=true
```

This will provide detailed logging and confirmation messages for troubleshooting.

### Logs

Check the `logs/app.log` file for detailed error information and debugging data.

## Security Considerations

1. **Never share your bot token** - treat it like a password
2. **Use webhook authentication** when possible
3. **Restrict bot permissions** to only what's necessary
4. **Monitor bot usage** through logs and Discord audit logs
5. **Keep dependencies updated** to avoid security vulnerabilities

## Next Steps

Once your bot is running successfully:

1. Create n8n workflows to process Discord data
2. Set up automated responses or actions
3. Monitor performance and logs
4. Consider adding custom commands or features
5. Set up proper deployment with process management (PM2, Docker, etc.)

## Support

If you encounter issues:

1. Check the logs in `logs/app.log`
2. Verify all environment variables are correct
3. Test each component independently (Discord bot, n8n webhook)
4. Review the troubleshooting section above

For additional help, consult the Discord.js documentation and n8n documentation for their respective components. 