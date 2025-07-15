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