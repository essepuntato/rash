%% acmlarge.cls - version 1.7
%% Aptara Inc./Gerry Murray, dated March 05 March 2012
%% Boris Veytsman, 10 August 2013
%% (c) 2011-2013 Association for Computing Machinery (ACM)
%% For large trim journals
%%
%% Based on acmtrans2m.cls 
%%
%% If you face any problem while working with this class file or have any feedback/suggestion, 
%% please contact ACM Support helpline at: "acmtexsupport@aptaracorp.com".
%% Users can also go through the FAQs available on the journal's submission webpage.
%%
%%
%% Version 1.7: Incorporated acmcopyright.cls
%%
%% Version 1.6: New copyright code
%%
%% Version 1.5: New CCS code
%%
%% Version 1.4: added new copyright statements
%%
%%
%% Version 1.3 (History)
%% ---------------------
%% 1) All citation formats are also redefined after
%%    checking the loading condition of natbib.sty 
%% 2) Added an option called 'prodmode', which uses New Century School Book
%%    and Helvetica as base and second font respectively after
%%    feedback from Joanne (Dated 28/06/2010) to simulate print output.
%% 3) Added newtheorem definition for 'conjecture'
%% 4) Trimmed the 'double outputting' of the DOI/URL beneath ACM Reference Format (before 1. INTRODUCTION)
%%    and also beneath the Permission Statement/copyright line. Also inserted the "http://dx.doi.org" stem. (Gerry Murray, March 2012)
%%
%% Steps to compile: latex, bibtex, latex latex
%%
%% \CharacterTable
%%  {Upper-case    \A\B\C\D\E\F\G\H\I\J\K\L\M\N\O\P\Q\R\S\T\U\V\W\X\Y\Z
%%   Lower-case    \a\b\c\d\e\f\g\h\i\j\k\l\m\n\o\p\q\r\s\t\u\v\w\x\y\z
%%   Digits        \0\1\2\3\4\5\6\7\8\9
%%   Exclamation   \!     Double quote  \"     Hash (number) \#
%%   Dollar        \$     Percent       \%     Ampersand     \&
%%   Acute accent  \'     Left paren    \(     Right paren   \)
%%   Asterisk      \*     Plus          \+     Comma         \,
%%   Minus         \-     Point         \.     Solidus       \/
%%   Colon         \:     Semicolon     \;     Less than     \<
%%   Equals        \=     Greater than  \>     Question mark \?
%%   Commercial at \@     Left bracket  \[     Backslash     \\
%%   Right bracket \]     Circumflex    \^     Underscore    \_
%%   Grave accent  \`     Left brace    \{     Vertical bar  \|
%%   Right brace   \}     Tilde         \~}
%%
%% Bibliographic cite forms needed:
%%
%%  \cite{key}
%%    which produces citations with author list and year.
%%    eg. [Brown 1978; Jarke, et al. 1985]
%%  \citeA{key}
%%    which produces citations with only the author list.
%%    eg. [Brown; Jarke, et al.]
%%  \citeN{key}
%%    which produces citations with the author list and year, but
%%    can be used as nouns in a sentence; no brackets appear around
%%    the author names, but only around the year.
%%      eg. Shneiderman [1978] states that......
%%    \citeN should only be used for a single citation.
%%    \citeNN{refkey1,refkey2} for author [ref1year; ref2year]
%%    \citeyear{key}
%%        which produces the year information only, within brackets.
%%
%% Abbreviated author lists use the ``et al.'' construct.
%%
%% The above are examples of required ACM bibliographic cite formats needed.
%% *******************
%% Here is the complete list of cite forms from the chicago bibliographic style
%%
%%  \cite{key}
%%    which produces citations with abbreviated author list and year.
%%  \citeNP{key}
%%    which produces citations with abbreviated author list and year.
%%  \citeA{key}
%%    which produces only the abbreviated author list.
%%  \citeANP{key}
%%    which produces only the abbreviated author list.
%%  \citeN{key}
%%    which produces the abbreviated author list and year, with only the
%%    year in parentheses. Use with only one citation.
%%  \citeyear{key}
%%    which produces the year information only, within parentheses.
%%  \citeyearNP{key}
%%    which produces the year information only.
%%
%% Abbreviated author lists use the ``et al.'' construct.
%%
%% `NP' means `no parentheses' 
%%
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{acmlarge} [2013/08/10 v1.7 ACM Transactions class]
%
\def\fileversion{v1.7}            
\def\filedate{August 10, 2013}
%
\def\@acmVolume{V} %the volume
\def\@acmNumber{N} %the number
\def\@acmYear{YY}  %the last two digits of the year, 
\def\@acmMonth{1}  %the month
\def\@journalName{ACM Journal Name} %the name of the ACM journal
\def\@journalNameShort{jn} %the acronym of the ACM journal
\def\@permissionCodeOne{0000-0000} %the permission code of the ACM journal
\def\@permissionCodeTwo{0000} %the permission code of the ACM journal part 2
\def\@articleSeq{1} %Article sequence
\def\articleSeq#1{\gdef\@articleSeq{#1}}
\def\acmArticle#1{\gdef\@acmArticle{#1}}
\def\@doi{http://dx.doi.org/10.1145/0000000.0000000} % These 'default' '0' values are over-ridden, during production, with 'correct' numbers entered via source .tex file - Gerry March 2012

% ----------------
% Gerry - April 2011 - To assist in the formatting of the NEW ACM Reference format - 'DOI' in tt font, and url string in default
\usepackage{url}
\def\UrlFont{}
\newcommand{\BIBand}{\&}
\def\showDOI#1{\mbox{{\tt DOI:}{#1}}} % Gerry April 2011 - forces the DOI: to 'stay' with the 'url-(string)link' (no need for space at end either)
% ----------------

\def\@acmWidth{39.14pc}
\def\@acmMargin{1in}

\newif\ifStBan\global\StBanfalse
\DeclareOption{StBan}{\StBantrue}
\frenchspacing
\DeclareOption{acmtap}{
  \typeout{}
  \typeout{Using ACM, TAP's option: 2010/05/18 by Aptara}
  \typeout{}
  \def\@journalName{ACM Transactions on Applied Perception}
  \def\@journalNameShort{ACM Trans. Appl. Percept.}        
  \def\@permissionCodeOne{1544-3558}
  \def\@permissionCodeTwo{0100} 
}
%
\DeclareOption{acmtomccap}{
  \typeout{}
  \typeout{Using ACM, TOMCCAP's option: 2010/05/18 by Aptara}
  \typeout{}
  \def\@journalName{ACM Transactions on Multimedia Computing, Communications and Applications}
  \def\@journalNameShort{ACM Trans. Multimedia Comput. Commun. Appl.}        
  \def\@permissionCodeOne{1551-6857} 
  \def\@permissionCodeTwo{0100} 
}
%
\DeclareOption{acmjocch}{
  \typeout{}
  \typeout{Using ACM, JOCCH option: 2010/05/18 by Aptara}
  \typeout{}
  \def\@journalName{ACM Journal on Computing and Cultural Heritage}%
  \def\@journalNameShort{ACM J. Comput. Cult. Herit.}        
  \def\@permissionCodeOne{1556-4673} 
  \def\@permissionCodeTwo{0100} 
}
%
\setlength\paperheight {11.25in}%
\setlength\paperwidth  {8.75in}%
\def\special@paper{8.75in,11.25in}
\special{papersize=8.75in,11.25in}
%
\newif\ifprod@mode\global\prod@modefalse
\DeclareOption{prodmode}{\global\prod@modetrue
     \typeout{Using ACM, prodmode option: 2010/06/28 by Aptara}}
\DeclareOption{final}{\setlength\overfullrule{0pt}}
\DeclareOption{oneside}{\@twosidefalse \@mparswitchfalse}
\DeclareOption{twoside}{\@twosidetrue  \@mparswitchtrue}

\DeclareOption{10pt}{\def\@ptsize{0}}
\DeclareOption{11pt}{\ClassError{acmtrans}{11pt style not supported}
                        {ACM transactions documents can be set in 10pt only}}
\DeclareOption{12pt}{\ClassError{acmtrans}{11pt style not supported}
                        {ACM transactions documents can be set in 10pt only}}
\def\pages{\pageref{@firstpg}--\pageref{@lastpg}}%
\def\@getpagenum#1#2{#2}%
\def\mypage{\thepage}%
\DeclareOption{omitline}{\def\@abstractbottom{\relax}}
%
\DeclareOption{dontomitline}{\def\@abstractbottom{\hbox{\vrule height .2pt width \@acmWidth}}}



\ExecuteOptions{twoside,final,10pt,dontomitline,StBan}
%
\ProcessOptions
\RequirePackage{ifpdf}%
\ifpdf
\pdfpagewidth=8.5in
\pdfpageheight=11in
\fi
\ifprod@mode
\renewcommand{\rmdefault}{pnc}
\renewcommand{\sfdefault}{phv}
\fi
%
\def\acmVolume#1{\gdef\@acmVolume{#1}}
\def\acmNumber#1{\gdef\@acmNumber{#1}}
\def\acmYear#1{\gdef\@acmYear{#1}}
\def\acmMonth#1{\gdef\@acmMonth{#1}}
\def\doi#1{\gdef\@doi{#1}}
%
\newcommand{\monthWord}[1]{\ifcase#1\or
  January\or February\or March\or April\or May\or June\or
  July\or August\or September\or October\or November\or December\else Month\fi}
%
\newcommand{\monthInf}[1]{\ifcase#1\or
  01\or 02\or 03\or 04\or 05\or 06\or
  07\or 08\or 09\or 10\or 11\or 12\else 00\fi}
%
\lineskip 1pt \normallineskip 1pt
\def\baselinestretch{1}
%
\renewcommand\normalsize{%
  \@setfontsize\normalsize\@xpt\@xiipt
  \abovedisplayskip 6pt plus2pt minus1pt\belowdisplayskip \abovedisplayskip
  \abovedisplayshortskip 6pt plus0pt minus 3pt
  \belowdisplayshortskip 6pt plus0pt minus3pt\let\@listi\@listI} 
%
\newcommand\small{%
  \@setfontsize\small\@ixpt{11pt}%
  \abovedisplayskip 5pt plus 2pt minus 1pt\belowdisplayskip \abovedisplayskip
  \abovedisplayshortskip 5pt plus0pt minus2pt\belowdisplayshortskip 5pt plus0pt
      minus 2pt
  \def\@listi{\leftmargin\leftmargini \topsep 5pt plus 2pt minus 1pt\parsep 0pt
    plus .7pt 
  \itemsep 1.6pt plus .8pt}}
\newcommand\footnotesize{%
  \@setsize\footnotesize{10pt}\viiipt\@viiipt
  \abovedisplayskip 4pt plus 1pt minus 0pt\belowdisplayskip \abovedisplayskip
  \abovedisplayshortskip 4pt plus 0pt minus 1pt\belowdisplayshortskip 4pt plus 0pt minus 1pt
  \def\@listi{\leftmargin\leftmargini \topsep 4pt plus 1pt minus 0pt\parsep 0pt plus .5pt 
     \itemsep 1pt plus .7pt}}
%
\newcommand\scriptsize{\@setfontsize\scriptsize\@viipt\@viiipt}
\newcommand\tiny{\@setfontsize\tiny\@vpt\@vipt}
\newcommand\large{\@setfontsize\large\@xiipt{14}}
\newcommand\Large{\@setfontsize\Large\@xivpt{18}}
\newcommand\LARGE{\@setfontsize\LARGE\@xviipt{20}}
\newcommand\huge{\@setfontsize\huge\@xxpt{25}}
\newcommand\Huge{\@setfontsize\Huge\@xxvpt{30}}
%
\normalsize 
%
\newdimen\tempdimen  
\newdimen\temptxtwd
\temptxtwd\paperwidth
\advance\temptxtwd-\@acmWidth
\divide\temptxtwd2
\oddsidemargin\temptxtwd
\evensidemargin\temptxtwd
\marginparwidth 0.5in 
\marginparsep .125in 
\topmargin97pt
\headheight 6pt
\headsep 19.2pt
\topskip6pt
\footskip 15pt 
%
\textheight 47pc \textwidth \@acmWidth \columnsep 10pt \columnseprule 0pt 
%
\advance\textheight-2.6pt
\newdimen\normaltextheight
\setlength\normaltextheight{\textheight}
%
\def\titlefont{\fontsize{18}{20}\selectfont\raggedright}
\def\authorfont{\fontsize{10}{12}\rightskip0pt plus1fill\selectfont}
\def\affilfont{\fontsize{10}{12}\rightskip0pt plus1fill\selectfont}
\def\rhfont{\fontsize{9}{10}\selectfont}
\def\sectionfont{\fontsize{10}{12}\capsshape\selectfont\raggedright}
\def\subsectionfont{\fontsize{10}{12}\selectfont}
\def\figcaptionfont{\fontsize{8}{10}\selectfont\mathversion{normal}}%
\def\subcaptionfont{\fontsize{8}{10}\selectfont\mathversion{normal}}%
\def\subcaption#1{{\centering\subcaptionfont#1\par}}
%
\def\tablefont{\fontsize{8}{10}\selectfont}%
\def\tablecaptionfont{\fontsize{9}{11}\selectfont\centering}%
\def\tablenumfont{\fontsize{9}{11}\selectfont}%
\def\tabnotefont{\fontsize{7}{9}\selectfont}
\def\Opentab{{\vrule width18pt depth0pt height72pt}}
%
\newdimen\normaltextheight
\newdimen\blindfoliodrop
\newbox\tempbox
%
\DeclareFontFamily{OT1}{ams}{}
\DeclareFontShape{OT1}{ams}{m}{n}{ <-> msam10 }{}
\DeclareFontShape{OT1}{ams}{m}{it}{ <-> msam10 }{}
\DeclareFontShape{OT1}{ams}{bx}{n}{ <-> msbm10 }{}
\DeclareFontShape{OT1}{ams}{bx}{it}{ <-> msbm10 }{}
%
\def\cal{\mathcal}
\def\lhd{\mathbin{< \hbox to -.43em{}\hbox{\vrule
      \@width .065em \@height .55em \@depth .05em}\hbox to .2em{}}}
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  Bold Math %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
\def\boldmath{\mathversion{bold}}
\def\bm#1{\mathchoice
  {\mbox{\boldmath$\displaystyle#1$}}%
  {\mbox{\boldmath$#1$}}%
  {\mbox{\boldmath$\scriptstyle#1$}}%
  {\mbox{\boldmath$\scriptscriptstyle#1$}}}
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% End Fonts %%%%%%%%%%%%%%%%%%%%%%
%
\footnotesep 7pt
\skip\footins 15pt plus 4pt minus 3pt 
\floatsep 12pt plus 2pt minus 2pt 
\textfloatsep \floatsep 
\intextsep 1pc plus 1pc 
\dblfloatsep 12pt plus 2pt minus 2pt 
\dbltextfloatsep 20pt plus 2pt minus 4pt 
\@fptop 0pt plus 1fil \@fpsep 1pc plus 2fil \@fpbot 0pt plus 1fil 
\@dblfptop 0pt plus 1fil \@dblfpsep 8pt plus 2fil \@dblfpbot 0pt plus 1fil
\marginparpush 6pt 
\parskip 0pt \parindent 10pt \partopsep 0pt
\@lowpenalty 51 \@medpenalty 151 \@highpenalty 301 
\@beginparpenalty -\@lowpenalty \@endparpenalty -\@lowpenalty \@itempenalty
-\@lowpenalty 

\newcounter{part}
\newcounter{section}
\newcounter{subsection}[section]
\newcounter{subsubsection}[subsection]
\newcounter{paragraph}[subsubsection]

\def\thepart{\Roman{part}} 
\def\thesection {\arabic{section}}
\def\thesubsection {\thesection.\arabic{subsection}}
\def\thesubsubsection {\thesubsection.\arabic{subsubsection}}
\def\theparagraph {\thesubsubsection.\arabic{paragraph}}

\def\part{\@ucheadtrue
 \@startsection{part}{9}{\z@}{-10pt plus -4pt minus -2pt}{4pt}{\reset@font\normalsize\sffamily}}
\def\section{\@ucheadtrue
 \@startsection{section}{1}{\z@}{-10pt plus -4pt minus -2pt}{4pt}{\reset@font\normalsize\sffamily}}
\def\subsection{\@ucheadfalse
 \@startsection{subsection}{2}{\z@}{-8pt plus -2pt minus -1pt}{4pt}{\reset@font\normalsize\sffamily}}
\def\subsubsection{\@ucheadfalse
 \@startsection{subsubsection}{3}{\parindent}{6pt plus 1pt}{-5pt}{\reset@font\normalsize\itshape}}
\def\paragraph{\@ucheadfalse
 \@startsection{paragraph}{3}{\parindent}{6pt plus 1pt}{-5pt}{\reset@font\normalsize\itshape}}

\renewcommand{\@seccntformat}[1]{\textup{\csname the#1\endcsname}}

\gdef\@period{.}

\def\@startsection#1#2#3#4#5#6{%
  \if@noskipsec \leavevmode \fi
  \par
  \@tempskipa #4\relax
  \@afterindenttrue
  \ifdim \@tempskipa <\z@
    \@tempskipa -\@tempskipa \@afterindentfalse
  \fi
  \if@nobreak
    \everypar{}%
  \else
    \addpenalty\@secpenalty\addvspace\@tempskipa
  \fi
  \@ifstar
    {\@ssect{#3}{#4}{#5}{#6}}%
    {\@dblarg{\@sect{#1}{#2}{#3}{#4}{#5}{#6}}}}
\def\@sect#1#2#3#4#5#6[#7]#8{%
  \ifnum #2>\c@secnumdepth
    \let\@svsec\@empty
  \else
    \refstepcounter{#1}%
      \if@uchead%
            \protected@edef\@svsec{\@seccntformat{#1}.\quad\relax}%
        \else%
            \protected@edef\@svsec{\@seccntformat{#1}\quad\relax}%
        \fi%
  \fi
  \@tempskipa #5\relax
  \ifdim \@tempskipa>\z@
    \begingroup
      #6{%
        \@hangfrom{\hskip #3\relax\@svsec}%
          \interlinepenalty \@M \if@uchead\MakeUppercase{#8}\else#8\fi \@@par}%
    \endgroup
    \csname #1mark\endcsname{#7}%
    \addcontentsline{toc}{#1}{%
      \ifnum #2>\c@secnumdepth \else
        \protect\numberline{\csname the#1\endcsname}%
      \fi
      #7}%
  \else
    \def\@svsechd{%
      #6{\hskip #3\relax
      \@svsec \if@uchead\Makeuppercase{#8}\else#8\fi}%
      \csname #1mark\endcsname{#7}%
      \addcontentsline{toc}{#1}{%
        \ifnum #2>\c@secnumdepth \else
          \protect\numberline{\csname the#1\endcsname}%
        \fi
        #7}}%
  \fi
  \@xsect{#5}}

\def\@xsect#1{\@tempskipa #1\relax
 \ifdim \@tempskipa>\z@
 \par \nobreak
 \vskip \@tempskipa
 \@afterheading
 \else \global\@nobreakfalse \global\@noskipsectrue
 \everypar{\if@noskipsec \global\@noskipsecfalse
 \clubpenalty\@M \hskip -\parindent
 \begingroup \@svsechd\@period \endgroup \unskip
 \hskip -#1
 \else \clubpenalty \@clubpenalty
 \everypar{}\fi}\fi\ignorespaces}
\newif\if@uchead\@ucheadfalse
\setcounter{secnumdepth}{3}
\newcounter{secnumbookdepth}
\setcounter{secnumbookdepth}{3}
\newfont{\apbf}{cmbx9}
\def\@withappendix#1{App--\number #1}

\def\appenheader{\global\@topnum\z@ \global\@botroom \textheight \begin{figure}
\newfont{\sc}{cmcsc10}
\parindent\z@
\hbox{}
\vskip -\textfloatsep
\vskip 11pt
\hrule height .2pt width \@acmWidth
\vskip 2pt\rule{0pt}{10pt}\ignorespaces}
\def\endappenheader{\end{figure}\gdef\appendixhead{}}
\def\@appsec{}
\def\appendix{\par
  \setcounter{section}{0}
  \setcounter{subsection}{0}
%  \section*{APPENDIX } \vskip10pt
  \def\thesection{\Alph{section}}
  \def\theHsection{\Alph{section}}}

% Algorithm
\def\algofont{\fontsize{9}{10}\selectfont}

% Lists
\def\@trivlist{%
    \@topsepadd\topsep
    \if@noskipsec
        \global\let\@period\@empty
        \leavevmode
        \global\let\@period.%
    \fi
    \ifvmode
        \advance\@topsepadd\partopsep
    \else
        \unskip
        \par
    \fi
    \if@inlabel
        \@noparitemtrue
        \@noparlisttrue
    \else
        \@noparlistfalse
        \@topsep\@topsepadd
    \fi
    \advance\@topsep \parskip
    \leftskip\z@skip
    \rightskip\@rightskip
    \parfillskip\@flushglue
    \@setpar{\if@newlist\else{\@@par}\fi}
    \global\@newlisttrue
    \@outerparskip\parskip
}
\labelsep 5\p@

\settowidth{\leftmargini}{9.}
\addtolength\leftmargini\labelsep

\settowidth{\leftmarginii}{(b)}
\addtolength\leftmarginii\labelsep

\leftmarginiii  \leftmarginii
\leftmarginiv   \leftmarginii
\leftmarginv    \leftmarginii
\leftmarginvi   \leftmarginii
\leftmargin     \leftmargini

\labelwidth\leftmargini
\advance\labelwidth-\labelsep
\def\@listI{%
    \leftmargin\leftmargini
    \parsep \z@ 
    \topsep .5\baselineskip \@plus 2\p@%
    \itemsep\z@%
}

\let\@listi\@listI

\@listi
\def\@listii{%
    \leftmargin\leftmarginii
    \labelwidth\leftmarginii
    \advance\labelwidth-\labelsep
    \topsep \z@ 
    \parsep \z@ 
    \itemsep \parsep
}
\def\@listiii{%
    \leftmargin\leftmarginiii
    \labelwidth\leftmarginiii
    \advance\labelwidth-\labelsep
    \topsep \z@ \@plus \p@
    \parsep \z@ 
    \itemsep \parsep
}
\def\@listiv{%
    \leftmargin\leftmarginiv
    \labelwidth\leftmarginiv
    \advance\labelwidth-\labelsep
}
\def\@listv{%
    \leftmargin\leftmarginv
    \labelwidth\leftmarginv
    \advance\labelwidth-\labelsep
}
\def\@listvi{%
    \leftmargin\leftmarginvi
    \labelwidth\leftmarginvi
    \advance\labelwidth-\labelsep
}
\newdimen\enumdim
\def\enummax#1{
  \setbox\tempbox\hbox{#1\hskip\labelsep}%
  \enumdim\wd\tempbox
  \expandafter\global\csname leftmargin\romannumeral\the\@enumdepth\endcsname
  \enumdim}

\enummax{1.}
\def\enumerate{\@ifnextchar[{\@enumerate}{\@enumerate[\csname label\@enumctr\endcsname]}}%% 
\def\@enumerate[#1]{\par\abovedisplayskip .25\baselineskip \@plus2\p@
                    \belowdisplayskip .25\baselineskip \@plus2\p@
      \ifnum \@enumdepth >3 \@toodeep\else
      \advance\@enumdepth\@ne
      \edef\@enumctr{enum\romannumeral\the\@enumdepth}%
      \setcounter{\@enumctr}{1}\enummax{#1}%
      \list
      {\csname label\@enumctr\endcsname}{\usecounter{\@enumctr}%
      \def\makelabel##1{\hss\llap{##1}}}\fi}
\def\endenumerate{\endlist}%% 
\def\longenum{%
    \leftmargin0pt
    \ifnum \@enumdepth >3
        \@toodeep
    \else
        \advance\@enumdepth \@ne
        \edef\@enumctr{enum\romannumeral\the\@enumdepth}%
        \list{\csname label\@enumctr\endcsname}{%
            \usecounter{\@enumctr}%
            \labelwidth\z@\leftmargin0pt
	    \itemindent\parindent\advance\itemindent\labelsep
        }%
    \fi
}
\let\endlongenum\endlist
%
\def\labelenumi{{\rm (}\arabic{enumi}\/{\rm )}} 
\def\theenumi{\arabic{enumi}} 
\def\labelenumii{{\rm (}\alph{enumii}\rm{)}}
\def\theenumii{\alph{enumii}}
\def\p@enumii{\theenumi}
\def\labelenumiii{\roman{enumiii}.}
\def\theenumiii{\roman{enumiii}}
\def\p@enumiii{\theenumi{\rm (}\theenumii{\rm )}}
\def\labelenumiv{\Alph{enumiv}.}
\def\theenumiv{\Alph{enumiv}} 
\def\p@enumiv{\p@enumiii\theenumiii}

\def\p@enumiv{\p@enumiii\theenumiii}

\def\itemize{\list{---\hskip -\labelsep}{\settowidth
 {\leftmargin}{---}\labelwidth\leftmargin
 \addtolength{\labelwidth}{-\labelsep}}}
\let\enditemize\endlist
\def\longitem{\list{---}{\labelwidth\z@
 \leftmargin\z@ \itemindent\parindent \advance\itemindent\labelsep}}
\let\endlongitem\endlist
\def\verse{\let\\=\@centercr 
 \list{}{\leftmargin 2pc 
 \itemindent -1.5em\listparindent \itemindent 
 \rightmargin\leftmargin\advance\leftmargin 1.5em}\item[]}
\let\endverse\endlist
\def\quotation{\list{}{\leftmargin 2pc \listparindent .5em
 \itemindent\listparindent
 \rightmargin\leftmargin \parsep 0pt plus 1pt}\item[]}
\let\endquotation=\endlist
\def\quote{\list{}{\leftmargin 2pc \rightmargin\leftmargin}\item[]}
\let\endquote=\endlist

\def\descriptionlabel#1{%
  \hspace\labelsep \normalfont\itshape #1.%
}%
\newenvironment{description}{%
 \list{}{%
    \labelwidth\z@ %\itemindent-\leftmargin
    \let\makelabel\descriptionlabel
 }
}{\endlist}%

\def\describe#1{\list{}{\listparindent\parindent\settowidth{\labelwidth}{#1}\leftmargin
    \labelwidth\addtolength\leftmargin\labelsep\def\makelabel##1{##1\hfil}}}
\let\enddescribe\endlist

\def\program{\ifx\@currsize\normalsize\small \else \rm \fi\tabbing}
\let\endprogram\endtabbing

% Enunciations
\newif\ifitalicenv\italicenvtrue

\newtheorem{theorem}{Theorem}[section]
\newtheorem{conjecture}[theorem]{Conjecture}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{corollary}[theorem]{Corollary}
%
\newtheorem{exam}[theorem]{Example}
\newenvironment{example}{%
\italicenvfalse
\begin{exam}}{\end{exam}\italicenvtrue}
%
\newtheorem{defi}[theorem]{Definition}
\newenvironment{definition}{%
\italicenvfalse
\begin{defi}}{\end{defi}\italicenvtrue}

\def\@begintheorem#1#2{%
    \trivlist
    \item[%
        \hskip 12\p@
        \hskip \labelsep
        {\ifitalicenv\sc\else\itshape\fi #1\hskip 5\p@\relax{\rm #2}.\enspace}]%
        \ifitalicenv\itshape\else\upshape\fi\hskip-\labelsep%
}
\def\@opargbegintheorem#1#2#3{%
    \trivlist
    \item[\hskip 12pt
          \hskip \labelsep
          {\ifitalicenv{\sc{#1}}\else{\itshape#1}\fi%
	   \savebox\@tempboxa{\ifitalicenv{\scshape#3}\else{\itshape#3}\fi}%
	   \ifdim\wd\@tempboxa>\z@%
           \ {\rm #2}\unskip\hskip5pt\relax$($\box\@tempboxa$)$% 
	   \fi.\unskip\hskip5pt}]
\ifitalicenv\itshape\else\upshape\fi\hskip-\labelsep}
%
\newif\if@qeded\global\@qededfalse
\def\proof{\global\@qededfalse\@ifnextchar[{\@xproof}{\@proof}}
\def\endproof{\if@qeded\else\qed\fi\endtrivlist}
\def\qed{\unskip\kern 10pt{\unitlength1pt\linethickness{.4pt}\framebox(6,6){}}
\global\@qededtrue}
\def\@proof{\trivlist \item[\hskip 10pt\hskip 
 \labelsep{\sc Proof.}]\ignorespaces}
\def\@xproof[#1]{\trivlist \item[\hskip 10pt\hskip 
 \labelsep{\sc Proof #1.}]\ignorespaces}

\def\newdef#1#2{\expandafter\@ifdefinable\csname #1\endcsname
{\@definecounter{#1}\expandafter\xdef\csname
the#1\endcsname{\@thmcounter{#1}}\global
 \@namedef{#1}{\@defthm{#1}{#2}}\global
 \@namedef{end#1}{\@endtheorem}}}
\def\@defthm#1#2{\refstepcounter
 {#1}\@ifnextchar[{\@ydefthm{#1}{#2}}{\@xdefthm{#1}{#2}}}
\def\@xdefthm#1#2{\@begindef{#2}{\csname the#1\endcsname}\ignorespaces}
\def\@ydefthm#1#2[#3]{\trivlist \item[\hskip 10pt\hskip 
 \labelsep{\it #2\savebox\@tempboxa{#3}\ifdim 
 \wd\@tempboxa>\z@ \ \box\@tempboxa\fi.}]\ignorespaces}
\def\@begindef#1#2{\trivlist \item[\hskip 10pt\hskip 
 \labelsep{\it #1\ \rm #2.}]}

\def\theequation{\arabic{equation}}

\def\titlepage{\@restonecolfalse\if@twocolumn\@restonecoltrue\onecolumn
  \else \newpage \fi \thispagestyle{empty}\c@page\z@}
\def\endtitlepage{\if@restonecol\twocolumn \else \newpage \fi}

\arraycolsep 2.5pt \tabcolsep 6pt \arrayrulewidth .4pt \doublerulesep 2pt 
\tabbingsep \labelsep 
\skip\@mpfootins = \skip\footins
\fboxsep = 3pt \fboxrule = .4pt 

\def\@pnumwidth{1.55em}
\def\@tocrmarg {2.55em}
\def\@dotsep{4.5}
\setcounter{tocdepth}{3}

\def\tableofcontents{\section*{Contents\@mkboth{CONTENTS}{CONTENTS}}
 \@starttoc{toc}}
\def\l@part#1#2{\addpenalty{\@secpenalty}
 \addvspace{2.25em plus 1pt} \begingroup
 \@tempdima 3em \parindent \z@ \rightskip \@pnumwidth \parfillskip
-\@pnumwidth 
 {\large \bf \leavevmode #1\hfil \hbox to\@pnumwidth{\hss #2}}\par
 \nobreak \endgroup}
\def\l@section#1#2{\addpenalty{\@secpenalty} \addvspace{1.0em plus 1pt}
\@tempdima 1.5em \begingroup
 \parindent \z@ \rightskip \@pnumwidth 
 \parfillskip -\@pnumwidth 
 \bf \leavevmode #1\hfil \hbox to\@pnumwidth{\hss #2}\par
 \endgroup}
\def\l@subsection{\@dottedtocline{2}{1.5em}{2.3em}}
\def\l@subsubsection{\@dottedtocline{3}{3.8em}{3.2em}}
\def\listoffigures{\section*{List of Figures\@mkboth
 {LIST OF FIGURES}{LIST OF FIGURES}}\@starttoc{lof}}
\def\l@figure{\@dottedtocline{1}{1.5em}{2.3em}}
\def\listoftables{\section*{List of Tables\@mkboth
 {LIST OF TABLES}{LIST OF TABLES}}\@starttoc{lot}}
\let\l@table\l@figure
%
\def\thebibliography#1{\par\footnotesize 
  \@ucheadfalse
  \@startsection{subsection}{2}{\z@}{16pt plus 2pt minus 1pt}{2pt}{\sf}*{REFERENCES}%
  \list{\arabic{enumi}.}{%
    \settowidth{\labelwidth}{99.}%
    \leftmargin\labelwidth
    \advance\leftmargin\labelsep \topsep \z@ \parsep 0pt plus .1pt
    \itemsep \parsep 
    \usecounter{enumi}}%
  \def\newblock{\hskip .11em plus .33em minus .07em}
  \sloppy
  \widowpenalty=4500
  \clubpenalty=4500
  \sfcode`\.=1000\relax}
\let\endthebibliography=\endlist
%
\newif\if@restonecol
\def\theindex{\@restonecoltrue\if@twocolumn\@restonecolfalse\fi
  \columnseprule \z@
  \columnsep 35pt\twocolumn[\section*{Index}]
  \@mkboth{INDEX}{INDEX}\thispagestyle{plain}\parindent\z@
  \parskip\z@ plus .3pt\relax\let\item\@idxitem}
\def\@idxitem{\par\hangindent 40pt}
\def\subitem{\par\hangindent 40pt \hspace*{20pt}}
\def\subsubitem{\par\hangindent 40pt \hspace*{30pt}}
\def\endtheindex{\if@restonecol\onecolumn\else\clearpage\fi}
\def\indexspace{\par \vskip 10pt plus 5pt minus 3pt\relax}
%
\def\footnoterule{\kern-2.6\p@
  \hrule \@height 0.2\p@ \@width 47\p@ 
  \kern 2.6\p@}

\long\def\@makefntext#1{\parindent 1em\noindent $^{\@thefnmark}$#1}
%
\setcounter{topnumber}{3}
\def\topfraction{.99}
\setcounter{bottomnumber}{1}
\def\bottomfraction{.5}
\setcounter{totalnumber}{3}
\def\textfraction{.01}
\def\floatpagefraction{.85}
\setcounter{dbltopnumber}{2}
\def\dbltopfraction{.7}
\def\dblfloatpagefraction{.5}
%
\long\def\@makecaption#1#2{\vskip 1pc \setbox\@tempboxa\hbox{#1.\hskip1em\relax #2}
 \ifdim \wd\@tempboxa >\hsize #1. #2\par \else \hbox to\hsize{\hfil\box\@tempboxa\hfil}\fi}

\def\nocaption{\refstepcounter\@captype \par
 \vskip 1pc \hbox to\hsize{\hfil \footnotesize Figure \thefigure
 \hfil}}

\newcounter{figure}
\def\thefigure{\@arabic\c@figure}
\def\fps@figure{tbp}
\def\ftype@figure{1}
\def\ext@figure{lof}
\def\fnum@figure{\ifcontinued\global\continuedfalse\addtocounter{figure}{-1} Fig.\ \thefigure---{\it Continued}\else Fig.\ \thefigure\fi}%
\def\figure{\let\normalsize\footnotesize \normalsize \@float{figure}}
\let\endfigure\end@float
\@namedef{figure*}{\@dblfloat{figure}}
\@namedef{endfigure*}{\end@dblfloat}
%
\newcounter{table}
\def\thetable{\@Roman\c@table}
\def\fps@table{tbp}
\def\ftype@table{2}
\def\ext@table{lot}
\newif\ifcontinued
\global\continuedfalse
%
\def\continued{\global\continuedtrue}

\newlength\belowcaptionskip
\setlength\belowcaptionskip{1\p@}

\def\FigName{figure}%
\long\def\@caption#1[#2]#3{\par\begingroup
    \@parboxrestore
    \normalsize
    \@makecaption{\csname fnum@#1\endcsname}{\ignorespaces #3}\par
  \endgroup}
%
\newbox\tbbox
\long\def\@makecaption#1#2{%
  \ifx\FigName\@captype
    \vskip 7.3pt
    \setbox\@tempboxa\hbox{\figcaptionfont{#1}.\hskip7.3pt\relax #2\par}%
    \ifdim \wd\@tempboxa >\hsize
        \figcaptionfont{#1}.\hskip7.3pt\relax #2\par
    \else
        \centerline{\box\@tempboxa}%
    \fi
  \else%
		  \setbox\tbbox=\vbox{\hsize\tempdimen{\tablenumfont #1}\ {\tablecaptionfont #2\par}}%
    \setbox\@tempboxa\hbox{\hsize\tempdimen{\tablenumfont #1}\ {\tablecaptionfont #2\par}\vphantom{jgq}}%
    \ifdim \wd\@tempboxa >\tempdimen
        \centerline{\box\tbbox}%        
    \else
        \centerline{\box\@tempboxa}%
    \fi
    \vskip\belowcaptionskip
  \fi}
%
\def\fnum@table{\ifcontinued\addtocounter{table}{-1} Table~\thetable---{\it Continued} \else Table~\thetable.\ \fi}
%
\def\table{\let\normalsize\footnotesize \normalsize\@float{table}}
\let\endtable\end@float
\@namedef{table*}{\@dblfloat{table}}
\@namedef{endtable*}{\end@dblfloat}
\def\acmtable#1{\@narrowfig #1\relax
  \let\caption\@atcap \let\nocaption\@atnocap
  \def\@tmpnf{}\@ifnextchar[{\@xntab}{\@ntab}}
\def\endacmtable{\hbox to \textwidth{\hfil
    \vbox{\hsize \@narrowfig
      \box\@nfcapbox
	  {\baselineskip 4pt \hbox{\vrule height .4pt width \hsize}}
	  \vskip -1pt
	  \box\@nfigbox\vskip -1pt
			      {\baselineskip 4pt \hbox{\vrule height .4pt width \hsize}}}\hfil}
  \end@float}
\def\@xntab[#1]{\def\@tmpnf{[#1]}\@ntab}
\def\@ntab{\expandafter\table\@tmpnf
  \setbox\@nfigbox\vbox\bgroup
  \hsize \@narrowfig \@parboxrestore}
\def\@atmakecap #1#2{\setbox\@tempboxa\hbox{#1.\hskip 1em\relax #2}
  \ifdim \wd\@tempboxa >\hsize \sloppy #1.\hskip 1em\relax #2 \par \else \hbox to\hsize{\hfil\box\@tempboxa\hfil}
 \fi}
\def\@atcap{\par\egroup\refstepcounter\@captype 
  \@dblarg{\@atcapx\@captype}}
\long\def\@atcapx#1[#2]#3{\setbox\@nfcapbox\vbox {\hsize \wd\@nfigbox
    \@parboxrestore
    \@atmakecap{\csname fnum@#1\endcsname}{\ignorespaces #3}\par}}
\def\@atnocap{\egroup \refstepcounter\@captype 
  \setbox\@nfcapbox\vbox {\hsize \wd\@nfigbox
    \hbox to\hsize{\hfil \footnotesize Table \thetable\hfil}}}
%
\newdimen\tabledim
%
\long\def\tbl#1#2{%
  \setbox\tempbox\hbox{\tablefont #2}%
  \tabledim\hsize\advance\tabledim by -\wd\tempbox
  \tempdimen\wd\tempbox
  \global\divide\tabledim\tw@
  \caption{#1}
  \centerline{\box\tempbox}
  }%
%
\newenvironment{tabnote}{%
  \par\vskip2pt%
  \tabnotefont
  \@ifnextchar[{\@tabnote}{\@tabnote[]}}{%
    \par}
\def\@tabnote[#1]{\def\@Tempa{#1}\leftskip\tabledim\rightskip\leftskip\ifx\@Tempa\@empty\else{\it #1:}\ \fi\ignorespaces}
%
\def\tabnoteentry#1#2{\parindent0pt\par\@hangfrom{#1}{#2}\par}
\def\Note#1#2{\parindent0pt\par\hangindent3.7pt{\it #1}\ #2\par}
%
\def\Hline{%
  \noalign{\ifnum0=`}\fi\hrule \@height .5pt \futurelet
  \@tempa\@xhline}
%
\def\narrowfig#1{\@narrowfig #1\relax
  \let\caption\@nfcap \let\nocaption\@nfnocap
  \def\@tmpnf{}\@ifnextchar[{\@xnfig}{\@nfig}}
\def\endnarrowfig{\hbox to \textwidth{\if@nfeven
    \box\@nfcapbox\hfil\box\@nfigbox
    \else \box\@nfigbox\hfil\box\@nfcapbox\fi}\end@float}
\def\@xnfig[#1]{\def\@tmpnf{[#1]}\@nfig}
\def\@nfig{\expandafter\figure\@tmpnf
  \setbox\@nfigbox\vbox\bgroup
  \hsize \@narrowfig \@parboxrestore}
\def\@nfmakecap #1#2{\setbox\@tempboxa\hbox{#1.\hskip 1em\relax #2}
  \ifdim \wd\@tempboxa >\hsize \sloppy #1.\hskip 1em\relax #2 \par \else%
  \hbox to\hsize{\if@nfeven\else\hfil\fi\box\@tempboxa\if@nfeven\hfil\fi}
  \fi}
\def\@nfcap{\par\egroup\refstepcounter\@captype 
  \@dblarg{\@nfcapx\@captype}}
\long\def\@nfcapx#1[#2]#3{\@seteven
  \setbox\@nfcapbox\vbox to \ht\@nfigbox
			 {\hsize \textwidth \advance\hsize -2pc \advance\hsize -\wd\@nfigbox
			   \@parboxrestore
			   \vfil 
			   \@nfmakecap{\csname fnum@#1\endcsname}{\ignorespaces #3}\par
			   \vfil}}
\def\@nfnocap{\egroup \refstepcounter\@captype \@seteven
  \setbox\@nfcapbox\vbox to \ht\@nfigbox
			 {\hsize \textwidth \advance\hsize -2pc \advance\hsize -\wd\@nfigbox
			   \@parboxrestore
			   \vfil 
			   \hbox to\hsize{\if@nfeven\else\hfil\fi 
			     \footnotesize Figure \thefigure
			     \if@nfeven\hfil\fi}
			   \vfil}}
\def\@seteven{\@nfeventrue 
  \@ifundefined{r@@nf\thefigure}{}{%
    \edef\@tmpnf{\csname r@@nf\thefigure\endcsname}%
    \edef\@tmpnf{\expandafter\@getpagenum\@tmpnf}%
    \ifodd\@tmpnf\relax\@nfevenfalse\fi}%
  \label{@nf\thefigure}\edef\@tmpnfx{\if@nfeven e\else o\fi}
  \edef\@tmpnf{\write\@unused {\noexpand\ifodd \noexpand\c@page 
      \noexpand\if \@tmpnfx e\noexpand\@nfmsg{\thefigure} \noexpand\fi
      \noexpand\else 
      \noexpand\if \@tmpnfx o\noexpand\@nfmsg{\thefigure}\noexpand\fi 
      \noexpand\fi }}\@tmpnf}
\def\@nfmsg#1{Bad narrowfig: Figure #1 on page \thepage}

\newdimen\@narrowfig
\newbox\@nfigbox
\newbox\@nfcapbox
\newif\if@nfeven 

\def\author#1{\gdef\@author{#1}}%
\def\and{{\upshape and }}
\def\affil#1{\gdef\@affil{#1}\ifx\@affil\@empty\else{\reset@font\affilfont\unskip,\ #1\vphantom{gy}\endgraf}\fi}\affil{}

\def\maketitle{%
  \newpage \thispagestyle{titlepage}\par
  \begingroup \lineskip = \z@\null \vskip -13.5pt\relax 
  \parindent\z@ {\hyphenpenalty\@M
    {\titlefont \@title \par
      \global\firstfoot
      \global\runningfoot
    }}
  \global\@firstpg\the\c@page
  {\vskip 13.5pt\relax \normalsize \authorfont %vskip 13.5pt between title and author
    \begingroup \addtolength{\baselineskip}{2pt}
    \@author\par \vskip -2pt 
    \endgroup }
  \baselineskip 17pt\relax
  \hbox{\vrule height .2pt width \@acmWidth}%to eliminate the lines for jacm
  \vskip 8.5pt \footnotesize \box\@abstract \vskip 4pt\relax %vskip8.5 space above abstract
  \ifx \@categories\@empty 
    \else 
    Categories and Subject Descriptors: \@categories\par \fi
    \ifx\@concepts\@empty % Added 2012/10/09
    \else
    \vskip 4\p@\relax 
    \noindent CCS Concepts: \@concepts\par
    \fi
  \par\vskip 4pt\relax
%  \box\@terms \vskip 4pt\relax
  \box\@keywords \par
  \ifx\@acmformat\@empty\else
  \footnotesize \hsize \@acmWidth \parindent 0pt \noindent
  \vskip 4\p@
  \noindent  {\bf ACM Reference Format:}\\[2pt]
  \@acmformat\vskip 0.5\p@
  \par\fi%
  {\baselineskip 14pt\relax
    \@abstractbottom
  }
  \vskip 23pt\relax
  \endgroup
  \let\maketitle\relax
  \gdef\@categories{}}
%
\newbox\@abstract
\newbox\@terms
\newbox\@keywords
\def\abstract{\global\setbox\@abstract=\vbox\bgroup \everypar{}
%
  \footnotesize \hsize \@acmWidth \parindent 10pt \noindent 
  \rule{0pt}{10pt}\ignorespaces}
\def\endabstract{\egroup}
\def\terms#1{\global\setbox\@terms=\vbox{\everypar{}
  \footnotesize \hsize \@acmWidth \parindent 0pt \noindent General Terms: \ignorespaces #1}}
\def\keywords#1{\global\setbox\@keywords=\vbox{\everypar{}
    \footnotesize \hsize \@acmWidth \parindent 0pt \noindent 
    Additional Key Words and Phrases: \ignorespaces #1}
}

\def\acmformat#1{\gdef\@acmformat{#1 \formatline\vphantom{y}}}
\let\@acmformat\@empty

% Support for CCSXML file
\RequirePackage{comment}
\excludecomment{CCSXML}


% New concepts scheme
\let\@concepts\@empty
%
% The first argument is the significance, the
% second is the concept(s)
%
\newcommand\ccsdesc[2][100]{%
  \ccsdesc@parse#1~#2~}
%
% The parser of the expression Significance~General~Specific
%
\def\ccsdesc@parse#1~#2~#3~{%
  \expandafter\ifx\csname CCS@#2\endcsname\relax
    \expandafter\gdef\csname CCS@#2\endcsname{\textbullet\textbf{#2} $\to$ }%
  \g@addto@macro{\@concepts}{\csname CCS@#2\endcsname}\fi
  \expandafter\g@addto@macro\expandafter{\csname CCS@#2\endcsname}{%
    \ifnum#1>499\textbf{#3; }\else
    \ifnum#1>299\textit{#3; }\else
    #3; \fi\fi}}



\newcount\@firstpg
\newcount\@lastpg
\def\lastpage#1{\global\advance\@lastpg#1\relax}
\AtEndDocument{\ifelec@app\else\immediate\write\@mainaux{\string\lastpage{\the\c@page}}\fi}

\newcount\@totalpg
\def\acmPages#1{\def\@acmPages{#1}}
\acmPages{\@totalpg\@lastpg\global\advance\@totalpg-\@firstpg\global\advance\@totalpg\@ne\the\@totalpg\ pages}

% Reference Format
\gdef\formatline{{\em{\@journalNameShort\ }}\@acmVolume, \@acmNumber, Article~\@acmArticle\ (\monthWord{\@acmMonth}\ \@acmYear), \@acmPages.\\ % Need Journal Name in italics - in 'ACM Reference Format' before 1. INTRODUCTION - Gerry - March 2012
{\tt DOI:} \@doi} % Gerry March 2012 - on first page in 'ACM Reference Format'

% ISSN
%
\def\issn#1{\gdef\@issn{#1}}
\issn{}


% Copyright Information
%
\RequirePackage{acmcopyright}


\def\@acmPrice{15.00} %article price  % Changed to 15 - June 2012 - Gerry
\gdef\copyrightline{%
  \if@printcopyright
  \copyright\ \@acmYear\ \@copyrightowner\  
  \else
  \@acmYear\ 
  \fi
  \@permissionCodeOne/\@acmYear/\monthInf{\@acmMonth}-ART\@acmArticle\ 
  \$\@acmPrice}
\gdef\doiline{{\tt DOI:} \@doi} % Gerry - March 2012 - beneath copyright line

\def\category#1#2#3{\@ifnextchar
  [{\@category{#1}{#2}{#3}}{\@xcategory{#1}{#2}{#3}}}
\def\@category#1#2#3[#4]{\edef\@tempa{\ifx \@categories\@empty 
    \else ; \fi}{\def\protect{\noexpand\protect
      \noexpand}\def\and{\noexpand\and}\xdef\@categories{\@categories\@tempa #1
      [{\bf #2}]: 
      #3\kern\z@---\hskip\z@{\it #4}}}}
\def\@xcategory#1#2#3{\edef\@tempa{\ifx \@categories\@empty \else ;
    \fi}{\def\protect{\noexpand\protect\noexpand}\def\and{\noexpand
      \and}\xdef\@categories{\@categories\@tempa #1 [{\bf #2}] #3}}}
\def\@categories{}
\def\bottomstuff{\global\@topnum\z@ \global\@botroom \textheight \begin{figure}
    \parindent\z@
    \hbox{}\footnotesize
    \vskip -\textfloatsep
    \vskip 10pt
    \hrule height .2pt width \@acmWidth
    \vskip 2pt\rule{0pt}{10pt}\ignorespaces}
\def\endbottomstuff{\fontsize{7pt}{8pt}\fontfamily{ptm}\selectfont
\permission\end{figure}\gdef\permission{}}
\newenvironment{ackslike}[1]
	       {\par \footnotesize 
		 \@ucheadfalse
		 \@startsection{subsection}{2}{\z@}{-16pt plus -2pt minus -1pt}{2pt}{\sf}*
			       {\uppercase{#1}}\par\normalsize
               }
	       {\par}
\newenvironment{acks}{\begin{ackslike}{ACKNOWLEDGMENTS}}{\end{ackslike}}

\def\received#1#2#3{{\par\addvspace{14\p@}%
\parindent\z@%
\fontfamily{\sfdefault}\fontsize{8}{9}\selectfont{Received\ #1;\ revised\ #2;\ accepted\ #3}%
\par}}

\mark{{}{}} 
%
\def\bull{{\fontsize{7}{7}\selectfont\raise1.6pt\hbox{$\bullet$}}}
\def\ps@headings{\let\@mkboth\@gobbletwo
\def\@oddhead{\hbox{}\hfill \small\sf \rightmark\hskip 19pt{\bull}\hskip 17pt\ifStBan\@acmArticle:\fi\mypage}
\def\@oddfoot{\hbox{}\hfill\tiny\@runningfoot}
\def\@evenhead{\small\sf\ifStBan\@acmArticle:\fi\mypage \hskip 17pt{\bull}\hskip 19pt\leftmark\hfill \hbox{}}
\def\@evenfoot{\tiny\@runningfoot\hfill\hbox{}}
\def\sectionmark##1{}\def\subsectionmark##1{}}
\def\@runningfoot{}
\def\runningfoot{\def\@runningfoot{\@journalName, Vol.\ \@acmVolume, No.\ \@acmNumber, Article~\@acmArticle, Publication date: \monthWord{\@acmMonth}\ \@acmYear.}}
\def\@firstfoot{}
\def\firstfoot{\def\@firstfoot{\@journalName, Vol.\ \@acmVolume, No.\ \@acmNumber, Article~\@acmArticle, Publication date: \monthWord{\@acmMonth}\ \@acmYear.}}%, Pages \thepage--\@endpage
%
\def\@marrayclassiv{\@addtopreamble{$\displaystyle \@nextchar$}}
\def\@marrayclassz{\ifcase \@lastchclass \@acolampacol \or \@ampacol \or
  \or \or \@addamp \or
  \@acolampacol \or \@firstampfalse \@acol \fi
  \edef\@preamble{\@preamble
    \ifcase \@chnum 
    \hfil$\relax\displaystyle\@sharp$\hfil \or $\relax\displaystyle\@sharp$\hfil 
    \or \hfil$\relax\displaystyle\@sharp$\fi}}
\def\marray{\arraycolsep 2.5pt\let\@acol\@arrayacol \let\@classz\@marrayclassz
  \let\@classiv\@marrayclassiv \let\\\@arraycr\def\@halignto{}\@tabarray}
\def\endmarray{\crcr\egroup\egroup}
\ps@headings \pagenumbering{arabic} \onecolumn 
%
\AtBeginDocument{%
\@ifpackageloaded{natbib}{% Natbib loaded
\renewcommand\bibsection{%
\@ucheadfalse
  \@startsection{subsection}{2}{\z@}{16pt plus 2pt minus 1pt}{2pt}{\sf}*{REFERENCES}
}
\bibpunct[, ]{[}{]}{;}{a}{}{,}
\let\citeN\cite
\let\cite\citep
\let\citeANP\citeauthor
\let\citeNN\citeyearpar
\let\citeyearNP\citeyear
\let\citeyear\citeyearpar
\let\citeNP\citealt
\def\shortcite#1{\citeyear{#1}}
\DeclareRobustCommand\citeA
   {\begingroup\NAT@swafalse\let\NAT@ctype\@ne\NAT@partrue\NAT@fullfalse\NAT@open\NAT@citetp}
\newcommand\newblock{}
}{% Natbib not loaded
\let\@internalcite\cite
\def\cite{\def\@citeseppen{-1000}%
    \def\@cite##1##2{[##1\if@tempswa , ##2\fi]}%
    \def\citeauthoryear##1##2##3{##2 ##3}\@internalcite}
\def\citeXNP#1#2{%
  \def\@cite@label{#2}%
  \def\@cite##1##2{##1\if@tempswa , ##2\fi}%
  \def\citeauthoryear##1##2##3{\@cite@label}\@internalcite{#1}}
\def\citeNP{\def\@citeseppen{-1000}%
    \def\@cite##1##2{##1\if@tempswa , ##2\fi}%
    \def\citeauthoryear##1##2##3{##2 ##3}\@internalcite}
\def\citeN{\def\@citeseppen{-1000}%
    \def\@cite##1##2{##1\if@tempswa , ##2]\else{]}\fi}%
    \def\citeauthoryear##1##2##3{##2 [##3}\@citedata}
\def\shortcite#1{\citeyear{#1}}
\def\citeS#1{[\citeANP{#1} \citeyearNP{#1}]}
\def\citeNS#1{\citeANP{#1} \citeyear{#1}}
\def\citeNPS#1{\citeANP{#1} \citeyearNP{#1}}
\def\citeNN{\def\@citeseppen{-1000}%
    \def\@cite##1##2{[##1\if@tempswa , ##2\fi]}%
    \def\citeauthoryear##1##2##3{##3}\@citedata}
\def\citeA{\def\@citeseppen{-1000}%
    \def\@cite##1##2{[##1\if@tempswa , ##2\fi]}%
    \def\citeauthoryear##1##2##3{##2}\@internalcite}
\def\citeANP{\def\@citeseppen{-1000}%
    \def\@cite##1##2{##1\if@tempswa , ##2\fi}%
    \def\citeauthoryear##1##2##3{##2}\@internalcite}
\def\citeyear{\def\@citeseppen{-1000}%
    \def\@cite##1##2{[##1\if@tempswa , ##2\fi]}%
    \def\citeauthoryear##1##2##3{##3}\@citedata}
\def\citeyearNP{\def\@citeseppen{-1000}%
    \def\@cite##1##2{##1\if@tempswa , ##2\fi}%
    \def\citeauthoryear##1##2##3{##3}\@citedata}
%
\def\@citedata{%
  \@ifnextchar [{\@tempswatrue\@citedatax}%
    {\@tempswafalse\@citedatax[]}%
  }

\def\@citedatax[#1]#2{%
  \if@filesw\immediate\write\@auxout{\string\citation{#2}}\fi%
  \def\@citea{}\@cite{\@for\@citeb:=#2\do%
    {\@citea\def\@citea{; }\@ifundefined% 
      {b@\@citeb}{{\bf ?}%
	\@warning{Citation `\@citeb' on page \thepage \space undefined}}%
      {\csname b@\@citeb\endcsname}}}{#1}}%
%
\def\@citex[#1]#2{%
  \if@filesw\immediate\write\@auxout{\string\citation{#2}}\fi%
  \def\@citea{}\@cite{\@for\@citeb:=#2\do%
    {\@citea\def\@citea{; }\@ifundefined% 
      {b@\@citeb}{{\bf ?}%
	\@warning{Citation `\@citeb' on page \thepage \space undefined}}%
      {\csname b@\@citeb\endcsname}}}{#1}}%
%
\def\cite{\def\@citeseppen{-1000}%
    \def\@cite##1##2{[##1\if@tempswa , ##2\fi]}%
    \let\@lastauthor=\@noauthor
    \let\citeauthoryear=\citeauthoryear@no@repeats\@internalcite}
\def\@noauthor={\relax}
\let\@lastauthor=\@noauthor
\let\@currauthor=\@noauthor
\def\citeauthoryear@no@repeats#1#2#3{%
  \def\@currauthor{\csname @author #1\endcsname}%
  \ifx\@lastauthor\@currauthor{#3}\else{#2 #3}\fi%
  \let\@lastauthor=\@currauthor}
%
\newlength{\bibhang}
\setlength{\bibhang}{2em}
}}
\def\@biblabel#1{}
\newdimen\bibindent
\bibindent=.8em
\@ifundefined{refname}%
	     {\@ifundefined{chapter}%
	       {\newcommand{\refname}{\footnotesize REFERENCES}}%
	       {\newcommand{\refname}{\footnotesize BIBLIOGRAPHY}}%
	     }%
	     {}%
\@ifundefined{chapter}%
	     {\def\thebibliography#1{\footnotesize \section*{\refname\@mkboth 
		   {\uppercase{\refname}}{\uppercase{\refname}}}\list
		 {[\arabic{enumi}]}{
		   \settowidth\labelwidth{[#1]}
		   \leftmargin\labelwidth
		   \advance\leftmargin\labelsep
		   \advance\leftmargin\bibindent
		   \itemindent -\bibindent
		   \listparindent \itemindent
		   \parsep \z@
		   \usecounter{enumi}}
		 \def\newblock{}
		 \sloppy
		 \sfcode`\.=1000\relax}}
	     {\def\thebibliography#1{\footnotesize \chapter*{\refname\@mkboth 
		   {\uppercase{\refname}}{\uppercase{\refname}}}\list
		 {[\arabic{enumi}]}{\settowidth\labelwidth{[#1]}
		   \leftmargin\labelwidth
		   \advance\leftmargin\labelsep
		   \advance\leftmargin\bibindent
		   \itemindent -\bibindent
		   \listparindent \itemindent
		   \parsep \z@
		   \usecounter{enumi}}
		 \def\newblock{}
		 \sloppy
		 \sfcode`\.=1000\relax}}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
\def\newdef#1{\@ifnextchar[{\@xnewdef{#1}}{\@ynewdef{#1}}}
\def\@xnewdef#1[#2]#3{\newtheorem{italic@#1}[#2]{{\em #3}}\@newdef{#1}}
\def\@ynewdef#1#2{\@ifnextchar[{\@xynewdef{#1}{#2}}{\@yynewdef{#1}{#2}}}
\def\@xynewdef#1#2[#3]{\newtheorem{italic@#1}{{\em #2}}[#3]\@newdef{#1}}
\def\@yynewdef#1#2{\newtheorem{italic@#1}{{\em #2}}\@newdef{#1}}
%
\def\@newdef#1{\newenvironment{#1}{\@ifnextchar[{\@xstartdef{#1}}{\@ystartdef{#1}}}{\end{italic@#1}}}
\def\@xstartdef#1[#2]{\begin{italic@#1}[{\em #2}]\rm}
\def\@ystartdef#1{\begin{italic@#1}\rm}
%
\def\@oddfoot{\hbox{}\hfill\scriptsize\@runningfoot}
\def\@evenfoot{\scriptsize\@runningfoot\hfill\hbox{}}
%
\def\firstfootsize{\@setsize\firstfootsize{7pt}\vipt\@vipt}
\def\ps@titlepage{\let\@mkboth\@gobbletwo
\def\@oddhead{}\def\@oddfoot{\hbox{}\hfill\firstfootsize\@firstfoot}%
\def\@evenhead{}\def\@evenfoot{\firstfootsize\@firstfoot\hfill\hbox{}}}
%
\long\def\permission{\par
  \@copyrightpermission\par
 \copyrightline\\ 
\doiline } % 
%
\def\@listI{\leftmargin\leftmargini
  \labelwidth\leftmargini\advance\labelwidth-\labelsep
  \parsep 0pt plus 1pt
  \topsep 6pt plus 2pt minus 2pt
  \itemsep 2pt plus 1pt minus .5pt}
\let\@listi\@listI
\@listi 
%
\def\longenum{\ifnum \@enumdepth >3 \@toodeep\else
  \advance\@enumdepth \@ne 
  \edef\@enumctr{enum\romannumeral\the\@enumdepth}\list
		{\csname label\@enumctr\endcsname}{\usecounter
		  {\@enumctr}\labelwidth\z@\leftmargin\z@
		  \itemindent\parindent \advance\itemindent\labelsep}\fi}
%
\def\appendixhead#1{\appendix
  \section*{ELECTRONIC APPENDIX}
  The electronic appendix for this article can be accessed in
  the ACM Digital Library.% by visiting the following URL:$\;$ 
%  \url{http://www.acm.org/publications/}.
%  \url{http://www.acm.org/pubs/citations/journals/}{\tt \@journalNameShort /\@acmYear-\@acmVolume-\@acmNumber/p\the\@firstpg-#1}.
}
%
\newif\ifelec@app\global\elec@appfalse
\long\def\elecappendix{\global\StBanfalse\elec@apptrue
  \immediate\write\@mainaux{\string\lastpage{\the\c@page}}
  \clearpage
  \makeatletter
  \pagenumbering{withappendix}
  \makeatother
  \appendix
    \global\firstfoot
    \global\runningfoot
  \par\noindent{\titlefont Online Appendix to:\par
	       \parindent0pt\@title\par}\vskip 13.5pt%
	       \vbox{\authorfont\parindent0pt\@author\par}\vskip .5em\noindent %
%% 	       \vskip 10pt\noindent
%% 		      {\firstfootsize 
%% 			\@journalName, Vol.\ \@acmVolume, No.\ \@acmNumber, \monthWord{\@acmMonth}\ \@acmYear, Pages \pages.}
		      \vskip 11pt\noindent
		      \hrule height .2pt
		      \par
            \def\endbottomstuff{\copyrightline\\
\doiline\end{figure}}  % Gerry - March 2012
		      \bottomstuff
		      \endbottomstuff
		      \thispagestyle{titlepage}%
}
%
\def\ack{\par\footnotesize 
  \@ucheadfalse
  \@startsection{subsection}{2}{\z@}{-16pt plus -2pt minus -1pt}{2pt}{\sf}*{ACKNOWLEDGMENT}\par\normalsize
}
\def\endack{\par}
%
\let\acknowledgments\acks
\let\endacknowledgments\endacks
\let\acknowledgment\ack
\let\endacknowledgment\endack
%
\def\document{\endgroup
  \ifx\@unusedoptionlist\@empty\else
    \@latex@warning@no@line{Unused global option(s):^^J%
            \@spaces[\@unusedoptionlist]}%
  \fi
  \@colht\textheight
  \@colroom\textheight \vsize\textheight
  \columnwidth\textwidth
  \@clubpenalty\clubpenalty
  \if@twocolumn
    \advance\columnwidth -\columnsep
    \divide\columnwidth\tw@ \hsize\columnwidth \@firstcolumntrue
  \fi
  \hsize\columnwidth \linewidth\hsize
  \begingroup\@floatplacement\@dblfloatplacement
    \makeatletter\let\@writefile\@gobbletwo
    \global \let \@multiplelabels \relax
    \@input{\jobname.aux}%
  \endgroup
  \if@filesw
    \immediate\openout\@mainaux\jobname.aux
    \immediate\write\@mainaux{\relax}%
  \fi
  \process@table
  \let\glb@currsize\@empty  %% Force math initialization.
  \normalsize
  \everypar{}%
  \ifx\normalsfcodes\@empty
    \ifnum\sfcode`\.=\@m
      \let\normalsfcodes\frenchspacing
    \else
      \let\normalsfcodes\nonfrenchspacing
    \fi
  \fi
  \@noskipsecfalse
  \let \@refundefined \relax
  \let\AtBeginDocument\@firstofone
  \@begindocumenthook
  \ifdim\topskip<1sp\global\topskip 1sp\relax\fi
  \global\@maxdepth\maxdepth
  \global\let\@begindocumenthook\@undefined
  \ifx\@listfiles\@undefined
    \global\let\@filelist\relax
    \global\let\@addtofilelist\@gobble
  \fi
  \gdef\do##1{\global\let ##1\@notprerr}%
  \@preamblecmds
  \global\let \@nodocument \relax
%  \global\let\do\noexpand\VerCtrl
  \ignorespaces}
%
\def\jobtag{ACM-TRANSACTION}
%
\def\artnum{\vbox to 6pc{\vfill\hbox to 44pt{\hskip18pt\textcolor{white}{\fontsize{12}{7}\selectfont\bfseries\@acmArticle}\hfill}\vfill}}
\def\opentab{\hbox{\vrule width43.25pt depth0pt height81pt\hspace*{-46pt}\artnum}}
\def\normtab{\hbox{\vrule width43.25pt depth0pt height72pt\hspace*{-46pt}\artnum}}
\def\closetab{\hbox{\vrule width43.25pt depth0pt height81pt\hspace*{-46pt}\raise.125in\vbox{\artnum}}}
%
\newcommand\tab{\ifcase\@articleSeq\or
  \vbox{\vskip-.125in\opentab}\or \vbox{\vskip6pc\normtab}\or \vbox{\vskip12pc\normtab}\or \vbox{\vskip18pc\normtab}\or \vbox{\vskip24pc\normtab}\or \vbox{\vskip30pc\normtab}\or
  \vbox{\vskip36pc\normtab}\or \vbox{\vskip42pc\normtab}\or \vbox{\vskip48pc\normtab}\or \vbox{\vskip54pc\normtab}\or \vbox{\vskip60.2pc\closetab}\or
  \vbox{\vskip-.125in\opentab}\or \vbox{\vskip6pc\normtab}\or \vbox{\vskip12pc\normtab}\or \vbox{\vskip18pc\normtab}\or \vbox{\vskip24pc\normtab}\or \vbox{\vskip30pc\normtab}\or
  \vbox{\vskip36pc\normtab}\or \vbox{\vskip42pc\normtab}\or \vbox{\vskip48pc\normtab}\or \vbox{\vskip54pc\normtab}\or \vbox{\vskip60.2pc\closetab}\or
  \vbox{\vskip-.125in\opentab}\or \vbox{\vskip6pc\normtab}\or \vbox{\vskip12pc\normtab}\or \vbox{\vskip18pc\normtab}\or \vbox{\vskip24pc\normtab}\or \vbox{\vskip30pc\normtab}\or
  \vbox{\vskip36pc\normtab}\or \vbox{\vskip42pc\normtab}\or \vbox{\vskip48pc\normtab}\or \vbox{\vskip54pc\normtab}\or \vbox{\vskip60.2pc\closetab}\fi%
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  OutPut Routine  %%%%%%%%%%%%%%%%%%%%%%%%%
\def\@outputpage{%
\begingroup           % the \endgroup is put in by \aftergroup
  \let \protect \noexpand
  \@resetactivechars
  \@parboxrestore
  \shipout \vbox{%
    \set@typeset@protect
    \aftergroup \endgroup
    \aftergroup \set@typeset@protect
                                % correct? or just restore by ending
                                % the group?
  \if@specialpage
    \ifStBan
        \vbox to 0pt{\vskip2pt\hbox to 8.625in{\hfill\tab}}
    \fi
    \global\@specialpagefalse\@nameuse{ps@\@specialstyle}%
  \fi
  \if@twoside
    \ifodd\count\z@ \let\@thehead\@oddhead \let\@thefoot\@oddfoot
         \let\@themargin\oddsidemargin
    \else \let\@thehead\@evenhead
       \let\@thefoot\@evenfoot \let\@themargin\evensidemargin
    \fi
  \fi
  \reset@font
  \normalsize
  \normalsfcodes
  \let\label\@gobble
  \let\index\@gobble
  \let\glossary\@gobble
  \baselineskip\z@skip \lineskip\z@skip \lineskiplimit\z@
    \@begindvi
    \vskip \topmargin
    \moveright\@themargin \vbox {%
      \setbox\@tempboxa \vbox to\headheight{%
        \vfil
        \color@hbox
          \normalcolor
          \hb@xt@\textwidth{\@thehead}%
        \color@endbox
        }%                        %% 22 Feb 87
      \dp\@tempboxa \z@
      \box\@tempboxa
      \vskip \headsep
      \box\@outputbox
      \baselineskip \footskip
      \color@hbox
        \normalcolor
        \hb@xt@\textwidth{\@thefoot}%
      \color@endbox
      }%
    }%
  \global \@colht \textheight
  \stepcounter{page}%
  \let\firstmark\botmark
}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
\newcommand{\bibemph}[1]{{\em#1}}
\newcommand{\bibemphic}[1]{{\em#1\/}}
\newcommand{\bibsc}[1]{{\sc#1}}

\newcommand\bibyear[2]{%
    \unskip{\hskip8pt}\ignorespaces#1\unskip
    \if..#2{\hskip6pt}\else {\hskip8pt}#2 \fi
}
%
\newcommand{\longpage}{\enlargethispage{\baselineskip}}
\newcommand{\shortpage}{\enlargethispage{-\baselineskip}}
%
\def\thebibliography#1{
  \footnotesize\section*{\footnotesize\sf{REFERENCES}\@mkboth
  {\uppercase{\refname}}{\uppercase{\refname}}}%
   \list
  {\@biblabel{\arabic{enumiv}}}{%
   \labelwidth 0pt
   \leftmargin \bibindent
   \labelsep 0pt
     \itemindent -\bibindent 
   \listparindent -\bibindent
   \labelsep -\bibindent
    \usecounter{enumiv}%
    \let\p@enumiv\@empty
    \def\theenumiv{\arabic{enumiv}}}%
    \def\newblock{\hskip .11em plus.33em minus.07em}%
    \sloppy
    \clubpenalty=4500
    \widowpenalty=4500
    \frenchspacing}
\def\endthebibliography{%
  \def\@noitemerr{\@warning{Empty `thebibliography' environment}}%
  \endlist}
\def\@lbibitem[#1]#2{\item[]\if@filesw
      {\def\protect##1{\string ##1\space}\immediate
       \write\@auxout{\string\bibcite{#2}{#1}}}\fi\ignorespaces}  %%\hskip-1em FBU
%
%
\DeclareOldFontCommand{\rm}{\normalfont\rmfamily}{\mathrm}
\DeclareOldFontCommand{\sf}{\normalfont\sffamily}{\mathsf}
\DeclareOldFontCommand{\tt}{\normalfont\ttfamily}{\mathtt}
\DeclareOldFontCommand{\bf}{\normalfont\bfseries}{\mathbf}
\DeclareOldFontCommand{\it}{\normalfont\itshape}{\mathit}
\DeclareOldFontCommand{\sl}{\normalfont\slshape}{\@nomath\sl}
\DeclareOldFontCommand{\sc}{\normalfont\scshape}{\@nomath\sc}
\DeclareRobustCommand*\cal{\@fontswitch\relax\mathcal}
\DeclareRobustCommand*\mit{\@fontswitch\relax\mathnormal}
%
\clubpenalty=10000
\widowpenalty=10000
%
\RequirePackage{latexsym}
\RequirePackage{graphicx}
\RequirePackage{color}
\hoffset-5.297pc
\voffset-5.435pc

\endinput

% End of file `acmlarge.cls' Version 1.3
