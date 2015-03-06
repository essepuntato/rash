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
    
    <xsl:template match="iml:img">
        <xsl:call-template name="create.img">
            <xsl:with-param name="max" select="'\textwidth'" as="xs:string"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template name="create.img">
        <xsl:param name="max" select="'\textwidth'" as="xs:string" />
        <xsl:text>\includegraphics[\maxwidth={</xsl:text>
        <xsl:value-of select="$max" />
        <xsl:text>}]{</xsl:text>
        <xsl:value-of select="@src" />
        <xsl:text>}</xsl:text>
    </xsl:template>
</xsl:stylesheet>
