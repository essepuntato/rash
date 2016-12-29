<?xml version="1.0" encoding="UTF-8"?>
<!-- 
From RASH to PeerJ LaTeX style XSLT transformation file - Version 1.1, December 24, 2016
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
        <!-- uses \documentclass[fleqn,10pt,lineno]{wlpeerj} % for journal submissions -->
        <xsl:text>\documentclass[fleqn,10pt]{wlpeerj}</xsl:text>
        <xsl:call-template name="standard_packages" />
        <xsl:call-template name="url" />
        <xsl:call-template name="verbatim_text" />
        <xsl:call-template name="footnote_verb" />
        <xsl:call-template name="graphics" />
        <xsl:call-template name="amsmath" />
        <xsl:call-template name="greek" />
        
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{subscript}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\lstset{breaklines=true, basicstyle=\scriptsize\ttfamily}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        
        <xsl:apply-templates select="//iml:head">
            <!-- Defalut values -->
            <xsl:with-param name="lang" select="'en-s'" as="xs:string" tunnel="yes" />
            <xsl:with-param name="document.lang" select="if (exists(/element()[@xml:lang])) then /element()/@xml:lang else 'en-s'" tunnel="yes" />
            <xsl:with-param name="type" select="'bullet'" as="xs:string" tunnel="yes" />
            <xsl:with-param name="deep" select="0" as="xs:integer" tunnel="yes" />
            <xsl:with-param name="all.languages" select="$v_all.languages" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="img.content.width" select="$img.content.width" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="img.default.width" select="$img.default.width" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="bibtex" select="$bibtex" as="xs:boolean" tunnel="yes" />
            <xsl:with-param name="numbering" select="false()" as="xs:boolean" tunnel="yes" />
        </xsl:apply-templates>
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{document}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\flushbottom</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\maketitle</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\thispagestyle{empty}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        
        <xsl:apply-templates select="//iml:body">
            <!-- Defalut values -->
            <xsl:with-param name="lang" select="'en-s'" as="xs:string" tunnel="yes" />
            <xsl:with-param name="document.lang" select="if (exists(/element()[@xml:lang])) then /element()/@xml:lang else 'en-s'" tunnel="yes" />
            <xsl:with-param name="type" select="'bullet'" as="xs:string" tunnel="yes" />
            <xsl:with-param name="deep" select="0" as="xs:integer" tunnel="yes" />
            <xsl:with-param name="all.languages" select="$v_all.languages" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="img.content.width" select="$img.content.width" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="img.default.width" select="$img.default.width" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="bibtex" select="$bibtex" as="xs:boolean" tunnel="yes" />
            <xsl:with-param name="numbering" select="false()" as="xs:boolean" tunnel="yes" />
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
        <xsl:call-template name="n" />
        
        <xsl:variable name="affiliations" select="distinct-values(for $aff in iml:link[@property = 'schema:affiliation']/@href return iml:meta[@about = $aff]/@content)" as="xs:string*" />
        <xsl:variable name="authors" select="iml:meta[@name='dc.creator']" as="element()*" />
        
        <!-- Authors -->
        <xsl:for-each select="$authors">
            <xsl:call-template name="n" />
            <xsl:variable name="position" as="xs:integer" select="position()" />
            <xsl:text>\author[</xsl:text><xsl:value-of select="$position" /><xsl:text>]{</xsl:text>
            <xsl:value-of select="@content" />
            <xsl:text>}</xsl:text>
        </xsl:for-each>
        <xsl:call-template name="n" />
        <!-- Affiliation -->
        <xsl:for-each select="$authors">
            <xsl:call-template name="n" />
            <xsl:variable name="position" as="xs:integer" select="position()" />
            <xsl:variable name="curId" as="xs:string" select="@about"/>
            
            <xsl:text>\affil[</xsl:text><xsl:value-of select="$position" /><xsl:text>]{</xsl:text>
            <xsl:for-each select="
                for $affId in ../iml:link[@property='schema:affiliation' and @about=$curId]/@href 
                return ../iml:meta[@about = $affId]">
                <xsl:value-of select="@content" />
                <xsl:if test="position() != last()">
                    <xsl:text>; </xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:text>}</xsl:text>
        </xsl:for-each>
        
        <!-- E-mail corresponding author -->
        <xsl:call-template name="n" />
        <xsl:text>\corrauthor[1]{</xsl:text>
        <xsl:value-of select="$authors[1]/@content" /><xsl:text>}</xsl:text>
        <xsl:text>{</xsl:text><xsl:value-of select="iml:meta[@about = $authors[1]/@about and @property = 'schema:email']/@content" /><xsl:text>}</xsl:text>
        
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
        <xsl:text>\begin{enumerate}[noitemsep]</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{enumerate}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:ul[empty(ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography'])]" priority="3.0">
        <xsl:call-template name="n" />
        <xsl:text>\begin{itemize}[noitemsep]</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{itemize}</xsl:text>
    </xsl:template>
    
    <xsl:template match="element()[iml:li[@role = 'doc-biblioentry']][parent::iml:section[@role = 'doc-bibliography']]" priority="1.7">
        <xsl:for-each select="iml:li">
            <xsl:sort data-type="text" select="lower-case(string-join(iml:p//text(),''))" />
            <xsl:call-template name="handling-reference" />
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template match="iml:a[@href and normalize-space() = ''][some $id in substring-after(@href, '#') satisfies exists(//iml:li[@id = $id][some $token in tokenize(@role, ' ') satisfies $token = 'doc-biblioentry'])]" priority="5">
        <xsl:param name="id-for-refs" as="xs:string?" tunnel="yes" />
        
        <xsl:variable name="curID" select="substring-after(@href, '#')" as="xs:string" />
        <xsl:variable name="el" select="//element()[@id = $curID][1]" as="element()*" />
        <xsl:choose>
            <xsl:when test="exists($el)">
                <xsl:text> \citep{</xsl:text>
                <xsl:value-of select="if ($id-for-refs) then concat($id-for-refs,'-',$curID) else $curID" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>NOREF[</xsl:text>
                <xsl:value-of select="@href" />
                <xsl:text>]</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="element()" />
</xsl:stylesheet>
