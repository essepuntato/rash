# -*- coding: utf-8 -*-
__author__ = 'essepuntato'

import re


class RewriteRuleHandler(object):
    def __init__(self, class_name, r_list=None, urls=()):
        self.urls = urls
        self.class_name = class_name
        self.rr = []
        if r_list is not None:
            self.add_rules(r_list)

    def add_rule(self, p, r, is_last=False):
        self.rr += [(p, r, is_last)]

    def add_rules(self, r_list):
        for r in r_list:
            if len(r) > 2:
                self.add_rule(r[0], r[1], r[2])
            else:
                self.add_rule(r[0], r[1])
            self.urls += ("(" + r[0] + ")", self.class_name)

    def rewrite(self, u):
        res = u
        for p, r, is_last in self.rr:
            if re.search(p, res) is not None:
                res = re.sub(p, r, res)
                if is_last:
                    break
        return res

    def get_urls(self):
        return self.urls