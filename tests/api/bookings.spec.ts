import { test, expect } from '@playwright/test';

test.describe('Bookings API', () => {

    //POST
    test.describe('POST - Create booking', () => {

        //Positive
        test('create a booking with valid details', async ({request}) => {
        const payload = {
            firstname: 'Perla',
            lastname: 'Cruz',
            totalprice: 150,
            depositpaid: true,
            bookingdates: {
                checkin: '2026-11-12',
                checkout: '2026-11-19',
            },
            additionalneeds: 'Breakfast',
        };

            const responsePost = await request.post('https://restful-booker.herokuapp.com/booking', {
                data: payload
            });

            expect(responsePost.status()).toBe(200);

            const body = await responsePost.json();

            //POST Assertions after successful creation of booking id
            expect(body.bookingid).toEqual(expect.any(Number));
            expect(body.booking).toEqual(payload);
        });

        //Negative
        test('returns 500 then a field is missing', async ({request}) => {
        const payload = {
            lastname: 'Cruz',
            totalprice: 150,
            depositpaid: true,
            bookingdates: {
                checkin: '2026-11-12',
                checkout: '2026-11-19',
            },
            additionalneeds: 'Breakfast',
        };

        const responsePost = await request.post('https://restful-booker.herokuapp.com/booking', {
            data: payload
        });

        //POST Assertions after failed creation of booking using a payload with missing details
        expect(responsePost.status()).toBe(500);
        expect(await responsePost.text()).toBe('Internal Server Error');
        });
    });

    //GET
    test.describe('GET - retrieve booking', () => {
        //Positive
        test('get booking details with a valid id', async({request}) => {
            const newPayload = {
                firstname: 'Perla',
                lastname: 'Cruz',
                totalprice: 150,
                depositpaid: false,
                bookingdates: {
                    checkin: '2026-11-12',
                    checkout: '2026-11-19',
                },
                additionalneeds: 'Lunch',
            };

            //Create a new post and save the id
            const responsePost = await request.post('https://restful-booker.herokuapp.com/booking', {
                data: newPayload,
            });

            expect(responsePost.status()).toBe(200);

            const createdBooking = await responsePost.json();
            const bookingId = createdBooking.bookingid;

            const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);

            expect(responseGet.status()).toBe(200);
            const body = await responseGet.json();

            //GET Assertions after successful creation of booking id
            expect(body).toEqual(newPayload);
        });

        //Negative
        test('returns 404 for a nonexistent booking id', async ({request}) => {
            const responseGet = await request.get('https://restful-booker.herokuapp.com/booking/99999');

            //GET Assertions for an invalid booking id
            expect(responseGet.status()).toBe(404);
            expect(await responseGet.text()).toBe('Not Found');
        });
    });

    //PUT
    test.describe('PUT - update booking', () => {
        //Positive
        test('update booking with a valid id', async({request}) => {
            const newPayload = {
                firstname: 'Hans',
                lastname: 'Ramos',
                totalprice: 150,
                depositpaid: false,
                bookingdates: {
                    checkin: '2026-11-12',
                    checkout: '2026-11-19',
                },
                additionalneeds: 'Lunch',
            };

            const updatePayload = {
                firstname: 'Updated',
                lastname: 'Updated',
                totalprice: 250,
                depositpaid: true,
                bookingdates: {
                    checkin: '2026-12-13',
                    checkout: '2026-12-19',
                },
                additionalneeds: 'Lunch',
            };

            //Create a new post and save the id
            const responsePost = await request.post('https://restful-booker.herokuapp.com/booking', {
                data: newPayload,
            })

            expect(responsePost.status()).toBe(200);

            const createdBooking = await responsePost.json();
            const bookingId = createdBooking.bookingid;

            //Use the generated ID for put request
            const responsePut = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
                headers: {
                    Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=',
                    Accept: 'application/json'
                },
                data: updatePayload
            });

            expect(responsePut.status()).toBe(200);
            const updatedResponseBody = await responsePut.json();

            //PUT Assertions after successful creation of booking id
            expect(updatedResponseBody).toEqual(updatePayload);

            //Check that the updated booking is saved
            const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
            expect(responseGet.status()).toBe(200);
            const savedBooking = await responseGet.json();
            expect(savedBooking).toEqual(updatePayload);
        });

        //Negative
        test('rejects an update without authorization', async({request}) => {
            const newPayload = {
                firstname: 'Hans',
                lastname: 'Ramos',
                totalprice: 150,
                depositpaid: false,
                bookingdates: {
                    checkin: '2026-11-12',
                    checkout: '2026-11-19',
                },
                additionalneeds: 'Lunch',
            };

            const updatePayload = {
                firstname: 'Updated',
                lastname: 'Updated',
                totalprice: 250,
                depositpaid: true,
                bookingdates: {
                    checkin: '2026-12-13',
                    checkout: '2026-12-19',
                },
                additionalneeds: 'Lunch',
            };

            //Create a new post and save the id
            const responsePost = await request.post('https://restful-booker.herokuapp.com/booking', {
                data: newPayload,
            })

            expect(responsePost.status()).toBe(200);

            const createdBooking = await responsePost.json();
            const bookingId = createdBooking.bookingid;

            //Use the generated ID for put request
            const responsePut = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
                headers: {
                    Accept: 'application/json'
                },
                data: updatePayload
            });

            //Check that the attempted update without authorization failed
            expect(responsePut.status()).toBe(403);
            expect(await responsePut.text()).toBe('Forbidden');

            const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);

            //Check that the update is not saved
            expect(responseGet.status()).toBe(200);
            expect(await responseGet.json()).toEqual(newPayload);
        });
    });

    //DELETE
    test.describe('DELETE - delete a booking', () => {
        //Positive
        test('delete a booking with a valid id', async({request}) => {
            const newPayload = {
                firstname: 'Perla',
                lastname: 'Cruz',
                totalprice: 150,
                depositpaid: false,
                bookingdates: {
                    checkin: '2026-11-12',
                    checkout: '2026-11-19',
                },
                additionalneeds: 'Lunch',
            };

            //Create a new post and save the id
            const responsePost = await request.post('https://restful-booker.herokuapp.com/booking', {
                data: newPayload,
            });

            expect(responsePost.status()).toBe(200);

            const createdBooking = await responsePost.json();
            const bookingId = createdBooking.bookingid;

            //Delete the newly created booking
            const responseDelete = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
                headers: {
                    Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM='
                }
            });

            //DELETE Assertions after successful creation of booking id
            expect(responseDelete.status()).toBe(201);
            expect(await responseDelete.text()).toBe('Created');

            //Check that the deleted booking id cannot be found
            const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
            expect(responseGet.status()).toBe(404);
            expect(await responseGet.text()).toBe('Not Found');
        });

        //Negative
        test('rejects deletion of a booking without authorization', async({request}) => {
             const newPayload = {
                firstname: 'Perla',
                lastname: 'Cruz',
                totalprice: 150,
                depositpaid: false,
                bookingdates: {
                    checkin: '2026-11-12',
                    checkout: '2026-11-19',
                },
                additionalneeds: 'Lunch',
            };

            //Create a new post and save the id
            const responsePost = await request.post('https://restful-booker.herokuapp.com/booking', {
                data: newPayload,
            })

            expect(responsePost.status()).toBe(200);

            const createdBooking = await responsePost.json();
            const bookingId = createdBooking.bookingid;

            //Attempt deletion without auth
            const responseDelete = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`);

            //Verify that the delete is not allowed
            expect(responseDelete.status()).toBe(403);
            expect(await responseDelete.text()).toBe('Forbidden');

            //Verify that the booking is unchanged
            const responseGet = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
            expect(responseGet.status()).toBe(200);
            expect(await responseGet.json()).toEqual(newPayload);
        })
    });
});