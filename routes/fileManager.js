
const express = require('express');
const multer = require('multer');
const nodePath = require('path');
const router = express.Router();
const {fileManagerController} =  require('../controllers');
const coreFolder = nodePath.resolve(__dirname + '/../');
const TMP_PATH = `${coreFolder}/uploads/tmp`;

// ??为什么在tmp中
const upload = multer({
    dest: `${TMP_PATH}/`,
    limits: {
        files: 15, // allow up to 15 files per request,
        fieldSize: 10 * 1024 * 1024 // 5 MB (max file size)
    }
});

router.post('/foldertree', fileManagerController.folderTree);
router.post('/folder', fileManagerController.folderInfo);
router.post('/all', fileManagerController.all);
router.post('/rename', fileManagerController.rename);
router.post('/createfile', fileManagerController.createfile);
router.post('/createfolder', fileManagerController.createfolder);
router.post('/delete', fileManagerController.delete);
router.post('/copy', fileManagerController.copy);
router.post('/move', fileManagerController.move);
router.post('/emptydir', fileManagerController.emptydir);
router.post('/unzip', fileManagerController.unzip);
router.post('/archive', fileManagerController.archive);
router.post('/duplicate', fileManagerController.duplicate);
router.post('/saveimage', fileManagerController.saveImage);
// 中间件处理文件上传
router.post('/upload', upload.any(), fileManagerController.uploadFiles);

module.exports = router;