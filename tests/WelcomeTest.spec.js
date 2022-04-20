const { test, expect } = require('@playwright/test');

// File contains various tests, checking if the Welcome page was rendered correctly


// Goes to the welcome page before any tests are ran
test.beforeEach(async ({ page }) => {
	await page.goto('http://131.104.49.107/');
});

// Tests if the main header contains "Course Information"
test('Main header should contain "Course Information"', async ({ page }) => {
    await expect(page.locator('h4')).toContainText('Course Information');
});

// Tests if the second h6 header "Developers: Branden, Dan, Greg, JingJing, Yingjie". "Team 8: Sprint 8" is the first h6 header
test('Secondary header should contain "Developers: Branden, Dan, Greg, JingJing, Yingjie"', async ({ page }) => {
    await expect(page.locator('h6').nth(1)).toContainText('Developers: Branden, Dan, Greg, JingJing, Yingjie')
});

// Tests if the third h6 header "Our website features::".
test('Third header should contain "Our website features:"', async ({ page }) => {
    await expect(page.locator('h6').nth(2)).toContainText('Our website features:')
});

// Tests if the fourth h6 header "Technology stack:".
test('Fourth header should contain "Technology stack:"', async ({ page }) => {
    await expect(page.locator('h6').nth(3)).toContainText('Technology stack:')
});

//Tests dark mode work on the welcome page
test('Dark mode swich to light mode and switch back', async ({ page }) => {
    await page.locator('button').first().click();//change to dark mode
    //check the screenshot if change to the dark mode
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsCourse InformationDevel').screenshot({ path: './tests/screenshot/darkmode.png' });
    await page.locator('button').first().click();//change back to light mode
    //check the screenshot if change back
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsCourse InformationDevel').screenshot({ path: './tests/screenshot/lightmode.png' });

});
