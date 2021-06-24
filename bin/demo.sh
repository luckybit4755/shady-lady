#!/bin/bash	

_demo_main() {
	find html/demo -type f | awk '
		BEGIN {
			print "<HTML><HEAD><STYLE>* { background:#223; color:#aa9; tab-size: 4; }</STYLE></HEAD><BODY><UL>";
		}
		{
			printf( "\t<LI><A HREF=\"%s\">%s</A></LI>\n", $1, $1 );
		}
		END {
			print "</UL></BODY></HTML>";
		}
	' > demo.html
}

_demo_main ${*}
