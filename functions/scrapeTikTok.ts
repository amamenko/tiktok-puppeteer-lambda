import "dotenv/config";
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

  const scrapingStatement = `♪ Now scraping Tik Tok data! ♪`;
  logger("server").info(scrapingStatement);

  try {
    const args = chromium.args;
    const headless = chromium.headless;
    let exec_path = await chromium.executablePath();

    // we are running locally
    if (process.env.AWS_EXECUTION_ENV === undefined) {
      exec_path = process.env.LOCAL_CHROMIUM;
    }

    browser = await puppeteer.launch({
      args: [...args, "--window-size=1920,1080"],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: exec_path,
      headless,
    });
    await handlePuppeteerPage(browser);
  } catch (error) {
    logger("server").error(error);
  } finally {
    if (browser !== null) await browser.close();
    return "Scraping complete. Browser closed.";
  }
};
