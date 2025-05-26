const Joi = require("joi");

// Validation schemas
const registerSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "First name can only contain letters and spaces",
    }),
  last_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Last name can only contain letters and spaces",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    }),
  role: Joi.string().valid("student", "admin").default("student"),
  major: Joi.string()
    .when("role", {
      is: "student",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required": "Major is required for students",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Validation middleware functions
const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
