<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
    xmlns:iml="http://www.cs.unibo.it/2006/iml"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:f="http://www.essepuntato.it/XSLT/fuction"
    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
    xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
    xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
    xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
    xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
    xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
    exclude-result-prefixes="xs f office text xlink style draw svg dc table fo iml">
    
    <xsl:output 
        encoding="UTF-8"
        method="xml"
        indent="no" />
    
    <!-- header tabelle -->
    
    <!-- DO NOTHING RULES -->
    <!-- Match with any element that we do not consider in the conversion -->
    <xsl:template match="element()">
        <xsl:apply-templates />
    </xsl:template>
    
    <!-- Any 'a' representing an id (such as, the heading id) -->
    <xsl:template match="text:a[not(contains(@xlink:href,'rash:#')) and contains(@xlink:href,'rash:')]">
        <xsl:apply-templates />
    </xsl:template>
    
    <!-- To add more thing to handle as links, please add the right keyword into the following variable -->
    <xsl:variable name="keywords" select="('index')" as="xs:string+" />
    <xsl:template match="text:a[not(contains(@xlink:href,'rash:#')) and contains(@xlink:href,'rash:') and (some $keyword in $keywords satisfies normalize-space(substring-after(substring-after(@xlink:href,'rash:'),'-')) = $keyword)]" priority="3.0">
        <xsl:variable name="base" select="normalize-space(substring-after(@xlink:href,'rash:'))" />
        <a name="{substring-before($base,'-')}" class="{substring-after($base,'-')}" />
    </xsl:template>
    
    <!-- Any caption for images, tables or formula (that will be handled within these structures) -->
    <xsl:template match="text:p[(@text:style-name = 'Caption') or (some $s in //style:style[@style:parent-style-name = 'Caption']/@style:name satisfies @text:style-name = $s)]" />
    
    <!-- Match with all the notes -->
    <xsl:template match="office:annotation" />
    
    <!-- Match with all the code paragraph directly preceeded by other ones -->
    <xsl:template match="text:p[(starts-with(@text:style-name,'Preformatted') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name satisfies @text:style-name = $s)) and preceding-sibling::text:p[1][starts-with(@text:style-name,'Preformatted') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name satisfies @text:style-name = $s)]]" />
    
    <!-- To avoid change tracking -->
    <xsl:template match="text:tracked-changes" />
    <!-- end of DO NOTHING RULES -->
    
    <!-- TEXT -->
    <xsl:template match="text:line-break">
        <xsl:param name="math" select="false()" tunnel="yes" as="xs:boolean" />
        <xsl:if test="$math">
            <xsl:text>\\</xsl:text>
        </xsl:if>
        <xsl:text>&#xa;</xsl:text>
    </xsl:template>
    
    <!-- DOCUMENT -->
    <xsl:template match="office:text">
        <xsl:variable name="head" select="text:p[some $n in ('Title','Subtitle') satisfies (@text:style-name = $n) or (some $s in //style:style[starts-with(@style:parent-style-name, $n)]/@style:name satisfies @text:style-name = $s)]" as="element()*" />
        
        <xsl:processing-instruction name="xml-model">href="grammar/rash.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"</xsl:processing-instruction>
        
        <html xmlns="http://www.w3.org/1999/xhtml" prefix="schema: http://schema.org/ prism: http://prismstandard.org/namespaces/basic/2.0/ c4o: http://purl.org/spar/c4o/ biro: http://purl.org/spar/biro/">
            <head>
                <!-- Visualisation requirements (mandatory for optimal reading) -->
                <meta charset="UTF-8" > </meta>
                <meta name="viewport" content="width=device-width, initial-scale=1" ></meta>
                <link rel="stylesheet" href="css/bootstrap.min.css" ></link>
                <link rel="stylesheet" href="css/rash.css" ></link>
                <script src="js/jquery.min.js"></script>
                <script src="js/bootstrap.min.js"></script>
                <script src="js/rash.js"></script>
                <!-- /END Visualisation requirements (mandatory for optimal reading) -->
                
                <xsl:apply-templates select="$head" />
            </head>
            <body>
                <xsl:apply-templates select="text:h[1]">
                    <xsl:with-param name="type" select="'root'" tunnel="yes" as="xs:string" />
                </xsl:apply-templates>
                <xsl:call-template name="handle.footnotes" />
            </body>
        </html>
    </xsl:template>
    <!-- end of DOCUMENT -->
    
    <!-- TITLE -->
    <xsl:template match="office:text//text:p[(@text:style-name='Title') or ((some $s in //style:style[starts-with(@style:parent-style-name, 'Title')]/@style:name satisfies @text:style-name = $s))]">
        <title>
            <xsl:value-of select=".//text()" />
        </title>
    </xsl:template>
    <!-- end of TITLE -->
    
    <!-- AUTHORS, CATEGORIES, GENERAL TERMS, KEYWORDS, BLURB -->
    <xsl:template match="office:text//text:p[(@text:style-name = 'Subtitle') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Subtitle')]/@style:name satisfies @text:style-name = $s)]">
        <xsl:variable name="text" select="normalize-space(string-join(.//text() except .//text()[ancestor::text:note],''))" as="xs:string" />
        <xsl:choose>
            <xsl:when test="matches($text,'^categories:','i')">
                <xsl:for-each select="tokenize(substring-after($text,':'),'#')">
                    <!-- <meta name="category" content="{normalize-space()}" /> -->
                    <meta name="dcterms.subject"
                        content="{normalize-space()}" />
                </xsl:for-each>
            </xsl:when>
            <xsl:when test="matches($text,'^keywords:','i')">
                <xsl:for-each select="tokenize(substring-after($text,':'),',')">
                    <!-- <meta name="keyword" content="{normalize-space()}" /> -->
                    <meta property="prism:keyword" content="{normalize-space()}" />
                </xsl:for-each>
            </xsl:when>
            <!--
            <xsl:when test="matches($text,'^general terms:','i')">
                <xsl:for-each select="tokenize(substring-after($text,':'),',')">
                    <meta name="generalterm" content="{normalize-space()}" />
                </xsl:for-each>
            </xsl:when>
            -->
            <xsl:otherwise> <!-- Authors -->
                <xsl:variable name="currentNode" select="." as="element()" />
                <xsl:for-each select="tokenize($text,',')">
                    <xsl:variable name="id" as="xs:string" select="xs:string(position())" />
                    <xsl:variable name="name" as="xs:string" select="normalize-space()" />
                    <!--
                    <meta name="author.{$id}.number" content="{$id}" />
                    <meta name="author.{$id}.name" content="{$name}" />
                    -->
                    <xsl:variable name="initials" as="xs:string" select="lower-case( string-join( (for $s in tokenize($name, ' ') return substring($s, 1, 1)), '') )"  />
                    
                    <meta about="{$initials}" property="schema:name" name="dc.creator" content="{$name}" />
                    <xsl:apply-templates select="$currentNode//text:note[normalize-space(.//text:note-citation/text()) = $id]">
                        <xsl:with-param name="id" select="$id" as="xs:string" />
                        <xsl:with-param name="initials" select="$initials" as="xs:string" />
                    </xsl:apply-templates>
                </xsl:for-each>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="text:note[ancestor::text:p[@text:style-name='Subtitle']/parent::office:text]">
        <xsl:param name="id" as="xs:string" />
        <xsl:param name="initials" as="xs:string" />
        <xsl:variable name="fields" select="tokenize(string-join(.//text:note-body//text(),''),' / ')" as="xs:string*" />
        <xsl:variable name="affiliation" select="normalize-space((for $s in $fields return if (matches($s,'affiliation:','i')) then substring-after($s,':') else '')[normalize-space() != ''])" as="xs:string" />
        <xsl:variable name="email" select="normalize-space(string-join(for $s in $fields return if (matches($s,'email:','i')) then substring-after($s,':') else '',''))" as="xs:string" />
        
        <xsl:variable name="indexBlurb" select="string-join(.//text:note-body//text(),'')"></xsl:variable>
        <!-- <xsl:variable name="blurb" select="substring-after(normalize-space(string-join(.//text:note-body//text(),'')),'lurb:')" as="xs:string*" /> -->

        <xsl:variable name="affiliation-ref" as="xs:string" select="lower-case( string-join( (for $s in tokenize($affiliation, ' ') return substring($s, 1, 1)), '') )"  />
        
        <xsl:if test="$affiliation != ''">
            <link about="{$initials}" property="schema:affiliation" href="{$affiliation-ref}" />
            <!-- TODO: eliminare ripetizione affiliazioni -->
            <meta about="{$affiliation-ref}" property="schema:name"
                content="{$affiliation}" />
            
        </xsl:if>
        <xsl:if test="$email != ''">
            <meta about="{$initials}" property="schema:email" content="{$email}" />
        </xsl:if>
