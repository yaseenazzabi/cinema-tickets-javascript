# TicketService
This is a solution to the TicketService problem outlined in your email. Some minor modifications have been made to the template.
## Instructions
Running this deployment requires Node.js. It is tested only with node versions >= 18, and I can not guarantee that it will work on older versions.

The unit tests written require Jest.

Once this repository has been cloned or otherwise downloaded, navigate to its root and execute `npm i` to install the dependencies. From there, you may:
- run `npm run test` to execute the Jest unit tests.
- navigate to `src\pairtest` and analyse the changes made to `TicketService.js`, and the entirety of the `.\lib` folder.

Changes to the template include the removal of the spread operator in `TicketService.purchaseTickets()`, instead opting for an approach where consumers pass an array of `TicketTypeRequest` objects to the aforementioned method.

Additonally, the boilerplate code for `InvalidPurchaseException.js` has been removed, but its implementation comes as expected.

Finally, a global `constants.js` file has been added which is used throughout the solution. This resulted in a change to `TicketTypeRequest.js`, where constants are now used to reference valid fieldnames for ticket types.