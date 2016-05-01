
JavaScript Watermarking
=======================

A Tool for generating and extracting watermarks in JavaScript applications.
There is a Chrome extension and a nodejs version of the tool.


Usage
=======================

##1. Code Annotation

To watermark javascript code, insert annotations into the source code. These files must be named __*.jsw.js__ for step 2 to work. Js-watermarking annotations begin with ///jsw. These annotations will be replaced by code that traces the execution of the application. Annotation only needs to be done once. Js-watermarking's preprocessor style annotations makes testing code simple, as the annotations are comments. Also minification can remove the annotations in the case a non-watermarked version of the code is released.

  1. ///jsw [obj1, obj2, ...]

   The ///jsw annotation marks a location where watermark code can be inserted. There should be many of these annotations to minimize the amount of code at each location. These locations must always be reached in the same order with the same inputs for the watermark to be correctly constructed. A list of js objects may be included in the annotation. These objects must be non-null javascript objects that are always available in the current scope.

  2. ///jsw_global obj1, [obj2, ...]

   The ///jsw_global annotation gives the watermarking algorithm access to global js objects and must be reached exactly once. These objects must be in scope at all annotations and can be any user-defined variable or window, other browser-defined globals are ignored for performance reasons in finding the watermark. This is necessary to ensure the watermark is accessible at all locations and can not be garbage-collected.

  3. ///jsw_end

   The ///jsw_end annotation marks the end of the trace, and must be reached exactly once. When control reaches this point the code will be watermarked and a download link to the watermarked version created.


##2. Tracing and Watermark insertion

#### Chrome
**```node jswpp.js```**

Run the nodejs script jswpp.js before attempting to watermark code. ```jswpp.js``` is a small server that processes javascript files and provides a redirectable url on the fly.

#####	Trace/Insert: 

  1. Run ```node jswpp.js``` on the command line.
  2. In Chrome, open the page with script.jsw.js.  This page must be loaded through http, file and https are not supported at this time.
  3. Open the jsw chrome extension by clicking on the jsw icon, *see installation*.
  4. Input the watermark **number** and **size** desired, then click Insert.
  5. A download link will appear in the extension popup when watermark insertion is complete.  This may take some time depending on when your code reaches ///jsw_end.
  6. Change the number or size of the watermark and click Insert to produce as differently watermarked versions of the code.

#### nodejs
**```node jsw.js```**

Run the nodejs script jsw.js traces your code and inserts a watermark in nodejs.

##### Trace/Insert: 

  1. Run ```node jsw.js file.jsw.js number [-s watermark_size -o outfile.js -e 'code to execute as part of trace']``` on the command line.
  2. The outut file will be saved in the current directory.


##3. Minify watermarked code

To increase the difficulty of detecting the watermark code minify or otherwise obfuscate the code before release.


##4. Find watermarks

#### Chrome

  1. Navigate to a website suspected to contain a watermark.
  2. Open the jsw chrome extension by clicking on the jsw icon, *see installation*.
  3. Input the minimum size of the watermark in the size field, and click Find.
  4. The jsw chrome extension will look for valid watermarks of size >= the size input.
  5. Results will appear in the extension popup and in the console (```ctrl + shift + I```). If nothing is found, remember watermark construction will take as long as the insertion step, until the code original code reached ///jsw_end.

#### nodejs

  1. Run ```node jsw.js suspicious_code.js -f [-s watermark_size]``` on the commandline.
  5. Results will appear in the extension popup and in the console (```ctrl + shift + I```). If nothing is found, remember watermark construction will take as long as the insertion step, until the code original code reached ///jsw_end.


Installation
=======================

#### Chrome

  1. Open Chrome/Chromium and navigate to about:extensions.
  2. Enable Developer Mode if not enabled.
  3. Click load unpackaged extension and select the extension folder in the js-watermarking directory.
  4. The letters jsw should appear on the extension bar next to the menu icon.

#### nodejs

  1. Use jsw.js [-h] included in this reqository.



####Notes:
* If the Find watermarks button fails the first time, press again.
* If the Insert watermarks button fails the first time, press again.
* Find and Insert do not work on the same page at the same time.


License
=======================
Distributed under the BSD 2 license.
https://opensource.org/licenses/BSD-2-Clause
