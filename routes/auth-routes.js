const express = require('express');
const router = express.Router();
const authService = require('../auth/auth-service');

router.post('/', async (req, res) => {
    let { username, password } = req.body;
    const user = await authService.validateUser(username,password);
    if(user){
        res.status(201).json(user);
    }
    else {
        res.status(400).json({ msg: `Auth Failed!` });
      }
    });

module.exports = router;
