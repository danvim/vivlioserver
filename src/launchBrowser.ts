import * as process from 'node:process';
import exitHook from 'exit-hook';
import type { Browser, LaunchOptions } from 'playwright-core';
import * as pw from 'playwright-core';

interface LaunchBrowserProps {
  headless?: boolean;
}

export const launchBrowser = async ({
  headless = true,
}: LaunchBrowserProps): Promise<Browser> => {
  const pwOption: LaunchOptions = {
    channel: 'chrome',
    headless,
    args: [
      '--disable-web-security',
      '--lang=en',
      ...(headless ? ['--force-device-scale-factor=1'] : []),
      ...(!headless && process.platform === 'darwin'
        ? ['', '-AppleLanguages', '(en)']
        : []),
    ],
    env: { ...process.env, LANG: 'en.UTF-8' },
  };
  const browser = await pw.chromium.launch(pwOption);

  exitHook(() => browser.close());

  return browser;
};
