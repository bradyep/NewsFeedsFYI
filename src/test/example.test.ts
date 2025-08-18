// Example test file to verify Jest setup
// This file can be removed once you start writing real tests

describe('Jest Setup', () => {
  test('should work with basic Jest functionality', () => {
    expect(1 + 1).toBe(2);
  });

  test('should support async/await', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });
});
