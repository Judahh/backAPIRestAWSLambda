class MockResponse {
  received = {};
  send = {};
  error = {};
  //  deepcode ignore no-any: any to simplify
}

const mockResponse = new MockResponse();

function callback(undefined, object: { headers; body; statusCode }) {
  mockResponse.received = JSON.parse(JSON.stringify(object?.body));
  console.log('response:', mockResponse.received);
  return mockResponse.received;
}

export { mockResponse, callback };
