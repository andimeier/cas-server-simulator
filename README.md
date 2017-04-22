# Hermes - Deployment Packager

## Zweck des Tools

Dies ist das REST-Backend, das zusammen mit dem GUI das Packaging Tool "Hermes" bildet.

Mit diesem Tool soll die Verwaltung von in Release Packages gebündelten Files standardisiert und dokumentiert werden. 

## Technischer Charakter

Backend ist ein Node-Server. Einerseits wird auf HTTP-Anfragen reagiert (REST-Service), andererseits gibt es auch einen inhärenten cronjob, der periodisch ein Import-Directory abfragt und enthaltene Files in Hermes importiert. 

Frontend ist eine reine Javascript-Applikation, benötigt also nur ein DocumentRoot am Webserver.

## Installation

* unter `/opt/hermes.rest` liegt der Server (das Backend)
* init-Skript
* Mysql-Datenbank "hermes"
* config.js anlegen und befüllen
* config (für Updates) als Backup: ###TBD

Die mit Hermes verwalteten Dateien (hochgeladene und generierte Dateien) liegen in einem separaten Datenverzeichnis außerhalb der Hermes-Applikation selbst:

* Datenverzeichnis: `/opt/hermes-data`: diese Verzeichnis und alle Unterverzeichnisse müssen vom Hermes-User (User, unter dem das Hermes-Backend ausgefürt wird) beschreibbar sein.

## Starten/Stoppen des Services

Per init-Skript 

	/etc/init.d/hermes_rest start|status|stop

## Konfiguration

Konfig-File ist:

	config/config.js

Sieht zB so aus:

	module.exports = {
	    "port": 3002,
	    "listenOn": "localhost",
		"logLevel": "verbose",	
	    "accessControlAllowOrigin": "http://localhost:1067",
	    "db": {
	        "host": "localhost",
	        "user": "hermes",
	        "password": "<password>",
	        "database": "hermes"
	    },
	    "uploadDir": "../hermes-data/uploads",
	    "bundleDir": "../hermes-data/bundles",
	    "importDir": "../hermes-data/import",
	    "importDoneDir": "../hermes-data/importDone",
	    "scanInterval": 15 // in minutes, 0 to disable
	};

## Deployment

Auf dem Zielserver (zB `atvulicl9`):

* erstelle ein neues, leeres Verzeichnis oder leere ein bestehendes. Dieses wird für den Build verwendet, muss also zunächst leer sein
* führe Buildskript aus: `build.sh TAG`. Übergeben wird ein TAG (ein Git-Tag, zB `v0.3.1`)
* Ergebnis: im `dist/`-Ordner ist die komplette Applikation, schon mit dem config-File, das von der aktuellen Version übernommen wurde. TO DO: nein, das config-File soll nicht schon beim Builden erzeugt werden, sondern erst durch das Deployment auf dem Zielsystem dazukopiert werden (und ev. um neue Config-Settings ergänzt) 
* Der Inhalt des `dist`-Folders kann ins Zielverzeichnis kopiert oder verschoben werden.
* Dann noch ein Service-Restart und die neue Version sollte wirken

## API-Dokumentation

Die API-Dokumentation kann mit

	npm run api-doc

erzeugt werden. Damit wird die API-Dokumentation im HTML-Format generiert. Die HTML-Files legen hier:

	doc/api/

## Grundlegene Regeln mit Hermes

Jede Version soll **eindeutig** sein. Das ist ernst gemeint. Das heißt, dass auch ein "Probebuild", der in Hermes abgelegt und dann getestet wird, eine eigene Versionsnummer hat wie der folgende "echte Build", auch wenn der Probebuild nur ein schnelles Ausprobieren war. Eine Versionsnummer soll niemals für zwei verschiedene Inhalte verwendet werden, und seien die Unterschiede auch noch so klein. Dafür gibt es ja den "Build"-Teil der Versionsnummer.

In Hermes wird das durchgesetzt, indem auf die Eindeutigkeit der Version geachtet wird (unique index).

Probebuilds kann man ja eh aus dem System "ausblenden", indem man ihren Status auf "invalid" setzt.
