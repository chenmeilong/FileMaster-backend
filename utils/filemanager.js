/**
 * @author MilesChen
 * @description  文件名检查
 * @createDate 2023-01-13 20:08:12
 */

// 提高系统安全性，不能让访问通同级目录和上级目录
function escapePath(path) {
  return typeof path !== "undefined" &&
    path !== "" &&
    !path.includes("..") &&
    !path.includes("./")
    ? path
    : "/uploads/";
}

// 检查扩展名是否允许修改,如果是''表示文件夹,则允许修改
function checkExtension(extension) {
  const allowedFiles = [
    ".jpg",
    ".png",
    ".gif",
    ".jpeg",
    ".svg",
    ".doc",
    ".txt",
    ".csv",
    ".docx",
    ".xls",
    ".xml",
    ".pdf",
    ".zip",
    ".ppt",
    ".mp4",
    ".ai",
    ".psd",
    ".mp3",
    ".avi",
  ];
  return extension !== ""
    ? allowedFiles.indexOf(extension) === -1
      ? false
      : true
    : true;
}
// 过滤''和undefined
function checkVariables(variables) {
  var result = true;
  variables.forEach((element) => {
    if (element === "" || element === undefined) {
      result = false;
    }
  });
  return result;
}

module.exports = {
  escapePath,
  checkExtension,
  checkVariables,
};
