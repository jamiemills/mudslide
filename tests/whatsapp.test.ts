import {getWhatsAppId, handleNewlines, parseGeoLocation} from "../src/whatsapp";

test('get whatsapp id', async () => {
    expect(await getWhatsAppId({}, '3161234567890')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '3161234567890@s.whatsapp.net')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '123456789-987654321@g.us')).toBe('123456789-987654321@g.us');
    expect(await getWhatsAppId({user: {id: '3161234567890:1'}}, 'me')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '+3161234567890')).toBe('3161234567890@s.whatsapp.net');
})

test('get whatsapp id with contact store - exact name match', async () => {
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
                notify: 'Jane'
            }
        }
    };
    
    expect(await getWhatsAppId({}, 'John Doe', mockStore)).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, 'Jane Smith', mockStore)).toBe('0987654321@s.whatsapp.net');
})

test('get whatsapp id with contact store - partial name match', async () => {
    const mockStore = {
        contacts: {
            'contact1': {
                id: '1234567890@s.whatsapp.net',
                name: 'John Doe',
                notify: 'Johnny'
            }
        }
    };
    
    expect(await getWhatsAppId({}, 'john', mockStore)).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, 'DOE', mockStore)).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, 'John', mockStore)).toBe('1234567890@s.whatsapp.net');
})

test('get whatsapp id with contact store - notify name match', async () => {
    const mockStore = {
        contacts: {
            'contact1': {
                id: '1234567890@s.whatsapp.net',
                name: 'John Doe',
                notify: 'Johnny'
            }
        }
    };
    
    expect(await getWhatsAppId({}, 'Johnny', mockStore)).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, 'johnny', mockStore)).toBe('1234567890@s.whatsapp.net');
})

test('get whatsapp id with contact store - no match fallback to phone', async () => {
    const mockStore = {
        contacts: {
            'contact1': {
                id: '1234567890@s.whatsapp.net',
                name: 'John Doe',
                notify: 'Johnny'
            }
        }
    };
    
    expect(await getWhatsAppId({}, 'Unknown Person', mockStore)).toBe('Unknown Person@s.whatsapp.net');
    expect(await getWhatsAppId({}, '9999999999', mockStore)).toBe('9999999999@s.whatsapp.net');
})

test('get whatsapp id with empty contact store', async () => {
    const mockStore = {
        contacts: {}
    };
    
    expect(await getWhatsAppId({}, 'John Doe', mockStore)).toBe('John Doe@s.whatsapp.net');
})

test('get whatsapp id with undefined store', async () => {
    expect(await getWhatsAppId({}, 'John Doe', undefined)).toBe('John Doe@s.whatsapp.net');
})

test('get whatsapp id with contact store - phone number still works', async () => {
    const mockStore = {
        contacts: {
            'contact1': {
                id: '1234567890@s.whatsapp.net',
                name: 'John Doe',
                notify: 'Johnny'
            }
        }
    };
    
    expect(await getWhatsAppId({}, '1234567890', mockStore)).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '+1234567890', mockStore)).toBe('1234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '1234567890@s.whatsapp.net', mockStore)).toBe('1234567890@s.whatsapp.net');
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