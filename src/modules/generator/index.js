import dir from "./generate-directory";
import file from "./generate-file";
import _, { set } from "lodash";
import fs from "fs";
import nodeSsh from "node-ssh";
import moment from "moment";

export default class Generator {
  constructor() {}

  async testEnvironmentSettings(config, dirOpt, fileOpt) {
    try {
      let directoryList = await dir.getDirectories(dirOpt);

      let garbageFileList = await file.getGarbageFileList(
        directoryList,
        fileOpt.garbageFiles,
        fileOpt.maximumFilesPerPath
      );

      let personalFileList = await file.getPersonalFileList(
        directoryList,
        fileOpt.personalFileFiles,
        fileOpt.maximumFilesPerPath
      );

      let garbageImageList = await file.getGarbageImageList(
        directoryList,
        fileOpt.garbageImageFiles,
        fileOpt.maximumFilesPerPath
      );

      let personalImageList = await file.getPersonalImageList(
        directoryList,
        fileOpt.personalImageFiles,
        fileOpt.maximumFilesPerPath
      );

      let reportBuffer = "data-type,file-type,path,count\n";
      reportBuffer += await this.getReportBuffer(garbageFileList, "GF");
      reportBuffer += await this.getReportBuffer(personalFileList, "PF");
      reportBuffer += await this.getReportBuffer(garbageImageList, "GI");
      reportBuffer += await this.getReportBuffer(personalImageList, "PI");
      let date = moment().format("YYYY-MM-DD_HH-mm-ss");

      fs.writeFileSync(
        `C:\\Users\\sinsiway-rnd\\Desktop\\report-${date}.csv`,
        reportBuffer
      );

      await dir.createDirectories(config, directoryList);
      await file.createFile(config, garbageFileList, false, false);
      await file.createFile(config, personalFileList, false, true);
      await file.createFile(config, garbageImageList, true, false);
      await file.createFile(config, personalImageList, true, true);
    } catch (e) {
      console.log(e.message);
    }
  }

  async getReportBuffer(data = Object, mark = String) {
    let buffer = new String();

    for (let i = 0; i < data.list.length; i++) {
      let list = data.list[i];
      buffer += `${mark},D,${list.dir},${list.fileCount}\n`;

      for (let j = 0; j < list.fileList.length; j++) {
        let fileList = list.fileList[j];
        buffer += `${mark},F,${fileList.dest},\n`;
      }
    }
    return buffer;
  }
}

// export default {
//   make,
// };
