<?xml version="1.0" encoding="UTF-8"?>
<!-- 
RASH to LaTeX: MathML module - Version 0.4, October 25, 2015
by Silvio Peroni

A small adaptation of the some sources of the Web-XSLT project by David Carlisle 
available on GitHub at https://github.com/davidcarlisle/web-xslt.  

Copyright of the original work by David Carlisle 2001, 2002, 2008, 2009, 2013-2015.
This work is licensed under a W3C Software Notice and License 
(http://www.w3.org/Consortium/Legal/copyright-software-19980720).

THIS SOFTWARE AND DOCUMENTATION IS PROVIDED "AS IS," AND COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE SOFTWARE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS.

COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENTATION.
-->
<xsl:stylesheet version="2.0" 
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:m="http://www.w3.org/1998/Math/MathML" 
 xmlns:iml="http://www.w3.org/1999/xhtml"
 xmlns:xs="http://www.w3.org/2001/XMLSchema"
 exclude-result-prefixes="m xs">
 
 <xsl:template mode="pmml2tex" match="m:math[ancestor::iml:figure[1][some $token in tokenize(@role, ' ') satisfies $token = 'formulabox']]">\let\par\empty <xsl:apply-templates mode="pmml2tex"
  /></xsl:template>
 
 <xsl:template mode="pmml2tex" match="m:math">$\let\par\empty <xsl:apply-templates mode="pmml2tex"
 />$</xsl:template>

 <xsl:template mode="pmml2tex" match="m:mrow">
  <xsl:text>{</xsl:text>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mrow[m:mo=$stretchy]">
  <xsl:text>{\left.</xsl:text>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>\right.}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:none">
  <xsl:text>\empty </xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mglyph[@src]" priority="2">
  <xsl:text>\includegraphics{</xsl:text>
  <xsl:value-of select="@src"/>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:glyph" priority="1">
  <xsl:text>\mathrm{</xsl:text>
  <xsl:value-of select="replace(@alt,' ','~')"/>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mfenced">
  <xsl:text>{\left</xsl:text>
  <xsl:choose>
   <xsl:when test="not(@open)">(</xsl:when>
   <xsl:when test="normalize-space(@open)=''">.</xsl:when>
   <xsl:otherwise>
    <xsl:value-of select="replace(@open,'[{}]','\\$0')"/>
   </xsl:otherwise>
  </xsl:choose>
  <xsl:variable name="s"
   select="for $s in string-to-codepoints((@separators,',')[1]) return codepoints-to-string($s)"/>
  <xsl:for-each select="*">
   <xsl:apply-templates mode="pmml2tex" select="."/>
   <xsl:variable name="p" select="position()"/>
   <xsl:if test="position()!=last()">
    <xsl:if test="($s[$p],$s[last()])[1]=$stretchy">\middle </xsl:if>
    <xsl:value-of select="replace(($s[$p],$s[last()])[1],'[{}]','\\$0')"/>
   </xsl:if>
  </xsl:for-each>
  <xsl:text>\right</xsl:text>
  <xsl:choose>
   <xsl:when test="not(@close)">)</xsl:when>
   <xsl:when test="normalize-space(@close)=''">.</xsl:when>
   <xsl:otherwise>
    <xsl:value-of select="replace(@close,'[{}]','\\$0')"/>
   </xsl:otherwise>
  </xsl:choose>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:variable name="stretchy" select="'(',')','{','}','|'"/>

 <xsl:template mode="pmml2tex" match="m:msqrt">
  <xsl:text>\sqrt{</xsl:text>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mphantom">
  <xsl:text>\phantom{</xsl:text>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mspace[@width]">
  <xsl:text>{\hspace{</xsl:text>
  <xsl:choose>
   <xsl:when test="@width='verythinmathspace'">0.1em </xsl:when>
   <xsl:when test="@width='thinmathspace'">0.2em </xsl:when>
   <xsl:when test="@width='mediummathspace'">0.3em </xsl:when>
   <xsl:when test="@width='thickmathspace'">0.4em </xsl:when>
   <xsl:when test="@width='verythickmathspace'">0.5em </xsl:when>
   <xsl:otherwise>
    <xsl:value-of select="replace(@width,'px','pt')"/>
   </xsl:otherwise>
  </xsl:choose>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:maction">
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:menclose">
  <xsl:message>
   <menclose>
    <xsl:copy-of select="@*"/>
   </menclose>
  </xsl:message>
  <xsl:apply-templates mode="pmml2tex"/>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:menclose[@notation]">
  <xsl:variable name="s" select="tokenize((@notation,'longdiv')[1],'\s+')"/>
  <xsl:text>{\menclosebox{</xsl:text>
  <xsl:if test="$s='radical'">\sqrt</xsl:if>
  <xsl:text>{</xsl:text>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}}{</xsl:text>
  <xsl:for-each select="$s">
   <xsl:choose>
    <xsl:when test=".='longdiv'">
     <xsl:text>\hbox{\pdfliteral{q 0 \depth m  
    3 \hheight
    3 \hheight
    0 \height
    c
    \width \height
    l
    S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='actuarial'">
     <xsl:text>\hbox{\pdfliteral{q 0 \height m  
    \width \height
    l
    \width 0
    l
    S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='left'">
     <xsl:text>\hbox{\pdfliteral{q 0 \depth m 0 \height l S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='right'">
     <xsl:text>\hbox{\pdfliteral{q \width \depth m \width \height l S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='top'">
     <xsl:text>\hbox{\pdfliteral{q 0 \height m \width \height l S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='bottom'">
     <xsl:text>\hbox{\pdfliteral{q 0 \depth m \width\depth l S Q}}</xsl:text>
    </xsl:when>

    <xsl:when test=".='box'">
     <xsl:text>\hbox{\pdfliteral{q 0 \depth m 0 \height l </xsl:text>
     <xsl:text>\width \height l </xsl:text>
     <xsl:text>\width \depth l </xsl:text>
     <xsl:text>0 \depth l s Q}}</xsl:text>
    </xsl:when>



    <xsl:when test=".='updiagonalstrike'">
     <xsl:text>\hbox{\pdfliteral{q 0 \depth m \width\height l S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='downdiagonalstrike'">
     <xsl:text>\hbox{\pdfliteral{q 0 \height m \width\depth l S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='horizontalstrike'">
     <xsl:text>\hbox{\pdfliteral{q 0 \hheight m \width\hheight l S Q}}</xsl:text>
    </xsl:when>
    <xsl:when test=".='verticalstrike'">
     <xsl:text>\pdfliteral{q \hwidth \height m \hwidth\depth l S Q}</xsl:text>
    </xsl:when>
    <xsl:when test=".=('circle','roundedbox')">
     <xsl:text>\pdfliteral{q
    0  \hheight m
    0 \height
    0 \height
    \hwidth \height
    c 
    \width \height
    \width \height
    \width \hheight
    c
    \width \depth
    \width \depth
    \hwidth \space \depth
    c
    0 \depth  
    0 \depth  
    0 \hheight
    c
    s Q}</xsl:text>
    </xsl:when>
    <xsl:when test=".='madruwb'"> \dimen0\wd0 \advance\dimen0-2pt \dimen2\wd0 \advance\dimen2 1pt
     \pdfliteral{ q \stripPT\dimen0 \space 0 m \stripPT\dimen2 \space -2 \hwidth -2 2 0 c \hwidth -3
     \stripPT\dimen2 \space -3 \width 0 c \stripPT\dimen0 \space \height l h f Q} </xsl:when>
    <xsl:otherwise>
     <xsl:message select="'menclose: ',."/>
    </xsl:otherwise>
   </xsl:choose>
  </xsl:for-each>
  <xsl:text>}}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:mpadded">
  <xsl:message>
   <mpadded>
    <xsl:copy-of select="@*"/>
   </mpadded>
  </xsl:message>
  <xsl:apply-templates mode="pmml2tex"/>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:merror"> {{\color{red}{\fbox{$<xsl:apply-templates
   mode="pmml2tex"/>$}}}} </xsl:template>


 <xsl:template mode="pmml2tex" match="m:mtext">
  <xsl:text>{\mathrm{</xsl:text>
  <xsl:variable name="t">
   <xsl:apply-templates mode="pmml2tex"/>
  </xsl:variable>
  <xsl:value-of select="replace(replace(replace($t,' ','~'),'&lt;','\\lt '),'&gt;','\\gt ')"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mroot">
  <xsl:text>\sqrt[{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}]{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:mfrac">
  <xsl:text>{\frac{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:mfenced/m:mo[not(@*) and normalize-space(.)=$stretchy]"
  priority="2">
  <xsl:text>\middle</xsl:text>
  <xsl:value-of select="replace(.,'[{}]','\\$0')"/>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mrow/m:mo[not(@*) and normalize-space(.)=$stretchy]"
  priority="3">
  <xsl:text>\middle</xsl:text>
  <xsl:value-of select="replace(.,'[{}]','\\$0')"/>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mo[not(@*) and string-length(normalize-space(.))=1]">
  <xsl:apply-templates mode="pmml2tex"/>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mo">
  <xsl:text>{\mo{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="@*"/>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mo[string-length(normalize-space(.)) gt 1]">
  <xsl:text>{\mo{\mathrm{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="@*"/>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mo[.='{']" priority="2">\{</xsl:template>
 <xsl:template mode="pmml2tex" match="m:mo[.='}']" priority="2">\}</xsl:template>
 <xsl:template mode="pmml2tex" match="m:mo[.='^']" priority="2">\hat{}</xsl:template>
 <xsl:template mode="pmml2tex" match="m:mo[.='_']" priority="2">\_ </xsl:template>
 <xsl:template mode="pmml2tex" match="m:mo[.='\']" priority="2">\backslash </xsl:template>
 <xsl:template mode="pmml2tex" match="m:mo[.='&amp;']" priority="2">\ampersand </xsl:template>
 <xsl:template mode="pmml2tex" match="m:mo[.='&lt;']" priority="2">\lt </xsl:template>
 <xsl:template mode="pmml2tex" match="m:mo[.='&gt;']" priority="2">\gt </xsl:template>



 <!--
    <xsl:value-of select="for $n in string-to-codepoints(.)
    return concat('\mo{',$n,'}')"/>
-->

 <xsl:template mode="pmml2tex" match="m:mi[not(@*) and string-length(normalize-space(.))=1]">
  <xsl:apply-templates mode="pmml2tex"/>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mo[.='&#8289;'][preceding-sibling::*[1][self::m:mi]]"
  priority="3"/>


 <xsl:template mode="pmml2tex" match="m:mi">
  <xsl:if test="following-sibling::*[1]='&#8289;'">\mathop</xsl:if>
  <xsl:text>{\mi</xsl:text>
  <xsl:value-of select="replace(@mathvariant,'-','')"/>
  <xsl:if test="not(@mathvariant) and string-length(.)&gt;1">normal</xsl:if>
  <xsl:text>{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="@* except @mathvariant"/>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mn">
  <xsl:text>{\mn{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="@*"/>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mn[matches(.,'^[0-9]*$')]">
  <xsl:text>{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="@*"/>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="*">
  <xsl:message select="'tex: ',name()"/>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mscarry">
  <xsl:apply-templates mode="pmml2tex" select="*"/>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:msup">
  <xsl:text>{\msup{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:msub">
  <xsl:text>{{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}\sb{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:msubsup">
  <xsl:text>{</xsl:text>
  <xsl:text>{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}</xsl:text>
  <xsl:text>\sb{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}</xsl:text>
  <xsl:text>\sp{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[3]"/>
  <xsl:text>}</xsl:text>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mmultiscripts">
  <xsl:text>\setbox0\hbox{$</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>$}</xsl:text>
  <xsl:for-each select="m:mprescripts/following-sibling::*[position() mod 2=1]">
   <xsl:text>\vphantom{pre\copy0}</xsl:text>
   <xsl:text>\sb{</xsl:text>
   <xsl:apply-templates mode="pmml2tex" select="."/>
   <xsl:text>}\sp{</xsl:text>
   <xsl:apply-templates mode="pmml2tex" select="following-sibling::*[1]"/>
   <xsl:text>}</xsl:text>
  </xsl:for-each>
  <xsl:text>{\copy0}</xsl:text>
  <xsl:for-each
   select="*[position()!=1][not(self::m:mprescripts)][not(preceding-sibling::m:mprescripts)][position() mod 2=1]">
   <xsl:text>\vphantom{post\copy0}</xsl:text>
   <xsl:text>\sb{</xsl:text>
   <xsl:apply-templates mode="pmml2tex" select="."/>
   <xsl:text>}\sp{</xsl:text>
   <xsl:apply-templates mode="pmml2tex" select="following-sibling::*[1]"/>
   <xsl:text>}</xsl:text>
  </xsl:for-each>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mtable">
  <xsl:text>{\begin{matrix}&#10;</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="m:mtr|m:mlabeledtr">
   <xsl:with-param name="cols" select="max(*/count(m:mtd/(@colspan/number(.),1)[1]))"/>
  </xsl:apply-templates>
  <xsl:text>&#10;\end{matrix}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mtr">
  <xsl:if test="../@side='left' and ../m:mlabeledtr">
   <xsl:text>{\relax}\endcell </xsl:text>
  </xsl:if>
  <xsl:apply-templates mode="pmml2tex" select="m:mtd"/>
  <xsl:if test="not(../@side='left') and ../m:mlabeledtr">
   <xsl:text>\endcell {\empty} </xsl:text>
  </xsl:if>
  <xsl:if test="position()!=last()">\\&#10;</xsl:if>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mlabeledtr">
  <xsl:param name="cols"/>
  <xsl:if test="../@side='left'">
   <xsl:apply-templates mode="pmml2tex" select="m:mtd[1]"/>
  </xsl:if>
  <xsl:apply-templates mode="pmml2tex" select="m:mtd[position()!=1]"/>
  <xsl:for-each select="-2 to ($cols - count(m:mtd/(@colspan/number(.),1)[1]))">
   <xsl:text>  \endcell </xsl:text>
  </xsl:for-each>
  <xsl:if test="not(../@side='left')">
   <xsl:apply-templates mode="pmml2tex" select="m:mtd[1]"/>
  </xsl:if>
  <xsl:if test="position()!=last()">\\&#10;</xsl:if>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:mtd">
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:if test="position()!=last()"> \endcell </xsl:if>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:ms">
  <xsl:text>\mbox{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="@*"/>
  <xsl:text>\textquotedbl </xsl:text>
  <xsl:variable name="t">
   <xsl:apply-templates mode="pmml2tex"/>
  </xsl:variable>
  <xsl:value-of select="replace($t,'&#160;','\\unicode{160}')"/>
  <xsl:text>\textquotedbl </xsl:text>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mover">
  <xsl:text>{</xsl:text>
  <xsl:text>\mathop{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}\limits</xsl:text>
  <xsl:text>\sp{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}</xsl:text>
  <xsl:text>}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:mover[*[2]='&#175;']" priority="2">
  <xsl:text>{</xsl:text>
  <xsl:text>\overline{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:munder">
  <xsl:text>{</xsl:text>
  <xsl:text>\mathop{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}\limits</xsl:text>
  <xsl:text>\sb{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}</xsl:text>
  <xsl:text>}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:munderover">
  <xsl:text>{</xsl:text>
  <xsl:text>\mathop{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[1]"/>
  <xsl:text>}\limits</xsl:text>
  <xsl:text>\sb{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[2]"/>
  <xsl:text>}</xsl:text>
  <xsl:text>\sp{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="*[3]"/>
  <xsl:text>}</xsl:text>
  <xsl:text>}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="m:mstyle">
  <xsl:text>{</xsl:text>
  <xsl:apply-templates mode="pmml2tex" select="@*"/>
  <xsl:apply-templates mode="pmml2tex"/>
  <xsl:text>}</xsl:text>
 </xsl:template>


 <xsl:template mode="pmml2tex" match="@*">
  <xsl:message select="'attribute: ',../name(),name(),string(.)"/>
 </xsl:template>
 <xsl:template mode="pmml2tex" match="@mathbackground" priority="2"/>
 <xsl:template mode="pmml2tex" match="@background" priority="2"/>

 <xsl:template mode="pmml2tex" match="*[@mathbackground|@background]" priority="100">
  <xsl:text>{</xsl:text>
  <xsl:for-each select="(@mathbackground,@background)[1]">
   <xsl:call-template name="color">
    <xsl:with-param name="cmd" select="'\colorbox'"/>
   </xsl:call-template>
  </xsl:for-each>
  <xsl:text>{$</xsl:text>
  <xsl:next-match/>
  <xsl:text>$}</xsl:text>
  <xsl:text>}</xsl:text>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="@color[../@mathcolor]" priority="20"/>
 <xsl:template mode="pmml2tex" match="@mathcolor|@color" name="color" priority="2">
  <xsl:param name="cmd" select="'\color'"/>
  <xsl:value-of select="$cmd"/>
  <xsl:choose>
   <xsl:when test="starts-with(.,'#') and string-length(.)=4">
    <xsl:text>[xRGB]{</xsl:text>
    <xsl:value-of select="upper-case(replace(.,'#(.)(.)(.)','$1$1,$2$2,$3$3}'))"/>
   </xsl:when>
   <xsl:when test="starts-with(.,'#') and string-length(.)=7">
    <xsl:text>[xRGB]{</xsl:text>
    <xsl:value-of select="upper-case(replace(.,'#(..)(..)(..)','$1,$2,$3}'))"/>
   </xsl:when>
   <xsl:otherwise>
    <xsl:text>{</xsl:text>
    <xsl:value-of select="lower-case(.)"/>
    <xsl:text>}</xsl:text>
   </xsl:otherwise>
  </xsl:choose>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:mstyle/@displaysize[.='true']"> \dislaystyle </xsl:template>



 <xsl:template mode="pmml2tex" match="m:mstack">
  <xsl:variable name="mstack">
   <mstack>
    <xsl:apply-templates select="*" mode="mstack">
     <xsl:with-param name="position" select="0" tunnel="yes"/>
    </xsl:apply-templates>
   </mstack>
  </xsl:variable>
  <xsl:message select="'mstack'"/>
  <xsl:message select="."/>
  <xsl:message select="'mstack-1'"/>
  <xsl:message select="$mstack"/>
  <xsl:variable name="charspace">
   <xsl:choose>
    <xsl:when test="@charspacing='loose'">.5em</xsl:when>
    <xsl:when test="@charspacing='medium'">.2em</xsl:when>
    <xsl:when test="@charspacing='tight'">0em</xsl:when>
    <xsl:when test="@charspacing">
     <xsl:value-of select="replace(@charspacing,'px','pt')"/>
    </xsl:when>
    <xsl:otherwise>0.2em</xsl:otherwise>
   </xsl:choose>
  </xsl:variable>
  <xsl:variable name="stackalign" select="(@stackalign,'decimalpoint')[1]"/>
  <xsl:variable name="charalign" select="(@charalign/substring(.,1,1),'c')[1]"/>
  <xsl:variable name="left"
   select="
				   max($mstack/*/m:msrow/m:mn[.='.']/count(preceding-sibling::*))"/>
  <xsl:variable name="right"
   select="
				    max($mstack/*/m:msrow/m:mn[.='.']/count(following-sibling::*))"/>
  <xsl:variable name="none"
   select="
				   max($mstack/*/m:msrow[not(m:mn[.='.'])or not($stackalign='decimalpoint')]/count(*))"/>
  <xsl:message
   select="'#@','l',$left,'r',$right,'n',$none,'???',max(($left,$none)) + ($right,0)[1] + 1"/>
  <xsl:variable name="total"
   select="if($stackalign='decimalpoint') then
		       max(($left,$none)) + ($right,0)[1] + 1
		       else
		       $none"/>

  <xsl:message select="'total',$total"/>
  <xsl:text>&#10;\begin{array}{@{\hspace{</xsl:text>
  <xsl:value-of select="$charspace"/>
  <xsl:text>}}*{</xsl:text>
  <xsl:value-of select="$total"/>
  <xsl:text>}{</xsl:text>
  <xsl:value-of select="$charalign"/>
  <xsl:text>@{\hspace{</xsl:text>
  <xsl:value-of select="$charspace"/>
  <xsl:text>}}}}&#10;</xsl:text>
  <xsl:message select="'##',$mstack/*/*/name()"/>
  <xsl:for-each-group group-ending-with="m:msrow" select="$mstack/*/*">
   <xsl:message select="'@@',name()"/>
   <xsl:apply-templates mode="pmml2tex" select="current-group()[last()]">
    <xsl:with-param name="stackalign" select="$stackalign"/>
    <xsl:with-param name="total" select="$total"/>
    <xsl:with-param name="carries" select="current-group()[last()-1][self::m:mscarries]"/>
    <xsl:with-param name="p" select="max($mstack/*/*/(count(*)+@p))" tunnel="yes"/>
   </xsl:apply-templates>
   <xsl:if test="position()!=last() and not(m:msline)">\\&#10;</xsl:if>
  </xsl:for-each-group>
  <xsl:text>&#10;\end{array}&#10;</xsl:text>
 </xsl:template>

 <xsl:template mode="mstack" match="*">
  <xsl:copy>
   <xsl:copy-of select="@*"/>
   <xsl:apply-templates mode="mstack">
    <xsl:with-param name="position" select="0" tunnel="yes"/>
   </xsl:apply-templates>
  </xsl:copy>
 </xsl:template>

 <xsl:template mode="mstack" match="m:msgroup" priority="3">
  <xsl:param name="position" tunnel="yes"/>
  <xsl:for-each select="*">
   <xsl:variable name="pn" select="position()"/>
   <xsl:apply-templates mode="mstack" select=".">
    <xsl:with-param name="position" select="number($position) + (../@shift,0)[1] * ($pn - 1) "
     tunnel="yes"/>
   </xsl:apply-templates>
  </xsl:for-each>
 </xsl:template>

 <xsl:template match="m:mn" mode="mstack">
  <xsl:for-each select="string-to-codepoints(replace(normalize-space(.),'[&#824;]',''))">
   <mn>
    <xsl:value-of select="codepoints-to-string(.)"/>
   </mn>
  </xsl:for-each>
 </xsl:template>


 <xsl:template match="*[not(self::m:msrow)]/*" mode="mstack" priority="2">
  <xsl:param name="position" tunnel="yes"/>
  <msrow type="implied" p="{$position}">
   <xsl:next-match/>
  </msrow>
 </xsl:template>

 <xsl:template match="m:mscarries" mode="mstack" priority="3">
  <xsl:param name="position" tunnel="yes"/>
  <xsl:text>&#10;</xsl:text>
  <mscarries p="{$position}">
   <xsl:copy-of select="@*,*"/>
  </mscarries>
  <xsl:if test="following-sibling::*[1]/self::m:mscarries">
   <msrow p="{$position}">
    <xsl:for-each select="*">
     <mn/>
    </xsl:for-each>
   </msrow>
  </xsl:if>
 </xsl:template>

 <xsl:template match="m:msrow" mode="mstack" priority="3">
  <xsl:param name="position" tunnel="yes"/>
  <xsl:text>&#10;</xsl:text>
  <msrow p="{sum($position,@position/number(.))}">
   <xsl:copy-of select="@*"/>
   <xsl:apply-templates mode="mstack"/>
  </msrow>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:msrow">
  <xsl:param name="p" tunnel="yes"/>
  <xsl:param name="carries"/>
  <xsl:param name="stackalign"/>
  <xsl:message select="'sa: ',$stackalign"/>
  <xsl:text>&#10;</xsl:text>
  <xsl:if test="$stackalign='right'">
   <xsl:if test="not(m:msline)">
    <xsl:for-each select="1 to xs:integer($p - @p - count(*))">\endcell</xsl:for-each>
   </xsl:if>
  </xsl:if>
  <xsl:if test="$stackalign='decimalpoint'">
   <xsl:if test="not(m:msline)">
    <xsl:for-each select="1 to xs:integer($p - @p - count(*))">\endcell</xsl:for-each>
   </xsl:if>
  </xsl:if>
  <xsl:if test="$stackalign='center'">
   <xsl:if test="not(m:msline)">
    <xsl:for-each select="(1 to (xs:integer($p - @p - count(*)) idiv 2)) ">\endcell</xsl:for-each>
   </xsl:if>
  </xsl:if>

  <xsl:variable name="rowcount" select="count(*)"/>
  <xsl:variable name="carriescount" select="count($carries/*)"/>
  <xsl:for-each select="*">
   <xsl:variable name="pn" select="position()"/>
   <xsl:variable name="cry"
    select="$carries/*[
    if($stackalign='left') then $pn
    else $carriescount -$rowcount + $pn
   ]"/>
   <xsl:choose>
    <xsl:when test="$cry">
     <xsl:message select="'====',$stackalign,'##',$cry,'@@@'"/>
     <xsl:text>\pmmltexcarry</xsl:text>
     <xsl:text>{</xsl:text>
     <xsl:value-of select="($cry/@location,$cry/../@location,'n')[1]"/>
     <xsl:text>}</xsl:text>
     <!--
<xsl:text>{</xsl:text>
<xsl:value-of select="($cry/@crossout,$cry/../@crossout,'none')[1]"/>
<xsl:text>}</xsl:text>
-->
     <xsl:text>{</xsl:text>
     <xsl:apply-templates mode="pmml2tex" select="$cry"/>
     <xsl:text>}</xsl:text>
     <xsl:text>{</xsl:text>
     <xsl:variable name="menclose">
      <m:menclose>
       <xsl:attribute name="notation" select="($cry/@crossout,$cry/../@crossout,'none')[1]"/>
       <xsl:copy-of select="."/>
      </m:menclose>
     </xsl:variable>
     <xsl:message select="'crossouts',$menclose"/>
     <xsl:apply-templates mode="pmml2tex" select="$menclose/*"/>
     <xsl:text>}</xsl:text>
    </xsl:when>
    <xsl:otherwise>
     <xsl:apply-templates mode="pmml2tex" select="."/>
    </xsl:otherwise>
   </xsl:choose>
   <xsl:if test="position()!=last()">\endcell&#10;</xsl:if>
  </xsl:for-each>
  <xsl:if test="$stackalign='left'">
   <xsl:if test="not(m:msline)">
    <xsl:for-each select="1 to xs:integer($p - @p - count(*))">\endcell</xsl:for-each>
   </xsl:if>
  </xsl:if>
  <xsl:text>&#10;</xsl:text>
 </xsl:template>



 <xsl:template mode="pmml2tex" match="m:msline"> \hline </xsl:template>

 <xsl:template mode="pmml2tex" match="m:msrow[m:msline]">
  <xsl:param name="p" tunnel="yes"/>
  <xsl:param name="stackalign"/>
  <xsl:param name="total"/>
  <xsl:apply-templates mode="pmml2tex" select="m:msline">
   <xsl:with-param name="stackalign" select="$stackalign"/>
   <xsl:with-param name="total" select="$total"/>
  </xsl:apply-templates>
 </xsl:template>

 <xsl:template mode="pmml2tex" match="m:msline" priority="2">
  <xsl:param name="p" tunnel="yes"/>
  <xsl:param name="stackalign"/>
  <xsl:param name="total"/>
  <xsl:variable name="length" select="(@length,$total)[1]"/>
  <xsl:variable name="start"
   select="max((1,(
     if($stackalign='right') then $total - $length + 1
     else if($stackalign='decimalpoint') then $total - $length
     else if($stackalign='center') then ($total - $length + 1) idiv 2
     else 1)
     - (@position,0)[1]))
     "/>
  <xsl:message select="'cline','t',$total,'s',$start,'l',string($length)"/>
  <xsl:variable name="rulew"
   select="
    if(@mslinethickness='thick') then '1pt'
    else if(@mslinethickness='medium' or not(@mslinethickness)) then '0.4pt'
    else if(@mslinethickness='thin') then '0.2pt'
    else replace(@mslinethickness,'px','pt')"/>
  <xsl:variable name="lefto" select="(@leftoverhang,'0pt')[1]"/>
  <xsl:variable name="righto" select="(@rightoverhang,'0pt')[1]"/>
  <xsl:value-of
   select="'&#10;\pmmlcline{',
		       $start,'}{',
		       min(($start + $length - 1,($total - 1)[$stackalign='decimalpoint'])),'}{' ,
		       $rulew,'}{' ,
		       $lefto,'}{' ,
		       $righto,'}&#10;'"
   separator=""/>
 </xsl:template>

</xsl:stylesheet>
