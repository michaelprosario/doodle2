import { Injectable } from '@angular/core';

export interface StorageData {
  version: number;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_VERSION = 1;
  private readonly VERSION_KEY = 'doodle2_storage_version';

  constructor() {
    this.checkVersion();
  }

  /**
   * Save data to LocalStorage
   */
  save<T>(key: string, data: T): boolean {
    try {
      const storageData: StorageData = {
        version: this.STORAGE_VERSION,
        data: this.serialize(data),
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error(`Error saving data to LocalStorage for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Load data from LocalStorage
   */
  load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      
      const storageData: StorageData = JSON.parse(item);
      
      // Check version compatibility
      if (storageData.version !== this.STORAGE_VERSION) {
        console.warn(`Storage version mismatch for key "${key}". Expected ${this.STORAGE_VERSION}, got ${storageData.version}`);
        // Could implement migration logic here
      }
      
      return this.deserialize<T>(storageData.data);
    } catch (error) {
      console.error(`Error loading data from LocalStorage for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Delete data from LocalStorage
   */
  delete(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error deleting data from LocalStorage for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all data from LocalStorage (use with caution)
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing LocalStorage:', error);
      return false;
    }
  }

  /**
   * Check if key exists in LocalStorage
   */
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys stored in LocalStorage
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Get storage size in bytes
   */
  getStorageSize(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    }
    return total;
  }

  /**
   * Serialize data with Date handling
   */
  private serialize<T>(data: T): any {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    }));
  }

  /**
   * Deserialize data with Date handling
   */
  private deserialize<T>(data: any): T {
    return JSON.parse(JSON.stringify(data), (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  }

  /**
   * Check storage version and handle migrations
   */
  private checkVersion(): void {
    const storedVersion = localStorage.getItem(this.VERSION_KEY);
    if (!storedVersion) {
      localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION.toString());
    } else if (parseInt(storedVersion) !== this.STORAGE_VERSION) {
      console.log('Storage version changed. Migration may be needed.');
      // Implement migration logic here if needed
      localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION.toString());
    }
  }
}
