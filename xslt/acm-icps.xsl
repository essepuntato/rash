<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
    xmlns:iml="http://www.w3.org/1999/xhtml"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:f="http://www.essepuntato.it/XSLT/fuction"
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
    
    <!-- Template per la preparazione della pagina -->
    <xsl:variable name="v_all.languages" select="('it','en','en-s')" as="xs:string*" />
    
    <!-- Variabile per la dimensione massima delle immagini e relativa riduzione in percentuale -->
    <xsl:variable name="img.content.width" select="'8cm'" as="xs:string" />
    <xsl:variable name="img.default.width" select="'7cm'" as="xs:string" />
    
    <!-- Variabile per usare BibTeX -->
    <xsl:param name="bibtex" select="false()" as="xs:boolean" />
    
    <!-- Template per l'inizio dell'elaborazione -->
    <xsl:template match="/">
        <!-- Classe dello stile da usare (specificare magari dal file principale, come parametro) -->
        <xsl:text>\documentclass{sig-alternate}</xsl:text>
        <xsl:call-template name="n" />
        
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{amssymb}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\setcounter{tocdepth}{3}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{listings}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{booktabs}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{mathtools}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{tabularx}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{fixltx2e}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\lstset{breaklines=true, basicstyle=\small\ttfamily}</xsl:text>
        <xsl:call-template name="n" />
        <!-- Balance the last page columns -->
        <xsl:text>\usepackage{flushend}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="footnote_verb" />
        <xsl:call-template name="graphics" />
        <xsl:call-template name="mathml" />
        <xsl:call-template name="greek" />
        
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\makeatletter</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\let\@copyrightspace\relax</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\makeatother</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\begin{document}</xsl:text>
        <xsl:call-template name="n" />
        
        <xsl:apply-templates select="element()">
            <!-- Defalut values -->
            <xsl:with-param name="lang" select="'en-s'" as="xs:string" tunnel="yes" />
            <xsl:with-param 
                name="document.lang" select="if (exists(/element()[@xml:lang])) then /element()/@xml:lang else 'en-s'" 
                tunnel="yes" />
            <xsl:with-param name="type" select="'bullet'" as="xs:string" tunnel="yes" />
            <xsl:with-param name="deep" select="0" as="xs:integer" tunnel="yes" />
            <xsl:with-param name="all.languages" select="$v_all.languages" as="xs:string*" tunnel="yes" />
            <xsl:with-param name="bibtex" select="$bibtex" as="xs:boolean" tunnel="yes" />
        </xsl:apply-templates>
        
        <xsl:call-template name="n" />
        <xsl:text>\end{document}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:head" priority="0.7">
        <xsl:call-template name="document_title" />
        
        <xsl:variable name="max" select="count(iml:meta[@name='dc.creator'])" as="xs:integer"/>
        
        <!-- Authors -->
        <xsl:call-template name="n" />
        <xsl:text>\numberofauthors{</xsl:text>
        <xsl:value-of select="$max" />
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        
        <xsl:text>\author{</xsl:text>
        <xsl:for-each select="iml:meta[@name='dc.creator']">
            <xsl:variable name="curId" as="xs:string" select="@about"/>
            
            <xsl:call-template name="n" />
            <xsl:text>\alignauthor</xsl:text>
            <xsl:call-template name="n" />
            
            <xsl:value-of select="../iml:meta[@about = $curId and @name = 'dc.creator']/@content"/>
            <xsl:text>\\</xsl:text>
            <xsl:call-template name="n" />
            
            <!-- Affiliation -->
            <xsl:for-each select="
                for $link in ../iml:link[@about = $curId and @property = 'schema:affiliation']/@href 
                return ../iml:meta[@about = $link and @property = 'schema:name'][1]/@content">
                <xsl:text>\affaddr{</xsl:text>
                <xsl:value-of select="." />
                <xsl:text>}</xsl:text>
                <xsl:text>\\</xsl:text>
                <xsl:call-template name="n" />
            </xsl:for-each>
            
            <xsl:text>\email{</xsl:text>
            <xsl:value-of select="../iml:meta[@about = $curId and @property = 'schema:email']/@content"/>
            <xsl:text>}</xsl:text>
        </xsl:for-each>
        <xsl:text>}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:text>\maketitle</xsl:text>
        
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="//iml:body/iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'abstract']"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'abstract']" priority="1.2">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{abstract}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{abstract}</xsl:text>
        <xsl:call-template name="n" />
        
        <!-- Add categories -->
        <xsl:call-template name="categories" />
        
        <!-- Add keywords -->
        <xsl:call-template name="keywords" />
    </xsl:template>
    
    <xsl:template match="iml:body" priority="0.7">
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="element()[every $token in tokenize(@class, ' ') satisfies $token != 'footnotes' and $token != 'abstract']|text()"
                as="node()*"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:ol[empty(ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'bibliography'])]" priority="0.7">
        <xsl:call-template name="n" />
        <xsl:text>\begin{enumerate}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{enumerate}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:ul[empty(ancestor::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'bibliography'])]" priority="0.7">
        <xsl:call-template name="n" />
        <xsl:text>\begin{itemize}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{itemize}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:img" priority="0.7">
        <xsl:call-template name="create.img">
            <xsl:with-param name="max" select="'\columnwidth'" as="xs:string"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:table" priority="1.3">
        <xsl:call-template name="n" />
        <xsl:text>\begin{tabularx}{0.45\textwidth}</xsl:text>
        <xsl:call-template name="table_fragment" />
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template 
        match="iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'acknowledgements']" 
        priority="2.0">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\subsection*{Acknowledgements}</xsl:text>
        <xsl:call-template name="next"/>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template match="element()" />
</xsl:stylesheet>
