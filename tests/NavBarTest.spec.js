const { test, expect } = require('@playwright/test');

// File contains various tests, checking if the NavBar is functioning properly


// Goes to the welcome page
test.beforeEach(async ({ page }) => {
	await page.goto('http://131.104.49.107/');
});

// Tests NavBar search button by clicking on the Search button, checking the link if the page has redirected to the search page
test('Test NavBar Search Button', async ({ page }) => {
	await page.click('text=SEARCH');
	await expect(page).toHaveURL('http://131.104.49.107/search');
});

// Tests NavBar graph degrees button by clicking on it, checking the link if the page has been redirected to the degree page
test('Test NavBar Graph Degrees Button', async ({ page }) => {
	await page.click('text=GRAPH DEGREES');
	await expect(page).toHaveURL('http://131.104.49.107/degree');
});

// Tests NavBar graph subjects button by clicking on it, checking the link if the page has been redirected to the subject page
test('Test NavBar Graph Subjects Button', async ({ page }) => {
	await page.click('text=GRAPH SUBJECTS');
	await expect(page).toHaveURL('http://131.104.49.107/subject');
});

// Tests NavBar welcome page by clicking on the search button and clicking on the welcome button after to see if the page has been redirected to the welcome page
test('Test NavBar Welcome Button', async ({ page }) => {
	await page.click('text=SEARCH');
	await page.click('text=WELCOME');
	await expect(page).toHaveURL('http://131.104.49.107/');
});

// Tests NavBar Logo button by clicking on the graph subjects button and clicking on the logo button after to see if the page has been redirected to the welcome page
test('Test NavBar Logo Button', async ({ page }) => {
	await page.click('text=GRAPH SUBJECTS');
	await page.click('text=TEAM 8: SPRINT 9');
	await expect(page).toHaveURL('http://131.104.49.107/');
});