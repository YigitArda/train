export class BaseConnector {
  constructor(name) {
    this.name = name;
  }

  async searchTrips(_request) {
    throw new Error(`searchTrips() implement edilmeli: ${this.name}`);
  }

  normalize(raw) {
    return raw;
  }
}
