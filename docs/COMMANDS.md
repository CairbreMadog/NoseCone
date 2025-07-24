# NoseCone Bot Commands

This document provides detailed information about all available commands for the NoseCone Discord bot.

## Command Types

NoseCone supports two types of commands:

1. **Slash Commands** - Modern Discord application commands (e.g., `/workflow test`)
2. **Prefix Commands** - Traditional text-based commands (e.g., `!help`)

## Slash Commands

### `/workflow`

Main command for n8n workflow integration and management.

#### `/workflow test`

Tests the connection to your configured n8n webhooks.

**Usage:**
```
/workflow test
```

**Response:**
- ✅ Success message if webhook is reachable
- ❌ Error message with details if webhook fails

**Example:**
```
/workflow test
```
> ✅ **n8n Webhook Test Successful**
> 
> The connection to your n8n webhook is working properly. Messages will be successfully sent to your n8n workflows.

---

#### `/workflow trigger <message>`

Manually sends a message to your n8n workflow for testing purposes.

**Usage:**
```
/workflow trigger <message>
```

**Parameters:**
- `message` (required): The message content to send to n8n (max 2000 characters)

**Response:**
- ✅ Success confirmation with message preview
- ❌ Error message if sending fails

**Example:**
```
/workflow trigger Hello from Discord!
```
> ✅ **Message Sent to n8n Successfully**
> 
> Your message has been sent to the n8n workflow.
> 
> **Message:** "Hello from Discord!"

---

#### `/workflow status`

Displays comprehensive status information about the bot and n8n integration.

**Usage:**
```
/workflow status
```

**Response:**
An embedded message showing:
- Bot uptime and connection status
- n8n webhook connectivity status
- Configuration details
- Guild and user counts

**Example:**
```
/workflow status
```
> 🤖 **NoseCone Bot Status**
> 
> **📊 Bot Information**
> Status: ✅ Online
> Uptime: 2h 34m 12s
> Guilds: 1
> Users: 25
> 
> **🔗 n8n Integration**
> Webhook Status: ✅ Connected
> Primary Endpoint: Configured
> Secondary Endpoint: Not configured

---

### `/help`

Displays comprehensive help information about the bot and its features.

**Usage:**
```
/help
```

**Response:**
A detailed embedded message containing:
- Available slash commands
- Message processing explanation
- n8n integration details
- JSON payload structure
- Setup requirements
- Current configuration

**Example:**
```
/help
```
> 🚀 **NoseCone Bot - Help & Information**
> 
> NoseCone is a Discord bot that integrates with n8n workflow automation platform...

## Message Processing

### Automatic Message Processing

The bot automatically processes messages in the following scenarios:

#### Channel Messages

- **Trigger:** Messages sent in configured channels (or all channels if none specified)
- **Condition:** Message is not from a bot
- **Action:** Sends message data to primary n8n webhook
- **Data Type:** `messageType: "channel"`

**Example:**
```
User: Hello, this is a test message!
Bot: [Processes silently, sends to n8n]
```

#### Direct Messages

- **Trigger:** Any direct message sent to the bot
- **Condition:** Message is not from a bot
- **Action:** Sends message data to primary n8n webhook
- **Data Type:** `messageType: "dm"`

**Example:**
```
User (DM): Private message to bot
Bot: [Processes silently, sends to n8n]
```

#### Command Messages

- **Trigger:** Messages starting with configured prefix (default: `!`)
- **Condition:** Valid command format
- **Action:** Sends message data with command information to both webhooks
- **Data Type:** `messageType: "channel"` with command data

**Example:**
```
User: !workflow test
Bot: [Processes as command, sends to n8n with command data]
```

### Message Data Structure

All processed messages are sent to n8n as JSON payloads with the following structure:

```json
{
  "messageType": "channel|slash|dm",
  "message": {
    "id": "1234567890123456789",
    "content": "Hello, world!",
    "timestamp": "2023-01-01T12:00:00.000Z",
    "author": {
      "id": "0987654321098765432",
      "username": "user123",
      "discriminator": "0000",
      "roles": ["role_id_1", "role_id_2"]
    },
    "channel": {
      "id": "1111222233334444555",
      "name": "general",
      "type": "GUILD_TEXT"
    },
    "guild": {
      "id": "5555666677778888999",
      "name": "My Discord Server"
    }
  },
  "command": {
    "name": "workflow",
    "options": {
      "message": "test message"
    },
    "type": "slash"
  }
}
```

