
var count: number;

// TODO verify validity of identifiers, check for commas

function replace_identifier(identifier: string): string {
	return "'" + identifier + "':" + identifier;
}

function replace_jsw_default(code: string): string {
	code = code.substring(6).trim();
	code = code.replace(/\w+/g, replace_identifier);
	return "trace_stack.push({" + count++ + ", {" + code + "}});";
}

function replace_jsw_end(code: string): string {
	return "jsw_watermark()";
}

function replace_jsw(code: string): string {
	if (code.indexOf("///jsw_end") == 0) {
		return replace_jsw_end(code);
	} else {
		return replace_jsw_default(code);
	}
}

export function preprocess(code: string, header?: string): string {
	count = 0;
	// var orig_code = code;
	// match ///jsw to end of line
	code = code.replace(/\/\/\/jsw.*/g, replace_jsw);
	return (header || "") + code;
}
