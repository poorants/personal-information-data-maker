import Generator from "./modules/generator";
import path from "path";
import fs from "fs";

async function main() {
  let generator = new Generator();
  let maxDirectories = 100;
  let maximunDepth = 10;

  let config = {
    host: "192.168.10.179",
    username: "demo",
    password: "sinsiway",
  };

  let dirOpt = {
    base: "/home/demo/workspace",
    count: 10000,
    maximumDepth: 10,
  };

  let fileOpt = {
    garbageFiles: 5000,
    garbageImageFiles: 3000,
    personalFileFiles: 5000,
    personalImageFiles: 5000,
    maximumFilesPerPath: 500,
  };

  console.time("Test Environment Settings");
  await generator.testEnvironmentSettings(config, dirOpt, fileOpt);
  console.timeEnd("Test Environment Settings");
}

main();
