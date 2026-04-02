// Presentation Templates Data
export const presentationTemplates = [
    {
        id: 'modern-blue',
        name: 'Ocean Depth',
        description: 'Глубокий синий градиент для серьезных проектов',
        preview: 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900',
        colors: {
            primary: 'from-blue-900 via-blue-800 to-indigo-900',
            secondary: 'from-blue-400 to-cyan-300',
            accent: 'from-emerald-400 to-teal-500',
            text: 'text-white',
            bg: 'bg-slate-900'
        },
        layout: 'centered'
    },
    {
        id: 'cosmic-dark',
        name: 'Cosmic Dark',
        description: 'Космическая тема с фиолетовыми оттенками',
        preview: 'bg-gradient-to-br from-gray-900 via-purple-900 to-black',
        colors: {
            primary: 'from-gray-900 via-purple-900 to-black',
            secondary: 'from-fuchsia-500 to-purple-600',
            accent: 'from-blue-400 to-cyan-400',
            text: 'text-white',
            bg: 'bg-black'
        },
        layout: 'centered'
    },
    {
        id: 'sunset-bliss',
        name: 'Sunset Bliss',
        description: 'Теплые закатные тона для креатива',
        preview: 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600',
        colors: {
            primary: 'from-orange-400 via-pink-500 to-purple-600',
            secondary: 'from-yellow-200 to-orange-100',
            accent: 'from-yellow-400 to-orange-500',
            text: 'text-white',
            bg: 'bg-gray-900'
        },
        layout: 'split'
    },
    {
        id: 'emerald-city',
        name: 'Emerald City',
        description: 'Свежий зеленый стиль для природы и экологии',
        preview: 'bg-gradient-to-br from-emerald-600 to-teal-900',
        colors: {
            primary: 'from-emerald-600 to-teal-900',
            secondary: 'from-emerald-300 to-green-200',
            accent: 'from-lime-400 to-yellow-300',
            text: 'text-white',
            bg: 'bg-green-950'
        },
        layout: 'left-aligned'
    },
    {
        id: 'minimal-glass',
        name: 'Minimal Glass',
        description: 'Светлый минимализм с эффектом стекла',
        preview: 'bg-gradient-to-br from-gray-100 to-white border border-gray-200',
        colors: {
            primary: 'from-gray-50 to-white',
            secondary: 'from-gray-500 to-gray-700',
            accent: 'from-blue-500 to-indigo-600',
            text: 'text-gray-900',
            bg: 'bg-white'
        },
        layout: 'centered'
    },
    {
        id: 'neon-cyber',
        name: 'Neon Cyber',
        description: 'Неоновый киберпанк стиль',
        preview: 'bg-gradient-to-br from-black via-gray-900 to-slate-900 border border-fuchsia-500',
        colors: {
            primary: 'from-black via-gray-900 to-slate-900',
            secondary: 'from-cyan-400 to-blue-500',
            accent: 'from-fuchsia-500 to-pink-500',
            text: 'text-white',
            bg: 'bg-black'
        },
        layout: 'split'
    }
];

export const getTemplateById = (id) => {
    return presentationTemplates.find(t => t.id === id) || presentationTemplates[0];
};
