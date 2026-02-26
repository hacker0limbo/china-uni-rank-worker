/**
 * 用于生成四大排名 csv 文件的脚本
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);

console.log("当前文件绝对路径:", __filename);
