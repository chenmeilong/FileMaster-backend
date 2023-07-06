/**
 * @author MilesChen
 * @description server.js
 * @createDate 2023-01-10 14:05:23
 */

import express from 'express'
import cors from 'cors'
// express中间件模块，自动清理http中的不安全字符，防止xss攻击
import helmet from 'helmet'

// express中间件模块，用于限制客户端在一定时间内的请求数量。通过限制请求数量，你可以降低潜在的暴力攻击、爬虫和滥用等行为对服务器性能和资源的影响。
import rateLimit from 'express-rate-limit'
import bodyParser from 'body-parser'
import nodePath from 'path'
const app = express()
const port = 3131
import AppError from './utils/appError'
import globalErrorHandler from './controllers/errorController'
import fileManager from './routes/fileManager'

app.use(cors())
// 解析json格式 '解析这个请求数据
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
app.use(helmet())

// 一分钟限制请求1000次
const limiter = rateLimit({
  max: 1000,
  windowMs: 1 * 60 * 1000,
  message: new AppError(`Frequent requests. Try again in one minute`, 429)
})

app.use('*', limiter)
// 路由
app.use('/fm', fileManager)
// 提供静态资源下载
const coreFolder = nodePath.resolve(__dirname, '..') // 上级目录的绝对路径
app.use('/uploads', express.static(nodePath.join(coreFolder, 'uploads')))

// 没找到对应的API
app.use((req, _res, next) => {
  next(new AppError(`Server not found API ${req.originalUrl}`, 404))
})
// 全局错误处理
app.use(globalErrorHandler)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
