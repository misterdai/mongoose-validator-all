# Mongoose Validator All

[![Build Status](https://travis-ci.org/misterdai/mongoose-validator-all.svg?branch=master)](https://travis-ci.org/misterdai/mongoose-validator-all)
[![npm version](https://badge.fury.io/js/mongoose-validator-all.svg)](https://badge.fury.io/js/mongoose-validator-all)

A wrapper for the mongoose plugin [mongoose-validator](https://github.com/leepowellcouk/mongoose-validator), which itself wraps [validator.js](https://github.com/chriso/validator.js), to provide schema validation.

This plugin supports all of the `mongoose-validator` functionality (by passing them through) but also provides an additional method called `multiValidate`.  This forces mongoose to test __every__ validation rule, instead of stopping at the first fail on a field.

For more information, please check [mongoose-validator](https://github.com/leepowellcouk/mongoose-validator).  This README will only highlight the additional functionality that this plugin wrapper adds.

## Installation

```bash
$ npm install mongoose-validator-all --save
```

## Usage

```javascript
var mongoose = require('mongoose');
var validate = require('mongoose-validator-all');

var rules = {
  name: validate.multiValidate([
    {
      validator: 'isLength',
      arguments: [3, 50],
      message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    }, {
      validator: 'isAlphanumeric',
      passIfEmpty: true,
      message: 'Name should contain alpha-numeric characters only'
    }
  ])
};

var UserSchema = new mongoose.Schema({
  name: {type: String, required: true, validate: rules.name}
});

var User = mongoose.model('User', UserSchema);
```

Error objects are returned as normal via Mongoose.  With the exception being that `multiValidate` returns an array of messages per document property validation error, instead of a single string.

### Example of error returned

```
var User = mongoose.model('User');

var user = new User({name: '_a'});

user.save(function(error) {
  console.log(error.errors.name.message);
  /*
    This will show an array of messages,
    unlike the normal single string for the first validation fail
  */
  console.log('%d validation errors against name.', error.errors.name.message.length);

  // Errors can easily be joined if a single string is required
  console.log(error.errors.name.message.join(' '));
});
```

See mongoose issue [#2612](https://github.com/Automattic/mongoose/issues/2612) for further information.

## Contributors

Majority of thanks goes to [Lee Powell](https://github.com/leepowellcouk) for the [mongoose-validator](https://github.com/leepowellcouk/mongoose-validator) plugin this is all based off.  Also the code from [mongoose-validate-all](https://github.com/szdc/mongoose-validate-all) by [szdc](https://github.com/szdc).

Quote from the mongoose-validator readme:

> Special thanks to [Francesco Pasqua](https://github.com/cesconix/) for heavily refactoring the code into something far more future proof. Thanks also go to [Igor Escobar](https://github.com/igorescobar/) and [Todd Bluhm](https://github.com/toddbluhm/) for their contributions.

## License (MIT)

Copyright (c) 2015 David Boyer

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
