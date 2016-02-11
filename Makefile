# watermark makes a firefox addon by compiling typescript code to javascript
# then zipping the code and dependencies into a zip file

ADDONTARGETS=addon manifest.json

CODE_DIR = watermark

TARGET = js-watermarking.xpi

.PHONY: all code addon clean


all: code addon

code:
	$(MAKE) -C $(CODE_DIR)

addon: code $(ADDONTARGETS)
	zip -r $(TARGET) $(ADDONTARGETS)

clean:
	rm $(TARGET)
	$(MAKE) -C $(CODE_DIR) clean
