class MockResponse {
  received = {};
  error = {};
  send = {};
  //  deepcode ignore no-any: any to simplify
  status(name): MockResponse {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _self = this;
    _self.send = (error) => {
      _self.error = {};
      if (error) _self.error[name] = error;
      return _self;
    };
    return _self;
  }
  json(object): MockResponse {
    this.received = object;
    return this;
  }
}

const mockResponse = new MockResponse();

export { mockResponse };
