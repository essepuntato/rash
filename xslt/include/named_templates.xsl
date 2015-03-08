<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:iml="http://www.w3.org/1999/xhtml" 
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:fo="http://www.w3.org/1999/XSL/Format" 
    xmlns:m="http://www.w3.org/1998/Math/MathML"
    xmlns:f="http://www.essepuntato.it/XSLT/fuction">

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
    
    <xsl:template name="footnote_verb">
        <xsl:call-template name="n" />
        <xsl:text>\usepackage{fancyvrb}</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>\VerbatimFootnotes</xsl:text>
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
                <xsl:text>{></xsl:text>
                <xsl:for-each select="1 to $nCol">
                    <xsl:text>>{\hsize=</xsl:text>
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
        <xsl:variable name="cur.lang" select="if (exists(@xml:lang)) then @xml:lang else $lang"/>

        <xsl:for-each select="$select">
            <xsl:apply-templates select=".">
                <xsl:with-param name="lang"
                    select="if (empty(@xml:lang)) then $cur.lang else @xml:lang" as="xs:string"
                    tunnel="yes"/>
            </xsl:apply-templates>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="text()[empty(ancestor::element()[some $token in tokenize(@class, ' ') satisfies $token = 'code'])]">
        <xsl:value-of select="f:replace(.)"/>
    </xsl:template>
    
    <xsl:template match="text()[exists(ancestor::element()[some $token in tokenize(@class, ' ') satisfies $token = 'quote'])]" priority="1.2">
        <xsl:value-of select="replace(f:replace(.),'&#xa;','&#xa;&#xa;')"/>
    </xsl:template>
    
    <xsl:template match="text()[exists(ancestor::element()[some $token in tokenize(@class, ' ') satisfies $token = 'code'])]">
        <xsl:value-of select="f:replaceCode(.)"/>
    </xsl:template>
    
    <xsl:function name="f:replace" as="xs:string">
        <xsl:param name="input" as="xs:string" />
        <xsl:value-of select="f:replaceForLaTeX($input,1,false())" />
    </xsl:function>
    
    <xsl:function name="f:replaceCode" as="xs:string">
        <xsl:param name="input" as="xs:string" />
        <xsl:value-of select="f:replaceForLaTeX($input,1,true())" />
    </xsl:function>
    
    <xsl:function name="f:replaceForLaTeX" as="xs:string">
        <xsl:param name="input" as="xs:string" />
        <xsl:param name="count" as="xs:integer" />
        <xsl:param name="isCode" as  ="xs:boolean" />
        <xsl:variable name="original" select="('–','—','“','”','_','%','&amp;','±','#','à','è','È','é','ì','ò','ù','…','\^','&lt;','&gt;','~','≡','⊥','⊤','∀','∃','≤','¬','⊑','⊓','⊔','á','í','ó','ú','\$','‘','’')" as="xs:string*" />
        <xsl:variable name="replacement" select="('--', '---', '``',&quot;''&quot;,'\\_','\\%','\\&amp;','\$\\pm\$','\\#','\\`a','\\`e','\\`E',&quot;\\'e&quot;,'\\`i','\\`o','\\`u','...','\\textasciicircum','\\textless{}','\\textgreater{}','\\char`\\~','\\equiv','\\bot','\\top','\\forall','\\exists','\\leq','\$\\neg\$','\$\\sqsubseteq\$','\$\\sqcap\$','\$\\sqcup\$',&quot;\\'a&quot;,&quot;\\'i&quot;,&quot;\\'o&quot;,&quot;\\'u&quot;,'\\\$','`',&quot;'&quot;)" as="xs:string*" />
        
        <xsl:variable name="code.original" select="('“','”','…','≡','⊥','⊤','∀','∃','≤','¬','⊑','⊓','⊔','#','\$','‘','’')" as="xs:string*" />
        <xsl:variable name="code.replacement" select="('&quot;','&quot;','...','\$\\equiv\$','\$\\bot\$','\$\\top\$','\$\\forall\$','\$\\exists\$','\$\\leq\$','\$\\neg\$','\$\\sqsubseteq\$','\$\\sqcap\$','\$\\sqcup\$','\$\\#\$','\$\\\$\$',&quot;'&quot;,&quot;'&quot;)" as="xs:string*" />
        
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
            <xsl:when test="$el[some $token in tokenize(@class, ' ') satisfies $token = 'table']">
                <xsl:variable name="str" select="('Tabella','Table','Table')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\</xsl:text>
                <xsl:value-of select="if ($use.pages) then 'v' else ''" />
                <xsl:text>ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@class, ' ') satisfies $token = 'picture']">
                <xsl:variable name="str" select="('Figura','Figure','Fig.')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\</xsl:text>
                <xsl:value-of select="if ($use.pages) then 'v' else ''" />
                <xsl:text>ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@class, ' ') satisfies $token = 'section']">
                <xsl:variable name="str" select="('Sezione','Section','Section')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@class, ' ') satisfies $token = 'chapter']">
                <xsl:variable name="str" select="('Capitolo','Chapter','Chapter')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
                <xsl:text>~\ref{</xsl:text>
                <xsl:value-of select="$id" />
                <xsl:text>}</xsl:text>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@class, ' ') satisfies $token = 'abstract']">
                <xsl:variable name="i" select="index-of($all.languages,$lang)" as="xs:integer*"/>
                <xsl:variable name="str" select="('Sommario','Abstract','Abstract')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
            </xsl:when>
            <xsl:when test="$el[some $token in tokenize(@class, ' ') satisfies $token = 'bibliography']">
                <xsl:variable name="i" select="index-of($all.languages,$lang)" as="xs:integer*"/>
                <xsl:variable name="str" select="('Bibliografia','Bibliography','Bibliopraphy')" as="xs:string*"/>
                <xsl:value-of select="$str[$i]"/>
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
    
    <xsl:template name="lset">
        <xsl:call-template name="n" />
        <xsl:text>\lstset{literate=%</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ö}{{\"O}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ä}{{\"A}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ü}{{\"U}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ß}{{\ss}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ü}{{\"u}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ä}{{\"a}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ö}{{\"o}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ą}{{\k{a}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ć}{{\'c}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ę}{{\k{e}}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ł}{{\l{}}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ń}{{\'n}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ó}{{\'o}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ś}{{\'s}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ż}{{\.z}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ź}{{\'z}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ą}{{\k{A}}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ć}{{\'C}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ę}{{\k{E}}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ł}{{\L{}}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ń}{{\'N}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ó}{{\'O}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ś}{{\'S}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ż}{{\.Z}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ź}{{\'Z}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ć}{{\'c}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{č}{{\v{c}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{đ}{{\dj{}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{š}{{\v{s}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ž}{{\v{z}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ć}{{\'C}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Č}{{\v{C}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Đ}{{\DJ{}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Š}{{\v{S}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ž}{{\v{Z}}}1 </xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{é}{{\'{e}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{è}{{\`{e}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ê}{{\^{e}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ë}{{\¨{e}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{û}{{\^{u}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ù}{{\`{u}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ú}{{\'{u}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{â}{{\^{a}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{à}{{\`{a}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{î}{{\^{i}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{ç}{{\c{c}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ç}{{\c{C}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{É}{{\'{E}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Ê}{{\^{E}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{À}{{\`{A}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Â}{{\^{A}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>{Î}{{\^{I}}}1</xsl:text>
        <xsl:call-template name="n" />
        <xsl:text>}</xsl:text>
        <xsl:call-template name="n" />
    </xsl:template>
</xsl:stylesheet>
