<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH to LaTeX: inline module - Version 0.4, October 25, 2015
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
    
    <xsl:template match="iml:i">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:text>{\em </xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:q">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:text>``</xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
        <xsl:text>''</xsl:text>
    </xsl:template>

    <xsl:template match="iml:a">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:variable name="containsUrl" select="matches(normalize-space(), '^(http|ftp)s?://')" as="xs:boolean" />
        <xsl:choose>
            <xsl:when test="$containsUrl">
                <xsl:text>\url{</xsl:text>
                <xsl:call-template name="next">
                    <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
                </xsl:call-template>
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="next">
                    <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
                </xsl:call-template>
                <xsl:if test="@href and matches(normalize-space(@href), '^(http|ftp)s?://')">
                    <xsl:text>\footnote{\url{</xsl:text>
                    <xsl:call-template name="next">
                        <xsl:with-param name="select" select="@href" />
                    </xsl:call-template>
                    <xsl:text>}}</xsl:text>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="iml:span">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:code[not(parent::iml:pre)]">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:text>\verb+</xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
        <xsl:text>+</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:sub">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:text>\textsubscript{</xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:sup">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:text>\textsuperscript{</xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:b">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:text>{\bf </xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
        <xsl:text>}</xsl:text>
    </xsl:template>
</xsl:stylesheet>
