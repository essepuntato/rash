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
    <xsl:variable name="img.content.width" select="'15cm'" as="xs:string" />
    <xsl:variable name="img.default.width" select="'14cm'" as="xs:string" />
    
    <!-- Variabile per usare BibTeX -->
    <xsl:param name="bibtex" select="false()" as="xs:boolean" />
    
    <!-- Template per l'inizio dell'elaborazione -->
    <xsl:template match="/">
        <!-- Classe dello stile da usare (specificare magari dal file principale, come parametro) -->
        <xsl:text>\documentclass[runningheads,a4paper]{llncs}</xsl:text>
        <xsl:call-template name="standard_packages" />
        <xsl:call-template name="verbatim_text" />
        <xsl:call-template name="footnote_verb" />
        <xsl:call-template name="graphics" />
        <xsl:call-template name="mathml" />
        <xsl:call-template name="greek" />
        
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{subscript}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\lstset{breaklines=true, basicstyle=\scriptsize\ttfamily}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{document}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\mainmatter</xsl:text>
        <xsl:call-template name="n" />
        
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
    
    <xsl:template match="iml:head" priority="0.7">
        <xsl:text>\title{</xsl:text>
        <xsl:value-of select="iml:title"/>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
        
        <xsl:variable name="max"
            select="xs:integer(max(iml:meta[ends-with(@name,'number')]/@content))"
            as="xs:integer"/>
        <xsl:variable name="names" select="iml:meta[ends-with(@name,'name')]/@content"
            as="xs:string+"/>
        <xsl:variable name="numbers"
            select="for $n in $names return iml:meta[@name = concat(substring-before(//iml:meta[@content = $n]/@name,'name'),'number')]/@content"
            as="xs:integer+"/>
        <xsl:variable name="allAff"
            select="for $n in $names return iml:meta[@name = concat(substring-before(//iml:meta[@content = $n]/@name,'name'),'affiliation')]/@content"
            as="xs:string+"/>
        <xsl:variable name="emails"
            select="for $n in $names return iml:meta[@name = concat(substring-before(//iml:meta[@content = $n]/@name,'name'),'email')]/@content"
            as="xs:string+"/>
        <xsl:variable name="affiliations" select="distinct-values(for $aff in iml:link[@property = 'schema:affiliation']/@href return iml:meta[@about = $aff]/@content)" as="xs:string*" />
        
        <!-- Authors -->
        <xsl:text>\author{</xsl:text>
        <xsl:for-each select="iml:meta[@name='dc.creator']">
            <xsl:variable name="curId" as="xs:string" select="@about"/>
            
            <xsl:value-of select="@content" />
            <xsl:text>\inst{</xsl:text>
                <xsl:for-each select="for $aff in ../iml:link[@property = 'schema:affiliation' and @about = $curId]/@href return ../iml:meta[@about = $aff]/@content">
                    <xsl:value-of select="index-of($affiliations, .)" />
                    <xsl:if test="position() != last()">
                        <xsl:text>,</xsl:text>
                    </xsl:if>
                </xsl:for-each>
            <xsl:text>}</xsl:text>
            
            <xsl:if test="position() != last()">
                <xsl:text> \and</xsl:text>
                <xsl:call-template name="n" />
            </xsl:if>
        </xsl:for-each>
        <xsl:text>}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:text>\institute{</xsl:text>
        <!-- Affiliation -->
        <xsl:for-each select="$affiliations">
            <xsl:value-of select="." />
            <xsl:if test="position() != last()">
                <xsl:text>\and</xsl:text>
                <xsl:call-template name="n" />
            </xsl:if>
        </xsl:for-each>
        
        <!-- E-mail -->
        <xsl:text>\\</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\email{</xsl:text>
        <xsl:for-each select="iml:meta[@property = 'schema:email']/@content">
            <xsl:value-of select="." />
            <xsl:if test="position() != last()">
                <xsl:text>, </xsl:text>
                <xsl:call-template name="n" />
            </xsl:if>
        </xsl:for-each>
        <xsl:text>}}</xsl:text>
        
        <xsl:call-template name="n" />
        <xsl:text>\maketitle</xsl:text>
        
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="//iml:body/iml:div[@class = 'abstract']"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:div[@class = 'abstract']" priority="0.7">
        <xsl:call-template name="n" />
        <xsl:call-template name="n" />
        <xsl:text>\begin{abstract}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <!-- Add keywords -->
        <xsl:if test="exists(//iml:meta[@name = 'keyword'])">
            <xsl:call-template name="n" />
            <xsl:text>\keywords{</xsl:text>
            <xsl:for-each select="//iml:meta[@name = 'keyword']">
                <xsl:sort select="@content" data-type="text"/>
                <xsl:value-of select="@content"/>
                <xsl:if test="position() != last()">
                    <xsl:text>, </xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:text>}</xsl:text>
            <xsl:call-template name="n" />
        </xsl:if>
        <xsl:text>\end{abstract}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:body" priority="0.7">
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="select" select="element()[@class != 'footnote' and @class != 'abstract']|text()"
                as="node()*"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="iml:ol[empty(ancestor::iml:div[@class = 'bibliography'])]" priority="0.7">
        <xsl:call-template name="n" />
        <xsl:text>\begin{enumerate}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{enumerate}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:ul[empty(ancestor::iml:div[@class = 'bibliography'])]" priority="0.7">
        <xsl:call-template name="n" />
        <xsl:text>\begin{itemize}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{itemize}</xsl:text>
    </xsl:template>
    
    <xsl:template match="element()" />
</xsl:stylesheet>
