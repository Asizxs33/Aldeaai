/**
 * AI Tools Data - Categories and Tools
 * Note: icon names must match lucide-react icon component names
 */

export const aiToolsCategories = [
    {
        id: 'development',
        nameKey: 'aiToolsDevelopment',
        descriptionKey: 'aiToolsDevelopmentDesc',
        icon: 'Code',
        gradient: 'from-blue-500 to-cyan-500',
        tools: [
            {
                id: 'cursor-bolt',
                name: 'Cursor',
                description: 'AI-powered code editor with autocomplete and suggestions. Write code faster with intelligent completions.',
                url: 'https://cursor.sh',
                icon: 'MousePointer',
                isPopular: true
            },
            {
                id: 'github-copilot',
                name: 'GitHub Copilot',
                description: 'AI pair programmer that suggests code in real-time. Works with all major languages and frameworks.',
                url: 'https://github.com/features/copilot',
                icon: 'Code2',
                isPopular: true
            },
            {
                id: 'tabnine',
                name: 'Tabnine',
                description: 'AI code completion for all languages. Supports 30+ programming languages with deep learning models.',
                url: 'https://www.tabnine.com',
                icon: 'Zap'
            },
            {
                id: 'replit-ghostwriter',
                name: 'Replit Ghostwriter',
                description: 'AI code assistant in your browser. Generate, explain, and debug code instantly.',
                url: 'https://replit.com/ghostwriter',
                icon: 'Terminal'
            },
            {
                id: 'codeium',
                name: 'Codeium',
                description: 'Free AI-powered code completion and chat. Supports VS Code, JetBrains, and more.',
                url: 'https://codeium.com',
                icon: 'Sparkles'
            },
            {
                id: 'amazon-codewhisperer',
                name: 'Amazon CodeWhisperer',
                description: 'AI coding companion from Amazon. Provides real-time code suggestions and security scans.',
                url: 'https://aws.amazon.com/codewhisperer',
                icon: 'Server'
            },
            {
                id: 'sourcegraph-cody',
                name: 'Sourcegraph Cody',
                description: 'AI coding assistant that understands your entire codebase. Answer questions and generate code.',
                url: 'https://sourcegraph.com/cody',
                icon: 'Search'
            },
            {
                id: 'windsurf',
                name: 'Windsurf',
                description: 'AI-powered IDE built for developers. Context-aware code generation and editing.',
                url: 'https://codeium.com/windsurf',
                icon: 'Wind'
            },
            {
                id: 'codeium-chat',
                name: 'Codeium Chat',
                description: 'AI chat assistant for coding. Ask questions about your code and get instant answers.',
                url: 'https://codeium.com/chat',
                icon: 'MessageSquare'
            },
            {
                id: 'blackbox-ai',
                name: 'Blackbox AI',
                description: 'AI code completion tool. Autocomplete code in any programming language instantly.',
                url: 'https://www.blackbox.ai',
                icon: 'Box'
            },
            {
                id: 'aide',
                name: 'Aide',
                description: 'AI coding assistant with context awareness. Understands your codebase and suggests improvements.',
                url: 'https://aide.app',
                icon: 'Code'
            },
            {
                id: 'continue-dev',
                name: 'Continue',
                description: 'Open-source AI code completion. Self-hosted alternative to GitHub Copilot.',
                url: 'https://continue.dev',
                icon: 'GitBranch'
            }
        ]
    },
    {
        id: 'writing',
        nameKey: 'aiToolsWriting',
        descriptionKey: 'aiToolsWritingDesc',
        icon: 'PenTool',
        gradient: 'from-purple-500 to-pink-500',
        tools: [
            {
                id: 'chatgpt',
                name: 'ChatGPT',
                description: 'Conversational AI for writing and assistance. Create content, edit text, and get answers instantly.',
                url: 'https://chat.openai.com',
                icon: 'MessageSquare',
                isPopular: true
            },
            {
                id: 'claude',
                name: 'Claude AI',
                description: 'Advanced AI assistant for writing. Long-form content creation with excellent reasoning capabilities.',
                url: 'https://claude.ai',
                icon: 'Bot',
                isPopular: true
            },
            {
                id: 'jasper',
                name: 'Jasper AI',
                description: 'AI writing assistant for content creation. Blog posts, ads, emails, and more.',
                url: 'https://www.jasper.ai',
                icon: 'FileText'
            },
            {
                id: 'copy-ai',
                name: 'Copy.ai',
                description: 'AI-powered copywriting tool. Generate marketing copy, product descriptions, and social media content.',
                url: 'https://www.copy.ai',
                icon: 'Edit'
            },
            {
                id: 'notion-ai-writing',
                name: 'Notion AI',
                description: 'AI writing and organization in Notion. Write, edit, summarize, and translate text seamlessly.',
                url: 'https://www.notion.so/product/ai',
                icon: 'FileText',
                isPopular: true
            },
            {
                id: 'writesonic',
                name: 'Writesonic',
                description: 'AI writer for blogs, ads, emails, and landing pages. Generate SEO-optimized content quickly.',
                url: 'https://writesonic.com',
                icon: 'PenTool'
            },
            {
                id: 'rytr',
                name: 'Rytr',
                description: 'AI writing assistant for 40+ use cases. Create content in 30+ languages with various tones.',
                url: 'https://rytr.me',
                icon: 'FileText'
            },
            {
                id: 'wordtune',
                name: 'Wordtune',
                description: 'AI-powered writing companion. Rewrite, expand, shorten, and improve your text.',
                url: 'https://www.wordtune.com',
                icon: 'RefreshCw'
            },
            {
                id: 'grammarly',
                name: 'Grammarly',
                description: 'AI writing assistant and grammar checker. Improve clarity, tone, and correctness of your writing.',
                url: 'https://www.grammarly.com',
                icon: 'CheckCircle',
                isPopular: true
            },
            {
                id: 'perplexity',
                name: 'Perplexity AI',
                description: 'AI-powered research and writing assistant. Get accurate answers with sources and citations.',
                url: 'https://www.perplexity.ai',
                icon: 'Search'
            },
            {
                id: 'copy-ai-v2',
                name: 'Copy.ai Workflows',
                description: 'AI workflow automation for content. Create multi-step content generation processes.',
                url: 'https://www.copy.ai/workflows',
                icon: 'GitBranch'
            },
            {
                id: 'frase-io',
                name: 'Frase.io',
                description: 'AI content optimization tool. Research, write, and optimize content for SEO.',
                url: 'https://www.frase.io',
                icon: 'TrendingUp'
            },
            {
                id: 'surfer-seo',
                name: 'Surfer SEO',
                description: 'AI content editor for SEO. Optimize content with real-time SEO recommendations.',
                url: 'https://surferseo.com',
                icon: 'BarChart3'
            },
            {
                id: 'writer',
                name: 'Writer',
                description: 'AI writing platform for teams. Create consistent, on-brand content at scale.',
                url: 'https://writer.com',
                icon: 'Users'
            },
            {
                id: 'jenni-ai',
                name: 'Jenni AI',
                description: 'AI writing assistant for academic writing. Generate citations, research papers, and essays.',
                url: 'https://jenni.ai',
                icon: 'GraduationCap'
            }
        ]
    },
    {
        id: 'design',
        nameKey: 'aiToolsDesign',
        descriptionKey: 'aiToolsDesignDesc',
        icon: 'Palette',
        gradient: 'from-pink-500 to-rose-500',
        tools: [
            {
                id: 'midjourney',
                name: 'Midjourney',
                description: 'AI art generator from text prompts. Create stunning images, illustrations, and digital art.',
                url: 'https://www.midjourney.com',
                icon: 'Image',
                isPopular: true
            },
            {
                id: 'dalle',
                name: 'DALL-E',
                description: 'OpenAI image generation from text. Create realistic images and artwork with detailed prompts.',
                url: 'https://openai.com/dall-e-2',
                icon: 'Sparkles',
                isPopular: true
            },
            {
                id: 'stable-diffusion',
                name: 'Stable Diffusion',
                description: 'Open-source AI image generation. Create high-quality images with fine-grained control.',
                url: 'https://stability.ai/stable-diffusion',
                icon: 'Wand2'
            },
            {
                id: 'leonardo-ai',
                name: 'Leonardo.ai',
                description: 'AI image generation platform. Create game assets, marketing visuals, and artistic images.',
                url: 'https://leonardo.ai',
                icon: 'Palette'
            },
            {
                id: 'canva-ai',
                name: 'Canva AI',
                description: 'AI-powered design tool. Generate designs, remove backgrounds, and create content instantly.',
                url: 'https://www.canva.com',
                icon: 'Palette',
                isPopular: true
            },
            {
                id: 'figma-ai',
                name: 'Figma AI',
                description: 'AI features for design workflow. Generate designs, icons, and layouts with natural language.',
                url: 'https://www.figma.com',
                icon: 'Layers'
            },
            {
                id: 'adobe-firefly',
                name: 'Adobe Firefly',
                description: 'Adobe\'s creative generative AI. Create images, text effects, and recolors for creative projects.',
                url: 'https://www.adobe.com/products/firefly.html',
                icon: 'Sparkles'
            },
            {
                id: 'remove-bg',
                name: 'Remove.bg',
                description: 'AI background remover. Instantly remove backgrounds from images with precision.',
                url: 'https://www.remove.bg',
                icon: 'Scissors'
            },
            {
                id: 'upscale-media',
                name: 'Upscale.media',
                description: 'AI image upscaler. Enhance image quality and resolution using advanced AI algorithms.',
                url: 'https://www.upscale.media',
                icon: 'Maximize2'
            },
            {
                id: 'clipdrop',
                name: 'Clipdrop',
                description: 'AI image editing tools. Remove backgrounds, upscale images, and clean up photos.',
                url: 'https://clipdrop.co',
                icon: 'Image'
            },
            {
                id: 'flair-ai',
                name: 'Flair AI',
                description: 'AI design tool for branded content. Create product photos and marketing visuals automatically.',
                url: 'https://flair.ai',
                icon: 'ShoppingBag'
            },
            {
                id: 'magicstudio',
                name: 'Magic Studio',
                description: 'AI image editing suite. Remove objects, change backgrounds, and enhance photos.',
                url: 'https://magicstudio.com',
                icon: 'Sparkles'
            },
            {
                id: 'playground-ai',
                name: 'Playground AI',
                description: 'AI image generation with advanced controls. Mix models, adjust parameters, and create art.',
                url: 'https://playgroundai.com',
                icon: 'Layout'
            },
            {
                id: 'lexica-art',
                name: 'Lexica',
                description: 'AI art search and generation. Browse millions of AI-generated images and create your own.',
                url: 'https://lexica.art',
                icon: 'Search'
            },
            {
                id: 'craiyon',
                name: 'Craiyon',
                description: 'Free AI image generator. Create images from text prompts using advanced AI models.',
                url: 'https://www.craiyon.com',
                icon: 'Image'
            },
            {
                id: 'artbreeder',
                name: 'Artbreeder',
                description: 'AI art creation tool. Mix and evolve images to create unique artworks and portraits.',
                url: 'https://www.artbreeder.com',
                icon: 'Flower2'
            }
        ]
    },
    {
        id: 'education',
        nameKey: 'aiToolsEducation',
        descriptionKey: 'aiToolsEducationDesc',
        icon: 'GraduationCap',
        gradient: 'from-emerald-500 to-teal-500',
        tools: [
            {
                id: 'khan-academy',
                name: 'Khan Academy',
                description: 'Free online courses with AI-powered tutoring. Personalized learning for students of all ages.',
                url: 'https://www.khanacademy.org',
                icon: 'BookOpen'
            },
            {
                id: 'duolingo',
                name: 'Duolingo',
                description: 'AI-powered language learning. Learn 40+ languages with personalized lessons and practice.',
                url: 'https://www.duolingo.com',
                icon: 'Globe',
                isPopular: true
            },
            {
                id: 'quizlet',
                name: 'Quizlet',
                description: 'AI study tools and flashcards. Create study sets, take practice tests, and learn efficiently.',
                url: 'https://quizlet.com',
                icon: 'FileQuestion',
                isPopular: true
            },
            {
                id: 'grammarly-education',
                name: 'Grammarly',
                description: 'AI writing assistant and grammar checker. Improve academic writing and communication skills.',
                url: 'https://www.grammarly.com',
                icon: 'CheckCircle'
            },
            {
                id: 'coursera',
                name: 'Coursera',
                description: 'Online courses from top universities. AI-powered personalized learning paths and recommendations.',
                url: 'https://www.coursera.org',
                icon: 'GraduationCap'
            },
            {
                id: 'memrise',
                name: 'Memrise',
                description: 'AI-powered language learning platform. Learn languages through spaced repetition and AI tutors.',
                url: 'https://www.memrise.com',
                icon: 'Brain'
            },
            {
                id: 'brainly',
                name: 'Brainly',
                description: 'AI-powered homework help and study platform. Get answers and explanations from AI and community.',
                url: 'https://brainly.com',
                icon: 'HelpCircle'
            },
            {
                id: 'socratic',
                name: 'Socratic',
                description: 'AI-powered learning app by Google. Get step-by-step explanations for homework questions.',
                url: 'https://socratic.org',
                icon: 'Lightbulb'
            },
            {
                id: 'edx',
                name: 'edX',
                description: 'Online learning platform with AI features. Courses from world\'s best universities and institutions.',
                url: 'https://www.edx.org',
                icon: 'Book'
            },
            {
                id: 'udemy',
                name: 'Udemy',
                description: 'Online learning marketplace. AI-powered course recommendations and personalized learning paths.',
                url: 'https://www.udemy.com',
                icon: 'Video'
            },
            {
                id: 'skillshare',
                name: 'Skillshare',
                description: 'Online learning community. AI-curated courses and projects for creative and professional skills.',
                url: 'https://www.skillshare.com',
                icon: 'Users'
            },
            {
                id: 'chegg',
                name: 'Chegg',
                description: 'AI-powered study platform. Get textbook solutions, expert Q&A, and homework help.',
                url: 'https://www.chegg.com',
                icon: 'BookOpen'
            },
            {
                id: 'course-hero',
                name: 'Course Hero',
                description: 'AI study resources platform. Access study materials, practice problems, and AI tutors.',
                url: 'https://www.coursehero.com',
                icon: 'FileText'
            }
        ]
    },
    {
        id: 'productivity',
        nameKey: 'aiToolsProductivity',
        descriptionKey: 'aiToolsProductivityDesc',
        icon: 'Rocket',
        gradient: 'from-orange-500 to-amber-500',
        tools: [
            {
                id: 'notion-ai',
                name: 'Notion AI',
                description: 'AI writing and organization in Notion. Write, edit, summarize, and translate text seamlessly.',
                url: 'https://www.notion.so/product/ai',
                icon: 'FileText',
                isPopular: true
            },
            {
                id: 'todoist',
                name: 'Todoist',
                description: 'AI task management assistant. Organize tasks, set priorities, and boost productivity.',
                url: 'https://todoist.com',
                icon: 'CheckSquare'
            },
            {
                id: 'trello',
                name: 'Trello',
                description: 'AI-powered project management. Organize tasks, collaborate, and track progress with AI assistance.',
                url: 'https://trello.com',
                icon: 'Layout'
            },
            {
                id: 'motion',
                name: 'Motion',
                description: 'AI calendar and task management. Automatically schedules your tasks based on priorities and deadlines.',
                url: 'https://www.usemotion.com',
                icon: 'Calendar'
            },
            {
                id: 'reclaim-ai',
                name: 'Reclaim AI',
                description: 'AI calendar assistant. Automatically blocks time for tasks and optimizes your schedule.',
                url: 'https://reclaim.ai',
                icon: 'Clock'
            },
            {
                id: 'goblin-tools',
                name: 'Goblin.tools',
                description: 'Collection of AI-powered productivity tools. Break down tasks, estimate time, and organize thoughts.',
                url: 'https://goblin.tools',
                icon: 'Wrench'
            },
            {
                id: 'otter-ai',
                name: 'Otter.ai',
                description: 'AI meeting assistant. Transcribe, summarize, and organize your meetings automatically.',
                url: 'https://otter.ai',
                icon: 'Mic',
                isPopular: true
            },
            {
                id: 'fireflies',
                name: 'Fireflies.ai',
                description: 'AI meeting recorder and transcription. Capture, search, and share insights from your meetings.',
                url: 'https://fireflies.ai',
                icon: 'Video'
            },
            {
                id: 'cal-com',
                name: 'Cal.com AI',
                description: 'AI-powered scheduling assistant. Automatically find meeting times and manage your calendar.',
                url: 'https://cal.com',
                icon: 'Calendar'
            },
            {
                id: 'x-ai-grok',
                name: 'Grok',
                description: 'AI assistant by X (Twitter). Real-time information access and conversational AI.',
                url: 'https://x.ai',
                icon: 'MessageSquare'
            },
            {
                id: 'julius-ai',
                name: 'Julius AI',
                description: 'AI data analyst. Analyze data, create visualizations, and generate insights from spreadsheets.',
                url: 'https://julius.ai',
                icon: 'BarChart3'
            },
            {
                id: 'formula-bot',
                name: 'Formula Bot',
                description: 'AI Excel and Sheets assistant. Generate formulas, explain functions, and automate tasks.',
                url: 'https://formulabot.com',
                icon: 'Calculator'
            }
        ]
    },
    {
        id: 'video',
        nameKey: 'aiToolsVideo',
        descriptionKey: 'aiToolsVideoDesc',
        icon: 'Video',
        gradient: 'from-red-500 to-pink-500',
        tools: [
            {
                id: 'runway',
                name: 'Runway ML',
                description: 'AI video generation and editing. Create videos, edit frames, and generate content with AI.',
                url: 'https://runwayml.com',
                icon: 'Film',
                isPopular: true
            },
            {
                id: 'synthesia',
                name: 'Synthesia',
                description: 'AI video avatar creation. Create professional videos with AI avatars in 120+ languages.',
                url: 'https://www.synthesia.io',
                icon: 'User',
                isPopular: true
            },
            {
                id: 'pictory',
                name: 'Pictory',
                description: 'AI video creation from text. Transform articles and scripts into engaging videos automatically.',
                url: 'https://pictory.ai',
                icon: 'Video'
            },
            {
                id: 'invideo',
                name: 'InVideo AI',
                description: 'AI video editor and generator. Create professional videos from text prompts in minutes.',
                url: 'https://invideo.io/ai',
                icon: 'Video'
            },
            {
                id: 'descript',
                name: 'Descript',
                description: 'AI video and audio editor. Edit videos by editing text, remove filler words, and more.',
                url: 'https://www.descript.com',
                icon: 'Edit',
                isPopular: true
            },
            {
                id: 'luma-dream-machine',
                name: 'Luma Dream Machine',
                description: 'AI video generation from text and images. Create high-quality videos with realistic motion.',
                url: 'https://lumalabs.ai/dream-machine',
                icon: 'Sparkles'
            },
            {
                id: 'pika-art',
                name: 'Pika Art',
                description: 'AI video generation platform. Create and edit videos with text prompts and image inputs.',
                url: 'https://pika.art',
                icon: 'Film'
            },
            {
                id: 'kapwing',
                name: 'Kapwing',
                description: 'AI-powered video editing. Auto-generate subtitles, remove backgrounds, and edit videos online.',
                url: 'https://www.kapwing.com',
                icon: 'Scissors'
            },
            {
                id: 'veed',
                name: 'VEED.io',
                description: 'AI video editor. Auto-subtitles, translations, background removal, and more video editing tools.',
                url: 'https://www.veed.io',
                icon: 'Video'
            },
            {
                id: 'fliki',
                name: 'Fliki',
                description: 'AI video creation from text. Transform blog posts into videos with AI voices and images.',
                url: 'https://fliki.ai',
                icon: 'Mic'
            },
            {
                id: 'd-id',
                name: 'D-ID',
                description: 'AI video creation with talking avatars. Create videos from photos with realistic lip-sync.',
                url: 'https://www.d-id.com',
                icon: 'User'
            },
            {
                id: 'heygen',
                name: 'HeyGen',
                description: 'AI video generation platform. Create talking avatar videos for marketing and presentations.',
                url: 'https://www.heygen.com',
                icon: 'Video'
            }
        ]
    },
    {
        id: 'audio',
        nameKey: 'aiToolsAudio',
        descriptionKey: 'aiToolsAudioDesc',
        icon: 'Headphones',
        gradient: 'from-violet-500 to-purple-500',
        tools: [
            {
                id: 'mubert',
                name: 'Mubert',
                description: 'AI music generator. Create royalty-free music for videos, podcasts, and projects.',
                url: 'https://mubert.com',
                icon: 'Music',
                isPopular: true
            },
            {
                id: 'suno-ai',
                name: 'Suno AI',
                description: 'AI music creation. Generate complete songs from text prompts with vocals and instruments.',
                url: 'https://suno.ai',
                icon: 'Music',
                isPopular: true
            },
            {
                id: 'elevenlabs',
                name: 'ElevenLabs',
                description: 'AI voice synthesis. Create natural-sounding voiceovers in multiple languages and accents.',
                url: 'https://elevenlabs.io',
                icon: 'Mic',
                isPopular: true
            },
            {
                id: 'play-ht',
                name: 'Play.ht',
                description: 'AI text-to-speech platform. Convert text to natural-sounding voice in 600+ voices.',
                url: 'https://play.ht',
                icon: 'Volume2'
            },
            {
                id: 'murf',
                name: 'Murf',
                description: 'AI voice generator. Create professional voiceovers for videos, presentations, and podcasts.',
                url: 'https://murf.ai',
                icon: 'Mic'
            },
            {
                id: 'lovo-ai',
                name: 'LOVO AI',
                description: 'AI voice and video generation. Create realistic voiceovers and AI avatars for content.',
                url: 'https://lovo.ai',
                icon: 'Headphones'
            },
            {
                id: 'uberduck',
                name: 'Uberduck',
                description: 'AI voice synthesis platform. Create voices, clone voices, and generate audio content.',
                url: 'https://uberduck.ai',
                icon: 'Music'
            },
            {
                id: 'boomy',
                name: 'Boomy',
                description: 'AI music creator. Generate original songs in seconds with customizable styles and genres.',
                url: 'https://boomy.com',
                icon: 'Music'
            },
            {
                id: 'aiva',
                name: 'AIVA',
                description: 'AI music composition. Create original music tracks for films, games, and commercial use.',
                url: 'https://www.aiva.ai',
                icon: 'Music'
            },
            {
                id: 'soundraw',
                name: 'Soundraw',
                description: 'AI music generator. Create custom music tracks by adjusting mood, genre, and length.',
                url: 'https://soundraw.io',
                icon: 'Music'
            }
        ]
    },
    {
        id: 'business',
        nameKey: 'aiToolsBusiness',
        descriptionKey: 'aiToolsBusinessDesc',
        icon: 'Briefcase',
        gradient: 'from-indigo-500 to-blue-500',
        tools: [
            {
                id: 'jenni-ai-business',
                name: 'Jenni AI',
                description: 'AI writing for business. Generate reports, emails, proposals, and business documents.',
                url: 'https://jenni.ai',
                icon: 'Briefcase'
            },
            {
                id: 'copy-ai-business',
                name: 'Copy.ai',
                description: 'AI copywriting for marketing. Create ads, emails, landing pages, and social media content.',
                url: 'https://www.copy.ai',
                icon: 'TrendingUp'
            },
            {
                id: 'jasper-business',
                name: 'Jasper',
                description: 'AI content platform for businesses. Create marketing content at scale with brand voice.',
                url: 'https://www.jasper.ai',
                icon: 'FileText'
            },
            {
                id: 'lexisnexis',
                name: 'LexisNexis AI',
                description: 'AI-powered legal research. Find cases, statutes, and legal documents with AI assistance.',
                url: 'https://www.lexisnexis.com',
                icon: 'Gavel'
            },
            {
                id: 'harvey-ai',
                name: 'Harvey AI',
                description: 'AI assistant for legal professionals. Research, draft documents, and answer legal questions.',
                url: 'https://harvey.ai',
                icon: 'Gavel'
            },
            {
                id: 'zapier-ai',
                name: 'Zapier AI',
                description: 'AI workflow automation. Connect apps and automate business processes with AI.',
                url: 'https://zapier.com',
                icon: 'GitBranch'
            },
            {
                id: 'make-ai',
                name: 'Make (Integromat)',
                description: 'AI-powered automation platform. Build workflows and integrate apps with AI assistance.',
                url: 'https://www.make.com',
                icon: 'Network'
            },
            {
                id: 'chatfuel',
                name: 'Chatfuel',
                description: 'AI chatbot builder. Create AI-powered chatbots for customer service and engagement.',
                url: 'https://chatfuel.com',
                icon: 'MessageCircle'
            },
            {
                id: 'tidio',
                name: 'Tidio',
                description: 'AI customer service platform. Automated chatbots and live chat with AI support.',
                url: 'https://www.tidio.com',
                icon: 'Headphones'
            }
        ]
    },
    {
        id: 'research',
        nameKey: 'aiToolsResearch',
        descriptionKey: 'aiToolsResearchDesc',
        icon: 'Search',
        gradient: 'from-green-500 to-emerald-500',
        tools: [
            {
                id: 'perplexity-research',
                name: 'Perplexity AI',
                description: 'AI-powered research assistant. Get accurate answers with sources and citations.',
                url: 'https://www.perplexity.ai',
                icon: 'Search',
                isPopular: true
            },
            {
                id: 'consensus',
                name: 'Consensus',
                description: 'AI research tool. Get evidence-based answers from scientific research papers.',
                url: 'https://consensus.app',
                icon: 'FileSearch'
            },
            {
                id: 'elicit',
                name: 'Elicit',
                description: 'AI research assistant. Automate research workflows and extract insights from papers.',
                url: 'https://elicit.com',
                icon: 'Search'
            },
            {
                id: 'scispace',
                name: 'SciSpace',
                description: 'AI research assistant. Read, understand, and explain scientific papers with AI.',
                url: 'https://typeset.io',
                icon: 'BookOpen'
            },
            {
                id: 'connected-papers',
                name: 'Connected Papers',
                description: 'AI research graph. Visualize connections between academic papers and discover related research.',
                url: 'https://www.connectedpapers.com',
                icon: 'Network'
            },
            {
                id: 'research-rabbit',
                name: 'Research Rabbit',
                description: 'AI literature discovery. Find and explore research papers with AI-powered recommendations.',
                url: 'https://www.researchrabbit.ai',
                icon: 'Search'
            },
            {
                id: 'chatpdf',
                name: 'ChatPDF',
                description: 'AI PDF assistant. Ask questions about PDF documents and get instant answers.',
                url: 'https://www.chatpdf.com',
                icon: 'FileText'
            },
            {
                id: 'humata',
                name: 'Humata',
                description: 'AI research assistant for documents. Ask questions, summarize, and analyze PDF files.',
                url: 'https://www.humata.ai',
                icon: 'FileQuestion'
            }
        ]
    },
    {
        id: 'useful-teachers',
        nameKey: 'aiToolsUsefulTeachers',
        descriptionKey: 'aiToolsUsefulTeachersDesc',
        icon: 'GraduationCap', // Reusing GraduationCap or maybe Lightbulb? Let's use Lightbulb for "Useful"
        gradient: 'from-yellow-500 to-orange-500',
        tools: [
            {
                id: 'magic-school-ai',
                name: 'Magic School AI',
                description: 'AI platform for teachers. Generate lesson plans, rubrics, emails, and more.',
                url: 'https://www.magicschool.ai',
                icon: 'Sparkles',
                isPopular: true
            },
            {
                id: 'curipod',
                name: 'Curipod',
                description: 'Interactive AI presentation tool. Create polls, word clouds, and open questions instantly.',
                url: 'https://curipod.com',
                icon: 'Presentation'
            },
            {
                id: 'diffit',
                name: 'Diffit',
                description: 'AI differentiation tool. Adapt reading materials for any grade level instantly.',
                url: 'https://web.diffit.me',
                icon: 'FileText'
            },
            {
                id: 'educaipy',
                name: 'EducaiPy',
                description: 'AI tools for creating educational content. Quizzes, flashcards, and more.',
                url: 'https://www.educaipy.com',
                icon: 'Brain'
            },
            {
                id: 'quizizz',
                name: 'Quizizz',
                description: 'Gamified quizzes and interactive lessons. Engage students with AI-generated questions.',
                url: 'https://quizizz.com',
                icon: 'FileQuestion',
                isPopular: true
            }
        ]
    }
];

export const getCategoryById = (id) => {
    return aiToolsCategories.find(cat => cat.id === id);
};

export const getToolById = (categoryId, toolId) => {
    const category = getCategoryById(categoryId);
    if (!category) return null;
    return category.tools.find(tool => tool.id === toolId);
};
