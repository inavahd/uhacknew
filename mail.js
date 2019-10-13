var nodemailer = require('nodemailer');
var lenders = require("./models/lender");


function sendMail(){
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sanamittal884@gmail.com',
      pass: 'hello.123#'
    }
  });
      
//  var maillist = [];
//  for(var i=0; i<lenders.length; i++){
//    maillist[i] = lenders[i].emailId;
//  }

//  maillist.toString();
 
  var mailOptions = {
    from:'sanamittal884@gmail.com',
//    to : maillist,
      to:"adhyanagpal@gmail.com",
    subject: 'New Bill Of Exchange Raised.',
    text: 'A new bill of exchange has been raised. Kindly share your proposal if interested.'
  };


  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
});
}

module.exports = sendMail;