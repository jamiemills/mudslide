import { listContacts } from "../src/commands";
import { getWhatsAppId } from "../src/whatsapp";

// Mock only specific dependencies
jest.mock("../src/whatsapp", () => {
    const actual = jest.requireActual("../src/whatsapp");
    return {
        ...actual,
        checkLoggedIn: jest.fn(),
        initWASocket: jest.fn(),
        terminate: jest.fn()
    };
});

// Mock the contacts module
jest.mock("../src/contacts", () => ({
    getAllContacts: jest.fn(() => ({})),
    findContact: jest.fn(() => null),
    addContact: jest.fn(),
    removeContact: jest.fn(),
    updateContact: jest.fn(),
    contactExists: jest.fn(() => false)
}));

jest.mock("signale", () => ({
    log: jest.fn(),
    warn: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
}));

import { checkLoggedIn, initWASocket, terminate } from "../src/whatsapp";

describe('listContacts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('list contacts shows local contacts', async () => {
        const { getAllContacts } = require("../src/contacts");
        
        getAllContacts.mockReturnValue({
            'John Doe': { name: 'John Doe', phoneNumber: '1234567890' },
            'Jane Smith': { name: 'Jane Smith', phoneNumber: '0987654321' }
        });

        // Call the function
        await listContacts();

        // Verify local contacts were retrieved
        expect(getAllContacts).toHaveBeenCalled();
    });

    test('getWhatsAppId works with local contacts', async () => {
        const { findContact } = require("../src/contacts");
        
        // Mock finding a contact
        findContact.mockReturnValue({
            name: 'John Doe',
            phoneNumber: '1234567890'
        });

        // Test exact name match from local contacts
        const result1 = await getWhatsAppId({}, 'John Doe');
        expect(result1).toBe('1234567890@s.whatsapp.net');

        // Reset mock for next test
        findContact.mockReturnValue(null);

        // Test phone number fallback when contact not found
        const result2 = await getWhatsAppId({}, 'Unknown Person');
        expect(result2).toBe('Unknown Person@s.whatsapp.net');
    });

    test('getWhatsAppId backward compatibility with phone numbers', async () => {
        const { findContact } = require("../src/contacts");
        findContact.mockReturnValue(null); // No contact found
        
        // Test phone number
        const result1 = await getWhatsAppId({}, '1234567890');
        expect(result1).toBe('1234567890@s.whatsapp.net');

        // Test with existing WhatsApp ID
        const result2 = await getWhatsAppId({}, '1234567890@s.whatsapp.net');
        expect(result2).toBe('1234567890@s.whatsapp.net');

        // Test with + prefix
        const result3 = await getWhatsAppId({}, '+1234567890');
        expect(result3).toBe('1234567890@s.whatsapp.net');
    });
});