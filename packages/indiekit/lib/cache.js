import got from 'got';

export const Cache = class {
  /** Fetch data from Redis store
   *
   * @param {object} client Redis client
   * @param {string} expires Timeout on key
   */
  constructor(client, expires) {
    this.client = client;
    this.expires = expires || 3600;
  }

  /**
   * Cache JSON data
   *
   * @param {string} hashId Record key
   * @param {string} url URL of remote file
   * @returns {Promise|object} File data
   */
  async json(hashId, url) {
    const cachedData = await this.client.get(hashId);
    if (cachedData) {
      return {
        source: 'cache',
        data: JSON.parse(cachedData)
      };
    }

    const fetchedData = await got(url).json();
    this.client.setex(hashId, this.expires, JSON.stringify(fetchedData));
    return {
      source: 'fetch',
      data: fetchedData
    };
  }
};