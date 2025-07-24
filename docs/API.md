# NoseCone Bot - n8n Integration API

This document describes the API integration between the NoseCone Discord bot and n8n workflows, including webhook payload structures, authentication methods, and workflow examples.

> **📝 Important Update:** As of 2024, Discord has removed the Client Secret from their Developer Portal. Only the Bot Token and Client ID are now required for authentication.

## Overview

NoseCone sends Discord message data to n8n workflows via HTTP POST requests to configured webhook endpoints. The data is structured as JSON payloads containing comprehensive information about Discord messages, users, channels, and commands.

## Webhook Endpoints

### Primary Webhook (`N8N_WEBHOOK_URL`)

Receives all processed Discord messages including:
- Channel messages
- Direct messages  
- Slash command interactions
- Prefix command messages

### Secondary Webhook (`N8N_SECONDARY_WEBHOOK`)

Optional endpoint that receives only command-related data:
- Slash command interactions
- Prefix commands with parsed arguments
- Manual workflow triggers

## Authentication

### Bearer Token Authentication

Configure webhook authentication using the `N8N_WEBHOOK_TOKEN` environment variable:

```env
N8N_WEBHOOK_TOKEN=your_secret_token_here
```

**Request Headers:**
```http
Authorization: Bearer your_secret_token_here
Content-Type: application/json
User-Agent: NoseCone-Discord-Bot/1.0.0
```

### n8n Webhook Configuration

In your n8n webhook node, configure authentication:

1. **Authentication Method:** Header Auth
2. **Header Name:** `Authorization`
3. **Header Value:** `Bearer your_secret_token_here`

## Payload Structure

### Base Message Payload

All webhook requests contain this base structure:

```json
{
  "messageType": "channel|slash|dm",
  "message": {
    "id": "string",
    "content": "string", 
    "timestamp": "ISO-8601-datetime",
    "author": {
      "id": "string",
      "username": "string",
      "discriminator": "string",
      "roles": ["string"]
    },
    "channel": {
      "id": "string",
      "name": "string",
      "type": "string"
    },
    "guild": {
      "id": "string",
      "name": "string"
    }
  },
  "command": {
    "name": "string",
    "options": {},
    "type": "string"
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `messageType` | string | Type of message: "channel", "slash", or "dm" |
| `message.id` | string | Discord message ID (snowflake) |
| `message.content` | string | Message text content |
| `message.timestamp` | string | ISO-8601 formatted timestamp |
| `message.author.id` | string | Discord user ID (snowflake) |
| `message.author.username` | string | Discord username |
| `message.author.discriminator` | string | Discord discriminator (4 digits) |
| `message.author.roles` | array | Array of Discord role IDs |
| `message.channel.id` | string | Discord channel ID (snowflake) |
| `message.channel.name` | string | Channel name or "DM" for direct messages |
| `message.channel.type` | string | Discord channel type |
| `message.guild.id` | string | Discord guild (server) ID |
| `message.guild.name` | string | Discord guild name |
| `command.name` | string | Command name (if applicable) |
| `command.options` | object | Command options/arguments |
| `command.type` | string | Command type: "slash" or "prefix" |

## Message Types

### Channel Message

Regular message sent in a Discord channel:

```json
{
  "messageType": "channel",
  "message": {
    "id": "1234567890123456789",
    "content": "Hello everyone!",
    "timestamp": "2023-12-01T14:30:00.000Z",
    "author": {
      "id": "0987654321098765432",
      "username": "john_doe",
      "discriminator": "0000",
      "roles": ["111122223333444455", "666677778888999900"]
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
  }
}
```

### Direct Message

Private message sent directly to the bot:

```json
{
  "messageType": "dm",
  "message": {
    "id": "1234567890123456789",
    "content": "Hello bot!",
    "timestamp": "2023-12-01T14:30:00.000Z",
    "author": {
      "id": "0987654321098765432",
      "username": "jane_doe",
      "discriminator": "0000",
      "roles": []
    },
    "channel": {
      "id": "2222333344445555666",
      "name": "DM",
      "type": "DM"
    }
  }
}
```

### Slash Command

Discord application command interaction:

```json
{
  "messageType": "slash",
  "message": {
    "id": "1234567890123456789",
    "content": "/workflow trigger message:Hello from slash command",
    "timestamp": "2023-12-01T14:30:00.000Z",
    "author": {
      "id": "0987654321098765432",
      "username": "admin_user",
      "discriminator": "0000",
      "roles": ["111122223333444455"]
    },
    "channel": {
      "id": "1111222233334444555",
      "name": "bot-commands",
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
      "subcommand": "trigger",
      "message": "Hello from slash command"
    },
    "type": "slash"
  }
}
```

### Prefix Command

Traditional text-based command:

```json
{
  "messageType": "channel",
  "message": {
    "id": "1234567890123456789",
    "content": "!workflow test",
    "timestamp": "2023-12-01T14:30:00.000Z",
    "author": {
      "id": "0987654321098765432",
      "username": "user123",
      "discriminator": "0000",
      "roles": ["666677778888999900"]
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
    "args": ["test"],
    "prefix": "!",
    "type": "prefix"
  }
}
```

## HTTP Request Details

### Request Method
```http
POST
```

### Request Headers
```http
Content-Type: application/json
User-Agent: NoseCone-Discord-Bot/1.0.0
Authorization: Bearer <token> (if configured)
```

### Request Body
JSON payload as described in the payload structure section.

### Expected Response

n8n webhooks should respond with:

**Success (200 OK):**
```json
{
  "status": "success",
  "message": "Webhook received successfully"
}
```

**Error (4xx/5xx):**
```json
{
  "error": "Error description",
  "status": "error"
}
```

## n8n Workflow Examples

### Basic Message Logger

Simple workflow to log all Discord messages:

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "discord-bot",
        "responseMode": "onReceived",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "message_id",
              "value": "={{$json.message.id}}"
            },
            {
              "name": "author",
              "value": "={{$json.message.author.username}}"
            },
            {
              "name": "content",
              "value": "={{$json.message.content}}"
            },
            {
              "name": "channel",
              "value": "={{$json.message.channel.name}}"
            }
          ]
        },
        "options": {}
      },
      "name": "Set Message Data",
      "type": "n8n-nodes-base.set",
      "position": [450, 300]
    }
  ]
}
```

### Command Handler

Workflow that processes specific commands:

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "discord-commands"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.command.name}}",
              "operation": "equal",
              "value2": "workflow"
            }
          ]
        }
      },
      "name": "IF Workflow Command",
      "type": "n8n-nodes-base.if",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.command.options.subcommand}}",
              "operation": "equal",
              "value2": "trigger"
            }
          ]
        }
      },
      "name": "IF Trigger Subcommand",
      "type": "n8n-nodes-base.if",
      "position": [650, 200]
    }
  ]
}
```

### User Activity Tracker

Track user activity and generate analytics:

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "discord-activity"
      },
      "name": "Discord Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "discord_messages",
        "columns": "message_id, user_id, username, channel_id, channel_name, guild_id, content, timestamp",
        "additionalFields": {}
      },
      "name": "Insert to Database",
      "type": "n8n-nodes-base.postgres"
    },
    {
      "parameters": {
        "functionCode": "return items.map(item => {\n  const data = item.json;\n  return {\n    json: {\n      message_id: data.message.id,\n      user_id: data.message.author.id,\n      username: data.message.author.username,\n      channel_id: data.message.channel.id,\n      channel_name: data.message.channel.name,\n      guild_id: data.message.guild?.id || null,\n      content: data.message.content,\n      timestamp: data.message.timestamp\n    }\n  };\n});"
      },
      "name": "Transform Data",
      "type": "n8n-nodes-base.function"
    }
  ]
}
```

