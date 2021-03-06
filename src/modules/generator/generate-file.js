import fs from "fs";
import path from "path";
import util from "./generate-util";
import nodeSsh from "node-ssh";
import { config } from "process";

let filenames = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "filenames.json"))
);
let filenameCount = filenames.data.length;

let setting = JSON.parse(fs.readFileSync(path.join(__dirname, "setting.json")));

let textExtensionList = ["txt", "dat", "csv"];
let imageExtensionList = ["gif", "png", "jpeg", "tif"];
let garbageText = fs
  .readFileSync(path.join(__dirname, "data", "sample.txt"))
  .toString()
  .split(" ");

let GFPREFIX = "gf_";
let PFPREFIX = "pf_";
let GIPREFIX = "gi_";
let PIPREFIX = "pi_";

async function getFileName() {
  try {
    return filenames.data[util.random(0, filenameCount - 1)];
  } catch (e) {
    throw e;
  }
}

async function randomDraw(array = Array) {
  return array[(0, await util.random(0, array.length))];
}

async function getFileList(isText = true, isPersonal = false, targetCount) {
  let resultArray = new Array();
  let extension = new String();

  if (isText) extension = await randomDraw(textExtensionList);
  else extension = await randomDraw(imageExtensionList);

  let loopCount = 0;
  while (loopCount < targetCount) {
    let tmpObj = { src: "", dest: "" };

    if (isText) {
      if (isPersonal) tmpObj.src = "p-text";
      else tmpObj.src = "g-text";
    } else {
      if (isPersonal)
        tmpObj.src = path.join(
          __dirname,
          "data",
          "images",
          "private",
          "jumin_sample_0" + (await util.random(1, 6)) + "." + extension
        );
      else
        tmpObj.src = path.join(
          __dirname,
          "data",
          "images",
          "common",
          "common_sample_0" + (await util.random(1, 6)) + "." + extension
        );
    }

    // 대상 파일 경로 추출
    let prefix = "";
    if (isText) {
      if (isPersonal) prefix = PFPREFIX;
      else prefix = GFPREFIX;
    } else {
      if (isPersonal) prefix = PIPREFIX;
      else prefix = GIPREFIX;
    }

    tmpObj.dest = prefix + (await getFileName()) + "." + extension;
    let isDuplicate = false;
    for (let j = 0; j < resultArray.length; j++) {
      if (resultArray[j].dest === tmpObj.dest) {
        isDuplicate = true;
        break;
      }
    }
    // if (isDuplicate) console.log("파일명 중복으로 재발급");
    if (isDuplicate) continue; // 파일명 중복으로 스킵.

    // console.log(tmpObj);
    resultArray.push(tmpObj);
    loopCount++;
  }

  return resultArray;
}

async function getPathObject(isText, isPersonal, targetCount, directories) {
  let tmpObj = new Object();
  tmpObj.dir = await randomDraw(directories);
  tmpObj.fileList = await getFileList(isText, isPersonal, targetCount);
  tmpObj.fileCount = targetCount;

  return tmpObj;
}

async function getGarbageFileList(
  directories = Array,
  targetCount,
  maximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = true;
  let isPersonal = false;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, maximumFilesPerPath + 1);
      let pathObject = await getPathObject(
        isText,
        isPersonal,
        targetCount,
        directories
      );

      result.list.push(pathObject);
      getCount += targetCount;
    }

    result.count = getCount;

    return result;
  } catch (e) {
    throw e;
  }
}

async function getPersonalFileList(
  directories = Array,
  targetCount,
  maximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = true;
  let isPersonal = true;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, maximumFilesPerPath + 1);
      let pathObject = await getPathObject(
        isText,
        isPersonal,
        targetCount,
        directories
      );

      result.list.push(pathObject);
      getCount += targetCount;
    }

    result.count = getCount;

    return result;
  } catch (e) {
    throw e;
  }
}

async function getGarbageImageList(
  directories = Array,
  targetCount,
  maximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = false;
  let isPersonal = false;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, maximumFilesPerPath + 1);
      let pathObject = await getPathObject(
        isText,
        isPersonal,
        targetCount,
        directories
      );

      result.list.push(pathObject);
      getCount += targetCount;
    }

    result.count = getCount;

    return result;
  } catch (e) {
    throw e;
  }
}

