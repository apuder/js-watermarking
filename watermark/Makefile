# watermark uses the typescript compiler to make a JavaScript file
TSC=tsc
BROWSERFLAGS=--target es6
NODEFLAGS=-m commonjs
SOURCES=watermark.ts preprocess.ts watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts cycles.ts find_watermark.ts
SOURCE=watermark.ts

TARGETS=$(SOURCES:.ts=.js)
TARGET=$(SOURCE:.ts=.js)

CODE_DIR = watermark

.PHONY: all clean tidy

all: watermark.js watermarkapplier.js find_watermark.js

watermark.js: watermark.ts preprocess.ts
	$(TSC) $(NODEFLAGS) watermark.ts
	cp watermark.js ../jswpp.js

watermarkapplier.js: watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts
	$(TSC) $(BROWSERFLAGS) watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts --outFile watermarkapplier.js

find_watermark.js: permutationgraph.ts cycles.ts find_watermark.ts
	$(TSC) $(BROWSERFLAGS) permutationgraph.ts cycles.ts find_watermark.ts --outFile find_watermark.js
	cp find_watermark.js ../extension/find_watermark.js

$(SOURCES):
	# dummy for dependencies

clean:
	rm $(TARGETS)

tidy:
	rm ../extension/find_watermark.js ../jswpp.js
