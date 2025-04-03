import { test, expect } from '@playwright/test';
import categories from '../../server/schemas/categories';

const baseUrl = 'http://localhost:3000';

test('Category posts', async ({ page }) => {
    await page.goto(baseUrl + '/');

    await page.waitForLoadState('domcontentloaded');

    expect(
        await page
            .locator('header')
            .filter({ hasText: 'Create a Post' })
            .isVisible(),
    ).toBeTruthy(); // Make sure header loads

    /*
    - Click on every category tab
    - Make sure buttons are all visible
    - If there are posts, make sure they all load properly
    */

    for (let i = 0; i < categories.length; i++) {
        await page
            .locator(`.cn-${categories[i].name}`)
            .click({ button: 'left', clickCount: 1 });
        await page.waitForTimeout(1000);

        const posts = await page.locator('.post').all();

        if (posts.length > 0) {
            for (let p = 0; p < posts.length; p++) {
                await posts[p].scrollIntoViewIfNeeded();
                expect(await posts[p].isVisible()).toBeTruthy();
            }
        }

        expect(
            await page
                .locator('.category-info')
                .locator('p')
                .locator(`text=${categories[i].description}`)
                .isVisible(),
        ).toBeTruthy();
    }

    await page.close();
});
