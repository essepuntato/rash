# -*- coding: utf-8 -*-
__author__ = 'essepuntato'
import web
import os
import cgi
import tempfile
from subprocess import call
from lxml import etree
from rrh import RewriteRuleHandler
from wl import WebLogger

# Set the max size of the file uploadable. The variable outside the brackets
# represent the limit expressed in MB.
max_mb = 5
cgi.maxlen = (1024 * 1024) * max_mb

urls = (
    '/rocs/?', 'Home',
    '/rocs/process/?', 'Process'
)

# Variables
wordprocessor_extensions = (".odt", )
html_extensions = (".html", ".htm")
archive_extensions = (".zip", )
supported_extensions = wordprocessor_extensions + html_extensions + archive_extensions

# Paths
base_path = "html" + os.sep
rash_tools = "libraries" + os.sep
odt_to_rash_path = rash_tools + "odt2rash.jar"
springer_lncs_xslt_file_path = rash_tools + "springer-lncs.xsl"
acm_icps_xslt_file_path = rash_tools + "acm-icps.xsl"
springer_lncs_tex_dir = rash_tools + "springer_lncs"
acm_icps_tex_dir = rash_tools + "acm_icps"

# For rendering
render = web.template.render(base_path)

# Rewrite rules
rewrite = RewriteRuleHandler(
    "Redirect",
    [
        ("^/sempub-datasets/?$", "/static/2016/eswc/RDF_scholarly_dataset_info.xlsx"),
        ("^/sempub-ontologies/?$", "/static/2016/eswc/Ontologies.zip")
    ],
    urls
)

web_logger = WebLogger("dasplab.cs.unibo.it/rocs", "dasplab_log.txt", [
    "REMOTE_ADDR",      # The IP address of the visitor
    "HTTP_USER_AGENT",  # The browser type of the visitor
    "HTTP_REFERER",     # The URL of the page that called your program
    "HTTP_HOST",        # The hostname of the page being attempted
    "REQUEST_URI"       # The interpreted pathname of the requested document
                        # or CGI (relative to the document root)
    ],
    {"REMOTE_ADDR": ["130.136.131.15"]}  # exclude requests from this IP
)

class Redirect:
    def GET(self, u):
        web_logger.mes()
        raise web.seeother(rewrite.rewrite(u))

class Home:
    def GET(self):
        web_logger.mes()
        return render.index(None)

