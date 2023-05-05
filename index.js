const express = require('express');
const cors = require("cors");
require('./db/config');
const User = require("./db/Users");
const app = express();
const Product = require("./db/Product");
app.use(express.json());
app.use(cors());
const Productmul = require("./db/Productmul");
const Category = require("./db/category");
const sharp = require('sharp')
app.use("/uploads", express.static("uploads"));
const nodemailer = require('nodemailer');
const In = require("./db/institue");
const photocmt = require("./db/photocmt");
//let uuidv4 = require('uuid/dist/v4');
const router = express.Router();
let mongoose = require("mongoose");
const userprofile = require("./db/profile");

//registration
app.post("/registration", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    resp.send(result);

    if (result) {
        console.log("User registered!");
    } else {
        console.log("Error");
    }
})

//comments add
app.post("/addcomment", async (req, resp) => {
    let cmt = new photocmt(req.body);
    let result = await cmt.save();
    result = result.toObject();
    resp.send(result);
})

//getcomments
app.get("/getcomments", async (req, resp, next) => {
    let comment = await photocmt.find();
    if (comment.length > 0) {
        resp.send(comment)
    } else {
        resp.send({ result: "no comments found" })
    }
})

//get comments by photoid
app.get("/getcommentbyphoto/:p_id", async (req, resp, next) => {
    let products = await photocmt.find({ p_id: req.params.p_id })
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no comments found" })
    }
})

//get comments by userid
app.get("/getcommentbyuser/:u_id", async (req, resp, next) => {
    let products = await photocmt.find({ u_id: req.params.u_id })
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no comments found" })
    }
})

//update get comments
app.get("/update_cmt/:id", async (req, resp, next) => {
    let result = await In.findOne({ _id: req.params.id })
    if (result) {
        resp.send(result)
    }
    else {
        resp.send({ result: "no Comment found " })
    }
})

//update put comments
app.put("/update_cmt/:id", async (req, resp, next) => {
    let result = await In.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    resp.send(result)
})

//hard delete comments
app.delete("/delete_cmt/:id", async (req, resp, next) => {
    const result = await photocmt.deleteOne({ _id: req.params.id })
    resp.send(result);
})

//login
app.post("/login", async (req, resp, next) => {
    console.log(req.body)
    if (req.body.password && req.body.emailid) {

        let user = await User.findOne(req.body).select("-password");
        if (user) {
            resp.send(user)
        }
        else {
            resp.send({ result: 'no user found' })
        }
    }
    else {
        resp.send({ result: 'no user found' })
    }

})

const multer = require("multer");
const { parse } = require("path");
const Path = require("path");
const category = require('./db/category');
require('dotenv/config');
var fs = require('fs');
var bodyParser = require('body-parser');
const { json } = require('body-parser');
const fileUpload = require('express-fileupload');


//photo storage path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
        //const fileName = file.originalname.toLowerCase().split('').join('-');
        //cb(null,fileName)
    }
});

//photo filters
const fileFilter = (req, file, callback) => {
    const acceptableExt = [".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG", ".heic", "HEIC"];
    if (!acceptableExt.includes(Path.extname(file.originalname))) {
        return callback(new Error("Only .png, .jpg  .jpeg .heic format allowed !!"));
    }
    const filesize = parseInt(req.headers["content-length"]);
    if (filesize > 10000000) {
        return callback(new Error("File Size Big!"));
    }
    callback(null, true);
};

var upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


//update user fetch
app.get("/update_users/:id", async (req, resp, next) => {
    let result = await User.findOne({ _id: req.params.id })
    if (result) {
        resp.send(result)
    }
    else {
        resp.send({ result: "no user found " })
    }
})

//update user
app.put("/update_users/:id", async (req, resp, next) => {
    let result = await User.updateMany(
        { _id: req.params.id },
        {
            $set: req.body,
        }
    )
    resp.send(result)
})


//user profile image
app.post("/addprofileimage", upload.single('photo'), async (req, resp, next) => {
    const path = req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

    var model = {
        userid: req.body.userid,
        photo: path,
    }
    let product = new userprofile(model);
    let result = await product.save();
    resp.send(result);
})


