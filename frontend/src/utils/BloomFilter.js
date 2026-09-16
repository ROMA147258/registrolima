/**
 * Client-Side Bloom Filter Implementation for high-performance searching and filtering.
 * Kirsch-Mitzenmacher double-hashing technique for optimal CPU and memory efficiency.
 */
export class BloomFilter {
  constructor(expectedItems = 100, falsePositiveRate = 0.01) {
    this.expectedItems = Math.max(10, expectedItems);
    this.falsePositiveRate = Math.min(0.5, Math.max(0.001, falsePositiveRate));

    this.size = Math.ceil(- (this.expectedItems * Math.log(this.falsePositiveRate)) / (Math.LN2 * Math.LN2));
    this.numHashes = Math.max(1, Math.round((this.size / this.expectedItems) * Math.LN2));
    this.bitArray = new Uint32Array(Math.ceil(this.size / 32));
    this.count = 0;
  }

  _hash1(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  _hash2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(hash, 33) ^ str.charCodeAt(i)) >>> 0;
    }
    return hash >>> 0;
  }

  _normalize(item) {
    if (item === null || item === undefined) return '';
    return String(item).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  add(item) {
    const key = this._normalize(item);
    if (!key) return;

    const h1 = this._hash1(key);
    const h2 = this._hash2(key);

    for (let i = 0; i < this.numHashes; i++) {
      const bitIndex = ((h1 + Math.imul(i, h2)) >>> 0) % this.size;
      const arrayIndex = (bitIndex / 32) | 0;
      const bitOffset = bitIndex % 32;
      this.bitArray[arrayIndex] |= (1 << bitOffset);
    }
    this.count++;
  }

  has(item) {
    const key = this._normalize(item);
    if (!key) return false;

    const h1 = this._hash1(key);
    const h2 = this._hash2(key);

    for (let i = 0; i < this.numHashes; i++) {
      const bitIndex = ((h1 + Math.imul(i, h2)) >>> 0) % this.size;
      const arrayIndex = (bitIndex / 32) | 0;
      const bitOffset = bitIndex % 32;

      if ((this.bitArray[arrayIndex] & (1 << bitOffset)) === 0) {
        return false;
      }
    }
    return true;
  }

  addAll(items) {
    if (Array.isArray(items)) {
      items.forEach(item => this.add(item));
    }
  }

  clear() {
    this.bitArray.fill(0);
    this.count = 0;
  }
}

/**
 * High-performance search accelerator using Bloom Filters.
 * Creates an in-memory Bloom filter for each record/school based on its tokens and n-grams.
 */
export class BloomSearchAccelerator {
  constructor() {
    this.index = new WeakMap();
  }

  /**
   * Extract searchable tokens and prefixes/substrings from an object
   */
  _extractTokens(obj) {
    const tokens = new Set();
    const addString = (str) => {
      if (!str) return;
      const clean = String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (!clean) return;

      // Add full word
      tokens.add(clean);

      // Split into words
      const words = clean.split(/[^a-z0-9]+/);
      words.forEach(w => {
        if (w.length >= 2) {
          tokens.add(w);
          // Add prefixes (for typeahead matching)
          for (let len = 2; len <= Math.min(w.length, 8); len++) {
            tokens.add(w.slice(0, len));
          }
        }
      });
    };

    if (typeof obj === 'string') {
      addString(obj);
    } else if (obj && typeof obj === 'object') {
      // Index all relevant fields
      Object.values(obj).forEach(val => {
        if (typeof val === 'string' || typeof val === 'number') {
          addString(String(val));
        } else if (Array.isArray(val)) {
          val.forEach(item => {
            if (typeof item === 'string' || typeof item === 'number') addString(String(item));
            else if (item && typeof item === 'object') {
              Object.values(item).forEach(iv => {
                if (typeof iv === 'string' || typeof iv === 'number') addString(String(iv));
              });
            }
          });
        }
      });
    }

    return Array.from(tokens);
  }

  /**
   * Build or retrieve the Bloom Filter for a record
   */
  getFilter(record) {
    if (!record || typeof record !== 'object') return null;
    let bf = this.index.get(record);
    if (!bf) {
      const tokens = this._extractTokens(record);
      bf = new BloomFilter(Math.max(20, tokens.length * 2), 0.01);
      bf.addAll(tokens);
      this.index.set(record, bf);
    }
    return bf;
  }

  /**
   * Fast check if a record definitely does NOT match the search query.
   * - Returns false: Definitely does NOT match (Skip immediately).
   * - Returns true: Might match (Perform exact match).
   */
  mightMatch(record, query) {
    if (!query || !query.trim()) return true;
    const bf = this.getFilter(record);
    if (!bf) return true;

    const terms = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().split(/\s+/).filter(Boolean);
    for (const term of terms) {
      if (term.length >= 2 && !bf.has(term)) {
        return false; // Definitely not matching this term!
      }
    }
    return true;
  }
}

export const bloomSearchAccelerator = new BloomSearchAccelerator();
