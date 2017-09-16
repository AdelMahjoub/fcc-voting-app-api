const mocha = require('mocha');
const assert = require('assert');

const User = require('../models/user.model');

describe('User', () => {

  const user = new User({
    username: 'john',
    email: 'john@doe.com',
    password: '123456'
  });

  let insertedId;

  describe('constructor', () => {
    it('should instanciate objects', () => {
      assert.equal(typeof user, 'object');
    });
    it('should instanciate instances of User', () => {
      assert(user instanceof User);
    });
  });

  describe('.all', () => {
    before((done) => {
      User.create(user, (err, results) => {
        assert(!Boolean(err), 'No errors expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be inserted');
        insertedId = results.insertId;
        done();
      });
    });
    after((done) => {
      User.removeById(insertedId, (err, results) => {
        assert(!Boolean(err), 'No errors expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be removed');
        done();
      });
    });
    it('should return an array of users', (done) => {
      User.all((err, fields) => {
        assert(!Boolean(err), 'No errors expected');
        assert(Array.isArray(fields), 'Expect an array');
        assert(fields.length, 'Expect at least a user')
        done();
      });
    });
  });
  
  describe('.create', () => {
    after((done) => {
      User.removeById(insertedId, (err, results) => {
        assert(!Boolean(err), 'No errors expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be removed');
        done();
      });
    });
    it('should add new users', (done) => {
      User.create(user, (err, results) => {
        assert(!Boolean(err), 'No errors expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be removed');
        insertedId = results.insertId;
        done();
      });
    });
  });

  describe('.get', () => {
    before((done) => {
      User.create(user, (err, results) => {
        assert(!Boolean(err), 'No errors expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be inserted');
        insertedId = results.insertId;
        done();
      });
    });
    after((done) => {
      User.removeById(insertedId, (err, results) => {
        assert(!Boolean(err), 'No errors expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be removed');
        done();
      });
    });
    it('should return a user by id', (done) => {
      User.get({field: 'id', value: insertedId}, (err, row) => {
        assert(!Boolean(err), 'No errors expected');
        assert(Boolean(row), 'Expect to return a truthy value');
        assert.equal(typeof row, 'object', 'Expect an object to be returned');
        assert.notDeepEqual(row, {}, 'Expect a non empty object');
        assert.notDeepEqual(user, row, 'Expect user from table to have extra properties');
        done();        
      });
    });
    it('should return a user by username', (done) => {
      User.get({field: 'username', value: user.username}, (err, row) => {
        assert(!Boolean(err), 'No errors expected');
        assert(Boolean(row), 'Expect to return a truthy value');
        assert.equal(typeof row, 'object', 'Expect an object to be returned');
        assert.notDeepEqual(row, {}, 'Expect a non empty object');
        assert.notDeepEqual(user, row, 'Expect user from table to have extra properties');
        done();        
      });
    });
    it('should return a user by email', (done) => {
      User.get({field: 'email', value: user.email}, (err, row) => {
        assert(!Boolean(err), 'No errors expected');
        assert(Boolean(row), 'Expect to return a truthy value');
        assert.equal(typeof row, 'object', 'Expect an object to be returned');
        assert.notDeepEqual(row, {}, 'Expect a non empty object');
        assert.notDeepEqual(user, row, 'Expect user from table to have extra properties');
        done();        
      });
    });
  });

  describe('.removeById', () => {
    before((done) => {
      User.create(user, (err, results) => {
        assert(!Boolean(err), 'No error expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be inserted');
        insertedId = results.insertId;
        done();
      });
    });
    it('should remove a user', (done) => {
      User.removeById(insertedId, (err, results) => {
        assert(!Boolean(err), 'No errors expected');
        assert.equal(results.affectedRows, 1, 'Expect a user to be removed');
        done();
      });
    });
  });

  describe('.saltRounds', () => {
    it('should return a number greater than 0', () => {
      assert.equal(typeof User.saltRounds(), 'number');
      assert(!isNaN(User.saltRounds()));
      assert(User.saltRounds() > 0);
    });
  });

  describe('.hashPassword', () => {
    it('should return a hash from a string', (done) => {
      User.hashPassword(user.password, (err, hash) => {
        assert(!Boolean(err), 'No errors expected');
        assert.notEqual(user.password, hash, 'Expect the hash to be different than the given string');
        done();
      });
    });
  });

  describe('.comparePasswords', () => {
    const guess = user.password;
    let hashedPassword;
    before((done) => {
      User.hashPassword(guess, (err, hash) => {
        assert(!Boolean(err), 'No errors expected');
        assert.notEqual(user.password, hash, 'Expect the hash to be different than the given string');
        hashedPassword = hash;
        done();
      });
    });
    it('should return true when comparing the hash of a string with the string itself', (done) => {
      User.comparePasswords(guess, hashedPassword, (err, isMatch) => {
        assert(!Boolean(err), 'No errors expected');
        assert(isMatch);
        done();
      });
    });
    it('should return false when comparing a hash of a string with a string different than the original', (done) => {
      User.comparePasswords('not the original', hashedPassword, (err, isMatch) => {
        assert(!Boolean(err), 'No errors expected');
        assert(!isMatch);
        done();
      });
    });
  });

  describe('.genConfirmToken', () => {
    it('should return a string', () => {
      assert.equal(typeof User.genConfirmToken(), 'string');
    });
    it('should return a unique and different string each time it is called', () => {
      let strings = [];
      for(let i = 0; i < 10; i++) {
        strings.push(User.genConfirmToken());
      }
      const firstString = strings[0];
      assert.equal(strings.filter((value) => { return value === firstString}).length, 1);
    });
  });
});