<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH update XSLT file - Version 0.5, February 17, 2016
by Silvio Peroni

This work is licensed under a Creative Commons Attribution 4.0 International License (http://creativecommons.org/licenses/by/4.0/).
You are free to:
* Share - copy and redistribute the material in any medium or format
* Adapt - remix, transform, and build upon the material
for any purpose, even commercially.

The licensor cannot revoke these freedoms as long as you follow the license terms.

Under the following terms:
* Attribution - You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns="http://www.w3.org/1999/xhtml"
    xpath-default-namespace="http://www.w3.org/1999/xhtml"
    exclude-result-prefixes="xs xd"
    version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Oct 18, 2015</xd:p>
            <xd:p><xd:b>Last modified on:</xd:b> Feb 17, 2016</xd:p>
            <xd:p><xd:b>Author:</xd:b> Silvio Peroni</xd:p>
            <xd:p>This XSLT document allows one to update the RASH version (starting from version 0.3.5) of a given document into the earliest available version of the language (0.5).</xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:output encoding="UTF-8" indent="no" method="xml" cdata-section-elements="script" />
    
    <!-- 
        From 0.3.5 to last version (0.5)
    -->
    
    <!-- head with no MathJax -> head/script for MathJax -->
    <xsl:template match="head[every $s in script/@src satisfies not(contains($s, 'MathJax.js?config=TeX-AMS-MML_HTMLorMML'))]">
        <head>
            <xsl:call-template name="copy-no-class" />
            <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
                <xsl:text> </xsl:text>
            </script>
        </head>
    </xsl:template>
    
    <!-- div[@class = 'abstract'] -> section[@role = 'doc-abstract'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'abstract') > 0]">
        <section>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'abstract'" />
                <xsl:with-param name="role" select="'doc-abstract'" />
            </xsl:call-template>
        </section>
    </xsl:template>
    
    <!-- div[@class = 'acknowledgements'] -> section[@role = 'doc-acknowledgements'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'acknowledgements') > 0]">
        <section>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'acknowledgements'" />
                <xsl:with-param name="role" select="'doc-acknowledgements'" />
            </xsl:call-template>
        </section>
    </xsl:template>
    
    <!-- div[@class = 'footnotes'] -> section[@role = 'doc-footnotes'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'footnotes') > 0]">
        <section>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'footnotes'" />
                <xsl:with-param name="role" select="'doc-footnotes'" />
            </xsl:call-template>
        </section>
    </xsl:template>
    
    <!-- div[@class = 'footnotes']/div -> section[@role = 'doc-footnote'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'footnotes') > 0]/div">
        <section>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="role" select="'doc-footnote'" />
            </xsl:call-template>
        </section>
    </xsl:template>
    
    <!-- div[@class = 'bibliography'] -> section[@role = 'doc-bibliography'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'bibliography') > 0]">
        <section>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'bibliography'" />
                <xsl:with-param name="role" select="'doc-bibliography'" />
            </xsl:call-template>
        </section>
    </xsl:template>
    
    <!-- div[@class = 'bibliography']//li/p -> p[@role = 'doc-biblioentry'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'bibliography') > 0]//li">
        <li>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="role" select="'doc-biblioentry'" />
            </xsl:call-template>
        </li>
    </xsl:template>
    
    <!-- div[@class = 'section'] -> section -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'section') > 0]">
        <section>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'section'" />
            </xsl:call-template>
        </section>
    </xsl:template>
    
    <!-- p[@class = 'quote'] -> blockquote + p -->
    <xsl:template match="p[index-of(tokenize(@class, ' '), 'quote') > 0]">
        <blockquote>
            <xsl:call-template name="copy-attrs-no-class">
                <xsl:with-param name="class" select="'quote'" />
            </xsl:call-template>
            <p>
                <xsl:apply-templates />
            </p>
        </blockquote>
    </xsl:template>
    
    <!-- p[@class = 'code'] -> pre + code -->
    <xsl:template match="p[index-of(tokenize(@class, ' '), 'code') > 0]">
        <pre>
            <xsl:call-template name="copy-attrs-no-class">
                <xsl:with-param name="class" select="'code'" />
            </xsl:call-template>
            <code><xsl:apply-templates /></code>
        </pre>
    </xsl:template>
    
    <!-- p[@class = 'img_block'] -> p -->
    <xsl:template match="p[index-of(tokenize(@class, ' '), 'img_block') > 0]">
        <p>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'img_block'" />
            </xsl:call-template>
        </p>
    </xsl:template>
    
    <!-- p[@class = 'math_block'] -> p -->
    <xsl:template match="p[index-of(tokenize(@class, ' '), 'math_block') > 0]">
        <p>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'math_block'" />
            </xsl:call-template>
        </p>
    </xsl:template>
    
    <!-- span[@class = 'code'] -> code -->
    <xsl:template match="span[index-of(tokenize(@class, ' '), 'code') > 0]">
        <code>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'code'" />
            </xsl:call-template>
        </code>
    </xsl:template>
    
    <!-- div[@class = 'formula'] -> figure[@role = 'formulabox'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'formula') > 0]">
        <figure>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'formula'" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <!-- figure[@role = 'formulabox'] -> figure -->
    <xsl:template match="figure[index-of(tokenize(@role, ' '), 'formulabox') > 0]">
        <figure>
            <xsl:call-template name="copy-no-class-no-role">
                <xsl:with-param name="role" select="'formulabox'" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <!-- (div[@class = 'formula']|figure[@role = 'formulabox'])/p/img -> img[@role = 'math'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'formula') > 0]/p/img | figure[index-of(tokenize(@role, ' '), 'formulabox') > 0]/p/img">
        <img>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="role" select="'math'" />
            </xsl:call-template>
        </img>
    </xsl:template>
    
    <!-- div[@class = 'picture'] -> figure[@role = 'picturebox'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'picture') > 0]">
        <figure>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'picture'" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <!-- figure[@role = 'picturebox'] -> figure -->
    <xsl:template match="figure[index-of(tokenize(@role, ' '), 'picturebox') > 0]">
        <figure>
            <xsl:call-template name="copy-no-class-no-role">
                <xsl:with-param name="class" select="'picturebox'" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <!-- div[@class = 'table'] -> figure[@role = 'tablebox'] -->
    <xsl:template match="div[index-of(tokenize(@class, ' '), 'table') > 0]">
        <figure>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'table'" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <!-- figure[@role = 'tablebox'] -> figure -->
    <xsl:template match="figure[index-of(tokenize(@role, ' '), 'tablebox') > 0]">
        <figure>
            <xsl:call-template name="copy-no-class-no-role">
                <xsl:with-param name="role" select="'tablebox'" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <!-- figure[@role = 'listingbox'] -> figure -->
    <xsl:template match="figure[index-of(tokenize(@role, ' '), 'listingbox') > 0]">
        <figure>
            <xsl:call-template name="copy-no-class-no-role">
                <xsl:with-param name="role" select="'listingbox'" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <!-- p[@class = 'caption'] -> figcaption -->
    <xsl:template match="p[index-of(tokenize(@class, ' '), 'caption') > 0]">
        <figcaption>
            <xsl:call-template name="copy-no-class">
                <xsl:with-param name="class" select="'caption'" />
            </xsl:call-template>
        </figcaption>
    </xsl:template>
    
    <!-- a[@class = 'footnote'] -> a[@role = 'doc-noteref'] -->
    <xsl:template match="a[index-of(tokenize(@class, ' '), 'footnote') > 0]">
        <a>
            <xsl:call-template name="copy-attrs-no-class">
                <xsl:with-param name="class" select="'footnote'" />
            </xsl:call-template>
            <xsl:text> </xsl:text>
        </a>
    </xsl:template>
    
    <!-- a[@role = 'doc-noteref'] -> a -->
    <xsl:template match="a[index-of(tokenize(@role, ' '), 'doc-noteref') > 0]">
        <a>
            <xsl:call-template name="copy-attrs-no-class-no-role">
                <xsl:with-param name="role" select="'doc-noteref'" />
            </xsl:call-template>
            <xsl:text> </xsl:text>
        </a>
    </xsl:template>
    
    <!-- a[@class = 'ref']//->to biblio -> a[@role = 'doc-biblioref'] -->
    <xsl:template match="a[index-of(tokenize(@class, ' '), 'ref') > 0][some $item in //(div[index-of(tokenize(@class, ' '), 'bibliography') > 0]|section[index-of(tokenize(@role, ' '), 'doc-bibliography') > 0])//li/@id satisfies concat('#', $item) = @href]" priority="3">
        <a>
            <xsl:call-template name="copy-attrs-no-class">
                <xsl:with-param name="class" select="'ref'" />
            </xsl:call-template>
            <xsl:text> </xsl:text>
        </a>
    </xsl:template>
    
    <!-- a[@role = 'doc-biblioref'] -> a -->
    <xsl:template match="a[index-of(tokenize(@role, ' '), 'doc-biblioref') > 0]">
        <a>
            <xsl:call-template name="copy-attrs-no-class-no-role">
                <xsl:with-param name="role" select="'doc-biblioref'" />
            </xsl:call-template>
            <xsl:text> </xsl:text>
        </a>
    </xsl:template>
    
    <!-- a[@class = 'ref']//->to any other object -> a[@role = 'ref'] -->
    <xsl:template match="a[index-of(tokenize(@class, ' '), 'ref') > 0]">
        <a>
            <xsl:call-template name="copy-attrs-no-class">
                <xsl:with-param name="class" select="'ref'" />
            </xsl:call-template>
            <xsl:text> </xsl:text>
        </a>
    </xsl:template>
    
    <!-- a[@role = 'ref'] -> a -->
    <xsl:template match="a[index-of(tokenize(@role, ' '), 'ref') > 0]">
        <a>
            <xsl:call-template name="copy-attrs-no-class-no-role">
                <xsl:with-param name="role" select="'ref'" />
            </xsl:call-template>
            <xsl:text> </xsl:text>
        </a>
    </xsl:template>
    
    <!-- (i|b|a|sup|sub|q)[@class = 'code'] -> code -->
    <xsl:template match="i|b|a|sup|sub|q">
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="index-of(tokenize(@class, ' '), 'code') > 0">
                    <code>
                        <xsl:call-template name="copy-no-class">
                            <xsl:with-param name="class" select="'code'" />
                        </xsl:call-template>
                    </code>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates select="@*|node()"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template>
    
    <!-- @class with remove value -->
    <xsl:template match="@class" mode="remove-value">
        <xsl:param name="class" as="xs:string?" />
        <xsl:if test="$class">
            <xsl:variable name="values" select="tokenize(., ' ')" as="xs:string*" />
            <xsl:variable name="values-no-class" select="remove($values, index-of($values, $class))" as="xs:string*" />
            <xsl:if test="$values-no-class">
                <xsl:attribute name="class">
                    <xsl:value-of select="$values-no-class" separator=" " />
                </xsl:attribute>
            </xsl:if>
        </xsl:if>
    </xsl:template>
    
    <!-- @role with remove value -->
    <xsl:template match="@role" mode="remove-value">
        <xsl:param name="role" as="xs:string?" />
        <xsl:if test="role">
            <xsl:variable name="values" select="tokenize(., ' ')" as="xs:string*" />
            <xsl:variable name="values-no-role" select="remove($values, index-of($values, $role))" as="xs:string*" />
            <xsl:if test="$values-no-role">
                <xsl:attribute name="role">
                    <xsl:value-of select="$values-no-role" separator=" " />
                </xsl:attribute>
            </xsl:if>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="script[normalize-space() = '']">
        <script>
            <xsl:call-template name="copy-attrs-no-class" />
            <xsl:text> </xsl:text>
        </script>
    </xsl:template>
    
    <!-- Identity template -->
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    
    <!-- Named templates -->
    <xsl:template name="copy-no-class-no-role">
        <xsl:param name="class" as="xs:string?" />
        <xsl:param name="role" as="xs:string?" />
        <xsl:call-template name="copy-attrs-no-class-no-role">
            <xsl:with-param name="class" select="$class" />
            <xsl:with-param name="role" select="$role" />
        </xsl:call-template>
        <xsl:apply-templates />
    </xsl:template>
    
    <xsl:template name="copy-attrs-no-class-no-role">
        <xsl:param name="class" as="xs:string?" />
        <xsl:param name="role" as="xs:string?" />
        <xsl:apply-templates select="@* except (@class union @role)"/>
        <xsl:apply-templates select="@class" mode="remove-value">
            <xsl:with-param name="class" select="$class" />
        </xsl:apply-templates>
        <xsl:apply-templates select="@role" mode="remove-value">
            <xsl:with-param name="role" select="$role" />
        </xsl:apply-templates>
    </xsl:template>
    
    <xsl:template name="copy-no-class">
        <xsl:param name="class" as="xs:string?" />
        <xsl:param name="role" as="xs:string?" />
        <xsl:call-template name="copy-attrs-no-class">
            <xsl:with-param name="class" select="$class" />
            <xsl:with-param name="role" select="$role" />
        </xsl:call-template>
        <xsl:apply-templates />
    </xsl:template>
    
    <xsl:template name="copy-attrs-no-class">
        <xsl:param name="class" as="xs:string?" />
        <xsl:param name="role" as="xs:string?" />
        <xsl:apply-templates select="@* except (@class union @role)"/>
        <xsl:apply-templates select="@class" mode="remove-value">
            <xsl:with-param name="class" select="$class" />
        </xsl:apply-templates>
        <xsl:call-template name="handle-role">
            <xsl:with-param name="role" select="$role" />
        </xsl:call-template>
    </xsl:template>
    
    <!-- @role update -->
    <xsl:template name="handle-role">
        <xsl:param name="role" as="xs:string?" />
        <xsl:if test="$role">
            <xsl:variable name="values" select="tokenize(@role, ' ')" as="xs:string*" />
            <xsl:attribute name="role">
                <xsl:value-of select="$values, $role" separator=" " />
            </xsl:attribute>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>