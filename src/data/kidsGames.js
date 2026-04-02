export const kidsGames = [
    {
        id: 'find-similar-shapes',
        titleKey: 'findSimilarShapes',
        descKey: 'findSimilarShapesDesc',
        category: 'logic',
        difficulty: 'easy',
        gradient: 'from-emerald-500 to-teal-600',
        iconName: 'Shapes',
        gameType: 'matching',
        data: {
            type: 'DirectMatch',
            items: ['🔴', '🟦', '🔺', '⭐', '🔷', '🟣', '🟧', '💚']
        }
    },
    {
        id: 'shapes-and-animals',
        titleKey: 'shapesAndAnimals',
        descKey: 'shapesAndAnimalsDesc',
        category: 'shapes',
        difficulty: 'easy',
        gradient: 'from-pink-500 to-rose-600',
        iconName: 'Heart',
        gameType: 'matching',
        data: {
            type: 'Pairs',
            pairs: [
                { q: '🔴', a: '🐞' },
                { q: '🔺', a: '🍕' },
                { q: '🟦', a: '🎁' },
                { q: '⭐', a: '🌟' },
                { q: '🥚', a: '🥑' }
            ]
        }
    },
    {
        id: 'object-shadows',
        titleKey: 'objectShadows',
        descKey: 'objectShadowsDesc',
        category: 'logic',
        difficulty: 'medium',
        gradient: 'from-violet-500 to-purple-600',
        iconName: 'Moon',
        gameType: 'matching',
        data: {
            type: 'Pairs',
            pairs: [
                { q: '🚗', a: '🚘' },
                { q: '🦋', a: '🦇' },
                { q: '🐱', a: '🐈' },
                { q: '✈️', a: '🛫' },
                { q: '🌲', a: '🎄' }
            ]
        }
    },
    {
        id: 'number-sequence',
        titleKey: 'numberSequence',
        descKey: 'numberSequenceDesc',
        category: 'numbers',
        difficulty: 'medium',
        gradient: 'from-orange-500 to-amber-600',
        iconName: 'Hash',
        gameType: 'sequence',
        data: {
            levels: [
                { sequence: [1, 2, 3, '?'], answer: 4, options: [4, 5, 2] },
                { sequence: [2, 4, 6, '?'], answer: 8, options: [7, 8, 9] },
                { sequence: [10, 20, 30, '?'], answer: 40, options: [35, 40, 50] },
                { sequence: [5, 4, 3, '?'], answer: 2, options: [1, 2, 6] },
                { sequence: [1, 3, 5, '?'], answer: 7, options: [6, 7, 8] }
            ]
        }
    },
    {
        id: 'right-wrong-pictures',
        titleKey: 'rightWrongPictures',
        descKey: 'rightWrongPicturesDesc',
        category: 'pictures',
        difficulty: 'easy',
        gradient: 'from-blue-500 to-indigo-600',
        iconName: 'CheckCircle',
        gameType: 'choice',
        data: {
            questions: [
                { textKey: 'question1', isCorrect: true },
                { textKey: 'question2', isCorrect: false },
                { textKey: 'question3', isCorrect: true },
                { textKey: 'question4', isCorrect: false },
                { textKey: 'question5', isCorrect: false },
                { textKey: 'question6', isCorrect: true },
                { textKey: 'question7', isCorrect: false },
                { textKey: 'question8', isCorrect: true }
            ]
        }
    },
    {
        id: 'find-professions',
        titleKey: 'findProfessions',
        descKey: 'findProfessionsDesc',
        category: 'pictures',
        difficulty: 'medium',
        gradient: 'from-cyan-500 to-blue-600',
        iconName: 'Briefcase',
        gameType: 'matching',
        data: {
            type: 'Pairs',
            pairs: [
                { q: '👨‍⚕️', a: '🩺' },
                { q: '👨‍🍳', a: '🍳' },
                { q: '👮', a: '🚓' },
                { q: '👨‍🚒', a: '🚒' },
                { q: '🎨', a: '🖌️' }
            ]
        }
    },
    {
        id: 'color-matching',
        titleKey: 'colorMatching',
        descKey: 'colorMatchingDesc',
        category: 'logic',
        difficulty: 'easy',
        gradient: 'from-red-500 to-pink-600',
        iconName: 'Palette',
        gameType: 'matching',
        data: {
            type: 'Pairs',
            pairs: [
                { q: '🍎', a: '🔴' },
                { q: '🍋', a: '🟡' },
                { q: '🥒', a: '🟢' },
                { q: '🍇', a: '🟣' },
                { q: '🥕', a: '🟠' },
                { q: '🫐', a: '🔵' }
            ]
        }
    },
    {
        id: 'count-objects',
        titleKey: 'countObjects',
        descKey: 'countObjectsDesc',
        category: 'numbers',
        difficulty: 'easy',
        gradient: 'from-lime-500 to-green-600',
        iconName: 'Calculator',
        gameType: 'counting',
        data: {
            levels: [
                { items: '🍎🍎', answer: 2, options: [1, 2, 3] },
                { items: '⭐⭐⭐', answer: 3, options: [2, 3, 4] },
                { items: '🌸🌸🌸🌸', answer: 4, options: [3, 4, 5] },
                { items: '🐱🐱🐱🐱🐱', answer: 5, options: [4, 5, 6] },
                { items: '🎈🎈🎈🎈🎈🎈', answer: 6, options: [5, 6, 7] },
                { items: '🍪🍪🍪🍪🍪🍪🍪', answer: 7, options: [6, 7, 8] },
                { items: '🦋🦋🦋🦋🦋🦋🦋🦋', answer: 8, options: [7, 8, 9] }
            ]
        }
    },
    {
        id: 'memory-cards',
        titleKey: 'memoryCards',
        descKey: 'memoryCardsDesc',
        category: 'memory',
        difficulty: 'medium',
        gradient: 'from-indigo-500 to-violet-600',
        iconName: 'LayoutGrid',
        gameType: 'memory',
        data: {
            cards: ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼']
        }
    }
];

export const categories = [
    { id: 'all', nameKey: 'allGames', iconName: 'Gamepad2' },
    { id: 'logic', nameKey: 'logicGames', iconName: 'Puzzle' },
    { id: 'memory', nameKey: 'memoryGames', iconName: 'Brain' },
    { id: 'numbers', nameKey: 'numberGames', iconName: 'Hash' },
    { id: 'shapes', nameKey: 'shapeGames', iconName: 'Hexagon' },
    { id: 'pictures', nameKey: 'pictureGames', iconName: 'Image' }
];
