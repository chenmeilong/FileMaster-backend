<div align="center">
<img src="./img/logo.png" style="zoom:100%;" />
</div>
<div align="center">
<a href="./README_en.md" style="text-decoration: none;"><img src="https://img.shields.io/badge/English-orange"/>
<a href="./README.md" style="text-decoration: none;"><img src="https://img.shields.io/badge/简体中文-blue"/>
<a href="https://github.com/chenmeilong/FileMaster-frontend" style="text-decoration: none;"><img src="https://img.shields.io/badge/Front--end_Address-yellow"/>
<a href="https://github.com/chenmeilong/FileMaster-backend" style="text-decoration: none;"><img src="https://img.shields.io/badge/Back--end_Address-green"/>
<a href="http://fm.mileschen.cn/" style="text-decoration: none;"><img src="https://img.shields.io/badge/Experience_Address-brightgreen"/></a>
</div>
<div align="center">
<img src="https://img.shields.io/badge/-Node-red"/>
<img src="https://img.shields.io/badge/-TS-lightgrey"/>
<img src="https://img.shields.io/badge/-Eslint-blue"/>
<img src="https://img.shields.io/badge/-Prettier-blueviolet"/>
</div>
<div align="center">
<img src="https://img.shields.io/badge/express-4.18.2-yellowgreen"/>
<img src="https://img.shields.io/badge/helmet-7.0.0-orange"/>
<img src="https://img.shields.io/badge/multer-1.4.5-blueviolet"/>
<img src="https://img.shields.io/badge/unzipper-0.10.14-blue"/>
<img src="https://img.shields.io/badge/graceful--fs-4.2.11-lightgrey"/>
<img src="https://img.shields.io/badge/fs--extra-11.1.1-red"/>
<img src="https://img.shields.io/badge/archiver-5.3.1-yellow"/>
</div>
<hr>
<hr>

## API
- fm/foldertree: Get the folder tree starting from the root directory, without files
- fm/folder: Get all files in the specified directory, including folders and files, not including files in subdirectories
- fm/all: Get all files in the specified directory, including folders and files, including files in subdirectories
- fm/rename: rename a file or folder
- fm/createfile: create a file
- fm/createfolder: create a folder
- fm/delete: delete the specified file
- fm/copy: copy the specified file to the specified directory
- fm/move: move the specified file to the specified directory
- fm/emptydir: empty the specified directory of all files and folders
- fm/unzip: unzip
- fm/archive: compress files and folders
- fm/duplicate: fast copy
- fm/saveimage: save images
- fm/upload: upload files
- uploads: static resource hosting

## Quick start
1. Install the dependency environment
> `pnpm i`   or `yarn`  or  `npm i` 

2. Start the project
> `pnpm start`  or `yarn start`  or  `npm start` 

## Request Flowchart
<div align="center">
<img src="./img/express.jpg" />
</div>


## To be done
- [X] Optimize directory tree lookup structure to improve directory tree query efficiency
- [X] Global error middleware based on the distinction between development and production environments
- [X] File batching, put all asynchronous objects in an array and use promise.all to handle them
- [ ] More detailed type definitions
- [ ] Text file save after editing API
- [ ] File search API
- [ ] Uploaded npm to improve installation and usage documentation

## Contribute
Welcome PRs! If you want to contribute to this project, you can submit a pr or issue, there are some features in [to-do](#to-do) that can be extended. I'm glad to see more people involved in improving and optimizing it.