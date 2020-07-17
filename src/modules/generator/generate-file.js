import fs from 'fs'
import path from 'path'

let filenames = JSON.parse(fs.readFileSync(path.join(__dirname, 'filenames.json')))
let filenameCount = filenames.data.length

async function getFileName(){
    try {        
        return filenames.data[random(0,filenameCount -1)]
    } catch(e) {
        console.log(e)
    }
}

export default {
    getFileName
}