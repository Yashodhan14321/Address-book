const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./config/database')
const path = require('path')

mongoose.connect(config.database)
let db = mongoose.connection

db.once('open', ()=>{
    console.log('mongodb connected ..')
})

db.on('error', (err)=>{
    console.log(err)
})

const app = express()


let USER = require('./models/users') 
let ADDRESS = require('./models/adresbook')


app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    'secret': 'yoursecret',
}));


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

var auth = (req,res,next)=>{
    if(req.session.isLogin){
        next();
    }
    else{
        res.redirect('/login')
    }
}

app.get('/register', (req, res)=>{
    res.render('register')
})

app.post('/register', (req, res)=>{
    console.log(req.body);
    let user = new USER({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
    })

    user.save();
    res.redirect('/login')
})

app.get('/',(req,res)=>{
    res.redirect('/home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login',(req,res)=>{
    console.log(req.body)
    USER.findOne({email:req.body.email, password:req.body.password}, function(err, user){
        if(user)
        {
            req.session.isLogin = 'true';
            req.session.user = req.body.email;
            res.redirect('/home')
        }
        else
        {
            console.log(err)
        }
    })
})

app.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/login');
})

app.get('/home',auth, (req, res)=>{
    USER.findOne({email:req.session.user}, (err,user)=>{
        ADDRESS.find({myemail: req.session.user}, (err,address)=>{
            res.render('home',{
                user:user,
                address:address
            })
        })
    })
})
app.get('/add/address',auth, (req, res)=>{
    res.render('addaddress')
})

app.post('/add/address', auth, (req, res)=>{
    let address = new ADDRESS({
        myemail: req.session.user,
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone
    })

    address.save();
    res.redirect('/home')
})

app.get('/edit/address/:id',auth, (req, res)=>{
    ADDRESS.findOne({_id:req.params.id}, function(err, address){
        res.render('editaddress',{
            address:address
        })
    })
})

app.post('/edit/address/:id',auth, (req, res)=>{
    ADDRESS.updateOne({_id:req.params.id}, {name:req.body.name,address:req.body.address, phone:req.body.phone}, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            res.redirect('/home')
        }
    })
})

app.get('/delete/address/:id',auth, (req, res)=>{
    ADDRESS.deleteOne({_id:req.params.id}, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            res.redirect('/home')
        }
    })
})

const port = 3000

app.listen(port, ()=>{
    console.log('server running on port ${port} ..')
})