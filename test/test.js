(function(undefined) {

'use strict';

var mongoose      = require('mongoose'),
    should        = require('should'),
    multiValidate = require('../lib/mongoose-validator-all').multiValidate,
    Schema        = mongoose.Schema;

// Tests
// ------------------------------------------------------------
describe('Mongoose Validator:', function() {
  var doc, schema, Person;

  before(function(done) {
    var url  = 'mongodb://127.0.0.1/mongoose_validator_all_test',
        date = Date.now();

    mongoose.connect(url);

    schema = new Schema({
      name: { type: String, default: null },
      interests: { type: Array, default: [] },
      age: { type: Number, default: null },
      date_created: { type: Date, default: date }
    });

    Person = mongoose.model('Person', schema, 'test.people');

    done();
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase();
    mongoose.disconnect();
    done();
  });

  beforeEach(function(done) {
    Person.create({}, function(err, d) {
      if (err) return done(err);
      if (! d) return done(new Error('No document found'));
      doc = d;
      return done();
    });
  });

  afterEach(function(done) {
    // Remove the attached validators from tests
    schema.paths.name.validators = [];
    schema.paths.interests.validators = [];
    schema.paths.age.validators = [];

    Person.remove({}, function(err) {
      if (err) return done(err);
      return done();
    });
  });

  describe('Multi Validation -', function() {
    it('Should allow multiValidate to not stop at the first fail', function(done) {
      schema.path('name')
        .validate(
          multiValidate([
            { validator: 'isLength', arguments: [4, 40], message: 'Username should be between 4 and 40 characters' },
            { validator: 'isAlphanumeric', message: 'Username must only contain letters and digits' }
          ])
        )

      should.exist(doc);

      doc.name = '';

      doc.save(function(err, person) {
        should.exist(err);
        should.not.exist(person);
        err.errors.name.message.should.be.instanceof(Array).and.have.lengthOf(2);
        err.errors.name.message[0].should.equal('Username should be between 4 and 40 characters');
        err.errors.name.message[1].should.equal('Username must only contain letters and digits');
        return done();
      });
    });

    it('passes the document onto the validators', function(done) {
      schema.path('age')
        .validate(multiValidate([
          {
            validator: function(age) {
              if (age > 18) return this.interests && this.interests.length > 0;
              return true;
            },
            message: 'Someone aged {VALUE} must have some interests!'
          }
        ]));

      doc.age = 15;

      doc.validate(function(err, person) {
        should.ifError(err);

        doc.age = 22;

        doc.validate(function(err, person) {
          should.exist(err);
          should.exist(err.errors.age);
          should(err.errors.age.message[0]).equal('Someone aged 22 must have some interests!');
          return done();
        });
      });
    });
  });
});

})();
