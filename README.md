# Impure Diamond

A reference implementation of an impure diamond; A diamond ([EIP-2535](https://github.com/ethereum/EIPs/issues/2535)) with immutable functions that can be upgraded.

By implementing upgradable functions directly in the contract, an impure diamond can save gas on deployment and other transactions while maintaining its upgradability.

## Inclusions

> Diamond inclusions are the non-diamond materials that get encapsulated inside diamond during its formation process in the mantle.

External functions defined directly in a diamond remain immutable unless marked as inclusions.

Inclusion functions work the same way as facet functions do: they can be upgraded using `diamondCut` function and viewed using `IDiamondLoupe` functions.

An inclusion function call is upgraded by invoking `inclusionCall` or one of its aliases (see `contracts/diamond/DiamondInclusions.sol`) during execution.

The folder `contracts/diamond/inclusions` contains inclusion implementations for facets from the [diamond-1](https://github.com/mudgen/diamond-1-hardhat) repo.

**Note:** The files in `contracts/diamond/facets` are used for testing upgradability and remain mostly unchanged.

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
