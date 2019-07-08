#!/bin/bash -e

NODEJS810_DIST=dist/nodejs810.zip
NODEJS10_DIST=dist/nodejs10.zip

REGIONS=(
  ap-northeast-1
  ap-northeast-2
  ap-south-1
  ap-southeast-1
  ap-southeast-2
  ca-central-1
  eu-central-1
  eu-west-1
  eu-west-2
  eu-west-3
  #sa-east-1
  us-east-1
  us-east-2
  us-west-1
  us-west-2
)

rm -rf dist
mkdir -p dist

function usage {
    echo "./publish-layers.sh [nodejs8.10|nodejs10.x]"
    exit 1
}

case "$1" in
    "nodejs8.10")
        echo "Building iopipe Layer for nodejs8.10"
        npm install --prefix nodejs @iopipe/iopipe
        zip -rq $NODEJS810_DIST nodejs
        rm -rf nodejs package-lock.json
        echo "Build complete: ${NODEJS810_DIST}"

        nodejs810_hash=$(git rev-parse HEAD)
        nodejs810_s3key="iopipe-nodejs8.10/${nodejs810_hash}.zip"

        for region in "${REGIONS[@]}"; do
            bucket_name="iopipe-layers-${region}"

            echo "Uploading ${NODEJS810_DIST} to s3://${bucket_name}/${nodejs810_s3key}"
            aws --region $region s3 cp $NODEJS810_DIST "s3://${bucket_name}/${nodejs810_s3key}"

            echo "Publishing nodejs8.10 layer to ${region}"
            nodejs810_version=$(aws lambda publish-layer-version \
                --layer-name IOpipeNodeJS810 \
                --content "S3Bucket=${bucket_name},S3Key=${nodejs810_s3key}" \
                --description "IOpipe Layer for Node 8.10" \
                --compatible-runtimes nodejs8.10 \
                --license-info "Apache 2.0" \
                --region $region \
                --output text \
                --query Version)
            echo "published nodejs8.10 layer version ${nodejs810_version} to ${region}"

            echo "Setting public permissions for nodejs8.10 layer version ${nodejs810_version} in ${region}"
            aws lambda add-layer-version-permission \
              --layer-name IOpipeNodeJS810 \
              --version-number $nodejs810_version \
              --statement-id public \
              --action lambda:GetLayerVersion \
              --principal "*" \
              --region $region
            echo "Public permissions set for nodejs8.10 Layer version ${nodejs810_version} in region ${region}"
        done
        ;;
    "nodejs10.x")
        echo "Building iopipe Layer for nodejs10.x"
        npm install --prefix nodejs @iopipe/iopipe
        zip -rq $NODEJS10_DIST nodejs
        rm -rf nodejs package-lock.json
        echo "Build complete: ${NODEJS10_DIST}"

        nodejs10_hash=$(git rev-parse HEAD)
        nodejs10_s3key="iopipe-nodejs10.x/${nodejs10_hash}.zip"

        for region in "${REGIONS[@]}"; do
            bucket_name="iopipe-layers-${region}"

            echo "Uploading ${NODEJS10_DIST} to s3://${bucket_name}/${nodejs10_s3key}"
            aws --region $region s3 cp $NODEJS10_DIST "s3://${bucket_name}/${nodejs10_s3key}"

            echo "Publishing nodejs10.x layer to ${region}"
            nodejs10_version=$(aws lambda publish-layer-version \
                --layer-name IOpipeNodeJS10 \
                --content "S3Bucket=${bucket_name},S3Key=${nodejs10_s3key}" \
                --description "IOpipe Layer for Node 10" \
                --compatible-runtimes nodejs10.x \
                --license-info "Apache 2.0" \
                --region $region \
                --output text \
                --query Version)
            echo "published nodejs10.x layer version ${nodejs10_version} to ${region}"

            echo "Setting public permissions for nodejs10.x layer version ${nodejs10_version} in ${region}"
            aws lambda add-layer-version-permission \
              --layer-name IOpipeNodeJS10 \
              --version-number $nodejs10_version \
              --statement-id public \
              --action lambda:GetLayerVersion \
              --principal "*" \
              --region $region
            echo "Public permissions set for nodejs10.x Layer version ${nodejs10_version} in region ${region}"
        done
        ;;
    *)
        usage
        ;;
esac
