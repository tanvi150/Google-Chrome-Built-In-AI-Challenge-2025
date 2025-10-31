export let session = null;

//Body-shape & gender-aware guides
const bodyShapeGuides = {
    male: {
        triangle: { tops: "Structured jackets, V-neck shirts", bottoms: "Slim pants", accessories: "Watches, minimal jewelry", description: "Your shoulders are narrower than hips and may be sloped. Focus on structured shoulders and fitted tops to balance proportions." },
        trapezoid: { tops: "Fitted shirts, light jackets", bottoms: "Straight pants", accessories: "Belts, watches", description: "Your shoulders and hips are similar width. Emphasize the waist and avoid bulky tops." },
        round: { tops: "Vertical stripes, tailored shirts", bottoms: "Relaxed trousers", accessories: "Belts, elongating shoes", description: "You have a fuller midsection. Opt for vertical patterns and structured tops." },
        "inverted-triangle": { tops: "Structured jackets, V-neck shirts", bottoms: "Slim pants", accessories: "Minimal jewelry, watches", description: "Broad shoulders with narrow hips. Emphasize lower body with darker tops and lighter bottoms." },
        rectangle: { tops: "Fitted tops, jackets", bottoms: "Straight or slim pants", accessories: "Belts, watches", description: "Your waist is not very defined. Create the illusion of curves with layered tops and belts." },
        hourglass: { tops: "Fitted tops to highlight waist", bottoms: "Tailored trousers", accessories: "Belts, watches", description: "Balanced shoulders and hips with defined waist. Highlight your waist with fitted clothing." }
    },
    female: {
        hourglass: { tops: "Fitted or wrap tops", bottoms: "High-waisted skirts/pants", accessories: "Belts, minimal jewelry", description: "Balanced shoulders and hips with a defined waist. Emphasize the waist and curves with fitted clothing." },
        round: { tops: "V-neck tops", bottoms: "A-line skirts", accessories: "Long necklaces", description: "Fuller midsection. Focus on elongating tops and A-line bottoms to create balance." },
        pear: { tops: "Bright tops", bottoms: "Dark skirts/pants, A-line", accessories: "Long necklaces, small earrings", description: "Wider hips than shoulders. Highlight the upper body with bright tops, structured shoulders, and fitted waists." },
        "inverted-triangle": { tops: "V-neck, flowy sleeves", bottoms: "A-line skirts", accessories: "Statement necklaces", description: "Broader shoulders than hips. De-emphasize shoulders with flowy tops and focus on lower body volume." },
        diamond: { tops: "Fitted tops with neckline focus", bottoms: "Tailored pants/skirts", accessories: "Belts, earrings", description: "Fuller midsection with narrow shoulders and hips. Highlight neckline and wear structured bottoms." },
        triangle: { tops: "V-neck tops", bottoms: "A-line skirts", accessories: "Statement necklaces", description: "Similar to pear, emphasize upper body and waist while de-emphasizing lower body." },
        rectangle: { tops: "Belts, layered tops", bottoms: "Skirts/pants to create curves", accessories: "Belts, scarves", description: "Straight shape with minimal waist definition. Layer and use belts to create curves." }
    }
};

//Occasion-specific advice
const occasionGuides = {
    brunch: { male: "Casual button-down, chinos, loafers", female: "Light dress or skirt with chic top, flats or sandals" },
    date: { male: "Smart casual shirt, fitted pants, blazer optional", female: "Romantic dress or top + skirt, subtle accessories" },
    party: { male: "Blazer or jacket, tailored pants, polished shoes", female: "Statement dress, heels, bold accessories" },
    wedding: { male: "Formal suit or traditional attire", female: "Gown, saree, or formal dress; jewelry & heels" },
    festive: { male: "Ethnic wear or smart casual; festive colors", female: "Ethnic wear or festive dress; matching accessories" },
    work: { male: "Dress shirt, blazer, trousers, neutral tones", female: "Tailored pants, blazer, pencil skirt, muted colors" },
    birthday: { male: "Casual party outfit, shirt + chinos or jeans", female: "Fun stylish outfit, top + skirt/pants or dress" },
    halloween: { male: "Creative or themed costume", female: "Creative or themed costume" },
    cocktail: { male: "Cocktail suit or blazer with dress pants", female: "Cocktail dress, heels, statement jewelry" },
    prom: { male: "Tuxedo or formal suit", female: "Formal gown or dress, elegant accessories" },
    "semi-formal": { male: "Dress shirt, blazer, trousers", female: "Knee-length or midi dress, smart top + skirt/pants" }
};

