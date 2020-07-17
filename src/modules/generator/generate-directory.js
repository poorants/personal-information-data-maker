import fs from 'fs'
import path from 'path'
import util from './generate-util'

let dirnames = JSON.parse(fs.readFileSync(path.join(__dirname, 'dirnames.json')))
let dirnameCount = dirnames.data.length

async function getDirList(pathCount = 1, maximunDepth = 10){
    console.log(pathCount)
    let directories = new Array()
    let endPointNodes = new Array()

    directories.push('.')

    for(let i = 1; i < pathCount; i ++ ){
        let targetIdx = util.random(0,directories.length)
        let newRecord = path.posix.join(directories[targetIdx], await getDirName())
        let depth = (newRecord.match(/\//g) || []).length;
        
        if(maximunDepth !== 0 && depth >= maximunDepth) endPointNodes.push(newRecord)
        else directories.push(newRecord)
    }   
    
    return directories
    
}

async function getDirName(){
    try {        
        return dirnames.data[util.random(0,dirnameCount -1)]
    } catch(e) {
        console.log(e)
    }
}

export default {
    getDirList
}

