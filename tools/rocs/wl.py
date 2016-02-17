# -*- coding: utf-8 -*-
__author__ = 'essepuntato'
import logging
import web


class WebLogger(object):
    def __init__(self, name, out_file, list_of_web_var=[], filter_request={}):
        self.l = logging.getLogger(name)
        self.vars = list_of_web_var
        self.filter = filter_request

        # Configure logger
        self.l.setLevel(logging.INFO)

        # Add a file handler if it is not set yet
        if not any(isinstance(x, logging.FileHandler) for x in self.l.handlers):
            file_handler = logging.FileHandler(out_file)
            log_formatter = logging.Formatter('%(asctime)s %(message)s')
            file_handler.setFormatter(log_formatter)
            file_handler.setLevel(logging.INFO)
            self.l.addHandler(file_handler)

    def mes(self):
        cur_message = ""
        must_be_filtered = False
        for var in self.vars:
            cur_value = str(web.ctx.env.get(var))
            if var in self.filter and cur_value in self.filter[var]:
                must_be_filtered = True
            cur_message += "# %s: %s " % (var, cur_value)
        if not must_be_filtered:
            self.l.info(cur_message)

