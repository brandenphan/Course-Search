const { test } = require('@playwright/test');

// File that tests if all the website pages are currently online


// Tests if the welcome page is currently online by going to the link
test('Test if the welcome page is online', async ({ page }) => {
	await page.goto('http://131.104.49.107/');
});


// Tests if the search page is currently online by going to the link
test('Test if the search page is online', async ({ page }) => {
	await page.goto('http://131.104.49.107/search');
});


// Tests if the graph degree page is currently online by going to the link
test('Test if the graph degree page is online', async ({ page }) => {
	await page.goto('http://131.104.49.107/degree');
});


// Tests if the graph subject page is currently online by going to the link
test('Test if the graph subject page is online', async ({ page }) => {
	await page.goto('http://131.104.49.107/subject');
});