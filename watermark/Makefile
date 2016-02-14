# watermark uses the typescript compiler to make a JavaScript file
TSC=tsc
FLAGS=
MODULE=commonjs
SOURCES=watermark.ts radixgraph.ts rootedgraphinstructions.ts powergraph.ts jswpp.ts
SOURCE=watermark.ts

TARGETS=$(SOURCES:.ts=.js)
TARGET=$(SOURCE:.ts=.js)

CODE_DIR = watermark

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(SOURCES)
	$(TSC) $(FLAGS) -m $(MODULE) $(SOURCE)

clean:
	rm $(TARGETS)
