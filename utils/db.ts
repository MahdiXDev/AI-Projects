import type { User, Course } from '../types';

interface StoredUser extends User {
  password?: string;
}

const DB_NAME = 'CourseManagerDB';
const DB_VERSION = 1;
const USERS_STORE = 'users';
const COURSES_STORE = 'courses';
const SETTINGS_STORE = 'settings';

// FIX: Renamed 'db' to 'dbInstance' to avoid conflict with the exported 'db' object on line 122.
let dbInstance: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening database.');
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        db.createObjectStore(USERS_STORE, { keyPath: 'email' });
      }
      if (!db.objectStoreNames.contains(COURSES_STORE)) {
        db.createObjectStore(COURSES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
  });
};

const getAll = <T>(storeName: string): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    } catch (error) {
        reject(error);
    }
  });
};

const writeAll = <T>(storeName: string, data: T[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const clearRequest = store.clear();
        clearRequest.onerror = () => reject(clearRequest.error);
        clearRequest.onsuccess = () => {
            data.forEach(item => {
                store.put(item);
            });
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    } catch (error) {
        reject(error);
    }
  });
};


const getSetting = <T>(key: string): Promise<T | undefined> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(SETTINGS_STORE, 'readonly');
            const store = transaction.objectStore(SETTINGS_STORE);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : undefined);
            };
        } catch (error) {
            reject(error);
        }
    });
};

const setSetting = <T>(key: string, value: T): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
            const store = transaction.objectStore(SETTINGS_STORE);
            store.put({ key, value });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        } catch (error) {
            reject(error);
        }
    });
};

export const db = {
  getAllUsers: () => getAll<StoredUser>(USERS_STORE),
  saveAllUsers: (users: StoredUser[]) => writeAll<StoredUser>(USERS_STORE, users),
  getAllCourses: () => getAll<Course>(COURSES_STORE),
  saveAllCourses: (courses: Course[]) => writeAll<Course>(COURSES_STORE, courses),
  getSetting,
  setSetting
};
