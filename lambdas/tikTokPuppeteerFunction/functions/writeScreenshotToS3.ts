import {
  S3Client,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { format } from "date-fns";
import { readFile } from "fs/promises";
import { Page } from "puppeteer-core";
import { logger } from "../logger/logger";

interface WriteScreenshotParams {
  page: Page;
  filePath: string;
}

export const writeScreenshotToS3 = async ({
  page,
  filePath,
}: WriteScreenshotParams) => {
  const bucketName = "scraper-debug";
  const client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const timestamp = Date.now();
  const dateTime = format(timestamp, "MMddyyyy_HH:mm:ss");
  const fileName = `${filePath}_${dateTime}.jpg`;

  await page.screenshot({
    path: fileName,
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: await readFile(fileName),
  });

  try {
    const response = await client.send(command);
    logger("server").info(
      `Successfully uploaded ${fileName} to ${bucketName} S3 bucket.`
    );
    return response;
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "EntityTooLarge"
    ) {
      logger("server").error(
        `Error from S3 while uploading object to ${bucketName}. \
  The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
  or the multipart upload API (5TB max).`
      );
    } else if (caught instanceof S3ServiceException) {
      logger("server").error(
        `Error from S3 while uploading object to ${bucketName}. ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};
