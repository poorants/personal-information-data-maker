import generator from './modules/generator'
import path from 'path'
import fs from 'fs'

async function main() {

    let heightDepth = 8
    let widthDepth = 4

    let lists = new Object()

    let level = 1
    let count = 0
    
    let maxCount = 100000;

    let targetList = await generator.getDirList(300000)

    let maximumDepth = 0
    for(let i = 0; i < targetList.length; i++ ){
        let temp = targetList[i]
        
        let count = (temp.match(/\//g) || []).length;
        if(count > maximumDepth) maximumDepth = count
        
    }
    console.log(`maximumDepth : ${maximumDepth}`)
    //fs.writeFileSync('./rst.txt', targetList)

   
    
}


main()