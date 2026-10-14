import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homepage.page';

test.describe('Homepage', () => {
    let homePage: HomePage;

    test.use({
        viewport: {width: 1280, height: 720},
    });

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.goto();
    });

    test('logo is displayed', async() => {
        await expect(homePage.logoLink).toBeVisible();
    });

    test('homepage sign-in button is displayed', async() => {
        await expect(homePage.signInButton).toBeVisible();
    });

    test('logo and sign-in control are inside the header, with the logo on the left', async() => {
        await expect(homePage.logoLink).toBeVisible();
        await expect(homePage.signInButton).toBeVisible();

        const header = await homePage.header.boundingBox();
        const logo = await homePage.logoLink.boundingBox();
        const signIn = await homePage.signInButton.boundingBox();

        if(!logo || !signIn || !header){
            throw new Error('Could not measure the header elements location');
        };

        for(const element of [logo, signIn]){
            expect(element.x).toBeGreaterThanOrEqual(header.x);
            expect(element.y).toBeGreaterThanOrEqual(header.y);

            expect(element.x + element.width).toBeLessThanOrEqual(header.x + header.width);
            expect(element.y + element.height).toBeLessThanOrEqual(header.y + header.height);
        }

        expect(logo.x + logo.width).toBeLessThan(signIn.x);
    })
});