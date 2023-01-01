export const idl = {
  "version": "0.1.0",
  "name": "data_feed_dapp",
  "instructions": [
    {
      "name": "execute",
      "accounts": [
        {
          "name": "resultAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chainlinkProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chainlinkFeed",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "create",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "donate",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ResultAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "i128"
          },
          {
            "name": "decimal",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "BaseAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "metadata": {
    "address": "BNK1JjB9vENSrinH4RJbSnLCJQrS9h1Mf21A4VjUh2a7"
  }
}