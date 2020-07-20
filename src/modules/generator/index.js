import dir from "./generate-directory";
import _ from "lodash";
import nodeSsh from "node-ssh";
import path from "path";
import cliProgress from "cli-progress";

async function make(config = {}, dirOpt = {}, fileOpt = {}) {
  let session = new nodeSsh();
  const makeDirectoryBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.legacy
  );

  try {
    await session.connect(config).catch((err) => {
      if (err) {
        console.log(config);
        throw new Error(`remote connect failed: ${err.message}`);
      }
    });

    let directories = await dir.getDirList(
      dirOpt.base,
      dirOpt.count,
      dirOpt.maximumDepth
    );

    makeDirectoryBar.start(directories.length);

    let command = "";
    let fetchRows = 500;

    for (let i = 0; i < directories.length; i++) {
      if (i % fetchRows === 0 && i !== 0) {
        await session.execCommand(command).then((res) => {
          if (res.stderr) console.log(res);
        });

        makeDirectoryBar.update(i);
        command = "";
      }
      command += `mkdir -p "${directories[i]}"\n`;
    }

    makeDirectoryBar.update(directories.length);
    await session.execCommand(command).then((res) => {
      if (res.stderr) console.log(res);
    });

    makeDirectoryBar.stop();
  } catch (e) {
    console.log(e.message);
  }

  session.dispose();
}

export default {
  make,
};
