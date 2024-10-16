import "../node_modules/dotenv/config";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { handlePuppeteerPage } from "./handlePuppeteerPage";
import { logger } from "../logger/logger";
import { botTestScreenshot } from "./botTestScreenshot";
import { generateRandomUA } from "./generateRandomUA";

const stealth = StealthPlugin();
// Remove this specific stealth plugin from the default set
stealth.enabledEvasions.delete("user-agent-override");
puppeteer.use(stealth);

export const scrapeTikTok = async () => {
  let browser = null;
  const proxyAddress = process.env.PROXY_ADDRESS || "";
  const isTestingBot = process.env.TESTING_BOT === "true";

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

    logger("server").info(scrapingStatement);

    if (proxyAddress) {
      logger("server").info(
        `Using proxy address ${proxyAddress} with username ${
          process.env.PROXY_USERNAME || ""
        } and password ${process.env.PROXY_PASSWORD || ""}`
      );
    }

    const randomUA = generateRandomUA();

    const puppeteerLaunchArgs = isLocal
      ? []
      : [
          ...args,
          "--ignore-certificate-errors",
          "--ignore-certificate-errors-spki-list",
          "--disable-features=site-per-process",
          "--no-first-run",
          "--no-zygote",
          "--deterministic-fetch",
          "--lang=en-US",
          "--no-sandbox",
          "--disable-gpu",
          `--user-agent=${randomUA}`,
          ...(proxyAddress ? [`--proxy-server=${proxyAddress}`] : []),
        ].filter((el) => el);

    browser = await puppeteer.launch({
      args: puppeteerLaunchArgs,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1440,
        height: 812,
      },
      executablePath: exec_path,
      headless,
    });

    if (isTestingBot) {
      return await botTestScreenshot(browser);
    } else {
      return await handlePuppeteerPage(browser);
    }
  } catch (error) {
    logger("server").error(error);
  } finally {
    if (browser !== null) await browser.close();
    const scrapingCompleteStatement = "Scraping complete. Browser closed.";
    logger("server").info(scrapingCompleteStatement);
    return scrapingCompleteStatement;
  }
};
