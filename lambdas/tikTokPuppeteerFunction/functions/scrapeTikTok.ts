import "../node_modules/dotenv/config";
// import chromium from "@sparticuz/chromium";
import { Browser } from "puppeteer";
import { handlePuppeteerPage } from "./handlePuppeteerPage";
import { logger } from "../logger/logger";
import { connect } from "puppeteer-real-browser";
import chromium from "chrome-aws-lambda";
import { execSync } from "child_process";

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

    // Start Xvfb using a child process
    execSync("Xvfb :99 -screen 0 1280x1024x24 &");

    const { browser, page } = await connect({
      headless: false,
      args: isLocal
        ? []
        : [
            ...chromium.args,
            "--autoplay-policy=user-gesture-required",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-component-update",
            "--disable-default-apps",
            "--disable-dev-shm-usage",
            "--disable-domain-reliability",
            "--disable-extensions",
            "--disable-features=AudioServiceOutOfProcess",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-notifications",
            "--disable-offer-store-unmasked-wallet-cards",
            "--disable-popup-blocking",
            "--disable-print-preview",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-setuid-sandbox",
            "--disable-speech-api",
            "--disable-sync",
            "--hide-scrollbars",
            "--ignore-gpu-blacklist",
            "--metrics-recording-only",
            "--mute-audio",
            "--no-default-browser-check",
            "--no-first-run",
            "--no-pings",
            "--no-sandbox",
            "--no-zygote",
            "--password-store=basic",
            "--use-gl=swiftshader",
            "--use-mock-keychain",
          ],
      turnstile: true,
      customConfig: {
        chromePath: exec_path,
      },
      connectOption: {
        defaultViewport: {
          width: 1280,
          height: 720,
        },
      },
      disableXvfb: false,
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
