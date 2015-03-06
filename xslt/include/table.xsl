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
    
    <xsl:template match="iml:ol">
        <xsl:call-template name="n" />
        <xsl:text>\begin{longenum}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{longenum}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:ul">
        <xsl:call-template name="n" />
        <xsl:text>\begin{longitem}</xsl:text>
        <xsl:call-template name="next" />
        <xsl:call-template name="n" />
        <xsl:text>\end{longitem}</xsl:text>
    </xsl:template>
    
    <xsl:template match="iml:ul[parent::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'bibliography']]|iml:ol[parent::iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'bibliography']]">
        <xsl:param name="scope" as="element()?" tunnel="yes" />
        <xsl:param name="id-for-refs" as="xs:string?" tunnel="yes" />
        
        <xsl:for-each select="iml:li[not($scope) or (some $ref in ($scope//iml:a[some $token in tokenize(@class, ' ') satisfies $token = 'ref'] | //iml:div[some $token in tokenize(@class, ' ') satisfies $token = 'footnotes']/iml:div[some $footnote in $scope//iml:a[some $token in tokenize(@class, ' ') satisfies $token = 'footnote'] satisfies $footnote/@href = concat('#', @id)]//iml:a[some $token in tokenize(@class, ' ') satisfies $token = 'ref']) satisfies $ref/@href = concat('#', @id))]">
            <xsl:sort data-type="text" select="lower-case(iml:p/text()[1])" />
            <xsl:call-template name="n" />
            <xsl:text>\bibitem{</xsl:text>
            <xsl:value-of select="if ($id-for-refs) then concat($id-for-refs,'-',@id) else @id" />
            <xsl:text>} </xsl:text>
            <xsl:call-template name="next">
                <xsl:with-param name="select" select="iml:p/(text()|element())" />
            </xsl:call-template>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template match="iml:table">
        <xsl:call-template name="n" />
        <xsl:text>\scalebox{0.8} {</xsl:text>
        <xsl:text>\begin{tabularx}{1.22\textwidth}</xsl:text>
        <xsl:call-template name="table_fragment" />
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
</xsl:stylesheet>
