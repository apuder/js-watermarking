

module preprocess {
	"use strict"

	var count: number;

	// TODO verify validity of identifiers

	function replace_identifier(identifier: string): string {
		identifier = identifier.replace(/,$/, ''); // remove trailing comma
		return "'" + identifier + "':" + identifier + ',';
	}

	function replace_jsw_default(code: string): string {
		code = code.substring(6).trim();
		code = code.replace(/\w+,?/g, replace_identifier);
		code = code.replace(/,$/, ''); // remove trailing comma
		return "trace_stack.push({location:" + count++ + ",context:{" + code + "}});";
	}

	function replace_jsw_global(code: string): string {
		code = code.substring(13).trim();
		code = code.replace(/\w+,?/g, replace_identifier);
		code = code.replace(/,$/, ''); // remove trailing comma
		return "trace_stack.global_context = {" + code + "};";
	}

	function replace_jsw_end(code: string): string {
		return 	  "final_stack = trace_stack;\n"
				+ "trace_stack = [];\n"
				+ "trace_stack.jsw_watermark_script = document.createElement('script');\n"
				+ "trace_stack.jsw_watermark_script.id = 'jsw_watermark_script';\n"
				+ "trace_stack.jsw_watermark_script.text = \""
					+ "// sending trace complete message until acknowledged\\n"
					+ "var tint = setInterval(function(){ signal_trace_complete() }, 100);\\n"
					+ "window.addEventListener('message', function(event) {\\n"
					+ "	// We only accept messages from ourselves\\n"
					+ "	if (event.source != window)\\n"
					+ "	return;\\n"
					+ "	if (event.data.type && (event.data.type === 'jsw_trace_complete_acknowledgement')) {\\n"
					+ "		if (tint && final_stack.file_name === event.data.file ) { clearInterval(tint); tint = null; }\\n"
					+ "	}\\n"
					+ "}, false);\\n"
					+ "function signal_trace_complete() { console.log('Signaling trace complete'); window.postMessage({ type: 'jsw_trace_complete', file: final_stack.file_name }, '*'); };\\n"
					+ "signal_trace_complete();\";\n"
				+ "document.head.appendChild(trace_stack.jsw_watermark_script);\n"
				+ "console.log('trace complete');"
				;
	}

	function replace_jsw(code: string): string {
		if (code.indexOf("///jsw_end") == 0) {
			return replace_jsw_end(code);
		} else if (code.indexOf("///jsw_global") == 0) {
			return replace_jsw_global(code);
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

}