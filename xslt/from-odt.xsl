<?xml version="1.0" encoding="UTF-8"?>
<!-- 
From ODT to RASH XSLT transformation file - Version 1.2.1, March 22, 2016
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
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
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
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
    exclude-result-prefixes="xs xd f office text xlink style draw svg dc table fo meta">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Oct 24, 2015</xd:p>
            <xd:p><xd:b>Author:</xd:b> Silvio Peroni</xd:p>
            <xd:p>This XSLT document allows the conversion of any ODT document into RASH.</xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:output 
        encoding="UTF-8"
        method="xml" 
        indent="yes" />
    
    <!-- 
        This parameters refers to the base path that all the URL of the CSS files 
        of the final RASH document should have.
    -->
    <xsl:param name="basecss" select="'./'" />
    
    <!-- 
        This parameters refers to the base path that all the URL of the Javascript files 
        of the final RASH document should have.
    -->
    <xsl:param name="basejs" select="'./'" />
    
    <!-- 
        This parameters refers to the base path that all the URL of the RelaxNG files 
        of the final RASH document should have.
    -->
    <xsl:param name="baserng" select="'./'" />
    
    <!-- 
        This parameters refers to the base path that all the URL of the image files 
        of the final RASH document should have.
    -->
    <xsl:param name="baseimg" select="'./'" />
    
    <!-- 
        This parameters refers to the directory that contains the actual XML content 
        of the ODT document to trnasform.
    -->
    <xsl:param name="dir" select="'./'" />
    
    <!-- This variable is used to remove separators in captions -->
    <xsl:variable name="subcap" select="'^[!,\.:;\?\|\-\s]+'" as="xs:string" />
    
    <!-- 
        These variables are used for identifying the text of the headings referring to the 
        sections abstract, acknowledgements and bibliography 
    -->
    <xsl:variable name="abstract" select="('abstract', 'summary')" as="xs:string+" />
    <xsl:variable name="acknowledgements" select="('acknowledgements', 'acknowledgement')" as="xs:string+" />
    <xsl:variable name="bibliography" select="('bibliography', 'references', 'reference')" as="xs:string+" />
    
    <xd:doc scope="/">
        <xd:desc>
            <xd:p>This template is in charge of starting the transformation.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <xsl:apply-templates>
            <xsl:with-param name="preformatted" select="false()" tunnel="yes" as="xs:boolean" />
            <xsl:with-param name="caption" select="false()" tunnel="yes" as="xs:boolean" />
        </xsl:apply-templates>
    </xsl:template>
    
    <xd:doc scope="office:text">
        <xd:desc>
            <xd:p>This template is in charge of creating the whole structure of the document in RASH.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="office:text">
        <xsl:processing-instruction name="xml-model">href="<xsl:value-of select="$baserng" />rash.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"</xsl:processing-instruction>
        
        <html 
            xmlns="http://www.w3.org/1999/xhtml" 
            prefix="schema: http://schema.org/ prism: http://prismstandard.org/namespaces/basic/2.0/">
            <head>
                <!-- Visualisation requirements (mandatory for optimal reading) -->
                <meta charset="UTF-8"></meta>
                <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
                <link rel="stylesheet" href="{$basecss}bootstrap.min.css"></link>
                <link rel="stylesheet" href="{$basecss}rash.css"></link>
                <script src="{$basejs}jquery.min.js"><xsl:text> </xsl:text></script>
                <script src="{$basejs}bootstrap.min.js"><xsl:text> </xsl:text></script>
                <script src="{$basejs}rash.js"><xsl:text> </xsl:text></script>
                <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"><xsl:text> </xsl:text></script>
                <!-- /END Visualisation requirements (mandatory for optimal reading) -->
                
                <xsl:call-template name="add.title" />
                <xsl:call-template name="add.meta" />
            </head>
            <body>
                <xsl:choose>
                    <xsl:when test="text:h">
                        <!-- Call all the elements before the first heading (if any) -->
                        <xsl:apply-templates select="text:h[1]/preceding-sibling::element()" />
                        
                        <!-- Call all the remaining elements (i.e., starting from the first heading) -->
                        <xsl:apply-templates select="text:h[1]" />
                    </xsl:when>
                    <xsl:otherwise>
                        <!-- Call all the elements (base case) -->
                        <xsl:apply-templates />
                    </xsl:otherwise>
                </xsl:choose>
                
                <xsl:call-template name="add.footnotes" />
            </body>
        </html>
    </xsl:template>
    
    <xd:doc scope="text:h">
        <xd:desc>
            <xd:p>This template is in charge of creating the headings.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:h|text:p[starts-with(@text:style-name, 'Heading')]">
        <xsl:variable 
            name="next.header"
            select="(following-sibling::text:h|following-sibling::text:p[
                        starts-with(@text:style-name, 'Heading')])[1]" as="element()*" />
        <xsl:variable name="level" select="f:getLevel(.)" as="xs:integer" />
        <section>
            <xsl:call-template name="set.bookmarked.object.id" />
            <xsl:call-template name="set.section.type" />
            <h1>
                <xsl:apply-templates />
            </h1>
            <xsl:apply-templates 
                select="(following-sibling::text()|following-sibling::element()) except
                            $next.header/(.|following-sibling::text()|following-sibling::element())" />
            
            <!-- If the next header exists and has a higher level (it is starts a subsection), call it -->
            <xsl:if test="$next.header">
                <xsl:variable name="nextLevel" as="xs:integer" select="f:getLevel($next.header)" />
                <xsl:if test="$nextLevel > xs:integer($level)">
                    <xsl:apply-templates select="$next.header" />
                </xsl:if>
            </xsl:if>
        </section>
        
        <xsl:call-template name="get.following.content.elements">
            <xsl:with-param name="curlev" select="$level" />
        </xsl:call-template>
    </xsl:template>
    
    <xd:doc scope="text:p">
        <xd:desc>
            <xd:p>This template is in charge of creating the paragraph that may contains figure/formula boxes.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:p[.//draw:frame/draw:text-box]">
        <!-- Create a paragraph containing all the nodes that are not part of the figure/formula -->
        <xsl:variable name="pnodes" 
            select="(element() except (draw:frame[draw:text-box]|element()[.//draw:frame[draw:text-box]])) |
                text()" as="node()*" />
        <xsl:if test="some $n in $pnodes satisfies normalize-space($n) != ''">
            <p>
                <xsl:apply-templates select="$pnodes" />
            </p>
        </xsl:if>
        
        <xsl:apply-templates select=".//draw:frame[draw:text-box]" />
    </xsl:template>
    
    <xd:doc scope="draw:frame[draw:text-box and .//draw:frame]">
        <xd:desc>
            <xd:p>This template is in charge of creating the figure/formula boxes.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="draw:frame[draw:text-box and .//draw:frame]">
        <xsl:variable name="isFormula" select="exists(.//svg:desc[. = 'formula'])" as="xs:boolean" />
        <xsl:variable name="caption" 
            select="draw:text-box/text:p[text:sequence]" as="element()*" />
            
        <figure>
            <xsl:call-template name="set.captioned.object.id">
                <xsl:with-param name="caption" select="$caption" />
            </xsl:call-template>
            <p>
                <xsl:apply-templates select=".//draw:frame" /> 
            </p>
            
            <xsl:if test="not($isFormula)">
                <xsl:call-template name="add.caption">
                    <xsl:with-param name="caption" select="f:getCaptionNodes($caption)" as="node()*" />
                </xsl:call-template>
            </xsl:if>
        </figure>
    </xsl:template>
    
    <xd:doc scope="draw:frame[draw:text-box and not(.//draw:frame)]">
        <xd:desc>
            <xd:p>This template is in charge of creating the listing boxes.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="draw:frame[draw:text-box and not(.//draw:frame)]">
        <xsl:variable name="caption" 
            select="draw:text-box/text:p[text:sequence]" as="element()*" />
        
        <figure>
            <xsl:call-template name="set.captioned.object.id">
                <xsl:with-param name="caption" select="$caption" />
            </xsl:call-template>
            <pre><code>
                <xsl:for-each select="draw:text-box/text:p[not(text:sequence)]">
                    <xsl:apply-templates />
                    <xsl:if test="position() != last()">
                        <!-- Add a \n character if it is not the last paragraph -->
                        <xsl:text>&#xa;</xsl:text>
                    </xsl:if>
                </xsl:for-each>
            </code></pre>
            <xsl:call-template name="add.caption">
                <xsl:with-param name="caption" select="f:getCaptionNodes($caption)" as="node()*" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <xd:doc scope="draw:image">
        <xd:desc>
            <xd:p>This template is in charge of creating images.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="draw:image[not(following-sibling::svg:desc[. = 'formula'] | preceding-sibling::svg:desc[. = 'formula'])]">
        <xsl:variable name="caption" 
            select="replace(string-join(f:getCaptionNodes(.), ''), $subcap, '')" as="xs:string?" />
        <xsl:variable name="alt" select="../svg:title" as="xs:string?" />
        <img 
            src="{$baseimg}{substring-after(@xlink:href,'Pictures/')}" 
            alt="{if ($alt) then $alt else 
                    if ($caption) then $caption else 'No alternate description has been provided.'}" />
    </xsl:template>
    
    <xd:doc scope="draw:object">
        <xd:desc>
            <xd:p>This template is in charge of creating formulas.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="draw:object[parent::element()/svg:desc = 'formula']">
        <xsl:variable name="curmath" 
            select="doc(concat($dir, @xlink:href, '/content.xml'))/element()" as="element()?" />
        <xsl:if test="$curmath">
            <xsl:copy-of select="$curmath" />
        </xsl:if>
    </xsl:template>
    
    <xd:doc scope="text:p">
        <xd:desc>
            <xd:p>This template is in charge of handling common paragraphs.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:p">
        <xsl:variable name="parent" select="parent::office:text" as="element()?" />
        <xsl:choose>
            <!-- When a paragraph is defined in the ODT document without providing any particular structured organisation of it into a paper (such as defining headings), a section is created automatically in the final RASH document. -->
            <xsl:when test="$parent and f:getContentChildElements($parent)[1] is .">
                <section>
                    <h1>No heading specified</h1>
                    <p>
                        <xsl:apply-templates /> 
                    </p>
                    <xsl:apply-templates select="following-sibling::element()" />
                </section>
            </xsl:when>
            <!-- This is the basic case for the creation of paragraphs. -->
            <xsl:otherwise>
                <p>
                    <xsl:apply-templates />
                </p>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xd:doc scope="text:p">
        <xd:desc>
            <xd:p>This template is in charge of handling a sequence of paragraph that defines a block of code.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="
        text:p[
            (starts-with(@text:style-name,'Preformatted') or 
            (some $s in //style:style[starts-with(@style:parent-style-name, 'Preformatted')]/@style:name 
                satisfies @text:style-name = $s))]">
        <xsl:variable name="prevp" select="preceding-sibling::text:p[1]" as="element()?" />
        <xsl:if test="not($prevp) or not(f:isPreformattedElement($prevp))">
            <xsl:variable name="allCodes" 
                select="following-sibling::text:p[f:isPreformattedElement(.)]" as="element()*" />
            <xsl:variable name="firstNonCode" 
                select="following-sibling::element()[not(f:isPreformattedElement(.))][1]" as="element()*" />
            
            <pre><code>
                <xsl:for-each select="(., $allCodes) except $firstNonCode/(.|following-sibling::element())">
                    <xsl:text>&#xa;</xsl:text>
                    <xsl:apply-templates />
                </xsl:for-each>
            </code></pre>
        </xsl:if>
    </xsl:template>
    
    <xd:doc scope="text:p">
        <xd:desc>
            <xd:p>This template is in charge of handling a cited paragraph.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:p[
        starts-with(@text:style-name,'Quotations') or 
        (some $s in //style:style[@style:parent-style-name = 'Quotations']/@style:name 
            satisfies @text:style-name = $s)]">
        <blockquote><p>
            <xsl:apply-templates />
        </p></blockquote>
    </xsl:template>
    
    <xd:doc scope="text:list">
        <xd:desc>
            <xd:p>This template is in charge of handling lists.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:list">
        <xsl:variable name="isBulletList" select="some $s 
            in //text:list-style[exists(element()[1][self::text:list-level-style-bullet])]/@style:name 
            satisfies @text:style-name = $s" as="xs:boolean" />
        
        <xsl:choose>
            <xsl:when test="$isBulletList">
                <ul>
                    <xsl:apply-templates />           
                </ul>
            </xsl:when>
            <xsl:otherwise>
                <ol>
                    <xsl:apply-templates />           
                </ol>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xd:doc scope="text:list-item">
        <xd:desc>
            <xd:p>This template is in charge of handling list items.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:list-item">
        <li>
            <xsl:call-template name="set.bookmarked.object.id" />
            <xsl:if test="some $content in $bibliography satisfies lower-case(normalize-space(preceding::text:h[1])) = $content">
                <xsl:attribute name="role">doc-biblioentry</xsl:attribute>
            </xsl:if>
            <xsl:apply-templates />
        </li>
    </xsl:template>
    
    <xd:doc scope="text:note">
        <xd:desc>
            <xd:p>This template is in charge of handling references to footnotes.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:note | text:note-ref">
        <a href="#{@text:id | @text:ref-name}"><xsl:text> </xsl:text></a>
    </xsl:template>
    
    <xd:doc scope="text:p">
        <xd:desc>
            <xd:p>This template is in charge of handling formula boxes.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:p[.//draw:object[parent::element()/svg:desc = 'formula'] and normalize-space(replace(., 'formula', '')) = '']">
        <figure>
            <p>
                <xsl:apply-templates />
            </p>
        </figure>
    </xsl:template>
    
    <xd:doc scope="text:span">
        <xd:desc>
            <xd:p>This template handles all the inline textual elements that appear in the context of a paragraph, excluding links.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:span">
        <!-- 
            The 'preformatted' parameters is set to 'true()' if any of the ancestor of the 
            current inline element is a preformatted text 
        -->
        <xsl:param name="preformatted" tunnel="yes" as="xs:boolean" />
        <xsl:variable name="isBold" select="some $s in //style:style[style:text-properties/@fo:font-weight = 'bold']/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        <xsl:variable name="isItalic" select="some $s in //style:style[style:text-properties/@fo:font-style = 'italic']/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        <xsl:variable 
            name="isCourier" 
            select="
                $preformatted or 
                starts-with(@text:style-name,'Source') or 
                (some $s in //style:style[
                    starts-with(style:text-properties/@style:font-name, 'Courier')]/@style:name 
                        satisfies @text:style-name = $s)" as="xs:boolean" />
        <xsl:variable name="isSuperscript" select="some $s in //style:style[starts-with(style:text-properties/@style:text-position,'super')]/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        <xsl:variable name="isSubscript" select="some $s in //style:style[starts-with(style:text-properties/@style:text-position,'sub')]/@style:name satisfies @text:style-name = $s" as="xs:boolean" />
        
        <xsl:call-template name="add.inline">
            <xsl:with-param name="super" as="xs:boolean" tunnel="yes" select="$isSuperscript" />
            <xsl:with-param name="sub" as="xs:boolean" tunnel="yes" select="$isSubscript" />
            <xsl:with-param name="bold" as="xs:boolean" tunnel="yes" select="$isBold" />
            <xsl:with-param name="italic" as="xs:boolean" tunnel="yes" select="$isItalic" />
            <xsl:with-param name="courier" as="xs:boolean" tunnel="yes" select="$isCourier" />
        </xsl:call-template>
    </xsl:template>
    
    <xd:doc scope="text:a">
        <xd:desc>
            <xd:p>This template handles all the inline external (i.e., to an external website) links that appear in the context of a paragraph, excluding links.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:a">
        <xsl:variable name="ref" select="@xlink:href" as="xs:string" />
        <a href="{@xlink:href}">
            <xsl:apply-templates />
        </a>
    </xsl:template>
    
    <xd:doc scope="text()">
        <xd:desc>
            <xd:p>This template handles all text nodes and, in case there is an inline quotation, it adds the appropriate element to the RASH document.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text()">
        <xsl:param name="caption" tunnel="yes" />
        <xsl:for-each select="f:sequenceOfTextNodes(if ($caption) then replace(., $subcap, '') else ., ())">
            <xsl:variable name="isQuote" select="position() mod 2 = 0" as="xs:boolean" />
            <xsl:choose>
                <xsl:when test="$isQuote">
                    <q><xsl:value-of select="." /></q>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="." />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>
    
    <xd:doc scope="table:table">
        <xd:desc>
            <xd:p>This template creates new table boxes.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="table:table">
        <xsl:variable name="caption" select="following-sibling::text:p[normalize-space() != ''][1][(@text:style-name = 'Table') or (some $s in //style:style[@style:parent-style-name = 'Table']/@style:name satisfies @text:style-name = $s)]" as="element()?" />
        <figure>
            <xsl:call-template name="set.captioned.object.id">
                <xsl:with-param name="caption" select="$caption" />
            </xsl:call-template>
            <table> 
                <xsl:apply-templates />
            </table>
            
            <xsl:call-template name="add.caption">
                <xsl:with-param name="caption" select="f:getCaptionNodes($caption)" />
            </xsl:call-template>
        </figure>
    </xsl:template>
    
    <xd:doc scope="table:table-row">
        <xd:desc>
            <xd:p>This template creates table rows.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="table:table-row">
        <tr>
            <xsl:apply-templates />
        </tr>
    </xsl:template>
    
    <xd:doc scope="table:table-cell">
        <xd:desc>
            <xd:p>This template creates new table heading cells.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="table:table-cell[
        exists(.//text:p[matches(@text:style-name,'^Table.*Heading$') or 
        matches(@text:parent-style-name,'^Table.*Heading$') or 
        (some $s in //style:style[matches(@style:parent-style-name,'^Table.*Heading$')]/@style:name 
            satisfies @text:style-name = $s)])]">
        <th>
            <xsl:choose>
                <xsl:when test="normalize-space() = ''">
                    <p><xsl:text> </xsl:text></p>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates select="text:p/node()" />
                </xsl:otherwise>
            </xsl:choose>
        </th>
    </xsl:template>
    
    <xd:doc scope="table:table-cell">
        <xd:desc>
            <xd:p>This template creates new table content cells.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="table:table-cell[
        exists(.//text:p[matches(@text:style-name,'^Table.*Contents') or
        matches(@text:parent-style-name,'^Table.*Contents') or 
        (some $s in //style:style[matches(@style:parent-style-name,'^Table.*Contents')]/@style:name 
            satisfies @text:style-name = $s)])]">
        <td>
            <xsl:choose>
                <xsl:when test="normalize-space() = ''">
                    <p><xsl:text> </xsl:text></p>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates />
                </xsl:otherwise>
            </xsl:choose>
        </td>
    </xsl:template>
    
    <xd:doc scope="text:tab">
        <xd:desc>
            <xd:p>This template creates a two-space characters as a tab.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:tab">
        <xsl:text>  </xsl:text>
    </xsl:template>
    
    <xd:doc scope="text:bookmark-ref | text:sequence-ref">
        <xd:desc>
            <xd:p>This template creates all the references to dereferanceable objects in the document content (i.e., sections, figures with caption, formulas with caption, and tables).</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:bookmark-ref | text:sequence-ref">
        <a href="#{@text:ref-name}"><xsl:text> </xsl:text></a>
    </xsl:template>
    
    <xd:doc scope="text:bookmark-ref">
        <xd:desc>
            <xd:p>This template creates all the references to items in the reference list.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="text:bookmark-ref[some $ref in //text:bookmark-start satisfies $ref/@text:name = @text:ref-name and (some $content in $bibliography satisfies lower-case(normalize-space($ref/preceding::text:h[1])) = $content)]" priority="3">
        <xsl:variable name="text_name" select="@text:ref-name" as="xs:string" />
        <xsl:variable name="id" select="((//text:p[some $tbs in .//text:bookmark-start/@text:name satisfies $tbs = $text_name])[1]//text:bookmark-start)[1]/@text:name" as="xs:string" />
        <a href="#{$id}"><xsl:text> </xsl:text></a>
    </xsl:template>
    
    <xd:doc scope="svg:desc">
        <xd:desc>
            <xd:p>This template is used for avoiding to process certain elements.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="svg:desc | text:p[normalize-space() = '' and not(element())] | text:p[(@text:style-name = 'Table') or (some $s in //style:style[@style:parent-style-name = 'Table']/@style:name satisfies @text:style-name = $s)] | text:p[(@text:style-name = 'Title') or (some $s in //style:style[@style:parent-style-name = 'Title']/@style:name satisfies @text:style-name = $s)] | text:p[(@text:style-name = 'Subtitle') or (some $s in //style:style[@style:parent-style-name = 'Subtitle']/@style:name satisfies @text:style-name = $s)] | svg:title" />
    
    <xd:doc scope="element()">
        <xd:desc>
            <xd:p>This template continues the processing of its child elements without adding any markup.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="element()">
        <xsl:apply-templates />
    </xsl:template>
    
    <!-- NAMED TEMPLATES -->
    <xd:doc scope="get.following.content.elements">
        <xd:desc>
            <xd:p>This named template allow one to get all the content elements after the first one. Since this particular sequence of element is used by different templates (e.g., for headings), the call has been implemented as a named template.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="get.following.content.elements">
        <xsl:param name="curlev" select="1" as="xs:integer" />
        
        <xsl:variable name="seq" select="for $v in (1 to $curlev) return $v" as="xs:integer+" />
        <xsl:variable name="level" select="string($curlev)" as="xs:string" />
        <xsl:apply-templates select="(following-sibling::text:h|following-sibling::text:p[starts-with(@text:style-name, 'Heading')])[some $l in $seq satisfies f:getLevel(.) = $l][1][f:getLevel(.) = $curlev]"></xsl:apply-templates>
        
        <!--
        <xsl:apply-templates select="
            (
                following-sibling::text:h[some $l in $seq 
                    satisfies f:getLevel(.) = xs:integer($l)] |
                following-sibling::text:p[starts-with(@text:style-name, 'Heading') 
                    and (some $l in $seq 
                        satisfies f:getLevel(.) = xs:integer($l))])[1][
                if (self::text:p) 
                    then  f:getLevel(.) = xs:integer($level) 
                else @text:outline-level = $level]" />
        -->
    </xsl:template>
    
    <xd:doc scope="add.inline">
        <xd:desc>
            <xd:p>This named template is in change of handling all the inline textual elements that may appear within a paragraph. The links are handled in another appropriate template.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="add.inline">
        <xsl:param name="bold" as="xs:boolean" tunnel="yes" />
        <xsl:param name="italic" as="xs:boolean" tunnel="yes" />
        <xsl:param name="super" as="xs:boolean" tunnel="yes" />
        <xsl:param name="sub" as="xs:boolean" tunnel="yes" />
        <xsl:param name="courier" as="xs:boolean" tunnel="yes" />
        
        <xsl:choose>
            <xsl:when test="$super">
                <sup>
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="super" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </sup>
            </xsl:when>
            <xsl:when test="$sub">
                <sub>
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="sub" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </sub>
            </xsl:when>
            <xsl:when test="$bold">
                <strong>
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="bold" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </strong>
            </xsl:when>
            <xsl:when test="$italic">
                <em>
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="italic" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </em>
            </xsl:when>
            <xsl:when test="$courier">
                <code>
                    <xsl:call-template name="add.inline">
                        <xsl:with-param name="courier" tunnel="yes" as="xs:boolean" select="false()" />
                    </xsl:call-template>
                </code>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xd:doc scope="add.inline">
        <xd:desc>
            <xd:p>This named template is in change of handling all the footnotes contained in the paper.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="add.footnotes">
        <xsl:variable name="footnotes" select="//text:note" />
        
        <xsl:if test="$footnotes">
            <section role="doc-footnotes">
                <xsl:for-each select="$footnotes">
                    <section id="{./@text:id}" role="doc-footnote">
                        <xsl:apply-templates select="text:note-body/element()" />
                    </section>
                </xsl:for-each>
            </section>
        </xsl:if>
    </xsl:template>
    
    <xd:doc scope="add.title">
        <xd:desc>
            <xd:p>This named template is in charge of handling the title of the document.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="add.title">
        <xsl:variable name="titel" 
            select="//office:text//text:p[
                (@text:style-name='Title') or 
                ((some $s in //style:style[starts-with(@style:parent-style-name, 'Title')]/@style:name 
                    satisfies @text:style-name = $s))][1]" as="element()?" />
        <xsl:variable name="subtitel" 
            select="//office:text//text:p[
                (@text:style-name='Subtitle') or 
                ((some $s in //style:style[starts-with(@style:parent-style-name, 'Subtitle')]/@style:name 
                    satisfies @text:style-name = $s))][1]" as="element()?" />
        <title>
            <xsl:choose>
                <xsl:when test="normalize-space($titel) != ''">
                    <xsl:value-of select="$titel" />
                    <xsl:if test="normalize-space($subtitel) != ''">
                        <xsl:text> -- </xsl:text>
                        <xsl:value-of select="$subtitel" />
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>No title specified</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </title>
    </xsl:template>
    
    <xd:doc scope="add.meta">
        <xd:desc>
            <xd:p>This named template is in charge of handling the head data of the document, i.e., authors, emails, affiliations, keywords, categories.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="add.meta">
        <xsl:variable name="meta" select="doc(concat($dir, '/meta.xml'))" as="item()?" />
        <xsl:if test="$meta">
            <!-- Affiliations -->
            <xsl:variable name="aff" as="xs:string*">
                <xsl:variable name="afflist" as="xs:string*">
                    <xsl:for-each select="$meta//meta:user-defined[matches(@meta:name, '^ *author', 'i')]">
                        <xsl:variable name="tokens" select="tokenize(., '--')" as="xs:string*" />
                        <xsl:variable name="len" select="count($tokens)" as="xs:integer" />
                        <xsl:if test="$len > 2">
                            <xsl:value-of select="normalize-space($tokens[3])" />
                        </xsl:if>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:variable name="distaff" select="distinct-values($afflist)" as="xs:string*" />
                <xsl:sequence select="(for $a in $distaff return lower-case($a), $distaff)" />
            </xsl:variable>
            <xsl:variable name="afflen" select="count($aff) div 2" as="xs:integer" />
            <xsl:for-each select="$aff[position() > $afflen]">
                <meta about="#affiliation-{position()}" property="schema:name" content="{.}" />
            </xsl:for-each>
            
            <!-- Author -->
            <xsl:for-each select="$meta//meta:user-defined[matches(@meta:name, '^ *author', 'i')]">
                <xsl:variable name="authiri" select="concat('#author-', position())" as="xs:string" />
                <xsl:variable name="tokens" select="tokenize(., '--')" as="xs:string*" />
                <xsl:variable name="len" select="count($tokens)" as="xs:integer" />
                <xsl:if test="$len > 0">
                    <meta about="{$authiri}" name="dc.creator" property="schema:name" 
                        content="{normalize-space($tokens[1])}"/>
                    <xsl:if test="$len > 1">
                        <meta about="{$authiri}" property="schema:email" content="{normalize-space($tokens[2])}" />
                        <xsl:if test="$len > 2">
                            <xsl:variable name="idx" 
                                select="index-of($aff, lower-case(normalize-space($tokens[3])))" as="xs:integer*" />
                            <xsl:if test="$idx">
                                <link about="{$authiri}" property="schema:affiliation" 
                                    href="#affiliation-{$idx[1]}" />
                            </xsl:if>
                        </xsl:if>
                    </xsl:if>
                </xsl:if>
            </xsl:for-each>
            
            <!-- Keywords -->
            <xsl:for-each select="$meta//meta:user-defined[matches(@meta:name, '^ *keywords?', 'i')]">
                <xsl:for-each select="tokenize(., '--')">
                    <meta property="prism:keyword" content="{normalize-space()}" />
                </xsl:for-each>
            </xsl:for-each>
            
            <!-- Categories -->
            <xsl:for-each select="$meta//meta:user-defined[matches(@meta:name, '^ *categor(y|ies)', 'i')]">
                <xsl:for-each select="tokenize(., '--')">
                    <meta name="dcterms.subject" content="{normalize-space()}" />
                </xsl:for-each>
            </xsl:for-each>
        </xsl:if>
    </xsl:template>
    
    <xd:doc scope="add.caption">
        <xd:desc>
            <xd:p>This named template is in charge of creating captions to figures or tables.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="add.caption">
        <xsl:param name="caption" as="node()*" />
        <xsl:variable name="ftn" select="($caption//text())[1]" as="text()?" />
        <figcaption>
            <xsl:choose>
                <xsl:when test="$caption">
                    <xsl:for-each select="$caption">
                        <xsl:apply-templates select=".">
                            <xsl:with-param name="caption" select="true()" tunnel="yes" as="xs:boolean" />
                        </xsl:apply-templates>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                    No caption has been provided.
                </xsl:otherwise>
            </xsl:choose>
        </figcaption>
    </xsl:template>
    
    <xd:doc scope="set.section.type">
        <xd:desc>
            <xd:p>This named template set the type of a section if any ('section' is the default).</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="set.section.type">
        <xsl:variable name="content" select="lower-case(normalize-space())" as="xs:string" />
        
        <xsl:choose>
            <xsl:when test="some $item in $abstract satisfies $content = $item">
                <xsl:attribute name="role" select="'doc-abstract'" />
            </xsl:when>
            <xsl:when test="some $item in $acknowledgements satisfies $content = $item">
                <xsl:attribute name="role" select="'doc-acknowledgements'" />
            </xsl:when>
            <xsl:when test="some $item in $bibliography satisfies $content = $item">
                <xsl:attribute name="role" select="'doc-bibliography'" />
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xd:doc scope="set.bookmarked.object.id">
        <xd:desc>
            <xd:p>This named template set the id of a bookmarked object (i.e., section and references) if present.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="set.bookmarked.object.id">
        <xsl:variable name="id" select="(.//text:bookmark-start/@text:name)[1]" as="xs:string*" />
        <xsl:if test="$id">
            <xsl:attribute name="id" select="$id" />
        </xsl:if>
    </xsl:template>
    
    <xd:doc scope="set.captioned.object.id">
        <xd:desc>
            <xd:p>This named template set the id of a captioned object (i.e., a figure, a formula, a table) if present.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="set.captioned.object.id">
        <xsl:param name="caption" as="element()*" />
        <xsl:variable name="id" select="$caption//text:sequence/@text:ref-name[some $el in //text:sequence-ref satisfies $el/@text:ref-name = .][1]" as="xs:string?" />
        <xsl:if test="$id">
            <xsl:attribute name="id" select="$id" />
        </xsl:if>
    </xsl:template>
    
    <!-- FUNCTIONS -->
    <xd:doc scope="f:getLevel">
        <xd:desc>
            <xd:p>This function retrieves the level of a particular logic section of a paper starting from its header element.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:function name="f:getLevel" as="xs:integer">
        <xsl:param name="curel" as="element()" />
        <xsl:variable name="value" as="xs:integer">
            <xsl:choose>
                <xsl:when test="$curel[starts-with(@text:style-name,'Heading_')][1]">
                    <xsl:value-of select="xs:integer(substring($curel/@text:style-name,string-length($curel/@text:style-name)))" />
                </xsl:when>
                <xsl:when test="starts-with($curel/@text:style-name, 'P')">
                    <xsl:variable name="curstyle" select="root($curel)//style:style[@style:name=$curel/@text:style-name]" as="element()" />
                    <xsl:value-of select="
                        xs:integer(substring($curstyle/@style:parent-style-name,string-length($curstyle/@style:parent-style-name)))" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="xs:integer($curel/@text:outline-level)" />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="$value" />
    </xsl:function>
    
    <xsl:function name="f:getContentChildElements" as="element()*">
        <xsl:param name="parent" as="element()" />
        <xsl:sequence select="$parent/(element() except (text:sequence-decls))" />
    </xsl:function>
    
    <xd:doc scope="f:isPreformattedElement">
        <xd:desc>
            <xd:p>This function says whether a particular element is marked as preformatted.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:function name="f:isPreformattedElement" as="xs:boolean">
        <xsl:param name="curel" as="element()" />
        <xsl:value-of select="
            starts-with($curel/@text:style-name,'Preformatted') or 
            (some $s 
                in root($curel)//style:style[starts-with(@style:parent-style-name,'Preformatted')]/@style:name 
                satisfies $curel/@text:style-name = $s)" />
    </xsl:function>
    
    <xd:doc scope="f:sequenceOfTextNodes">
        <xd:desc>
            <xd:p>This function returns a sequence of text nodes split by means of double quotations.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:function name="f:sequenceOfTextNodes" as="xs:string*">
        <xsl:param name="curtext" as="xs:string" />
        <xsl:param name="curseq" as="xs:string*" />
        <xsl:choose>
            <xsl:when test="contains($curtext, '“') and contains($curtext, '”')">
                <xsl:sequence select="f:sequenceOfTextNodes(
                    substring-after($curtext, '”'),
                    (
                        $curseq, 
                        substring-before($curtext,'“'), 
                        substring-after(substring-before($curtext, '”'),'“')))" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:sequence select="$curseq, $curtext" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <xd:doc scope="f:getCaptionNodes">
        <xd:desc>
            <xd:p>This function returns the caption nodes of a particular image or table.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:function name="f:getCaptionNodes" as="node()*">
        <xsl:param name="imgel" as="element()" />
        <xsl:sequence select="$imgel/ancestor-or-self::text:p[1]/text:sequence/
            (following-sibling::element()|following-sibling::text())" />
    </xsl:function>
</xsl:stylesheet>