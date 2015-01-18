/*
 * rash.js - Version 0.1, December 14, 2014
 * Copyright (c) 2014, Silvio Peroni <essepuntato@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with 
 * or without fee is hereby granted, provided that the above copyright notice and this 
 * permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD 
 * TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. 
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR 
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR 
 * PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING 
 * OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/* Additional jQuery functions */
jQuery.fn.extend({
    countWords: function () {
        var text = $(this).text();
        var regex = /\s+/gi;
        var total_word_count = text.trim().replace(regex, ' ').split(' ').length;
        var table_text = $(this).find("table").text();
        var table_word_count = table_text.trim().replace(regex, ' ').split(' ').length;
        return total_word_count - table_word_count
    },
    countElements: function (css_selector) {
        return $(this).find(css_selector).length;
    },
    findNumber: function(css_selector) {
        var cur_count = 0;
        var cur_el = $(this);
        var found = false;
        $(css_selector).each(function(){
            if (!found) {
                cur_count++;
                found = cur_el[0] === $(this)[0];
            }
        });
        return cur_count;
    },
    findHierarchicalNumber: function(css_selector) {
        var cur_count = 1;
        $(this).prevAll(css_selector).each(function() {
            cur_count++;
        });
        var parents = $(this).parents(css_selector);
        if (parents.length > 0) {
            return $(parents[0]).findHierarchicalNumber(css_selector) + "." + cur_count;
        } else {
            return cur_count;
        }
    }
});

