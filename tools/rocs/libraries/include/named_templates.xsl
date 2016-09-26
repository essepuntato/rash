<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH to LaTeX: named templates module - Version 0.5.1, April 29, 2016
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
    xmlns:m="http://www.w3.org/1998/Math/MathML"
    xmlns:f="http://www.essepuntato.it/XSLT/function"
    xmlns:svg="http://www.w3.org/2000/svg">

    <xsl:import href="mathml.xsl"/>

    <xsl:output 
        encoding="UTF-8"
        method="text"
        indent="no" />
    <xsl:strip-space elements="*"/>
    
    <xsl:template name="n">
        <xsl:text>&#xa;</xsl:text>
    </xsl:template>
    
    <xsl:template name="t">
        <xsl:text>    </xsl:text>
    </xsl:template>
    
    <xsl:template name="document_title">
        <xsl:variable name="cur_title" as="xs:string?" select="f:getTitle(/element())" />
        <xsl:variable name="cur_subtitle" as="xs:string?" select="f:getSubtitle(/element())" />
        <xsl:text>\title{</xsl:text>
        <xsl:choose>
            <xsl:when test="$cur_subtitle">
                <xsl:value-of select="$cur_title" />
                <xsl:text>}</xsl:text>
                <xsl:call-template name="n" />
                <xsl:text>\subtitle{</xsl:text>
                <xsl:value-of select="$cur_subtitle" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$cur_title"/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template name="standard_packages">
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
        <xsl:text>\usepackage{hyperref}</xsl:text>
    </xsl:template>
    
    <xsl:template name="url">
        <xsl:call-template name="n" />
        <xsl:text>\usepackage[hyphens]{url}</xsl:text>
    </xsl:template>
    
    <xsl:template name="footnote_verb">
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{fancyvrb}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\VerbatimFootnotes</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{cprotect}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template name="verbatim_text">
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{upquote,textcomp}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\lstset{breaklines=true, basicstyle=\scriptsize\ttfamily, upquote=true}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template name="mathml">
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{amsmath}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{color,graphics,array,csscolor}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{pmml-new}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template name="graphics">
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{graphicx}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\makeatletter</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\def\maxwidth#1{\ifdim\Gin@nat@width>#1 #1\else\Gin@nat@width\fi}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\makeatother</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
    
    <xsl:template name="table_fragment">
        <xsl:variable name="firstRow" select="iml:tr[1]/(iml:td|iml:th)" as="element()*" />
        <xsl:variable name="nCol" select="count($firstRow)" as="xs:integer" />
        <xsl:variable name="rowWidth" select="xs:string(xs:double(xs:double(100 div $nCol) div 100))" as="xs:string" />
        <xsl:variable name="isFirstColHeading" select="every $f in (iml:tr/element()[1]) satisfies $f[self::iml:th]" as="xs:boolean" />
        <xsl:choose>
            <xsl:when test="$isFirstColHeading and $nCol > 1">
                <xsl:text>{</xsl:text>
                <xsl:for-each select="1 to $nCol">
                    <xsl:text> >{\hsize=</xsl:text>
                    <xsl:value-of select="$rowWidth" />
                    <xsl:text>\hsize}Z </xsl:text>
                </xsl:for-each>
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>{</xsl:text>
                <xsl:for-each select="1 to $nCol">
                    <xsl:text> >{\hsize=</xsl:text>
                    <xsl:value-of select="$rowWidth" />
                    <xsl:text>\hsize}Y </xsl:text>
                </xsl:for-each>
                <xsl:text>}</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:call-template name="n" />
        <xsl:text>\toprule</xsl:text>
        <xsl:call-template name="n" />
        <xsl:call-template name="next">
            <xsl:with-param name="isFirstColHeading" select="$isFirstColHeading" as="xs:boolean" tunnel="yes" />
        </xsl:call-template>
        <xsl:call-template name="n" />
        <xsl:text>\end{tabularx}</xsl:text>
    </xsl:template>

    <xsl:template name="next">
        <xsl:param name="lang" as="xs:string" tunnel="yes"/>
        <xsl:param name="document.lang" as="xs:string" tunnel="yes"/>
        <xsl:param name="type" tunnel="yes" as="xs:string"/>
        <xsl:param name="select" select="text()|element()" as="node()*"/>
        <xsl:param name="allCaps" select="false()" as="xs:boolean" tunnel="yes"/>
        <xsl:param name="isInline" select="false()" as="xs:boolean"/>
        <xsl:variable name="cur.lang" select="if (exists(@xml:lang)) then @xml:lang else $lang"/>

        <xsl:for-each select="$select">
            <xsl:choose>
                <xsl:when test="self::m:math">
                    <xsl:apply-templates select="." mode="pmml2tex" />
                </xsl:when>
                <xsl:when test="self::svg:svg">
                    <xsl:text>[ERROR: SVG images are not handled]</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates select=".">
                        <xsl:with-param name="lang"
                            select="if (empty(@xml:lang)) then $cur.lang else @xml:lang" as="xs:string"
                            tunnel="yes"/>
                        <xsl:with-param name="isInline" select="$isInline" tunnel="yes" />
                    </xsl:apply-templates>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template name="categories">
        <xsl:if test="exists(//iml:meta[@name = 'dcterms.subject'])">
            <xsl:call-template name="n" />
            <xsl:for-each select="//iml:meta[@name = 'dcterms.subject']/@content">
                <xsl:call-template name="n" />
                <xsl:variable name="tok" select="tokenize(.,',')" as="xs:string*"/>
                <xsl:text>\category{</xsl:text>
                <xsl:value-of select="normalize-space($tok[1])"/>
                <xsl:text>}{</xsl:text>
                <xsl:value-of select="normalize-space($tok[2])"/>
                <xsl:text>}{</xsl:text>
                <xsl:value-of select="normalize-space($tok[3])"/>
                <xsl:text>}</xsl:text>
                <xsl:if test="count($tok) > 3">
                    <xsl:text>[</xsl:text>
                    <xsl:value-of select="normalize-space($tok[4])"/>
                    <xsl:text>]</xsl:text>
                </xsl:if>
            </xsl:for-each>
        </xsl:if>
    </xsl:template>
    
    <xsl:template name="keywords">
        <xsl:if test="exists(//iml:meta[@property = 'prism:keyword'])">
            <xsl:call-template name="n" />
            <xsl:call-template name="n" />
            <xsl:text>\keywords{</xsl:text>
            <xsl:for-each select="//iml:meta[@property = 'prism:keyword']">
                <xsl:sort select="@content" data-type="text"/>
                <xsl:value-of select="@content"/>
                <xsl:if test="position() != last()">
                    <xsl:text>, </xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:text>}</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="text()[ancestor::iml:span[some $token in tokenize(@role, ' ') satisfies $token = 'math']]" priority="3">
        <xsl:value-of select="." />
    </xsl:template>
    
    <xsl:template match="text()[empty(ancestor::iml:code)]">
        <xsl:param name="isInline" as="xs:boolean" tunnel="yes" />
        <xsl:choose>
            <xsl:when test="$isInline">
                <xsl:value-of select="f:replace(replace(., '\s+', ' '))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="f:replace(.)"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="text()[exists(ancestor::iml:blockquote)]" priority="3">
        <xsl:param name="isInline" as="xs:boolean" tunnel="yes" />
        <xsl:choose>
            <xsl:when test="$isInline">
                <xsl:value-of select="replace(f:replace(normalize-space(.)),'&#xa;','&#xa;&#xa;')"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="replace(f:replace(.),'&#xa;','&#xa;&#xa;')"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="text()[exists(ancestor::iml:code)]">
        <xsl:param name="isInline" as="xs:boolean" tunnel="yes" />
        <xsl:variable name="isInInitialEmptySequence" select="normalize-space() = '' and (every $text in (ancestor::iml:code//text() intersect preceding::text()) satisfies normalize-space($text) = '')" as="xs:boolean" />
        <xsl:variable name="isInFinalEmptySequence" select="normalize-space() = '' and (every $text in (ancestor::iml:code//text() intersect following::text()) satisfies normalize-space($text) = '')" as="xs:boolean" />
        <xsl:if test="not($isInInitialEmptySequence or $isInFinalEmptySequence)">
            <xsl:variable name="isFirstNonEmpty" select="normalize-space() != '' and (every $text in (ancestor::iml:code//text() intersect preceding::text()) satisfies normalize-space($text) = '')" as="xs:boolean" />
            <xsl:variable name="isLastNonEmpty" select="normalize-space() != '' and (every $text in (ancestor::iml:code//text() intersect following::text()) satisfies normalize-space($text) = '')" as="xs:boolean" />
            <xsl:choose>
                <xsl:when test="$isInline">
                    <xsl:value-of select="f:replaceCode(normalize-space(.))"/>
                </xsl:when>
                <xsl:when test="$isFirstNonEmpty and $isLastNonEmpty">
                    <xsl:value-of select="replace(replace(f:replaceCode(.),'^(\n|\r)+',''), '\s+$','')"/>
                </xsl:when>
                <xsl:when test="$isFirstNonEmpty">
                    <xsl:value-of select="replace(f:replaceCode(.),'^(\n|\r)+','')"/>
                </xsl:when>
                <xsl:when test="$isLastNonEmpty">
                    <xsl:value-of select="replace(f:replaceCode(.),'\s+$','')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="f:replaceCode(.)"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>
    
    <xsl:function name="f:getTitle" as="xs:string?">
        <xsl:param name="root" as="element()"/>
        <xsl:choose>
            <xsl:when test="contains($root//iml:title,'--')">
                <xsl:value-of select="normalize-space(tokenize(iml:title,'--')[1])" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$root//iml:title"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <xsl:function name="f:getSubtitle" as="xs:string?">
        <xsl:param name="root" as="element()"/>
        
        <xsl:if test="contains($root//iml:title,'--')">
            <xsl:value-of select="normalize-space(tokenize($root//iml:title,'--')[2])" />
        </xsl:if>
    </xsl:function>
    
    <xsl:function name="f:replace" as="xs:string">
        <xsl:param name="input" as="xs:string" />
        <xsl:value-of select="f:replaceForLaTeX($input,1,false())" />
    </xsl:function>
    
    <xsl:function name="f:replaceCode" as="xs:string">
        <xsl:param name="input" as="xs:string" />
        <xsl:value-of select="f:convertGreek(f:replaceForLaTeX($input,1,true()))" />
    </xsl:function>
    
    <xsl:function name="f:convertGreek" as="xs:string">
        <xsl:param name="str" as="xs:string" />
        <xsl:variable name="cod" as="xs:integer*">
            <xsl:for-each select="string-to-codepoints($str)">
                <xsl:variable name="cur" select="." />
                <xsl:choose>
                    <xsl:when test="$cur >= 880 and $cur &lt;= 1023">
                        <xsl:sequence select="36, $cur, 36" />
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:sequence select="$cur" />
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each>
        </xsl:variable>
        <xsl:value-of select="codepoints-to-string($cod)" />
    </xsl:function>
    
    <xsl:function name="f:replaceForLaTeX" as="xs:string">
        <xsl:param name="input" as="xs:string" />
        <xsl:param name="count" as="xs:integer" />
        <xsl:param name="isCode" as  ="xs:boolean" />
        <xsl:variable name="original" select="('–','—','“','”','_','%','&amp;','±','#','à','è','È','é','ì','ò','ù','…','\^','&lt;','&gt;','~','≡','⊥','⊤','∀','∃','≤','¬','⊑','⊓','⊔','á','í','ó','ú','\$','‘','’')" as="xs:string*" />
        <xsl:variable name="replacement" select="('--', '---', '``',&quot;''&quot;,'\\_','\\%','\\&amp;','\$\\pm\$','\\#','\\`a','\\`e','\\`E',&quot;\\'e&quot;,'\\`i','\\`o','\\`u','...','\\textasciicircum','\\textless{}','\\textgreater{}','\\char`\\~','\\equiv','\\bot','\\top','\\forall','\\exists','\\leq','\$\\neg\$','\$\\sqsubseteq\$','\$\\sqcap\$','\$\\sqcup\$',&quot;\\'a&quot;,&quot;\\'i&quot;,&quot;\\'o&quot;,&quot;\\'u&quot;,'\\\$','`',&quot;'&quot;)" as="xs:string*" />
        
        <xsl:variable name="code.original" select="('“','”','…','≡','⊥','⊤','∀','∃','≤','¬','⊑','⊓','⊔','\$','‘','’')" as="xs:string*" />
        <xsl:variable name="code.replacement" select="('&quot;','&quot;','...','\$\\equiv\$','\$\\bot\$','\$\\top\$','\$\\forall\$','\$\\exists\$','\$\\leq\$','\$\\neg\$','\$\\sqsubseteq\$','\$\\sqcap\$','\$\\sqcup\$','\$\\\$\$',&quot;'&quot;,&quot;'&quot;)" as="xs:string*" />
        
        <xsl:choose>
            <xsl:when test="$isCode">
                <xsl:choose>
                    <xsl:when test="$count > count($code.original)">
                        <xsl:value-of select="$input" />
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="replace(f:replaceForLaTeX($input,$count+1,$isCode),$code.original[$count],$code.replacement[$count])" />
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="$count > count($original)">
                        <xsl:value-of select="$input" />
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="replace(f:replaceForLaTeX($input,$count+1,$isCode),$original[$count],$replacement[$count])" />
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>

    <xsl:template name="attribute.common">
        <xsl:if test="exists(@id)">
            <xsl:attribute name="id" select="@id"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="attribute.lang">
        <xsl:param name="lang" as="xs:string" tunnel="yes"/>
        <xsl:param name="document.lang" as="xs:string" tunnel="yes"/>
        <xsl:if test="$document.lang != $lang">
            <xsl:attribute name="font-style" select="'italic'"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="add.space">
        <xsl:variable name="prev" as="node()*" select="preceding-sibling::node()[1]"/>
        <xsl:if test="exists($prev) and ($prev instance of element())">
            <xsl:text> </xsl:text>
        </xsl:if>
    </xsl:template>

    <xsl:template name="make.ref">
        <xsl:param name="el" as="element()"/>
        <xsl:param name="id" as="xs:string" />
        <xsl:param name="lang" as="xs:string" tunnel="yes"/>
        <xsl:param name="all.languages" as="xs:string*" tunnel="yes"/>
        <xsl:param name="use.pages" select="false()" as="xs:boolean" tunnel="yes"/>
        <xsl:variable name="i" select="index-of($all.languages,$lang)" as="xs:integer*"/>
        
        <xsl:choose>
            <xsl:when test="$el[self::iml:figure/iml:pre]">
                <xsl:variable name="str" select="('Listato','Listing','Listing')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\</xsl:text>
                <xsl:value-of select="if ($use.pages) then 'v' else ''" />
                <xsl:text>ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[self::iml:figure/iml:table]">
                <xsl:variable name="str" select="('Tabella','Table','Table')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\</xsl:text>
                <xsl:value-of select="if ($use.pages) then 'v' else ''" />
                <xsl:text>ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[self::iml:figure/iml:p/(svg:svg|iml:img[every $token in tokenize(@role, ' ') satisfies $token != 'math'])]">
                <xsl:variable name="str" select="('Figura','Figure','Fig.')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\</xsl:text>
                <xsl:value-of select="if ($use.pages) then 'v' else ''" />
                <xsl:text>ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[self::iml:figure/iml:p/(m:math|(iml:span|iml:img)[some $token in tokenize(@role, ' ') satisfies $token = 'math'])]">
                <xsl:variable name="str" select="('Formula','Formula','Formula')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\</xsl:text>
                <xsl:value-of select="if ($use.pages) then 'v' else ''" />
                <xsl:text>ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@role, ' ') satisfies $token = 'doc-chapter']">
                <xsl:variable name="str" select="('Capitolo','Chapter','Chapter')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@role, ' ') satisfies $token = 'doc-abstract']">
                <xsl:variable name="i" select="index-of($all.languages,$lang)" as="xs:integer*"/>
                <xsl:variable name="str" select="('Sommario','Abstract','Abstract')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@role, ' ') satisfies $token = 'doc-bibliography']">
                <xsl:variable name="i" select="index-of($all.languages,$lang)" as="xs:integer*"/>
                <xsl:variable name="str" select="('Bibliografia','Bibliography','Bibliopraphy')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
            </xsl:when>
            <xsl:when test="$el[self::iml:section]">
                <xsl:variable name="str" select="('Sezione','Section','Section')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="''"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="attribute.table">
        <xsl:attribute name="border" select="'1pt solid black'"/>
        <xsl:attribute name="padding" select="'2pt'"/>
    </xsl:template>
    
    <xsl:template name="greek">
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{fontspec,unicode-math}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\usepackage[Latin,Greek]{ucharclasses}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\setTransitionsForGreek{\fontspec{Times New Roman}}{}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
</xsl:stylesheet>
