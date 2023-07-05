/**
 * @author MilesChen
 * @description server.js
 * @createDate 2023-01-10 14:05:23
 */

const express = require("express");
const cors = require("cors");
// express中间件模块，自动清理http中的不安全字符，防止xss攻击
const xss = require("xss-clean");
// express中间件模块，用于限制客户端在一定时间内的请求数量。通过限制请求数量，你可以降低潜在的暴力攻击、爬虫和滥用等行为对服务器性能和资源的影响。
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");

const app = express();
const port = 3131;
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const fileManager = require("./routes/fileManager");

app.use(cors());
// 解析json格式 '解析这个请求数据
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(xss());
// 设置信任代理的选项
// app.set('trust proxy', 1);

// 一分钟限制请求1000次
const limiter = rateLimit({
  max: 1000,
  windowMs: 1 * 60 * 1000,
  message: new AppError(`请求频繁,一分钟后再尝试`, 429),
});

app.use("*", limiter);
// 路由
app.use("/fm", fileManager);
// 提供静态资源下载
app.use("/uploads", express.static("./uploads"));

// 没找到对应的API
app.use((req, res, next) => {
  next(new AppError(`服务器未找到API ${req.originalUrl}`, 404));
});
// 全局错误处理
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
