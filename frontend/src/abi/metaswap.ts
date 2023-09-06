import { erc20ABI } from 'wagmi'
const bscContract = process.env.NEXT_PUBLIC_BSC_SWAP_CONTRACT as string

export const metaswapV1ContractConfig = {
  address: bscContract as `0x${string}`,
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: '_swapId',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: '_swapTakerId',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'enum Swap.SwapEvent',
          name: '_eventType',
          type: 'uint8',
        },
      ],
      name: 'TradeEvent',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_swapId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '_swapTakerId',
          type: 'uint256',
        },
      ],
      name: 'cancelSwapDeal',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_swapId',
          type: 'uint256',
        },
      ],
      name: 'closeSwapDeal',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_swapId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '_swapTakerId',
          type: 'uint256',
        },
      ],
      name: 'confirmSwapDeal',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'enum Swap.TokenStd',
              name: 'tokenStd',
              type: 'uint8',
            },
            {
              internalType: 'address',
              name: 'tokenAddress',
              type: 'address',
            },
            {
              internalType: 'uint256[]',
              name: 'tokenIds',
              type: 'uint256[]',
            },
            {
              internalType: 'uint256[]',
              name: 'tokenBalances',
              type: 'uint256[]',
            },
          ],
          internalType: 'struct Swap.SwaperToken[]',
          name: '_tokens',
          type: 'tuple[]',
        },
        {
          internalType: 'uint256',
          name: '_swapDay',
          type: 'uint256',
        },
      ],
      name: 'createSwapDeal',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'flatFee',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'flatFeePool',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_address',
          type: 'address',
        },
      ],
      name: 'flipBannedAddress',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_maker',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '_index',
          type: 'uint256',
        },
      ],
      name: 'getMakerDeal',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_maker',
          type: 'address',
        },
      ],
      name: 'getMakerDealSize',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_taker',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '_index',
          type: 'uint256',
        },
      ],
      name: 'getTakerDeal',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_taker',
          type: 'address',
        },
      ],
      name: 'getTakerDealSize',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'isPaused',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'pausable',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_contract',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: '_status',
          type: 'bool',
        },
      ],
      name: 'setERCBlackList',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_flatFee',
          type: 'uint256',
        },
      ],
      name: 'setFlatFee',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_platformPoints',
          type: 'address',
        },
      ],
      name: 'setPlatformPoints',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_swapId',
          type: 'uint256',
        },
        {
          components: [
            {
              internalType: 'enum Swap.TokenStd',
              name: 'tokenStd',
              type: 'uint8',
            },
            {
              internalType: 'address',
              name: 'tokenAddress',
              type: 'address',
            },
            {
              internalType: 'uint256[]',
              name: 'tokenIds',
              type: 'uint256[]',
            },
            {
              internalType: 'uint256[]',
              name: 'tokenBalances',
              type: 'uint256[]',
            },
          ],
          internalType: 'struct Swap.SwaperToken[]',
          name: '_tokens',
          type: 'tuple[]',
        },
      ],
      name: 'submitSwapDeal',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'swapIds',
      outputs: [
        {
          internalType: 'uint256',
          name: '_value',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'swapMakerDeal',
      outputs: [
        {
          components: [
            {
              internalType: 'address payable',
              name: 'owner',
              type: 'address',
            },
            {
              components: [
                {
                  internalType: 'enum Swap.TokenStd',
                  name: 'tokenStd',
                  type: 'uint8',
                },
                {
                  internalType: 'address',
                  name: 'tokenAddress',
                  type: 'address',
                },
                {
                  internalType: 'uint256[]',
                  name: 'tokenIds',
                  type: 'uint256[]',
                },
                {
                  internalType: 'uint256[]',
                  name: 'tokenBalances',
                  type: 'uint256[]',
                },
              ],
              internalType: 'struct Swap.SwaperToken[]',
              name: 'tokens',
              type: 'tuple[]',
            },
            {
              internalType: 'uint256',
              name: 'nativeTokens',
              type: 'uint256',
            },
          ],
          internalType: 'struct Swap.Swaper',
          name: 'trader',
          type: 'tuple',
        },
        {
          internalType: 'uint256',
          name: 'swapEnd',
          type: 'uint256',
        },
        {
          internalType: 'enum Swap.SwapStatus',
          name: 'swapStatus',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'swapMakerDealResult',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'swapTakerDealIds',
      outputs: [
        {
          internalType: 'uint256',
          name: '_value',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'swapTakerDeals',
      outputs: [
        {
          components: [
            {
              internalType: 'address payable',
              name: 'owner',
              type: 'address',
            },
            {
              components: [
                {
                  internalType: 'enum Swap.TokenStd',
                  name: 'tokenStd',
                  type: 'uint8',
                },
                {
                  internalType: 'address',
                  name: 'tokenAddress',
                  type: 'address',
                },
                {
                  internalType: 'uint256[]',
                  name: 'tokenIds',
                  type: 'uint256[]',
                },
                {
                  internalType: 'uint256[]',
                  name: 'tokenBalances',
                  type: 'uint256[]',
                },
              ],
              internalType: 'struct Swap.SwaperToken[]',
              name: 'tokens',
              type: 'tuple[]',
            },
            {
              internalType: 'uint256',
              name: 'nativeTokens',
              type: 'uint256',
            },
          ],
          internalType: 'struct Swap.Swaper',
          name: 'trader',
          type: 'tuple',
        },
        {
          internalType: 'uint256',
          name: 'swapEnd',
          type: 'uint256',
        },
        {
          internalType: 'enum Swap.SwapStatus',
          name: 'swapStatus',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_pool',
          type: 'address',
        },
      ],
      name: 'withdrawFee',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
} as const

export const erc1155ContractConfig = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  abi: erc20ABI,
} as const
