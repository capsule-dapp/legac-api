/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/legac.json`.
 */
export type Legac = {
  "address": "6GuYwH7dmXsBpfy92eu2YRyFyqcYSzKXywFEVNNksrwA",
  "metadata": {
    "name": "legac",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelRecovery",
      "discriminator": [
        176,
        23,
        203,
        37,
        121,
        251,
        227,
        83
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "checkCapsuleCondition",
      "discriminator": [
        221,
        184,
        175,
        102,
        2,
        229,
        218,
        134
      ],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "checkinCapsule",
      "discriminator": [
        38,
        237,
        167,
        157,
        17,
        227,
        60,
        127
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "createCryptoCapsule",
      "discriminator": [
        58,
        139,
        1,
        245,
        124,
        124,
        30,
        216
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "assetMint",
          "writable": true
        },
        {
          "name": "assetTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "assetMint"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "userAssetTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "assetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        },
        {
          "name": "unlockType",
          "type": {
            "defined": {
              "name": "unlockType"
            }
          }
        },
        {
          "name": "unlockTimestamp",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "inactivityPeriod",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "beneficiary",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "multisigSecured",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createDocumentCapsule",
      "discriminator": [
        148,
        85,
        73,
        157,
        237,
        128,
        159,
        90
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        },
        {
          "name": "unlockType",
          "type": {
            "defined": {
              "name": "unlockType"
            }
          }
        },
        {
          "name": "unlockTimestamp",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "inactivityPeriod",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "beneficiary",
          "type": "pubkey"
        },
        {
          "name": "documentUri",
          "type": "string"
        },
        {
          "name": "documentFormat",
          "type": "string"
        },
        {
          "name": "multisigSecured",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createMessageCapsule",
      "discriminator": [
        173,
        183,
        179,
        173,
        176,
        49,
        43,
        213
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        },
        {
          "name": "unlockType",
          "type": {
            "defined": {
              "name": "unlockType"
            }
          }
        },
        {
          "name": "unlockTimestamp",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "inactivityPeriod",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "beneficiary",
          "type": "pubkey"
        },
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "multisigSecured",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createNftCapsule",
      "discriminator": [
        36,
        22,
        54,
        223,
        18,
        153,
        239,
        72
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "assetNftMint",
          "writable": true
        },
        {
          "name": "assetNftVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101,
                  95,
                  110,
                  102,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "assetNftMint"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "userAssetNftAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "assetNftMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        },
        {
          "name": "unlockType",
          "type": {
            "defined": {
              "name": "unlockType"
            }
          }
        },
        {
          "name": "unlockTimestamp",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "inactivityPeriod",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "beneficiary",
          "type": "pubkey"
        },
        {
          "name": "multisigSecured",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createSolCryptoCapsule",
      "discriminator": [
        101,
        230,
        58,
        134,
        59,
        46,
        48,
        245
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        },
        {
          "name": "unlockType",
          "type": {
            "defined": {
              "name": "unlockType"
            }
          }
        },
        {
          "name": "unlockTimestamp",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "inactivityPeriod",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "beneficiary",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "multisigSecured",
          "type": "bool"
        }
      ]
    },
    {
      "name": "enableMultisig",
      "discriminator": [
        122,
        152,
        144,
        139,
        93,
        117,
        169,
        52
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        },
        {
          "name": "approvalLists",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "approvalThreshold",
          "type": "u8"
        }
      ]
    },
    {
      "name": "executeCapsuleRelease",
      "discriminator": [
        249,
        135,
        192,
        20,
        34,
        61,
        33,
        246
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "executeCryptoCapsuleRelease",
      "discriminator": [
        3,
        67,
        43,
        119,
        93,
        210,
        180,
        40
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "assetMint",
          "writable": true
        },
        {
          "name": "assetTokenVault",
          "writable": true
        },
        {
          "name": "beneficiaryTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "assetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "executeNftCapsuleRelease",
      "discriminator": [
        247,
        97,
        158,
        39,
        234,
        37,
        77,
        46
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "assetMint",
          "writable": true
        },
        {
          "name": "assetNftVault",
          "writable": true
        },
        {
          "name": "beneficiaryNftAccount",
          "writable": true
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "executeSolCapsuleRelease",
      "discriminator": [
        247,
        231,
        16,
        177,
        82,
        202,
        2,
        226
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "getLockStatus",
      "discriminator": [
        169,
        253,
        229,
        1,
        109,
        105,
        245,
        160
      ],
      "accounts": [
        {
          "name": "capsuleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ],
      "returns": "bool"
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeVault",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeBps",
          "type": "u8"
        }
      ]
    },
    {
      "name": "proposeRelease",
      "discriminator": [
        156,
        43,
        186,
        24,
        116,
        44,
        17,
        71
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerCrypto",
      "discriminator": [
        226,
        174,
        231,
        52,
        169,
        60,
        194,
        46
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "registerDocumentType",
      "discriminator": [
        173,
        220,
        158,
        220,
        133,
        2,
        115,
        84
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "format",
          "type": "string"
        }
      ]
    },
    {
      "name": "signRecovery",
      "discriminator": [
        19,
        61,
        118,
        173,
        239,
        233,
        181,
        246
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateMultisigRecovery",
      "discriminator": [
        80,
        149,
        165,
        186,
        214,
        40,
        226,
        246
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "capsuleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "capsule_account.owner",
                "account": "capsule"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "string"
        },
        {
          "name": "approvalLists",
          "type": {
            "option": {
              "vec": "pubkey"
            }
          }
        },
        {
          "name": "approvalThreshold",
          "type": {
            "option": "u8"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "capsule",
      "discriminator": [
        212,
        231,
        77,
        219,
        58,
        13,
        118,
        241
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    }
  ],
  "events": [
    {
      "name": "capsuleCheckIn",
      "discriminator": [
        169,
        195,
        205,
        240,
        48,
        161,
        167,
        20
      ]
    },
    {
      "name": "capsuleCreated",
      "discriminator": [
        113,
        132,
        247,
        198,
        217,
        47,
        201,
        223
      ]
    },
    {
      "name": "capsuleProposalRelease",
      "discriminator": [
        186,
        13,
        191,
        151,
        248,
        182,
        185,
        216
      ]
    },
    {
      "name": "capsuleReleased",
      "discriminator": [
        108,
        54,
        129,
        79,
        211,
        228,
        173,
        86
      ]
    },
    {
      "name": "capsuleUnlocked",
      "discriminator": [
        225,
        147,
        157,
        140,
        191,
        11,
        31,
        94
      ]
    },
    {
      "name": "configInitialized",
      "discriminator": [
        181,
        49,
        200,
        156,
        19,
        167,
        178,
        91
      ]
    },
    {
      "name": "cryptocurrencyRegistered",
      "discriminator": [
        65,
        30,
        92,
        69,
        40,
        108,
        208,
        106
      ]
    },
    {
      "name": "documentTypeRegistered",
      "discriminator": [
        201,
        78,
        205,
        252,
        142,
        146,
        101,
        124
      ]
    },
    {
      "name": "multisigEnabled",
      "discriminator": [
        104,
        76,
        229,
        86,
        65,
        8,
        182,
        39
      ]
    },
    {
      "name": "nftRegistered",
      "discriminator": [
        219,
        161,
        34,
        252,
        91,
        8,
        93,
        21
      ]
    },
    {
      "name": "recoveryCancelled",
      "discriminator": [
        191,
        25,
        236,
        86,
        25,
        77,
        117,
        96
      ]
    },
    {
      "name": "recoveryConfigUpdated",
      "discriminator": [
        207,
        108,
        179,
        255,
        245,
        62,
        103,
        126
      ]
    },
    {
      "name": "recoverySigned",
      "discriminator": [
        76,
        168,
        96,
        58,
        177,
        160,
        210,
        41
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6001,
      "name": "duplicateAsset",
      "msg": "Duplicate Asset"
    },
    {
      "code": 6002,
      "name": "invalidFormat",
      "msg": "Invalid Format"
    },
    {
      "code": 6003,
      "name": "invalidAsset",
      "msg": "Invalid Asset"
    },
    {
      "code": 6004,
      "name": "invalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6005,
      "name": "invalidNftMint",
      "msg": "Invalid NFT Mint"
    },
    {
      "code": 6006,
      "name": "invalidTokenAccount",
      "msg": "Invalid Token Account"
    },
    {
      "code": 6007,
      "name": "mathOverflow",
      "msg": "Math Overflow"
    },
    {
      "code": 6008,
      "name": "insufficientFunds",
      "msg": "Insufficient Funds"
    },
    {
      "code": 6009,
      "name": "invalidAssetContent",
      "msg": "Invalid Asset Content"
    },
    {
      "code": 6010,
      "name": "invalidAssetFormat",
      "msg": "Invalid Asset Format"
    },
    {
      "code": 6011,
      "name": "unsupportedDocumentFormat",
      "msg": "Unsupported Document Format"
    },
    {
      "code": 6012,
      "name": "unsupportedCryptocurrency",
      "msg": "Unsupported Cryptocurrency"
    },
    {
      "code": 6013,
      "name": "invalidAction",
      "msg": "Invalid Action"
    },
    {
      "code": 6014,
      "name": "invalidAssetVault",
      "msg": "Invalid Asset Vault"
    },
    {
      "code": 6015,
      "name": "invalidInactivityPeriod",
      "msg": "Invalid Inactivity Period"
    },
    {
      "code": 6016,
      "name": "capsuleNotLocked",
      "msg": "Capsule Not Locked"
    },
    {
      "code": 6017,
      "name": "capsuleLocked",
      "msg": "Capsule Locked"
    },
    {
      "code": 6018,
      "name": "conditionsNotMet",
      "msg": "Conditions Not Met"
    },
    {
      "code": 6019,
      "name": "multisigNotEnabled",
      "msg": "Multisig Not Enabled"
    },
    {
      "code": 6020,
      "name": "proposalAlreadyInitiated",
      "msg": "Proposal Already Initiated"
    },
    {
      "code": 6021,
      "name": "unauthorizedProposer",
      "msg": "Unauthorized proposer"
    },
    {
      "code": 6022,
      "name": "noRecoveryProposal",
      "msg": "No Recovery Proposal"
    },
    {
      "code": 6023,
      "name": "recoveryProposalNotEmpty",
      "msg": "Recovery Proposal Not Empty"
    },
    {
      "code": 6024,
      "name": "invalidApprovalKeys",
      "msg": "Invalid Approval Keys"
    },
    {
      "code": 6025,
      "name": "invalidApprovalThreshold",
      "msg": "Invalid Approval Threshold"
    },
    {
      "code": 6026,
      "name": "invalidApprovalConfig",
      "msg": "Invalid Approval Config"
    },
    {
      "code": 6027,
      "name": "missingUnlockTimestamp",
      "msg": "Missing Unlock Timestamp"
    },
    {
      "code": 6028,
      "name": "missingInactivityPeriod",
      "msg": "Missing Inactivity Period"
    },
    {
      "code": 6029,
      "name": "invalidUnlockTimestamp",
      "msg": "Invalid Unlock Timestamp"
    }
  ],
  "types": [
    {
      "name": "assetType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "nft"
          },
          {
            "name": "cryptocurrency"
          },
          {
            "name": "native"
          },
          {
            "name": "documents"
          },
          {
            "name": "message"
          }
        ]
      }
    },
    {
      "name": "capsule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "unlockType",
            "type": {
              "defined": {
                "name": "unlockType"
              }
            }
          },
          {
            "name": "assetMint",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "assetType",
            "type": {
              "defined": {
                "name": "assetType"
              }
            }
          },
          {
            "name": "unlockTimestamp",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "inactivityPeriod",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "lastCheckin",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "amount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "assetTokenVault",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "assetTokenVaultBump",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "assetNftVault",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "assetNftVaultBump",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "assetUri",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "documentFormat",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "encryptedMessage",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "isLocked",
            "type": "bool"
          },
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "multisigSecured",
            "type": "bool"
          },
          {
            "name": "approvalLists",
            "type": {
              "option": {
                "vec": "pubkey"
              }
            }
          },
          {
            "name": "approvalThreshold",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "proposals",
            "type": {
              "option": {
                "defined": {
                  "name": "recoveryProposal"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "capsuleCheckIn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "capsuleCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "assetType",
            "type": {
              "defined": {
                "name": "assetType"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "capsuleProposalRelease",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "capsuleReleased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "assetType",
            "type": {
              "defined": {
                "name": "assetType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "capsuleUnlocked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "reason",
            "type": {
              "defined": {
                "name": "unlockReason"
              }
            }
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "supportedCryptocurrency",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "supportedDocuments",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "totalCapsules",
            "type": "u64"
          },
          {
            "name": "totalCryptoCapsules",
            "type": "u64"
          },
          {
            "name": "totalNftCapsules",
            "type": "u64"
          },
          {
            "name": "totalDocumentCapsules",
            "type": "u64"
          },
          {
            "name": "totalMessageCapsules",
            "type": "u64"
          },
          {
            "name": "totalRetrievedCapsules",
            "type": "u64"
          },
          {
            "name": "feeVault",
            "type": "pubkey"
          },
          {
            "name": "feeBps",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "configInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "cryptocurrencyRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "documentTypeRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "format",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "multisigEnabled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "approvalLists",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "nftRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "recoveryCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "recoveryConfigUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "threshold",
            "type": {
              "option": "u8"
            }
          }
        ]
      }
    },
    {
      "name": "recoveryProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "signatures",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "recoverySigned",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsuleId",
            "type": "string"
          },
          {
            "name": "signer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "unlockReason",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "timeBased"
          },
          {
            "name": "inactivity"
          },
          {
            "name": "recovery"
          }
        ]
      }
    },
    {
      "name": "unlockType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "timeBased"
          },
          {
            "name": "inactivityBased"
          }
        ]
      }
    }
  ]
};
