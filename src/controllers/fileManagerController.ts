/**
 * @author MilesChen
 * @description 文件管理器API处理
 * @createDate 2023-01-10 14:44:43
 */

import unzipper from 'unzipper'
import archiver from 'archiver'
import nodePath from 'path'
const coreFolder = nodePath.resolve(__dirname + '/../../')
import dirTree from '../utils/directory-tree'
import { Request, Response, NextFunction } from 'express'
import {
  escapePath,
  checkExtension,
  checkVariables
} from '../utils/filemanager'
import fs from 'graceful-fs'
import AppError from '../utils/appError'
import fsExtra from 'fs-extra'

const fileManagerController = {
  // 获取文件夹树
  async folderTree(req: Request, res: Response) {
    const { path } = req.body
    const paths = dirTree(coreFolder + escapePath(path), {
      normalizePath: true,
      removePath: coreFolder,
      withChildren: true
    })
    res.status(200).send(paths)
  },
  // 指定路径下的文件和文件夹list
  async folderInfo(req: Request, res: Response) {
    const { path } = req.body
    const paths = dirTree(coreFolder + escapePath(path), {
      normalizePath: true,
      removePath: coreFolder,
      includeFiles: true
    })
    res.status(200).send(paths)
  },
  // 指定路径下的文件夹和文件和文件树 指定路径下 所有的文件内容 可读取总文件夹的大小，其他则不行
  async all(req: Request, res: Response) {
    const { path } = req.body
    const paths = dirTree(coreFolder + escapePath(path), {
      normalizePath: true,
      removePath: coreFolder,
      includeFiles: true,
      withChildren: true
    })
    res.status(200).send(paths)
  },
  // 文件或文件夹重命名
  async rename(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line prefer-const
    let { path, newname } = req.body
    path = escapePath(path)
    // 根据newname扩展名判断是否为允许修改
    if (!checkExtension(nodePath.extname(newname))) {
      return next(new AppError(`File format error ${newname}`, 400))
    }
    // 检查 path是否为空和undefined newname 是否为法的文件夹名
    if (!checkVariables([path, newname])) {
      return next(new AppError("variate undefined  or ''", 400))
    }
    const editPath = path.split('/')
    editPath.pop()
    editPath.push(newname)
    const renamePath = editPath.join('/')
    fs.rename(
      `${coreFolder}/${path}`,
      `${coreFolder}/${renamePath}`,
      function (err) {
        if (err) {
          return next(new AppError(err.toString(), 400))
        } else {
          res.status(200).json({
            status: 'success',
            message: 'success rename'
          })
        }
      }
    )
  },
  // 创建文件
  async createfile(req: Request, res: Response, next: NextFunction) {
    let { path, file } = req.body
    path = escapePath(path)
    file = escapePath(file)

    if (!checkExtension(nodePath.extname(file))) {
      return next(new AppError(`File format error ${file}`, 400))
    }
    if (!checkVariables([path, file])) {
      return next(new AppError("variate undefined  or ''", 400))
    }
    fs.open(`${coreFolder}${path}/${file}`, 'wx', function (err, fd) {
      if (err) {
        return next(new AppError('File creation error', 400))
      }
      fs.close(fd, function (err) {
        // 关闭文件时发生错误，可能会导致文件句柄无法释放，从而导致资源泄漏或其他问题故做此处理
        if (err) {
          return next(
            new AppError('An error occurred while closing the file', 400)
          )
        } else {
          res.status(200).json({
            status: 'success',
            message: 'success createfile'
          })
        }
      })
    })
  },
  // 创建文件夹
  async createfolder(req: Request, res: Response, next: NextFunction) {
    let { path, folder, mask } = req.body
    path = escapePath(path)
    folder = escapePath(folder)
    // 0o777 文件夹具有所有者、组和其他用户都具有读取、写入和执行的权限
    mask = typeof mask === 'undefined' ? 0o777 : mask
    fs.mkdir(`${coreFolder}${path}/${folder}`, mask, function (err) {
      if (err) {
        if (err.code == 'EEXIST') {
          return next(new AppError('Folder already exists', 400))
        }
        return next(new AppError('unknown error', 400))
      } else {
        res.status(200).json({
          status: 'success',
          message: 'success createfolder'
        })
      }
    })
  },
  // 删除数组内的所有文件
  async delete(req: Request, res: Response, next: NextFunction) {
    const { items } = req.body
    if (!checkVariables([items])) {
      return next(new AppError("variate undefined  or ''", 400))
    }
    const pendingRequests: Promise<void>[] = []
    const errorDeleted: { item: string; err: Error }[] = []
    items.forEach(function (item: string) {
      item = escapePath(item)
      pendingRequests.push(
        new Promise<void>((resolve, reject) => {
          fsExtra.remove(`${coreFolder}${item}`, (err) => {
            if (err) {
              errorDeleted.push({ item, err })
              reject(err)
            } else {
              resolve()
            }
          })
        })
      )
    })
    try {
      await Promise.all(pendingRequests)
      res.status(200).json({
        status: 'success',
        message: 'success delete select'
      })
    } catch (error) {
      return next(new AppError(errorDeleted[0].err.toString(), 400))
    }
  },
  // 清空文件夹
  async emptydir(req: Request, res: Response, next: NextFunction) {
    let { path } = req.body
    path = escapePath(path)
    fsExtra.emptyDir(`${coreFolder}${path}`, (err) => {
      if (err) return next(new AppError(err.toString(), 400))
      res.status(200).json({
        status: 'success',
        message: 'success emptydir'
      })
    })
  },
  // 快速复制 新命名增加时间戳区别
  async duplicate(req: Request, res: Response, next: NextFunction) {
    let { path } = req.body
    path = escapePath(path)
    if (!checkVariables([path])) {
      return next(new AppError("variate undefined  or ''", 400))
    }
    // 从root开始计算的路径+name
    let nameNew = path.split('.')
    const timestamp = new Date().getTime()
    nameNew =
      nameNew.length > 1
        ? `${nameNew[0]}_${timestamp}.${nameNew[1]}`
        : `${nameNew[0]}_${timestamp}`

    fsExtra.copy(`${coreFolder}${path}`, `${coreFolder}${nameNew}`, (err) => {
      if (err) {
        return next(new AppError(err.toString(), 400))
      }
      res.status(200).json({
        status: 'success',
        message: 'success duplicate'
      })
    })
  },
  // 复制到指定路径
  async copy(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line prefer-const
    let { items, destination } = req.body
    destination = escapePath(destination)
    if (!checkVariables([items, destination])) {
      return next(new AppError("variate undefined  or ''", 400))
    }

    const pendingRequests: Promise<void>[] = []
    const errorCopy: { item: string; err: Error }[] = []
    items.forEach(function (item: string) {
      // 原文件路径
      const newItem = escapePath(item)
      const newdestination =
        `${coreFolder}${destination}/` + item.split('/').pop()
      pendingRequests.push(
        new Promise<void>((resolve, reject) => {
          fsExtra.copy(`${coreFolder}${newItem}`, newdestination, (err) => {
            if (err) {
              errorCopy.push({ item: newItem, err })
              reject(err)
            } else {
              resolve()
            }
          })
        })
      )
    })
    try {
      await Promise.all(pendingRequests)
      res.status(200).json({
        status: 'success',
        message: 'copy success'
      })
    } catch (error) {
      return next(new AppError(errorCopy[0].err.toString(), 400))
    }
  },
  // 移动
  async move(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line prefer-const
    let { items, destination } = req.body
    destination = escapePath(destination)
    if (!checkVariables([items, destination])) {
      return next(new AppError("variate undefined  or ''", 400))
    }
    const pendingRequests: Promise<void>[] = []
    try {
      items.forEach(function (item: string) {
        const newItem = escapePath(item)
        const newdestination =
          `${coreFolder}${destination}/` + item.split('/').pop()
        pendingRequests.push(
          fsExtra.move(`${coreFolder}${newItem}`, newdestination, {
            overwrite: true
          })
        )
      })
      Promise.all(pendingRequests).then(() => {
        res.status(200).json({
          status: 'success',
          message: 'move success'
        })
      })
    } catch (error) {
      return next(new AppError('unknown error', 400))
    }
  },
  // 解压缩
  async unzip(req: Request, res: Response, next: NextFunction) {
    let { file, destination } = req.body
    if (!checkVariables([file, destination])) {
      return next(new AppError("variate undefined  or ''", 400))
    }
    file = escapePath(file)
    // 没给destination路径就解压到当前路径下的同名文件中
    destination =
      destination === '' || destination === undefined
        ? file.split('.').shift()
        : escapePath(destination)
    try {
      // 用于创建一个可读流对象
      // .pipe()是可读流的一个方法，用于将可读流的输出连接到另一个流。
      // unzipper.Parse()是一个用于解压缩zip文件的方法，它接受一个可选的配置对象作为参数。
      // { forceStream: true }作为配置对象，以确保unzipper.Parse()方法返回一个流对象，而不是一个解压缩后的文件对象。
      const zip = fs
        .createReadStream(`${coreFolder}${file}`)
        .pipe(unzipper.Parse({ forceStream: true }))
      for await (const entry of zip) {
        // 判断后缀决定是否写入文件
        if (checkExtension(nodePath.extname(entry.path))) {
          entry.pipe(
            fs.createWriteStream(`${coreFolder}${destination}/${entry.path}`)
          )
        } else {
          // 自动排除这个文件
          entry.autodrain()
        }
      }
      res.status(200).json({
        status: 'success',
        message: 'unzip success'
      })
    } catch (error) {
      return next(new AppError('unknown error', 400))
    }
  },
  // 添加到压缩文件
  async archive(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line prefer-const
    let { files, destination, name } = req.body
    destination = escapePath(destination)
    name = escapePath(name)
    try {
      const output = fs.createWriteStream(
        `${coreFolder}${destination}/${name}.zip`
      )
      // 设置压缩级别9最高级别，最好的压缩算法
      const archive = archiver('zip', {
        zlib: { level: 9 }
      })
      // 将archive对象与一个输出流(output)进行关联
      archive.pipe(output)
      // 添加一个错误处理函数。当压缩过程中出现错误时，会触发archive对象的error事件，并执行错误处理函数。
      archive.on('error', function (err) {
        return next(new AppError(err.message, 400))
      })

      await files.forEach(function (item: string) {
        const newItem = `${coreFolder}${escapePath(item)}`
        // 文件或目录的名称
        const name = `${newItem.split('/').pop()}`
        // 获取文件状态，判断是否为目录
        if (fs.lstatSync(newItem).isDirectory()) {
          // 目录添加到压缩文件中
          archive.directory(newItem, name)
        } else {
          // 将该文件添加到压缩文件中
          archive.file(newItem, { name })
        }
      })

      output.on('close', function () {
        res.status(200).json({
          status: 'success',
          message: 'Archive success'
        })
      })
      archive.finalize()
    } catch (error) {
      return next(new AppError('unknown error', 400))
    }
  },
  // 保存图片，解析base64
  async saveImage(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line prefer-const
    let { path, file, isnew } = req.body
    path = escapePath(path)
    file = file.split(';base64,').pop()
    if (!checkExtension(nodePath.extname(path))) {
      return next(new AppError(`File format error ${path}`, 400))
    }
    if (!checkVariables([path, file])) {
      return next(new AppError("variate undefined  or ''", 400))
    }
    // 另存为，以时间戳区分
    if (isnew) {
      const nameNew = path.split('.')
      const timestamp = new Date().getTime()
      path = `${nameNew[0]}_${timestamp}.${nameNew[1]}`
    }
    fs.writeFile(
      `${coreFolder}${path}`,
      file,
      { encoding: 'base64' },
      function (err) {
        if (err) {
          return next(new AppError('Error while creating file', 400))
        }
        res.status(200).json({
          status: 'success',
          message: 'saveImage success'
        })
      }
    )
  },
  // 上传文件,已经multer中间件处理了，这里只做看文件转移
  async uploadFiles(req: Request, res: Response, next: NextFunction) {
    let { path } = req.body
    path = escapePath(path)
    try {
      if (req.files === undefined || !Array.isArray(req.files)) {
        return next(new AppError('fail decode error', 400))
      }
      // 多个文件处理
      req.files.forEach(function (element: Express.Multer.File) {
        // 解决中文文件名乱码问题
        const name = Buffer.from(element.originalname, 'latin1').toString(
          'utf8'
        )
        if (checkExtension(nodePath.extname(name))) {
          fs.readFile(element.path, function (_err, data) {
            fs.writeFile(`${coreFolder}${path}/${name}`, data, function (err) {
              if (err) {
                return next(new AppError(err.message, 400))
              }
            })
          })
        }
      })
    } catch (error) {
      return next(new AppError('unknown error', 400))
    }
    res.status(200).json({
      status: 'success',
      message: 'success uploadFiles'
    })
  }
}

export default fileManagerController
