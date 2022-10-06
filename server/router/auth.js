const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const crypto = require('crypto');
const sendEmail = require("../utils/sendEmail");
const router = express.Router();
var cors = require('cors')

require('../db/conn');
const User = require('../model/userSchema');

let token;
// Register User
router.post('/register', cors(), async (req, res) => {
    const {name, email, phone, occupation, country, password, cpassword} = req.body

    if(!name || !email || !phone || !occupation || !country || !password || !cpassword ){
        return res.status(204).json({
            message: 'Fill all the fields properly'
        })
    }

    try{
        const userExist = await User.findOne({ email: email });
        

        if(userExist){
            return res.status(204).json({message: 'Email already exists'})
        }else if(password != cpassword){
            return res.status(204).json({message: 'Password doesnot match'})
        }
        else{
            const user = new User({ name, email, phone, occupation, country, password, cpassword })
            await user.save();
            return res.status(201).json({message: 'Registered successfully'})
        }
    }catch(err){
        console.log(err)
    }
    })

    router.get('/abc', (req, res) => {
        res.cookie("newTok","tokenn");
        res.send({
            message: "Hello"
        })
    })

    // Login User
    router.post('/login',  async (req, res) =>{

        try{
            const { email, password} = req.body

            if (!email || !password){
                return res.status(400).json({message: 'Please fill all the fields' })
            }

            const userLogin =  await User.findOne({ email : email })

            if(userLogin){
                const isMatch = await bcrypt.compare( password, userLogin. password);

                 token = await userLogin.generateAuthToken();

                 

                if(!isMatch){
                    return res.status(400).json({ message: 'Invalid Credentials' })
                } 
                else{
                    // Storing JWT in cookie
                    if(token){
                        res.status(200).json({ message: 'Login successful', jwt: token})
                        
                    }
                }   
            }else{
                return res.status(400).json({ message: 'Invalid Credentials' })
            }
        }catch(err){
            console.log(err)
        }
    })

    // Get total users
    router.get("/users", async (req, res) => {
        try{
            const users = await User.find();
           const data = res.status(200).json({ data: users.length})
        }catch(err){
            res.status(400).json({success: false})
        }
    })

    //Video and comment Page
    router.get("/auth:token", async (req, res, next) =>{
        try{
            const token = req.params.token.substring(1);

            const verfiyToken = jwt.verify(token,process.env.SECRET_KEY);
    
            const rootUser = await User.findOne({ _id:verfiyToken._id, "tokens.token": token});
    
            if(!rootUser) {
                throw new Error("User not found");
            }
    
            req.token = token;
            req.rootUser = rootUser;
            req.userID = rootUser._id;
            res.status(200).json({status: "Authorized"});
            next();
        }catch(err){
            res.status(202).json({status: "Unauthorized"});
            console.log(err)
        }

    });
    
    //Fetch all users
    router.get("/allusers", async (req, res) => {
        try {
            const users = await User.find({}).select('name email phone country occupation');
            res.status(200).json({
                data: users
            })
        } catch (err) {
            res.status(400).json({success: false})
        }
    })

    // Fetch single user
    router.get("/users/:id", async (req, res) => {
        try {

            const user = await User.findById(req.params.id).select('name email phone country occupation');

            if(!user){
               return res.status(400).json({success:false})
            }
            res.status(200).json({
                data: user
            })
        } catch (error) {
            res.status(400).json({
                success:false
            })
        }
    })

    //Update users
    router.put("/user/:id", async(req, res) =>{

        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
        });
    
            if(!user){
                return res.status(400).json({success:false})
            }
    
            res.status(200).json({ success: true, data: user})
        } catch (error) {
            res.status(400).json({success:false})
        }

    })


    // Delete Users
    router.delete("/deleteusers/:id", async(req, res) =>{
        try {
            const user = await User.findByIdAndDelete(req.params.id);
    
            if(!user){
                return res.status(400).json({success:false})
            }
    
            res.status(200).json({ success: true, data: {}})
        } catch (error) {
            res.status(400).json({success:false})
        }
    })

    // Forgot Password
    router.post("/forgotpassword", async(req, res, next) => {
        const user = await User.findOne({ email: req.body.email });

        console.log(req.body);

        if(!user){
            res.status(404).json({success:false})
        }

        //Get Reset Token
        const resetToken = user.getResetPasswordToken();

        await user.save( {validateBeforSave: false});


        const message = `You are receiving this email because you have requested to reset the password.
        Please confirm your otp ${req.body.otp} `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password reset token",
                message
            });

            res.status(200).json({success:true})
        } catch (err) {
            res.status(204).json({err: "User Not Found"})
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({validateBeforeSave: false});

            return next();
        }

        console.log(resetToken);

        res.status(200).json({ success: true, data: user});
    })


    // Reset Password
    router.post("/resetpassword", async (req, res) => {

        console.log(req.body);
        const user = await User.findOne({
            email: req.body.email
            
        });

        if(!user){
            res.status(400).json({success:false, data: 'Invalid Token'})
        }

        // Set New password
        user.password = req.body.password;
        user.cpassword = req.body.password;

        await user.save();
        res.status(200).json({
            success: true
        })



    })

    // Logout
    router.get("/logout",  (req, res) => {
        res.clearCookie('jwtoken', {path:'/'});
        res.status(200).send('Logout');
    })

module.exports = router;