## Error Handling

### Connection Errors

When n8n webhooks are unreachable:

```json
{
  "error": "Failed to send data to n8n: ECONNREFUSED",
  "timestamp": "2023-12-01T14:30:00.000Z",
  "webhook_url": "https://your-n8n-instance.com/webhook/discord-bot"
}
```

### Authentication Errors

When webhook authentication fails:

```json
{
  "error": "Webhook authentication failed: Unauthorized",
  "status_code": 401,
  "timestamp": "2023-12-01T14:30:00.000Z"
}
```

### Timeout Errors

When webhook requests timeout (>10 seconds):

```json
{
  "error": "Webhook request timeout after 10000ms",
  "timestamp": "2023-12-01T14:30:00.000Z"
}
```

## Rate Limiting

The bot implements retry logic with exponential backoff:

- **Initial Retry Delay:** 1 second
- **Maximum Retries:** 3 attempts
- **Backoff Multiplier:** 2x (1s, 2s, 4s)
- **Request Timeout:** 10 seconds

## Testing Webhooks

### Manual Testing with cURL

Test your webhook endpoint manually:

```bash
curl -X POST \
  https://your-n8n-instance.com/webhook/discord-bot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "messageType": "test",
    "message": {
      "id": "test-message-id",
      "content": "Test message from cURL",
      "timestamp": "2023-12-01T14:30:00.000Z",
      "author": {
        "id": "test-user-id",
        "username": "test-user",
        "discriminator": "0000",
        "roles": []
      },
      "channel": {
        "id": "test-channel-id",
        "name": "test-channel",
        "type": "GUILD_TEXT"
      }
    }
  }'
```

### Using Bot Commands

Test connectivity from Discord:

```
/workflow test          # Test primary webhook
/workflow trigger Hello # Send test message
/workflow status        # Check overall status
```

## Best Practices

### n8n Workflow Design

1. **Always validate incoming data** using IF nodes
2. **Handle missing fields gracefully** with default values
3. **Log important events** for debugging
4. **Use error handling nodes** to prevent workflow failures
5. **Implement rate limiting** for external API calls

### Security

1. **Use webhook authentication** in production
2. **Validate Discord snowflake IDs** (17-19 digit numbers)
3. **Sanitize message content** before processing
4. **Implement request size limits** to prevent abuse
5. **Monitor webhook usage** for unusual patterns

### Performance

1. **Use asynchronous processing** for long-running tasks
2. **Implement caching** for frequently accessed data
3. **Batch database operations** when possible
4. **Set appropriate timeouts** for external services
5. **Monitor memory usage** in complex workflows

## Monitoring and Debugging

### Webhook Logs

Enable webhook logging in n8n to monitor incoming requests:

1. Go to n8n Settings
2. Enable "Log webhook requests"
3. Check execution logs for payload details

### Bot Logs

Check NoseCone bot logs for webhook-related issues:

```bash
tail -f logs/app.log | grep "n8n\|webhook"
```

### Common Debugging Steps

1. **Verify webhook URL accessibility**
2. **Check authentication token validity**
3. **Validate JSON payload structure**
4. **Test with simple n8n workflow**
5. **Monitor network connectivity**

## API Versioning

Current API version: **v1.0**

Breaking changes will result in version updates. Monitor release notes for API changes and deprecations. 