const userModel = require("../models/userModel")
const userVal = require("../validators/userValidator")


const bcrypt = require("bcrypt")

const awsCon = require("../controllers/awsController")

const createUser = async function(req,res){
    try{
        let data = req.body
        // let {fname, lname,email,profileImage, phone,password, address } = data

        if(!Object.keys(data).length && !files)
        return res.status(400).send({status:false,message:"Send data in body"})

        if(data.fname!=undefined)
        {
            if(userVal.isValidName(data.fname))
            return res.status(400).send({status:false,message:"fname is invalid"})
        }

        if(data.lname!=undefined)
        {
            if(userVal.isValidName(data.lname))
            return res.status(400).send({status:false,message:"lname is invalid"})
        }
        if(data.email!=undefined)
        {
            if(userVal.isValidEmail(data.email))
            return res.status(400).send({status:false,message:"email is invalid"})
        }
        if(data.profileImage!=undefined)
        {
            if(!userVal.isValids3(data.profileImage))
            return res.status(400).send({status:false,message:"s3 url is invalid"})
        }
        if(data.phone!=undefined)
        {
            if(userVal.isValidMobile(data.phone))
            return res.status(400).send({status:false,message:"phone is invalid"})
        }
        if(data.password!=undefined)
        {
            if(userVal.isPassword(data.password))
            return res.status(400).send({status:false,message:"password is invalid"})
            data.password = bcrypt.hash(data.password, 10, function(err, hash) {
                return res.status(400).send({status:false,message:err})
            });
        }
        if(data.address!=undefined)
        {data.address = JSON.parse(data.address)
            if(data.address.shipping!=undefined)
            {
                if(data.address.shipping.street!=undefined)
                {if(userVal.isValidName(data.address.shipping.street))
                return res.status(400).send({status:false,message:"shipping street is invalid"})
                }if(data.address.shipping.city!=undefined)
                {if(userVal.isValidName(data.address.shipping.city))
                return res.status(400).send({status:false,message:"shipping city is invalid"})
                }if(data.address.shipping.pincode!=undefined)
                {if(userVal.isValidPincode(data.address.shipping.pincode))
                return res.status(400).send({status:false,message:"shipping pincode is invalid"})
                
                }
            }
            if(data.address.billing!=undefined)
            {
                if(data.address.billing.street!=undefined)
                {if(userVal.isValidName(data.address.billing.street))
                return res.status(400).send({status:false,message:"billing street is invalid"})
                }if(data.address.billing.city!=undefined)
                {if(userVal.isValidName(data.address.billing.city))
                return res.status(400).send({status:false,message:"billing city is invalid"})
                }if(data.address.billing.pincode!=undefined)
                {if(userVal.isValidPincode(data.address.billing.pincode))
                return res.status(400).send({status:false,message:"billing pincode is invalid"})
                }
            }
        }

        let savedData = await userModel.create(data)
      return   res.status(201).send({  "status": true,"message": "User created successfully",data: savedData})
 
        

    }
    catch(error){
        res.status(500).send({msg: error.message})

    }


}

const updateUser = async function(req,res){
    try{

        let data = req.body
        let files = req.files
        let userId = req.params.userId

        if(!Object.keys(data).length && !files)
        return res.status(400).send({status:false,message:"Send data in body"})

        if(data.fname!=undefined)
        {
            if(userVal.isValidName(data.fname))
            return res.status(400).send({status:false,message:"fname is invalid"})
        }
        if(data.lname!=undefined)
        {
            if(userVal.isValidName(data.lname))
            return res.status(400).send({status:false,message:"lname is invalid"})
        }
        if(data.email!=undefined)
        {
            if(userVal.isValidEmail(data.email))
            return res.status(400).send({status:false,message:"email is invalid"})
        }
        if(files && files.length>0)
        {
            let url = await awsCon.uploadFile(files[0])
            data.profileImage = url.msg
        }
        if(data.phone!=undefined)
        {
            if(userVal.isValidMobile(data.phone))
            return res.status(400).send({status:false,message:"phone is invalid"})
        }
        if(data.password!=undefined)
        {
            if(userVal.isPassword(data.password))
            return res.status(400).send({status:false,message:"password is invalid"})
            data.password = await bcrypt.hash(data.password, 10)
            
        }
        if(data.address!=undefined)
        {
            if(data.address.shipping!=undefined)
            {
                if(data.address.shipping.street!=undefined)
                {if(userVal.isValidName(data.address.shipping.street))
                return res.status(400).send({status:false,message:"shipping street is invalid"})
                }if(data.address.shipping.city!=undefined)
                {if(userVal.isValidName(data.address.shipping.city))
                return res.status(400).send({status:false,message:"shipping city is invalid"})
                }if(data.address.shipping.pincode!=undefined)
                {if(userVal.isValidPincode(data.address.shipping.pincode))
                return res.status(400).send({status:false,message:"shipping pincode is invalid"})
                }
            }
            if(data.address.billing!=undefined)
            {
                if(data.address.billing.street!=undefined)
                {if(userVal.isValidName(data.address.billing.street))
                return res.status(400).send({status:false,message:"billing street is invalid"})
                }if(data.address.billing.city!=undefined)
                {if(userVal.isValidName(data.address.billing.city))
                return res.status(400).send({status:false,message:"billing city is invalid"})
                }if(data.address.billing.pincode!=undefined)
                {if(userVal.isValidPincode(data.address.billing.pincode))
                return res.status(400).send({status:false,message:"billing pincode is invalid"})
                }
            }
        }
        
        let createUser = await userModel.findOneAndUpdate({_id:userId},data,{new:true})
         return res.status(200).send({status:false,data:createUser})

    }
    catch(error){
        res.status(500).send({msg:error.message})
    }
}


const loginUser = async function (req, res) {
    try {
        let loginData = req.body
        let { email, password } = loginData
 
        let user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).send({ status: false, message: "Email Not found" });
        }
    
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).send({ status: false, message: "wrong password" })
        }

        return res.status(200).send({ status: true, message: "Success", data: { userId: user._id, token: token } })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createUser = createUser
module.exports.updateUser = updateUser