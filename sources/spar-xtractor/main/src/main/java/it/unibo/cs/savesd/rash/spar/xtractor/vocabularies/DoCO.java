package it.unibo.cs.savesd.rash.spar.xtractor.vocabularies;

import it.unibo.cs.savesd.rash.spar.xtractor.config.ConfigProperties;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.rdf.model.*;
 
/**
 * Vocabulary definitions from http://purl.org/spar/doco 
 * @author Andrea Nuzzolese 
 */
public class DoCO {
    
    private static final Logger LOG = LoggerFactory.getLogger(ConfigProperties.class);
    
    /** <p>The RDF model that holds the vocabulary terms</p> */
    private static Model m_model = ModelFactory.createDefaultModel();
    
    /** <p>The namespace of the vocabulary as a string</p> */
    public static final String NS = "http://purl.org/spar/doco/";
    
    /** <p>The namespace of the FABIO ontology </p> */
    public static final String FABIO_NS = "http://purl.org/spar/fabio/";
    
    
    /** <p>The namespace of the vocabulary as a string</p>
     *  @see #NS */
    public static String getURI() {return NS;}
    
    /** <p>The ontology's owl:versionInfo as a string</p> */
    public static final String VERSION_INFO = "1.2";
    
    /** <p>A literary device that is often found at the end of a piece of literature. 
     *  It generally covers the story of how the book came into being, or how the 
     *  idea for the book was developed. Alternatively, it may be written by someone 
     *  other than the author of the book, and may discuss the work's historical or 
     *  cultural context, if the work is being reissued many years after its original 
     *  publication.</p>
     */
    public static final Resource Afterword = m_model.createResource( NS + "Afterword" );
    
    /** <p>A supplemental addition to the main work. It may contain data, more detailed 
     *  information about methods and materials, or provide additional detail concerning 
     *  the information found in the main work.</p>
     */
    public static final Resource Appendix = m_model.createResource( NS + "Appendix" );
    
    /** <p>The final principle part of a document, in which is usually found the bibliography, 
     *  index, appendixes, etc.</p>
     */
    public static final Resource BackMatter = m_model.createResource( NS + "BackMatter" );
    
    /** <p>A list, usually within a bibliography, of all the references within the citing 
     *  document that refer to journal articles, books, book chapters, Web sites or 
     *  similar publications.</p>
     */
    public static final Resource BibliographicReferenceList = m_model.createResource( NS + "BibliographicReferenceList" );
    
    /** <p>A document section containing a list of bibliographic references.</p> */
    public static final Resource Bibliography = m_model.createResource( NS + "Bibliography" );
    
    /** <p>A block quotation (also known as a long quotation or extract) is a quotation 
     *  in a written document which is set off from the main text as a container for 
     *  distinct paragraphs, which is typically distinguished visually using indentation, 
     *  a different font, or smaller size. Block quotations are used for longer passages 
     *  than run-in quotations (which are set off with quotation marks).</p>
     */
    public static final Resource BlockQuotation = m_model.createResource( NS + "BlockQuotation" );
    
    /** <p>The central principle part of a document, that contains the real content. 
     *  It may be subdivided hierarchically by the use of chapters and sections.</p>
     */
    public static final Resource BodyMatter = m_model.createResource( NS + "BodyMatter" );
    
    /** <p>A rectangle space within a page that contains an object and its related caption.</p> */
    public static final Resource CaptionedBox = m_model.createResource( NS + "CaptionedBox" );
    
    /** <p>A principle division of the body matter of a large document, such as a book, 
     *  a report or a legislative document.</p>
     */
    public static final Resource Chapter = m_model.createResource( NS + "Chapter" );
    
    /** <p>A block containing a label for the chapter, that may include the chapter number.</p> */
    public static final Resource ChapterLabel = m_model.createResource( NS + "ChapterLabel" );
    
    /** <p>The subtitle of a chapter.</p> */
    public static final Resource ChapterSubtitle = m_model.createResource( NS + "ChapterSubtitle" );
    
