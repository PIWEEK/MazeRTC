const LEVELS = [
    {
        map: [7, 6, 6, 6, 6, 5, 4, 4, 0, 3, 3, 8, 4, 5, 0, 4, 0, 2, 7, 2, 0, 4, 0, 2, 4, 5, 0, 0, 10, 2, 12, 8, 6, 6, 6, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 4,
                exitX: 2,
                exitY: 5,
            },
            {
                num: 1,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 2,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 3,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            }
        ]
    },
    {
        map: [7, 6, 6, 6, 6, 5, 4, 4, 0, 3, 3, 8, 4, 5, 0, 4, 0, 2, 7, 2, 0, 4, 0, 2, 4, 5, 0, 0, 10, 2, 12, 8, 6, 6, 6, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 5,
                exitX: 2,
                exitY: 5,
            },
            {
                num: 1,
                enabled: true,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 2,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 3,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            }
        ],
        doors: [
            {
                value: 0,
                x: 0,
                y: 4,
            },
        ],
        plates: [
            {
                value: 0,
                x: 3,
                y: 4,
            },
        ]
    }, {
        map: [7, 6, 6, 6, 6, 5, 4, 4, 0, 3, 3, 8, 4, 5, 0, 4, 0, 2, 7, 2, 0, 4, 0, 2, 4, 5, 0, 0, 10, 2, 12, 8, 6, 6, 6, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 3,
                y: 5,
                exitX: 2,
                exitY: 5,
            },
            {
                num: 1,
                enabled: false,
                x: 0,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 2,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 3,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            }
        ]
    },
    {
        map: [7, 6, 6, 6, 6, 5, 4, 4, 0, 3, 3, 8, 4, 5, 0, 4, 4, 2, 7, 2, 0, 4, 0, 2, 4, 5, 0, 0, 10, 2, 12, 8, 6, 6, 6, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 5,
                exitX: 2,
                exitY: 5,
            },
            {
                num: 1,
                enabled: true,
                x: 0,
                y: 4,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 2,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 3,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            }
        ],
        doors: [
            {
                value: 0,
                x: 0,
                y: 4,
            },
            {
                value: 7,
                x: 4,
                y: 3,
            },
        ],
        plates: [
            {
                value: 0,
                x: 3,
                y: 4,
            },
            {
                value: 1,
                x: 1,
                y: 4,
            },
        ]
    },
    {
        map: [7, 6, 6, 6, 6, 5, 4, 4, 0, 3, 3, 8, 4, 5, 0, 4, 4, 2, 7, 2, 0, 4, 0, 2, 4, 5, 0, 0, 10, 2, 12, 8, 6, 6, 6, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 0,
                exitX: 2,
                exitY: 5,
            },
            {
                num: 1,
                enabled: true,
                x: 3,
                y: 0,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 2,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 3,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            }
        ],
        doors: [
            {
                value: 0,
                x: 0,
                y: 4,
            },
            {
                value: 7,
                x: 4,
                y: 3,
            },
        ],
        plates: [
            {
                value: 0,
                x: 3,
                y: 4,
            },
            {
                value: 1,
                x: 1,
                y: 4,
            },
        ]
    },
    {
        map: [7, 6, 6, 6, 6, 5, 4, 11, 0, 3, 3, 8, 4, 2, 0, 13, 0, 2, 7, 2, 0, 11, 0, 9, 4, 5, 0, 0, 0, 9, 12, 8, 6, 6, 6, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 5,
                exitX: 2,
                exitY: 5,
            },
            {
                num: 1,
                enabled: true,
                x: 5,
                y: 4,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 2,
                enabled: false,
                x: 4,
                y: 5,
                exitX: 1,
                exitY: 5,
            },
            {
                num: 3,
                enabled: false,
                x: 3,
                y: 5,
                exitX: 1,
                exitY: 5,
            }
        ],
        doors: [
            {
                value: 0,
                x: 0,
                y: 4,
            },
            {
                value: 7,
                x: 4,
                y: 4,
            },
        ],
        plates: [
            {
                value: 0,
                x: 3,
                y: 4,
            },
            {
                value: 1,
                x: 1,
                y: 4,
            },
        ]
    },
    {
        map: [7, 1, 1, 1, 1, 5, 4, 0, 0, 0, 0, 2, 4, 0, 4, 0, 0, 2, 4, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 2, 10, 3, 3, 3, 3, 8],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 0,
                y: 0,
                exitX: 5,
                exitY: 0,
                exitKeyX: 1,
                exitKeyY: 0,
            },
            {
                num: 1,
                enabled: true,
                x: 0,
                y: 1,
                exitX: 5,
                exitY: 1,
                exitKeyX: 1,
                exitKeyY: 1,
            },
            {
                num: 2,
                enabled: true,
                x: 0,
                y: 2,
                exitX: 5,
                exitY: 2,
                exitKeyX: 1,
                exitKeyY: 2,
            },
            {
                num: 3,
                enabled: true,
                x: 0,
                y: 3,
                exitX: 5,
                exitY: 3,
                exitKeyX: 1,
                exitKeyY: 3,
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
                y: 2,
            },
        ],
        traps: [
            {
                value: 0,
                x: 2,
                y: 1,
            },
        ],
        teleports: [
            {
                value: 0,
                x: 2,
                y: 3,
            },
        ]
    },
    {
        map: [12, 6, 6, 1, 6, 14, 4, 11, 0, 0, 0, 2, 4, 0, 0, 1, 1, 5, 4, 1, 1, 1, 1, 5, 4, 0, 0, 0, 0, 2, 10, 3, 11, 3, 12, 14],
        characters: [
            {
                num: 0,
                enabled: true,
                x: 1,
                y: 0,
                exitX: 2,
                exitY: 5,
                exitKeyX: 0,
                exitKeyY: 5,
            },
            {
                num: 1,
                enabled: true,
                x: 3,
                y: 1,
                exitX: 5,
                exitY: 1,
                exitKeyX: 5,
                exitKeyY: 2,
            },
            {
                num: 2,
                enabled: true,
                x: 0,
                y: 2,
                exitX: 5,
                exitY: 0,
                exitKeyX: 1,
                exitKeyY: 1,
            },
            {
                num: 3,
                enabled: true,
                x: 3,
                y: 0,
                exitX: 5,
                exitY: 5,
                exitKeyX: 4,
                exitKeyY: 0,
            },
        ],
        doors: [
            {
                value: 2,
                x: 3,
                y: 0,
            },
            {
                value: 4,
                x: 2,
                y: 5,
            },
        ],
        plates: [
            {
                value: 1,
                x: 4,
                y: 5,
            },
            {
                value: 0,
                x: 0,
                y: 0,
            },
        ],
        holes: [
            {
                value: 3,
                x: 4,
                y: 5,
            },
            {
                value: 1,
                x: 1,
                y: 1,
            },
        ],
        traps: [
            {
                value: 0,
                x: 0,
                y: 3,
            },
        ],
        teleports: [
            {
                value: 0,
                x: 2,
                y: 0,
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