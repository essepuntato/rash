"""RASH verifier."""
from argparse import ArgumentParser
from subprocess import check_output, CalledProcessError
from xml.etree import ElementTree
from lxml import html, etree
from shutil import copy2

import os
import json

rng_path = "rash.rng"


class ValidateError:
    """A validation error."""

    row = 0
    column = 0
    message = ''
    e_type = ''

    def __init__(self, row, column, message, e_type):
        """Initialize from a dict."""
        self.row = row
        self.column = column
        self.message = message
        self.e_type = e_type

    def __str__(self):
        """Get string representation."""
        return 'Row:\t\t{}\nColumn:\t\t{}\nMessage:\t{}\nType:\t\t{}\n'.format(
            self.row, self.column, self.message, self.e_type
        )


def validate_xml(filename):
    """Validate an XML file."""
    file_content = open(filename).read()
    try:
        ElementTree.fromstring(file_content)
    except ElementTree.ParseError as e:
        msg = str(e)
        row = msg[msg.find('line') + len('line') + 1:msg.rfind(',')]
        column = msg[msg.find('column') + len('column') + 1:]
        error = ValidateError(row, column, msg, 'XML')
        return error
    else:
        return ""


def validate_rash(filename):
    """Validate a RASH file."""
    if not os.path.exists(rng_path):
        raise IOError(rng_path + ' not found!')
    try:
        check_output(["pyjing", rng_path, filename])
    except CalledProcessError as e:
        errors = e.output.splitlines()
        my_errors = []
        for e in errors:
            if 'error:' in e:
                msg_start_token = 'error: '
                pre_message = e[:e.find(msg_start_token)]
                filename_rowcol = pre_message[pre_message.rfind('/') + 1:-1]
                row_col = filename_rowcol[filename_rowcol.find(':') + 1:-1]
                row, column = row_col.split(':')
                row = int(row) - 1
                column = int(column) - 1
                message = e[e.find(msg_start_token) + len(msg_start_token):]
                my_errors.append(ValidateError(row, column, message, 'RASH'))
        return my_errors
    else:
        return ""


def output_to_json(errors, filename, converted_path=""):
    """Convert the lxml error log to JSON."""
    error_list = [{
        'row': int(e.row),
        'column': int(e.column),
        'message': e.message,
        'type': e.e_type,
    } for e in errors]
    return json.dumps({
        'filename': filename,
        'errors': error_list,
        'has_converted': True if converted_path else False,
        'converted_path': converted_path,
    }, indent=4)


def output_to_string(errors, filename, converted_path=""):
    """Return a string representation of the output."""
    output = ""
    if errors:
        output = "Found the following errors on %s:\n" % filename
        for e in errors:
            output = output + '\n'
            output = output + str(e) + '\n'
        if errors[0].e_type == 'XML' and converted_path:
            output = output + 'The input file is expected to be a valid XHTML, but you can force an (HTML -> XHTML) conversion using the -f/--force parameter.\n'
    else:
        output = "%s is a valid RASH file." % filename
    if converted_path:
        output = output + '\nNote: The file has been converted from HTML to XHTML. The converted file is located in "%s"' % converted_path
    return output


def prepend_lines(filename, lines):
    """Prepend the given lines to a file."""
    if lines:
        line = reduce(lambda x, y: x + y + '\n', lines)
        with open(filename, 'r+') as f:
            content = f.read()
            f.seek(0, 0)
            f.write(line.rstrip('\r\n') + '\n' + content)


def validate(filename, json_output, output_dir):
    """The main function of this module."""
    xml_errors = validate_xml(filename)
    xml_path = output_dir + os.path.sep + filename[filename.find('/') + 1:filename.rfind('.')] + '.xhtml'
    errors = []
    has_converted = False
    print(output_dir)
    if not output_dir:
        if not xml_errors:
            errors = validate_rash(filename)
        else:
            errors = [xml_errors]
    else:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        if not xml_errors:
            errors = validate_rash(filename)
            if not filename.startswith(output_dir):
                copy2(filename, output_dir)
        else:
            # Convert to XML
            xml_etree = html.fromstring(open(filename, 'r').read())
            with open(xml_path, 'wb') as xml_file:
                xml_file.write(etree.tostring(xml_etree))
            # Prepend the initial lines, if any
            lines_to_prepend = []
            with open(filename, 'r') as input_file:
                line = input_file.readline()
                while line.startswith('<?'):
                    lines_to_prepend.append(line)
                    line = input_file.readline()
            prepend_lines(xml_path, lines_to_prepend)

            still_xml_errors = validate_xml(xml_path)
            if still_xml_errors:
                errors = [still_xml_errors]
            else:
                errors = validate_rash(xml_path)
                has_converted = True
    if errors:
        errors = reduce(lambda acc, e:
            acc if acc[-1].message == e.message else acc + [e], errors, [errors[0]]
        )
    if json_output:
        return output_to_json(errors, filename, xml_path if has_converted else "")
    else:
        return output_to_string(errors, filename, xml_path if has_converted else "")


def check_arguments():
    """Check the arguments and return them."""
    parser = ArgumentParser(description='RASH Validator, validate a RASH file.')
    parser.add_argument('-j', '--json',
                        default=False,
                        action='store_true',
                        help='print to json if set',
                        dest='json_output')
    parser.add_argument('-f', '--force',
                        default=False,
                        type=str,
                        action='store',
                        metavar='dir',
                        help='force conversion from HTML to XML',
                        dest='output_dir')
    parser.add_argument('filename',
                        metavar='file',
                        type=str,
                        nargs=1,
                        help='the file to be validated')
    return parser.parse_args()

if __name__ == "__main__":
    args = check_arguments()
    filename = args.filename[0]
    output_dir = args.output_dir.rstrip(os.path.sep) if args.output_dir else ""
    print(validate(filename, args.json_output, output_dir))
