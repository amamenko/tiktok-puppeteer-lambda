import { waitForTimeout } from "./waitForTimeout";
import { Browser } from "puppeteer-core";
import { logger } from "../logger/logger";
import { writeScreenshotToS3 } from "./writeScreenshotToS3";
import { generateRandomUA } from "./generateRandomUA";

export const botTestScreenshot = async (browser: Browser) => {
  try {
    const botTestScreenshotSite = process.env.BOT_TEST_SCREENSHOT_SITE || "";
    if (!botTestScreenshotSite) {
      logger("server").error(
        `No bot test site URL provided. Please provide a URL in the environment variable BOT_TEST_SCREENSHOT_SITE.`
      );
      return false;
    }

    const page = await browser.newPage();

    const randomUA = generateRandomUA();
    // Set custom user agent
    await page.setUserAgent(randomUA);

    logger("server").info(
      `Setting Puppeteer configuration settings for bot test.`
    );

    await page.setViewport({
      width: 1280,
      height: 720,
    });
    // Configure the navigation timeout
    page.setDefaultNavigationTimeout(0);

    logger("server").info("Now visiting bot test site. 🤖");

    await page.goto(botTestScreenshotSite, {
      waitUntil: "networkidle0",
    });

    await waitForTimeout(10000);

    logger("server").info("Now visiting bot test site. 🤖");

    await writeScreenshotToS3({
      page,
      filePath: "bot-test",
    });

    logger("server").info("Finished testing bot screenshot! 🤖");

    return true;
  } catch (e) {
    logger("server").error(`Received error during Puppeteer process: ${e}`);
  } finally {
    // ALWAYS make sure Puppeteer closes the browser when finished regardless of success or error
    await browser.close();
    logger("server").info("Finishing testing bot screenshot. Browser closed.");
    return true;
  }
};
