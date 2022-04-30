const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load vendor Model
const vendorModel = require("../../models/Vendor");

// Load nodemailer transport object
const transport = require('../../config/nodemailer')

// function to generate unique confirmation code for vendor registeration
function getConfirmationCode(){
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length )];
    }
    return token
}

// Get Profile POST Route
// @router POST api/vendors/getprofile
// @desc Fetch vendor profile
// @access Public
router.post("/getprofile", (req, res) => {
  jwt.verify(req.body.token, keys.secretOrKey, function (err, decoded) {
    if (err) {
      return res
        .status(200)
        .json({ error: true, message: "Unable to fetch profile" });
    }
    if (decoded) {
      const id = decoded.id;
      vendorModel.findOne({ _id: id, is_deleted: false }).then((vendor) => {
        if (vendor) {
          return res
            .status(200)
            .json({
              error: false,
              data: {
                firstName: vendor.firstName,
                lastName: vendor.lastName,
                email: vendor.email,
                registerDate: vendor.registerDate,
                status: vendor.status
              },
              message: "vendor found.",
            });
        } else {
          return res
            .status(200)
            .json({ error: true, message: "Unexpected error occured. Please try later." });
        }
      });
    }
  });
});

// Register POST Route
// @route POST api/vendors/register
// @desc Register vendor
// @access Public
router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check validation
    if (!isValid) {
      return res
        .status(200)
        .json({
          error: true,
          error_message: errors,
          message: "Check error messages!"
        });
    }
  
    vendorModel.findOne({ email: req.body.email }, (err, vendor) => {
      if (vendor) {
        return res
          .status(200)
          .json({
            error: true,
            message: "This email is already registered with another account! Kindly use a different email address."
          });
      } else {
        const newUser = new vendorModel({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
          confirmationCode: getConfirmationCode()
        });
  
        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((vendor) => {

                var mailOptions = {
                  from: '"TCGFISH" <maaz.haque17@gmail.com>',
                  to: newUser.email,
                  subject: 'TCGFISH ACCOUNT VERIFICATION',
                  html: '<body><h2>Hello '+ newUser.firstName +'</h2><p> Please follow the link below to verify your account:</p><a href="http://www.google.com">VERIFY</a></body>'
                };

                transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log(error)
                    return res.status(200).json({
                      error: true,
                      message: error.message,
                    });
                  }
                  console.log('Message sent: %s', info.messageId);
                    res.status(200).json({
                    error: false,
                    error: false,
                    vendor:vendor,
                    message: "vendor successfully registered! Check email for account verification!",
                  })
                })
              })
              .catch((err) => {
                return res
                  .status(200)
                  .json({
                    error: true,
                    message: "Unexpected error occured. Please try agin later"
                  });
              });
          });
        });
      }
    });
  });

// Login POST Route
// @route POST api/vendors/login
// @desc Login vendor and return JWT token
// @access Public
router.post("/login", (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
  
    // Check validation
    if (!isValid) {
      return res.status(200).json({
        error:true,
        error_message: errors,
        message: "Check error messages."
      });
    }
    const email = req.body.email;
    const password = req.body.password;
  
    // Find vendor by email
    vendorModel.findOne({ email: email, is_deleted: false }).then((vendor) => {
      // Check if vendor exists
      if (!vendor) {
        return res
        .status(200)
        .json({
          error: true,
          message: "Can not find account with this email."
        });
      } else if(vendor.status === "Pending"){
        return res
        .status(200)
        .json({
          error: false,
          message: "Account verification pending. Follow the link sent to your registered email address to verify account!"
        })
      }
      // Check password
      bcrypt.compare(password, vendor.password).then((isMatch) => {
        if (isMatch) {
          // vendor matched, create jwt payload
          const payload = {
            id: vendor._id,
            firstName: vendor.firstName,
            lastName: vendor.lastName,
            email: vendor.email,
            registerDate: vendor.registerDate,
            status: vendor.status
          };
  
          // Sign token
          jwt.sign(
            payload,
            process.env.ENCRYPTION_SECRET,
            { expiresIn: 31556926 },
            (err, token) => {
              res.json({
                error: false,
                token: token,
              });
            }
          );
        } else {
          return res
          .status(200)
          .json({
            error: true,
            message: "Password incorrect!"
          });
        }
      });
    });
  });



// vendor Verification GET Route
// @route GET api/vendors/verifyuser/:confirmationcode
// @desc Activate vendor account once registered by following link sent to to email
// @access Limited
  router.get('/verifyuser/:confirmationCode', (req, res, next) => {
    vendorModel.findOne({
      confirmationCode: req.params.confirmationCode,
    })
      .then((vendor) => {
        if (!vendor) {
          return res.status(200).json({
            error: true,
            message: "vendor Not found."
          });
        }

        if(vendor.status == "Active"){
          return res.status(200).json({
            error: false,
            message: "Account already verified."
          });
        }
  
        vendor.status = "Active";
        vendor.save((err) => {
          if (err) {
            return res.status(200).json({
              error: true,
              message: "Unexpected error occured. Please try again later."
            });
          } else {
            return res.status(200).json({
              error: false,
              message: "Success: Account Verified."
            });
          }
        });
      })
      .catch((e) => console.log("error", e));
  })


// get vendor favourites POST Route
// @route POST api/vendors/getfavourites
// @desc get favourite cards for any vendor
// @access Limited
router.post('/getfavourites', (req, res) => {
  let token = req.body.token

  jwt.verify(token, process.env.ENCRYPTION_SECRET, (err, decoded) => {
    if(err){
      return res.status(200).json({
        error: true,
        message: err.message
      })
    } else {
      vendorModel.findById(decoded.id, {favourites: 1}, (error, docs) => {
        if(error){
          return res.status(200).json({
            error: true,
            message: 'Unexpected error occured!'
          })
        } else {
          return res.status(200).json({
            error: false,
            message: 'Found favourites for vendor!',
            data: docs
          })
        }
      })
    }
  })
})

module.exports = router;
  



  //  //token verification code snippet 
  // jwt.verify(token, process.env.ENCRYPTION_SECRET, (err, decoded) => {
  //   if(err){
  //     return res.status(200).json({
  //       error: true,
  //       message: err.message
  //     })
  //   } else {
      
  //   }
  // })