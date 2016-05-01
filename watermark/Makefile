# watermark uses the typescript compiler to make a JavaScript file
TSC=tsc
BROWSERFLAGS=--target es6
NODEFLAGS=
SOURCES=watermark.ts jsw.ts watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts cycles.ts find_watermark.ts jsonify.ts
SOURCE=watermark.ts

TARGETS=$(SOURCES:.ts=.js)
TARGET=$(SOURCE:.ts=.js)

CODE_DIR = watermark

.PHONY: all clean tidy

all: watermark.js watermarkapplier.js find_watermark.js jsw.js

jsw.js: jsw.ts  permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts cycles.ts
	$(TSC) $(NODEFLAGS) jsw.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts cycles.ts --outFile jsw.js
	cp jsw.js ../

watermark.js: watermark.ts watermarkapplier.json
	$(TSC) $(NODEFLAGS) watermark.ts
	echo "var applier = " > watermark2.js
	cat watermarkapplier.json >> watermark2.js
	echo ";\n" >> watermark2.js
	cat watermark.js >> watermark2.js
	mv watermark2.js ../jswpp.js

watermarkapplier.js: watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts
	$(TSC) $(BROWSERFLAGS) watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts --outFile watermarkapplier.js

watermarkapplier.json: watermarkapplier.js jsonify.js
	node jsonify.js watermarkapplier.js

find_watermark.js: permutationgraph.ts cycles.ts find_watermark.ts
	$(TSC) $(BROWSERFLAGS) permutationgraph.ts cycles.ts find_watermark.ts --outFile find_watermark.js
	cp find_watermark.js ../extension/find_watermark.js

jsonify.js: jsonify.ts
	$(TSC) $(NODEFLAGS) jsonify.ts

$(SOURCES):
	# dummy for dependencies

clean:
	rm $(TARGETS)

tidy:
	rm ../extension/find_watermark.js ../jswpp.js ../jsw.js
