import generator from "./modules/generator";
import path from "path";
import fs from "fs";

async function main() {
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

  let fileOpt = {};

  console.time();
  await generator.make(config, dirOpt, fileOpt);
  console.timeEnd();

  // for(let i = 0; i < 10 ; i ++ ){
  //     console.log(directoryies[i])
  // }
}

main();
