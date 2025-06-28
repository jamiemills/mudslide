import {getWhatsAppId, handleNewlines, parseGeoLocation} from "../src/whatsapp";

// Mock the contacts module
jest.mock("../src/contacts", () => ({
    findContact: jest.fn(() => null)
}));

test('get whatsapp id', async () => {
    expect(await getWhatsAppId({}, '3161234567890')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '3161234567890@s.whatsapp.net')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '123456789-987654321@g.us')).toBe('123456789-987654321@g.us');
    expect(await getWhatsAppId({user: {id: '3161234567890:1'}}, 'me')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '+3161234567890')).toBe('3161234567890@s.whatsapp.net');
})

test('get whatsapp id with local contacts - exact name match', async () => {
    const { findContact } = require("../src/contacts");
    
    findContact.mockReturnValueOnce({ name: 'John Doe', phoneNumber: '1234567890' });
    expect(await getWhatsAppId({}, 'John Doe')).toBe('1234567890@s.whatsapp.net');
    
    findContact.mockReturnValueOnce({ name: 'Jane Smith', phoneNumber: '0987654321' });
    expect(await getWhatsAppId({}, 'Jane Smith')).toBe('0987654321@s.whatsapp.net');
})

test('get whatsapp id with local contacts - partial name match', async () => {
    const { findContact } = require("../src/contacts");
    
    // Mock partial matches (the findContact function handles this internally)
    findContact.mockReturnValueOnce({ name: 'John Doe', phoneNumber: '1234567890' });
    expect(await getWhatsAppId({}, 'john')).toBe('1234567890@s.whatsapp.net');
    
    findContact.mockReturnValueOnce({ name: 'John Doe', phoneNumber: '1234567890' });
    expect(await getWhatsAppId({}, 'DOE')).toBe('1234567890@s.whatsapp.net');
    
    findContact.mockReturnValueOnce({ name: 'John Doe', phoneNumber: '1234567890' });
    expect(await getWhatsAppId({}, 'John')).toBe('1234567890@s.whatsapp.net');
})

test('get whatsapp id with local contacts - no match fallback to phone', async () => {
    const { findContact } = require("../src/contacts");
    
    // Mock no contact found
    findContact.mockReturnValue(null);
    
    expect(await getWhatsAppId({}, 'Unknown Person')).toBe('Unknown Person@s.whatsapp.net');
    expect(await getWhatsAppId({}, '9999999999')).toBe('9999999999@s.whatsapp.net');
})

test('get whatsapp id - phone number still works without local contacts', async () => {
    const { findContact } = require("../src/contacts");
    
    // Mock no contact found
    findContact.mockReturnValue(null);
    
    expect(await getWhatsAppId({}, '1234567890')).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '+1234567890')).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '1234567890@s.whatsapp.net')).toBe('1234567890@s.whatsapp.net');
})

test('parse geo location', () => {
    const result = parseGeoLocation('5', '10');

    expect(result[0]).toBe(5);
    expect(result[1]).toBe(10);
})

test('parse geo location, with enough precision', () => {
    const result = parseGeoLocation('33.8677835', '63.9863332');

    expect(result[0]).toBe(33.8677835);
    expect(result[1]).toBe(63.9863332);
})

test('parse geo location, negative values (southern hemisphere', () => {
    const result = parseGeoLocation('-33.8677835', '-63.9863332');

    expect(result[0]).toBe(-33.8677835);
    expect(result[1]).toBe(-63.9863332);
})

test('parse geo location, round coords', () => {
    const result = parseGeoLocation('5.123456789', '10.123456789');

    expect(result[0]).toBe(5.1234568);
    expect(result[1]).toBe(10.1234568);
})

test('handle newlines', () => {
    expect(handleNewlines('hello world')).toBe('hello world');
    expect(handleNewlines('hello\\nworld')).toBe('hello\nworld');
    expect(handleNewlines('hello\\nworld\\n')).toBe('hello\nworld\n');
    expect(handleNewlines()).toBeUndefined();
})