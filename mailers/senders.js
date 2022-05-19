const { email } = require("./config");

const welcomeSender = (recipient, firstname, code) => {
  console.log("Called in Sender");
    email
    .send({
      template: "welcome",
      message: {
        to: recipient,        
      },
      locals: {
        name: firstname,
        code: code
      }
    })
    .catch(console.error);
};

const forgotPasswordSender = (recipient, firstname, code) => {
    email
    .send({
      template: "forgot",
      message: {
        to: recipient,        
      },
      locals: {
        name: firstname,
        code: code
      }
    })
    .then(console.log)
    .catch(console.error);
};

module.exports = {    
    welcomeSender,
    forgotPasswordSender
};

