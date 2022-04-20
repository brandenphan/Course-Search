const { test, expect } = require('@playwright/test');

// File contains various tests, checking if the Graph Subject page was rendered correctly and functioning


// Goes to the graph subject page before any tests are ran
test.beforeEach(async ({ page }) => {
	await page.goto('http://131.104.49.107/subject');
});

// Tests if the main header "Search for Degrees to graph" was rendered
test('Main header should contain "Search for Subjects to graph"', async ({ page }) => {
    await expect(page.locator('h5').nth(0)).toContainText('Search for Subjects to graph:');
});

test.describe.parallel('Graph subjects by fill in the text box', () => {
    //test make uog graph subject cis
    test('Test make UOG subject graph', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=University of Guelph').click();
        await page.locator('input[role="combobox"]').click();
        // Fill input[role="combobox"]
        await page.locator('input[role="combobox"]').fill('cis');
        await page.locator('text=CIS').click();
        await page.locator('main button:has-text("Search")').click();
        // take a screenshot of the graph
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UOGsubject_CIS.png' });
        //make uog subject graph acct
        //await page.locator('[aria-label="Clear"]').click();//clear the text
        await page.locator('input[role="combobox"]').click();
        await page.locator('input[role="combobox"]').fill('acct');
        await page.locator('text=ACCT').click();
        await page.locator('main button:has-text("Search")').click();
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UOGsubject_ACCT.png' });
        // //make uog subject graph cis*4650
        //await page.locator('[aria-label="Clear"]').click();
        await page.locator('input[role="combobox"]').click();
        await page.locator('input[role="combobox"]').fill('cis*4650');
        await page.locator('main button:has-text("Search")').click();
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UOGsubject_CIS4650.png' });
    });

    //test make ubc subject anth
    test('Test make UBC subject graph', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=University of British Columbia').click();
        await page.locator('input[role="combobox"]').click();
        await page.locator('input[role="combobox"]').fill('cpsc');
        await page.locator('text=CPSC').click();
        await page.locator('main button:has-text("Search")').click();
        // take a screenshot of the graph
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UBCsubject_CPSC.png' });

    });
});


//Tests dark mode work on the graph subject page
test('Dark mode swich to light mode and switch back', async ({ page }) => {
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph Subjects >> button').first().click();//change to dark mode
    //check the screenshot if change to the dark mode
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/darkmodeSubjectPage.png' });
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph Subjects >> button').first().click();//change back to light mode
    //check the screenshot if change back
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/lightmodeSubjectPage.png' });

});


test.describe.parallel('Graph subjects by suggestive box', () => {
    //test make uog graph subject BIOL
    test('Test make UOG subject graph', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=University of Guelph').click();
        await page.locator('input[role="combobox"]').click();
        await page.locator('text=BIOL').click();
        await page.locator('main button:has-text("Search")').click();
        // take a screenshot of the graph
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UOGsubject_BIOL.png' });
        //check  if colour  changes when click on the course
        await page.locator('text=BIOL*1070').click();
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UOGsubject_BIOL1070drop.png' });
        //make uog subject graph COOP
        //await page.locator('[aria-label="Clear"]').click();//clear the text
        await page.locator('input[role="combobox"]').click();
        await page.locator('text=COOP').click();
        await page.locator('main button:has-text("Search")').click();
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UOGsubject_COOP.png' });
        //check  if colour  changes when click on the course
        await page.locator('text=COOP*1100').click();
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UOGsubject_COOP1100drop.png' });
    });
    //test make ubc subject AHTH
    test('Test make UBC subject graph', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=University of British Columbia').click();
        await page.locator('input[role="combobox"]').click();
        await page.locator('text=ANTH').click();
        await page.locator('main button:has-text("Search")').click();
        // take a screenshot of the graph
        await page.locator('.react-flow__pane').screenshot({ path: './tests/screenshot/UBCsubject_ANTH.png' });
        //check  if colour  changes when click on the course
        await page.locator('text=ANTH*220').click();
        await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsSearch for Subjects to ').screenshot({ path: './tests/screenshot/UBCsubject_ANTH220drop.png' });
    });
});


test('Error checking and clear button if work', async ({ page }) => {
    await page.locator('div[role="button"]:has-text("​")').click();
    await page.locator('text=University of Guelph').click();
    await page.locator('input[role="combobox"]').click();
    await page.locator('input[role="combobox"]').fill('cisss');
    await page.locator('main button:has-text("Search")').click();
    await expect(page.locator('text=No Results found. Check your spelling and try again.')).toContainText('No Results found. Check your spelling and try again.')
    await page.locator('text=Clear').click();
    await page.locator('main button:has-text("Search")').click();
    await expect(page.locator('text=Please choose a school')).toContainText('Please choose a school')

});

 





