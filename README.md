
#JavaScript Watermarking
=======================

Tool for generating and extracting watermarks in JavaScript
applications.


#Usage
=======================

##1. Code Annotation
To watermark javascript code, insert annotations into the source code.
These annotations begin with ///jsw.  These annotations will be replaced by
code that traces the execution of the application.  Annotating the code only 
needs to be done once.
Using preprocessor style annotations makes testing the source code
simple, as the annotations are comments.  Also minification can remove the annotations
in the case a non-watermarked version of the code is released.
####	1. ///jsw [obj1, obj2, ...]
		The ///jsw annotation marks a location where watermark code
		can be inserted.  There should be many of these annotations to 
		minimize the amount of code at each location.  These locations 
		must always be reached in the same order with the same inputs 
		for the watermark to be correctly constructed.  A list of 
		js objects may be included in the annotation.  These 
		objects must be non-null javascript objects always available in the
		current scope, as they will be used to help construct the watermark.
		
####	2. ///jsw_global obj1, [obj2, ...]
		The ///jsw_global annotation gives the watermarking algorithm
		access to global js objects and must be reached exactly once.  These objects 
		must be in scope at all annotations and can be any user-defined 
		variable or window, other browser-defined globals are ignored for 
		performance reasons in finding the watermark.  This is necessary 
		to ensure the watermark is not garbage-collected, and is accessible
		at all locations.
		
####	3. ///jsw_end
		The ///jsw_end annotation marks the end of the trace, and must be reached exactly once.
		When control reaches this point the code will be
		watermarked and a download link to the watermarked version created.


##2. Tracing and Watermark insertion
To generete the watermark code, the application code must be preprocessed and run.
The nodejs script jswpp.js preprocesses javascript files to prepare then to be run in chrome.
Js-watermarking file naming conventions go as follows.
.jsw.pp.js files are ///jsw annotated js files.
.jsw.js files are preprocessed and ready to be run in Chrome.
#####	Preprocess: ```node jswpp.js file.jsw.pp.js```
		* The only argument to jswpp.js is the name of the file to be preprocessed.
			The output file will have .jsw.pp changed to .jsw if possible,
			otherwise it will be named out.jsw.js.
#####	Trace/Insert: In Chrome, open the page with script file.jsw.js.
		Open the jsw chrome extension by clicking on the jsw icon, see installation.
		Input the number and size desired, then click Insert.
		A download link will in the extension popup when watermark insertion is complete.


##3. Minify watermarked code
To increase the difficulty of detecting the watermark code
minify or otherwise obfuscate the code before release.


##4. Find watermarks
Navigate to a website suspected to contain a watermark.
Open the jsw chrome extension by clicking on the jsw icon, see installation.
Input the minimum size of the watermark in the size field, and click Find.
The jsw chrome extension will look for valid watermarks of size >= the size input.
The results will appear in the extension popup and in the console (```ctrl + shift + I```).


#Installation
=======================

Open Chrome/Chromium and navigate to about:extensions.
Enable Developer Mode if not enabled.
Then click load unpackaged extension and select the extension folder in js-watermarking.
The letters jsw should appear on the extension bar next to the menu icon.


####Notes:
The find watermarks extension is under development and may run indefinitely.
Clicking Insert in the Trace/Insert step before the webpage has finidhed tracing will cause an error to print to console.
In the future the Preprocessing may be implemented in the Chrome extension.
