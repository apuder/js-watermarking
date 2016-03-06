
#JavaScript Watermarking
=======================

Tool for generating and extracting watermarks in JavaScript
applications.


#Usage
=======================

##1. Code Annotation
Before watermark code can be inserted into javascript code,
the code must be annotated with ///jsw annotations.  Using 
such preprocessor style annotations makes testing your code
easier as they are simply treated as comments.
There are three such annotations:
####	///jsw [objects]
		The basic ///jsw annotation marks a location for code
		insertion.  These locations must always be reached in the
		same order for the same input as these locations are
		where inseted code will create the watermark.  A list of 
		js objects may be included in the annotation.  These 
		objects may be used to hold references into the 
		watermark, and must be non-null javascript objects in 
		all instances of the location.
####	///jsw_global objects
		The ///jsw_global annotation marks the global js objects
		that may be used to hold references into the watermark.
		This is necessary to ensure the watermark is not 
		garbage-collected.  This also provides a way to access
		the watermark at all locations.
####	///jsw_end
		The ///jsw_end annotation marks the end of the trace.
		When control first reaches this point the code will be
		watermarked and a download link to the watermarked 
		version created.

##2. Tracing and Watermark insertion
In order to generete the code necessary to create the watermark,
the code must be preprocessed and run to trace the code.
In order to do this jswpp.js must be run on the code and the code
run in chrome.
######	1. ```node jswpp.js file.jsw.pp.js number size```
######	2. In Chrome, open the page with script file.jsw.js. A download link will appear when watermark insertion is complete.

##3. Minify watermarked code
To increase the difficulty of detecting the watermark code
minify or otherwise obfuscate the code before release.

##4. Find watermarks
To find watermarks open Chrome/Chromium and navigate to about:extensions.
Ensure Developer Mode is enabled, then click load unpackaged extension and select the extension folder in js-watermarking.
The letters jsw should appear on the extension bar next to the menu icon.
Upon navigating to a website with the watermark, click jsw and input the size of the watermark and click Find.
Results, along with other logs should appear in the console (ctrl + shift + I).

####Notes:
The find watermarks extension is still under development.  It may fail to find some watermarks, or run indefinitely.
In the future the Tracing and Watermarking insertion step may be also implemented in a Chrome extension, eliminating the need for node and the command line.