//Acknowledgment detection
function isAcknowledgment(text) {
    const ackWords = ["ok", "sure", "hmm", "mhmm", "k", "got it", "yes"];
    return ackWords.some(word => text.toLowerCase().includes(word));
}

//Check if real Prompt API is available
function hasPromptAPI() {
    return typeof window.ai === "object" && (window.ai.createTextSession || window.ai.assistant?.create);
}

//Prompt template for Gemini Nano
const auriPromptTemplate = (userProfile, userRequest, uploadedOutfit, occasion) => [
    {
        role: "system",
        content: `
You are Auri, a professional, friendly, and expert personal stylist.
- Always answer succinctly, professionally, with optimism.
- If an outfit image is provided, analyze it for colors, patterns, and fit.
- If something might not work perfectly, offer intelligent, realistic alternatives.
- After analyzing the outfit, provide color palette recommendations (consider undertones) and accessory suggestions.
- Be respectful and polite; do not answer violent or abusive questions.
- Avoid repeating advice.
`    },
    {
        role: "user",
        content: `
User Profile:
- Gender: ${userProfile.gender || "unknown"}
- Body Type: ${userProfile.bodyType || "unknown"}
- Height: ${userProfile.height || "unknown"}
- Weight: ${userProfile.weight || "unknown"}

Uploaded outfit: ${uploadedOutfit ? "Yes" : "No"}
Occasion: ${occasion || "unspecified"}

User Request: ${userRequest}

${uploadedOutfit ? "Please analyze the uploaded image for colors, patterns, and fit." : ""}

Respond naturally and follow system instructions.
`    }
];

//Helper functions for Mock

//Generate dynamic color palette based on occasion 
function generateColorPalette(profile, occasion) {
    if (!profile.gender) return "Please tell me your gender to suggest a color palette.";

    const palettes = {
        wedding: ["Emerald & gold", "Blush & champagne", "Royal blue & silver", "Ivory & rose", "Plum & gold"],
        cocktail: ["Burgundy & rose gold", "Teal & bronze", "Navy & copper", "Emerald & black", "Magenta & silver"],
        brunch: ["Peach & mint", "Lavender & cream", "Sky blue & white", "Coral & beige", "Lemon & aqua"],
        birthday: ["Coral & teal", "Sunflower yellow & beige", "Lilac & soft pink", "Turquoise & white", "Fuchsia & grey"],
        work: ["Navy & taupe", "Charcoal & ivory", "Olive & cream", "Beige & burgundy", "Grey & soft blue"],
        festive: ["Red & gold", "Green & bronze", "Deep purple & silver", "Turquoise & gold", "Maroon & cream"],
        date: ["Blush & burgundy", "Soft pink & cream", "Wine & navy", "Coral & beige", "Lavender & grey"],
        party: ["Black & gold", "Crimson & silver", "Royal blue & pink", "Emerald & black", "Fuchsia & navy"],
        halloween: ["Orange & black", "Purple & green", "Red & black", "Black & silver", "Neon accents"],
        prom: ["Sapphire & silver", "Emerald & black", "Rose & champagne", "Lilac & gold", "Teal & blush"],
        "semi-formal": ["Navy & beige", "Grey & soft blue", "Burgundy & cream", "Olive & ivory", "Taupe & teal"]
    };

    const occ = String(occasion || "").toLowerCase();
    const options = palettes[occ] || [
        "Muted earth tones with subtle highlights",
        "Soft pastels with neutral accents",
        "Bold contrasts with a hint of shimmer"
    ];

    //Shuffle and pick up to 3 palettes
    const shuffled = options.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    return `I suggest the following palette${selected.length > 1 ? "s" : ""} for this occasion: ${selected.join(", ")}.`;
}

