const request = require('supertest')
const app = require('../src/server/startServer');
import setupRoutes from '../src/server/routes';

setupRoutes(app);

const API_PREFIX = '/v1'

describe('Post Endpoints', () => {
    it('should successfully return fedex and ups quotes', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments/quote`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "10021"
            })
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('sorted_by', "default")
            expect(res.body).toHaveProperty('quotes')
    })
    
    it('should successfully return fedex and ups quotes sorted by price', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments/quote`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "10021",
                "sort_by": "price"
            })
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('sorted_by', "price")
            expect(res.body).toHaveProperty('quotes')
    })
    
    it('should successfully return fedex and ups quotes sorted by speed', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments/quote`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "10021",
                "sort_by": "speed"
            })
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('sorted_by', "speed")
            expect(res.body).toHaveProperty('quotes')
    })

    
    it('should fail to return a quote', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments/quote`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34
            })
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message', "No zip provided.")
    })

    let shipment_1_id = null
    let shipment_2_id = null

    // create new shipments
    it('should create a new fedex shipment', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "11215",
                "fedex_id": "2E872394-55C9-4162-8B6B-2FD03A73771B"
            })
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('newShipment')

        shipment_1_id = res.body.newShipment.id
    })
    
    it('should create a new ups shipment', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "10021",
                "ups_id": "6ef5a85edf9572111b1b4929"
            })
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('newShipment')

        shipment_2_id = res.body.newShipment.id
    })

    it('should fail to create a new shipment', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34
            })
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message', 'No zip provided.')
    })

    it('should fail to create a new shipment', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments`)
            .send({
                "weight": -1,
                "height": -2,
                "length": -1,
                "width": -1
            })
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message')
    })

    it('should fail to create a new fedex shipment', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "0",
                "fedex_id": "2E872394-55C9-4162-8B6B-2FD03A73771B"
            })
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message', 'Invalid fedex_id provided.')
    })
    
    it('should fail to create a new fedex shipment', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "11215",
                "fedex_id": "6ef5a85edf9572111b1b4929"
            })
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message', 'Provided fedex_id does not match shipping details.')
    })

    it('should fail to create a new ups shipment', async () => {
        let res = await request(app)
            .post(`${API_PREFIX}/shipments`)
            .send({
                "weight": 57,
                "height": 45,
                "length": 2,
                "width": 34,
                "zip": "11215",
                "ups_id": "6ef5a85edf9572111b1b4929"
            })
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message', 'Provided ups_id does not match shipping details.')
    })

    // Get shipment details
    it('should retrieve shipment details', async () => {
        let res = await request(app)
            .get(`${API_PREFIX}/shipments/id/${shipment_1_id}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('shipment')
            expect(res.body).toHaveProperty('shipment.id', shipment_1_id)
    })
    
    it('should retrieve shipment details', async () => {
        let res = await request(app)
            .get(`${API_PREFIX}/shipments/id/${shipment_2_id}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('shipment')
            expect(res.body).toHaveProperty('shipment.id', shipment_2_id)
    })
    
    it('should fail to retrieve shipment', async () => {
        let res = await request(app)
            .get(`${API_PREFIX}/shipments/id/some_random_id`)
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message', 'Could not find a shipment for the provided shipment id.')
    })

    // Cancel shipments
    it('should cancel a shipment', async () => {
        let res = await request(app)
            .delete(`${API_PREFIX}/shipments/id/${shipment_1_id}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message', "Shipment successfully deleted.")
    })

    it('should cancel a shipment', async () => {
        let res = await request(app)
            .delete(`${API_PREFIX}/shipments/id/${shipment_2_id}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('message', "Shipment successfully deleted.")
    })
    
    it('should fail to cancel a shipment', async () => {
        let res = await request(app)
            .delete(`${API_PREFIX}/shipments/id/${shipment_1_id}`)
            expect(res.statusCode).toEqual(500)
            expect(res.body).toHaveProperty('success', false)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('error.message', "The provided shipment id could not be found. Please try again.")
    })
})