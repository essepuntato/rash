<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH to LaTeX: container module - Version 0.6, December 24, 2016
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
<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:iml="http://www.w3.org/1999/xhtml" 
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:fo="http://www.w3.org/1999/XSL/Format" 
    xmlns:f="http://www.essepuntato.it/XSLT/function"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:mathml="http://www.w3.org/1998/Math/MathML">

    <xsl:import href="named_templates.xsl"/>

    <xsl:output 
        encoding="UTF-8"
        method="text"
        indent="no" />
    <xsl:strip-space elements="*"/>

    <xsl:template match="iml:html">
        <xsl:apply-templates select="iml:head"/>
        
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="iml:body"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:head">
        <xsl:call-template name="document_title" />
        
        <xsl:variable name="max" select="count(iml:meta[@name='dc.creator'])" as="xs:integer"/>
        
        <xsl:text>\author{</xsl:text>
        <xsl:for-each select="iml:meta[@name='dc.creator']">
            <xsl:variable name="curId" as="xs:string" select="@about"/>
            
            <!-- Authors -->
            <xsl:value-of select="@content" />
            
            
            <xsl:call-template name="n" />
            <xsl:text>\affil{</xsl:text>
            
            <!-- E-Mail -->
            <xsl:value-of select="../iml:meta[@property='schema:email' and @about=$curId]/@content" />
            <xsl:text> - </xsl:text>
            
            <!-- Affiliation -->
            <xsl:for-each select="
                for $affId in ../iml:link[@property='schema:affiliation' and @about=$curId]/@href 
                return ../iml:meta[@about = $affId]">
                
                <xsl:value-of select="@content" />
                
                <xsl:if test="position() != last()">
                    <xsl:text>, and </xsl:text>
                </xsl:if>
                
            </xsl:for-each>
            <xsl:text>}</xsl:text>
            <xsl:call-template name="n" />
        </xsl:for-each>
        <xsl:text>}</xsl:text>
        
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="//iml:body/iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-abstract']"/>
        </xsl:call-template>
        
        <!-- Add categories -->
        <xsl:call-template name="categories" />
        
        <!-- Add keywords -->
        <xsl:call-template name="keywords" />
    </xsl:template>

    <xsl:template match="iml:blockquote">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{quote}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{quote}</xsl:text>
    </xsl:template>

    <xsl:template match="iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-abstract']">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{abstract}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{abstract}</xsl:text>
    </xsl:template>

    <xsl:template match="iml:section">
        <xsl:call-template name="next-with-deep" />
    </xsl:template>
    
    <xsl:template name="next-with-deep">
        <xsl:param name="deep" as="xs:integer" tunnel="yes"/>
        <xsl:call-template name="next">
            <xsl:with-param name="deep" select="if (exists(iml:h1)) then $deep + 1 else $deep"
                tunnel="yes" as="xs:integer"/>
        </xsl:call-template>
    </xsl:template>

    <xsl:template match="iml:body">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\maketitle</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="element()[every $token in tokenize(@role, ' ') satisfies $token != 'doc-endnotes' and $token != 'doc-abstract']|text()"
                as="node()*"/>
        </xsl:call-template>
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
    </xsl:template>

    <xsl:template match="iml:li">
        <xsl:call-template name="n"/>
        <xsl:text>\item </xsl:text>
        <xsl:call-template name="next"/>
    </xsl:template>

    <xsl:template match="iml:figure[iml:pre]">
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="iml:pre" />
            <xsl:with-param name="caption" select="iml:figcaption" as="element()" tunnel="yes" />
            <xsl:with-param name="id" select="@id" as="xs:string" tunnel="yes" />
            <xsl:with-param name="floating" select="true()" as="xs:boolean" tunnel="yes" />
        </xsl:call-template>
    </xsl:template>

    <!-- SVG images are not handled directly and thus are not included -->
    <xsl:template match="iml:figure[iml:p/svg:svg]" />

    <xsl:template match="iml:figure[iml:p/iml:img[every $token in tokenize(@role, ' ') satisfies $token != 'math']]">
        <xsl:call-template name="n" />
        <xsl:text>\begin{figure}[h!]</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\centering</xsl:text>
        <xsl:call-template name="next"/>
        <xsl:call-template name="n" />
        <xsl:text>\label{</xsl:text>
        <xsl:value-of select="@id" />
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\end{figure}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template match="iml:figure[iml:p/(mathml:math | (iml:img|iml:span)[some $token in tokenize(@role, ' ') satisfies $token = 'math'])]">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{equation}</xsl:text>
        <xsl:call-template name="next"/>
        <xsl:call-template name="n" />
        <xsl:text>\label{</xsl:text>
        <xsl:value-of select="@id" />
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\end{equation}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template match="iml:figure[iml:table]">
        <xsl:call-template name="n" />
        <xsl:text>\begin{table}[h!]</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\centering</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="iml:figcaption"/>
        </xsl:call-template>
        <xsl:call-template name="n" />
        <xsl:text>\renewcommand{\tabularxcolumn}[1]{>{\arraybackslash}m{#1}}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\newcolumntype{Y}{>{\centering\arraybackslash}X}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\newcolumntype{Z}{>{\arraybackslash}X}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="element() except iml:figcaption"/>
        </xsl:call-template>
        <xsl:call-template name="n" />
        <xsl:text>\label{</xsl:text>
        <xsl:value-of select="@id" />
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\end{table}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
  
    <xsl:template match="iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography']">
        <xsl:param name="bibtex" as="xs:boolean" tunnel="yes" />
        <xsl:call-template name="n" />
        
        <xsl:choose>
            <xsl:when test="$bibtex">
                <xsl:text>\bibliographystyle{acmsmall}</xsl:text>
                <xsl:call-template name="n" />
                <xsl:text>\bibliography{bibliography}</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="n" />
                <xsl:text>\begin{thebibliography}{4}</xsl:text>
                <xsl:call-template name="n" />
                <xsl:call-template name="next"/>
                <xsl:call-template name="n" />
                <xsl:call-template name="n" />
                <xsl:text>\end{thebibliography}</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
        
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template match="iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-acknowledgements']">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\subsubsection*{Acknowledgements.}</xsl:text>
        <xsl:call-template name="next"/>
        <xsl:call-template name="n" />
    </xsl:template>

    <xsl:template match="iml:tr">
        <xsl:param name="isFirstColHeading" select="false()" as="xs:boolean" tunnel="yes" />
        
        <xsl:call-template name="n" />
        <xsl:call-template name="next"/>
        <xsl:text> \\</xsl:text>
        <xsl:call-template name="n" />
        <xsl:choose>
            <xsl:when test="not($isFirstColHeading) and exists(iml:th)">
                <xsl:text> \toprule</xsl:text>
            </xsl:when>
            <xsl:when test="empty(following-sibling::iml:tr)">
                <xsl:text> \bottomrule</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text> \midrule</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:call-template name="n" />
    </xsl:template>

    <xsl:template match="iml:td">
        <xsl:call-template name="next"/>
        <xsl:if test="exists(following-sibling::iml:td|following-sibling::iml:th)">
            <xsl:text> &amp; </xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="iml:th">
        <xsl:text>{\bf </xsl:text>
        <xsl:call-template name="next"/>
        <xsl:text>}</xsl:text>
        <xsl:if test="exists(following-sibling::iml:td|following-sibling::iml:th)">
            <xsl:text> &amp; </xsl:text>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
