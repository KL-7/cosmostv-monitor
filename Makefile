VERSION = $(shell sed -n 's/\s*em:version="\(.*\)"/\1/p' src/install.rdf)

.PHONY: all pack-xpi archive-xpi

all:

cosmostv-monitor.xpi: src/*
	rm -rf build
	cp -r src build
	
	# pack chrome in jar
	cd build/chrome; \
	zip -r ../cosmostv-monitor.jar . ; \
	rm -rf *; \
	mv ../cosmostv-monitor.jar .
	
	# fix chrome.manifest to use chrome from jar
	cd build; \
	sed -i 's/chrome\//jar:chrome\/cosmostv-monitor.jar!\//' chrome.manifest
		
	# pack all in xpi
	cd build; \
	zip -r cosmostv-monitor.xpi .
	
	# copy xpi
	mv build/cosmostv-monitor.xpi .
	
	# clean up
	rm -rf build

pack-xpi: cosmostv-monitor.xpi

vers/cosmostv-monitor-$(VERSION).xpi: cosmostv-monitor.xpi
	mkdir -p vers
	cp cosmostv-monitor.xpi vers/cosmostv-monitor-$(VERSION).xpi	

archive-xpi: vers/cosmostv-monitor-$(VERSION).xpi
