<?xml version="1.0" encoding="UTF-8"?>
<!-- 
From RASH to Springer LNCS LaTeX style XSLT transformation file - Version 1.2, December 24, 2016
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
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
    xmlns:iml="http://www.w3.org/1999/xhtml"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:f="http://www.essepuntato.it/XSLT/function"
    exclude-result-prefixes="iml xs f">
    
    <xsl:include href="include/container.xsl"/>
    <xsl:include href="include/block.xsl"/>
    <xsl:include href="include/milestone.xsl"/>
    <xsl:include href="include/inline.xsl"/>
    <xsl:include href="include/table.xsl"/>
    <xsl:include href="include/named_templates.xsl"/>
    
    <xsl:output 
        encoding="UTF-8"
        method="text"
        indent="no" />
    <xsl:strip-space elements="*"/>
    
    <!-- Template for possible languages -->
    <xsl:variable name="v_all.languages" select="('it','en','en-s')" as="xs:string*" />
    
    <!-- Variables of the maximum size for images (instable) -->
    <xsl:variable name="img.content.width" select="'15cm'" as="xs:string" />
    <xsl:variable name="img.default.width" select="'14cm'" as="xs:string" />
    
    <!-- Variable specifying if BibTeX should be used (instable) -->
    <xsl:param name="bibtex" select="false()" as="xs:boolean" />
    
    <!-- Main template -->
    <xsl:template match="/">
        <!-- LaTeX style -->
        <xsl:text>\documentclass[runningheads,a4paper]{llncs}</xsl:text>
        <xsl:call-template name="standard_packages" />
        <xsl:call-template name="url" />
        <xsl:call-template name="verbatim_text" />
        <xsl:call-template name="footnote_verb" />
        <xsl:call-template name="graphics" />
        <xsl:call-template name="mathml" />
        <xsl:call-template name="greek" />
        
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{subscript}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\lstset{breaklines=true, basicstyle=\scriptsize\ttfamily}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{document}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\mainmatter</xsl:text>
        <xsl:call-template name="n" />
        
        <xsl:call-template name="n" />
        
        <xsl:apply-templates select="element()">
            <!-- Defalut values -->
            <xsl:with-param name="lang" select="'en-s'" as="xs:string" tunnel="yes" />
            <xsl:with-param name="document.lang" select="if (exists(/element()[@xml:lang])) then /element()/@xml:lang else 'en-s'" tunnel="yes" />
            <xsl:with-param name="type" select="'bullet'" as="xs:string" tunnel="yes" />
            <xsl:with-param name="deep" select="0" as="xs:integer" tunnel="yes" />
            <xsl:with-param name="all.languages" select="$v_all.languages" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="img.content.width" select="$img.content.width" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="img.default.width" select="$img.default.width" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="bibtex" select="$bibtex" as="xs:boolean" tunnel="yes" />
            <xsl:with-param name="numbering" select="true()" as="xs:boolean" tunnel="yes" />
        </xsl:apply-templates>
        
        <xsl:call-template name="n" />
        <xsl:text>\end{document}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:head" priority="0.7">
        <xsl:variable name="titlestr" as="xs:string" select="iml:title" />
        <xsl:text>\title{</xsl:text>
        <xsl:value-of select="$titlestr"/>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        
        <xsl:if test="string-length($titlestr) > 40">
            <xsl:text>\titlerunning{</xsl:text>
            <xsl:choose>
                <xsl:when test="contains($titlestr, ':')">
                    <xsl:value-of select="substring(substring-before($titlestr,':'), 0, 40)" />
                </xsl:when>
                <xsl:when test="contains($titlestr, '-')">
                    <xsl:value-of select="substring(substring-before($titlestr,'-'), 0, 40)" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="substring($titlestr, 0, 40)" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:text>}</xsl:text>
        </xsl:if>
        <xsl:call-template name="n" />
        
        <xsl:variable name="affiliations" select="distinct-values(for $aff in iml:link[@property = 'schema:affiliation']/@href return iml:meta[@about = $aff]/@content)" as="xs:string*" />
        <xsl:variable name="authors" select="iml:meta[@name='dc.creator']" as="element()*" />
        
        <!-- Authors -->
        <xsl:text>\author{</xsl:text>
        <xsl:for-each select="$authors">
            <xsl:variable name="curId" as="xs:string" select="@about"/>
            
            <xsl:value-of select="@content" />
            <xsl:text>\inst{</xsl:text>
                <xsl:for-each select="for $aff in ../iml:link[@property = 'schema:affiliation' and @about = $curId]/@href return ../iml:meta[@about = $aff]/@content">
                    <xsl:value-of select="index-of($affiliations, .)" />
                    <xsl:if test="position() != last()">
                        <xsl:text>,</xsl:text>
                    </xsl:if>
                </xsl:for-each>
            <xsl:text>}</xsl:text>
            
            <xsl:if test="position() != last()">
                <xsl:text> \and</xsl:text>
                <xsl:call-template name="n" />
            </xsl:if>
        </xsl:for-each>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:if test="count($authors) > 2">
            <xsl:text>\authorrunning{</xsl:text>
            <xsl:value-of select="$authors[1]/@content" />
            <xsl:text> et al.</xsl:text>
            <xsl:text>}</xsl:text>
        </xsl:if>
        
        <xsl:call-template name="n" />
        <xsl:text>\institute{</xsl:text>
        <!-- Affiliation -->
        <xsl:for-each select="$affiliations">
            <xsl:value-of select="." />
            <xsl:if test="position() != last()">
                <xsl:text>\and</xsl:text>
                <xsl:call-template name="n" />
            </xsl:if>
        </xsl:for-each>
        
        <!-- E-mail -->
        <xsl:text>\\</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\email{</xsl:text>
        <xsl:for-each select="iml:meta[@property = 'schema:email']/@content">
            <xsl:value-of select="." />
            <xsl:if test="position() != last()">
                <xsl:text>, </xsl:text>
                <xsl:call-template name="n" />
            </xsl:if>
        </xsl:for-each>
        <xsl:text>}}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:text>\maketitle</xsl:text>
        
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="//iml:body/iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-abstract']"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-abstract']" priority="3.0">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{abstract}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <!-- Add keywords -->
        <xsl:if test="exists(//iml:meta[@property = 'prism:keyword'])">
            <xsl:call-template name="n" />
            <xsl:text>\keywords{</xsl:text>
            <xsl:for-each select="//iml:meta[@property = 'prism:keyword']">
                <xsl:sort select="@content" data-type="text"/>
                <xsl:value-of select="@content"/>
                <xsl:if test="position() != last()">
                    <xsl:text>, </xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:text>}</xsl:text>
            <xsl:call-template name="n" />
        </xsl:if>
        <xsl:text>\end{abstract}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:body" priority="3.0">
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="element()[every $token in tokenize(@role, ' ') satisfies $token != 'doc-endnotes' and $token != 'doc-abstract']|text()" />
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:ol[empty(ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography'])]" priority="3.0">
        <xsl:call-template name="n" />
        <xsl:text>\begin{enumerate}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{enumerate}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:ul[empty(ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography'])]" priority="3.0">
        <xsl:call-template name="n" />
        <xsl:text>\begin{itemize}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{itemize}</xsl:text>
    </xsl:template>
    
    <xsl:template match="element()" />
</xsl:stylesheet>
