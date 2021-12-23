const Statistical = require("../models/Statistical.model");
const User = require("../models/User.model");

const config = require("../config/config");
const common = require("../utility/common");


exports.getByYear = async (req, res) => {
    // req.params.Year, req.jwt.userId
    const year = req.params.Year
    try {
        const user = await User.findById(req.jwt.userId)
        let result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (const value of user.House) {
            const statiscal = await Statistical.find({ HouseId: value, Year: { $eq: year } })
            statiscal.forEach(element => {
                const index = element.Month - 1
                result[index] = result[index] + element.TotalRevenue
            });
        }
        res.json(result)
    } catch (error) {
        res.json({ error: error })
    }
}