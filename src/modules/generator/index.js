import fs from 'fs'
import path from 'path'

let filenames = JSON.parse(fs.readFileSync(path.join(__dirname, 'filenames.json')))
let maxNameLength = filenames.data.length

async function getFileName(){
    try {        
        return filenames.data[random(0,maxNameLength -1)]
    } catch(e) {
        console.log(e)
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
    


export default {
    getFileName, random
}