//Generate dynamic outfit combos with small random enhancements
function generateOutfitCombos(profile, occasion) {
    const gender = profile.gender?.toLowerCase();
    const bodyType = profile.bodyType?.toLowerCase();
    if (!gender || !bodyType) return "I need your gender and body type to suggest outfit combos.";

    const base = bodyShapeGuides[gender][bodyType];
    const occ = String(occasion || "").toLowerCase();

    const occasionEnhancements = {
        brunch: ["pair with pastel scarf", "wear stylish flats", "light cardigan optional", "layer with denim jacket", "chic hat"],
        work: ["add structured blazer", "neutral-toned shoes", "minimalist watch", "slim belt accent", "subtle jewelry"],
        party: ["statement heels", "sparkly clutch", "bold jewelry", "eye-catching earrings", "shimmering shawl"],
        wedding: ["elegant shawl", "dressy heels", "delicate jewelry", "pearl accessories", "clutch bag"],
        festive: ["bright scarf", "matching accessories", "festive shoes", "embellished belt", "colorful bangles"],
        date: ["delicate necklace", "soft scarf", "heels or wedges", "patterned clutch", "subtle rings"],
        cocktail: ["statement heels", "sparkly earrings", "bold clutch", "shiny bracelets", "fitted blazer"],
        birthday: ["fun printed scarf", "colorful flats", "statement belt", "layered bracelets", "cute earrings"],
        halloween: ["themed accessories", "statement shoes", "mask or hat", "glitter accents", "bold props"],
        prom: ["sparkly clutch", "statement earrings", "fitted blazer", "elegant heels", "necklace with pendant"],
        "semi-formal": ["subtle jewelry", "matching shoes", "slim belt", "smart watch", "structured bag"]
    };

    const enhancements = occasionEnhancements[occ] || [];
    const selectedEnhancements = enhancements.sort(() => 0.5 - Math.random()).slice(0, 2);

    return `Outfit suggestions:\n- Tops: ${base.tops}\n- Bottoms: ${base.bottoms}\n- Accessories: ${base.accessories}${selectedEnhancements.length ? " (" + selectedEnhancements.join(", ") + ")" : ""}`;
}

//Generate dynamic accessory suggestions 
function generateAccessorySuggestions(profile) {
    if (!profile.gender) return "I need your gender to suggest accessories.";

    const baseAccessories = ["minimal jewelry", "belts", "watches", "scarves", "hats", "statement necklaces", "brooches", "stacked bracelets", "anklets"];
    const shuffled = baseAccessories.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    return `Accessorize with: ${selected.join(", ")}.`;
}

