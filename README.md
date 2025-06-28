# WhatsApp CLI Tool

Send and receive WhatsApp messages from the command-line 📱💻

## About

This is a fork of [Mudslide](https://github.com/robvanderleek/mudslide) with enhanced features for local contact management and message receiving capabilities.

This project is based on [Baileys](https://github.com/WhiskeySockets/Baileys),
a full-featured WhatsApp Web+Multi-Device API library. Keep in mind that the working of this tool depends on the Baileys library and since that is not an official supported library by WhatsApp it could stop working without notice.

## Features

✅ **Send Messages** - Text, images, files, locations, and polls  
✅ **Receive Messages** - Real-time message listening and chat history  
✅ **Local Contact Management** - JSON-based contact storage with CRUD operations  
✅ **Group Management** - Add/remove participants, list groups  
✅ **Multiple Recipients** - Phone numbers, contact names, groups, or "me"  
✅ **Cross-Platform** - Works on Linux, macOS, and Windows  

## Table of Contents

* [Quick Start](#quick-start)
* [Installation](#installation)
* [Local Contact Management](#local-contact-management)
* [Sending Messages](#sending-messages)
* [Receiving Messages](#receiving-messages)
* [Group Management](#group-management)
* [Configuration](#configuration)
* [Development](#development)
* [Troubleshooting](#troubleshooting)
* [FAQ](#faq)

## Quick Start

### Prerequisites

* Node.js 16 or higher
* npm or yarn package manager

### Setup

1. **Clone and setup:**

   ```shell
   git clone https://github.com/jamiemills/mudslide.git
   cd mudslide
   npm install
   npm run build
   ```

2. **Login to WhatsApp:**

   ```shell
   npm start -- login
   ```

   Scan the QR code with your WhatsApp mobile app.

3. **Add some contacts:**

   ```shell
   npm start -- add-contact 'John Doe' '1234567890'
   npm start -- add-contact 'Jane Smith' '+44987654321'
   ```

4. **Send your first message:**

   ```shell
   npm start -- send 'John Doe' 'Hello from CLI!'
   ```

5. **Listen for incoming messages:**

   ```shell
   npm start -- listen
   ```

## Installation

### Using npm globally

```shell
npm install -g mudslide
```

### Using npx (no installation)

```shell
npx mudslide@latest --help
```

### From source (development)

```shell
git clone https://github.com/jamiemills/mudslide.git
cd mudslide
npm install
npm run build
npm start -- --help
```

## Local Contact Management

This tool includes a built-in contact management system that stores contacts locally in JSON format, independent of WhatsApp's contact synchronization.

### Managing Contacts

**Add a contact:**

```shell
npm start -- add-contact 'John Doe' '1234567890'
npm start -- add-contact 'Jane Smith' '+44987654321'
```

**List all contacts:**

```shell
npm start -- contacts
```

**Update a contact:**

```shell
npm start -- update-contact 'John Doe' '0987654321'
```

**Remove a contact:**

```shell
npm start -- remove-contact 'John Doe'
```

### Using Contact Names

Once you've added contacts, you can use their names in any command:

```shell
npm start -- send 'John Doe' 'Hello there!'
npm start -- send-image 'Jane Smith' photo.jpg
npm start -- send-file 'John Doe' document.pdf
```

**Partial name matching** is supported:

```shell
npm start -- send john 'This works too!'
```

## Sending Messages

### Text Messages

```shell
# Send to yourself
npm start -- send me 'Test message'

# Send to a phone number
npm start -- send 1234567890 'Hello world'

# Send to a contact by name
npm start -- send 'John Doe' 'Hello John!'

# Send to a group (requires group ID)
npm start -- send 123456789-987654321@g.us 'Hello group!'

# Multi-line messages
npm start -- send me 'Line 1\nLine 2\nLine 3'
```

### Images

```shell
npm start -- send-image me photo.jpg
npm start -- send-image 'John Doe' photo.png --caption 'Check this out!'
```

### Files

```shell
# Send as document
npm start -- send-file 'Jane Smith' document.pdf

# Send as audio
npm start -- send-file 'John Doe' music.mp3 --type audio

# Send as video
npm start -- send-file me video.mp4 --type video
```

### Locations

```shell
# Eiffel Tower
npm start -- send-location 'John Doe' 48.858222 2.2945

# Sydney Opera House
npm start -- send-location me -33.857058 151.214897
```

### Polls

```shell
npm start -- send-poll 'John Doe' 'Favorite color?' --item 'Red' --item 'Blue' --item 'Green'

# Allow multiple selections
npm start -- send-poll 123456789-987654321@g.us 'Weekend plans?' --item 'Movies' --item 'Hiking' --item 'Gaming' --selectable 2
```

## Receiving Messages

### Real-time Message Listening

**Start listening:**

```shell
npm start -- listen
```

**Listen with timeout:**

```shell
npm start -- listen --timeout 30
```

### Chat Management

**List recent chats:**

```shell
npm start -- chats
```

**Get message history:**

```shell
npm start -- messages 1234567890@s.whatsapp.net
npm start -- messages 123456789-987654321@g.us --count 50
```

## Group Management

### List Groups

```shell
npm start -- groups
```

### Add/Remove Participants

```shell
# Add participant
npm start -- add-to-group 123456789-987654321@g.us 1234567890
npm start -- add-to-group 123456789-987654321@g.us 'John Doe'

# Remove participant
npm start -- remove-from-group 123456789-987654321@g.us 1234567890
npm start -- remove-from-group 123456789-987654321@g.us 'John Doe'
```

### List Group Participants

```shell
npm start -- list-group 123456789-987654321@g.us
```

## Configuration

### Authentication Cache

By default, WhatsApp credentials are cached in:

* **Linux/macOS:** `~/.local/share/mudslide`
* **Windows:** `AppData\Local\mudslide\Data`

Override with environment variable:

```shell
export MUDSLIDE_CACHE_FOLDER=/custom/path
```

Or use the command-line option:

```shell
npm start -- --cache /custom/path contacts
```

### Proxy Support

```shell
export HTTP_PROXY=http://proxy.server.com:80
export HTTPS_PROXY=http://proxy.server.com:80
npm start -- --proxy login
```

## Development

### Running Tests

```shell
npm test
```

### Building

```shell
npm run build
```

### Development Commands

```shell
# Show help
npm start -- --help

# Show current user
npm start -- me

# Increase verbosity
npm start -- -vvv contacts
```

## Troubleshooting

### Connection Issues

1. **Logout and login again:**

   ```shell
   npm start -- logout
   npm start -- login
   ```

2. **Clear cache folder:**

   ```shell
   rm -rf ~/.local/share/mudslide
   npm start -- login
   ```

3. **Increase verbosity:**

   ```shell
   npm start -- -vvv send me 'test'
   ```

### Common Problems

* **"Not logged in"** - Run `npm start -- login` first
* **"Contact not found"** - Use `npm start -- contacts` to list available contacts
* **"Invalid file"** - Check file path and permissions
* **Messages not sending** - Check internet connection and WhatsApp Web status

## FAQ

### Can I read messages?

Yes! This tool supports receiving and listening for messages in real-time using the `listen` command, and you can get message history with the `messages` command.

### How are contacts stored?

Contacts are stored locally in a JSON file at `~/.local/share/mudslide/contacts.json`. This is independent of WhatsApp's contact synchronization.

### Can I use this in scripts?

Yes! The tool is designed for automation and scripting. All commands return appropriate exit codes and JSON output where applicable.

### Is this secure?

The tool uses the same encryption as WhatsApp Web. Authentication tokens are stored locally in your cache folder.

## Contributing

If you have suggestions for improvements or want to report a bug, [open an issue](https://github.com/jamiemills/mudslide/issues)!

## License

[ISC](LICENSE) © 2022 Rob van der Leek <robvanderleek@gmail.com>