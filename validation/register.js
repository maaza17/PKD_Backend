const validator = require('validator')
const isEmpty = require('is-empty')

const validateRegisterInput = (data) => {
    let errors = {}

    // Convert fields into empty string initially
    data.firstName = !isEmpty(data.firstName)? data.firstName:''
    data.lastName = !isEmpty(data.lastName)? data.lastName:''
    data.email = !isEmpty(data.email)? data.email:''
    data.password = !isEmpty(data.password)? data.password:''
    data.password2 = !isEmpty(data.password2)? data.password2:''

    // firstName Check
    if(validator.isEmpty(data.firstName)){
        errors.firstName = "Name field is required"
    }

    // lastName Check
    if(validator.isEmpty(data.lastName)){
        errors.lastName = "Name field is required"
    }

    // Email Check
    if(validator.isEmpty(data.email)){
        errors.email = "Email field is required"
    } else if(!validator.isEmail(data.email)){
        errors.email = 'Email is invalid'
    }

    // Password Check
    if (validator.isEmpty(data.password)) {
        errors.password = "Password field is required";
    }
    
    if (validator.isEmpty(data.password2)) {
        errors.password2 = "Confirm password field is required";
    }
    
    if (!validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = "Password must be at least 6 characters";
    }
    
    if (!validator.equals(data.password, data.password2)) {
        errors.password2 = "Passwords must match";
    }

    return{
        errors,
        isValid: isEmpty(errors) 
    }
}

module.exports = validateRegisterInput