import { listContacts } from "../src/commands";

// Mock the dependencies
jest.mock("../src/whatsapp", () => ({
    checkLoggedIn: jest.fn(),
    initWASocket: jest.fn(),
    terminate: jest.fn()
}));

jest.mock("signale", () => ({
    log: jest.fn(),
    warn: jest.fn()
}));

import { checkLoggedIn, initWASocket, terminate } from "../src/whatsapp";
import signale from "signale";

describe('listContacts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('list contacts with populated store', async () => {
        const mockSocket = {
            ev: {
                on: jest.fn((event, callback) => {
                    if (event === 'connection.update') {
                        // Simulate connection open
                        callback({ connection: 'open' });
                    }
                })
            }
        };

        const mockStore = {
            contacts: {
                'contact1': {
                    id: '1234567890@s.whatsapp.net',
                    name: 'John Doe',
                    notify: 'Johnny'
                },
                'contact2': {
                    id: '0987654321@s.whatsapp.net',
                    name: 'Jane Smith',
                    notify: null
                },
                'contact3': {
                    id: '1111111111@s.whatsapp.net',
                    name: null,
                    notify: 'Bob'
                }
            }
        };

        (initWASocket as jest.Mock).mockResolvedValue({ socket: mockSocket, store: mockStore });

        // Start the function
        const listContactsPromise = listContacts();

        // Fast-forward the setTimeout
        jest.advanceTimersByTime(2000);

        await listContactsPromise;

        expect(checkLoggedIn).toHaveBeenCalled();
        expect(initWASocket).toHaveBeenCalled();
        expect(signale.log).toHaveBeenCalledWith('{"name": "John Doe", "id": "1234567890@s.whatsapp.net"}');
        expect(signale.log).toHaveBeenCalledWith('{"name": "Jane Smith", "id": "0987654321@s.whatsapp.net"}');
        expect(signale.log).toHaveBeenCalledWith('{"name": "Bob", "id": "1111111111@s.whatsapp.net"}');
        expect(terminate).toHaveBeenCalledWith(mockSocket);
    });

    test('list contacts with empty store', async () => {
        const mockSocket = {
            ev: {
                on: jest.fn((event, callback) => {
                    if (event === 'connection.update') {
                        callback({ connection: 'open' });
                    }
                })
            }
        };

        const mockStore = {
            contacts: {}
        };

        (initWASocket as jest.Mock).mockResolvedValue({ socket: mockSocket, store: mockStore });

        const listContactsPromise = listContacts();
        jest.advanceTimersByTime(2000);
        await listContactsPromise;

        expect(signale.warn).toHaveBeenCalledWith('No contacts found. Make sure WhatsApp has finished syncing.');
        expect(terminate).toHaveBeenCalledWith(mockSocket);
    });

    test('list contacts with undefined contacts', async () => {
        const mockSocket = {
            ev: {
                on: jest.fn((event, callback) => {
                    if (event === 'connection.update') {
                        callback({ connection: 'open' });
                    }
                })
            }
        };

        const mockStore = {
            contacts: undefined
        };

        (initWASocket as jest.Mock).mockResolvedValue({ socket: mockSocket, store: mockStore });

        const listContactsPromise = listContacts();
        jest.advanceTimersByTime(2000);
        await listContactsPromise;

        expect(signale.warn).toHaveBeenCalledWith('No contacts found. Make sure WhatsApp has finished syncing.');
        expect(terminate).toHaveBeenCalledWith(mockSocket);
    });

    test('list contacts with contact having no name or notify', async () => {
        const mockSocket = {
            ev: {
                on: jest.fn((event, callback) => {
                    if (event === 'connection.update') {
                        callback({ connection: 'open' });
                    }
                })
            }
        };

        const mockStore = {
            contacts: {
                'contact1': {
                    id: '1234567890@s.whatsapp.net',
                    name: null,
                    notify: null
                }
            }
        };

        (initWASocket as jest.Mock).mockResolvedValue({ socket: mockSocket, store: mockStore });

        const listContactsPromise = listContacts();
        jest.advanceTimersByTime(2000);
        await listContactsPromise;

        expect(signale.log).toHaveBeenCalledWith('{"name": "Unknown", "id": "1234567890@s.whatsapp.net"}');
        expect(terminate).toHaveBeenCalledWith(mockSocket);
    });
});