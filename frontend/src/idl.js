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
            "name": "user",
            "isMut": true,
            "isSigner": true
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
      }
    ],
    "metadata": {
      "address": "BNK1JjB9vENSrinH4RJbSnLCJQrS9h1Mf21A4VjUh2a7"
    }
  }