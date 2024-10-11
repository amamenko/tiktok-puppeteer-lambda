import { Page } from "puppeteer-core";

export const scrollToBottomOfPage = async (page: Page) => {
  // Scrolling to the bottom of the page
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
};
