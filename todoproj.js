const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = 8000;

const sequelize = new Sequelize('todo','sahil','123',{
    host: 'localhost',
    dialect: 'postgres'
})

sequelize.authenticate().then( ()=> {
    console.log("Database Connected");
}).catch( err => {
    console.error('unable to connect to Database');
});

//table creation
const user = sequelize.define('userdata',{
    uid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    uname: Sequelize.STRING,

    emailid: {
        type: Sequelize.STRING,
        unique: true,
        },
    profilepic: Sequelize.STRING
   
    },{
        timestamps: false
});

const login = sequelize.define ('login',{
    lid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
     password: Sequelize.STRING,
     emailid: {
        type: Sequelize.STRING,
        unique: true
    },
},
{
    timestamps: false
});

const todo = sequelize.define('todo',
{
    tid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
status : {
type: Sequelize.BOOLEAN,
defaultValue: false
    },
    deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
},
    {
        timestamps: false
});


login.belongsTo(user,{foreignKey:'emailid',targetKey:'emailid'});
user.hasMany(todo,{foreignKey:'uid'});

sequelize.sync({
 force:true
 });

//api
app.post('/add/user', async(req,res) => {
    var email = req.body.emailid;
    var username = req.body.username;
    var pic= req.body.pic;
    var newUser = {
        uname: username,
        emailid: email,
        profilepic:pic
    }
   try{
        var user_created = await user.create(newUser);
        console.log(user_created);    
        if(user_created)
        {
            res.status(200).json({
                message: "User created successfully."
            });
            return;
        }
   }
   catch(err){
    console.log(err);
    res.status(500).json({
        message: "Error.",
        error: err
    });
    return;
   }

})


app.post('/add/todo', async (req,res) => {
    var title = req.body.title;
    var des = req.body.des;
    var uid = req.body.uid;

    var newtodo = {
title: title,
description: des,
uid:uid
    }

   try{  
        var todoobj = await todo.create(newtodo);
        console.log(todoobj);
        if(todoobj)
        {
            res.status(200).json({
                message: "Success"
            });
            return;
        }
   }
   catch(err){
    console.log(err);
    res.status(500).json({
        message: "Error",
        error: err
    });
    return;
   }
})


app.post('/dashboard', async (req,res) => {

    var userid = req.body.uid;
    try{

        var todos = await todo.findAll({
            where: {
                uid: userid
            }
        });
        if(todos)
        {
            res.status(200).json({
                todo : todos
            });
            return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error"
        });
        return;
    }

})

app.post('/edit/todo', async (req,res) => {
    var newtodo = {
title: req.body.title,
description: req.body.des,
status:req.body.stat
    }

    try{
        var todos = await todo.update(newtodo,
{ where: { tid: req.body.tid} }
        );

        if(todos)
        {
            res.status(200).json({
                message: "success"
            });
            return;
        }
        }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error"
        });
        return;
    }

})

app.post('/delete/todo', async (req,res) => {
    try{

        var todos = await todo.update(
{
deleted:true
},
{ where: { tid: req.body.tid } }
        );

        if(todos)
        {
            res.status(200).json({
                message: "success"
            });
            return;
        }
        }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error"
        });
        return;
    }
})

app.post('/deleted/dashboard', async (req,res) => {

    try{
        var todos = await todo.findAll({
            where: {
                uid:req.body.uid,
                deleted: true
            }
        });

        if(todos)
        {
            res.status(200).json({
                todo : todos
            });
            return;
        }
    }
    catch(err){
        res.status(500).json({
            message: "error"
        });
        return;
    }

})

app.post('/profile', async (req,res) => {
    try{

        var profile = await user.findOne({
            where: {
                uid : req.body.uid
            }
        });

        if(profile)
        {
            res.status(200).json({
                details : profile
            });
            return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error"
        });
        return;
    }

})

app.listen(port, () => {
    console.log("Server started on port 8000");
});