<!--
        <xsl:if test="$blurb != ''">
            <meta name="author.{$id}.blurb" content="{$blurb}" />
        </xsl:if>
-->
    </xsl:template>
    <!-- end of AUTHORS, CATEGORIES, GENERAL TERMS, KEYWORDS -->
    
    <!-- FOOTNOTE -->
    <xsl:template match="text:note">
        <a class="footnote" href="#{@text:id}" />
    </xsl:template>
    
    <xsl:template name="handle.footnotes">
        <xsl:variable name="footnotes" select="//text:note[not(ancestor::text:p[@text:style-name = 'Subtitle'])]" as="element()*" />
        <xsl:if test="$footnotes">
            <div class="footnotes">
                <xsl:for-each select="$footnotes">
                    <div id="{./@text:id}">
                        <xsl:apply-templates select="text:note-body/element()" />
                    </div>
                </xsl:for-each>
            </div>
        </xsl:if>
    </xsl:template>
    <!-- end FOOTNOTE -->
    
    <!-- TAB -->
    <xsl:template match="text:tab">
        <xsl:text>  </xsl:text>
    </xsl:template>
    <!-- end of TAB -->
    
    <!-- HEADINGS -->
    <xsl:template match="text:h|text:p[starts-with(@text:style-name, 'Heading')]">
        <xsl:variable name="next.header" select="(following-sibling::text:h|following-sibling::text:p[starts-with(@text:style-name, 'Heading')])[1]" as="element()*" />
        <xsl:variable name="level" select="if (self::text:p) then substring(@text:style-name,string-length(@text:style-name)) else @text:outline-level" as="xs:string" />
        <xsl:variable name="type" as="xs:string" select="if (exists(text:a[starts-with(@xlink:href,'rash:')])) then substring-after(substring-after(text:a[starts-with(@xlink:href,'rash:')][1]/@xlink:href,'rash:'),'-') else 'section'" />
        <div>
            <xsl:call-template name="set.header.properties" />
            
            <h1>
                <xsl:apply-templates />
            </h1>
            <xsl:apply-templates select="(following-sibling::text()|following-sibling::element()) except $next.header/(.|following-sibling::text()|following-sibling::element())">
                <xsl:with-param name="type" select="$type" as="xs:string" tunnel="yes" />
            </xsl:apply-templates>
            
            <!-- If the next header has a higher level, call it -->
            <xsl:variable name="nextLevel" as="xs:integer" select="xs:integer(if ($next.header/self::text:p) then substring($next.header/@text:style-name,string-length($next.header/@text:style-name)) else $next.header/@text:outline-level)"/>
            <xsl:if test="exists($next.header) and $nextLevel > xs:integer($level)">
                <xsl:apply-templates select="$next.header" />
            </xsl:if>
        </div>
        <xsl:choose>
            <xsl:when test="$level = '1'">
                <xsl:apply-templates select="(following-sibling::text:h[@text:outline-level = '1']|following-sibling::text:p[starts-with(@text:style-name, 'Heading') and substring(@text:style-name,string-length(@text:style-name)) = '1'])[1]" />
            </xsl:when>
            <xsl:when test="$level = '2'">
                <xsl:apply-templates select="(following-sibling::text:h[some $l in ('1','2') satisfies @text:outline-level = $l]|following-sibling::text:p[starts-with(@text:style-name, 'Heading') and (some $l in ('1','2') satisfies substring(@text:style-name,string-length(@text:style-name)) = $l)])[1][if (self::text:p) then substring(@text:style-name,string-length(@text:style-name)) = $level else @text:outline-level = $level]" />
            </xsl:when>
            <xsl:when test="$level = '3'">
                <xsl:apply-templates select="(following-sibling::text:h[some $l in ('1','2','3') satisfies @text:outline-level = $l]|following-sibling::text:p[starts-with(@text:style-name, 'Heading') and (some $l in ('1','2','3') satisfies substring(@text:style-name,string-length(@text:style-name)) = $l)])[1][if (self::text:p) then substring(@text:style-name,string-length(@text:style-name)) = $level else @text:outline-level = $level]" />
            </xsl:when>
            <xsl:when test="$level = '4'">
                <xsl:apply-templates select="(following-sibling::text:h[some $l in ('1','2','3','4') satisfies @text:outline-level = $l]|following-sibling::text:p[starts-with(@text:style-name, 'Heading') and (some $l in ('1','2','3','4') satisfies substring(@text:style-name,string-length(@text:style-name)) = $l)])[1][if (self::text:p) then substring(@text:style-name,string-length(@text:style-name)) = $level else @text:outline-level = $level]" />
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="set.header.properties">
        <xsl:variable name="a" select="text:a[starts-with(@xlink:href,'rash:')]" as="element()*" />
        <xsl:choose>
            <xsl:when test="exists($a)">
                <xsl:call-template name="set.properties">
                    <xsl:with-param name="attr" select="$a[1]/@xlink:href" as="attribute()" />
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:attribute name="class" select="'section'" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="set.properties">
        <xsl:param name="attr" as="attribute()" />
        <xsl:variable name="id" select="substring-before(substring-after($attr,'rash:'),'-')" as="xs:string" />
        <xsl:variable name="type" select="substring-after(substring-after($attr,'rash:'),'-')" as="xs:string" />
        <xsl:if test="$id != ''">
            <xsl:attribute name="id" select="$id" />
        </xsl:if>
        <xsl:if test="$type != ''">
            <xsl:attribute name="class" select="$type" />
        </xsl:if>
    </xsl:template>
    <!-- end of HEADINGS -->
    
    <!-- LINKS -->
    <xsl:template match="text:a">
        <xsl:variable name="ref" select="@xlink:href" as="xs:string" />
        <a href="{@xlink:href}">
            <xsl:apply-templates />
        </a>
    </xsl:template>
    
    <xsl:template match="text:a[contains(@xlink:href,'rash:#')]">
        <xsl:variable name="element" select="." as="element()" />
        <xsl:variable name="ref" select="substring-after(@xlink:href,'rash:#')" as="xs:string" />
        <xsl:variable name="prec" select="($element/preceding-sibling::element()|$element/preceding-sibling::text())" as="node()*" />
        
        <!-- Se non ci sono ripetizioni vicine di riferimenti, ovvero nessuno degli elementi precedenti dello stesso tipo separati da soli spazi, allora aggiungi il link -->
        <xsl:variable name="first-non-empty-text-or-element" select="f:getFirstNonEmptyTextOrElement(reverse($prec))" as="node()?"/>
        <xsl:if test="not($first-non-empty-text-or-element) or $first-non-empty-text-or-element[self::text()] or not($first-non-empty-text-or-element[self::text:a and contains(@xlink:href,'rash:#') and substring-after(@xlink:href,'rash:#') = $ref])">
            <a class="ref" href="#{$ref}" />
        </xsl:if>
    </xsl:template>
    
    <xsl:function name="f:getFirstNonEmptyTextOrElement" as="node()?">
        <xsl:param name="seq" as="node()*" />
        
        <xsl:if test="exists($seq)">
            <xsl:variable name="current" select="$seq[1]" as="node()" />
            <xsl:choose>
                <xsl:when test="$current[self::text()]">
                    <xsl:choose>
                        <xsl:when test="normalize-space($current) = ''">
                            <xsl:sequence select="f:getFirstNonEmptyTextOrElement(subsequence($seq,2))" />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$current" />
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:sequence select="$current" />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:function>
    <!-- end of LINKS -->
    
    <!-- PARAGRAPH -->
    <xsl:template match="text:p">
        <p>
            <xsl:if test="starts-with(@text:style-name,'Quotations') or (some $s in //style:style[@style:parent-style-name = 'Quotations']/@style:name satisfies @text:style-name = $s)">
                <xsl:attribute name="class" select="'quote'" />
            </xsl:if>
            <xsl:if test="starts-with(@text:style-name,'Illustration') or (some $s in //style:style[@style:parent-style-name = 'Illustration']/@style:name satisfies @text:style-name = $s)">
                <xsl:attribute name="class" select="'math'" />
            </xsl:if>
            <xsl:apply-templates>
                <xsl:with-param name="math" as="xs:boolean" select="true()" tunnel="yes" />
            </xsl:apply-templates>
        </p>
    </xsl:template>
    
    
    <xsl:template match="text()[matches(../../../preceding::text:h[1]/text:a[1]/@xlink:href,'rash:.*-bibliography')]">
        <xsl:param name="curId" as="xs:string" tunnel="yes" />
        <xsl:choose>
            <xsl:when test="starts-with(., $curId)">
                <!-- <xsl:value-of select="normalize-space(substring-after(., concat($curId, '.') ) )" /> -->
                <xsl:value-of select="replace(substring-after(., concat($curId, '.') ), '^\s+', '')" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <!--
    <xsl:template match="text:p[matches(../preceding::text:h[1]/text:a[1]/@xlink:href,'rash:.*-bibliography')]">
        <p>
            <xsl:apply-templates>
            </xsl:apply-templates>
        </p>
    </xsl:template>
    -->
    
    <xsl:template match="text:p[starts-with(@text:style-name,'Illustration') or (some $s in //style:style[@style:parent-style-name = 'Illustration']/@style:name satisfies @text:style-name = $s)]" priority="2.0">
        <p class="math">
            <xsl:apply-templates />
        </p>
    </xsl:template>
    
    <!-- Containing line breaks -->
    <xsl:template match="text:p[.//text:line-break]">
        <xsl:variable name="content" select="element()|text()" as="node()*" />
        <xsl:variable name="alllinebreaks" select=".//(element()|text())" as="node()*" />
        <xsl:variable name="isQuotation" select="starts-with(@text:style-name,'Quotations') or (some $s in //style:style[@style:parent-style-name = 'Quotations']/@style:name satisfies @text:style-name = $s)" as="xs:boolean"/>
        <xsl:variable name="totPar" select="count(.//text:line-break) + 1" as="xs:integer" />
        
        <xsl:for-each select="1 to $totPar">
            <xsl:variable name="num" select="." as="xs:integer" />
            <p>
                <xsl:if test="$isQuotation">
                    <xsl:attribute name="class" select="'quote'" />
                </xsl:if>
                
                <xsl:apply-templates select="$content except (if ($num = 1) then () else $alllinebreaks[self::text:line-break][$num - 1]/(.|preceding::element()|preceding::text()|ancestor::element()), if ($num = $totPar) then () else $alllinebreaks[self::text:line-break][$num]/(.|following::element()|following::text()))" />
            </p>
        </xsl:for-each>
    </xsl:template>
    
    <!-- Preformatted -->
    <xsl:template match="text:p[(starts-with(@text:style-name,'Preformatted') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name satisfies @text:style-name = $s)) and preceding-sibling::text:p[1][not(starts-with(@text:style-name,'Preformatted') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name satisfies @text:style-name = $s))]]">
        
        <xsl:variable name="allCodes" select="following-sibling::text:p[starts-with(@text:style-name,'Preformatted') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name satisfies @text:style-name = $s)]" as="element()*" />
        <xsl:variable name="firstNonCode" select="following-sibling::element()[not(self::text:p[starts-with(@text:style-name,'Preformatted') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name satisfies @text:style-name = $s)])][1]" as="element()*" />
        
        <p class="code">
            <xsl:apply-templates />
            <xsl:for-each select="$allCodes except $firstNonCode/(.|following-sibling::element())">
                <xsl:text>&#xa;</xsl:text>
                <xsl:apply-templates />
            </xsl:for-each>
        </p>
    </xsl:template>
    <!-- end of PARAGRAPH -->
    
    <!-- IMAGES -->
    <xsl:template match="text:p[exists(element()[not(self::text:soft-page-break)][1]/(self::draw:frame|.//draw:frame)|element()[1]//draw:frame) and empty(element()[not(self::text:soft-page-break)][1]/preceding-sibling::text()[normalize-space() != ''])]">
        <xsl:variable name="el" select="(.//draw:frame)[1]" as="element()" />
        <xsl:variable name="caption" select="(following-sibling::element())[1][self::text:p][(@text:style-name = 'Caption') or (some $s in //style:style[@style:parent-style-name = 'Caption']/@style:name satisfies @text:style-name = $s)]" as="element()" />
        <div>
            <xsl:call-template name="set.properties">
                <xsl:with-param name="attr" select="$el/@draw:name" as="attribute()" />
            </xsl:call-template>
            <p class="img_block">
                <xsl:apply-templates select="$el" >
                    <xsl:with-param name="caption" select="string-join($caption//text(), ' ')" />
                </xsl:apply-templates>
            </p>
            
            <xsl:apply-templates select="$caption" mode="caption" />
        
        </div>
    </xsl:template>
    
    <xsl:template match="draw:frame">
        <xsl:param name="caption" />
        <img class="{@svg:width}-{@svg:height}" src="{substring-after(draw:image/@xlink:href,'Pictures/')}" alt='{$caption}'/>
    </xsl:template>
    
    <xsl:template match="element()" mode="caption">
        <p class="caption">
            <xsl:apply-templates />
        </p>
    </xsl:template>
    <!-- end of IMAGES -->
    
    <!-- LISTS -->
    <xsl:template match="text:list[some $s in //text:list-style[exists(element()[1][self::text:list-level-style-bullet])]/@style:name satisfies @text:style-name = $s]">
        <xsl:call-template name="bulleted" />
    </xsl:template>
    
    <xsl:template match="text:list[some $s in //text:list-style[exists(element()[1][self::text:list-level-style-number])]/@style:name satisfies @text:style-name = $s]">
        <xsl:call-template name="numbered" />
    </xsl:template>
    
    <xsl:template match="text:list">
        <xsl:param name="type" select='bulleted' tunnel="yes" />
        
        <xsl:choose>
            <xsl:when test="$type = 'number'">
                <xsl:call-template name="numbered" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="bulleted" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="bulleted">
        <ul>
            <xsl:apply-templates>
                <xsl:with-param name="type" select="'bullet'" tunnel="yes" />
            </xsl:apply-templates>            
        </ul>
    </xsl:template>
    
    <xsl:template name="numbered">
        <xsl:variable name="curName" select="@text:style-name" as="xs:string*" />
        <xsl:variable name="curNum" select="//text:list-style[@style:name = $curName][1]/text:list-level-style-number[1]/@text:start-value" as="attribute()*" />
        <xsl:variable name="startValue" select="if (empty($curNum)) then 1 else xs:integer($curNum)" as="xs:integer" />
        
        <ol>
            <xsl:choose>
                <xsl:when test="@text:continue-numbering = 'true'">
                    <xsl:attribute name="value" select="count(preceding-sibling::text:list/text:list-item) + 1" />
                </xsl:when>
                <xsl:when test="exists($curNum)">
                    <xsl:attribute name="value" select="$startValue" />
                </xsl:when>
            </xsl:choose>
            
            <xsl:apply-templates>
                <xsl:with-param name="type" select="'number'" tunnel="yes" />
            </xsl:apply-templates>
        </ol>
    </xsl:template>
    
    <xsl:template match="text:list-item">
        <li>
            <xsl:apply-templates />
        </li>
    </xsl:template>
    <!-- end of LISTS -->
    
    <!-- TABLE -->
    <xsl:template match="table:table">
        <xsl:variable name="caption" select="(following-sibling::element())[1][self::text:p][(@text:style-name = 'Caption') or (some $s in //style:style[@style:parent-style-name = 'Caption']/@style:name satisfies @text:style-name = $s)]" as="element()*" />
        <xsl:variable name="id" select="substring-after(@table:name,'rash:')" as="xs:string" />
        <xsl:variable name="stylename" select="@table:style-name" as="xs:string*" />
        <div class="table">
            <xsl:if test="$id != ''">
                <xsl:attribute name="id" select="$id" />
            </xsl:if>
            <table> 
                <!-- width="{//style:style[(if (empty($stylename)) then false() else @style:name = $stylename) or @style:name = concat('rash:',$id)]/style:table-properties/@style:width}"> -->
                <xsl:apply-templates />
            </table>
            
            <xsl:apply-templates select="$caption" mode="caption" />
        </div>
    </xsl:template>
    
    <xsl:template match="table:table-row">
        <tr>
            <xsl:apply-templates />
        </tr>
    </xsl:template>
    
    <xsl:template match="table:table-cell[exists(.//text:p[matches(@text:style-name,'^Table.*Heading$') or matches(@text:parent-style-name,'^Table.*Heading$') or (some $s in //style:style[matches(@style:parent-style-name,'^Table.*Heading$')]/@style:name satisfies @text:style-name = $s)])]">
        <th> <!-- width="{f:calculateMean(.)}"> -->
            <!-- TODO: non sono consentiti paragrafi in th. Verificare, e trovare metodo migliore di questo -->
            <xsl:apply-templates select="text:p/node()" />
        </th>
    </xsl:template>
    
    <xsl:template match="table:table-cell[exists(.//text:p[matches(@text:style-name,'^Table.*Contents') or matches(@text:parent-style-name,'^Table.*Contents') or (some $s in //style:style[matches(@style:parent-style-name,'^Table.*Contents')]/@style:name satisfies @text:style-name = $s)])]">
        <td> <!-- width="{f:calculateMean(.)}"> -->
            <xsl:apply-templates />
        </td>
    </xsl:template>
    
    <xsl:function name="f:calculateMean" as="xs:string">
        <xsl:param name="cell" as="element()" />
        <xsl:variable name="pos" as="xs:integer" select="count($cell/preceding-sibling::table:table-cell) + 1" />
        <xsl:variable name="col-pos" as="xs:integer" select="count($cell/ancestor::table:table[1]/table:table-column[sum(for $prev in (preceding-sibling::table:table-column) return if (exists(@table:number-columns-repeated)) then xs:integer(@table:number-columns-repeated) - 1 else 1) &lt; $pos and $pos &lt;= (sum(for $prev in (preceding-sibling::table:table-column) return if (exists(@table:number-columns-repeated)) then xs:integer(@table:number-columns-repeated) - 1 else 1) + (if (exists(@table:number-columns-repeated)) then xs:integer(@table:number-columns-repeated) - 1 else 1))]/preceding-sibling::table:table-column) + 1"/>
        <xsl:variable name="name" select="$cell/ancestor::table:table[1]/table:table-column[$col-pos]/@table:style-name" as="xs:string" />
        <xsl:variable name="cur" select="xs:double(for $style in (root($cell)//style:style[@style:name = $name]/style:table-column-properties) return if (exists($style/@style:column-width)) then substring-before($style/@style:column-width,'cm') else substring-before($style/@style:rel-column-width,'*'))" as="xs:double" />
        
        <xsl:variable name="tot" select="sum(for $c in $cell/ancestor::table:table[1]/table:table-column return xs:double(for $style in (root($cell)//style:style[@style:name = $c/@table:style-name]/style:table-column-properties) return if (exists($style/@style:column-width)) then substring-before($style/@style:column-width,'cm') else substring-before($style/@style:rel-column-width,'*')))" as="xs:double" />
        
        <xsl:value-of select="concat(xs:string(($cur div $tot) * 100),'%')" />
    </xsl:function>
    <!-- end of TABLE -->
    
    <!-- EMPHASIS, SUPERSCRIPT, SUBSCRIPT & COURIER FONT -->
    <xsl:template match="text:span">
        <xsl:variable name="isBold" select="some $s in //style:style[style:text-properties/@fo:font-weight = 'bold']/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        <xsl:variable name="isItalic" select="some $s in //style:style[style:text-properties/@fo:font-style = 'italic']/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        <xsl:variable name="isCourier" select="starts-with(@text:style-name,'Source') or (some $s in //style:style[contains(style:text-properties/@style:font-name,'Courier')]/@style:name satisfies @text:style-name = $s)" as="xs:boolean" />
        <xsl:variable name="isSuperscript" select="some $s in //style:style[starts-with(style:text-properties/@style:text-position,'super')]/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        <xsl:variable name="isSubscript" select="some $s in //style:style[starts-with(style:text-properties/@style:text-position,'sub')]/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        
        <xsl:call-template name="add.inline">
            <xsl:with-param name="super" as="xs:boolean" tunnel="yes" select="$isSuperscript" />
            <xsl:with-param name="sub" as="xs:boolean" tunnel="yes" select="$isSubscript" />
            <xsl:with-param name="bold" as="xs:boolean" tunnel="yes" select="$isBold" />
            <xsl:with-param name="italic" as="xs:boolean" tunnel="yes" select="$isItalic" />
            <xsl:with-param name="courier" as="xs:boolean" tunnel="yes" select="if (empty(ancestor::text:p[starts-with(@text:style-name,'Preformatted') or (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name satisfies @text:style-name = $s)])) then $isCourier else false()" />
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template name="add.inline">
        <xsl:param name="bold" as="xs:boolean" tunnel="yes" />
        <xsl:param name="italic" as="xs:boolean" tunnel="yes" />
        <xsl:param name="super" as="xs:boolean" tunnel="yes" />
        <xsl:param name="sub" as="xs:boolean" tunnel="yes" />
        <xsl:param name="courier" as="xs:boolean" tunnel="yes" />
        
        <xsl:choose>
            <xsl:when test="$super">
                <span class="sup">
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="super" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$sub">
                <span class="sub">
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="sub" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$bold">
                <b>
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="bold" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </b>
            </xsl:when>
            <xsl:when test="$italic">
                <i>
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="italic" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </i>
            </xsl:when>
            <xsl:when test="$courier">
                <span class="code">
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="courier" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <!-- end of EMPHASIS, SUPERSCRIPT, SUBSCRIPT & COURIER FONT -->
    
    <!-- BIBLIOGRAPHY -->
    
    
    <!-- TODO - controllare: non capisco perché questa complicazione... -->
    <xsl:template match="text:list-item[matches(preceding::text:h[1]/text:a[1]/@xlink:href,'rash:.*-bibliography')]">
        <xsl:variable name="joint" select="string-join(.//text(),'')" as="xs:string" />
        <xsl:variable name="curId" select="normalize-space(substring-before($joint,'.'))" as="xs:string" />
        <xsl:if test="//text:a[contains(@xlink:href,'rash:#') and substring-after(@xlink:href,'rash:#') = $curId]">
            <li>
                <xsl:choose>
                    <xsl:when test="string-length($curId) > 0">
                        <xsl:attribute name="id" select="$curId" />
                        <!-- MODIFICATO -->
                        <!-- <p><xsl:value-of select="normalize-space(substring-after($joint,'.'))" /></p> -->
                        <xsl:apply-templates select="text:p">
                            <xsl:with-param name="curId" select="$curId" as="xs:string" tunnel="yes"/>
                        </xsl:apply-templates>
                    </xsl:when>
                    <xsl:otherwise>
                        <p><xsl:value-of select="$joint" /></p>
                    </xsl:otherwise>
                </xsl:choose>
            </li>
        </xsl:if>
    </xsl:template>
    <!-- end of BIBLIOGRAPHY -->
</xsl:stylesheet>
