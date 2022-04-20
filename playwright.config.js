// Sets the playwright config test directory to "./tests" and ignores HTTPSErrors as the server does not have a SSL certificate
const config = {
    testDir: "./tests",
    ignoreHTTPSErrors: true,
    reporter: './custom-reporter.ts',
}

module.exports = config;
