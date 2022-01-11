# NEAR Protocol subgraph

This project is an example of how you can build and deploy Graph Protocol APIs for NEAR.

This subgraph indexes data from [Misfits](https://twitter.com/NEARMisfits) smart contract transactions and makes them queryable.

To deploy this API, follow these steps:

1. Visit The Graph [hosted service dashboard](https://thegraph.com/hosted-service/), create a profile, and create a new subgraph by clicking __Add Subgraph__.

2. Install The Graph CLI:

```sh
npm install -g @graphprotocol/graph-cli
```

3. Authenticate the your CLI environment with the __Access Token__ from your account dashboard:

```
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
```

4. Replace `username/apiname` in `package.json` with your username and apiname, for example: `dabit3/nearsubgraph`

5. Deploy the subgraph

```sh
yarn deploy
```