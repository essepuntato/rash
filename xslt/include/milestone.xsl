<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH to LaTeX: milestone module - Version 0.4, October 25, 2015
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
    xmlns:fo="http://www.w3.org/1999/XSL/Format">
    
    <xsl:import href="named_templates.xsl"/>
    
    <xsl:output 
        encoding="UTF-8"
        method="text"
        indent="no" />
    <xsl:strip-space elements="*"/>
    
    <xsl:template match="iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-noteref']">
        <xsl:variable name="curID" select="substring-after(@href, '#')" as="xs:string" />
        
        <xsl:if test="
            preceding::node()[self::element() or (self::text() and normalize-space() != '')][1]
            [
                not(self::text()) and 
                not(self::a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-noteref'])]">
            <xsl:text>\textsuperscript{,}</xsl:text>
        </xsl:if>
        
        <xsl:text>\footnote{</xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="//iml:section[@id = $curID]/element()" />
        </xsl:call-template>
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-index']">
        <xsl:text>\index{</xsl:text>
        <xsl:value-of select="@name" />
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-biblioref']">
        <xsl:param name="id-for-refs" as="xs:string?" tunnel="yes" />
        
        <xsl:variable name="curID" select="substring-after(@href, '#')" as="xs:string" />
        <xsl:variable name="el" select="//element()[@id = $curID][1]" as="element()*" />
        <xsl:choose>
            <xsl:when test="exists($el)">
                <xsl:text> \cite{</xsl:text>
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
    
    <xsl:template match="iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'ref']">
        <xsl:param name="id-for-refs" as="xs:string?" tunnel="yes" />
        
        <xsl:variable name="curID" select="substring-after(@href, '#')" as="xs:string" />
        <xsl:variable name="el" select="//element()[@id = $curID][1]" as="element()*" />
        <xsl:choose>
            <xsl:when test="exists($el)">
                <xsl:call-template name="make.ref">
                    <xsl:with-param name="id" select="$curID" as="xs:string" />
                    <xsl:with-param name="el" select="$el" as="element()" />
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>NOREF[</xsl:text>
                <xsl:value-of select="@href" />
                <xsl:text>]</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="iml:img">
        <xsl:call-template name="create.img">
            <xsl:with-param name="max" select="'\textwidth'" as="xs:string"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template name="create.img">
        <xsl:param name="max" select="'\textwidth'" as="xs:string" />
        <xsl:text>\includegraphics[width=\maxwidth{</xsl:text>
        <xsl:value-of select="$max" />
        <xsl:text>}]{</xsl:text>
        <xsl:value-of select="@src" />
        <xsl:text>}</xsl:text>
    </xsl:template>
</xsl:stylesheet>