    /** <p>The title of a chapter.</p> */
    public static final Resource ChapterTitle = m_model.createResource( NS + "ChapterTitle" );
    
    /** <p>A brief description of publication or production notes relevant to the document.</p> */
    public static final Resource Colophon = m_model.createResource( NS + "Colophon" );
    
    /** <p>A quotation with a complex structure, that is included inline and is usually 
     *  enclosed within quotation marks.</p>
     */
    public static final Resource ComplexRunInQuotation = m_model.createResource( NS + "ComplexRunInQuotation" );
    
    /** <p>A communication object comprising one or more graphics, drawings, images, 
     *  or other visual representations..</p>
     */
    public static final Resource Figure = m_model.createResource( NS + "Figure" );
    
    /** <p>A space within a document that contains a figure and its caption.</p> */
    public static final Resource FigureBox = m_model.createResource( NS + "FigureBox" );
    
    /** <p>A block containing a label for the figure box, that may include the figure 
     *  number.</p>
     */
    public static final Resource FigureLabel = m_model.createResource( NS + "FigureLabel" );
    
    /** <p>A structure within a sentence that permits the author to make a comment or 
     *  to cite another publication in support of the text, or both. A footnote is 
     *  normally flagged by a superscript number immediately following that portion 
     *  of the text to which it relates. For convenience of reading, the text of the 
     *  footnote is usually printed at the bottom of the page or at the end of a text.</p>
     */
    public static final Resource Footnote = m_model.createResource( NS + "Footnote" );
    
    /** <p>A section in a book or report, usually written by someone other than the author, 
     *  that introduces or commends the document to the reader. It may include description 
     *  of the interaction between the writer of the foreword and the author.</p>
     */
    public static final Resource Foreword = m_model.createResource( NS + "Foreword" );
    
    /** <p>A unit of information expressed in mathematical, chemical or logical symbols 
     *  and language.</p>
     */
    public static final Resource Formula = m_model.createResource( NS + "Formula" );
    
    /** <p>A space within a document that contains one or more formulae.</p> */
    public static final Resource FormulaBox = m_model.createResource( NS + "FormulaBox" );
    
    /** <p>The initial principle part of a document, usually containing self-referential 
     *  metadata. In a book, this typically includes its title, authors, publisher, 
     *  publication date, ISBN and copyright declaration, together with the preface, 
     *  foreword, table of content, etc. In a journal article, the front matter is 
     *  normally restricted to the title, authors and the authors' affiliation details, 
     *  although the latter may alternatively be included in a footnote or the back 
     *  matter. In books, the front matter pages may be numbered in lowercase Roman 
     *  numerals.</p>
     */
    public static final Resource FrontMatter = m_model.createResource( NS + "FrontMatter" );
    
    /** <p>A set of definitions of words or phrases of importance to the work, normally 
     *  alphabetized. In longer works of fiction, the entries may contains places 
     *  and characters.</p>
     */
    public static final Resource Glossary = m_model.createResource( NS + "Glossary" );
    
    /** <p>A section containing a list of references to information on the named topic 
     *  of importance to the content of the document. The references may be to page 
     *  numbers, paragraph numbers, section numbers or chapter numbers within the 
     *  document.</p>
     */
    public static final Resource Index = m_model.createResource( NS + "Index" );
    
    /** <p>A block containing text, that may include a number (e.g., "Chapter Three", 
     *  "3.2", "Figure 1", "Table"), used to identify an item within the document, 
     *  for example a chapter, a figure, a section or a table.</p>
     */
    public static final Resource Label = m_model.createResource( NS + "Label" );
    
    /** <p>A line in poetry is a unit of language into which a poem is divided which 
     *  operates on principles which are distinct from and not necessarily coincident 
     *  with grammatical structures, such as the sentence or clauses in sentences. 
     *  A distinct numbered group of lines in verse is normally called a stanza.</p>
     */
    public static final Resource Line = m_model.createResource( NS + "Line" );
    
