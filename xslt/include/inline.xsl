<?xml version="1.0" encoding="UTF-8"?>
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
        <xsl:if test="$containsUrl">
            <xsl:text>\url{</xsl:text>    
        </xsl:if>
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
        <xsl:if test="$containsUrl">
            <xsl:text>}</xsl:text>    
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="iml:span">
        <!--<xsl:call-template name="add.space" />-->
        <xsl:call-template name="next">
            <xsl:with-param name="isInline" as="xs:boolean" select="true()" />
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:span[some $token in tokenize(@class, ' ') satisfies $token = 'code']">
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
