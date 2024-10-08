import "../node_modules/dotenv/config";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { handlePuppeteerPage } from "./handlePuppeteerPage";
import { logger } from "../logger/logger";

const stealth = StealthPlugin();
// Remove this specific stealth plugin from the default set
stealth.enabledEvasions.delete("user-agent-override");
puppeteer.use(stealth);

export const scrapeTikTok = async () => {
  let browser = null;
  const isLocal =
    process.env.AWS_EXECUTION_ENV === undefined ||
    process.env.ENVIRONMENT === "local";

  const scrapingStatement = `♪ Now scraping Tik Tok data! ♪`;
  logger("server").info(scrapingStatement);

  try {
    const args = chromium.args;
    const headless = chromium.headless;
    let exec_path = await chromium.executablePath();

    // we are running locally
    if (isLocal) exec_path = process.env.LOCAL_CHROMIUM;

    browser = await puppeteer.launch({
      args: isLocal
        ? []
        : [...args, "--window-size=1280,720", "--disable-dev-shm-usage"],
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      executablePath: exec_path,
      headless,
    });

    return await handlePuppeteerPage(browser);
  } catch (error) {
    logger("server").error(error);
  } finally {
    if (browser !== null) await browser.close();
    const scrapingCompleteStatement = "Scraping complete. Browser closed.";
    logger("server").info(scrapingCompleteStatement);
    return scrapingCompleteStatement;
  }
};
