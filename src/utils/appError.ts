/**
 * @author MilesChen
 * @description  自定义的错误类
 * @createDate 2023-01-18 13:45:56
 */

class AppError extends Error {
  statusCode: number
  messagetext: string
  status: string
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.messagetext = message
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true
    // 捕获错误堆栈跟踪
    Error.captureStackTrace(this, this.constructor)
  }
}
export default AppError
