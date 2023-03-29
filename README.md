# PizzaStore

This is a demo application created to flesh out best practices and patterns in the development process, development and testing of event driven microservices.  

Key focus areas - 
- Event driven microservices
- Kafka as an event backbone
- service adapter pattern for interfacing flexibility
- Inversion of Control and Factory pattern for persistence adapatability
- Trace based testing using OpenTelemetry / malabi for effective Integration Testing of event based architectures
- Docker and Docker compose based dev and deploy lifecyle to facilitate rapid / distributed dev

## How to run
- docker compose up --remove-orphans --renew-anon-volumes (this will deploy and run the pizzastore app and trigger the integration tests under the Kitchen service)
- To change the default behaviour of the above, update Kitchen/dockerfile -> CMD and select the appropriate script as defined in Kitchen/package.json

## The plot
Our Pizza store acepts orders from the web. The store acknowledges the incoming order back to the user provided all ingredients are in stock. The store provides a status check service which can be polled to know when an order has been delivered.

## Behind the scenes
![image](https://user-images.githubusercontent.com/470835/228422282-419bf292-4ee2-45ef-a635-ae0fb00f147f.png)
 
