import "../node_modules/dotenv/config";
import chromium from "@sparticuz/chromium";
import { Browser } from "puppeteer";
import { handlePuppeteerPage } from "./handlePuppeteerPage";
import { logger } from "../logger/logger";
import { connect } from "puppeteer-real-browser";

export const scrapeTikTok = async () => {
  let browser = null;
  const isLocal =
    process.env.AWS_EXECUTION_ENV === undefined ||
    process.env.ENVIRONMENT === "local";

  const scrapingStatement = `♪ Now scraping Tik Tok data! ♪`;
  logger("server").info(scrapingStatement);

  try {
    const args = chromium.args;
    const headless = !!chromium.headless;
    let exec_path = await chromium.executablePath();

    // we are running locally
    if (isLocal) exec_path = process.env.LOCAL_CHROMIUM;

    const { browser, page } = await connect({
      headless,
      args: isLocal
        ? []
        : [...args, "--window-size=1280,720", "--disable-dev-shm-usage"],
      customConfig: {
        chromePath: exec_path,
      },
      turnstile: true,
      connectOption: {
        defaultViewport: {
          width: 1280,
          height: 720,
        },
      },
      disableXvfb: false,
      ignoreAllFlags: false,
    });

    return await handlePuppeteerPage(browser as unknown as Browser, page);
  } catch (error) {
    logger("server").error(error);
  } finally {
    if (browser !== null) await browser.close();
    const scrapingCompleteStatement = "Scraping complete. Browser closed.";
    logger("server").info(scrapingCompleteStatement);
    return scrapingCompleteStatement;
  }
};
