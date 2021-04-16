const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

const s3 = new S3({
  region: process.env.S3_BUCKET_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
});

exports.uploadFile = file => {
  const fileStream = fs.createReadStream(file.path);

  return s3
    .upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Body: fileStream,
      Key: file.filename,
    })
    .promise();
};

exports.getFileStream = filename => {
  return s3
    .getObject({
      Key: filename,
      Bucket: process.env.S3_BUCKET_NAME,
    })
    .createReadStream();
};
