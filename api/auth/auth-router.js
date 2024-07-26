// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const bcrypt = require('bcryptjs')
const users = require('../users/users-model')
const express = require('express')
const {
  checkUsernameFree, 
  checkUsernameExists, 
  checkPasswordLength
} = require('../auth/auth-middleware')
const router = express.Router()
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post('/register', checkUsernameFree, checkPasswordLength, (req,res,next) => {
  const credentials = req.body
  const hash = bcrypt.hashSync(credentials.password, 14)
  credentials.password = hash;
 users.add(req.body)
 .then(user => res.json(user))
 .catch(next)
})

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.post('/login', checkUsernameExists, (req,res,next) => {
  const credentials = req.body

  users.findBy(credentials.username)
  .then( user => {
    if(bcrypt.compareSync(credentials.password, user.password)){
      req.session.user = user
      
      return res.json({message: `Welcome ${req.session.user.username}!`})   
    } 

    else
    return res.status(401).json({ message: 'Invalid credentials' })
    
  })
  .catch(next)
})

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
router.get('/logout', (req,res, next) => {
  if (req.session.user) {
    req.session.destroy(err => {
      if (err) {
        next(err)
      } else
      res.json({message: 'logged out'})
    });
    
  } else
  res.json({message: 'no session'})
    })

 
// Don't forget to add the router to the `exports` object so it can be required in other modules

module.exports = router