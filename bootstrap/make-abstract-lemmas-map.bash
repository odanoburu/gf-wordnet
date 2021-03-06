#!bin/bash

set -e
errcho(){ >&2 echo "$@"; }

mkdir tmp || errcho "rm tmp directory" # will throw error if existant, just remove it
errcho 'format map between wn 3.0 and wn 3.1'
tail -n +9  wn30map31.txt | sed -nEe 's/^([anrv])	([0-9]+)	([0-9]+)$/\2-\1	\3-\1/p' | sort -k1 | uniq > tmp/wn30map31.synsets.txt
errcho 'get only "good" predictions'
grep 'True$' predictions.tsv | sort -t '	' -k 1 | uniq > tmp/sorted-predictions.tsv
errcho 'add wn 3.1 synsets to predictions'
join -t '	' tmp/wn30map31.synsets.txt tmp/sorted-predictions.tsv | sort -k2 | uniq > tmp/predictions-synsets.tsv
errcho 'extract fun names, then fun names and their synsets, then sort by synset.'
sed -nEe 's/^fun +([^ ]+)[^-]+--+[^0-9]+([0-9]+-[nvar]).*/\1	\2/p' ../WordNet.gf | sort -t '	' -k 2 > tmp/synset-fun.txt
errcho 'join by synset'
# maybe using -e switch here would save a lot of commands
join -t '	' -j 2 tmp/synset-fun.txt tmp/predictions-synsets.tsv > tmp/fun-lang.tsv
errcho 'cut to what we want (GF fun name and lemma in target language) and merge lines with the same fun name'
cut -d '	' -f 2,5 tmp/fun-lang.tsv  | sort -t '	' -k 1 | uniq | awk -F '\t' 'NF>1{a[$1] = a[$1]"\t"$2};END{for(i in a)print i""a[i]}' | sort -t '	' -k 1 > fun-lemmas.tsv
errcho 'get missing gf funs and add missing lin'
sed -nEe 's/^fun +([^ ]+).*/\1/p' ../WordNet.gf > tmp/all-funs.txt
LC_ALL=C join -t '	' -v 1 -1 1 -2 1 <(LC_ALL=C sort -t '	' -k 1 tmp/all-funs.txt) <(LC_ALL=C sort -t '	' -k 1 fun-lemmas.tsv) >> fun-lemmas.tsv
rm -r tmp