    /** <p>An enumeration of items.</p> */
    public static final Resource List = m_model.createResource( NS + "List" );
    
    /** <p>A list of items each denoting an agent, such as an author, a contributor or 
     *  an organization, related to a particular publication.</p>
     */
    public static final Resource ListOfAgents = m_model.createResource( NS + "ListOfAgents" );
    
    /** <p>A list of items each denoting an author of a particular publication.</p> */
    public static final Resource ListOfAuthors = m_model.createResource( NS + "ListOfAuthors" );
    
    /** <p>A list of items, each denoting a contributor to a publication such as an encyclopedia 
     *  or a text book, where such contributions are insufficient to warrant classification 
     *  as author.</p>
     */
    public static final Resource ListOfContributors = m_model.createResource( NS + "ListOfContributors" );
    
    /** <p>A section of the document listing all the figures, identified by their titles 
     *  and referenced to their locations in the document. May also be referred to 
     *  as 'List of illustrations'.</p>
     */
    public static final Resource ListOfFigures = m_model.createResource( NS + "ListOfFigures" );
    
    /** <p>A list of items, each denoting an organization or institution related to the 
     *  publication, for example the authors' affiliations, or the suppliers of information, 
     *  software, equipment or consumables used in the work described in the publication.</p>
     */
    public static final Resource ListOfOrganizations = m_model.createResource( NS + "ListOfOrganizations" );
    
    /** <p>A list of items each representing a reference to a specific part of the same 
     *  document, or to another publication.</p>
     */
    public static final Resource ListOfReferences = m_model.createResource( NS + "ListOfReferences" );
    
    /** <p>A section of the document listing all the tables, identified by their titles 
     *  and referenced to their locations in the document.</p>
     */
    public static final Resource ListOfTables = m_model.createResource( NS + "ListOfTables" );
    
    /** <p>A self-contained unit of discourse that deals with a particular point or idea. 
     *  Paragraphs contains one or more sentences. The start of a paragraph is indicated 
     *  by beginning on a new line, which may be indented or separated by a small 
     *  vertical space by the preceding paragraph.</p>
     */
    public static final Resource Paragraph = m_model.createResource( NS + "Paragraph" );
    
    /** <p>A container of a semantic subdivision of a document. For example, chapters 
     *  of a novel may be grouped into distinct parts that may be named 'Part 1', 
     *  'Part 2', etc., 'Book 1', 'Book 2', etc., or 'Genesis', 'Exodus', etc.</p>
     */
    public static final Resource Part = m_model.createResource( NS + "Part" );
    
    /** <p>A section describing how the document came into being, or how the idea for 
     *  it was developed. The preface may contains acknowledgements. The preface to 
     *  a later edition of the work often explains in what respect that edition differs 
     *  from previous ones.</p>
     */
    public static final Resource Preface = m_model.createResource( NS + "Preface" );
    
    /** <p>A logical division of the text, usually numbered and/or titled, which may 
     *  contain subsections.</p>
     */
    public static final Resource Section = m_model.createResource( NS + "Section" );
    
    /** <p>A block containing a label for the section, that may include the section number.</p> */
    public static final Resource SectionLabel = m_model.createResource( NS + "SectionLabel" );
    
    /** <p>The subtitle of a section.</p> */
    public static final Resource SectionSubtitle = m_model.createResource( NS + "SectionSubtitle" );
    
    /** <p>The title of a section.</p> */
    public static final Resource SectionTitle = m_model.createResource( NS + "SectionTitle" );
    
    /** <p>An expression in natural language forming a single grammatical unit. A sentence 
     *  minimally consists of a subject and an intransitive verb, or a subject, a 
     *  transitive verb and an object, and may include additional dependent clauses. 
     *  In written text, a sentence is always terminated by a full stop. A sentence 
     *  can include words grouped meaningfully to express a statement, a question, 
     *  an exclamation, a request or a command.</p>
     */
    public static final Resource Sentence = m_model.createResource( NS + "Sentence" );
    
