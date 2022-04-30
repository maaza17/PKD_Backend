const validator = require('validator')
const isEmpty = require('is-empty')

const validateRegisterInput = (data) => {
    let errors = {}

    // Convert fields into empty string initially
    data.vendorName = !isEmpty(data.vendorName)? data.vendorName:''
    data.email = !isEmpty(data.email)? data.email:''
    data.password = !isEmpty(data.password)? data.password:''
    data.password2 = !isEmpty(data.password2)? data.password2:''
    data.vendorType = !isEmpty(data.vendorType)? data.vendorType:''
    data.companyAddress = !isEmpty(data.companyAddress)? data.companyAddress:''


    // Vendor Name Check
    if(validator.isEmpty(data.vendorName)){
        errors.vendorName = "Name field is required"
    }

    // Vendor Type check
    if(validator.isEmpty(data.vendorType)){
        errors.vendorType = "Vendor type/nature of business is required"
    } else if(!validator.isIn(data.vendorType, ['type1', 'type2'])){
        errors.vendorType = "Vendor type/nature of business is invalid!"
    }

    if(validator.isEmpty(data.companyAddress)){
        errors.companyAddress = "Company address is required"
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