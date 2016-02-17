# watermark uses the typescript compiler to make a JavaScript file
TSC=tsc
FLAGS=--target es6
MODULE=commonjs
SOURCES=watermark.ts preprocess.ts watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts powergraph.ts  cyclicgraphinserter.ts
SOURCE=watermark.ts

TARGETS=$(SOURCES:.ts=.js)
TARGET=$(SOURCE:.ts=.js)

CODE_DIR = watermark

.PHONY: all clean

all: watermark.js watermarkapplier.js

watermark.js: watermark.ts preprocess.ts
	$(TSC) $(FLAGS) -m $(MODULE) watermark.ts

watermarkapplier.js: watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts
	$(TSC) $(FLAGS)  watermarkapplier.ts permutationgraph.ts cyclicgraphinstructions.ts cyclicgraphinserter.ts --outFile watermarkapplier.js

$(SOURCES):
	# dummy for dependencies

clean:
	rm $(TARGETS)