    /** <p>A textual quotation that is included inline and is usually enclosed within 
     *  quotation marks.</p>
     */
    public static final Resource SimpleRunInQuotation = m_model.createResource( NS + "SimpleRunInQuotation" );
    
    /** <p>A unit within a larger poem. A stanza consists of a grouping of lines, set 
     *  off by a vertical space from other stanzas, that usually has a set pattern 
     *  of meter and rhyme.</p>
     */
    public static final Resource Stanza = m_model.createResource( NS + "Stanza" );
    
    /** <p>An explanatory or alternative title of a publication. For example, Mary Shelley 
     *  uses the alternative title 'The Modern Prometheus' to hint at the theme of 
     *  her most famous novel 'Frankenstein'; Nick Efford uses the subtitle 'a practical 
     *  introduction using Java' to qualify the title of his book 'Digital Image Processing'.</p>
     */
    public static final Resource Subtitle = m_model.createResource( NS + "Subtitle" );
    
    /** <p>A set of data arranged in cells within rows and columns.</p> */
    public static final Resource Table = m_model.createResource( NS + "Table" );
    
    /** <p>A space within a document that contains a table and its caption.</p> */
    public static final Resource TableBox = m_model.createResource( NS + "TableBox" );
    
    /** <p>A block containing a label for the table box, that may include the table number.</p> */
    public static final Resource TableLabel = m_model.createResource( NS + "TableLabel" );
    
    /** <p>A section of the document listing all the chapters and sections, identified 
     *  by their titles and referenced to their locations in the document. The table 
     *  of contents may include a list of the front-matter and back-matter items, 
     *  in addition to the body-matter items. Where the document is a journal or magazine 
     *  issue, the table of content lists the constituent items contained in that 
     *  issue, typically by title, authors and first page number.</p>
     */
    public static final Resource TableOfContents = m_model.createResource( NS + "TableOfContents" );
    
    /** <p>A space within a document that contains textual content relating to, quoting 
     *  from or expanding upon the main text. Usually a textbox is delimited by a 
     *  border or use of a background colour distinct from that of the main text.</p>
     */
    public static final Resource TextBox = m_model.createResource( NS + "TextBox" );
    
    /** <p>A piece of text defined by a start point and an end point.</p> */
    public static final Resource TextChunk = m_model.createResource( NS + "TextChunk" );
    
    /** <p>A word, phrase or sentence that precedes and indicates the subject of a document 
     *  or a document component - e.g., a book, a report, a news article, a chapter, 
     *  a section or a table.</p>
     */
    public static final Resource Title = m_model.createResource( NS + "Title" );
    
    public static final Resource Expression = m_model.createResource( FABIO_NS + "Expression" );
    
    public static final Resource Abstract = m_model.createResource( NS + "Abstract" );
    
    public static Set<Resource> keys(){
        Set<Resource> keys = new HashSet<Resource>();
        Field[] fields = DoCO.class.getFields();
        for(Field field : fields){
            Resource value = null;
            try {
                Object object = field.get(value);;
                if(object instanceof Resource){
                    value = (Resource) field.get(value);
                    System.out.println(value);
                }
            } catch (IllegalArgumentException e) {
                LOG.error(e.getMessage(), e);
            } catch (IllegalAccessException e) {
                LOG.error(e.getMessage(), e);
            }
            if(value != null) keys.add(value);
        }
        
        return keys;
    }
    
    public static Resource getDoCOClass(DoCOClass docoClass){
        switch (docoClass) {
            case Expression:
                return DoCO.Expression;
            case Abstract:
                return DoCO.Abstract;
            default:
                return m_model.createResource(NS + docoClass);
        }
        
    }
    
    public static void main(String[] args) {
        System.out.println(getDoCOClass(DoCOClass.Chapter));
    }
    
}
