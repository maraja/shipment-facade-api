import db from "#root/db";
import generateUUID from "#root/helpers/generateUUID";

import got from 'got';
import accessEnv from "#root/helpers/accessEnv";
import moment from 'moment';

const promisify = require('util').promisify;
const xml2js = require('xml2js')
let parseXMLtoJSON = promisify(new xml2js.Parser({
    mergeAttrs: true,
    explicitArray: false,
    parseNumbers: true,
    parseBooleans: true
}).parseString)

const { Shipment, FedEx, UPS, Origin, Destination } = db;

const UPS_URI = accessEnv("UPS_URI");
const FEDEX_URI = accessEnv("FEDEX_URI");


const getShipment = async (req, res, next) => {
    const { shipment_id } = req.params;

    if (!shipment_id) throw Error("No shipping id provided.")

    try {
    
        let shipment = await Shipment.findByPk(shipment_id, {
            subQuery: false,
            include: [
                {
                    model: UPS,
                    as: 'upsShipment'
                },
                {
                    model: FedEx,
                    as: 'fedexShipment'
                }
            ],
            // the following two will flatten and spit out only a json
            nest: true,
        });

        if (!shipment) throw Error("Could not find a shipment for the provided shipment id.")

        return res.json({
            success: true,
            message: "Shipment retrieved.",
            shipment
        });
    } catch (e) {
        return next(e);
    }
}

// get shipment quotes from fedex and ups
const getShipmentQuote = async (req, res, next) => {
    if (!req.body) return next(new Error("Invalid body!"));

    const SORTABLE_VALUES = ['price', 'speed'] 

    // assign all the provided variables
    const { 
        height, 
        length, 
        width, 
        weight, 
        zip, 
        sort_by } = req.body;

        
    const {
        first_name: origin_first_name, 
        last_name: origin_last_name, 
        street_line_one: origin_street_line_one, 
        city: origin_city, 
        state: origin_state, 
        zip: origin_zip } = req.body.origin

    const {
        first_name: destination_first_name, 
        last_name: destination_last_name, 
        street_line_one: destination_street_line_one, 
        city: destination_city, 
        state: destination_state, 
        zip: destination_zip } = req.body.destination


    try {
        // throw an error if the provided zip is falsey.
        if (!!!origin_zip) throw Error("No zip provided.")
        if (sort_by && !SORTABLE_VALUES.includes(sort_by)) throw Error("sort_by value provided not supported.")

        // craft the fedex xml request.
        const fedex_xml = `
            <ship>
                <origin>
                    <address>
                        ${origin_street_line_one ? `<street>${origin_street_line_one}</street>` : ``}
                        ${origin_city ? `<city>${origin_city}</city>` : ``}
                        ${origin_state ? `<state>${origin_state}</state>` : ``}
                        ${origin_zip ? `<zip>${origin_zip}</zip>` : ``}
                    </address>
                </origin>
            </ship>
        `

        // send the ups and fedex calls.
        // Note: this is not currently optimized. With a proper promise call, we can have these calls
        // run concurrently instead of subsequently.
        const upsResponse = await got.post(UPS_URI, { json: { origin_zip } }).json()
        const fedexResponse = await got.post(FEDEX_URI, { 
            headers: {'Content-Type': 'text/xml'}, 
            body: fedex_xml
        })

        // parse the fedex response to json to make it easier to work with.
        let fedexJSONResponse = await parseXMLtoJSON(fedexResponse.body)

        let ups_rates = upsResponse.shipping[0].rates
        let fedex_rates = fedexJSONResponse.ship.rates.rate.map(r => { return { ...r, price: parseFloat(r.price)} })

        if (sort_by == "price") {
            ups_rates.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            fedex_rates.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sort_by == "speed") {
            ups_rates.sort((a, b) => parseTimeline(a.carrier.approx_delivery) - parseTimeline(b.carrier.approx_delivery));
            fedex_rates.sort((a, b) => parseTimeline(a.carrier.delivery) - parseTimeline(b.carrier.delivery));
        }

        return res.json({
            success: true,
            message: "Quotes retrieved.",
            sorted_by: sort_by || "default",
            quotes: {
                fedex: fedex_rates,
                ups: ups_rates
            }, 
            height, length, width, weight
        });
    } catch (e) {
        // console.log(e)
        return next(e);
    }
}

