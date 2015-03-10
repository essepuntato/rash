<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
    xmlns:iml="http://www.w3.org/1999/xhtml"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:fo="http://www.w3.org/1999/XSL/Format" 
    xmlns:m="http://www.w3.org/1998/Math/MathML"
    xmlns:f="http://www.essepuntato.it/XSLT/fuction">
    
    <xsl:import href="named_templates.xsl"/>
    <xsl:import href="mathml.xsl"/>
    
    <xsl:output 
        encoding="UTF-8"
        method="text"
        indent="no" />
    <xsl:strip-space elements="*"/>
    
    <xsl:template match="iml:p">
        <xsl:call-template name="iml:p.cm" />
    </xsl:template>
    
    <xsl:template match="iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'abstract']/iml:p[1]">
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template name="iml:p.cm">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="iml:p[some $token in tokenize(@class, ' ') satisfies $token = 'quote']" priority="1.2">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{quote}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{quote}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:p[some $token in tokenize(@class, ' ') satisfies $token = 'img_block']" priority="1.2">
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="iml:img" />
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:p[some $token in tokenize(@class, ' ') satisfies $token = 'math_block']" priority="1.2">
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="text()[ancestor::iml:p[some $token in tokenize(@class, ' ') satisfies $token = 'quote']]">
        <xsl:value-of select="f:replace(replace(.,'&#xa;','&#xa;&#xa;'))" />
    </xsl:template>
    
    <xsl:template match="iml:p[exists(ancestor::iml:ul|ancestor::iml:ol|ancestor::iml:table|ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'acknowledgements'])]">
        <xsl:if test="exists(preceding-sibling::iml:p)">
            <xsl:call-template name="n" />
            <xsl:call-template name="n" />
        </xsl:if>
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="iml:p[some $token in tokenize(@class, ' ') satisfies $token = 'code']">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{lstlisting}[mathescape]</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select=".//text()" />
        </xsl:call-template>
        <xsl:call-template name="n" />
        <xsl:text>\end{lstlisting}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:p[ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'footnotes']]">
        <xsl:choose>
            <xsl:when test="empty(preceding-sibling::iml:p)">
                <xsl:call-template name="next" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="iml:p.cm" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template 
        match="iml:h1[empty(ancestor::iml:div[
                                        some $token in tokenize(@class, ' ') satisfies 
                                        $token = 'abstract' or
                                        $token = 'bibliography' or
                                        $token = 'acknowledgements' or
                                        $token = 'preface' or
                                        $token = 'foreword' or
                                        $token = 'biography'])]">
        <xsl:param name="deep" as="xs:integer" tunnel="yes" />
        
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        
        <xsl:variable name="isChapter" as="xs:boolean" select="exists(ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'chapter'])" />
        <xsl:variable name="isAppendix" as="xs:boolean" select="exists(ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'appendix'])" />
        <xsl:variable name="notNumbered" as="xs:boolean" select="exists(ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'notnumbered'])" />
        
        <xsl:choose>
            <xsl:when test="$deep = 1">
                <xsl:choose>
                    <xsl:when test="$isChapter or $isAppendix">
                        <xsl:text>\chapter</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>\section</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:when test="$deep = 2">
                <xsl:choose>
                    <xsl:when test="$isChapter">
                        <xsl:text>\section</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>\subsection</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:when test="$deep = 3">
                <xsl:choose>
                    <xsl:when test="$isChapter">
                        <xsl:text>\subsection</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>\subsubsection</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:when test="$deep = 4">
                <xsl:choose>
                    <xsl:when test="$isChapter">
                        <xsl:text>\subsubsection</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>\subsubsubsection</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
        </xsl:choose>
        <xsl:if test="$notNumbered or $isAppendix">
            <xsl:text>*</xsl:text>
        </xsl:if>
        <xsl:text>{</xsl:text>
        <xsl:if test="$isAppendix">
            <xsl:text>Appendix </xsl:text>
            <xsl:value-of select="count(preceding::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'appendix']) + 1" />
            <xsl:text>: </xsl:text>
        </xsl:if>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
        
        <xsl:if test="exists(ancestor::iml:div[1]/@id)">
            <xsl:text>\label{</xsl:text>
            <xsl:value-of select="ancestor::iml:div[1]/@id" />
            <xsl:text>}</xsl:text>
        </xsl:if>
        
        <xsl:if test="$isAppendix">
            <xsl:call-template name="n" />
            <xsl:text>\addcontentsline{toc}{section}{</xsl:text>
            <xsl:value-of select="concat('Appendix ',count(preceding::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'appendix']) + 1),': ',.//text()" separator="" />
            <xsl:text>}</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="iml:p[some $token in tokenize(@class, ' ') satisfies $token = 'caption']">
        <xsl:call-template name="n" />
        <xsl:text>\caption{</xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
    </xsl:template>

</xsl:stylesheet>
