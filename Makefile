# watermark uses the typescript compiler to make a JavaScript file
TSC=tsc
FLAGS=
MODULE=commonjs
SOURCE=watermark.ts
TARGET=$(SOURCE:.ts=.js)

all: $(TARGET)

$(TARGET): $(SOURCE)
	$(TSC) $(FLAGS) -m $(MODULE) $<

clean:
	rm $(TARGET)
