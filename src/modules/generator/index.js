import dir from "./generate-directory";
import file from "./generate-file";
import _, { set } from "lodash";
import nodeSsh from "node-ssh";

export default class Generator {
  constructor() {}

  async testEnvironmentSettings(config, dirOpt, fileOpt) {
    try {
      let directoryList = await dir.getDirectories(dirOpt);
      //   await dir.createDirectories(config, directoryList);
      let garbageFileList = await file.getGarbageFileList(
        directoryList,
        fileOpt.garbageFiles,
        fileOpt.MaximumFilesPerPath
      );

      let personalFileList = await file.getPersonalFileList(
        directoryList,
        fileOpt.personalFileFiles,
        fileOpt.MaximumFilesPerPath
      );

      let garbageImageList = await file.getGarbageImageList(
        directoryList,
        fileOpt.garbageImageFiles,
        fileOpt.MaximumFilesPerPath
      );

      let personalImageList = await file.getPersonalImageList(
        directoryList,
        fileOpt.personalImageFiles,
        fileOpt.MaximumFilesPerPath
      );
      console.log(personalImageList);
    } catch (e) {
      console.log(e.message);
    }
  }
}

// export default {
//   make,
// };
