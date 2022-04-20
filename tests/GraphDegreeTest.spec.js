const { test, expect } = require('@playwright/test');

// File contains various tests, checking if the Graph Degree page was rendered correctly and functioning


// Goes to the graph degrees page before any tests are ran
test.beforeEach(async ({ page }) => {
	await page.goto('http://131.104.49.107/degree');
});

// Tests if the main header "Search for Degrees to graph" was rendered
test('Main header should contain "Search for Degrees to graph"', async ({ page }) => {
    await expect(page.locator('h5').nth(0)).toContainText('Search for Degrees to graph:');
});

test.describe.parallel('Graph major and minor', () => {
    //test make uog major ACCT
    test('Test make UOG major graph', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=University of Guelph').click();
        await page.locator('text=Major').click();
        await page.locator('[aria-label="Open"]').click();
        await page.locator('text=Accounting (ACCT)').click();
        await page.locator('main button:has-text("Search")').click();
        // take a screenshot of the graph
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UOGMajor_ACCT.png' });
        await page.locator('text=ACCT*1220').click();
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UOGMajor_acct1220drop.png' });
    });
    //test make uog minor cis
    test('Test make UOG minor graph', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=University of Guelph').click();
        await page.locator('text=Minor').click();
        await page.locator('[aria-label="Open"]').click();
        await page.locator('text=Computing and Information Science (CIS)').click();
        await page.locator('main button:has-text("Search")').click();
        // take a screenshot of the graph
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UOGMinor_cis.png' });
        await page.locator('text=CIS*2500').click();
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UOGMinor_cis2500drop.png' });

    });

    //test make ubc major German
    test('Test make UBC major graph', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=University of British Columbia').click();
        await page.locator('text=Major').click();
        await page.locator('[aria-label="Open"]').click();
        await page.locator('text=German').click();
        await page.locator('main button:has-text("Search")').click();
        // take a screenshot of the graph
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UBCMajor_German.png' });
        await page.locator('text=GERM 100').click();
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UBCMajor_Germ100drop.png' });
    });
});

//test if clear button worked
test('Test if clear button worked', async ({ page }) => {
    await page.locator('div[role="button"]:has-text("​")').click();
    await page.locator('text=University of British Columbia').click();
    await page.locator('text=Major').click();
    // Click text=Clear
    await page.locator('text=Clear').click();
    await page.locator('main button:has-text("Search")').click();
    //check if it is cleared
    await expect(await page.locator('text=Please choose a school')).toContainText('Please choose a school')
});


//Tests dark mode work on the graph degree page
test('Dark mode swich to light mode and switch back', async ({ page }) => {
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph Subjects >> button').first().click();//change to dark mode
    //check the screenshot if change to the dark mode
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Degrees to g').screenshot({ path: './tests/screenshot/darkmodeDegreePage.png' });
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph Subjects >> button').first().click();//change back to light mode
    //check the screenshot if change back
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Degrees to g').screenshot({ path: './tests/screenshot/lightmodeDegreePage.png' });

});
