/**
 * Validators for Mongoose.js utilising validator.js, returns array of fails
 * @module mongoose-validator-all
 * @author David Boyer <dave.npm@yougeezer.co.uk>
 * @copyright MIT
 */

var validate = require('mongoose-validator');

module.exports = validate;

/*
 * Initialize a new group of validation functions
 * for a schema property.
 *
 * @param validatorsArray
 */
function multiValidate(options) {
  // Map options to validate,
  var validatorsArray = options.map(validate);
  var validationErrors;

  /*
   * Iterates through the supplied validators,
   * appending error messages to validationErrors
   * if the validator returns false.
   *
   * @param value
   */
  function validator(value, next) {
    validationErrors = [];
    var isValid = true;

    validatorsArray.forEach(function(validator) {
      validator.validator.call(this, value, function(valid) {
        if (!valid) {
          // Append message
          validationErrors.push(validator.message);

          isValid = false;
        }
      });
    }.bind(this));
    return next(isValid);
  }

  /*
   * Simple object to retrieve the list of
   * validation errors.
   *
   * Mongoose expects a string message,
   * but to return a dynamic error message,
   * we need to pass a function that retrieves it.
   */
  function ValidationErrorRetriever() {}

  /*
   * Injects the validation errors when Mongoose
   * first calls Replace on the error message.
   * Retains Mongoose functionality.
   *
   * @param regexp
   * @param newSubStr
   */
  ValidationErrorRetriever.prototype.replace = function() {
    // This level of replace will receive {VALIDATOR} + our fn, so ignored

    // Mock a replace method on our array.
    validationErrors.replace = function(regexp, newSubStr) {
      validationErrors.forEach(function(validError, i) {
        validationErrors[i] = validError.replace(regexp, newSubStr);
      });

      return validationErrors;
    };

    return validationErrors;
  };

  /*
   * For a single validation method, Mongoose expects
   * an array containing the validation method and
   * error message respectively.
   */
  return {
    validator: validator,
    message: new ValidationErrorRetriever(),
    type: 'ValidationErrorRetriever'
  };
}

validate.multiValidate = multiValidate;
