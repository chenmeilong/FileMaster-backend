/**
 * @author MilesChen
 * @description  文件树读取
 * @createDate 2023-01-19 18:46:56
 */

'use strict';

// 它是 fs 模块的 pro版本 更可靠，更强且支持文件流
const FS = require('graceful-fs');
const PATH = require('path');
const constants = {
	DIRECTORY: 'folder',
	FILE: 'file'
}

// 安全读取目录，出现无权读取的目录使用异常处理,提高系统的健壮性
// dirData string[]
function safeReadDirSync (path) {
	let dirData = {};
	try {
		// 读取当前目录下的所有文件名
		dirData = FS.readdirSync(path);
	} catch(ex) {
		// 错误码 EACCES:访问权限被拒绝,EPERM:操作被拒绝
		if (ex.code == "EACCES" || ex.code == "EPERM") {
			return null;
		}
		else throw ex;
	}
	return dirData;
}

/**
 * 将Windows风格的路径标准化，将双反斜杠替换为单斜杠（Unix风格）
 * @param  {string} path
 * @return {string}
 */
function normalizePath(path) {
	return path.replace(/\\/g, '/');
}

/**
 * 判断是否支持正则
 * @param  {any}  regExp
 * @return {Boolean}
 */
function isRegExp(regExp) {
	return typeof regExp === "object" && regExp.constructor == RegExp;
}
// 文件权限计算
function permissionsConvert(mode){
	return {
		'others': (mode & 1 ? 'x-' : '') + (mode & 2 ? 'w-' : '')+  (mode & 4 ? 'r' : ''),
		'group':  (mode & 10 ? 'x-' : '') + (mode & 20 ? 'w-' : '') +  (mode & 40 ? 'r' : ''),
		'owner':  (mode & 100 ? 'x-' : '') + (mode & 200 ? 'w-' : '') +  (mode & 400 ? 'r' : ''),
	}
}


// 递归 构建文件树
// options.normalizePath boolean 标准化路径
// options.removePath string需要移除的前缀路径
// options.exclude  string[] | RegExp 判断是否需要排除当前文件
// options.extensions 需要排除的文件后缀 只支持正则
// options.attributes string[] 获取自定义属性 必须是stats上有的，否则会报错
// options.includeFiles boolean 是否读取文件
// options.withChildren 是否读取子目录
// onEachFile 自定义回调 这里目前没用上
// depth  boolean 是否往深度读取 false默认为是，false表否 
function directoryTree (path, options, onEachFile, onEachDirectory, depth) {
	const name = PATH.basename(path);
	const item = { path, name };
	let stats;
	try { stats = FS.statSync(path); }
	catch (e) { return null; }


	// 根据options.exclude string[] | RegExp 判断是否需要排除当前文件
	if (options && options.exclude) {
		const excludes =  isRegExp(options.exclude) ? [options.exclude] : options.exclude;
		if (excludes.some((exclusion) => exclusion.test(path))) {
			return null;
		}
	}
	item.created = stats.birthtime;
	item.modified = stats.mtime;
	item.type = constants.DIRECTORY;
	item.id = `${item.type}_${stats.ino}`;
	item.premissions = permissionsConvert(stats.mode);
	// 文件操作
	if (stats.isFile() && options.includeFiles) {
		// 获取文件后缀名
		const ext = PATH.extname(path).toLowerCase();
		// 根据后缀 判断是否需要排除当前文件
		if (options && options.extensions && !options.extensions.test(ext))
			return null;
		//文件大小 单位为 bytes
		item.size = stats.size;
		item.extension = ext;
		item.type = constants.FILE;
		
		if (options && options.attributes) {
			options.attributes.forEach((attribute) => {
				item[attribute] = stats[attribute];
			});
		}
		if (onEachFile) {
			onEachFile(item, PATH, stats);
		}
	}
	// 文件夹操作
	else if (stats.isDirectory()) {
		let dirData = safeReadDirSync(path);
		// 解决权限问题
		if (dirData === null) return null;
		// 读取自定义属性
		if (options && options.attributes) {
			options.attributes.forEach((attribute) => {
				item[attribute] = stats[attribute];
			});
		}
		if(!options.withChildren){
			if(!depth){
				item.children = dirData.map(child => directoryTree(PATH.join(path, child), options, onEachFile, onEachDirectory, true)).filter(e => !!e);
				item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
				if (onEachDirectory) {
					onEachDirectory(item, PATH, stats);
				}
			}
		}else {
			item.children = dirData.map(child => directoryTree(PATH.join(path, child), options, onEachFile, onEachDirectory, false)).filter(e => !!e);
			// 读取all 的时会计算全部大小
			item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
			if (onEachDirectory) {
				onEachDirectory(item, PATH, stats);
			}
		}
	} 
	else {
		return null;
	}
	// 标准化路径 或 将绝对路径改成相对路径 这里三目从左到右依次执行
	item.path = options && options.normalizePath ? 
					(options.removePath) ? normalizePath(item.path).replace(normalizePath(options.removePath),'') :  normalizePath(item.path)
					: (options.removePath) ? item.path.replace(options.removePath,'') :  item.path;
	return item;
}

module.exports = directoryTree;