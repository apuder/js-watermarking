# watermark uses the typescript compiler to make a JavaScript file
TSC=tsc
BROWSERFLAGS=--target es6
NODEFLAGS=-m commonjs
SOURCES=watermark.ts preprocess.ts watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts powergraph.ts  cyclicgraphinserter.ts jsonify.ts 
SOURCE=watermark.ts

TARGETS=$(SOURCES:.ts=.js)
TARGET=$(SOURCE:.ts=.js)

CODE_DIR = watermark

.PHONY: all clean

all: watermark.js watermarkapplier.js permutationgraph.js jsonify.js

watermark.js: watermark.ts preprocess.ts
	$(TSC) $(NODEFLAGS) watermark.ts

watermarkapplier.js: watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts
	$(TSC) $(BROWSERFLAGS) watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts --outFile watermarkapplier.js

permutationgraph.js: permutationgraph.ts
	$(TSC) $(BROWSERFLAGS) permutationgraph.ts --outFile permutationgraph.js
	mv permutationgraph.js ../extension/

jsonify.js: jsonify.ts
	$(TSC) $(NODEFLAGS) jsonify.ts

$(SOURCES):
	# dummy for dependencies

clean:
	rm $(TARGETS)
