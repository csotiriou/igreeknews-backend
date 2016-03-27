OUTPUT_DIR=../mean_dist

rsync -av --progress . $OUTPUT_DIR --exclude node_modules --exclude public/lib
zip -r mean_dist.zip $OUTPUT_DIR
rm -rf $OUTPUT_DIR