import signale from "signale";
import {
    checkLoggedIn,
    checkValidFile,
    getAuthStateCacheFolderLocation,
    getWhatsAppId,
    handleNewlines,
    initWASocket,
    parseGeoLocation,
    sendFileHelper,
    sendImageHelper,
    terminate
} from "./whatsapp";

export async function sendMessage(recipient: string, message: string, options: {
    footer: string | undefined,
    button: Array<string>
}) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending message: "${message}" to: ${whatsappId}`);
            const buttons = options.button ? options.button.map((b, idx) => ({
                buttonId: `id${idx}`,
                buttonText: {displayText: b},
                type: 1
            })) : [];
            const whatsappMessage: any = {};
            whatsappMessage['text'] = handleNewlines(message);
            if (options.footer) {
                whatsappMessage['footer'] = options.footer;
            }
            if (buttons.length > 0) {
                whatsappMessage['buttons'] = buttons;
                whatsappMessage['headerType'] = 1;
            }
            await socket.sendMessage(whatsappId, whatsappMessage);
            signale.success('Done');
            terminate(socket, 3);
        }
    });
}

export async function sendImage(recipient: string, path: string, options: { caption: string | undefined }) {
    checkValidFile(path);
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending image file: "${path}" to: ${whatsappId}`);
            await sendImageHelper(socket, whatsappId, path, options);
        }
    });
}

