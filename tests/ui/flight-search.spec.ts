import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homepage.page';
import { FlightResultsPage } from '../../pages/flight-results.page';

test.describe('Flight Search', () => {
    let homePage: HomePage;

    //Variables to set the departure date 30 days from current day, and return date 7 days after departure date
    const departureDate = new Date();
    departureDate.setHours(12, 0, 0, 0);
    departureDate.setDate(departureDate.getDate() + 30);

    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);

    //Use a consistent desktop viewport
    test.use({
        viewport: {width: 1280, height: 720},
    });

    //Hook for loading the homepage
    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.goto();
    });

    test('search for return flights with valid journey details', async() => {
        //Page interactions
        await homePage.selectTripType('Return');

        await homePage.selectOrigin('Manila', 'Manila, Philippines');
        await homePage.selectDestination('Boracay', 'Boracay, Philippines');

        await homePage.selectTravelDates(departureDate, returnDate);

        await homePage.disableAirlineComparison();

        //Assertions
        await expect(homePage.tripTypeSelector).toHaveAccessibleName('Trip type Return');
        await expect(homePage.originField).toContainText('MNL');
        await expect(homePage.destinationField).toContainText('MPH');

        if(await homePage.departureDateButton.isVisible()){
            await expect(homePage.departureDateButton).toContainText(`${departureDate.getDate()}/${departureDate.getMonth() + 1}`);
            await expect(homePage.returnDateButton).toContainText(`${returnDate.getDate()}/${returnDate.getMonth() + 1}`);
        }
        else{
            await expect(homePage.selectedDateRange(departureDate, returnDate)).toBeVisible();
        }


        //Submit then verify the results tab contains the correct URL
        const resultsTab = await homePage.submitSearch();
        await expect(resultsTab).toHaveURL(/\/flight-search\/MNL-MPH\//);

        //Verify that flight results page generate a flight card
        const flightResultsPage = new FlightResultsPage(resultsTab);
        const firstFlightCard = flightResultsPage.flightCards.first();
        await expect(firstFlightCard).toBeVisible({timeout: 15_000});

        //Verify that the first flight card contains the correct details
        await expect(firstFlightCard).toContainText('MNL');
        await expect(firstFlightCard).toContainText('MPH');

        //Verify that flight cards include outbound and inbound journeys as well as price
        await expect(flightResultsPage.outboundJourney).toContainText(/MNL[\s\S]*MPH/);
        await expect(flightResultsPage.inboundJourney).toContainText(/MPH[\s\S]*MNL/);
        await expect(flightResultsPage.priceText).toBeVisible();
    });

    test('search for return flights with no destination airport', async() => {
        //Page interactions
        await homePage.selectTripType('Return');
        await homePage.selectOrigin('Manila', 'Manila, Philippines');
        await homePage.selectTravelDates(departureDate, returnDate);
        await homePage.disableAirlineComparison();

        // Verify setup before opening the modal.
        await expect(homePage.tripTypeSelector).toHaveAccessibleName('Trip type Return');
        await expect(homePage.originField).toContainText('MNL');

        await homePage.clickSearch();

        // Verify the validation outcome.
        await expect(homePage.missingAirportModal).toBeVisible();
    });
});