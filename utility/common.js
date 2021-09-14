

exports.convertArrImage = (arr)=>{
    let arrImage = []
    arr.map((img)=>{
        arrImage.push(img.filename)
    })
    return arrImage
}
fsdfs