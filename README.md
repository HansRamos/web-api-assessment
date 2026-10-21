Web and API Automation Assessment:
Playwright Test with TypeScript for Cheapflights UI and Restful Booker API testing.

Setup:
Install Node.js with npm, then run:
    npm ci
    npx playwright install chromium


Run tests:
    All tests: npm test
    Chromium UI tests: npm run test:ui
    API Tests: npm run test:api
    Latest Report: npm run report

Coverage:
    Homepage logo/sign-in visibility and header placement.
    Return-flight search, result information, and missing-destination validation.
    Positive and negative booking creation, retrieval, update, and deletion.
    API response fields and verification of persisted or unchanged data.

Test report:
https://web-api-test-report.pages.dev/