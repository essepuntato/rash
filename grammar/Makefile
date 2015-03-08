WGET=wget
WGETFLAGS=
TRANGURL=https://repo1.maven.org/maven2/com/thaiopensource/trang/20091111/trang-20091111.jar
TRANGJAR=trang-20091111.jar
TRANGFLAGS=
JAVA=java
JAVAFLAGS=
RASHRNC=rash-html.rnc
RASHRNG=rash-html.rng

all: $(TRANGJAR) rash-html.rng

$(TRANGJAR):
	$(WGET) $(WGETFLAGS) $(TRANGURL)

.PHONY: $(RASHRNG)
$(RASHRNG): $(RASHRNC)
	$(JAVA) $(JAVAFLAGS) -jar $(TRANGJAR) $(RASHRNC) $(RASHRNG)

clean:
	$(RM) $(TRANGJAR)