## Configuration Commands

### Environment-Based Configuration

The bot's behavior can be configured through environment variables:

| Setting | Variable | Effect on Commands |
|---------|----------|-------------------|
| Command Prefix | `BOT_PREFIX` | Changes prefix for text commands (default: `!`) |
| Command Channel | `COMMAND_CHANNEL_ID` | Restricts processing to specific channel |
| Debug Mode | `DEBUG_MODE` | Shows confirmation messages for processed messages |

### Debug Mode

When `DEBUG_MODE=true`, the bot provides visual feedback:

**Channel Message Processing:**
```
User: Hello world!
Bot: ✅ Message sent to n8n webhook
```

**Command Processing:**
```
User: !test command
Bot: ✅ Message sent to n8n webhook
```

**Error Handling:**
```
User: Some message
Bot: ❌ Error processing message for n8n
```

## Permissions and Access Control

### Required Bot Permissions

For the bot to function properly, it needs these Discord permissions:

- **View Channels** - To see and access channels
- **Send Messages** - To send responses and confirmations
- **Use Slash Commands** - To register and respond to slash commands
- **Read Message History** - To process message context
- **Send Messages in Threads** - For thread support (optional)

### User Permissions

All users can use:
- `/help` command
- `/workflow status` command
- Message processing (sending messages to n8n)

Administrative commands may be restricted based on server permissions.

## Rate Limiting

The bot implements rate limiting to prevent abuse:

- **Global Cooldown:** 3 seconds between commands
- **Command-Specific Cooldowns:**
  - `/workflow` commands: 5 seconds
  - `/help` command: 10 seconds
- **Max Commands:** 20 per minute per user

## Error Handling

### Common Error Responses

**Invalid Command:**
```
❌ Unknown subcommand
```

**n8n Connectivity Issues:**
```
❌ n8n Webhook Test Failed

Error: Connection timeout

Please check your n8n webhook configuration and ensure the webhook URL is accessible.
```

**Permission Errors:**
```
❌ You don't have permission to use this command.
```

**Rate Limiting:**
```
❌ You're using commands too quickly. Please wait a moment.
```

## Best Practices

### For Users

1. **Use Slash Commands:** They provide better UX and validation
2. **Check Status First:** Use `/workflow status` to verify connectivity
3. **Test Before Production:** Use `/workflow test` before sending important data
4. **Read Help:** Use `/help` to understand all available features

### For Administrators

1. **Configure Channels:** Set `COMMAND_CHANNEL_ID` to limit where the bot processes messages
2. **Enable Debug Mode:** During setup and troubleshooting
3. **Monitor Logs:** Check `logs/app.log` for detailed information
4. **Set Proper Permissions:** Limit bot permissions to only what's necessary

## Integration Examples

### Basic n8n Workflow

Create an n8n workflow that:
1. Receives webhook data from Discord
2. Processes the message content
3. Triggers other automation based on content or user

### Advanced Use Cases

- **User Onboarding:** Welcome new users with automated workflows
- **Command Processing:** Create custom commands that trigger specific n8n workflows
- **Content Moderation:** Analyze message content and take automated actions
- **Analytics:** Collect and analyze Discord activity data
- **Cross-Platform Integration:** Bridge Discord with other services through n8n

## Troubleshooting Commands

If commands aren't working:

1. **Check Bot Status:**
   ```
   /workflow status
   ```

2. **Test Connectivity:**
   ```
   /workflow test
   ```

3. **Review Configuration:**
   - Verify environment variables
   - Check Discord bot permissions
   - Validate n8n webhook URLs

4. **Enable Debug Mode:**
   - Set `DEBUG_MODE=true`
   - Restart the bot
   - Observe response messages

5. **Check Logs:**
   - Review `logs/app.log`
   - Look for error messages
   - Verify webhook requests 