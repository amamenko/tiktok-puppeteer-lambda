import "dotenv/config";
// import chromium from "@sparticuz/chromium";
import { Browser } from "puppeteer-core";
import { handlePuppeteerPage } from "./handlePuppeteerPage";
import { logger } from "../logger/logger";
import { connect } from "puppeteer-real-browser";
import chromium from "chrome-aws-lambda";

export const scrapeTikTok = async () => {
  let browser = null;
  const isLocal =
    process.env.AWS_EXECUTION_ENV === undefined ||
    process.env.ENVIRONMENT === "local";

  const scrapingStatement = `♪ Now scraping Tik Tok data! ♪`;
  logger("server").info(scrapingStatement);

  try {
    let exec_path = await chromium.executablePath;

    if (isLocal) exec_path = process.env.LOCAL_CHROMIUM;

    const { browser, page } = await connect({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--window-size=1280,720",
        "--display=:99",
      ],
      turnstile: true,
      customConfig: {
        chromePath: exec_path,
      },
      connectOption: {},
      disableXvfb: false,
    });

    const puppeteerSuccessStatement = `Successfully launched Puppeteer! ✅`;
    logger("server").info(puppeteerSuccessStatement);

    return await handlePuppeteerPage(browser as unknown as Browser, page);
  } catch (error) {
    // logger("server").error(error);
    console.error(error);
  } finally {
    if (browser !== null) await browser.close();
    const scrapingCompleteStatement = "Scraping complete. Browser closed.";
    logger("server").info(scrapingCompleteStatement);
    return scrapingCompleteStatement;
  }
};
