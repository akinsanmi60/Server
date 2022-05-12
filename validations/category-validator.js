const { check, validationResult } = require("express-validator");

const validationRules = () => {
    return [
        check("title").trim().isLength({ min: 2, max: 56 }).withMessage("Title must be between 2 and 56 characters")
    ]
};

const validate = (req, res, next) => {

    //this check the req pass as parameter
    const errors = validationResult(req);

    // if error is empty
    if(errors.isEmpty()) {
        return next();
    }

    // if there is error, it will be map thru
    const resultErrors = [];
    errors.array().map((err) => resultErrors.push({[err.param]: err.mss}));
    resultErrors.push({message: "Action unsuccessful"});
    resultErrors.push({success: false});
    const errorObject = Object.assign({}, ...resultErrors);
    return res.status(422).json(errorObject);
};

module.exports = {
    validationRules,
    validate
};