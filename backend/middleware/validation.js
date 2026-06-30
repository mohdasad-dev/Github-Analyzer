const Joi = require('joi');

/**
 * Generic request validation middleware
 * @param {string} source - 'body', 'params', 'query'
 * @param {Object} schema - Joi schema for validation
 */
const validateRequest = (source, schema) => {
  return (req, res, next) => {
    const joiSchema = Joi.object(schema);
    const { error, value } = joiSchema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages
      });
    }

    req[source] = value;
    next();
  };
};

/**
 * Validate GitHub username format
 */
const validateUsername = (req, res, next) => {
  const { username } = req.params;

  // GitHub username rules: 1-39 alphanumeric characters and hyphens
  // Cannot start or end with hyphen
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid GitHub username format'
    });
  }

  next();
};

module.exports = {
  validateRequest,
  validateUsername
};
