import Joi from "joi";

const chapterValidator = Joi.object({
  order: Joi.number().integer().positive().required().messages({
    "any.required": 'Le champ "order" est obligatoire.',
    "number.base": 'Le champ "order" doit être un nombre entier.',
    "number.positive": 'Le champ "order" doit être un entier positif.',
  }),
  title: Joi.string().min(3).max(100).required().messages({
    "any.required": 'Le champ "title" est obligatoire.',
    "string.min": 'Le champ "title" doit avoir au moins 3 caractères.',
    "string.max": 'Le champ "title" doit avoir au maximum 100 caractères.',
  }),
  section: Joi.array()
    .items(
      Joi.object({
        content: Joi.string().max(500).messages({
          "string.max": 'Le champ "content" doit avoir au maximum 500 caractères.',
        }),
        advancement: Joi.string()
          .valid("not yet", "in progress", "completed")
          .default("not yet")
          .messages({
            "any.only": 'Le champ "advancement" doit être "not yet", "in progress" ou "completed".',
          }),
      })
    )
    .optional()
    .messages({
      "array.base": 'Le champ "section" doit être un tableau.',
    }),
});

export default chapterValidator;