async function getPersonalImageList(
  directories = Array,
  targetCount,
  maximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = false;
  let isPersonal = true;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, maximumFilesPerPath + 1);
      let pathObject = await getPathObject(
        isText,
        isPersonal,
        targetCount,
        directories
      );

      result.list.push(pathObject);
      getCount += targetCount;
    }

    result.count = getCount;

    return result;
  } catch (e) {
    throw e;
  }
}

function lpad(n, width) {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
}

async function getJuminNo(isHalf = false, isHyphen = true) {
  let juminNumber = "";
  if (!isHalf) {
    juminNumber += lpad(await util.random(0, 100), 2);
    juminNumber += lpad(await util.random(1, 13), 2);
    juminNumber += lpad(await util.random(1, 32), 2);

    if (isHyphen) juminNumber += "-";
  }
  juminNumber += await util.random(1, 5);
  juminNumber += lpad(await util.random(1, 1000000), 6);

  return juminNumber;
}

async function getWord() {
  return await randomDraw(garbageText);
}

async function getRandomCsv(isPersonal = false) {
  let maxField = setting.config.file.csv.maxField;
  let maxRows = setting.config.file.csv.maxRows;

  let fieldNum = await util.random(1, maxField + 1);
  let rowNum = await util.random(1, maxRows + 1);
  let personalFieldNum = await util.random(1, fieldNum + 1);

  let buffer = new String();
  for (let i = 1; i <= rowNum; i++) {
    if (i !== 1) buffer += "\n";
    for (let j = 1; j <= fieldNum; j++) {
      if (isPersonal && j === personalFieldNum)
        buffer += await getJuminNo(false, true);
      else buffer += await getWord();
      if (j !== fieldNum) buffer += ",";
    }
  }

  return buffer;
}

async function getRandomString(isPersonal = false) {
  let maxWord = setting.config.file.text.maxWords;
  let wordNum = await util.random(1, maxWord + 1);
  let personalWordPos = await util.random(1, wordNum + 1);

  let buffer = new String();
  for (let i = 1; i <= wordNum; i++) {
    if (isPersonal && i === personalWordPos)
      buffer += await getJuminNo(false, true);
    else buffer += await getWord();

    if (i !== wordNum) buffer += " ";
  }

  return buffer;
}

async function createFile(config, data = Object, isImage, isPersonal) {
  try {
    let session = new nodeSsh();
    await session.connect(config);
    // console.log(data);
    let totalCount = data.count;
    let createCount = 0;

    // for (let i = 0; i < data.list.length; i++) {
    //   totalCount += data.list[i].count;
    // }

    // console.log(`totalCount : ${totalCount}`);

    let progressBarMark = "";

    if (isImage) {
      if (isPersonal) progressBarMark = "Personal Image Create";
      else progressBarMark = "Garbage Image Create";
    } else {
      if (isPersonal) progressBarMark = "Personal File Create";
      else progressBarMark = "Garbage File Create";
    }

    let bar = util.getBar(progressBarMark);
    bar.start(totalCount, 0);

    let list = data.list;
    for (let i = 0; i < data.list.length; i++) {
      let list = data.list[i];
      let fileList = list.fileList;
      let isCsv = await util.random(0, 2);

      for (let j = 0; j < fileList.length; j++) {
        let file = fileList[j];
        if (!isImage) {
          if (isCsv) file.src = await getRandomCsv(isPersonal);
          else file.src = await getRandomString(isPersonal);
        }

        let targetFile = path.posix.join(list.dir, file.dest);
        // console.log(file.src);
        // console.log(targetFile);
        if (isImage) await session.putFile(file.src, targetFile);
        else await session.execCommand(`echo '${file.src}' > ${targetFile}`);

        createCount++;
        bar.update(createCount);
      }
    }

    bar.stop();
    session.dispose();
  } catch (e) {
    throw e;
  }
}

export default {
  getGarbageFileList,
  getPersonalFileList,
  getGarbageImageList,
  getPersonalImageList,
  createFile,
};