$(function() {
    /* Bibliographic reference list */
    $('.bibliography ul li').sort(function(a,b) {
        var a_text = $(a).text().replace(/ \s+/g," ").split();
        var b_text = $(b).text().replace(/ \s+/g," ").split();
        if (a_text < b_text) {
            return -1;
        } else if (a_text > b_text) {
            return 1;
        } else {
            return 0;
        }
    }).appendTo('.bibliography ul');
    /* /END Bibliographic reference list */
    
    /* Footnotes (part one) */
    $('.footnotes div').sort(function(a,b) {
        var all_footnote_pointers = $("a[class=footnote]");
        var a_index = all_footnote_pointers.index(all_footnote_pointers.filter("a[href='#" + $(a).attr("id") + "']"));
        var b_index = all_footnote_pointers.index(all_footnote_pointers.filter("a[href='#" + $(b).attr("id") + "']"));
        if (a_index < b_index) {
            return -1;
        } else if (a_index > b_index) {
            return 1;
        } else {
            return 0;
        }
    }).appendTo('.footnotes');
    $(".footnotes").prepend("<h1>Footnotes</h1>");
    /* /END Footnotes (part one) */
    
    
    /* References */
    $("a.ref").each(function() {
        var cur_id = $(this).attr("href");
        if ($(cur_id).parents("div.bibliography").length > 0) {
            var cur_count = $(cur_id).prevAll("li").length + 1;
            $(this).html("[" + cur_count + "]");
            $(this).attr("title", $(cur_id).text().replace(/\s+/g, " ").trim());
        } else if ($(cur_id+ ".picture").length > 0) {
            var cur_count = $(cur_id).findNumber(".picture");
            if (cur_count != 0) {
                $(this).html("Figure " + cur_count);
            }
        } else if ($(cur_id+ ".table").length > 0) {
            var cur_count = $(cur_id).findNumber(".table");
            if (cur_count != 0) {
                $(this).html("Table " + cur_count);
            }
        } else if ($(cur_id+ ".formula").length > 0) {
            var cur_count = $(cur_id).findNumber(".formula");
            if (cur_count != 0) {
                $(this).html("Formula " + cur_count);
            }
        } else if ($(cur_id+ ".section").length > 0) {
            var cur_count = $(cur_id).findHierarchicalNumber(".section");
            if (cur_count != null && cur_count != "") {
                $(this).html("Section " + cur_count);
            }
        } else if (
                    $(cur_id+ ".abstract").length > 0 ||
                    $(cur_id+ ".bibliography").length > 0 ||
                    $(cur_id+ ".footnotes").length > 0 ||
                    $(cur_id+ ".acknowledgements").length > 0) {
            $(this).html("Section <q>" + $(cur_id + " h1").text() + "</q>");
        } else{
            $(this).replaceWith("<span class=\"error\">ERR: referenced element '" + cur_id.replace("#","") + "' does not exist</span>");
        }
    });
    /* /END References */

    /* Footnotes (part 2) */
    $(".footnote").each(function() {
        var prev_el = $(this).prev();
        var current_id = $(this).attr("href");
        var footnote_element = $(current_id);
        if (footnote_element.length > 0 && footnote_element.parent(".footnotes").length > 0) {
            var count = $(current_id).prevAll("div").length + 1;
            $(this).after("<sup class=\"fn\">" + (prev_el.hasClass("fn") ? "," : "") +
                "<a id=\"fn_pointer_" + current_id.replace("#", "") + 
                "\" href=\"" + current_id + "\"" + 
                "\" title=\"" + $(current_id).text().replace(/\s+/g," ").trim() + "\">" + count + "</a></sup>");
        } else {
            $(this).replaceWith("<span class=\"error\">ERR: footnote '" + current_id.replace("#","") + "' does not exist</span>");
        }
    });
    $(".footnotes > div").each(function() {
        var current_id = $(this).attr("id");
        $(this).children(":last-child").append(" <sup class=\"hidden-print\"><a href=\"#fn_pointer_" + current_id + "\">[back to pointer]</a></sup>");
    });
    /* /END Footnotes (part 2) */
    
    /* Container sections */
    $("body > .section , .abstract , .acknowledgements , .bibliography, .footnotes").addClass("container");
    /* /END Container sections */
    
    /* Heading dimensions */
    $("h1").each(function () {
        var counter = 0;
        $(this).parents("div").each(function() {
            if ($(this).children("h1").length > 0) {
                counter++;
            }
        });
        $(this).addClass("h" + counter);
    });
    /* /END Heading dimensions */
    
    /* Code (inline and blocks) */
    $(".code").not("p , span").each(function () {
        var current_name = $(this).prop("tagName")
        $(this).replaceWith("<" + current_name + "><code>" + $(this).html() + "</code></" + current_name + ">")
    });
    
    $("span.code").each(function () {
        $(this).replaceWith("<code>" + $(this).html() + "</code>")
    });
    
    $("p.code").each(function () {
        $(this).replaceWith("<pre>" + $(this).html() + "</pre>")
    });
    /* /END Code (inline and blocks) */
    
    /* Blockquote */
    $("p.quote").each(function () {
        $(this).replaceWith("<blockquote>" + $(this).html() + "</blockquote>")
    });
    /* /END Blockquote */
    
    /* Header title */
    var header = $("<header class=\"page-header container\"></header>");
    header.prependTo($("body"))
    var title_string = "";
    var title_split = $("head title").html().split(" -- ");
    if (title_split.length == 1) {
        title_string = title_split[0];
    } else {
        title_string = title_split[0] + "<br /><small>" + title_split[1] + "</small>";
    }
    
    header.append("<h1 class=\"title\">" + title_string + "</h1>")
    /* /END Header title */
    
    /* List of authors */
    var author_data = {};
    $("head meta[name^='author.']").each(function() {
        var current_value = $(this).attr("name");
        var current_id = current_value.replace(/author\.(.+)\..+/gi, "$1");
        var current_key = current_value.replace(/author\..+\.(.+)/gi, "$1");
        if (!author_data.hasOwnProperty(current_id)) {
            author_data[current_id] = {};
        }
        author_data[current_id][current_key] = $(this).attr("content");
    });
    
    var list_of_authors = [];
    for (var author_id in author_data) {
        list_of_authors.push(author_data[author_id]);
    }
    list_of_authors.sort(function(a,b) { return parseInt(a.number) - parseInt(b.number)});
    
    for (var i = 0; i < list_of_authors.length; i++) {
        var author = list_of_authors[i];
        var author_element = $("<address class=\"lead\"></address>");
        if (author.hasOwnProperty("name")) {
            var name_element_string = "<strong>" + author.name + "</strong>"
            if (author.hasOwnProperty("email")) {
                name_element_string += " <code><a href=\"mailto:" + author.email + "\">" + author.email + "</a></code>";
            }
            author_element.append(name_element_string);
        }
        if (author.hasOwnProperty("affiliation")) {
            var current_author_affiliations = author.affiliation.split(";");
            for (var j = 0; j < current_author_affiliations.length; j++) {
                author_element.append("<br />" + current_author_affiliations[j].replace(/@/g, ", ").trim());
            }
        }
        author_element.appendTo(header);
    }
    /* /END List of authors */
    
    /* ACM subjects */
    var categories = $("meta[name='category']");
    if (categories.length > 0) {
        var list_of_categories = $("<p><strong>ACM Subject Categories</strong></p>");
        categories.each(function() {
            list_of_categories.append("<br /><code>" + $(this).attr("content").split(",").join(", ") + "</code>");
        });
        list_of_categories.appendTo(header);
    }
    /* /END ACM subjects */
    
    /* General terms */
    var terms = $("meta[name='generalterm']");
    if (terms.length > 0) {
        var list_of_terms = $("<ul class=\"list-inline\"></ul>");
        terms.each(function() {
            list_of_terms.append("<li><code>" + $(this).attr("content") + "</code></li>");
        });
        $("<p><strong>General Terms</strong></p>").append(list_of_terms).appendTo(header);
    }
    /* /END General terms */
    
    /* Keywords */
    var keywords = $("meta[name='keyword']");
    if (keywords.length > 0) {
        var list_of_keywords = $("<ul class=\"list-inline\"></ul>");
        keywords.each(function() {
            list_of_keywords.append("<li><code>" + $(this).attr("content") + "</code></li>");
        });
        $("<p><strong>Keywords</strong></p>").append(list_of_keywords).appendTo(header);
    }
    /* /END Keywords */
    
    /* Bibliography */
    $(".bibliography ul").replaceWith("<ol>" +$(".bibliography ul").html() + "</ol>");
    /* /END Bibliography */
    
    /* List */
    /* They must be selected in reverse order because of possible conflicts with nested lists */
    $($("ul[type=number]").get().reverse()).each(function(){
        $(this).replaceWith("<ol>" + $(this).html() + "</ol>");
    });
    $($("ul[type=bullet]").get().reverse()).each(function(){
        $(this).replaceWith("<ul>" + $(this).html() + "</ul>");
    });
    /* /END List */
    
    /* Footer */
    var footer = $("<footer class=\"footer hidden-print\"><p>" + 
        "<span>Word count: " + $("body").countWords() + "</span>" +
        "<span>Figures: " + $("body").countElements("div.picture img") + "</span>" +
        "<span>Tables: " + $("body").countElements("table") + "</span>" +
        "<span>Formulas: " + $("body").countElements("div.formula") + "</span>" +
        "</p></footer>");
    footer.appendTo($("body"))
    /* /END Footer */
});