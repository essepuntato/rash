<?xml version="1.0" encoding="UTF-8"?>
<!--
From DOCX to RASH XSLT transformation file - Version 1.0, December 25, 2015
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
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
    xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
    exclude-result-prefixes="xs xd f xlink svg dc fo meta w r">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Dec 25, 2015</xd:p>
            <xd:p><xd:b>Author:</xd:b> Silvio Peroni</xd:p>
            <xd:p>This XSLT document allows the conversion of any DOCX document into RASH.</xd:p>
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
    <xsl:param name="basecss" select="'./css/'" />

    <!--
        This parameters refers to the base path that all the URL of the Javascript files
        of the final RASH document should have.
    -->
    <xsl:param name="basejs" select="'./js/'" />

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
        of the ODT document to transform.
    -->
    <xsl:param name="dir" select="'./workingdir/word/'" />

    <!-- This variable is used to remove separators in captions -->
    <xsl:variable name="subcap" select="'^[!,\.:;\?\|\-\s]+'" as="xs:string" />

    <!--
        These variables are used for identifying the text of the headings referring to the
        sections abstract, acknowledgements and bibliography
    -->
    <xsl:variable name="abstract" select="('abstract', 'summary')" as="xs:string+" />
    <xsl:variable name="acknowledgements" select="('acknowledgements', 'acknowledgement')" as="xs:string+" />
    <xsl:variable name="bibliography" select="('bibliography', 'references', 'reference')" as="xs:string+" />

    <!-- Link references document -->
    <xsl:variable name="links" select="doc(concat($dir, '/_rels/document.xml.rels'))" as="item()?" />

    <!-- Link styles document -->
    <xsl:variable name="styles" select="doc(concat($dir, '/styles.xml'))" as="item()?" />

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
    <xd:doc scope="w:body">
        <xd:desc>
            <xd:p>This template is in charge of creating the whole structure of the document in RASH.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="w:body">
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
                <!-- /END Visualisation requirements (mandatory for optimal reading) -->

                <xsl:call-template name="add.title" />
            </head>
            <body>
                <xsl:choose>
                    <xsl:when test="element()[f:isHeading(.)]">
                        <!-- Call all the elements before the first heading (if any) -->
                        <xsl:apply-templates select="element()[f:isHeading(.)][1]/preceding-sibling::element()" />

                        <!-- Call all the remaining elements (i.e., starting from the first heading) -->
                        <xsl:apply-templates select="element()[f:isHeading(.)][1]" />
                    </xsl:when>
                    <xsl:otherwise>
                        <!-- Call all the elements (base case) -->
                        <xsl:apply-templates />
                    </xsl:otherwise>
                </xsl:choose>
            </body>
        </html>
    </xsl:template>

    <xd:doc scope="w:p">
        <xd:desc>
            <xd:p>This template is in charge of handling common paragraphs.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="w:p">
        <xsl:variable name="parent" select="parent::w:body" as="element()?" />
        <xsl:choose>
            <!-- Headings -->
            <xsl:when test="f:isHeading(.)">
                <xsl:call-template name="create.section.with.heading" />
            </xsl:when>
            <!-- When a pure text paragraph is defined in the DOCX document without providing any particular structured
            organisation of it into a paper (such as defining headings), a section is created automatically in the final
            RASH document. -->
            <xsl:when test="$parent and f:getContentChildElements($parent)[1] is .">
                <xsl:call-template name="create.untitled.section" />
            </xsl:when>
            <!-- This is the basic case for the creation of paragraphs. -->
            <xsl:otherwise>
                <p>
                    <xsl:apply-templates />
                </p>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xd:doc scope="w:r">
        <xd:desc>
            <xd:p>This template handles all the inline textual elements that appear in the context of a paragraph, excluding links.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="w:r">
        <!--
            The 'preformatted' parameters is set to 'true()' if any of the ancestor of the
            current inline element is a preformatted text
        -->
        <xsl:param name="preformatted" tunnel="yes" as="xs:boolean" />
        <xsl:variable name="isBold" select="exists(w:rPr/w:b)" as="xs:boolean" />
        <xsl:variable name="isItalic" select="exists(w:rPr/w:i)" as="xs:boolean" />
        <xsl:variable name="isCourier" select="exists(w:rPr/w:rFonts[contains(@w:ascii, 'Courier')])" as="xs:boolean" />
        <xsl:variable name="isSuperscript" select="w:rPr/w:vertAlign/@w:val = 'superscript'" as="xs:boolean" />
        <xsl:variable name="isSubscript" select="w:rPr/w:vertAlign/@w:val = 'subscript'" as="xs:boolean" />

        <!-- If the immediately previous element doesn't have the same style then proceed -->
        <xsl:variable name="previousElementSameStyle" as="xs:boolean">
            <xsl:variable name="prev" select="f:getPreceding(.)[last()]" as="item()?" />
            <xsl:variable name="prevIsBold" select="exists($prev/w:rPr/w:b)" as="xs:boolean" />
            <xsl:variable name="prevIsItalic" select="exists($prev/w:rPr/w:i)" as="xs:boolean" />
            <xsl:variable name="prevIsCourier" select="exists($prev/w:rPr/w:rFonts[contains(@w:ascii, 'Courier')])" as="xs:boolean" />
            <xsl:variable name="prevIsSuperscript"
                select="$prev/w:rPr/w:vertAlign/@w:val = 'superscript'" as="xs:boolean" />
            <xsl:variable name="prevIsSubscript"
                select="$prev/w:rPr/w:vertAlign/@w:val = 'subscript'" as="xs:boolean" />
            <xsl:value-of select="$prev[self::w:r] and
                $isBold = $prevIsBold and $isItalic = $prevIsItalic and $isCourier = $prevIsCourier and
                $isSuperscript = $prevIsSuperscript and $isSubscript = $prevIsSubscript" />
        </xsl:variable>

        <xsl:if test="not($previousElementSameStyle)">
            <!-- The following elements that doesn't have the same kind of text -->
            <xsl:variable name="follTNotEqual" as="element()*">
                <xsl:for-each select="f:getFollowing(.)">
                    <xsl:variable name="follIsBold" select="exists(w:rPr/w:b)" as="xs:boolean" />
                    <xsl:variable name="follIsItalic" select="exists(w:rPr/w:i)" as="xs:boolean" />
                    <xsl:variable name="follIsCourier" select="exists(w:rPr/w:rFonts[contains(@w:ascii, 'Courier')])" as="xs:boolean" />
                    <xsl:variable name="follIsSuperscript" select="w:rPr/w:vertAlign/@w:val = 'superscript'" as="xs:boolean" />
                    <xsl:variable name="follIsSubscript" select="w:rPr/w:vertAlign/@w:val = 'subscript'" as="xs:boolean" />
                    <xsl:if test="not(self::w:r) or not(
                        $isBold = $follIsBold and $isItalic = $follIsItalic and $isCourier = $follIsCourier and
                        $isSuperscript = $follIsSuperscript and $isSubscript = $follIsSubscript)">
                        <xsl:sequence select="." />
                    </xsl:if>
                </xsl:for-each>
            </xsl:variable>

            <!-- All the following elements that have the same kind of text -->
            <xsl:variable name="follTEqual" as="element()*">
                <xsl:for-each select="f:getFollowing(.)">
                    <xsl:variable name="follIsBold" select="exists(w:rPr/w:b)" as="xs:boolean" />
                    <xsl:variable name="follIsItalic" select="exists(w:rPr/w:i)" as="xs:boolean" />
                    <xsl:variable name="follIsCourier" select="exists(w:rPr/w:rFonts[contains(@w:ascii, 'Courier')])" as="xs:boolean" />
                    <xsl:variable name="follIsSuperscript" select="w:rPr/w:vertAlign/@w:val = 'superscript'" as="xs:boolean" />
                    <xsl:variable name="follIsSubscript" select="w:rPr/w:vertAlign/@w:val = 'subscript'" as="xs:boolean" />
                    <xsl:if test="
                        self::w:r and
                        $isBold = $follIsBold and $isItalic = $follIsItalic and $isCourier = $follIsCourier and
                        $isSuperscript = $follIsSuperscript and $isSubscript = $follIsSubscript">
                        <xsl:sequence select="." />
                    </xsl:if>
                </xsl:for-each>
            </xsl:variable>
            <xsl:call-template name="add.inline">
                <xsl:with-param name="select"
                    select="(w:t, ($follTEqual except ($follTNotEqual, f:getFollowing($follTNotEqual)))/w:t)" tunnel="yes" />
                <xsl:with-param name="super" as="xs:boolean" tunnel="yes" select="$isSuperscript" />
                <xsl:with-param name="sub" as="xs:boolean" tunnel="yes" select="$isSubscript" />
                <xsl:with-param name="bold" as="xs:boolean" tunnel="yes" select="$isBold" />
                <xsl:with-param name="italic" as="xs:boolean" tunnel="yes" select="$isItalic" />
                <xsl:with-param name="courier" as="xs:boolean" tunnel="yes" select="$isCourier" />
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xd:doc scope="w:hyperlink">
        <xd:desc>
            <xd:p>This template handles all the inline external (i.e., to an external website) links that appear in the context of a paragraph, excluding links.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="w:hyperlink" xpath-default-namespace="http://schemas.openxmlformats.org/package/2006/relationships">
        <xsl:variable name="id" select="@r:id" as="xs:string" />
        <a href="{$links//Relationship[@Id = $id]/@Target}">
            <xsl:apply-templates />
        </a>
    </xsl:template>

    <xd:doc scope="w:pPr">
        <xd:desc>
            <xd:p>This template is used for avoiding to process certain elements.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="w:pPr | w:rPr | w:sectPr | text()[empty(ancestor::w:t)]" />

    <xd:doc scope="element()">
        <xd:desc>
            <xd:p>This template continues the processing of its child elements without adding any markup.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="element()">
        <xsl:apply-templates />
    </xsl:template>

    <xd:doc scope="w:p">
      <xd:desc>
        <xd:p>This template is in charge of handling a sequence of paragraph that defines a block of code.</xd:p>
      </xd:desc>
    </xd:doc>
    <xsl:template match="w:p[w:pPr/w:pStyle[contains(@w:val, 'HTML')]]">
      <xsl:variable name="prevp" select="preceding-sibling::w:p[1]" as="element()?"/>
      <xsl:if test="not($prevp) or not($prevp[w:pPr/w:pStyle[contains(@w:val, 'HTML')]])">
        <xsl:variable name="allCodes"
          select="following-sibling::w:p"
          as="element()*" />
        <!-- TODO: Chiedere se va bene aver usato contains(HTML) -->
        <xsl:variable name="firstNonCode"
          select="following-sibling::w:p[w:pPr/w:pStyle[not(contains(@w:val, 'HTML'))]]"
          />
        <pre><code>
            <xsl:for-each select="(., $allCodes) except $firstNonCode/(.|following-sibling::element())">
                <xsl:text>&#xa;</xsl:text>
                <xsl:apply-templates />
            </xsl:for-each>
        </code></pre>
      </xsl:if>
    </xsl:template>

    <!-- TODO: Localizzazione di Cit -->
    <xd:doc scope="w:p">
        <xd:desc>
            <xd:p>This template is in charge of handling a cited paragraph.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template
      match="w:p[
        w:pPr/w:pStyle[contains(@w:val, 'Cit')]
      ]">
        <blockquote><p>
            <xsl:apply-templates />
        </p></blockquote>
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
        <xsl:apply-templates select="(following-sibling::w:p[f:isHeading(.)])[some $l in $seq satisfies f:getLevel(.) = $l][1][f:getLevel(.) = $curlev]" />
    </xsl:template>

    <xd:doc scope="add.inline">
        <xd:desc>
            <xd:p>This named template is in change of handling all the inline textual elements that may appear within a paragraph. The links are handled in another appropriate template.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="add.inline">
        <xsl:param name="select" as="item()*" tunnel="yes" />
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
                <xsl:apply-templates select="$select"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="add.title">
        <title>No title specified</title>
    </xsl:template>

    <xd:doc scope="set.section.type">
        <xd:desc>
            <xd:p>This named template set the type of a section if any ('section' is the default).</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="set.section.type">
        <xsl:variable name="content" select="lower-case(normalize-space(string-join(.//w:t, '')))" as="xs:string" />

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

    <xd:doc scope="create.section.with.heading">
        <xd:desc>
            <xd:p>This named template creates the section according the particular heading in consideration.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="create.section.with.heading">
        <xsl:variable name="next.header" select="(following-sibling::w:p[f:isHeading(.)])[1]" as="element()*" />
        <xsl:variable name="level" select="f:getLevel(.)" as="xs:integer" />
        <section>
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

    <xd:doc scope="create.section.with.heading">
        <xd:desc>
            <xd:p>This named template creates a new section with no heading and containing the paragraph in consideration.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="create.untitled.section">
        <section>
            <h1>No heading specified</h1>
            <p>
                <xsl:apply-templates />
            </p>
            <xsl:apply-templates select="following-sibling::element()" />
        </section>
    </xsl:template>

    <!-- FUNCTIONS -->
    <xsl:function name="f:getContentChildElements" as="element()*">
        <xsl:param name="parent" as="element()" />
        <xsl:sequence select="$parent/element()" />
    </xsl:function>

    <xsl:function name="f:getFollowing" as="element()*">
        <xsl:param name="curel" as="element()*" />
        <xsl:sequence select="$curel/(following-sibling::w:r|following-sibling::w:hyperlink)" />
    </xsl:function>
    <xsl:function name="f:getPreceding" as="element()*">
        <xsl:param name="curel" as="element()*" />
        <xsl:sequence select="$curel/(preceding-sibling::w:r|preceding-sibling::w:hyperlink)" />
    </xsl:function>

    <xd:doc scope="f:getLevel">
        <xd:desc>
            <xd:p>This function retrieves the level of a particular logic section of a paper starting from its header element.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:function name="f:getLevel" as="xs:integer">
        <xsl:param name="curel" as="element()" />
        <xsl:variable name="value" as="xs:string">
            <xsl:variable name="title-ref" select="$curel/w:pPr/w:pStyle/@w:val" as="xs:string" />
            <xsl:value-of select="$styles//w:style[@w:styleId = $title-ref]/w:name/@w:val" />
        </xsl:variable>
        <xsl:value-of select="xs:integer(substring($value,string-length($value)))" />
    </xsl:function>

    <xd:doc scope="f:isHeading">
        <xd:desc>
            <xd:p>This function checks if a certain paragraph is an header or not.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:function name="f:isHeading" as="xs:boolean">
        <xsl:param name="curel" as="element()" />
        <xsl:variable name="value" as="xs:string?">
            <xsl:variable name="title-ref" select="$curel/w:pPr/w:pStyle/@w:val" as="xs:string?" />
            <xsl:value-of select="$styles//w:style[@w:styleId = $title-ref]/w:name/@w:val" />
        </xsl:variable>
        <xsl:value-of select="starts-with($value, 'heading')" />
    </xsl:function>


</xsl:stylesheet>
