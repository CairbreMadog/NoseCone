# NoseCone - Discord Bot for n8n Integration

[![Node.js](https://img.shields.io/badge/Node.js-16.0%2B-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-blue.svg)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

NoseCone is a powerful Discord bot that seamlessly integrates with n8n workflow automation platform, enabling you to bridge Discord interactions with automated workflows.

## 🚀 Features

- **📝 Message Processing**: Automatically processes Discord messages and sends them to n8n workflows
- **⚡ Slash Commands**: Modern Discord application commands for workflow management
- **🔗 Dual Webhooks**: Support for primary and secondary webhook endpoints
- **🛡️ Secure Authentication**: Token-based authentication for webhook security
- **📊 Comprehensive Logging**: Detailed logging for monitoring and debugging
- **🎯 Flexible Configuration**: Environment-based configuration for easy deployment
- **💬 Multi-Channel Support**: Process messages from specific channels or all channels
- **📨 Direct Message Support**: Handle private messages and commands
- **🔄 Retry Logic**: Built-in retry mechanisms with exponential backoff
- **📈 Status Monitoring**: Real-time bot and integration status reporting

## 📋 Quick Start

### Prerequisites

- Node.js v16.0.0 or higher
- Discord Developer Account
- n8n instance (self-hosted or cloud)
- Basic knowledge of Discord bot setup

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd NoseCone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the bot:**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

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

### Required Discord Permissions

- Read Messages/View Channels
- Send Messages
- Use Slash Commands
- Read Message History
- Send Messages in Threads (optional)

## 🤖 Commands

### Slash Commands

| Command | Description |
|---------|-------------|
| `/workflow test` | Test n8n webhook connectivity |
| `/workflow trigger <message>` | Manually send a message to n8n |
| `/workflow status` | Get bot and integration status |
| `/help` | Display help information |

### Message Processing

- **Channel Messages**: Automatically processes messages in configured channels
- **Direct Messages**: Handles private messages sent to the bot
- **Command Messages**: Processes messages starting with configured prefix (default: `!`)

## 📊 Data Structure

Messages are sent to n8n as structured JSON payloads:

```json
{
  "messageType": "channel|slash|dm",
  "message": {
    "id": "message_id",
    "content": "message text",
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
      "type": "GUILD_TEXT"
    },
    "guild": {
      "id": "guild_id",
      "name": "guild_name"
    }
  },
  "command": {
    "name": "command_name",
    "options": {},
    "type": "slash|prefix"
  }
}
```

## 🏗️ Project Structure

```
NoseCone/
├── src/
│   ├── commands/           # Slash command handlers
│   │   ├── workflow.js     # n8n workflow commands
│   │   ├── help.js         # Help command
│   │   └── index.js        # Command exports
│   ├── events/             # Discord event handlers
│   │   ├── ready.js        # Bot ready event
│   │   ├── messageCreate.js# Message processing
│   │   └── interactionCreate.js # Slash command handling
│   ├── services/           # Core services
│   │   ├── n8nService.js   # n8n API integration
│   │   ├── discordService.js # Discord utilities
│   │   └── configService.js # Configuration management
│   ├── utils/              # Utility modules
│   │   ├── logger.js       # Logging system
│   │   ├── validators.js   # Input validation
│   │   └── helpers.js      # Helper functions
│   └── bot.js              # Main bot class
├── config/                 # Configuration files
│   ├── commands.json       # Command definitions
│   └── permissions.json    # Permission settings
├── docs/                   # Documentation
│   ├── SETUP.md           # Setup instructions
│   ├── COMMANDS.md        # Command reference
│   └── API.md             # n8n integration API
├── logs/                  # Log files (auto-created)
├── package.json           # Dependencies
├── index.js              # Application entry point
└── README.md             # This file
```

## 🔧 Development

### Available Scripts

```bash
npm start       # Start the bot in production mode
npm run dev     # Start with auto-restart (development)
npm test        # Run tests
npm run lint    # Lint code
npm run lint:fix # Fix linting issues
```

### Debug Mode

Enable detailed logging by setting `DEBUG_MODE=true` in your `.env` file. This will:

- Show confirmation messages for processed messages
- Provide detailed webhook request/response logging
- Display comprehensive error information

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions
- **[Commands Reference](docs/COMMANDS.md)** - Complete command documentation  
- **[API Documentation](docs/API.md)** - n8n integration API details

## 🔒 Security

- **Token Security**: Never share your Discord bot token
- **Webhook Authentication**: Use token-based authentication for webhooks
- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: Built-in rate limiting prevents abuse
- **Permission Management**: Minimal required permissions

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Process Management (Recommended)
```bash
# Using PM2
npm install -g pm2
pm2 start index.js --name "nosecone-bot"
pm2 startup
pm2 save
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

This addition provides multiple service setup options:

1. **PM2** - The most popular and cross-platform option that works on Windows, Linux, and macOS
2. **systemd** - Native Linux service manager
3. **node-windows** - For creating native Windows services
4. **Docker** - Container-based approach with restart policies

Each option ensures the bot will automatically start when the system reboots. PM2 is generally recommended as it's the easiest to set up and manage across different platforms.

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**: Check bot token and permissions
2. **Webhook failures**: Verify n8n URL and authentication
3. **Command errors**: Ensure slash commands are registered
4. **Permission issues**: Check Discord server permissions

### Debug Steps

1. Enable debug mode: `DEBUG_MODE=true`
2. Check logs: `tail -f logs/app.log`
3. Test connectivity: `/workflow test`
4. Verify configuration: `/workflow status`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Commit changes: `git commit -m 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API library
- [n8n](https://n8n.io/) - Workflow automation platform
- [Node.js](https://nodejs.org/) - JavaScript runtime

## 📞 Support

- Create an [issue](https://github.com/your-repo/issues) for bug reports
- Join our [Discord server](https://discord.gg/your-server) for community support
- Check the [documentation](docs/) for detailed guides

---

**Made with ❤️ for the Discord and n8n communities**
