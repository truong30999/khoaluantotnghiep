const UtilityBill = require('../models/Utilitybills.model')
const Room = require('../models/Room.model')
const House = require('../models/House.model')
const today = new Date()
exports.createUtilityBills = async(req, res) => {
    try{
        const time = new Date( req.body.Time)
        const abc =  new Date(time.getFullYear(), time.getMonth())
      
    const ult = new UtilityBill({
        Time : abc,
        ElectricNumber : req.body.ElectricNumber,
        WaterNumber : req.body.WaterNumber,
        RoomId : req.body.RoomId
    })
    const result = await ult.save()
    const room = await Room.findById(req.body.RoomId)
    room.ListUtilityBill.push(result["_id"])
    await room.save()
    res.json(result)
        

    }
    catch (err) { 
        res.json({ message: err})
    }


}
exports.getAllUtilityBills = async (req, res) =>{
    try{
        const ult = await UtilityBill.find()
        res.json(ult)

    }catch (err) {
        res.json({ message: err})
    }

}
exports.getAllUtilityByRoom = async (req, res) =>{
    try {
        
        
            const time = new Date( req.query.Month)
            const abc =  new Date(time.getFullYear(), time.getMonth())
            const list = await House.find({UserId: req.jwt.userId, _id: req.query.HouseId})
            .populate({
                path: 'Rooms',
                populate: { path: 'ListUtilityBill', match: { Time:abc }
              }})
            res.json(list)
        
        
            // const month =  new Date(today.getFullYear(), today.getMonth())
            // const list = await House.find({ _id: req.query.HouseId , UserId: req.jwt.userId})
            // .populate({
            //     path: 'Rooms',
            //     populate: { path: 'ListUtilityBill', match: { Time: month }
            //   }})
            // res.json(list)
        
      
    } catch (error) {
        console.log(error.message)
        res.json({ message: error.message })
    }
}
exports.getById = async (req, res) => {
    try{
        const ult = await UtilityBill.findById(req.params.Id)
        res.json(ult)

    }catch (err) {
        res.json({ message: err})
    }

}
exports.update = async (req, res) =>{
    try{
        const update = req.body
        const result =  await UtilityBill.updateOne(
            {_id: req.params.Id},
            {$set: update}
        );
        res.json(result)
    }catch (err) {
        res.json({ message: err})
    }
}
exports.delete = async (req, res) => {
    try{
        const utl = await UtilityBill.findById(req.params.Id)
        const room = await Room.findById(utl.RoomId)
        const pos =  room.ListUtilityBill.indexOf(req.params.Id)
        room.ListUtilityBill.splice(pos,1)
        await room.save()
        const result =  await UtilityBill.remove({ _id:req.params.Id})

        res.json(result)
    }catch (err) {
        res.json({ message: err.message})
    }
}
