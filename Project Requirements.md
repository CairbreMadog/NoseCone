# NoseCone - Discord Bot for n8n Integration

## Project Overview

**Project Name:** NoseCone  
**Description:** A Discord bot that integrates with n8n workflow automation platform, enabling seamless communication between Discord and n8n workflows.  
**Technology Stack:** Node.js, discord.js  
**Target Environment:** Self-hosted or cloud deployment  

## Purpose and Goals

NoseCone serves as a bridge between Discord servers and n8n automation workflows, allowing users to:
- Trigger n8n workflows from Discord messages
- Receive notifications and data from n8n workflows in Discord
- Automate Discord server management through n8n integration

## Technical Requirements

### Core Technologies
- **Runtime:** Node.js (v16.0.0 or higher)
- **Discord Library:** discord.js (latest stable version)
- **Environment Management:** dotenv package
- **HTTP Client:** axios or node-fetch for n8n API calls

### Discord Integration
- **Authentication:** OAuth2 with Bot Token
- **Required Scopes:** `bot` and `applications.commands`
- **Required Tokens:**
  - Discord Bot Token
  - Client ID
  - Client Secret (if needed for advanced OAuth flows)
- **Source:** Discord Developer Portal (discord.com/developers)
- **OAuth2 URL Generation:** Must include bot and applications.commands scopes

### n8n Integration
- **Connection Method:** Webhooks (Primary)
- **Data Flow:** Discord messages → n8n webhooks
- **Authentication:** Webhook URLs with optional authentication tokens
- **Base URL:** Configurable n8n instance webhook endpoints

## Configuration Requirements

### Environment Variables (.env)
```
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

## Project File Structure

```
NoseCone/
├── src/
│   ├── commands/
│   │   ├── index.js              # Command handler exports
│   │   ├── workflow.js           # n8n workflow commands
│   │   └── help.js               # Help command
│   ├── events/
│   │   ├── messageCreate.js      # Message event handler
│   │   ├── ready.js              # Bot ready event
│   │   └── interactionCreate.js  # Slash command interactions
│   ├── services/
│   │   ├── n8nService.js         # n8n API integration
│   │   ├── discordService.js     # Discord utilities
│   │   └── configService.js      # Configuration management
│   ├── utils/
│   │   ├── logger.js             # Logging utilities
│   │   ├── validators.js         # Input validation
│   │   └── helpers.js            # General helper functions
│   └── bot.js                    # Main bot initialization
├── config/
│   ├── commands.json             # Command definitions
│   └── permissions.json          # Permission settings
├── docs/
│   ├── SETUP.md                  # Setup instructions
│   ├── COMMANDS.md               # Available commands
│   └── API.md                    # n8n integration details
├── tests/
│   ├── commands/                 # Command tests
│   ├── services/                 # Service tests
│   └── utils/                    # Utility tests
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Node.js dependencies
├── package-lock.json             # Dependency lock file
├── README.md                     # Project overview
└── index.js                      # Application entry point
```

## Functional Requirements

### Core Features
1. **Message Listening & Processing**
   - **Specific Channels**: Monitor messages in configured channel IDs
   - **Slash Commands**: Handle registered application commands (`/command`)
   - **Direct Messages**: Process private messages sent to the bot
   - Parse message content and extract relevant data for n8n

2. **n8n Webhook Integration**
   - Send Discord message data to n8n webhooks
   - Include message metadata (user, channel, timestamp, content)
   - Support multiple webhook endpoints for different message types
   - Handle webhook authentication tokens

3. **Data Transmission**
   - Format Discord message data as JSON payload
   - Include user information (ID, username, roles)
   - Include channel/guild context information
   - Send structured data to configured n8n webhook URLs

### Bot Permissions Required
- **Read Messages** (for channel monitoring)
- **Send Messages** (for responses and confirmations)
- **Use Slash Commands** (for application command handling)
- **Read Message History** (for context and processing)
- **View Channels** (for accessing configured channels)
- **Send Messages in DMs** (for direct message responses)

## Non-Functional Requirements

### Security
- Secure storage of tokens and API keys
- Input validation and sanitization
- Rate limiting for API calls
- Error handling without exposing sensitive data

### Performance
- Efficient message processing
- Asynchronous operations for n8n API calls
- Connection pooling where applicable
- Memory usage optimization

### Reliability
- Graceful error handling
- Automatic reconnection to Discord
- Logging for debugging and monitoring
- Health check endpoints

## Setup and Deployment

### Prerequisites
- Node.js v16.0.0 or higher
- npm or yarn package manager
- Discord Developer Account
- n8n instance (self-hosted or cloud)
- Valid Discord Bot Token and n8n API access

### Installation Process
1. Clone the repository
2. Install dependencies (`npm install`)
3. Configure environment variables
4. Set up Discord bot permissions
5. Test n8n connectivity
6. Deploy and start the bot

## Development Guidelines

### Code Standards
- Use ESLint for code linting
- Follow Node.js best practices
- Implement proper error handling
- Write unit tests for core functionality
- Use async/await for asynchronous operations

### Documentation
- Inline code comments for complex logic
- API documentation for n8n integration
- User-facing documentation for commands
- Setup instructions for new developers

## Data Structure for n8n Webhooks

### Message Data Payload
The bot will send structured JSON data to n8n webhooks containing:

```json
{
  "messageType": "channel" | "slash" | "dm",
  "message": {
    "id": "message_id",
    "content": "message text content",
    "timestamp": "ISO_timestamp",
    "author": {
      "id": "user_id",
      "username": "username",
      "discriminator": "0000",
      "roles": ["role_id_1", "role_id_2"]
    },
    "channel": {
      "id": "channel_id",
      "name": "channel_name",
      "type": "text" | "dm"
    },
    "guild": {
      "id": "guild_id",
      "name": "guild_name"
    }
  },
  "command": {
    "name": "command_name",
    "options": {}
  }
}
```

### Webhook Authentication
- Optional token-based authentication
- Configurable per webhook endpoint
- Secure transmission of Discord data

## Success Criteria

- Bot successfully connects to Discord with proper OAuth2 scopes
- Messages from specific channels are sent to n8n webhooks
- Slash commands are processed and data forwarded to n8n
- Direct messages are handled and transmitted to configured webhooks
- JSON data structure includes all required Discord metadata
- Webhook authentication works correctly when configured
- Error handling prevents crashes and logs issues appropriately
- Setup documentation enables new users to deploy successfully
- Bot remains stable under normal usage loads with multiple message types
