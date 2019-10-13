var express = require("express")
var bodyParser = require("body-parser")
var app = express()
var mongoose = require("mongoose")
var passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    //User        = require("./models/user"),
    Buyer        = require("./models/buyer"),
    Discount       = require("./models/discount"),
    Lender        = require("./models/lender"),
    Seller      = require("./models/seller"),
    Proposal     = require("./models/proposal");
var sendMail = require("./mail")

mongoose.connect("mongodb://localhost:27017/uhack", {useNewUrlParser: true})

//app.set("view-engine","ejs")

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require("express-session")({
    secret: "COE-2 is shit!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
})

const signupRoute=require('./routes/signuphandler')
const loginRoute=require('./routes/loginhandler')
const uploadRoute=require('./routes/uploadHandler')


function midB(req,res,next){
    passport.use(new LocalStrategy(Buyer.authenticate()));
    passport.serializeUser(Buyer.serializeUser());
    passport.deserializeUser(Buyer.deserializeUser());
    return next();
}
function midL(req,res,next){
    passport.use(new LocalStrategy(Lender.authenticate()));
    passport.serializeUser(Lender.serializeUser());
    passport.deserializeUser(Lender.deserializeUser());
    return next();
}
function midS(req,res,next){
    passport.use(new LocalStrategy(Seller.authenticate()));
    passport.serializeUser(Seller.serializeUser());
    passport.deserializeUser(Seller.deserializeUser());
    return next();
}

app.get('/',function(req,res){
    res.render("landing.ejs",{currentUser: req.user});
})

app.use(signupRoute)

app.use(loginRoute)

app.use(uploadRoute)


app.post("/signupS", function(req, res){
    var newUser = new Seller({ 
                                username: req.body.username,
                                contact: req.body.lcontactnum,
                                emailId: req.body.email,
                                name: req.body.firstname,
                             });
    Seller.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signupS.ejs",{currentUser: req.user});
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect('/loginS')
        });
    });
})


app.post("/signupL", function(req, res){
    var newUser = new Lender({ 
                                username: req.body.username,
                                contact: req.body.lcontactnum,
                                emailId: req.body.email,
                                name: req.body.firstname,
                             });
    Lender.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signupL.ejs",{currentUser: req.user});
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect('/loginL')
        });
    });
})


app.post("/signupB", function(req, res){
    var newUser = new Buyer({ 
                                username: req.body.username,
                                contact: req.body.lcontactnum,
                                emailId: req.body.email,
                                name: req.body.firstname,
                                defaults: "0"
                             });
    Buyer.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signupB.ejs",{currentUser: req.user});
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect('/loginB')
        });
    });
})

app.get('/upload',(req,res)=>{
    res.render('upload.ejs')
})


app.post("/loginS",midS, passport.authenticate("local", 
    {
        successRedirect: "/Seller",
        failureRedirect: "/loginS"
    }), function(req, res){
})
app.post("/loginL",midL, passport.authenticate("local", 
    {
        successRedirect: "/displayL",
        failureRedirect: "/loginL"
    }), function(req, res){
})
app.post("/loginB",midB, passport.authenticate("local", 
    {
        successRedirect: "#",
        failureRedirect: "/loginB"
    }), function(req, res){
})


app.get("/Seller" , function(req,res){
    res.render("seller.ejs")
})


//app.get('/upload2',(req,res)=>{
//    res.render('upload2.ejs')
//})

//app.post('/invoiceDetails',(req,res)=>{
//    res.redirect('/upload2')
//})

app.post("/invoiceDetails", function(req,res){
     var newD = new Discount({ 
                                amount: req.body.amount,
                                dueDate: req.body.date,
                                setteled: "no",
                             });
    var buyername = req.body.buyername;
    var sellerid = req.user.id;
    Discount.create(newD, function(err, discount){
        if(err){
            console.log(err)
        } else {
            console.log("new discount")
            
            Seller.findById(sellerid,function(err,seller){
                if(err){
                    console.log(err)
                } else {
                    discount.seller=seller;
//                    discount.save();
                    console.log("added seller to discount")
                }
            })
            
            Buyer.findOne({name:buyername}).exec(function(err, buyer) {
                    if(err){
                        console.log(err)
                    } else {
                        discount.buyer=buyer;
                        discount.save();
                        console.log(discount)
                        console.log("added buyer to discount")
                    }
                    });
            
            console.log(discount)
        }
    })
    sendMail();
    res.redirect("/displayS");
})

app.get("/displayL",function(req,res){
    Discount.find({setteled:no}).exec(function(err,discounts){
        if(err){
            console.log(err)
        } else {
            res.render("displayL.ejs",{discounts:discounts})
        }
    })
})

app.get("/displayS" , function(req,res){
    Proposal.findById(req.user._id).exec(function(err,proposals){
        if(err){
            console.log(err)
        } else {
            res.render("displayS.ejs",{proposals:proposals})
        }
    })
    
})

app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

app.listen(4000, function(){
    console.log("The app has started!!");
})