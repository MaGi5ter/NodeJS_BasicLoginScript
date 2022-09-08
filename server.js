const express = require('express')
const session = require('express-session')

const app = express()
const hash = require('hash.js')
const mysql = require('mysql')
const config = require('./config.json')

app.set('view engine', 'ejs')

const db = mysql.createPool({
    host : config.mysql[0],
    user : config.mysql[1],
    password : config.mysql[2],
    database : config.mysql[3],
    connectionLimit : 5,
    acquireTimeout  : 8000,
    timeout : 60000
})

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/home',(req,res) => {
    if(req.session.loggedin == true)
    {
        res.render('home')
    }
    else
    {
        res.redirect('/')
    }
})

app.post('/auth', function(request, response) {

    let username = request.body.username;
    let password = request.body.password;
    
    if (username && password) {

        if(username.length>41 || password.length > 41)
        {
            response.end()
        }
        else
        {
            //let password = hash.sha512().update(password).digest('hex');console.log(password)
            //you can do even hashed passwords if u want

            db.query(`SELECT password FROM users WHERE password = ?`, [password], function(error, results, fields) {
                
                if (error) throw error;
                if (results.length > 0) {
                    
                    request.session.loggedin = true;
                    request.session.username = username;
                    
                    response.redirect('/home');
                } else {
                    response.redirect('/');
                }			
                response.end();
            })
        }
        
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
})

app.listen(3010)