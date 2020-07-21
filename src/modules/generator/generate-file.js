import fs from "fs";
import path from "path";
import util from "./generate-util";

let filenames = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "filenames.json"))
);
let filenameCount = filenames.data.length;

let textExtensionList = ["txt", "dat", "csv"];
let imageExtensionList = ["gif", "png", "jpeg", "tif"];

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
          "jumin_sample_" + (await util.random(0, 6)) + "." + extension
        );
      else
        tmpObj.src = path.join(
          __dirname,
          "data",
          "images",
          "common",
          "common_sample_" + (await util.random(0, 6)) + "." + extension
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

    console.log(tmpObj);
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
  MaximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = true;
  let isPersonal = false;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, MaximumFilesPerPath + 1);
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
  MaximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = true;
  let isPersonal = true;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, MaximumFilesPerPath + 1);
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
  MaximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = false;
  let isPersonal = false;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, MaximumFilesPerPath + 1);
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
  MaximumFilesPerPath
) {
  let result = new Object();
  result.list = new Array();
  let isText = false;
  let isPersonal = true;

  try {
    let getCount = 0;
    while (getCount < targetCount) {
      let targetCount = await util.random(1, MaximumFilesPerPath + 1);
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

async function sample() {}

// @param
// fileOpt = {
// garbageFiles:"",
// garbageImageFiles:"",
// personalFileFiles:"",
// personalImageFiles:"",
// MaximumFilesPerPath:"",
// }
//

async function createFile(directories, fileOpt) {
  try {
  } catch (e) {
    throw e;
  }

  return returnObj;
}

export default {
  getGarbageFileList,
  getPersonalFileList,
  getGarbageImageList,
  getPersonalImageList,
  createFile,
};
