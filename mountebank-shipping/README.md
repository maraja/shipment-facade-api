# Shipping Service Mocks

This repository contains shipping service mocks running with [Mountebank](http://www.mbtest.org/).

## How to Run

Check out the repository:

```
git clone https://github.com/gzurowski/mountebank-shipping.git
```

Change into the repository directory:

```
cd mountebank-shipping
```

Run the following Docker command:

```
docker run --rm \
  --volume=$(pwd):/mocks \
  -p 2525:2525 \
  -p 8080:8080 \
  -p 9090:9090 \
  bbyars/mountebank:2.2.1 \
  mb start --configfile /mocks/config.ejs
```

## How to Use

The above command runs the following service mocks:

| Provider | Port                          | Description               |
| -------- | ----------------------------- | ------------------------- |
| UPS      | [8080](http://localhost:8080) | A JSON based service mock |
| FedEx    | [9090](http://localhost:9090) | An XML based service mock |


Both services return canned responses with some sample rates when matching the zip codes 10021 and 11215 in the input message.
Please note that the `zip` attribute can be anywhere in the payload.
A default empty response (indicating no rates) is returned by default.

Additional information about the mocks can be access on [port 2525](http://localhost:2525/imposters).

## Examples

### UPS (JSON)

Request rates:

```
curl -i -X POST http://localhost:8080/ -d '{"zip":"10021"}'
```

There is no strict schema for the input message format.
To get a canned response it has to be valid JSON though:

```
curl -i -X POST http://localhost:8080/ -d '{
    "destination": {
        "street": "214 6th St",
        "city": "Brooklyn",
        "state": "NY",
        "zip": "11215"
    }
}'
```

The above commands return some canned JSON responses with dummy rates:

- zip `10021` returns [this message](ups/stub2-payload.json)
- zip `11215` returns [this message](ups/stub1-payload.json)

If the provided zip code does not match `10021` or `11215`, the following default message is returned:

```json
{
  "shipping": [
    {
      "origin_zip": "00000",
      "rates": []
    }
  ],
  "timestamp": 1593157726999
}
```

### FedEx (XML)

Request rates:

```
curl -i -X POST http://localhost:9090/ -d '<zip>10021</zip>
```

There is no strict schema for the input message format.
To get a canned response it has to be valid XML:

```
curl -i -X POST http://localhost:9090/ -d '<?xml version="1.0" encoding="UTF-8" ?>
<ship>
    <origin>
        <address>
            <street>214 6th St</street>
            <city>Brooklyn</city>
            <state>NY</state>
            <zip>11215</zip>
        <address>
    </origin>
</ship>'
```

The above commands return some canned XML responses with dummy rates:

- zip `10021` returns [this message](fedex/stub2-payload.xml)
- zip `11215` returns [this message](fedex/stub1-payload.xml)

If the provided zip code does not match `10021` or `11215`, the following default message is returned:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<ship>
    <rates/>
</ship>
```