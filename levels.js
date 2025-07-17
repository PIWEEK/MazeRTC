const LEVELS = [
    /*{
        map: [7, 1, 1, 1, 1, 5, 4, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 2, 10, 3, 3, 3, 3, 8],
        characters: [
            {
                num: 0,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
        ],
        traps: [
        ],
        teleports: [
        ]
    },*/
    {
        map: [7, 1, 5, 1, 5, 5, 4, 5, 3, 8, 3, 2, 4, 14, 16, 16, 16, 11, 4, 2, 16, 16, 16, 16, 12, 2, 16, 16, 16, 16, 16, 11, 16, 16, 16, 16],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 3,
                y: 1,
                exitX: 1,
                exitY: 5,
                exitKeyX: 1,
                exitKeyY: 1,
            },
            {
                num: 1,
                enabled: true,
                x: 2,
                y: 1,
                exitX: 1,
                exitY: 2,
                exitKeyX: 5,
                exitKeyY: 0,
            },
            {
                num: 2,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
            {
                value: 1,
                x: 1,
                y: 0,
            },
        ],
        plates: [
            {
                value: 0,
                x: 5,
                y: 2,
            },
            {
                value: 0,
                x: 0,
                y: 4,
            },
        ],
        holes: [
        ],
        traps: [
        ],
        teleports: [
        ]
    },
    {
        map: [16, 16, 16, 16, 16, 16, 16, 7, 1, 1, 5, 16, 16, 11, 1, 1, 2, 16, 16, 4, 0, 12, 14, 16, 16, 12, 3, 3, 8, 16, 16, 16, 16, 16, 16, 16],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 1,
                y: 1,
                exitX: 1,
                exitY: 4,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 1,
                y: 2,
                exitX: 3,
                exitY: 3,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
            {
                value: 1,
                x: 3,
                y: 1,
            },
        ],
        plates: [
            {
                value: 0,
                x: 1,
                y: 3,
            },
        ],
        holes: [
            {
                value: 0,
                x: 3,
                y: 2,
            },
            {
                value: 2,
                x: 4,
                y: 3,
            },
        ],
        traps: [
        ],
        teleports: [
        ]
    },
    {
        map: [16, 16, 7, 1, 5, 16, 16, 16, 9, 16, 11, 16, 16, 16, 9, 16, 16, 16, 16, 16, 9, 16, 16, 16, 16, 7, 0, 5, 16, 16, 16, 10, 14, 8, 16, 16],
        characters: [
            {
                num: 0,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: true,
                x: 2,
                y: 3,
                exitX: 2,
                exitY: 5,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 3,
                y: 5,
                exitX: 4,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
        ],
        traps: [
            {
                value: 0,
                x: 2,
                y: 2,
            },
        ],
        teleports: [
        ]
    },
    {
        map: [7, 1, 6, 1, 13, 16, 4, 11, 16, 10, 8, 16, 10, 8, 16, 16, 16, 16, 4, 2, 16, 16, 16, 16, 9, 8, 16, 16, 16, 16, 11, 16, 16, 16, 16, 16],
        characters: [
            {
                num: 0,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 1,
                y: 4,
                exitX: 1,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 1,
                y: 2,
                exitX: 0,
                exitY: 5,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
        ],
        traps: [
        ],
        teleports: [
            {
                value: 0,
                x: 4,
                y: 0,
            },
        ]
    },
    {
        map: [7, 5, 16, 16, 7, 14, 10, 2, 0, 0, 9, 16, 4, 8, 0, 10, 10, 5, 4, 0, 0, 0, 3, 8, 9, 0, 5, 0, 2, 16, 11, 3, 6, 6, 6, 14],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 0,
                exitX: 3,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: true,
                x: 5,
                y: 5,
                exitX: 2,
                exitY: 2,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 5,
                y: 0,
                exitX: 2,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 0,
                y: 5,
                exitX: 3,
                exitY: 2,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
            {
                value: 7,
                x: 4,
                y: 5,
            },
            {
                value: 7,
                x: 2,
                y: 3,
            },
            {
                value: 3,
                x: 1,
                y: 2,
            },
            {
                value: 0,
                x: 0,
                y: 4,
            },
            {
                value: 11,
                x: 4,
                y: 3,
            },
        ],
        plates: [
            {
                value: 1,
                x: 4,
                y: 4,
            },
            {
                value: 0,
                x: 2,
                y: 4,
            },
            {
                value: 2,
                x: 1,
                y: 0,
            },
        ],
        holes: [
        ],
        traps: [
        ],
        teleports: [
        ]
    },
    {
        map: [7, 6, 1, 1, 1, 5, 9, 16, 0, 16, 16, 13, 9, 16, 0, 0, 16, 9, 9, 0, 0, 0, 0, 9, 9, 16, 11, 1, 3, 2, 11, 16, 10, 8, 16, 11],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 2,
                y: 5,
                exitX: 1,
                exitY: 3,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: true,
                x: 0,
                y: 5,
                exitX: 5,
                exitY: 5,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 5,
                y: 0,
                exitX: 2,
                exitY: 4,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 4,
                y: 0,
                exitX: 5,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
        ],
        traps: [
            {
                value: 0,
                x: 5,
                y: 2,
            },
            {
                value: 0,
                x: 2,
                y: 3,
            },
        ],
        teleports: [
        ]
    },
    {
        map: [7, 6, 6, 6, 6, 5, 9, 16, 4, 3, 3, 8, 9, 16, 9, 16, 16, 16, 11, 16, 9, 1, 5, 16, 16, 16, 10, 3, 10, 14, 16, 16, 16, 16, 16, 16],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 3,
                y: 4,
                exitX: 0,
                exitY: 3,
                exitKeyX: 4,
                exitKeyY: 4,
            },
            {
                num: 1,
                enabled: true,
                x: 3,
                y: 3,
                exitX: 5,
                exitY: 4,
                exitKeyX: 4,
                exitKeyY: 3,
            },
            {
                num: 2,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
        ],
        traps: [
            {
                value: 0,
                x: 0,
                y: 2,
            },
        ],
        teleports: [
        ]
    },
    {
        map: [7, 1, 1, 1, 6, 5, 4, 13, 5, 0, 0, 2, 10, 3, 0, 0, 5, 8, 16, 16, 4, 0, 2, 16, 7, 7, 2, 0, 0, 14, 10, 3, 10, 3, 10, 8],
        characters: [
            {
                num: 0,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: true,
                x: 1,
                y: 0,
                exitX: 5,
                exitY: 2,
                exitKeyX: 5,
                exitKeyY: 5,
            },
            {
                num: 2,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 0,
                y: 0,
                exitX: 5,
                exitY: 4,
                exitKeyX: 4,
                exitKeyY: 2,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
        ],
        traps: [
            {
                value: 0,
                x: 2,
                y: 3,
            },
            {
                value: 0,
                x: 3,
                y: 3,
            },
            {
                value: 0,
                x: 4,
                y: 3,
            },
            {
                value: 0,
                x: 2,
                y: 2,
            },
            {
                value: 0,
                x: 2,
                y: 1,
            },
        ],
        teleports: [
            {
                value: 0,
                x: 0,
                y: 4,
            },
            {
                value: 0,
                x: 1,
                y: 1,
            },
        ]
    },
    {
        map: [13, 16, 16, 16, 16, 13, 9, 16, 7, 6, 1, 8, 9, 16, 9, 16, 9, 16, 9, 6, 3, 6, 14, 16, 9, 2, 16, 9, 16, 16, 11, 3, 6, 3, 6, 14],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 5,
                exitKeyX: 0,
                exitKeyY: 2,
            },
            {
                num: 1,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 1,
                y: 5,
                exitX: 3,
                exitY: 4,
                exitKeyX: 2,
                exitKeyY: 5,
            },
            {
                num: 3,
                enabled: true,
                x: 5,
                y: 0,
                exitX: 4,
                exitY: 3,
                exitKeyX: 4,
                exitKeyY: 2,
            },
        ],
        doors: [
            {
                value: 2,
                x: 0,
                y: 1,
            },
            {
                value: 6,
                x: 0,
                y: 0,
            },
            {
                value: 10,
                x: 0,
                y: 2,
            },
        ],
        plates: [
            {
                value: 0,
                x: 5,
                y: 5,
            },
            {
                value: 1,
                x: 1,
                y: 3,
            },
            {
                value: 2,
                x: 1,
                y: 4,
            },
        ],
        holes: [
        ],
        traps: [
        ],
        teleports: [
        ]
    },
    {
        map: [16, 7, 6, 14, 5, 16, 7, 2, 16, 4, 8, 16, 4, 7, 5, 2, 16, 16, 4, 0, 1, 7, 5, 16, 12, 6, 6, 6, 6, 14, 16, 16, 16, 16, 16, 16],
        characters: [
            {
                num: 0,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 1,
                y: 3,
                exitX: 5,
                exitY: 4,
                exitKeyX: 2,
                exitKeyY: 2,
            },
            {
                num: 3,
                enabled: true,
                x: 2,
                y: 3,
                exitX: 4,
                exitY: 3,
                exitKeyX: 3,
                exitKeyY: 2,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
            {
                value: 0,
                x: 3,
                y: 4,
            },
            {
                value: 1,
                x: 3,
                y: 0,
            },
            {
                value: 0,
                x: 0,
                y: 4,
            },
        ],
        traps: [
        ],
        teleports: [
            {
                value: 0,
                x: 1,
                y: 2,
            },
            {
                value: 0,
                x: 4,
                y: 1,
            },
        ]
    },
    {
        map: [13, 1, 14, 1, 12, 5, 11, 0, 10, 0, 3, 2, 4, 0, 10, 3, 3, 2, 9, 0, 4, 0, 0, 2, 4, 0, 10, 5, 5, 2, 12, 3, 3, 3, 3, 8],
        characters: [
            {
                num: 0,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: true,
                x: 2,
                y: 2,
                exitX: 2,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 3,
                y: 2,
                exitX: 0,
                exitY: 5,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
            {
                value: 5,
                x: 3,
                y: 2,
            },
            {
                value: 1,
                x: 0,
                y: 4,
            },
            {
                value: 11,
                x: 3,
                y: 3,
            },
            {
                value: 15,
                x: 5,
                y: 3,
            },
        ],
        plates: [
            {
                value: 0,
                x: 0,
                y: 0,
            },
            {
                value: 1,
                x: 4,
                y: 0,
            },
            {
                value: 2,
                x: 2,
                y: 4,
            },
            {
                value: 3,
                x: 4,
                y: 4,
            },
        ],
        holes: [
            {
                value: 1,
                x: 0,
                y: 1,
            },
        ],
        traps: [
            {
                value: 0,
                x: 4,
                y: 1,
            },
            {
                value: 0,
                x: 1,
                y: 3,
            },
            {
                value: 0,
                x: 5,
                y: 4,
            },
        ],
        teleports: [
        ]
    },
    {
        map: [7, 1, 1, 1, 5, 5, 7, 6, 6, 5, 2, 2, 4, 4, 0, 2, 2, 2, 4, 4, 7, 6, 8, 2, 4, 4, 10, 3, 3, 8, 10, 10, 3, 3, 3, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 0,
                exitX: 3,
                exitY: 2,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: true,
                x: 0,
                y: 5,
                exitX: 3,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 5,
                y: 0,
                exitX: 2,
                exitY: 2,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 5,
                y: 5,
                exitX: 2,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
            {
                value: 3,
                x: 2,
                y: 4,
            },
        ],
        traps: [
        ],
        teleports: [
            {
                value: 0,
                x: 4,
                y: 3,
            },
            {
                value: 0,
                x: 1,
                y: 2,
            },
        ]
    },
    {
        map: [7, 1, 5, 1, 1, 5, 4, 0, 2, 0, 0, 2, 10, 3, 8, 3, 3, 8, 4, 0, 2, 0, 0, 2, 4, 0, 2, 0, 0, 2, 10, 3, 8, 3, 3, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 1,
                y: 1,
                exitX: 2,
                exitY: 3,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: true,
                x: 1,
                y: 4,
                exitX: 3,
                exitY: 2,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 4,
                y: 4,
                exitX: 0,
                exitY: 3,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 4,
                y: 1,
                exitX: 3,
                exitY: 3,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
        ],
        plates: [
        ],
        holes: [
            {
                value: 2,
                x: 1,
                y: 2,
            },
        ],
        traps: [
        ],
        teleports: [
            {
                value: 0,
                x: 0,
                y: 5,
            },
            {
                value: 0,
                x: 5,
                y: 5,
            },
            {
                value: 0,
                x: 5,
                y: 0,
            },
            {
                value: 0,
                x: 0,
                y: 0,
            },
        ]
    },
    {
        map: [7, 14, 6, 5, 1, 14, 10, 3, 2, 3, 3, 2, 4, 3, 3, 3, 8, 2, 4, 10, 2, 0, 10, 2, 4, 9, 0, 0, 0, 2, 10, 8, 8, 8, 3, 14],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 5,
                y: 0,
                exitX: 2,
                exitY: 0,
                exitKeyX: 2,
                exitKeyY: 5,
            },
            {
                num: 1,
                enabled: true,
                x: 2,
                y: 2,
                exitX: 4,
                exitY: 2,
                exitKeyX: 1,
                exitKeyY: 0,
            },
            {
                num: 2,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 1,
                y: 3,
                exitX: 3,
                exitY: 5,
                exitKeyX: 3,
                exitKeyY: 3,
            },
        ],
        doors: [
            {
                value: 1,
                x: 3,
                y: 1,
            },
            {
                value: 13,
                x: 2,
                y: 4,
            },
            {
                value: 5,
                x: 1,
                y: 1,
            },
            {
                value: 5,
                x: 1,
                y: 2,
            },
            {
                value: 9,
                x: 2,
                y: 2,
            },
        ],
        plates: [
            {
                value: 0,
                x: 4,
                y: 3,
            },
            {
                value: 2,
                x: 5,
                y: 1,
            },
            {
                value: 3,
                x: 1,
                y: 4,
            },
            {
                value: 1,
                x: 5,
                y: 5,
            },
        ],
        holes: [
        ],
        traps: [
        ],
        teleports: [
        ]
    },
    {
        map: [7, 6, 14, 1, 1, 14, 11, 16, 9, 0, 3, 9, 9, 1, 0, 0, 0, 9, 9, 2, 1, 1, 0, 2, 10, 8, 0, 7, 1, 13, 10, 3, 3, 3, 10, 11],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 1,
                y: 0,
                exitX: 5,
                exitY: 3,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 1,
                enabled: false,
                x: 0,
                y: 0,
                exitX: 0,
                exitY: 0,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 2,
                enabled: true,
                x: 0,
                y: 0,
                exitX: 5,
                exitY: 2,
                exitKeyX: -1,
                exitKeyY: -1,
            },
            {
                num: 3,
                enabled: true,
                x: 0,
                y: 5,
                exitX: 5,
                exitY: 1,
                exitKeyX: -1,
                exitKeyY: -1,
            },
        ],
        doors: [
            {
                value: 10,
                x: 2,
                y: 1,
            },
            {
                value: 7,
                x: 5,
                y: 0,
            },
        ],
        plates: [
            {
                value: 2,
                x: 0,
                y: 2,
            },
            {
                value: 1,
                x: 5,
                y: 5,
            },
        ],
        holes: [
            {
                value: 2,
                x: 2,
                y: 0,
            },
            {
                value: 3,
                x: 5,
                y: 5,
            },
        ],
        traps: [
        ],
        teleports: [
            {
                value: 0,
                x: 5,
                y: 0,
            },
            {
                value: 0,
                x: 0,
                y: 1,
            },
        ]
    }


]


const TILES = [
    [true, true, true, true],
    [false, true, true, true],
    [true, false, true, true],
    [true, true, false, true],
    [true, true, true, false],
    [false, false, true, true],
    [false, true, false, true],
    [false, true, true, false],
    [true, false, false, true],
    [true, false, true, false],
    [true, true, false, false],
    [true, false, false, false],
    [false, true, false, false],
    [false, false, true, false],
    [false, false, false, true],
    [false, false, false, false],
    [false, false, false, false]
]