"use strict";

import NodeSsh from "node-ssh";
import _ from "lodash";
import path from "path";
import md5file from "md5-file/promise";

export default class RemoteSsh {
  constructor() {
    this.session = new NodeSsh();
    this.config;

    this._maxRetryCount = 3;

    this.ERR_CODE = {
      NO_PERMISSION: 0,
      FILE_EXISTS: -100,
      DIR_EXISTS: -101,
      UNKNOWN_REASON: -9999,
    };
  }

  resetConnectionInfomation(config) {
    this.config = {
      host: config.host,
      username: config.username,
      password: config.password,
      port: config.port === undefined ? 22 : config.port,
    };
  }

  connect(config) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.isConnection() && _.isEqual(this.config, config)) {
          resolve(true);
          return;
        }

        this.config = config;

        await this.session.connect({
          host: config.host,
          username: config.username,
          password: config.password,
          port: config.port === undefined ? 22 : config.port,
          algorithms: {
            kex: [
              "diffie-hellman-group1-sha1",
              "ecdh-sha2-nistp256",
              "ecdh-sha2-nistp384",
              "ecdh-sha2-nistp521",
              "diffie-hellman-group-exchange-sha256",
              "diffie-hellman-group14-sha1",
            ],
            cipher: [
              "3des-cbc",
              "aes128-ctr",
              "aes192-ctr",
              "aes256-ctr",
              "aes128-gcm",
              "aes128-gcm@openssh.com",
              "aes256-gcm",
              "aes256-gcm@openssh.com",
            ],
            serverHostKey: [
              "ssh-rsa",
              "ecdsa-sha2-nistp256",
              "ecdsa-sha2-nistp384",
              "ecdsa-sha2-nistp521",
            ],
            hmac: ["hmac-sha2-256", "hmac-sha2-512", "hmac-sha1"],
          },
        });

        this.session.connection.on("error", (err) => {
          console.log(`ssh client 연결이 종료되었습니다.\n ${err}`);
        });

        resolve(true);
      } catch (e) {
        console.log(`connect Error : \n${e}`);
        reject(e);
      }
    });
  }

  putDirectory(localDirectory, remoteDirectory, limit = 10) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);
        let complete;
        let tryCount = 0;
        do {
          tryCount++;
          if (tryCount >= limit) break;
          complete = await this.session
            .putDirectory(localDirectory, remoteDirectory)
            .then((res) => {
              return res;
            });
        } while (!complete);
        resolve();
      } catch (e) {
        console.log(`putDirectory Error : \n${e}`);
        reject(e);
      }
    });
  }

  execCommand(command, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);
        const result = await this.session
          .execCommand(command, options)
          .then((res) => {
            return res;
          });
        resolve(result);
      } catch (e) {
        console.log(`execCommand Error : \n${e}`);
        reject(e);
      }
    });
  }

  execCommandStrict(command, option) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);
        const result = await this.session
          .execCommand(command, option)
          .then((res) => {
            return res;
          });
        if (_.isString(result.stderr))
          if (result.stderr)
            throw new Error(
              `command fail [ ${command} ], stderr [ ${result.stderr} ]`
            );
        resolve(result);
      } catch (e) {
        console.log(`execCommandStrict Error : \n${e}`);
        reject(e);
      }
    });
  }

  isSame(localFile, remoteFile) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);
        const localFileMd5 = await md5file(localFile).catch(() => {});

        const remoteFileMd5 = await this.session
          .execCommand(`openssl dgst ${remoteFile} | awk '{print $2}'`)
          .then((res) => {
            return res.stdout;
          })
          .catch(() => {});
        if (
          !_.isUndefined(localFileMd5) &&
          !_.isNull(remoteFileMd5) &&
          localFileMd5 === remoteFileMd5
        )
          resolve(true);
        else resolve(false);
      } catch (e) {
        console.log(`isSame Error : \n${e}`);
        reject(e);
      }
    });
  }

  async localMd5file(localFile) {
    try {
      const md5 = await md5file(localFile).catch((err) => {
        // console.log(`err : ${err}`);
        return null;
      });
      return md5;
    } catch (e) {
      throw e;
    }
  }

  async remoteMd5file(remoteFile) {
    try {
      await this.connect(this.config);

      const md5 = await this.session
        .execCommand(`openssl dgst ${remoteFile} | awk '{print $2}'`)
        .then(async (res) => {
          if (res.stderr.match("not found"))
            return await this.session
              .execCommand(`digest -a md5 ${remoteFile}`)
              .then((res) => {
                return res.stdout;
              });
          else return res.stdout;
        })
        .catch(() => {
          return false;
        });
      return md5;
    } catch (e) {
      console.log(`remoteMd5file Error : \n${e}`);
      throw e;
    }
  }

  putFile(localFile, remoteFile, type = null, posix = true) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        let hasRemoteFile = false;
        let localFileMd5 = await this.localMd5file(localFile);
        let remoteFileMd5 = await this.remoteMd5file(remoteFile);

        if (localFileMd5 && remoteFileMd5 && localFileMd5 === remoteFileMd5)
          hasRemoteFile = true;

        if (hasRemoteFile)
          console.log(
            `이미 "${path.basename(remoteFile)}" 파일이 원격지에 있습니다.`
          );

        if (!hasRemoteFile) {
          let tryCount = 0;
          while (tryCount <= this._maxRetryCount) {
            tryCount++;
            const result = await this.session
              .putFile(localFile, remoteFile)
              .catch((err) => {
                return err;
              });

            if (_.isUndefined(result) || result.constructor.name !== "Error")
              break;
            else if (tryCount === this._maxRetryCount) throw result;
          }
        }

        if (type === "text" && posix) {
          const tmpRemoteFile = remoteFile + ".tmp";
          await this.execCommand(
            `tr -d '\\015' < ${remoteFile} > ${tmpRemoteFile}`
          );
          await this.execCommand(`mv ${tmpRemoteFile} ${remoteFile}`);
        }

        if (!remoteFileMd5)
          remoteFileMd5 = await this.remoteMd5file(remoteFile);

        resolve({ localMd5: localFileMd5, remoteMd5: remoteFileMd5 });
      } catch (e) {
        // console.log(`putFile Error : \n${e}`);
        reject(new Error(`"${localFile}" to "${remoteFile}" failed \n${e}`));
      }
    });
  }

  putFiles(files, givenSftp, givenOpts, force = false) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        for (let idx in files)
          await this.putFile(files[idx].localFile, files[idx].remoteFile);
        resolve(true);
      } catch (e) {
        // console.log(`putFiles Error : \n${e}`);
        reject(e);
      }
    });
  }

  getFile(localFile, remoteFile, givenSftp, givenOpts) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        let hasLocalFile = false;
        let localFileMd5 = await this.localMd5file(localFile);
        let remoteFileMd5 = await this.remoteMd5file(remoteFile);

        if (localFileMd5 && remoteFileMd5 && localFileMd5 === remoteFileMd5)
          hasLocalFile = true;

        if (hasLocalFile)
          console.log(
            `이미 "${path.basename(localFile)}" 파일을 가지고 있습니다.`
          );

        // console.log(`localFileMd5 : ${localFileMd5}`);
        // console.log(`remoteFileMd5 : ${remoteFileMd5}`);
        if (!hasLocalFile) {
          let tryCount = 0;
          while (tryCount <= this._maxRetryCount) {
            tryCount++;
            const result = await this.session
              .getFile(localFile, remoteFile, givenSftp, givenOpts)
              .then(() => {
                console.log(
                  `get file local[${path.basename(
                    localFile
                  )}] from remote[${path.basename(remoteFile)}]`
                );
              })
              .catch((err) => {
                return err;
              });

            // console.log(result);
            if (result && result.constructor.name !== "Error") break;
            else if (tryCount === this._maxRetryCount) throw result;
          }
        }

        if (!localFileMd5) localFileMd5 = await this.localMd5file(localFile);

        resolve({ localMd5: localFileMd5, remoteMd5: remoteFileMd5 });
      } catch (e) {
        // console.log(`getFile() failed. "${localFile}" from "${remoteFile}".\n${e}`);
        reject(e);
      }
    });
  }

  isConnection() {
    if (!_.isObject(this.session.connection)) return false;
    return !this.session.connection._sshstream._readableState.ended;
  }

  isDirectory(remotePath) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        const res = await this.session.execCommand(
          `if [ -d "${remotePath}" ];then echo yes; fi`
        );
        if (_.isEmpty(res.stdout)) resolve(false);
        else resolve(true);
      } catch (e) {
        // console.log(`isDirectory Error : \n${e}`);
        reject(e);
      }
    });
  }

  isFile(remotePath) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        const res = await this.session.execCommand(
          `if [ -f "${remotePath}" ];then echo yes; fi`
        );
        if (_.isEmpty(res.stdout)) resolve(false);
        else resolve(true);
      } catch (e) {
        // console.log(`isFile Error : \n${e}`);
        reject(e);
      }
    });
  }

  isUsableDirectory(remotePath) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        if (await this.isFile(remotePath)) {
          reject(`"${remotePath}" 를 다른 파일이 사용중입니다.`);
          resolve(false);
          return;
        }

        if (await this.isDirectory(remotePath)) {
          const checkFile = path.posix.join(remotePath, "permission.check");
          const res = await this.execCommand(`touch ${checkFile}`);
          if (_.isEmpty(res.stderr)) {
            await this.execCommand(`rm -rf ${checkFile}`);
            resolve(true);
          } else {
            reject(`"${remotePath}" 를 다른 사용자가 이미 사용중입니다.`);
            resolve(false);
          }
        } else {
          const res = await this.execCommand(`mkdir -p ${remotePath}`);
          if (_.isEmpty(res.stderr)) {
            await this.execCommand(`rm -rf ${remotePath}`);
            resolve(true);
          } else {
            reject(`"${remotePath}" 는 권한이 없는 경로입니다.`);
            resolve(false);
          }
        }
      } catch (e) {
        // console.log(`isUsableDirectory Error : \n${e}`);
        reject(e);
      }
    });
  }

  writeBufferToFile(buffer, remoteFile, option = { recursive: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        if (option.recursive) {
          const remoteDirectory = path.dirname(remoteFile);
          await this.execCommand(
            `mkdir -p ${remoteDirectory};echo '${buffer}' | tr -d '\\015' > ${remoteFile}`
          );
        } else
          await this.execCommand(
            `echo '${buffer}' | tr -d '\\015' > ${remoteFile}`
          );
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  writeBufferToFileList(
    bufferList = [{ buffer: "", remoteFile: "" }],
    option = { recursive: false }
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.config);

        let command = new String();
        for (let idx in bufferList) {
          const buffer = bufferList[idx].buffer;
          const remoteFile = bufferList[idx].remoteFile;
          if (option.recursive) {
            const remoteDirectory = path.dirname(remoteFile);
            command += `mkdir -p ${remoteDirectory};echo '${buffer}' | tr -d '\\015' > ${remoteFile}\n`;
          } else
            command += `echo '${buffer}' | tr -d '\\015' > ${remoteFile}\n`;
        }
        await this.execCommand(command);
        resolve(true);
      } catch (e) {
        // console.log(`writeBufferToFileList Error : \n${e}`);
        reject(e);
      }
    });
  }

  disconnect() {
    if (this.isConnection()) this.session.dispose();
  }
}
