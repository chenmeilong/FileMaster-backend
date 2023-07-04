
function escapePath(path){
    // 为什么要？？ 不包含 !path.includes('..') && !path.includes('./')
    return (typeof path !== 'undefined' && path !== '' && !path.includes('..') && !path.includes('./')) ? path : '/uploads/';
}

function checkExtension(extension){
    const allowedFiles = ['.jpg', '.png', '.gif', '.jpeg', '.svg','.doc','.txt', '.csv', '.docx', '.xls','.xml','.pdf','.zip', '.ppt','.mp4','.ai','.psd','.mp3','.avi',];
    return (extension !== '') ? ((allowedFiles.indexOf(extension) === -1) ? false : true) : true; 
}
function checkVariables(variables){ 
    var result = true;
    variables.forEach(element => {
        if(element === '' || element=== undefined){
            result = false;
        }
    });
    return result;
}

module.exports = {
    escapePath,
    checkExtension,
    checkVariables
}