import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
    readonly page: Page;

    //Header variables
    readonly signInButton: Locator;
    readonly logoLink: Locator;
    readonly header: Locator;

    //Trip Type dropdown variables
    readonly tripTypeSelector: Locator;
    readonly tripTypeOptions: Locator;

    //Flight search origin variables
    readonly originField: Locator;
    readonly originRemoveButton: Locator;
    readonly originInput: Locator;
    readonly originSuggestions: Locator;

    //Flight search destination variables
    readonly destinationField: Locator;
    readonly destinationRemoveButton: Locator;
    readonly destinationInput: Locator;
    readonly destinationSuggestions: Locator;

    //Travellers control variable
    readonly travellersControl: Locator;

    //Search button variable
    readonly searchButton: Locator;

    //Date variables
    readonly departureCalendar: Locator;
    readonly departureDateButton: Locator;
    readonly returnDateButton: Locator;
    readonly nextMonthButton: Locator;

    //Checkboxes
    readonly palComparisonCheckbox: Locator;
    readonly directFlightsCheckbox: Locator;

    //Missing Airport Modal
    readonly missingAirportModal: Locator;

    constructor(page: Page){
        this.page = page;

        //Header locators
        this.signInButton = page.getByRole('button', {
            name: 'Sign in',
            exact: true
        });

        this.logoLink = page.getByRole('link', {
            name: 'Go to the cheapflights homepage',
            exact: true
        });

        this.header = page.getByRole('banner');

        //Flight search locators
        this.tripTypeSelector = page.getByRole('combobox', {
            name: /^Trip type /,
        });

        this.tripTypeOptions = page.locator('[id="flight-trip-type-dropdown"]');

        this.originField = page.locator('[aria-label="Flight origin input"]');

        this.destinationField = page.locator('[aria-label="Flight destination input"]');

        this.originRemoveButton = this.originField.getByRole('button', {
            name: 'Remove value',
            exact: true
        });

        this.destinationRemoveButton = this.destinationField.getByRole('button', {
            name: 'Remove value',
            exact: true
        });

        this.originInput = page.locator('input[role="combobox"][aria-controls="flight-origin-smarty-input-list"]');

        this.destinationInput = page.locator('input[data-test-destination]');

        this.originSuggestions = page.locator('[id="flight-origin-smarty-input-list"]');

        this.destinationSuggestions = page.locator('[id="flight-destination-smarty-input-list"]');

        this.departureCalendar = page.locator('div[aria-label="Departure date"]').filter({has: page.getByRole('grid')});

        this.departureDateButton = page.getByRole('button', {
            name: 'Departure date',
            exact: true
        });

        this.returnDateButton = page.getByRole('button', {
            name: 'Return date',
            exact: true
        });

        this.nextMonthButton = page.getByRole('button', {
            name: 'Next month',
            exact: true
        });

        this.travellersControl = page.locator('[id="ffd-traveler-type-handle"]');

        this.searchButton = page.getByRole('button', {
            name: 'Search',
            exact: true
        });

        this.palComparisonCheckbox = page.getByRole('checkbox', {
            name: 'Philippine Airlines',
            exact: true
        });
                
        this.directFlightsCheckbox = page.getByRole('checkbox', {
            name: 'Direct flights only',
            exact: true
        });

        this.missingAirportModal = page.getByRole('dialog').getByText("You didn't select an airport");

    }


//PAGE METHODS START HERE
    //Method to return an airport suggestion locator by accessible name for origin
    originOption(name: string): Locator {
        return this.originSuggestions.getByRole('option', {
            name,
            exact: true
        });
    }

    //Method to return an airport suggestion locator by accessible name for destination
    destinationOption(name: string): Locator {
        return this.destinationSuggestions.getByRole('option', {
            name,
            exact: true
        });
    }

    //Method to return the locator of whichever trip type we use in the test
    tripTypeOption(name: string): Locator {
        return this.tripTypeOptions.getByRole('option', {
            name,
            exact: true
        });
    }

    //Method to return the locator of a selected date in the date picker
    dateOption(date: Date): Locator {
        const label = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).replace(',','');

        return this.page.getByRole('button', {
            name: new RegExp(`^${label}(?:\\s|$)`)
        });
    }

    //Method to get the locator for combined date range
    selectedDateRange(departure: Date, returnDate: Date): Locator{
        const format = (date: Date): string => date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        })

        return this.destinationField.getByRole('button', {
            name: `${format(departure)} - ${format(returnDate)}`,
            exact: true
        });
    }

    //Method to select a trip type
    async selectTripType(name: string): Promise<void>{
        const currentSelection = await this.tripTypeSelector.getAttribute('aria-label');

        if(currentSelection === `Trip type ${name}`){
            return;
        }

        await this.tripTypeSelector.click();
        await this.tripTypeOption(name).click();
    }

    //Method to select an Origin
    async selectOrigin(searchText: string, optionName: string): Promise<void>{
        if(await this.originRemoveButton.isVisible()){
            await this.originRemoveButton.click();
        }
        await this.originInput.fill(searchText);
        await this.originOption(optionName).click();
    };

    //Method to select a destination
    async selectDestination(searchText: string, optionName: string): Promise<void>{
        if(await this.destinationRemoveButton.isVisible()){
            await this.destinationRemoveButton.click();
        }
        await this.destinationInput.fill(searchText);
        
        await expect(this.destinationInput).toHaveAttribute('aria-controls', /.+/);

        const listId = await this.destinationInput.getAttribute('aria-controls');

        if(!listId){
            throw new Error('Destination suggestion list is not identified');
        }

        await this.page.locator(`[id="${listId}"]`).getByRole('option', {
            name: optionName,
            exact: false
        }).click();
    };

    //Method to select travel dates
    async selectTravelDates(departureDate: Date, returnDate: Date): Promise<void>{
        if(!(await this.departureCalendar.isVisible())){
            await this.departureDateButton.click();
        }
        await this.dateOption(departureDate).click();
        await this.dateOption(returnDate).click();
    };

    //Method to disable pal comparison
    async disableAirlineComparison(): Promise<void>{
        if(await this.palComparisonCheckbox.isVisible()){
            await this.palComparisonCheckbox.setChecked(false);
        }
    }

    //Method to submit Flight search
    async submitSearch(): Promise<Page> {
    const context = this.page.context();

    await this.searchButton.click();

    await expect.poll(() => {
        return context.pages().some(tab =>
            tab.url().startsWith(
                'https://www.cheapflights.com.au/flight-search/'
            )
        );
        }, {
            timeout: 15_000,
            message: 'Cheapflights results should open in a browser tab',
        }).toBe(true);

        const resultsTab = context.pages().find(tab =>
            tab.url().startsWith(
                'https://www.cheapflights.com.au/flight-search/'
            )
        );

        if (!resultsTab) {
            throw new Error('Cheapflights results tab was not found');
        }

        return resultsTab;
    }

    //Method to click search
    async clickSearch(): Promise<void>{
        await this.searchButton.click();
    }

    //Method to load homepage
    async goto(){
        await this.page.goto('https://www.cheapflights.com.au/');
    }
}