//addphotos
app.post("/addproduct", upload.single('photo'), async (req, resp, next) => {
    const path = req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

    var model = {
        imgname: req.body.imgname,
        userid: req.body.userid,
        category: req.body.category,
        instname: req.body.instname,
        tag: req.body.tag,
        dateadd: Date.now(),
        photo: path,
    }
    let product = new Product(model);
    let result = await product.save();
    resp.send(result);
})

//add category
app.post("/addcategory", async (req, resp) => {
    let category = new Category(req.body);

    if (!req.body.category) {
        return resp.send("Please Fill all the fields");
    }

    let checkexists_category = await Category.findOne({ category: req.body.category });

    if (checkexists_category) {
        console.log(JSON.stringify("Category Already exists!"));
        return resp.send(JSON.stringify("Category Already exists!"));
    } else {
        const result = await category.save();
        if (result) {
            return resp.send(JSON.stringify('Category Register Successsfully'));
        }
    }
})

//insert institute
app.post("/addinstitute", async (req, resp) => {
    let instname = new In(req.body);

    if (!req.body.instname) {
        return resp.send("fill data");
    }

    let check_ext = await In.findOne({ instname: req.body.instname });

    if (check_ext) {
        console.log(JSON.stringify("institute already exsist:"));
        return resp.send(JSON.stringify("institute already exsist !"));

    } else {
        const result = await instname.save();
        if (result) {
            return resp.send(JSON.stringify('Institute Register Successsfully'));
        }
    }
})

//getuserdetailfromemailid
app.get("/getUserbyemailid/:emailid", async (req, resp, next) => {
    let user = await User.find({ emailid: req.params.emailid })
    if (user.length > 0) {
        resp.send({ user })
    } else {
        resp.send({ result: "no user found" })
    }
})

//getallphotosbyuploadid 
app.get("/getPhotosbyuploadid/:userid", async (req, resp, next) => {
    let products = await Product.find({ userid: req.params.userid })
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no images found" })
    }
})

//getprofilephoto
app.get("/getprofilePhotosbyuploadid/:userid", async (req, resp, next) => {
    let products = await userprofile.find({ userid: req.params.userid })
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no Profile image found" })
    }
})


//getallphotosbycategory 
app.get("/getPhotosbycat/:category", async (req, resp, next) => {
    let products = await Product.find({ category: req.params.category })
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no images found" })
    }
})

//getallphotos
app.get("/getphotos", async (req, resp, next) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no images found" })
    }
})

//get all categories
app.get("/getcategories", async (req, resp, next) => {
    let category = await Category.find();
    if (category.length > 0) {
        resp.send(category)
    } else {
        resp.send({ result: "no categories found" })
    }
})

//get all institutes
app.get("/getinst", async (req, resp, next) => {
    let instname = await In.find();
    if (instname.length > 0) {
        resp.send(instname)
    } else {
        resp.send({ result: "no institute found" })
    }
})

//update institute fetch
app.get("/update_inst/:id", async (req, resp, next) => {
    let result = await In.findOne({ _id: req.params.id })
    if (result) {
        resp.send(result)
    }
    else {
        resp.send({ result: "no institute found " })
    }
})

//update institute
app.put("/update_inst/:id", async (req, resp, next) => {
    let result = await In.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    resp.send(result)
})

//getphotographer
app.get("/getPhotographers", async (req, resp, next) => {
    let user = await User.find(
        {
            "$or": [
                {
                    "role": "photog"
                }
            ]
        }
    );
    if (user.length > 0) {
        resp.send(user)
    } else {
        resp.send({ result: "no user found" })
    }
})

//getviewer
app.get("/getViewers", async (req, resp, next) => {
    let user = await User.find(
        {
            "$or": [
                {
                    "role": "viewer"
                }
            ]
        }
    );
    if (user.length > 0) {
        resp.send(user)
    } else {
        resp.send({ result: "no user found" })
    }
})