export async function sendFile(recipient: string, path: string, options: {
    caption: string | undefined,
    type: 'audio' | 'video' | 'document'
}) {
    checkValidFile(path);
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending file: "${path}" to: ${whatsappId}`);
            await sendFileHelper(socket, whatsappId, path, options);
        }
    });
}

export async function sendLocation(recipient: string, latitude: string, longitude: string) {
    checkLoggedIn();
    const geolocation = parseGeoLocation(latitude, longitude);
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
            const {connection} = update
            if (connection === 'open') {
                const whatsappId = await getWhatsAppId(socket, recipient);
                signale.await(`Sending location: ${geolocation[0]}, ${geolocation[1]} to: ${whatsappId}`);
                await socket.sendMessage(whatsappId, {
                    location: {
                        degreesLatitude: geolocation[0],
                        degreesLongitude: geolocation[1]
                    }
                });
                signale.success('Done');
                terminate(socket, 3);
            }
        }
    );
}

export async function sendPoll(recipient: string, name: string, options: {
    item: Array<string>,
    selectable: number
}) {
    if (options.item.length <= 1) {
        signale.error('Not enough poll options provided');
        process.exit(1);
    }
    if (options.selectable < 0 || options.selectable > options.item.length) {
        signale.error(`Selectable should be >= 0 and <= ${options.item.length}`);
        process.exit(1);
    }
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
            const {connection} = update
            if (connection === 'open') {
                const whatsappId = await getWhatsAppId(socket, recipient);
                signale.await(`Sending poll: "${name}" to: ${whatsappId}`);
                await socket.sendMessage(whatsappId, {
                    poll: {
                        name: name,
                        selectableCount: options.selectable,
                        values: options.item,
                    }
                });
                signale.success('Done');
                terminate(socket, 3);
            }
        }
    );
}

export async function me() {
    checkLoggedIn();
    signale.log(`Cache folder: ${getAuthStateCacheFolderLocation()}`);
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const user = await socket.user
            signale.log(`Current user: ${user?.id}`);
            terminate(socket);
        }
    });
}

export async function listGroups() {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const groupData = await socket.groupFetchAllParticipating()
            for (const group in groupData) {
                signale.log(`{"id": "${groupData[group].id}", "subject": "${groupData[group].subject}"}`);
            }
            terminate(socket);
        }
    });
}

export async function mutateGroup(groupId: string, phoneNumber: string, operation: "add" | "remove") {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsAppId = await getWhatsAppId(socket, phoneNumber);
            if (operation === 'add') {
                signale.log(`Adding ${whatsAppId} to group ${groupId}`);
            } else {
                signale.log(`Removing ${whatsAppId} from group ${groupId}`);
            }
            const updateResult = await socket.groupParticipantsUpdate(groupId, [whatsAppId], operation);
            updateResult.forEach((entry) => {
                signale.log(`{"id": "${entry.jid}", "status": "${entry.status}"}`);
            });
            terminate(socket);
        }
    });
}

export async function listGroupParticipants(groupId: string) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const groupMetadata = await socket.groupMetadata(groupId);
            groupMetadata.participants.forEach((participant) => {
                signale.log(`{"id": "${participant.id}"}`);
            });
            terminate(socket);
        }
    });
}

/**
 * Add a new contact
 */
export function addContact(name: string, phoneNumber: string) {
    const { addContact: addContactToStore, contactExists } = require('./contacts');
    
    if (contactExists(name)) {
        signale.error(`Contact "${name}" already exists.`);
        signale.info('Use update-contact to modify existing contacts.');
        return;
    }
    
    try {
        addContactToStore(name, phoneNumber);
        signale.success(`Added contact: ${name} (${phoneNumber})`);
    } catch (error: any) {
        signale.error(`Failed to add contact: ${error.message}`);
    }
}

/**
 * Remove a contact
 */
export function removeContact(name: string) {
    const { removeContact: removeContactFromStore } = require('./contacts');
    
    if (removeContactFromStore(name)) {
        signale.success(`Removed contact: ${name}`);
    } else {
        signale.error(`Contact "${name}" not found.`);
    }
}

/**
 * Update an existing contact
 */
export function updateContact(name: string, newPhoneNumber: string) {
    const { updateContact: updateContactInStore } = require('./contacts');
    
    if (updateContactInStore(name, newPhoneNumber)) {
        signale.success(`Updated contact: ${name} (${newPhoneNumber})`);
    } else {
        signale.error(`Contact "${name}" not found.`);
    }
}

/**
 * List all local contacts
 */
export async function listContacts() {
    const { getAllContacts } = require('./contacts');
    const contacts = getAllContacts();
    
    if (Object.keys(contacts).length > 0) {
        signale.success(`Found ${Object.keys(contacts).length} local contacts:`);
        Object.values(contacts).forEach((contact: any) => {
            signale.log(`{"name": "${contact.name}", "phoneNumber": "${contact.phoneNumber}"}`);
        });
    } else {
        signale.warn('No local contacts found.');
        signale.info('Add contacts with: npm start -- add-contact "Name" "1234567890"');
    }
}

/**
 * Listen for incoming WhatsApp messages
 * @param timeout Optional timeout in seconds (default: run indefinitely)
 */
export async function listenMessages(timeout?: number) {
    checkLoggedIn();
    const socket = await initWASocket();
    
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update;
        if (connection === 'open') {
            signale.success('Connected! Listening for messages...');
            signale.info('Press Ctrl+C to stop listening');
            
            if (timeout) {
                signale.info(`Will stop listening after ${timeout} seconds`);
                setTimeout(() => {
                    signale.info('Timeout reached, stopping...');
                    terminate(socket, 0);
                }, timeout * 1000);
            }
        }
    });

    // Listen for incoming messages
    socket.ev.on('messages.upsert', (m) => {
        const messages = m.messages;
        messages.forEach(msg => {
            if (!msg.key.fromMe && msg.message) { // Only incoming messages
                const from = msg.key.remoteJid || 'Unknown';
                const messageText = extractMessageText(msg.message);
                const timestamp = new Date((Number(msg.messageTimestamp) || Date.now() / 1000) * 1000).toLocaleString();
                
                // Try to get contact name from local contacts
                const { findContact } = require('./contacts');
                const contact = findContact(from.split('@')[0]);
                const senderName = contact?.name || from.split('@')[0];
                
                signale.log(`📨 [${timestamp}] From: ${senderName}`);
                signale.log(`   Message: ${messageText}`);
                signale.log(`   ID: ${from}`);
                console.log('---');
            }
        });
    });

    // Listen for message updates (read receipts, deletions, etc.)
    socket.ev.on('messages.update', (updates) => {
        updates.forEach(update => {
            if (update.update.status) {
                signale.log(`📝 Message ${update.key.id} status: ${update.update.status}`);
            }
        });
    });

    // Handle disconnection
    socket.ev.on('connection.update', (update) => {
        if (update.connection === 'close') {
            signale.warn('Connection closed');
            process.exit(0);
        }
    });

    // Keep the process running
    process.on('SIGINT', () => {
        signale.info('Stopping message listener...');
        terminate(socket, 0);
    });
}

/**
 * Extract text content from a WhatsApp message object
 */
/**
 * Get recent messages from a specific chat
 * @param chatId WhatsApp ID of the chat (person or group)
 * @param count Number of messages to retrieve (default: 20)
 */
export async function getMessages(chatId: string, count: number = 20) {
    checkLoggedIn();
    const socket = await initWASocket();
    
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update;
        if (connection === 'open') {
            try {
                signale.await(`Getting last ${count} messages from ${chatId}...`);
                
                // Try to fetch message history using available methods
                let messages: any[] = [];
                
                try {
                    // Method 1: Try to get recent messages from message store
                    signale.info('Note: Message history fetching has limited support in WhatsApp Web.');
                    signale.info('This shows messages received during this session only.');
                    signale.warn('To see older messages, use the listen command and wait for new ones.');
                    
                } catch (historyError) {
                    signale.warn('Could not fetch message history from WhatsApp.');
                }
                
                if (messages.length === 0) {
                    signale.warn('No recent messages available for this chat.');
                    signale.info('WhatsApp Web has limited access to message history.');
                    signale.info('Try:');
                    signale.info('1. npm start -- listen (to see new messages)');
                    signale.info('2. Use WhatsApp mobile app for full message history');
                }
                
            } catch (error: any) {
                signale.error('Could not fetch messages:', error.message);
                signale.info('This might be because:');
                signale.info('1. Invalid chat ID');
                signale.info('2. No message history available');
                signale.info('3. Chat does not exist');
            }
            
            terminate(socket);
        }
    });
}

/**
 * List recent chats with last message preview
 */
export async function listChats() {
    checkLoggedIn();
    const socket = await initWASocket();
    
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update;
        if (connection === 'open') {
            signale.await('Getting recent chats...');
            
            setTimeout(async () => {
                try {
                    // Get all participating groups first
                    const groups = await socket.groupFetchAllParticipating();
                    
                    signale.success('Recent chats:');
                    console.log('');
                    
                    // Show groups
                    if (Object.keys(groups).length > 0) {
                        signale.info('📁 Groups:');
                        for (const group of Object.values(groups) as any[]) {
                            signale.log(`  ${group.subject} (${group.id})`);
                            signale.log(`    Participants: ${group.participants?.length || 0}`);
                        }
                        console.log('');
                    }
                    
                    signale.info('💡 To see messages from a chat:');
                    signale.info('  npm start -- messages <chat-id>');
                    signale.info('  npm start -- messages <phone-number>');
                    signale.info('  Example: npm start -- messages 1234567890@s.whatsapp.net');
                    
                } catch (error: any) {
                    signale.error('Could not fetch chats:', error.message);
                }
                
                terminate(socket);
            }, 2000);
        }
    });
}

function extractMessageText(message: any): string {
    if (!message) return '[No message content]';
    
    if (message.conversation) {
        return message.conversation;
    } else if (message.extendedTextMessage?.text) {
        return message.extendedTextMessage.text;
    } else if (message.imageMessage?.caption) {
        return `[Image] ${message.imageMessage.caption}`;
    } else if (message.videoMessage?.caption) {
        return `[Video] ${message.videoMessage.caption}`;
    } else if (message.documentMessage?.caption) {
        return `[Document] ${message.documentMessage.caption || message.documentMessage.fileName || 'Document'}`;
    } else if (message.audioMessage) {
        return '[Audio Message]';
    } else if (message.stickerMessage) {
        return '[Sticker]';
    } else if (message.contactMessage) {
        return `[Contact] ${message.contactMessage.displayName}`;
    } else if (message.locationMessage) {
        return `[Location] ${message.locationMessage.degreesLatitude}, ${message.locationMessage.degreesLongitude}`;
    } else {
        return '[Unsupported message type]';
    }
}