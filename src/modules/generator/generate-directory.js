import fs from "fs";
import path from "path";
import util from "./generate-util";
import cliProgress from "cli-progress";

let dirnames = JSON.parse(
  fs.readFileSync(path.join(__dirname, "dirnames.json"))
);
let dirnameCount = dirnames.data.length;

async function getDirList(base = "./", targetCount = 1, maximunDepth = 10) {
  let directories = new Array();
  let endPointNodes = new Array();

  console.log(`base path : ${path.posix.join(base, ".")}`);
  directories.push(path.posix.join(base, "."));

  //   bar.start(targetCount - 1, 0);

  let count = 1; //root directory
  while (count < targetCount) {
    let targetIdx = util.random(0, directories.length);
    let newDirectory = await getDirName();
    let newRecord = path.posix.join(directories[targetIdx], newDirectory);
    if (newRecord.includes("Redirect (Retail)")) {
      console.log(newRecord);
      console.log(directories[targetIdx]);
      console.log(newDirectory);
    }
    let depth = (newRecord.match(/\//g) || []).length;
    if (maximunDepth !== 0 && depth >= maximunDepth) {
      if (endPointNodes.includes(newRecord)) continue;
      else endPointNodes.push(newRecord);
    } else {
      if (directories.includes(newRecord)) continue;
      else directories.push(newRecord);
    }
    count++;
  }

  for (let i = 0; i < endPointNodes.length; i++) {
    directories.push(endPointNodes[i]);
  }

  return directories;
}

async function getDirName() {
  try {
    return dirnames.data[util.random(0, dirnameCount - 1)];
  } catch (e) {
    console.log(e);
  }
}

export default {
  getDirList,
};