//getallusers
app.get("/getall", async (req, resp, next) => {
    let user = await User.find();
    if (user.length > 0) {
        resp.send(user)
    } else {
        resp.send({ result: "no user found" })
    }
})



//update category fetch
app.get("/update_category/:id", async (req, resp, next) => {
    let result = await Category.findOne({ _id: req.params.id })
    if (result) {
        resp.send(result)
    }
    else {
        resp.send({ result: "no category found " })
    }
})

//update category
app.put("/update_category/:id", async (req, resp, next) => {
    let result = await Category.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    resp.send(result)
})


//update photo fetch
app.get("/update_photos/:id", async (req, resp, next) => {
    let result = await Product.findOne({ _id: req.params.id })
    if (result) {
        resp.send(result)
    }
    else {
        resp.send({ result: "no image found " })
    }
})

//update photo
app.put("/update_photos/:id", async (req, resp, next) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    resp.send(result)
})

//softdelete
app.patch("/delete_photos/:id", async (req, resp, next) => {
    try {
        let id = req.params.id;
        const update = req.body;
        const options = { new: true };
        const result = await User.findByIdAndUpdate(id, update, options);

        if (result) {
            resp.send(result);
        } else {
            resp.send('Not found');
            return;
        }
    } catch (error) {
        console.log(error.message);
    }
})

//hard delete photo
app.delete("/delete_photo/:id", async (req, resp, next) => {
    const result = await Product.deleteOne({ _id: req.params.id })
    resp.send(result);
})

//hard delete Profile photo
app.delete("/deleteprophoto/:id", async (req, resp, next) => {
    const result = await userprofile.deleteOne({ _id: req.params.id })
    resp.send(result);
})

//hard delete category
app.delete("/delete_category/:id", async (req, resp, next) => {
    const result = await Category.deleteOne({ _id: req.params.id })
    resp.send(result);
})

//hard delete photographer
app.delete("/delete_photographer/:id", async (req, resp, next) => {
    const result = await User.deleteOne({ _id: req.params.id })
    resp.send(result);
})

//hard delete viewer
app.delete("/delete_viewer/:id", async (req, resp, next) => {
    const result = await User.deleteOne({ _id: req.params.id })
    resp.send(result);
})

//hard delete institute
app.delete("/delete_institute/:id", async (req, resp, next) => {
    const result = await In.deleteOne({ _id: req.params.id })
    resp.send(result);
})

//searchcomments
app.get("/searchcmts/:key", async (req, resp, next) => {
    let prod = await photocmt.find(
        {
            "$or": [
                {
                    "comment": { $regex: req.params.key }
                },
            ]
        }
    );
    if (prod.length > 0) {
        resp.send(prod)
    } else {
        resp.send({ result: "no keyword found" })
    }
})



//searchtagsw
app.get("/searchtags/:key", async (req, resp, next) => {
    let prod = await Product.find(
        {
            "$or": [
                {
                    "tag": { $regex: req.params.key }
                },
                {
                    "imgname": { $regex: req.params.key }
                },
                {
                    "category": { $regex: req.params.key }
                },
            ]
        }
    );
    if (prod.length > 0) {
        resp.send(prod)
    } else {
        resp.send({ result: "no comments found" })
    }
})

//searchinstitute
app.get("/searchinst/:key", async (req, resp, next) => {
    let prod = await In.find(
        {
            "$or": [
                {
                    "instname": { $regex: req.params.key }
                }
            ]
        }
    );
    if (prod.length > 0) {
        resp.send(prod)
    } else {
        resp.send({ result: "no keyword found" })
    }
})

app.get("/searchuser/:key", async (req, resp, next) => {
    let user = await User.find(
        {
            "$or": [
                {
                    "role": "photog",
                },
                {
                    "fname": { $regex: req.params.key },
                },
                {
                    "emailid": { $regex: req.params.key },
                },
            ]
        }
    );
    if (user.length > 0) {
        resp.send(user)
    } else {
        resp.send({ result: "no keyword found" })
    }
})

