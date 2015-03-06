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
        <xsl:call-template name="add.space" />
        <xsl:text>{\em </xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:q">
        <xsl:call-template name="add.space" />
        <xsl:text>“</xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>”</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:a">
        <xsl:call-template name="add.space" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="iml:span">
        <xsl:call-template name="add.space" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="iml:span[some $token in tokenize(@class, ' ') satisfies $token = 'code']">
        <xsl:call-template name="add.space" />
        <xsl:text>\verb+</xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>+</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:span[some $token in tokenize(@class, ' ') satisfies $token = 'sub']">
        <xsl:call-template name="add.space" />
        <xsl:text>\textsubscript{</xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:span[some $token in tokenize(@class, ' ') satisfies $token = 'sup']">
        <xsl:call-template name="add.space" />
        <xsl:text>\textsuperscript{</xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:b">
        <xsl:call-template name="add.space" />
        <xsl:text>{\bf </xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:a[some $token in tokenize(@class, ' ') satisfies $token = 'footnote']">
        <xsl:variable name="curID" select="substring-after(@href, '#')" as="xs:string" />
        <xsl:text>\footnote{</xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="//iml:div[@id = $curID]/element()" />
        </xsl:call-template>
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:a[some $token in tokenize(@class, ' ') satisfies $token = 'index']">
        <xsl:text>\index{</xsl:text>
        <xsl:value-of select="@name" />
        <xsl:text>}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:a[some $token in tokenize(@class, ' ') satisfies $token = 'ref']">
        <xsl:param name="id-for-refs" as="xs:string?" tunnel="yes" />
        
        <xsl:variable name="curID" select="substring-after(@href, '#')" as="xs:string" />
        <xsl:variable name="el" select="//element()[@id = $curID][1]" as="element()*" />
        <xsl:choose>
            <xsl:when test="exists($el)">
                <xsl:choose>
                    <xsl:when test="$el/ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'bibliography']">
                        <xsl:text> \cite{</xsl:text>
                        <xsl:value-of select="if ($id-for-refs) then concat($id-for-refs,'-',$curID) else $curID" />
                        <xsl:text>}</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="make.ref">
                            <xsl:with-param name="id" select="$curID" as="xs:string" />
                            <xsl:with-param name="el" select="$el" as="element()" />
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>NOREF[</xsl:text>
                <xsl:value-of select="@href" />
                <xsl:text>]</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
