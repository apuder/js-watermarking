# watermark makes a firefox addon by compiling typescript code to javascript
# then zipping the code and dependencies into a zip file

ADDONTARGETS = addon manifest.json # lib

CODE_DIR = watermark

.PHONY: all code clean


all: code

code:
	$(MAKE) -C $(CODE_DIR)

clean:
	$(MAKE) -C $(CODE_DIR) clean
