import { handleRequestFinished } from "./handleRequestFinished";
import { waitForTimeout } from "./waitForTimeout";
import { Browser, HTTPRequest, Page } from "puppeteer-core";
import { logger } from "../logger/logger";

export const handlePuppeteerPage = async (browser: Browser) => {
  try {
    const page = await browser.newPage();

    logger("server").info(`Setting Puppeteer configuration settings`);

    await page.setViewport({
      width: 600,
      height: 813,
    });
    // Configure the navigation timeout
    page.setDefaultNavigationTimeout(0);

    let totalUpdatedLives = 0;

    page.on("requestfinished", async (request: HTTPRequest) => {
      const modifiedLives = await handleRequestFinished(
        request,
        totalUpdatedLives
      );
      if (modifiedLives) totalUpdatedLives += modifiedLives;
    });

    logger("server").info(`Navigating to TikTok LIVE Backstage portal... 🚀`);

    await page.goto("https://live-backstage.tiktok.com", {
      waitUntil: "networkidle0",
    });

    await waitForTimeout(2000);

    // Top-right teal 'Log in' button
    try {
      await page.click("button.semi-button-primary");
    } catch (e) {
      logger("server").error("No teal log in button found!");
    }

    logger("server").info(
      `Entering login credentials for TikTok LIVE Backstage portal... 🕵️‍♂️`
    );

    await page.focus('input[placeholder="Enter email address"]');
    await page.keyboard.type(process.env.TIK_TOK_EMAIL);
    await page.focus('input[placeholder="Enter password"]');
    await page.keyboard.type(process.env.TIK_TOK_PASSWORD);

    // Large 'Log in' button on the bottom of form
    try {
      await page.click(
        "button.semi-button.semi-button-primary.semi-button-size-large.semi-button-block"
      );
    } catch (e) {
      logger("server").error("No big teal log in button found!");
    }

    await waitForTimeout(2000);

    await page.goto(
      "https://live-backstage.tiktok.com/portal/anchor/live?tab=liveRoom"
    );

    logger("server").info(
      `Successfully navigated to the TikTok LIVE Backstage portal! 🎉`
    );

    await waitForTimeout(5000);

    // Keep clicking next button until it is disabled to trigger all paginated requests
    const isElementVisible = async (page: Page, cssSelector: string) => {
      let visible = true;
      await waitForTimeout(5000);
      await page
        .waitForSelector(cssSelector, { visible: true, timeout: 5000 })
        .catch(() => {
          visible = false;
        });
      return visible;
    };
    const cssSelector = "li:not(.semi-page-item-disabled).semi-page-next";
    let loadMoreVisible = await isElementVisible(page, cssSelector);
    while (loadMoreVisible) {
      await page.$eval(cssSelector, (el) => el.click());
      const isNextElementVisible = await isElementVisible(page, cssSelector);
      logger("server").info(
        `Clicked next button! Next page is ${
          isNextElementVisible ? "visible" : "not visible"
        }.`
      );
      if (!isNextElementVisible) {
        loadMoreVisible = isNextElementVisible;
        break;
      }
    }
  } catch (e) {
    logger("server").error(`Received error during Puppeteer process: ${e}`);
  } finally {
    // ALWAYS make sure Puppeteer closes the browser when finished regardless of success or error
    await browser.close();
    logger("server").info("Scraping complete. Browser closed.");
    return true;
  }
};
