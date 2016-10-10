<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH to LaTeX: block module - Version 0.4, October 24, 2015
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
    xmlns:fo="http://www.w3.org/1999/XSL/Format" 
    xmlns:m="http://www.w3.org/1998/Math/MathML"
    xmlns:f="http://www.essepuntato.it/XSLT/function"
    xmlns:mathml="http://www.w3.org/1998/Math/MathML">
    
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
    
    <xsl:template match="iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-abstract']/iml:p[1]">
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template name="iml:p.cm">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="iml:p[parent::iml:figure and (iml:img or iml:span)]" priority="3">
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="iml:img|iml:span" />
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:p[parent::iml:figure and mathml:math]" priority="3">
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="text()[ancestor::iml:blockquote]">
        <xsl:value-of select="f:replace(replace(.,'&#xa;','&#xa;&#xa;'))" />
    </xsl:template>
    
    <xsl:template match="iml:p[ancestor::iml:ul|ancestor::iml:ol|ancestor::iml:table|ancestor::iml:blockquote|ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-acknowledgements']]">
        <xsl:if test="exists(preceding-sibling::iml:p)">
            <xsl:call-template name="n" />
            <xsl:call-template name="n" />
        </xsl:if>
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="iml:pre">
        <xsl:param name="caption" as="element()?" tunnel="yes" />
        <xsl:param name="id" as="xs:string?" tunnel="yes" />
        <xsl:param name="floating" select="false()" as="xs:boolean" tunnel="yes" />
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{lstlisting}[mathescape</xsl:text>
        <xsl:if test="$floating">
            <xsl:text>, caption=</xsl:text>
            <xsl:value-of select="$caption" />
            <xsl:text>, label=</xsl:text>
            <xsl:value-of select="$id" />
            <xsl:text>, float, floatplacement=H</xsl:text>
        </xsl:if>
        <xsl:text>]</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select=".//text()" />
        </xsl:call-template>
        <xsl:call-template name="n" />
        <xsl:text>\end{lstlisting}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:p[ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-footnotes']]" priority="3">
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
        match="iml:h1[empty(ancestor::iml:section[
                                        some $token in tokenize(@role, ' ') satisfies 
                                        $token = 'doc-abstract' or
                                        $token = 'doc-bibliography' or
                                        $token = 'doc-acknowledgements' or
                                        $token = 'doc-appendix' or
                                        $token = 'doc-footnotes' or
                                        $token = 'doc-footnote'])]">
        <xsl:param name="deep" as="xs:integer" tunnel="yes" />
        <xsl:param name="numbering" as="xs:boolean" tunnel="yes" />
        
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        
        <xsl:variable name="isChapter" as="xs:boolean" select="exists(ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-chapter'])" />
        <xsl:variable name="isAppendix" as="xs:boolean" select="exists(ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-appendix'])" />
        <xsl:variable name="notNumbered" as="xs:boolean" select="exists(ancestor::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'notnumbered'])" />
        
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
        <xsl:if test="not($numbering) or $notNumbered or $isAppendix">
            <xsl:text>*</xsl:text>
        </xsl:if>
        <xsl:text>{</xsl:text>
        <xsl:if test="$isAppendix">
            <xsl:text>Appendix </xsl:text>
            <xsl:value-of select="count(preceding::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-appendix']) + 1" />
            <xsl:text>: </xsl:text>
        </xsl:if>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
        
        <xsl:if test="exists(ancestor::iml:section[1]/@id)">
            <xsl:text>\label{</xsl:text>
            <xsl:value-of select="ancestor::iml:section[1]/@id" />
            <xsl:text>}</xsl:text>
        </xsl:if>
        
        <xsl:if test="$isAppendix">
            <xsl:call-template name="n" />
            <xsl:text>\addcontentsline{toc}{section}{</xsl:text>
            <xsl:value-of select="concat('Appendix ',count(preceding::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-appendix']) + 1),': ',.//text()" separator="" />
            <xsl:text>}</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="iml:figcaption">
        <xsl:call-template name="n" />
        <xsl:text>\cprotect\caption{</xsl:text>
        <xsl:call-template name="next" />
        <xsl:text>}</xsl:text>
    </xsl:template>

</xsl:stylesheet>