//getphotobyphotoid
app.get("/getPhotosbyid/:id", async (req, resp, next) => {
    let products = await Product.find({ _id: req.params.id })
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "no Photo found" })
    }
})



//insert multiple photos
app.post("/addproductmultiple", upload.array("imgCollection", 6), (req, resp, next) => {
    const filesArray = [];
    const url = req.protocol + '://' + req.get('host')

    //return console.log(req.files.length);

    for (var i = 0; i < req.files.length; i++) {
        const path = req.files[i] != undefined ? req.files[i].path.replace(/\\/g, "/") : "";
        filesArray.push(url + '/' + path)
    }

    //console.log(req.filesArray[0].fileName);
    const mulp = new Productmul({
        imgCollection: filesArray
    });
    mulp.save().then(result => {
        resp.status(201).json({
            messasge: "done upload!",
            productAdded: {
                _id: result._id,
                imgCollection: result.imgCollection
            }
        })
    }).catch(err => {
        console.log(err),
            resp.status(500).json({
                error: err
            });
    })
})

//fetch multiple photos



//updateuserbyemailid
app.put("/updateUserbyemailid", async (req, resp, next) => {
    try {
        const userEmail = req.body.emailid;
        const Password = req.body.newpassword;
        const data = await User.findOneAndUpdate({ emailid: userEmail }, { $set: { password: Password } });
        if (data) {
            resp.send("pass updated")
        } else {
            resp.send("not updated")
        }
    }
    catch (err) {
        console.log(err.message);
    }
})

app.put("/APIPASS/:email", async (req, resp) => {
    let result = await User.updateOne(
        { email: req.params.email },
        {
            $set: req.body
        }
    )
    resp.send(result);
});

// updatepassword: async (req, resp) => {
// try {
//     const userEmail = req.body.Email;
//     const Password = req.body.Password;
//     const data = await registermodel.findOne({ Email: userEmail });
//     if (data) {
//         const salt = await bcrypt.genSalt(10);
//         newpass = await bcrypt.hash(Password, salt);
//         const userdata = await registermodel.updateOne({ Email: userEmail }, { $set: { Password: newpass } });
//         if (userdata) {
//             resp.send("Your Password has been  updated");
//         }
//         else {
//             resp.send("Some problem to updated Password");
//         }
//     }
// }
// catch (err) {
//     console.log(err.message);
// }
// },

//send email 
app.post("/send_email", async (req, resp) => {

    let data = await User.findOne(req.body).select("-password");

    if (data) {

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "19bmiit046@gmail.com",
                pass: "nzensbzfxfwzqqxx",
            }
        })

        transporter.verify((error, success) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Ready for message");
                console.log(success);

            }

            function getRandom6DigitNumber() {
                return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
            }

            var randomNumber = getRandom6DigitNumber();

            // const cookies = req.cookies;
            // console.log()); // { name: 'value' }
            //console.log();
            // function getRandom6DigitNumber() {
            //     return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
            //   }

            //   var randomNumber = getRandom6DigitNumber();
            //   //Cookies.set('otp',randomNumber,{expires:1});
            //   resp.setHeader('Set-Cookie',cookie.serialize('otp',randomNumber,{httpOnly:true,maxAge:60*60*24}));

            const mailOptions = {
                from: 'bmiit',
                to: req.body.emailid,
                subject: "Verify Your Email",
                html: '<p>YO BRO THIS IS UTU gallery</p><p> ' + randomNumber + 'This link expires in 6 hours</p><p>enter to Procced.</p>'


            };

            transporter.sendMail(mailOptions, (e, info) => {
                if (e) {
                    console.log(e)
                }
                else {
                    resp.send({ randomNumber })
                }
            });

        });

    }

    else {
        resp.send({ ERROR: "NOT REGISTERD EMAIL ID" })
    }
})

//emailcheck
app.post("/email_check", async (req, resp) => {

    let data = await User.findOne(req.body).select("-password");

    if (data) {
        resp.send(data);
    }
    else {
        resp.send({ ERROR: "NOT REGISTERD EMAIL ID" })
    }
})

app.listen(5000)
