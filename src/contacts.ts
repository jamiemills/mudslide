import * as fs from "fs";
import * as path from "path";
import { getAuthStateCacheFolderLocation } from "./whatsapp";

export interface Contact {
    name: string;
    phoneNumber: string;
}

export interface ContactStore {
    [name: string]: Contact;
}

/**
 * Get the path to the local contacts file
 */
function getContactsFilePath(): string {
    const cacheFolder = getAuthStateCacheFolderLocation();
    return path.join(cacheFolder, 'contacts.json');
}

/**
 * Load contacts from local JSON file
 */
export function loadContacts(): ContactStore {
    const filePath = getContactsFilePath();
    
    if (!fs.existsSync(filePath)) {
        return {};
    }
    
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn('Could not load contacts file, starting with empty contacts');
        return {};
    }
}

/**
 * Save contacts to local JSON file
 */
export function saveContacts(contacts: ContactStore): void {
    const filePath = getContactsFilePath();
    
    try {
        fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2), 'utf8');
    } catch (error: any) {
        throw new Error(`Could not save contacts: ${error.message}`);
    }
}

/**
 * Add a new contact
 */
export function addContact(name: string, phoneNumber: string): void {
    const contacts = loadContacts();
    
    // Normalize phone number (remove spaces, ensure no + prefix for storage)
    const normalizedPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
    
    contacts[name] = {
        name,
        phoneNumber: normalizedPhone
    };
    
    saveContacts(contacts);
}

/**
 * Remove a contact by name
 */
export function removeContact(name: string): boolean {
    const contacts = loadContacts();
    
    if (contacts[name]) {
        delete contacts[name];
        saveContacts(contacts);
        return true;
    }
    
    return false;
}

/**
 * Update an existing contact
 */
export function updateContact(name: string, newPhoneNumber: string): boolean {
    const contacts = loadContacts();
    
    if (contacts[name]) {
        const normalizedPhone = newPhoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
        contacts[name].phoneNumber = normalizedPhone;
        saveContacts(contacts);
        return true;
    }
    
    return false;
}

/**
 * Find a contact by name (case-insensitive, partial match)
 */
export function findContact(nameQuery: string): Contact | null {
    const contacts = loadContacts();
    const query = nameQuery.toLowerCase();
    
    // Try exact match first
    for (const [name, contact] of Object.entries(contacts)) {
        if (name.toLowerCase() === query) {
            return contact;
        }
    }
    
    // Try partial match
    for (const [name, contact] of Object.entries(contacts)) {
        if (name.toLowerCase().includes(query)) {
            return contact;
        }
    }
    
    return null;
}

/**
 * Get all contacts
 */
export function getAllContacts(): ContactStore {
    return loadContacts();
}

/**
 * Check if a contact exists
 */
export function contactExists(name: string): boolean {
    const contacts = loadContacts();
    return contacts[name] !== undefined;
}