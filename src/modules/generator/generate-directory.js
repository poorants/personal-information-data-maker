import fs from "fs";
import path from "path";
import util from "./generate-util";
import nodeSsh from "node-ssh";

let dirnames = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "dirnames.json"))
);
let dirnameCount = dirnames.data.length;

async function getDirName() {
  try {
    return dirnames.data[util.random(0, dirnameCount - 1)];
  } catch (e) {
    console.log(e);
  }
}

// export 대상 모듈들
async function getDirectories(dirOpt) {
  let directoryList = new Array();
  let endPointNodes = new Array();

  directoryList.push(path.posix.join(dirOpt.base, "."));

  let count = 1;
  let bar = util.getBar("generate directory");
  bar.start(dirOpt.count, 0);
  while (count < dirOpt.count) {
    let targetIdx = util.random(0, directoryList.length);

    let newDirectory = await getDirName();
    let newRecord = path.posix.join(directoryList[targetIdx], newDirectory);
    let depth = (newRecord.match(/\//g) || []).length;

    // maximunDepth보다 더 깊은 구조의 디렉토리가 발생했을 때 endPointNodes 배열에 별개로 저장.
    if (dirOpt.maximunDepth !== 0 && depth >= dirOpt.maximunDepth) {
      if (endPointNodes.includes(newRecord)) continue;
      // 기존과 동일한 디렉토리 구조일 때 skip
      else endPointNodes.push(newRecord);
    } else {
      if (directoryList.includes(newRecord)) continue;
      // 기존과 동일한 디렉토리 구조일 때 skip
      else directoryList.push(newRecord);
    }

    count++;
    bar.update(count);
  }

  for (let i = 0; i < endPointNodes.length; i++) {
    directoryList.push(endPointNodes[i]);
  }

  bar.stop();
  return directoryList;
}

async function createDirectories(config, directoryList) {
  let session = new nodeSsh();
  try {
    await session.connect(config);

    let bar = util.getBar("create directory");

    let command = "";
    let fetchRows = 500;
    bar.start(directoryList.length);
    for (let i = 0; i < directoryList.length; i++) {
      if (i % fetchRows === 0 && i !== 0) {
        await session.execCommand(command).then((res) => {
          if (res.stderr) console.log(res);
        });

        bar.update(i);
        command = "";
      }
      command += `mkdir -p "${directoryList[i]}"\n`;
    }

    await session.execCommand(command).then((res) => {
      if (res.stderr) console.log(res);
    });

    bar.update(directoryList.length);
    bar.stop();
    session.dispose();
  } catch (e) {
    session.dispose();
    // throw e;
  }
}

export default {
  getDirectories,
  createDirectories,
};