class Process:
    @staticmethod
    def __is_xhtml(file_path):
        try:
            cur_tree = etree.parse(file_path)
            return True
        except Exception:
            return False

    @staticmethod
    def __is_valid(file_path):
        cur_tree = etree.parse(file_path)
        rash_rng = etree.parse(rash_tools + "rash.rng")
        rash_validator = etree.RelaxNG(rash_rng)
        return rash_validator(cur_tree)

    @staticmethod
    def __unzip(cur_file_path, tmp_dir):
        call("unzip " + cur_file_path + " -d " + tmp_dir, shell=True)
        call("rm -rf " + cur_file_path, shell=True)

    @staticmethod
    def __zip(cur_filename, tmp_dir):
        cur_zip_filename = os.path.splitext(cur_filename)[0] + ".zip"
        call("zip -r %s %s" %
             (tmp_dir + os.sep + cur_zip_filename, tmp_dir + os.sep + "*"), shell=True)
        return open(tmp_dir + os.sep + cur_zip_filename, "rb").read()

    @staticmethod
    def __copy_latex_style(tex_file, latex_dir):
        call("cp -r %s/* %s" % (latex_dir, os.path.dirname(tex_file)), shell=True)

    @staticmethod
    def __find_rash_file(tmp_dir):
        for cur_dir, cur_subdir, cur_files in os.walk(tmp_dir):
            for cur_file in cur_files:
                if cur_file.endswith(html_extensions):
                    return cur_dir + os.sep + cur_file

    @staticmethod
    def __create_tex(
            cur_rash_file, xslt_file=springer_lncs_xslt_file_path, tex_dir=springer_lncs_tex_dir):
        tex_file = os.path.splitext(cur_rash_file)[0] + ".tex"
        call(rash_tools + "call-saxon.sh -xsl:%s -s:%s -o:%s" %
             (xslt_file, cur_rash_file, tex_file), shell=True)
        if os.path.isfile(tex_file):
            if os.path.getsize(tex_file) > 0:
                call("cp -rf %s/* %s" %
                     (tex_dir, os.path.dirname(tex_file)), shell=True)
                return tex_file

    @staticmethod
    def __convert_from_odt(cur_odt_file):
        cur_rash_dir = os.path.dirname(cur_odt_file) + os.sep + "rash"
        call("java -jar %s -i %s -o %s" %
             (odt_to_rash_path, cur_odt_file, cur_rash_dir), shell=True)
        if os.path.isdir(cur_rash_dir):
            return cur_rash_dir

    def POST(self):
        web_logger.mes()
        final_result = None
        error = None
        tmp_dir = None

        try:
            my_form = web.input(file={}, latex=None)
            cur_filename = os.path.basename(my_form['file'].filename)
            cur_latex_style = my_form["latex"]
            # check extension, if not right returns error
            if cur_filename.endswith(supported_extensions):
                tmp_dir = tempfile.mkdtemp("", "rash_", ".")

                # Save the file in the temporary directory
                cur_file_path = tmp_dir + os.sep + cur_filename
                cur_file_content = my_form['file'].file.read()
                with open(cur_file_path, "w") as f:
                    f.write(cur_file_content)

                cur_rash_file = None

                if cur_filename.endswith(wordprocessor_extensions):  # conversion from ODT
                    cur_rash_dir = Process.__convert_from_odt(cur_file_path)
                    if cur_rash_dir is None:
                        error = "The conversion from ODT into RASH doesn't work as expected, and no" \
                                " RASH package has been created."

                # Conversion from RASH (complete archive)
                if cur_filename.endswith(archive_extensions):
                    Process.__unzip(cur_file_path, tmp_dir)

                # The conversion from RASH (only HTML) is handled by the following code
                # (no conditional blocks are needed)
                cur_rash_file = Process.__find_rash_file(tmp_dir)
                if cur_rash_file is None:
                    if error is None:
                        error = "The conversion into LaTeX has not started since no " \
                                "RASH file has been found."
                else:
                    # Check if the file is XHTML
                    if Process.__is_xhtml(cur_rash_file):
                        # Check whether the file is compliant with RASH
                        is_rash_valid = Process.__is_valid(cur_rash_file)
                        if cur_latex_style == "icps":
                            cur_xslt = acm_icps_xslt_file_path
                            cur_tex_dir = acm_icps_tex_dir
                        else:
                            cur_xslt = springer_lncs_xslt_file_path
                            cur_tex_dir = springer_lncs_tex_dir
                        tex_file = Process.__create_tex(cur_rash_file, cur_xslt, cur_tex_dir)
                        if tex_file is None:
                            error = \
                                "The conversion process ends up with an error. " \
                                "Please check if your RASH document is compliant with " \
                                "the current specification (https://rawgit.com/essepuntato/" \
                                "rash/master/documentation/index.html). The RASH document " \
                                "uploaded (%s) is%s valid against the RASH grammar." % \
                                (cur_rash_file, "" if is_rash_valid else " not")
                        else:
                            Process.__copy_latex_style(tex_file, cur_tex_dir)
                            final_result = Process.__zip(cur_filename, tmp_dir)
                    else:
                        error = "The RASH file identified is not a well-formed XHTML document."
            else:
               error = "File type is not admitted - the possibile file " \
                       "extensions are: .odt, .zip, .html"

            # check if the conversion into RASH worked well (the HTML file should be > 0b)
            # check validity of RASH:
            # 1. if it is not valid but still XML, we try but we generate a README.txt for explaining
            # 2. if it is not XML, return error

        except ValueError as e:
            error = "File too large (max. size %s MB) - %s" % (max_mb, str(e))

        if tmp_dir is not None:
            call("rm -rf " + tmp_dir, shell=True)

        if final_result is None:
            return render.index(error)
        else:
            web.header("Content-Type", "application/zip")
            web.header("Content-Disposition", "inline; filename=%s.zip" % os.path.basename(tmp_dir))
            return final_result


if __name__ == "__main__":
    app = web.application(rewrite.get_urls(), globals())
    app.run()
