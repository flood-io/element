import { Browser, Page, LaunchOptions } from "puppeteer";

export interface PuppeteerClient {
  browser: Browser;
  page: Page;
}

export interface Browser {
  launch(options?: LaunchOptions): Promise<PuppeteerClient>;
  client(): Promise<PuppeteerClient>;
  close(): Promise<void>;
}

export interface ITestRunner {
  run(testScript: Object): Promise<void>;
  shutdown(): Promise<void>;
}

export type Action = {
  type: string;
  input?: string | string[];
  arguments?: Array<string | Action | Symbol>;
  test?: Action;
  consequent?: Action[];
  alternate?: Action[];
};
