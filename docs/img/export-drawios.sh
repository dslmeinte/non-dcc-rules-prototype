BASEDIR=$(dirname "$0")

for drawio in *.drawio; do
    $BASEDIR/export-drawio.sh $drawio;
done