//Initialize Auri session
export async function initAuriSession() {
    if (session) return session;
    const memory = [];

    //Real API check
    if (hasPromptAPI()) {
        try {
            let realSession = window.ai.createTextSession
                ? await window.ai.createTextSession()
                : await window.ai.assistant.create();

            session = {
                memory,
                isReal: true,
                prompt: async (prompts) => {
                    const response = await realSession.prompt(prompts, { expectedOutputs: [{ type: "text", languages: ["en"] }] });
                    memory.push({ user: prompts.map(p => p.content).join(" "), assistant: response });
                    return response;
                },
                promptStreaming: async function* (text) {
                    const stream = realSession.promptStreaming(text);
                    for await (const chunk of stream) yield chunk;
                }
            };
            console.log("Real Gemini Nano session initialized!");
            return session;
        } catch (err) {
            console.warn("Failed to initialize real Prompt API. Using mock session.", err);
        }
    }

    //Mock session
    console.log("Using offline mock Auri session.");

    const stylishQuotes = [
        "Style is a way to say who you are without speaking. — Rachel Zoe",
        "Fashion fades, style is eternal. — Yves Saint Laurent",
        "Dress shabbily and they remember the dress; dress impeccably and they remember the woman. — Coco Chanel",
        "Clothes mean nothing until someone lives in them. — Marc Jacobs",
        "Elegance is the only beauty that never fades. — Audrey Hepburn"
    ];

    //Mock session prompt
    session = {
        memory,
        isReal: false,
        lastAdviceGiven: null,
        lastUserRequest: null,
        lastOccasion: null, // store last detected occasion

        prompt: async (prompts) => {
            const userText = prompts.map(p => p.content || "").join(" ").toLowerCase();
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const outfit = localStorage.getItem('uploadedOutfit');

            let response = "";
            //Goodbye detection
            const goodbyeWords = ["bye", "goodbye", "see you", "thanks", "thank you", "no", "nah", "nope", "see ya"];
            if (goodbyeWords.some(word => userText.includes(word))) {
                response = "Goodbye! Hope I helped with your styling today. 💖";
            }
            //Initial greeting
            else if (userText.includes("__init__")) {
                response = `Hi! I'm Auri, your friendly personal stylist! `;
                if (profile.height && profile.weight && profile.gender && profile.bodyType) {
                    response += `Your profile: Height ${profile.height}, Weight ${profile.weight}, Gender ${profile.gender}, Body Type ${profile.bodyType}. `;
                }
                if (outfit){
                    response += "I also see you've uploaded an outfit! ";
                } 
                if (!session.isReal) {
                    response += "If connected to the full AI model, I could analyze it for color palette, fit, and styling tips.";
                }
                response += "How would you like me to style you today?";
                session.lastAdviceGiven = null;
                session.lastUserRequest = null;
                session.lastOccasion = null;
            }
            //Occasion detected
            else if (Object.keys(occasionGuides).some(occ => userText.includes(occ))) {
                const gender = profile.gender?.toLowerCase();
                const bodyType = profile.bodyType?.toLowerCase();
                const occasionDetected = Object.keys(occasionGuides).find(occ => userText.includes(occ));
                session.lastOccasion = occasionDetected;

                if (gender && bodyType && bodyShapeGuides[gender]?.[bodyType]) {
                    const guide = bodyShapeGuides[gender][bodyType];
                    response = `Body Type Analysis: ${bodyType.toUpperCase()} (${gender.charAt(0).toUpperCase() + gender.slice(1)})\n\n` +
                        `Description:\n- ${guide.description.split('. ').join('.\n- ')}\n\n` +
                        `Recommended Tops:\n- ${guide.tops.split(', ').join('\n- ')}\n\n` +
                        `Recommended Bottoms:\n- ${guide.bottoms.split(', ').join('\n- ')}\n\n` +
                        `Accessories:\n- ${guide.accessories.split(', ').join('\n- ')}\n\n`;
                    session.lastAdviceGiven = "body";
                }

                if (occasionDetected) {
                    const guideOcc = occasionGuides[occasionDetected];
                    if (gender && guideOcc[gender]) {
                        response += `\nFor ${occasionDetected}, try: ${guideOcc[gender]}.`;
                        session.lastAdviceGiven = `occasion-${occasionDetected}`;
                    }
                }

                const quote = stylishQuotes[Math.floor(Math.random() * stylishQuotes.length)];
                response += `\n\n${quote}`;
            }
            //Color palette 
            else if (userText.includes("color") || userText.includes("colour")) {
                const occasionToUse = Object.keys(occasionGuides).find(occ => userText.includes(occ)) || session.lastOccasion;
                response = generateColorPalette(profile, occasionToUse);
                session.lastUserRequest = "color";
            }
            //Outfit combos 
            else if (userText.includes("outfit combo") || userText.includes("outfit combination")) {
                const occasionToUse = Object.keys(occasionGuides).find(occ => userText.includes(occ)) || session.lastOccasion;
                response = generateOutfitCombos(profile, occasionToUse);
                session.lastUserRequest = "outfit";
            }
            //Accessory suggestions
            else if (userText.includes("accessory") || userText.includes("accessories")) {
                response = generateAccessorySuggestions(profile);
                session.lastUserRequest = "accessory";
            }
            //Unknown occasion handling
            else {
                const unknownOccasion = ["hiking", "gym", "beach", "picnic"];
                if (unknownOccasion.some(word => userText.includes(word))) {
                    response = "I don't have style suggestions for that occasion yet. You can ask me about weddings, parties, work, dates, and other common occasions!";
                } else {
                    //Non-fashion / off-topic detection
                    const fashionKeywords = ["color", "colour", "outfit", "accessory", "body type", "tops", "bottoms", "occasion", "style", "dress", "shirt", "pants", "skirt", "jacket"];
                    if (!fashionKeywords.some(kw => userText.includes(kw))) {
                        response = "I'm mainly a personal stylist AI — I can help with outfits, color palettes, and accessories. Could we talk about your style?";
                    } else {
                        response = "Hmm, I couldn't quite understand that. Could you ask about your outfit, color palettes, accessories, or occasions?";
                    }
                }
            }

            session.memory.push({ user: userText, assistant: response });
            return response;
        },

        //Streaming mock
        promptStreaming: async function* (text) {
            const words = (await this.prompt([{ content: text }])).split(" ");
            for (let word of words) {
                yield word + " ";
                await new Promise(r => setTimeout(r, 60));
            }
        }
    };

    console.log("Mock Auri session initialized!");
    return session;
}

export async function handleUserMessage(userText) {
    if (!session) {
        console.warn("Session not initialized. Please perform a user gesture first.");
        return "Please click or press Enter to initialize Auri first.";
    }

    try {
        const response = await session.prompt([{ role: 'user', content: userText }]);
        return response;
    } catch (err) {
        console.error("Error in handling user message:", err.message || err);
        return "Sorry, I couldn't generate a response at the moment.";
    }
}