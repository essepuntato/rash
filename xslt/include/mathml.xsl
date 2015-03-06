<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xs="http://www.w3.org/2001/XMLSchema" 
	xmlns:m="http://www.w3.org/1998/Math/MathML" 
	xmlns:h="http://www.w3.org/1999/xhtml"
	exclude-result-prefixes="xs m h">

	<xsl:import href="mathml_frag.xsl"/>
	<xsl:import href="named_templates.xsl"/>

	<xsl:output 
		encoding="UTF-8" 
		method="text" 
		omit-xml-declaration="yes" 
		indent="no"/>

	<xsl:template match="m:math">
		<xsl:text> \[\let\par\empty </xsl:text> 
		<xsl:variable name="tex">
			<xsl:apply-templates mode="pmml2tex"/>
		</xsl:variable>
		<xsl:if test="$tex">
			<xsl:value-of
				select="for $c in string-to-codepoints(replace($tex,' *&#10;\s+','&#10;')) return
				  if ($c gt 127) then ('\unicode{',$c,'}') else codepoints-to-string($c)"
				separator=""/>
		</xsl:if> 
		<xsl:text> \]</xsl:text> 
	</xsl:template>
</xsl:stylesheet>
