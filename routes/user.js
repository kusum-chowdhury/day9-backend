const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const {
    validateName,
    validateEmail,
    validatePassword
} = require('../utils/validators');
const jwt = require('jsonwebtoken');


router.post('/signup', async(req, res) => {
  try{
   const { name, email, password, isSeller } = req.body;
   
   const existingUser = await User.findOne({ where: { email }});
  if(existingUser){
    return res.status(403).json({ err: "User already exists" });
  }
  if(!validateName(name)){
    return res.status(400).json({ err: "Name validate fails"})
  }
  if(!validateEmail(email)){
    return res.status(400).json({ err: "Email validate fails"})
  }
  if(!validatePassword(password)){
    return res.status(400).json({ err: "Password validate fails"})
  }

  const hashedPassword = await bcrypt.hash(password, (SaltOrRounds = 10));
  const user = {
    email,
    name, 
    isSeller,
    password: hashedPassword
  };
  const createdUser = await User.create(user);
return res.status(201).json({
    message: `welcome ${createdUser.name}`
})
} catch(e) {
    console.log(">>>>>", e);
    return res.status(500).send(e);
  }
});

router.post("/signin", async(req, res)=> {
  try{
  const { email, password } = req.body;
   if(email.length === 0) {
    return res.status(400).json({
      err: "please provide email"
    })
   }
    if(password.length === 0) {
    return res.status(400).json({
      err: "please provide password"
    })
   };
   const existingUser = await User.findOne({where: { email }});
   if(!existingUser) {
     return res.status(404).json({
      err: "User not found"
     })
   }
   
   const passwordMatch = await bcrypt.compare(password, existingUser.password);
   if(!passwordMatch){
    return res.status(400).json({
      err: "email or password mismatch"
     })
   };
   
  
   const payload = { user: {id: existingUser.id}};
   const bearerToken = await jwt.sign(payload, "SECRET MESSAGE", {
    expiresIn: 360000,
   });

   res.cookie('t', bearerToken, {expire: new Date() + 9999});
  return res.status(200).json({
    bearerToken 
  })   

  } catch(e) {
    return res.status(500).send(e);
  }
})

router.get('./signout', (req, res) => {
  try{
   res.clearCookie('t');
   return res.status(200).json({ message: "cookie deleted" });
  }catch(e) {
    res.status(500).send(e);
  }
})

module.exports = router;