import type { Locator, Page } from '@playwright/test';

export class FlightResultsPage{
    readonly page: Page;
    readonly flightCards: Locator;
    readonly outboundJourney : Locator;
    readonly inboundJourney: Locator;
    readonly priceText: Locator;

    constructor(page: Page){
        this.page = page;

        this.flightCards = page.getByRole('group', {
            name: /^Result item \d+$/,
        }).filter({has: page.getByRole('link', {
                name: 'Select',
                exact: true
            }),
        });

        const firstCard = this.flightCards.first();
        const journeys = firstCard.getByRole('listitem');

        this.outboundJourney = journeys.nth(0);

        this.inboundJourney = journeys.nth(1);

        this.priceText = firstCard.getByText(/^\$[\d,]+$/);
    }
}