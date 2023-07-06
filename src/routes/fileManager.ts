/**
 * @author MilesChen
 * @description  文件管理器全局路由分发
 * @createDate 2023-01-13 10:25:33
 */

import multer from 'multer'
import nodePath from 'path'
import express, { Router } from 'express'
import fileManagerController from '../controllers/fileManagerController'

const router: Router = express.Router()
const coreFolder = nodePath.resolve(__dirname + '/../../')
const TMP_PATH = `${coreFolder}/uploads/tmp`

// 对文件大小限制，防止出现服务器崩溃
const upload = multer({
  dest: `${TMP_PATH}/`,
  limits: {
    files: 15,
    fieldSize: 10 * 1024 * 1024
  }
})

router.post('/foldertree', fileManagerController.folderTree)
router.post('/folder', fileManagerController.folderInfo)
router.post('/all', fileManagerController.all)
router.post('/rename', fileManagerController.rename)
router.post('/createfile', fileManagerController.createfile)
router.post('/createfolder', fileManagerController.createfolder)
router.post('/delete', fileManagerController.delete)
router.post('/copy', fileManagerController.copy)
router.post('/move', fileManagerController.move)
router.post('/emptydir', fileManagerController.emptydir)
router.post('/unzip', fileManagerController.unzip)
router.post('/archive', fileManagerController.archive)
router.post('/duplicate', fileManagerController.duplicate)
router.post('/saveimage', fileManagerController.saveImage)
router.post('/upload', upload.any(), fileManagerController.uploadFiles)

export default router
