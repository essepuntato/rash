"""Web app."""
import web
import view
import os
import json
from view import render
from rashvalidator import validate
from lxml import html, etree

urls = (
    '/validate', 'Validate',
    '/(.*)', 'Index',
)

temp_dir = 'temp' + os.path.sep

class Index:
    """Index class."""

    def GET(self, name):
        """GET index page."""
        return render.index()


class Validate:
    """RASH validator route."""

    def POST(self):
        """The file to validate is in POST."""
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        inputs = web.input(rash_file={})
        filename = ''
        output = ''
        if 'rash_file' in inputs:
            filepath = inputs.rash_file.filename.replace('\\', '/')
            filename = filepath.split('/')[-1]
            conversion_enabled = True if inputs.conversion_enabled == 'true' else False
            conversion_dir = 'temp' if conversion_enabled else ''
            with open(temp_dir + os.path.sep + filename, 'w') as fout:
                temp_file = inputs.rash_file.file.read()
                fout.write(temp_file)
            output = validate(temp_dir + filename, True, conversion_dir)
        res_json = json.loads(output)
        if res_json['has_converted']:
            res_json['converted_xml'] = open(res_json['converted_path'], 'r').read()
            encoded_res_json = json.dumps(res_json, indent=4)
            output = encoded_res_json
            os.remove(res_json['converted_path'])
        os.remove(res_json['filename'])
        print(output)
        return output

if __name__ == "__main__":
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    app = web.application(urls, globals())
    app.run()
