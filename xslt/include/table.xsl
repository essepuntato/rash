<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH to LaTeX: table module - Version 0.5, December 24, 2016
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
    
    <xsl:template match="iml:ul[parent::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography']]|iml:ol[parent::iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography']]">
        <xsl:param name="scope" as="element()?" tunnel="yes" />
        <xsl:param name="id-for-refs" as="xs:string?" tunnel="yes" />
        
        <xsl:for-each select="iml:li[not($scope) or (some $ref in ($scope//iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-biblioref'] | //iml:section[some $token in tokenize(@role, ' ') satisfies $token = 'doc-endnotes']/iml:section[some $footnote in $scope//iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-noteref'] satisfies $footnote/@href = concat('#', @id)]//iml:a[some $token in tokenize(@role, ' ') satisfies $token = 'doc-biblioref']) satisfies $ref/@href = concat('#', @id))]">
            <xsl:sort data-type="text" select="lower-case(string-join(iml:p//text(),''))" />
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
