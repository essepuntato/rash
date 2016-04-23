<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
    xmlns:iml="http://www.cs.unibo.it/2006/iml"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    xmlns:f="http://www.essepuntato.it/XSLT/fuction"
    exclude-result-prefixes="iml xs f">
    
    <xsl:include href="includes/container.xsl"/>
    <xsl:include href="includes/block.xsl"/>
    <xsl:include href="includes/milestone.xsl"/>
    <xsl:include href="includes/inline.xsl"/>
    <xsl:include href="includes/table.xsl"/>
    <xsl:include href="includes/namedTemplates.xsl"/>
    
    <xsl:output 
        encoding="UTF-8"
        method="text"
        indent="no" />
    <xsl:strip-space elements="*"/>
    
    <!-- Template for possible languages -->
    <xsl:variable name="v_all.languages" select="('it','en','en-s')" as="xs:string*" />
    
    <!-- Variables of the maximum size for images (instable) -->
    <xsl:variable name="img.content.width" select="'8cm'" as="xs:string" />
    <xsl:variable name="img.default.width" select="'7cm'" as="xs:string" />
    
    <!-- Variable specifying if BibTeX should be used (instable) -->
    <xsl:param name="bibtex" select="false()" as="xs:boolean" />
    
    <!-- Main template -->
    <xsl:template match="/">
        <!-- LaTeX style -->
        <xsl:text>\documentclass[prodmode,acmtois]{acmsmall}</xsl:text>
        <xsl:call-template name="standard_packages" />
        <xsl:call-template name="verbatim_text" />
        <xsl:call-template name="footnote_verb" />
        <xsl:call-template name="graphics" />
        <xsl:call-template name="mathml" />
        <xsl:call-template name="greek" />
        
        <!-- Balance the last page columns -->
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        
        <xsl:text>\begin{document}</xsl:text>
        <xsl:call-template name="n" />
        
        <!-- Etichetta per ogni pagina -->
        <xsl:text>\markboth{</xsl:text>
        <xsl:value-of select="//iml:meta[@name = 'author.1.name']/@content" />
        <xsl:if test="count(//iml:meta[matches(@name,'author.*.name')]) > 1">
            <xsl:text> et al.</xsl:text>
        </xsl:if>
        <xsl:text>}{</xsl:text>
        <xsl:value-of select="//iml:title" />
        <xsl:text>}</xsl:text>
        
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
        </xsl:apply-templates>
        
        <xsl:call-template name="n" />
        <xsl:text>\end{document}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:div[@class = 'table']" priority="1.3">
        <xsl:call-template name="n" />
        <xsl:text>\begin{table}[h!]</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\centering</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\renewcommand{\tabularxcolumn}[1]{>{\arraybackslash}m{#1}}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\newcolumntype{Y}{>{\centering\arraybackslash}X}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\newcolumntype{Z}{>{\arraybackslash}X}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\tbl{</xsl:text>
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="iml:p[@class = 'caption']"/>
        </xsl:call-template>
        <xsl:text>\label{</xsl:text>
        <xsl:value-of select="@id" />
        <xsl:text>}}{</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="element() except iml:p[@class = 'caption']"/>
        </xsl:call-template>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\end{table}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template match="iml:p[@class = 'caption' and ancestor::iml:div[@class = 'table']]" priority="1.3">
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="iml:ul[parent::iml:div[@class = 'bibliography']]" priority="1.7">
        <xsl:for-each select="iml:li">
            <xsl:sort data-type="text" select="iml:p/text()[1]" />
            
            <xsl:variable name="item" select="string-join(iml:p//text(),'')" as="xs:string*" />
            
            <xsl:call-template name="n" />
            <xsl:text>\bibitem</xsl:text>
            <xsl:if test="$item">
                <xsl:text>[\protect\citeauthoryear</xsl:text>
                <xsl:variable name="authors" select="tokenize(tokenize($item,'\(\d\d\d\d\)')[1],',')[position() mod 2 = 1]" as="xs:string+" />
                <xsl:variable name="authorCite" as="xs:string*">
                    <xsl:text>{</xsl:text>
                    <xsl:value-of select="normalize-space($authors[1])" />
                    <xsl:choose>
                        <xsl:when test="count($authors) = 2">
                            <xsl:text> and </xsl:text>
                            <xsl:value-of select="normalize-space($authors[2])" />
                        </xsl:when>
                        <xsl:when test="count($authors) > 2">
                            <xsl:text> et al.</xsl:text>
                        </xsl:when>
                    </xsl:choose>
                    <xsl:text>}</xsl:text>
                </xsl:variable>
                <xsl:value-of select="$authorCite,$authorCite" separator="" />
                <xsl:analyze-string select="$item" regex=".*\((\d\d\d\d)\).*">
                    <xsl:matching-substring>
                        <xsl:text>{</xsl:text>
                        <xsl:value-of select="regex-group(1)"/>
                        <xsl:text>}</xsl:text>
                    </xsl:matching-substring>
                </xsl:analyze-string>
                <xsl:text>]</xsl:text>
            </xsl:if>
            <xsl:text>{</xsl:text>
            <xsl:value-of select="@id" />
            <xsl:text>} </xsl:text>
            <xsl:call-template name="next">
                <xsl:with-param name="select" select="iml:p/(text()|element())" />
            </xsl:call-template>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template match="element()" />
    
</xsl:stylesheet>
