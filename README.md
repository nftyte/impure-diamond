# Impure Diamond

A reference implementation of an impure diamond: an [EIP-2535](https://github.com/ethereum/EIPs/issues/2535) diamond with upgradable functions defined directly in the contract.

An impure diamond can save gas on deployment and other transactions without sacrificing upgradability.

## Inclusions

> Diamond inclusions are the non-diamond materials that get encapsulated inside a diamond during its formation process in the mantle.

External functions defined directly in a diamond remain immutable unless marked as inclusions.

Inclusion functions work the same way as facet functions do: they can be upgraded using the `diamondCut` function and viewed using `IDiamondLoupe` functions.

This repo implements two ways of upgrading inclusion function calls:
- By adding the `inclusion` modifier to the function.
- By calling `inclusionCall` or one of its aliases during function execution.

**Note:** See `contracts/diamond/DiamondInclusions.sol` for more details.

The folder `contracts/diamond/inclusions` contains inclusion implementations for facets from the [diamond-1](https://github.com/mudgen/diamond-1-hardhat) repo.

The files in `contracts/diamond/facets` are used for testing upgradability.

## Deployment

```console
npx hardhat run scripts/deploy.js
```

## Tests

```console
npx hardhat test

```

## Author

This example implementation was written by NFTyte.

Contact: https://twitter.com/nftyte

## License

MIT license. Anyone can use or modify this software for their purposes.
