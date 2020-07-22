import Generator from "./modules/generator";
import path from "path";
import fs from "fs";

async function main() {
  let generator = new Generator();
  let maxDirectories = 100;
  let maximunDepth = 10;

  let config = {
    host: "192.168.10.243",
    username: "root",
    password: "sinsiway",
  };

  let dirOpt = {
    base: "/workspace",
    count: 10000,
    maximumDepth: 10,
  };

  let fileOpt = {
    garbageFiles: 10,
    garbageImageFiles: 10,
    personalFileFiles: 10,
    personalImageFiles: 10,
    MaximumFilesPerPath: 20,
  };

  generator.testEnvironmentSettings(config, dirOpt, fileOpt);
}

main();
