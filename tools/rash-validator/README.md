# RASH Validator

> Validate your RASH files.

The RASH Validator is composed by 2 main components:
- A command-line validator
- A web application to interactively validate RASH files

## Requirements

- [node.js](https://nodejs.org/en/)
- [web.py](http://webpy.org/)
- [lxml](http://lxml.de/installation.html)
- [pyjing](https://pypi.python.org/pypi/jingtrang)

## Usage

It's **mandatory** to execute the scripts **within this directory**.

**Update** the files from the sources:
```sh
./update.sh
```

### Command-line validator

```sh
usage: rashvalidator.py [-h] [-j] [-f dir] file

RASH Validator, validate a RASH file.

positional arguments:
  file                 the file to be validated

optional arguments:
  -h, --help           show this help message and exit
  -j, --json           print to json if set
  -f dir, --force dir  force conversion from HTML to XML
```

### Web application

Start the server:
```sh
./start_webapp.sh
```

Open your browser at `localhost:8080`
