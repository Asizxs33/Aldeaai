/**
 * Logo URLs for AI tools
 * Uses favicon API or direct image URLs
 */

export const getToolLogo = (url) => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        // Use Google Favicon API (simple and reliable)
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (error) {
        // Fallback to a default icon
        return 'https://www.google.com/s2/favicons?domain=example.com&sz=128';
    }
};

/**
 * Direct logo URLs for popular tools (higher quality)
 */
export const toolLogoUrls = {
    // Development
    'cursor-bolt': 'https://www.cursor.sh/favicon.ico',
    'github-copilot': 'https://github.com/favicon.ico',
    'tabnine': 'https://www.tabnine.com/favicon.ico',
    'replit-ghostwriter': 'https://replit.com/favicon.ico',
    'codeium': 'https://codeium.com/favicon.ico',
    'amazon-codewhisperer': 'https://aws.amazon.com/favicon.ico',
    'sourcegraph-cody': 'https://sourcegraph.com/favicon.ico',
    'windsurf': 'https://codeium.com/favicon.ico',
    'codeium-chat': 'https://codeium.com/favicon.ico',
    'blackbox-ai': 'https://www.blackbox.ai/favicon.ico',
    'aide': 'https://aide.app/favicon.ico',
    'continue-dev': 'https://continue.dev/favicon.ico',
    
    // Writing
    'jasper': 'https://www.jasper.ai/favicon.ico',
    'copy-ai': 'https://www.copy.ai/favicon.ico',
    'writesonic': 'https://writesonic.com/favicon.ico',
    'notion-ai': 'https://www.notion.so/favicon.ico',
    'grammarly': 'https://www.grammarly.com/favicon.ico',
    'pro-writing-aid': 'https://prowritingaid.com/favicon.ico',
    'quillbot': 'https://quillbot.com/favicon.ico',
    'wordtune': 'https://www.wordtune.com/favicon.ico',
    'rytr': 'https://rytr.me/favicon.ico',
    'copy-ai-workflows': 'https://www.copy.ai/favicon.ico',
    'frase-io': 'https://www.frase.io/favicon.ico',
    'surfer-seo': 'https://surferseo.com/favicon.ico',
    'writer': 'https://writer.com/favicon.ico',
    'jenni-ai': 'https://jenni.ai/favicon.ico',
    'closerscopy': 'https://closerscopy.com/favicon.ico',
    
    // Design
    'midjourney': 'https://www.midjourney.com/favicon.ico',
    'dall-e': 'https://openai.com/favicon.ico',
    'stable-diffusion': 'https://stability.ai/favicon.ico',
    'leonardo-ai': 'https://leonardo.ai/favicon.ico',
    'runway': 'https://runwayml.com/favicon.ico',
    'canva': 'https://www.canva.com/favicon.ico',
    'adobe-firefly': 'https://www.adobe.com/favicon.ico',
    'remove-bg': 'https://www.remove.bg/favicon.ico',
    'upscale-media': 'https://www.upscale.media/favicon.ico',
    'flair-ai': 'https://flair.ai/favicon.ico',
    'magic-studio': 'https://magicstudio.com/favicon.ico',
    'playground-ai': 'https://playground.ai/favicon.ico',
    'lexica': 'https://lexica.art/favicon.ico',
    'craiyon': 'https://www.craiyon.com/favicon.ico',
    'artbreeder': 'https://www.artbreeder.com/favicon.ico',
    'nightcafe': 'https://nightcafe.studio/favicon.ico',
    
    // Education
    'khan-academy': 'https://www.khanacademy.org/favicon.ico',
    'duolingo': 'https://www.duolingo.com/favicon.ico',
    'quizlet': 'https://quizlet.com/favicon.ico',
    'chegg': 'https://www.chegg.com/favicon.ico',
    'course-hero': 'https://www.coursehero.com/favicon.ico',
    'coursera': 'https://www.coursera.org/favicon.ico',
    'udemy': 'https://www.udemy.com/favicon.ico',
    'skillshare': 'https://www.skillshare.com/favicon.ico',
    'brilliant': 'https://brilliant.org/favicon.ico',
    'brainly': 'https://brainly.com/favicon.ico',
    'socratic': 'https://socratic.org/favicon.ico',
    'photomath': 'https://photomath.com/favicon.ico',
    'symbolab': 'https://www.symbolab.com/favicon.ico',
    
    // Productivity
    'chatgpt': 'https://chat.openai.com/favicon.ico',
    'claude': 'https://claude.ai/favicon.ico',
    'perplexity': 'https://www.perplexity.ai/favicon.ico',
    'poe': 'https://poe.com/favicon.ico',
    'character-ai': 'https://character.ai/favicon.ico',
    'grok': 'https://x.com/favicon.ico',
    'julius-ai': 'https://julius.ai/favicon.ico',
    'formula-bot': 'https://formulabot.com/favicon.ico',
    'notion': 'https://www.notion.so/favicon.ico',
    'obsidian': 'https://obsidian.md/favicon.ico',
    'mem': 'https://mem.ai/favicon.ico',
    'reflect': 'https://reflect.app/favicon.ico',
    
    // Video
    'runway-ml': 'https://runwayml.com/favicon.ico',
    'pika': 'https://pika.art/favicon.ico',
    'synthesia': 'https://www.synthesia.io/favicon.ico',
    'd-id': 'https://www.d-id.com/favicon.ico',
    'heygen': 'https://www.heygen.com/favicon.ico',
    'descript': 'https://www.descript.com/favicon.ico',
    'fliki': 'https://fliki.ai/favicon.ico',
    'pictory': 'https://pictory.ai/favicon.ico',
    'luma-dream-machine': 'https://lumalabs.ai/favicon.ico',
    'invideo': 'https://invideo.io/favicon.ico',
    'kapwing': 'https://www.kapwing.com/favicon.ico',
    'pixop': 'https://www.pixop.com/favicon.ico',
    
    // Audio
    'suno': 'https://www.suno.ai/favicon.ico',
    'udio': 'https://udio.com/favicon.ico',
    'mubert': 'https://mubert.com/favicon.ico',
    'aiva': 'https://www.aiva.ai/favicon.ico',
    'soundful': 'https://soundful.com/favicon.ico',
    'boomy': 'https://boomy.com/favicon.ico',
    'lalalai': 'https://www.lalal.ai/favicon.ico',
    'splitter': 'https://melody.ml/favicon.ico',
    'vocal-remover': 'https://vocalremover.org/favicon.ico',
    'krisp': 'https://krisp.ai/favicon.ico',
    
    // Business
    'jenni-ai': 'https://jenni.ai/favicon.ico',
    'jasper': 'https://www.jasper.ai/favicon.ico',
    'copy-ai': 'https://www.copy.ai/favicon.ico',
    'surfer-seo': 'https://surferseo.com/favicon.ico',
    'tome': 'https://tome.app/favicon.ico',
    'beautiful-ai': 'https://www.beautiful.ai/favicon.ico',
    'gamma': 'https://gamma.app/favicon.ico',
    'motion': 'https://www.usemotion.com/favicon.ico',
    
    // Research
    'perplexity-research': 'https://www.perplexity.ai/favicon.ico',
    'elicit': 'https://elicit.com/favicon.ico',
    'consensus': 'https://consensus.app/favicon.ico',
    'research-rabbit': 'https://www.researchrabbit.ai/favicon.ico',
    'chatpdf': 'https://www.chatpdf.com/favicon.ico',
    'scispace': 'https://typeset.io/favicon.ico',
    'iris-ai': 'https://iris.ai/favicon.ico',
    'semantic-scholar': 'https://www.semanticscholar.org/favicon.ico',
    'connected-papers': 'https://www.connectedpapers.com/favicon.ico',
};
