import "../node_modules/dotenv/config";
// import chromium from "@sparticuz/chromium";
import { Browser } from "puppeteer";
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

    // we are running locally
    if (isLocal) exec_path = process.env.LOCAL_CHROMIUM;

    const { browser, page } = await connect({
      headless: false,
      args: [],
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
