const { test, expect } = require('@playwright/test');

// File contains various tests, checking if the Search page was rendered correctly and functioning


// Goes to the search page before any tests are ran
test.beforeEach(async ({ page }) => {
	await page.goto('http://131.104.49.107/search');
});

// Tests if the Filters and Current Filters header was rendered
test('Headers should contain "Filters" and "Current Filters"', async ({ page }) => {
    await expect(page.locator('h5').nth(0)).toContainText('Filters');
    await expect(page.locator('h5').nth(1)).toContainText('Current Filters')
});


// // Tests if the Welcome page is online
// test('Testing if the welcome page is online', async ({ page }) => {
// 	await page.goto('http://131.104.49.107/');
// });

//Declares a group of tests that could be run in parallel
test.describe.parallel('search course by filters', () => {
    //Test search course by only one filter season fall
    test('Test search course by only one filter season fall', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();//click filter
        await page.locator('text=Season').click(); //choose season
        await page.locator('label:has-text("Fall")').click();//select fall
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('main >> text=Search').click();//search button
        await page.locator('text=ACCT*3280Name: Auditing IWeight: [0.50]See more >> button').click();//click more button for acct*3280
        //check the course season is matched
        await expect(page.locator('div[role="presentation"]:has-text("ACCT*3280Name: Auditing IWeight: [0.50]Summer and Fall(LEC: 3)Prerequisite(s): A")').nth(1)).toContainText('Fall')
    });

    //Test search course by muilti filter for coursecode cis and courseweight 0.25 ,result is no course match
    test('Test search course by muilti filter for coursecode cis and courseweight 0.25', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();//click filter
        await page.locator('text=Weight').click();
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=0.25').click();
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('div[role="button"]:has-text("Weight")').click();
        await page.locator('text=Course Code').click();
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('cis');
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('main >> text=Search').click();//search button
        await expect(page.locator('[id="__next"] div:has-text("ResultsNo courses match the filters")').nth(3)).toContainText('ResultsNo courses match the filters')
    });

    //Test search course by muilti filter for coursename Auditing and Season winter, the only result is Acct4290
    test('Test search course by muilti filter for coursename Auditing and Season winter', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();//click filter
        await page.locator('text=Season').click(); //choose season
        await page.locator('label:has-text("Winter")').click();//select fall
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('div[role="button"]:has-text("Season")').click();
        await page.locator('text=Course Name').click();
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('Auditing');
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('main >> text=Search').click();//search button
        await expect(page.locator('text=ACCT*4290Name: IT Auditing and Data AnalyticsWeight: [0.50]')).toContainText('IT Auditing and Data Analytics')

    });

});


test.describe.parallel('current filter and clear button', () => {

    //Test Test current filter contains the correct filter and remove filter from current filter
    test('Test current filter contains the correct filter and remove filter from current filter', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();//click filter
        await page.locator('text=Course Code').click();//select course code
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('engg');//fill in the form
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('main >> text=Search').click();//search button
        await page.locator('text=Code:engg').click();
        // Click text=No Filters Added
        await expect(page.locator('text=No Filters Added')).toContainText('No Filters Added')
    });

    //Test if clear button worked
    test('Test if clear button worked', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();//click filter
        await page.locator('text=Season').click(); //choose season
        await page.locator('label:has-text("Winter")').click();//select winter
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('div[role="button"]:has-text("Season")').click();
        await page.locator('text=Weight').click();
        await page.locator('div[role="button"]:has-text("​")').click();
        await page.locator('text=0.5').click();
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('div[role="button"]:has-text("Weight")').click();
        await page.locator('text=Course Code').click();
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('cis');
        await page.locator('button:has-text("Add")').click();//add button
        await page.locator('button:has-text("Clear")').click();//clear button 
        await expect(page.locator('text=No Filters Added')).toContainText('No Filters Added')
    });
});

//use filter coursecode ACCT to test pagination
test('Test pagination', async ({ page }) => {
    await page.locator('div[role="button"]:has-text("​")').click();//click filter
    await page.locator('text=Course Code').click();
    await page.locator('input[type="text"]').click();
    await page.locator('input[type="text"]').fill('acct');
    await page.locator('button:has-text("Add")').click();//add button
    await page.locator('main >> text=Search').click();//search button
    //check if match the first course of page 1
    await expect(page.locator('text=ACCT*1220')).toContainText('ACCT*1220')
    //go to page 2
    await page.locator('[aria-label="Go to page 2"]').click();
    //check if match the first course of page 2
    await expect(page.locator('text=ACCT*4270')).toContainText('ACCT*4270')


});

//Test of error checking work
test.describe.parallel('Test Error Checking', () => {
    test('Error checking for weight and season', async ({ page }) => {
        //check weight
        await page.locator('div[role="button"]:has-text("​")').click();
    // Click text=Weight
        await page.locator('text=Weight').click();
    // Click div[role="button"]:has-text("​")
        await page.locator('div[role="button"]:has-text("​")').click();
    // Click text=0.75
        await page.locator('text=0.75').click();
     // Click button:has-text("Add")
        await page.locator('button:has-text("Add")').click();
        await page.locator('div[role="button"]:has-text("​")').click();
    // Click li[role="option"]:has-text("0.75")
        await page.locator('li[role="option"]:has-text("0.75")').click();
    // Click text=Add
        await page.locator('text=Add').click();
    // Click text=This weight is already in the filters
        await expect(page.locator('text=This weight is already in the filters')).toContainText('This weight is already in the filters')
     //check Season
        await page.locator('div[role="button"]:has-text("Weight")').click();
        await page.locator('text=Season').click();
        await page.locator('text=Fall').click();
        await page.locator('button:has-text("Add")').click();
        await page.locator('div[role="radiogroup"] >> text=Fall').click();
        await page.locator('text=Add').click();
        await expect(page.locator('text=This season is already in the filters')).toContainText('This season is already in the filters')
    });

    test('Error checking for course code and course name', async ({ page }) => {
        await page.locator('div[role="button"]:has-text("​")').click();
        // Click text=Weight
        await page.locator('text=Course Code').click();
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('stat');
        await page.locator('button:has-text("Add")').click();
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('stat');
        await page.locator('button:has-text("Add")').click();
        await expect(page.locator('text=The course code is already in the filters')).toContainText('The course code is already in the filters')
        await page.locator('div[role="button"]:has-text("Course Code")').click();
        await page.locator('text=Course Name').click();
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('Statistics I');
        await page.locator('text=Add').click();
        await page.locator('input[type="text"]').click();
        await page.locator('input[type="text"]').fill('Statistics I');
        await page.locator('text=Add').click();
        await expect(page.locator('text=This course name is already in the filters')).toContainText('This course name is already in the filters')

    });

});

//Tests dark mode work on the search page
test('Search Page:Dark mode swich to light mode and switch back', async ({ page }) => {
    await page.locator('button').first().click();//change to dark mode
    //check the screenshot if change to the dark mode
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsFiltersFilters:​Filters').screenshot({ path: './tests/screenshot/darkmodeSearch.png' });
    await page.locator('button').first().click();//change back to light mode
    //check the screenshot if change back
    await page.locator('text=Team 8: Sprint 9 WelcomeSearchGraph DegreesGraph SubjectsFiltersFilters:​Filters').screenshot({ path: './tests/screenshot/lightmodeSearch.png' });

});
