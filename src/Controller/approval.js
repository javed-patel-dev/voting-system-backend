const user = require("../Models/userSchema");

getApproval = async (req, res) => {
  try {
    let email = req.params.email;
    let userInstance = await user.findOne({ email: email });
    if(userInstance){
        res.status(200).send({status:userInstance.is_Active});
    }else{
        res.status(200).send({status:false});
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
};

module.exports = getApproval;
