const Service = require('../models/Services.model')
const jwt = require('jsonwebtoken')
exports.createService = async (req, res) => {
    const service = new Service({
        ServiceName: req.body.ServiceName,
        Description: req.body.Description,
        Price: req.body.Price,
        UserId: req.body.UserId
    })
    try {
        const createService = await service.save()
        res.json(createService)
    }catch(err)
    {
        res.json({message: err})
    }
}

exports.getAllService = async (req, res) =>{
    try{
        const allService = await Service.find()
        res.json(allService)
    }catch(err){
        res.json({message: err})
    }
}
exports.getServiceById = async(req,res)=>{
    try{
        const service = await Service.findById(req.params.serviceId)
        res.json(service)
    }catch(err){
        res.json({message: err})
    }
}
exports.getServiceOfUser = async(req, res) =>{
    try{
        const service = await Service.find({UserId: req.jwt.userId})
        res.json(service)
    }catch(err){
        res.json({message: err})
    }

}
exports.updateService = async (req,res)=>{
    try{
        let service = req.body
        const updateService = await Service.updateOne(
            {_id : req.params.serviceId},
            {$set: service}
        )
        res.json(updateService)
    }catch(err){
        res.json({message: err})
    }
}
exports.deleteService = async (req,res) =>{
    try{
        const service = await Service.remove({_id : req.params.serviceId})
        res.json(service)
    }
    catch(err){
        res.json({message: err})
    }
}


