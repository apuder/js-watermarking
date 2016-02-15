"use strict";
var count;
// TODO verify validity of identifiers, check for commas
function replace_identifier(identifier) {
    identifier = identifier.replace(/,$/, ''); // remove trailing comma
    return "'" + identifier + "':" + identifier + ',';
}
function replace_jsw_default(code) {
    code = code.substring(6).trim();
    code = code.replace(/\w+,?/g, replace_identifier);
    code = code.replace(/,$/, ''); // remove trailing comma
    return "trace_stack.push({location:" + count++ + ",context:{" + code + "}});";
}
function replace_jsw_global(code) {
    code = code.substring(13).trim();
    code = code.replace(/\w+,?/g, replace_identifier);
    code = code.replace(/,$/, ''); // remove trailing comma
    return "trace_stack.global_context = {" + code + "};";
}
function replace_jsw_end(code) {
    return "jsw_watermark()";
}
function replace_jsw(code) {
    if (code.indexOf("///jsw_end") == 0) {
        return replace_jsw_end(code);
    }
    else if (code.indexOf("///jsw_global") == 0) {
        return replace_jsw_global(code);
    }
    else {
        return replace_jsw_default(code);
    }
}
function preprocess(code, header) {
    count = 0;
    // var orig_code = code;
    // match ///jsw to end of line
    code = code.replace(/\/\/\/jsw.*/g, replace_jsw);
    return (header || "") + code;
}
exports.preprocess = preprocess;
