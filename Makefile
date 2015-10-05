# watermark uses the typescript compiler to make a JavaScript file
TSC=tsc
FLAGS=
MODULE=commonjs
SOURCES=watermark.ts radixgraph.ts
TARGET=watermark.js
TARGETS=$(SOURCES:.ts=.js)

all: $(TARGET)

$(TARGET): $(SOURCES)
	$(TSC) $(FLAGS) -m $(MODULE) $(SOURCES)

clean:
	rm $(TARGETS)
