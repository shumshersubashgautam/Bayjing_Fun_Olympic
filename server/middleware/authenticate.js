const jwt = require("jsonwebtoken");
const User = require('../model/userSchema');

const authenticate = async (req, res, next) =>{
    try{
        console.log(req);
        const token =0;
        // const verfiyToken = jwt.verify(token. process.env.SECRET_KEY);

        // const rootUser = await User.findOne({ _id:verfiyToken._id, "tokens.token": token});

        // if(!rootUser) {
        //     throw new Error("User not found");
        // }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
    }catch(err){
        // res.status(400).send('Unauthorized')
        res.status(202).json({status: "Unauthorized"});
        console.log(err)
    }
}

module.exports = authenticate;