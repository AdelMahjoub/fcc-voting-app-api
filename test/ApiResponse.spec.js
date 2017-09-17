const mocaha = require('mocha');
const assert = require('assert');

const ApiResponse = require('../api/class/ApiResponse');

describe('ApiResponse', () => {
  const response = new ApiResponse();
  describe('constructor', () => {
    it('should instanciate objects', () => {
      assert.equal(typeof response, 'object');
    });
    it('should instanciate instances of ApiResponse', () => {
      assert(response instanceof ApiResponse);
    });
  });
  describe('new instances', () => {
    it('should have a requested property', () => {
      assert(response.hasOwnProperty('requested'));
    });
    it('should have a success property', () => {
      assert(response.hasOwnProperty('success'));
    });
    it('should have an errors property', () => {
      assert(response.hasOwnProperty('errors'));
    });
    it('should have a data property', () => {
      assert(response.hasOwnProperty('data'));
    });
    it('should have a timestamp property', () => {
      assert(response.hasOwnProperty('timestamp'));
    });
  });
});
