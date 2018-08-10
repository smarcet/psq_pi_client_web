#!/usr/bin/env bash
OUTPUT=$1
echo "resources will be dump onto $OUTPUT";
cd src;
find . -type f  -name "*.js" | xargs grep -Eo "T.translate\(\'(.*)\'\)" | cut -d: -f2 | grep -Eo "(\'(.*)\')" | sort | uniq | xargs -I % sh -c 'echo %' > temp.txt
find . -type f  -name "*.js" | xargs grep -Eo "T.translate\(\"(.*)\"\)" | cut -d: -f2 | grep -Eo "(\"(.*)\")" | sort | uniq | xargs -I % sh -c 'echo %' >> temp.txt
echo '{' > $OUTPUT
grep -Eo ".*" temp.txt | sort | uniq | xargs -I % sh -c 'echo \"%\":\"\",' >> $OUTPUT
echo '}' >> $OUTPUT
rm temp.txt

