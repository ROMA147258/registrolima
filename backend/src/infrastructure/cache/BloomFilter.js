/**
 * High-performance, memory-efficient Bloom Filter implementation.
 * Uses Murmur/FNV double-hashing algorithm (Kirsch-Mitzenmacher optimization).
 */
export class BloomFilter {
  /**
   * @param {number} expectedItems - Expected number of items to insert
   * @param {number} falsePositiveRate - Desired false positive probability (e.g. 0.01 = 1%)
   */
  constructor(expectedItems = 10000, falsePositiveRate = 0.01) {
    this.expectedItems = Math.max(100, expectedItems);
    this.falsePositiveRate = Math.min(0.5, Math.max(0.0001, falsePositiveRate));

    // Optimal bit array size: m = - (n * ln(p)) / (ln(2)^2)
    this.size = Math.ceil(- (this.expectedItems * Math.log(this.falsePositiveRate)) / (Math.LN2 * Math.LN2));
    
    // Optimal number of hash functions: k = (m / n) * ln(2)
    this.numHashes = Math.max(1, Math.round((this.size / this.expectedItems) * Math.LN2));

    // 32-bit integer array backing storage
    this.bitArray = new Uint32Array(Math.ceil(this.size / 32));
    this.count = 0;
  }

  /**
   * FNV-1a 32-bit hash function (Primary hash)
   */
  _hash1(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /**
   * DJB2 32-bit hash function (Secondary hash)
   */
  _hash2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(hash, 33) ^ str.charCodeAt(i)) >>> 0;
    }
    return hash >>> 0;
  }

  /**
   * Normalize input to string
   */
  _normalize(item) {
    if (item === null || item === undefined) return '';
    return String(item).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Add an item to the Bloom Filter
   * @param {string|number} item 
   */
  add(item) {
    const key = this._normalize(item);
    if (!key) return;

    const h1 = this._hash1(key);
    const h2 = this._hash2(key);

    for (let i = 0; i < this.numHashes; i++) {
      // Kirsch-Mitzenmacher double hashing: gi(x) = (h1(x) + i * h2(x)) % m
      const bitIndex = ((h1 + Math.imul(i, h2)) >>> 0) % this.size;
      const arrayIndex = (bitIndex / 32) | 0;
      const bitOffset = bitIndex % 32;
      this.bitArray[arrayIndex] |= (1 << bitOffset);
    }
    this.count++;
  }

  /**
   * Check if an item might be in the set.
   * - Returns false: Item is DEFINITELY NOT in the set (0% false negatives).
   * - Returns true: Item is PROBABLY in the set (with false positive rate <= p).
   * @param {string|number} item 
   * @returns {boolean}
   */
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
        return false; // Definitely not present
      }
    }
    return true; // Possibly present
  }

  /**
   * Reset filter
   */
  clear() {
    this.bitArray.fill(0);
    this.count = 0;
  }

  /**
   * Add multiple items at once
   */
  addAll(items) {
    if (Array.isArray(items)) {
      items.forEach(item => this.add(item));
    }
  }

  /**
   * Get filter statistics
   */
  getStats() {
    return {
      expectedItems: this.expectedItems,
      insertedCount: this.count,
      bitArraySize: this.size,
      hashFunctions: this.numHashes,
      estimatedMemoryKb: (this.bitArray.byteLength / 1024).toFixed(2),
      configuredFpRate: this.falsePositiveRate
    };
  }
}
