import { waitForTimeout } from "./waitForTimeout";
import { Browser } from "puppeteer-core";
import { logger } from "../logger/logger";
import { writeScreenshotToS3 } from "./writeScreenshotToS3";
import { generateRandomUA } from "./generateRandomUA";
import { scrollToBottomOfPage } from "./utils/scrollToBottomOfPage";

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

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      // Override headers
      const headers = Object.assign({}, request.headers(), {
        "Accept-Language": "en-US;q=0.7",
      });
      request.continue({ headers });
    });

    const randomUA = generateRandomUA();
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

    logger("server").info(
      `Now visiting bot test site ${botTestScreenshotSite} 🤖`
    );

    await page.goto(botTestScreenshotSite, {
      waitUntil: "networkidle0",
    });

    await waitForTimeout(10000);

    await scrollToBottomOfPage(page);

    await writeScreenshotToS3({
      page,
      filePath: "bot-test",
    });

    logger("server").info(
      `Finished testing bot screenshot at ${botTestScreenshotSite}! 🤖`
    );

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
