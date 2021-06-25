#!/bin/bash	

_demo_head() {
cat << HTML | cut -f2-
	<HTML>
		<HEAD>
			<STYLE>
				* { background:#223; color:#aa9; tab-size: 4; }
			</STYLE>
		</HEAD>
		<BODY>
			<UL>
HTML
}

_demo_main() {
	_demo_head
	find demo -type f -name '*.html' | sort -n | awk '
		{
			printf( "\t\t\t<LI><A HREF=\"%s\">%s</A></LI>\n", $1, $1 );
		}
	'
	_demo_tail
}

_demo_tail() {
cat << HTML | cut -f2-
			</UL>
		</BODY>
	</HTML>
HTML
}

_demo_main ${*} > demo.html
