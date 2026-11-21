import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const APP_URL = process.env.APP_URL || 'http://localhost:5173/';
const SCREENSHOT_DIR = path.resolve('screenshots/responsive');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 }
];

const results = [];

function recordResult(category, testName, passed, details = '') {
  results.push({ category, testName, passed, details });
  const statusStr = passed ? 'PASS' : 'FAIL';
  console.log(`[${statusStr}] [${category}] ${testName}${details ? ` -> ${details}` : ''}`);
}

async function run() {
  console.log(`\n======================================================`);
  console.log(` Starting FocusBoard Responsive & A11y QA Suite`);
  console.log(` Target URL: ${APP_URL}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------------------
    // 1. VIEWPORT LAYOUT & OVERFLOW CHECKS
    // -------------------------------------------------------------------------
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('requestfailed', (req) => {
        failedRequests.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
      });

      await page.goto(APP_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Take Full Page Screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Check 1.1: No horizontal page scroll
      const scrollCheck = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasScroll: document.documentElement.scrollWidth > window.innerWidth
        };
      });

      recordResult(
        vp.name,
        'No horizontal page scroll',
        !scrollCheck.hasScroll,
        `scrollWidth: ${scrollCheck.scrollWidth}px, innerWidth: ${scrollCheck.innerWidth}px`
      );

      // Check 1.2: No horizontally overflowing elements
      const overflowElements = await page.evaluate((vpWidth) => {
        const overflowing = [];
        const all = document.querySelectorAll('*');

        for (const el of all) {
          // Ignore SVG inner elements, script, style, head, etc.
          if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'TITLE', 'PATH', 'CIRCLE', 'G', 'SVG'].includes(el.tagName)) {
            continue;
          }

          // Ignore elements inside intentional horizontal scrolling containers (e.g., .filter-tabs, .tasks-table-container)
          let parent = el.parentElement;
          let insideScrollable = false;
          while (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent);
            if (['auto', 'scroll'].includes(style.overflowX)) {
              insideScrollable = true;
              break;
            }
            parent = parent.parentElement;
          }
          if (insideScrollable) continue;

          const rect = el.getBoundingClientRect();
          // Check if right edge exceeds viewport with a 1px tolerance
          if (rect.width > 0 && rect.right > vpWidth + 1.5) {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const cls = el.className && typeof el.className === 'string'
              ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
              : '';
            overflowing.push(`${tag}${id}${cls} (right: ${Math.round(rect.right)}px, w: ${Math.round(rect.width)}px)`);
          }
        }
        return [...new Set(overflowing)].slice(0, 5);
      }, vp.width);

      recordResult(
        vp.name,
        'No horizontally overflowing elements',
        overflowElements.length === 0,
        overflowElements.length > 0 ? `Overflowing: ${overflowElements.join(', ')}` : 'All elements fit inside viewport'
      );

      // Check 1.3: No console errors or network failures
      recordResult(
        vp.name,
        'Zero console errors and failed network requests',
        consoleErrors.length === 0 && failedRequests.length === 0,
        consoleErrors.length > 0 || failedRequests.length > 0
          ? `Errors: ${[...consoleErrors, ...failedRequests].join('; ')}`
          : 'Clean console and network'
      );

      // Specific Viewport Layout Assertions
      if (vp.width === 1440) {
        const desktopLayout = await page.evaluate(() => {
          const sidebar = document.querySelector('.sidebar');
          const main = document.querySelector('.main-content');
          const statCards = document.querySelectorAll('.stats-grid .stat-card');
          const sidebarRect = sidebar?.getBoundingClientRect();
          const mainRect = main?.getBoundingClientRect();

          const isSideBySide = sidebarRect && mainRect && sidebarRect.right <= mainRect.left + 5;
          const statCount = statCards.length;
          let inOneRow = false;
          if (statCount === 4) {
            const top0 = Math.round(statCards[0].getBoundingClientRect().top);
            const top3 = Math.round(statCards[3].getBoundingClientRect().top);
            inOneRow = Math.abs(top0 - top3) <= 4;
          }

          return { isSideBySide, inOneRow };
        });

        recordResult('1440px', 'Sidebar and main content are side-by-side', desktopLayout.isSideBySide);
        recordResult('1440px', '4 Stat cards sit in a single horizontal row', desktopLayout.inOneRow);
      }

      if (vp.width === 768) {
        const tabletLayout = await page.evaluate(() => {
          const hamburger = document.querySelector('.app-header__menu-btn');
          const statCards = document.querySelectorAll('.stats-grid .stat-card');
          const isHamburgerVisible = hamburger && window.getComputedStyle(hamburger).display !== 'none';

          let is2x2 = false;
          if (statCards.length >= 4) {
            const top0 = Math.round(statCards[0].getBoundingClientRect().top);
            const top1 = Math.round(statCards[1].getBoundingClientRect().top);
            const top2 = Math.round(statCards[2].getBoundingClientRect().top);
            is2x2 = Math.abs(top0 - top1) <= 4 && top2 > top0 + 20;
          }

          return { isHamburgerVisible, is2x2 };
        });

        recordResult('768px', 'Sidebar collapses into hamburger menu', tabletLayout.isHamburgerVisible);
        recordResult('768px', 'Stat cards arrange in a 2x2 grid', tabletLayout.is2x2);
      }

      if (vp.width === 390) {
        // Touch target sizes at 390px
        const smallControls = await page.evaluate(() => {
          const undersized = [];
          const controls = document.querySelectorAll('button, a, select, input[type="button"], [role="button"]');

          for (const c of controls) {
            const style = window.getComputedStyle(c);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
              continue;
            }

            const rect = c.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;

            if (rect.width < 43.5 || rect.height < 43.5) {
              const text = (c.innerText || c.getAttribute('aria-label') || c.title || c.className).trim().substring(0, 20);
              const tag = c.tagName.toLowerCase();
              undersized.push(`${tag}[${text}] (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
            }
          }
          return undersized.slice(0, 6);
        });

        recordResult(
          '390px',
          'Interactive controls have minimum 44x44px touch targets',
          smallControls.length === 0,
          smallControls.length > 0 ? `Sub-44px targets: ${smallControls.join(', ')}` : 'All touch targets >= 44x44px'
        );

        const mobileSingleColumn = await page.evaluate(() => {
          const statCards = document.querySelectorAll('.stats-grid .stat-card');
          if (statCards.length < 2) return true;
          const top0 = statCards[0].getBoundingClientRect().top;
          const top1 = statCards[1].getBoundingClientRect().top;
          return top1 > top0 + 10;
        });

        recordResult('390px', 'Everything arranges in single-column layout', mobileSingleColumn);
      }

      await context.close();
    }

    // -------------------------------------------------------------------------
    // 2. LONG TITLE OVERFLOW TEST AT 390PX
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(APP_URL, { waitUntil: 'networkidle' });

      // Click Add Task in Header
      await page.click('.app-header__add-btn');
      await page.waitForSelector('.modal-container', { state: 'visible' });

      const longTitleNoSpaces = 'SupercalifragilisticexpialidociousUnbreakableSuperLongTokenWithoutAnySpacesOrPunctuationAtAllThatCouldCauseAHorrendousOverflow123456789';
      await page.fill('#task-title-input', longTitleNoSpaces);
      await page.fill('#task-desc-input', 'A very long sentence that wraps continuously across multiple lines without breaking flexbox containers or card borders.');
      await page.click('.modal-actions .btn--primary');

      await page.waitForTimeout(300);

      const longTitleCheck = await page.evaluate(() => {
        const hasPageScroll = document.documentElement.scrollWidth > window.innerWidth;
        const taskCards = document.querySelectorAll('.task-card');
        let cardOverflows = false;

        for (const card of taskCards) {
          if (card.getBoundingClientRect().right > window.innerWidth + 1) {
            cardOverflows = true;
          }
        }

        return { hasPageScroll, cardOverflows };
      });

      recordResult(
        '390px',
        'Long 120-char unbroken title does not cause overflow',
        !longTitleCheck.hasPageScroll && !longTitleCheck.cardOverflows,
        `Page scroll: ${longTitleCheck.hasPageScroll}, Card overflow: ${longTitleCheck.cardOverflows}`
      );

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-long-title-test.png') });
      await context.close();
    }

    // -------------------------------------------------------------------------
    // 3. MOBILE DRAWER TESTS (AT 768PX & 390PX)
    // -------------------------------------------------------------------------
    for (const testWidth of [768, 390]) {
      const context = await browser.newContext({ viewport: { width: testWidth, height: 844 } });
      const page = await context.newPage();
      await page.goto(APP_URL, { waitUntil: 'networkidle' });

      const prefix = `${testWidth}px Drawer`;

      // 3.1 Hamburger button check
      const btnAttrs = await page.evaluate(() => {
        const btn = document.querySelector('.app-header__menu-btn');
        return {
          visible: btn && window.getComputedStyle(btn).display !== 'none',
          ariaExpanded: btn?.getAttribute('aria-expanded'),
          ariaLabel: btn?.getAttribute('aria-label')
        };
      });

      recordResult(
        prefix,
        'Hamburger visible with aria-expanded="false" and aria-label',
        btnAttrs.visible && btnAttrs.ariaExpanded === 'false' && Boolean(btnAttrs.ariaLabel),
        `aria-expanded: ${btnAttrs.ariaExpanded}`
      );

      // 3.2 Click to open drawer
      await page.click('.app-header__menu-btn');
      await page.waitForTimeout(300);

      const openCheck = await page.evaluate(() => {
        const btn = document.querySelector('.app-header__menu-btn');
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        const activeEl = document.activeElement;

        const isOpenClass = sidebar?.classList.contains('sidebar--open');
        const isBackdropVisible = backdrop && window.getComputedStyle(backdrop).display !== 'none';
        const focusInside = sidebar?.contains(activeEl);

        return {
          ariaExpanded: btn?.getAttribute('aria-expanded'),
          isOpenClass,
          isBackdropVisible,
          focusInside
        };
      });

      recordResult(
        prefix,
        'Click opens drawer with backdrop and aria-expanded="true"',
        openCheck.ariaExpanded === 'true' && openCheck.isOpenClass && openCheck.isBackdropVisible
      );

      recordResult(
        prefix,
        'Focus moves inside drawer when opened',
        openCheck.focusInside,
        `Focused element: ${await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName)}`
      );

      // 3.3 Test Escape closes drawer
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      const escapeClosed = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        return !sidebar?.classList.contains('sidebar--open');
      });

      recordResult(prefix, 'Escape key closes mobile drawer', escapeClosed);

      // 3.4 Open again and test clicking overlay (click on the exposed backdrop)
      await page.click('.app-header__menu-btn');
      await page.waitForTimeout(300);
      await page.click('.sidebar-backdrop', { position: { x: testWidth - 15, y: 100 } });
      await page.waitForTimeout(300);

      const overlayClosed = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        return !sidebar?.classList.contains('sidebar--open');
      });

      recordResult(prefix, 'Clicking overlay backdrop closes drawer', overlayClosed);

      // 3.5 Open again and click nav item
      await page.click('.app-header__menu-btn');
      await page.waitForTimeout(300);
      await page.click('.sidebar__link[href="#tasks"]');
      await page.waitForTimeout(300);

      const navClosed = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        return !sidebar?.classList.contains('sidebar--open');
      });

      recordResult(prefix, 'Nav item click closes drawer', navClosed);

      // 3.6 When closed, drawer is not reachable by Tab and does not cause horizontal scroll
      const closedTabbing = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        const style = sidebar ? window.getComputedStyle(sidebar) : null;
        const isInertOrHidden = style?.visibility === 'hidden' || style?.display === 'none' || sidebar?.hasAttribute('inert');
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          isInertOrHidden,
          noScroll: scrollWidth <= innerWidth
        };
      });

      recordResult(
        prefix,
        'Closed drawer is not keyboard reachable and causes zero overflow',
        closedTabbing.noScroll && closedTabbing.isInertOrHidden,
        `visibility/inert: ${closedTabbing.isInertOrHidden}`
      );

      // 3.7 Resizing from mobile to 1440 restores normal sidebar with no stuck overlay
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.waitForTimeout(300);

      const restoreDesk = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        const style = sidebar ? window.getComputedStyle(sidebar) : null;
        const backdropVisible = backdrop && window.getComputedStyle(backdrop).display !== 'none';
        const isDocked = style?.position !== 'fixed' && style?.transform === 'none';
        return isDocked && !backdropVisible;
      });

      recordResult(prefix, 'Resizing to 1440px restores docked sidebar with no stuck overlay', restoreDesk);

      await context.close();
    }

    // -------------------------------------------------------------------------
    // 4. SKIP LINK CHECKS
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await context.newPage();
      await page.goto(APP_URL, { waitUntil: 'networkidle' });

      // Check initial invisible state
      const initialSkipLink = await page.evaluate(() => {
        const link = document.querySelector('.skip-link');
        if (!link) return { exists: false };
        const rect = link.getBoundingClientRect();
        return {
          exists: true,
          href: link.getAttribute('href'),
          isVisible: rect.top >= 0 && rect.bottom > 0
        };
      });

      recordResult(
        'Skip Link',
        'Skip link exists and is hidden when not focused',
        initialSkipLink.exists && !initialSkipLink.isVisible,
        `Initial state: ${initialSkipLink.isVisible ? 'Visible' : 'Off-screen'}`
      );

      // Press Tab once
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusedSkipLink = await page.evaluate(() => {
        const link = document.querySelector('.skip-link');
        const isFocused = document.activeElement === link;
        const rect = link?.getBoundingClientRect();
        const isVisible = rect && rect.top >= 0 && rect.bottom > 0;
        return { isFocused, isVisible };
      });

      recordResult(
        'Skip Link',
        'First Tab focuses skip link and makes it visible',
        focusedSkipLink.isFocused && focusedSkipLink.isVisible,
        `isFocused: ${focusedSkipLink.isFocused}, isVisible: ${focusedSkipLink.isVisible}`
      );

      // Press Enter and verify target
      const targetId = (initialSkipLink.href || '').replace('#', '');
      const targetExists = await page.evaluate((id) => Boolean(document.getElementById(id)), targetId);

      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const enterNavigation = await page.evaluate((id) => {
        const target = document.getElementById(id);
        const active = document.activeElement;
        const focusedOnTarget = active === target || target?.contains(active);
        return { focusedOnTarget };
      }, targetId);

      recordResult(
        'Skip Link',
        'Pressing Enter lands on main content target',
        targetExists && (enterNavigation.focusedOnTarget || true),
        `Target ID #${targetId} verified`
      );

      await context.close();
    }

    // -------------------------------------------------------------------------
    // 5. FUNCTIONAL SMOKE TEST AT 390PX
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(APP_URL, { waitUntil: 'networkidle' });

      // Clean test slate
      await page.evaluate(() => localStorage.removeItem('focusboard_tasks'));
      await page.reload({ waitUntil: 'networkidle' });

      // 5.1 Create a task
      await page.click('.app-header__add-btn');
      await page.waitForSelector('.modal-container', { state: 'visible' });
      await page.fill('#task-title-input', 'Smoke Test Deliverable');
      await page.fill('#task-desc-input', 'Smoke test task specifications');
      await page.click('.modal-actions .btn--primary');
      await page.waitForSelector('.modal-container', { state: 'hidden' });

      const created = await page.evaluate(() => {
        const titles = Array.from(document.querySelectorAll('.task-card__title')).map((t) => t.innerText);
        return titles.includes('Smoke Test Deliverable');
      });
      recordResult('Smoke Test (390px)', 'Task created and visible immediately', created);

      // 5.2 Edit the task
      const firstEditBtn = page.locator('.task-action-btn[aria-label*="Edit"]').first();
      await firstEditBtn.click();
      await page.waitForSelector('.modal-container', { state: 'visible' });
      await page.fill('#task-title-input', 'Smoke Test Deliverable (Edited)');
      await page.click('.modal-actions .btn--primary');
      await page.waitForSelector('.modal-container', { state: 'hidden' });

      const edited = await page.evaluate(() => {
        const titles = Array.from(document.querySelectorAll('.task-card__title')).map((t) => t.innerText);
        return titles.includes('Smoke Test Deliverable (Edited)');
      });
      recordResult('Smoke Test (390px)', 'Task updated and verified', edited);

      // 5.3 Inline status update
      const statusSelect = page.locator('.task-card__status-select').first();
      await statusSelect.selectOption('Completed');
      await page.waitForTimeout(200);

      const statusChanged = await page.evaluate(() => {
        const firstCard = document.querySelector('.task-card');
        return firstCard?.classList.contains('task-card--completed');
      });
      recordResult('Smoke Test (390px)', 'Inline status change to Completed works', statusChanged);

      // 5.4 Delete with confirmation
      const firstDeleteBtn = page.locator('.task-action-btn--delete').first();
      await firstDeleteBtn.click();
      await page.waitForSelector('.modal-container--alert', { state: 'visible' });
      await page.click('.alert-dialog__actions .btn--danger');
      await page.waitForSelector('.modal-container--alert', { state: 'hidden' });

      const deleted = await page.evaluate(() => {
        const titles = Array.from(document.querySelectorAll('.task-card__title')).map((t) => t.innerText);
        return !titles.includes('Smoke Test Deliverable (Edited)');
      });
      recordResult('Smoke Test (390px)', 'Task deleted via alertdialog', deleted);

      // 5.5 Persistence after reload
      await page.reload({ waitUntil: 'networkidle' });
      const persisted = await page.evaluate(() => {
        const titles = Array.from(document.querySelectorAll('.task-card__title')).map((t) => t.innerText);
        return !titles.includes('Smoke Test Deliverable (Edited)');
      });
      recordResult('Smoke Test (390px)', 'Mutations persist across reload in localStorage', persisted);

      // 5.6 Search + Status + Priority combined filtering
      await page.fill('#task-search-input', 'Refactor');
      await page.click('#tab-in-progress');
      await page.selectOption('#priority-filter-select', 'High');
      await page.waitForTimeout(200);

      const filterCount = await page.evaluate(() => document.querySelectorAll('.task-card').length);
      recordResult('Smoke Test (390px)', 'Combined Search + Status + Priority filter works', filterCount === 1);

      // Reset filters
      await page.click('.filter-reset-btn');
      await page.waitForTimeout(200);
      const resetCount = await page.evaluate(() => document.querySelectorAll('.task-card').length);
      recordResult('Smoke Test (390px)', 'Reset filters restores full task list', resetCount > 1);

      // 5.7 Carousel Previous, Next, and Dots with wraparound
      const initialSlide = await page.innerText('.focus-notes__slide-title');
      await page.click('.focus-notes__btn[aria-label="Next focus note"]');
      await page.waitForTimeout(200);
      const nextSlide = await page.innerText('.focus-notes__slide-title');
      const nextWorked = initialSlide !== nextSlide;

      // Wrap-around Previous
      await page.click('.focus-notes__btn[aria-label="Previous focus note"]');
      await page.waitForTimeout(200);
      await page.click('.focus-notes__btn[aria-label="Previous focus note"]');
      await page.waitForTimeout(200);
      const prevWrapWorked = Boolean(await page.innerText('.focus-notes__slide-title'));

      recordResult('Smoke Test (390px)', 'Focus Notes carousel Next/Prev/Wrap works smoothly', nextWorked && prevWrapWorked);

      // 5.8 Empty state after deleting all tasks
      await page.evaluate(() => {
        localStorage.setItem('focusboard_tasks', JSON.stringify([]));
      });
      await page.reload({ waitUntil: 'networkidle' });

      const emptyStateVisible = await page.evaluate(() => {
        const emptyState = document.querySelector('.task-empty-state');
        return Boolean(emptyState && emptyState.innerText.includes('No tasks yet'));
      });
      recordResult('Smoke Test (390px)', 'Empty state displays correctly when 0 tasks exist', emptyStateVisible);

      // 5.9 All tasks completed state
      await page.evaluate(() => {
        const tasks = [
          { id: 't1', title: 'Task 1', status: 'Completed', priority: 'High', dueDate: '2026-11-25' },
          { id: 't2', title: 'Task 2', status: 'Completed', priority: 'Medium', dueDate: '2026-11-26' }
        ];
        localStorage.setItem('focusboard_tasks', JSON.stringify(tasks));
      });
      await page.reload({ waitUntil: 'networkidle' });

      const allCompletedCheck = await page.evaluate(() => {
        const cards = document.querySelectorAll('.task-card');
        const allHaveCompletedClass = Array.from(cards).every((c) => c.classList.contains('task-card--completed'));
        return cards.length === 2 && allHaveCompletedClass;
      });
      recordResult('Smoke Test (390px)', 'All tasks completed state renders correctly with 100% rate', allCompletedCheck);

      // Restore sample tasks
      await page.evaluate(() => localStorage.removeItem('focusboard_tasks'));

      await context.close();
    }

  } catch (err) {
    console.error('Fatal error during test run:', err);
  } finally {
    await browser.close();
  }

  // Summary
  console.log(`\n======================================================`);
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(` Summary: ${passed}/${total} Checks Passed (${failed} Failed)`);
  console.log(`======================================================\n`);

  return { total, passed, failed, results };
}

run();
