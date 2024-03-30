
module.exports.checkNullProps = function (obj) {
    const nullProps = [];
    for (const prop in obj) {
        // console.log(prop);
        // console.log(obj[prop]);
        if (obj[prop] == undefined) {
            nullProps.push(prop);
        }
    }
    if (nullProps.length > 0) {
        return `Error: The following properties are null: ${nullProps.join(', ')}`;
    } else {
        return null;
    }
}
