#!/bin/bash	

_makeIndex_main() {
	ls *.frag \
	| sort -n \
	| awk '
		BEGIN {
			print "<HTML><BODY><UL>"
		}
		{
			printf( "<LI><A HREF=%c%s%c>%s</A></LI>\n", 34, $1, 34, $1)
		} 
		END {
			print "</UL></BODY></HTML>"
		}
	' > index.html
}

_makeIndex_main ${*}
