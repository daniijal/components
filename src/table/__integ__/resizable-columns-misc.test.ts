// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { BasePageObject } from '@cloudscape-design/browser-test-tools/page-objects';
import useBrowser from '@cloudscape-design/browser-test-tools/use-browser';
import createWrapper from '../../../lib/components/test-utils/selectors';

const wrapper = createWrapper().findTable();

const prepareCoordinate = (num: number) => Math.round(num);

declare global {
  interface Window {
    __tableResizes__: ResizeObserverEntry[];
  }
}

class ResizableColumnsPage extends BasePageObject {
  async resizeBeyondTableWidth() {
    const resizerSelector = wrapper.findColumnResizer(2).toSelector();
    const resizerBox = await this.getBoundingBox(resizerSelector);
    const { width: windowWidth } = await this.browser.getWindowSize();
    await this.browser.performActions([
      {
        type: 'pointer',
        id: 'mouse',
        parameters: { pointerType: 'mouse' },
        actions: [
          // hover over resizer
          {
            type: 'pointerMove',
            duration: 0,
            x: prepareCoordinate(resizerBox.left),
            y: prepareCoordinate(resizerBox.top),
          },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 30 },
          // move cursor to screen edge to activate auto-growing behavior
          { type: 'pointerMove', duration: 0, x: windowWidth, y: 0 },
          // pause to let resizing interval fire a few times
          { type: 'pause', duration: 500 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
  }
  async getTableWidth() {
    const rect = await this.getBoundingBox(wrapper.toSelector());
    return rect.width;
  }

  async installObserver(selector: string) {
    await this.browser.execute(selector => {
      window.__tableResizes__ = [];
      const target = document.querySelector(selector)!;
      const observer = new ResizeObserver(entries => {
        window.__tableResizes__.push(...entries);
      });
      observer.observe(target);
    }, selector);
  }

  flushObservations() {
    return this.browser.execute(() => {
      const resizes = window.__tableResizes__;
      window.__tableResizes__ = [];
      return resizes;
    });
  }
}

test(
  'should keep table width in flex parent when resizing column to full page width',
  useBrowser({ width: 1680, height: 800 }, async browser => {
    const page = new ResizableColumnsPage(browser);
    await browser.url('#/light/table/resizable-columns-flex');
    await page.waitForVisible(wrapper.toSelector());
    const previousWidth = await page.getTableWidth();

    await page.resizeBeyondTableWidth();

    const currenWidth = await page.getTableWidth();
    expect(previousWidth).toEqual(currenWidth);
  })
);

test(
  'should not have oscillating size when the last column has the minimal width',
  useBrowser(async browser => {
    const page = new ResizableColumnsPage(browser);
    await browser.url('#/light/table/resizable-columns-rounding');
    await page.waitForVisible(wrapper.toSelector());
    await page.installObserver(wrapper.find('table').toSelector());
    await page.click('#shrink-container');
    await page.waitForJsTimers();
    // flush observations from the container resize
    await expect(page.flushObservations()).resolves.not.toEqual([]);
    await page.waitForJsTimers();
    // ensure there are no ongoing resizes after we flushed the expected ones above
    await expect(page.flushObservations()).resolves.toEqual([]);
  })
);
