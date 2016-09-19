<?xml version="1.0" encoding="UTF-8"?>
<!-- 
From RASH to ACM Journal LaTeX style (large) XSLT transformation file - Version 1.0, April 29, 2016
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
    <xsl:variable name="img.content.width" select="'8cm'" as="xs:string" />
    <xsl:variable name="img.default.width" select="'7cm'" as="xs:string" />
    
    <!-- Variable specifying if BibTeX should be used (instable) -->
    <xsl:param name="bibtex" select="false()" as="xs:boolean" />
    
    <!-- Main template -->
    <xsl:template match="/">
        <!-- LaTeX style -->
        <xsl:text>\documentclass{acmlarge}</xsl:text>
        <xsl:call-template name="standard_packages" />
        <xsl:call-template name="verbatim_text" />
        <xsl:call-template name="footnote_verb" />
        <xsl:call-template name="graphics" />
        <xsl:call-template name="mathml" />
        <xsl:call-template name="greek" />
        
        <!-- Metadata Information -->
        <xsl:call-template name="n" />
        <xsl:text>\acmVolume{1}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\acmNumber{1}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\acmArticle{1}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\articleSeq{1}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\acmYear{2XXX}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\acmMonth{1}</xsl:text>
        <xsl:call-template name="n" />
        
        <!-- Package to generate and customize Algorithm as per ACM style -->
        <xsl:call-template name="n" />
        <xsl:text>\usepackage[ruled]{algorithm2e}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\SetAlFnt{\algofont}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\SetAlCapFnt{\algofont}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\SetAlCapNameFnt{\algofont}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\SetAlCapHSkip{0pt}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\IncMargin{-\parindent}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\renewcommand{\algorithmcfname}{ALGORITHM}</xsl:text>
        <xsl:call-template name="n" />
        
        <!-- Page heads -->
        <xsl:call-template name="n" />
        <xsl:text>\markboth{</xsl:text>
        <xsl:value-of select="//iml:meta[@name = 'dc.creator'][1]/@content" />
        <xsl:if test="count(//iml:meta[matches(@name,'dc.creator')]) > 1">
            <xsl:text> et al.</xsl:text>
        </xsl:if>
        <xsl:text>}{</xsl:text>
        <xsl:value-of select="f:getTitle(/element())" />
        <xsl:text>}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        
        <xsl:text>\begin{document}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        
        <xsl:text>\acmformat{</xsl:text>
        <xsl:for-each select="//iml:meta[matches(@name,'dc.creator')]/@content">
            <xsl:value-of select="." />
            <xsl:choose>
                <xsl:when test="position() = last()">. </xsl:when>
                <xsl:otherwise>, </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
        <xsl:value-of select="f:getTitle(/element())" />
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
    
    <xsl:template match="iml:figure[iml:table]" priority="1.3">
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
            <xsl:with-param name="select" select="iml:figcaption"/>
        </xsl:call-template>
        <xsl:text>\label{</xsl:text>
        <xsl:value-of select="@id" />
        <xsl:text>}}{</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="element() except iml:figcaption"/>
        </xsl:call-template>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\end{table}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template match="iml:figcaption[ancestor::iml:figure[iml:table]] | iml:p[ancestor::iml:figure[iml:table]]" priority="1.3">
        <xsl:call-template name="n" />
        <xsl:call-template name="next" />
    </xsl:template>
    
    <xsl:template match="element()[iml:li[@role = 'doc-biblioentry']][parent::iml:section[@role = 'doc-bibliography']]" priority="1.7">
        <xsl:for-each select="iml:li">
            <xsl:sort data-type="text" select="iml:p/text()[1]" />
            
            <xsl:variable name="item" select="string-join(iml:p//text(),'')" as="xs:string*" />
            
            <xsl:call-template name="n" />
            <xsl:text>\bibitem</xsl:text>
            <xsl:if test="$item">
                <xsl:text>[\protect\citeauthoryear</xsl:text>
                <xsl:variable name="authors" select="tokenize(tokenize($item,'\. ?\(?\d\d\d\d\)?\.')[1],',|( and )')" as="xs:string+" />
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
                <xsl:analyze-string select="$item" regex=".*[^\d]\. ?\(?(\d\d\d\d)\)?\..*">
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
    
    <xsl:template 
        match="iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-acknowledgements']" 
        priority="2.0">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\section*{ACKNOWLEDGEMENTS}</xsl:text>
        <xsl:call-template name="next"/>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template match="iml:ul[parent::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography']]|iml:ol[parent::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography']]" priority="3.0">
        <xsl:param name="scope" as="element()?" tunnel="yes" />
        <xsl:param name="id-for-refs" as="xs:string?" tunnel="yes" />
        
        <xsl:for-each select="iml:li[not($scope) or (some $ref in ($scope//iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-biblioref'] | //iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-footnotes']/iml:section[some $footnote in $scope//iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-noteref'] satisfies $footnote/@href = concat('#', @id)]//iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-biblioref']) satisfies $ref/@href = concat('#', @id))]">
            <xsl:call-template name="n" />
            <xsl:text>\bibitem{</xsl:text>
            <xsl:value-of select="if ($id-for-refs) then concat($id-for-refs,'-',@id) else @id" />
            <xsl:text>} </xsl:text>
            <xsl:call-template name="next">
                <xsl:with-param name="select" select="iml:p/(text()|element())" />
            </xsl:call-template>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template match="element()" />
    
</xsl:stylesheet>
