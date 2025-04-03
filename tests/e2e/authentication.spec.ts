import { test, expect } from '@playwright/test';

import * as dotenv from 'dotenv';
dotenv.config();

const dummyEmail = process.env.DUMMY_EMAIL;
const dummyPassword = process.env.DUMMY_PASSWORD;

const baseUrl = 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl + '/login');

    await page.waitForLoadState('domcontentloaded');

    expect(await page.locator('.auth-form').isVisible()).toBeTruthy(); // Make sure the form actually loaded

    // Fill in input forms and proceed to submit

    await page.locator('#email').fill(dummyEmail || '');
    await page.locator('#password').fill(dummyPassword || '');

    await page
        .locator('button')
        .locator('text=LOGIN')
        .click({ button: 'left' });

    await page.waitForEvent('load'); // Wait for redirect
});

test('test user logged in state', async ({ page }) => {
    await page.goto(baseUrl + '/');
    await page.waitForLoadState('domcontentloaded');

    // If its username is visible, then that means it's logged in
    expect(
        await page.locator('.dropdown-btn', { hasText: 'dummy' }).isVisible(),
    ).toBeTruthy();

    await page.close();
});