// create a new shipment
const postShipment = async (req, res, next) => {
    if (!req.body) return next(new Error("Invalid body!"));

    // assign all the provided variables
    const { 
        height, 
        length, 
        width, 
        weight, 
        fedex_id, 
        ups_id } = req.body;

    const {
        first_name: origin_first_name, 
        last_name: origin_last_name, 
        street_line_one: origin_street_line_one, 
        city: origin_city, 
        state: origin_state, 
        zip: origin_zip } = req.body.origin

    const {
        first_name: destination_first_name, 
        last_name: destination_last_name, 
        street_line_one: destination_street_line_one, 
        city: destination_city, 
        state: destination_state, 
        zip: destination_zip } = req.body.destination

    let newShipment = null
    let newUPSDetails = null
    let newFedexDetails = null
    let include = []

    try {
        // check if the zip is falsey
        if (!!!origin_zip) throw Error("No zip provided.")

        if (!ups_id && !fedex_id) throw Error("No shipping id provided.")

        // start the verification and shipping POST based on provided id.
        if (fedex_id) {
            const fedex_xml = `
                <ship>
                    <origin>
                        <address>
                            ${origin_street_line_one ? `<street>${origin_street_line_one}</street>` : ``}
                            ${origin_city ? `<city>${origin_city}</city>` : ``}
                            ${origin_state ? `<state>${origin_state}</state>` : ``}
                            ${origin_zip ? `<zip>${origin_zip}</zip>` : ``}
                        </address>
                    </origin>
                </ship>
            `
            const fedexResponse = await got.post(FEDEX_URI, { 
                headers: {'Content-Type': 'text/xml'}, 
                body: fedex_xml
            })
    
            let fedexJSONResponse = await parseXMLtoJSON(fedexResponse.body)

            // if no rates are returned, throw an error.
            if (fedexJSONResponse.ship.rates == "") throw Error("Invalid fedex_id provided.")

            // if the provided fedex_id does not match the returned quotes, throw an error.
            if (!fedexJSONResponse.ship.rates.rate.map(r => r.id).includes(fedex_id)) throw Error("Provided fedex_id does not match shipping details.")

            // retrieve the exact fedex shipping details based on provided id
            const fedexShippingDetails = fedexJSONResponse.ship.rates.rate.filter(r => r.id == fedex_id)[0]
        
            // start assigning variables.
            const { price, serviceType: service_type } = fedexShippingDetails
            const { serviceLevel: service_level, delivery, description } = fedexShippingDetails.carrier

            // create the shipment and the fedex details
            newShipment = await Shipment.create({
                id: generateUUID(),
                weight, height, width, length
            })

            newFedexDetails = await FedEx.create({
                id: generateUUID(),
                shipmentId: newShipment.id, 
                fedexId: fedexShippingDetails.id,
                price: parseFloat(price), service_type, service_level, delivery, description
            })

            // add the fedex table into the include statement to query later.
            include.push({
                model: FedEx,
                as: 'fedexShipment'
            })

        } else if (ups_id) {
            const upsResponse = await got.post(UPS_URI, { json: { origin_zip } }).json()

            // if no rates are returned, throw an error.
            if (upsResponse.shipping[0].rates.length == 0) throw Error("Invalid ups_id provided.")

            // if the provided ups_id does not match the returned quotes, throw an error.
            if (!upsResponse.shipping[0].rates.map(r => r.id).includes(ups_id)) throw Error("Provided ups_id does not match shipping details.")
        
            // retrieve the exact ups shipping details based on provided id
            const upsShippingDetails = upsResponse.shipping[0].rates.filter(r => r.id == ups_id)[0]

            // start assigning variables.
            const { price, provider_type, service_type } = upsShippingDetails
            const { service_level, approx_delivery, description } = upsShippingDetails.carrier

            // create the shipment and the fedex details
            newShipment = await Shipment.create({
                id: generateUUID(),
                weight, height, width, length
            })

            newUPSDetails = await UPS.create({
                id: generateUUID(),
                shipmentId: newShipment.id, 
                upsId: upsShippingDetails.id,
                price, provider_type, service_type, service_level, approx_delivery, description
            })

            // add the fedex table into the include statement to query later.
            include.push({
                model: UPS,
                as: 'upsShipment'
            })

        } 
            
        let newOrigin = await Origin.create({
            id: generateUUID(),
            shipmentId: newShipment.id, 
            first_name: origin_first_name, 
            last_name: origin_last_name, 
            street_line_one: origin_street_line_one, 
            city: origin_city, 
            state: origin_state, 
            zip: origin_zip
        })

        let newDestination = await Destination.create({
            id: generateUUID(),
            shipmentId: newShipment.id, 
            first_name: destination_first_name, 
            last_name: destination_last_name, 
            street_line_one: destination_street_line_one, 
            city: destination_city, 
            state: destination_state, 
            zip: destination_zip
        })

        include.push({
            model: Origin,
            as: 'shippingOrigin'
        })
        
        include.push({
            model: Destination,
            as: 'shippingDestination'
        })
        
        newShipment = await Shipment.findByPk(newShipment.id, {
            subQuery: false,
            include,
            // the following two will flatten and spit out only a json
            nest: true,
        });
        
        return res.json({
            success: true,
            message: "Shipment created.",
            newShipment
        });
    } catch (e) {
        return next(e);
    }
}

// delete a shipment
const cancelShipment = async (req, res, next) => {
    const { shipment_id: id } = req.params;

    if (!id) throw Error("No shipping id provided.")

    try {    
        let shipment = await Shipment.destroy({ where: { id } });
        if (!!!shipment) throw Error("The provided shipment id could not be found. Please try again.")

        await UPS.destroy({ where: { shipmentId: id } })
        await FedEx.destroy({ where: { shipmentId: id } })


        return res.json({
            success: true,
            message: "Shipment successfully deleted.",
        });
    } catch (e) {
        return next(e);
    }
}


export default {
    postShipment,
    cancelShipment,
    getShipment,
    getShipmentQuote
};


// HELPERS

// helper function to parse the textual delivery time given by the fedex and ups quotes
const parseTimeline = text => {
    text = text.replace(/[{()}]/g, '');

    let numbers = text.match(/\d+/g); 

    let hours = 0

    if (text.includes("Hour")){
        let sum = 0
        numbers.forEach(num => sum += num*1)
        hours = sum/numbers.length 

    } else if (text.includes("Day")){
        let sum = 0
        numbers.forEach(num => sum += num*24)
        hours = sum/numbers.length 

    } else if (text.includes("Week")) {
        let sum = 0
        numbers.forEach(num => sum += num*168)
        hours = sum/numbers.length 

    } else if (text.includes("Month")) {
        let sum = 0
        numbers.forEach(num => sum += num*720)
        hours = sum/numbers.length 
    }

    return hours
}