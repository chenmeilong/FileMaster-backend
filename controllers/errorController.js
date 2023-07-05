/**
 * @author MilesChen
 * @description 全局错误处理中间件，区分生成环境和开发环境的错误处理
 * @createDate 2023-01-18 19:27:34
 */

const AppError = require("../utils/appError");
// 读取环境变量是否有NODE_ENV
const environment = process.env.NODE_ENV || "development";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

// 开发环境返回ERROR信息
const sendErrorDev = (err, req, res) => {
  console.error("ERROR 💥", err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// 生产环境返回ERROR信息
const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.error("ERROR 💥", err);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

module.exports = (err, req, res) => {
  if (environment === "development") {
    sendErrorDev(err, req, res);
  } else if (environment === "production") {
    let error = { ...err };
    // 类型转换错误
    if (error.name === "CastError") error = handleCastErrorDB(error);
    // 验证错误
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    // Token错误
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    // Token过期
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
