#!/bin/bash	



_sdf_split_main() {
	awk '
		function writeFile() {
			contents = "// The MIT License ; Copyright © 2013 Inigo Quilez ; see COPYRIGHT file in this directory";
		
			blank = 1;
			for ( i = 0 ; i < line_number ; i++ ) {
				line = LINES[ i ];
				if ( 0 != length( line ) ) {
					blank = 0;
				}
				if ( !blank ) {
					contents = contents "\n" line;
				}
			}
			
			output = NAME ".glsl"
			print contents >> output;
	
			line_number = 0;
		}

		BEGIN {
			line_number = 0;
		}

		/^float/ {
			NAME = $2;
			sub( /\(.*/, "", NAME );
			print $0 " -> " NAME
		}

		{
			LINES[ line_number++ ] = $0;
		}

		/^}/ {
			writeFile();
		}
	' ${1}
}

_sdf_split_main ${*}
