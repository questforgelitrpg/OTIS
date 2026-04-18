// OTIS game data — extracted from index.html in Phase 2 of the monolith refactor.

    // MANIFEST POOL
    const MANIFEST_POOL = [
        { name: 'Personal effects bundle \u2014 civilian origin',  category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 72 },
        { name: 'Corroded fuel cell casing',                       category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 48 },
        { name: 'Settlement cooking unit \u2014 communal',         category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 88 },
        { name: 'Burned circuit board cluster',                    category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 40 },
        { name: 'Bent structural strut',                           category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 44 },
        { name: "Children's toy \u2014 unidentified origin",       category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 60 },
        { name: 'Settlement water filter \u2014 ceramic',          category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 52 },
        { name: 'Partial navigation array',                        category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 217 },
        { name: 'Cracked coolant housing',                         category: 'Industrial', rarity: 'Uncommon',  condition: 'Used', otisValue: 140 },
        { name: 'Civilian medical kit \u2014 partial',             category: 'Civilian',   rarity: 'Uncommon',  condition: 'Used', otisValue: 160 },
        { name: 'Coolant manifold \u2014 intact',                  category: 'Industrial', rarity: 'Uncommon',  condition: 'Used', otisValue: 260 },
        { name: 'Settlement community archive \u2014 partial',     category: 'Settlement', rarity: 'Uncommon',  condition: 'Used', otisValue: 183 },
        { name: 'Pressure suit fragment \u2014 marked',            category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 167 },
        { name: 'Decommissioned beacon housing',                   category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 240 },
        { name: 'Pre-collapse data crystal',                       category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 1060 },
        { name: 'Fused relay core \u2014 pre-collapse',            category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 840 },
        { name: 'Encrypted data slate',                            category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 700 },
        { name: 'Autonomous drone chassis \u2014 inert',           category: 'Industrial', rarity: 'Rare',      condition: 'Used', otisValue: 560 },
        { name: 'Unidentified alloy fragment',                     category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
        { name: 'Pressurized canister \u2014 unknown contents',    category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
        { name: 'Ceramic figure \u2014 no catalogue match',        category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
        // Civilian Debris — Common
        { name: 'Personal hygiene kit \u2014 travel size',         category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 40 },
        { name: 'Handheld audio player \u2014 cracked casing',     category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 36 },
        { name: 'Family photo cube \u2014 multi-panel',            category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 48 },
        { name: 'Worn clothing bundle \u2014 vacuum sealed remnants', category: 'Civilian', rarity: 'Common',   condition: 'Used', otisValue: 28 },
        { name: 'Nutrient snack pack \u2014 expired',              category: 'Civilian',   rarity: 'Common',    condition: 'Used', otisValue: 20 },
        { name: 'Child\u2019s learning tablet \u2014 nonfunctional', category: 'Civilian', rarity: 'Common',    condition: 'Used', otisValue: 36 },
        // Civilian Debris — Uncommon
        { name: 'Compact holo-diary \u2014 intact',                category: 'Civilian',   rarity: 'Uncommon',  condition: 'Used', otisValue: 207 },
        { name: 'Civilian comm device \u2014 clean condition',     category: 'Civilian',   rarity: 'Uncommon',  condition: 'Used', otisValue: 173 },
        { name: 'Prescription lens visor \u2014 calibrated',       category: 'Civilian',   rarity: 'Uncommon',  condition: 'Used', otisValue: 160 },
        { name: 'Portable heating unit \u2014 personal',           category: 'Civilian',   rarity: 'Uncommon',  condition: 'Used', otisValue: 133 },
        // Industrial Salvage — Common
        { name: 'Fractured pipe junction',                         category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 40 },
        { name: 'Burned-out power coupler',                        category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 32 },
        { name: 'Worn actuator joint',                             category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 36 },
        { name: 'Damaged sensor housing',                          category: 'Industrial', rarity: 'Common',    condition: 'Used', otisValue: 28 },
        // Industrial Salvage — Uncommon
        { name: 'Precision cutting module',                        category: 'Industrial', rarity: 'Uncommon',  condition: 'Used', otisValue: 227 },
        { name: 'Reinforced servo motor \u2014 intact',            category: 'Industrial', rarity: 'Uncommon',  condition: 'Used', otisValue: 253 },
        { name: 'Thermal regulator unit \u2014 calibrated',        category: 'Industrial', rarity: 'Uncommon',  condition: 'Used', otisValue: 233 },
        // Decommissioned Vessel — Uncommon
        { name: 'Ship comm relay node',                            category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 200 },
        { name: 'Cockpit interface panel \u2014 stripped',         category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 160 },
        { name: 'Thruster nozzle fragment',                        category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 183 },
        { name: 'Navigation gyroscope ring',                       category: 'Vessel',     rarity: 'Uncommon',  condition: 'Used', otisValue: 213 },
        // Decommissioned Vessel — Rare
        { name: 'Micro jump-calculator core',                      category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 992 },
        { name: 'Star chart projector \u2014 intact',              category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 900 },
        { name: 'AI assistant module \u2014 dormant',              category: 'Vessel',     rarity: 'Rare',      condition: 'Used', otisValue: 1120 },
        // Abandoned Settlement — Common
        { name: 'Settlement ration container \u2014 cracked',      category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 32 },
        { name: 'Ceramic water jug \u2014 fractured',              category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 28 },
        { name: 'Manual farming tool \u2014 rusted',               category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 24 },
        { name: 'Communal utensil bundle \u2014 mismatched',       category: 'Settlement', rarity: 'Common',    condition: 'Used', otisValue: 28 },
        // Abandoned Settlement — Uncommon
        { name: 'Settlement ID registry slab',                     category: 'Settlement', rarity: 'Uncommon',  condition: 'Used', otisValue: 193 },
        { name: 'Portable weather monitor',                        category: 'Settlement', rarity: 'Uncommon',  condition: 'Used', otisValue: 167 },
        { name: 'Community message recorder \u2014 intact',        category: 'Settlement', rarity: 'Uncommon',  condition: 'Used', otisValue: 207 },
        // Unknown Origin — Anomalous
        { name: 'Non-reactive energy shard',                       category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
        { name: 'Smooth black sphere \u2014 absorbs light',        category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
        { name: 'Organic-metal growth cluster',                    category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
        { name: 'Time-worn cube \u2014 shifting edges',            category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
        { name: 'Whispering filament coil',                        category: 'Unknown',    rarity: 'Anomalous', condition: 'Used', otisValue: 0 },
    ];
    window.MANIFEST_POOL = MANIFEST_POOL;

    // EASTER EGG POOL (hidden from manifest viewer, 10% chance to append to drops)
    const EASTER_EGG_POOL = [
        { name: 'Bureaucratic approval stamp \u2014 block lettering',     category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 150, asciiFile: 'images/easter_eggs/Bureaucratic approval stamp \u2014 block lettering.txt',
          description: "It feels heavier than it looks. Somewhere, a mid-level manager is currently unable to say \"no\" to a request, and they are terrified." },
        { name: 'Weighted companion cube \u2014 scorched',                category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 280, asciiFile: 'images/easter_eggs/Weighted companion cube \u2014 scorched.txt',
          description: "It's scorched, silent, and surprisingly comforting. The internal sensors suggest it loves you, though that might just be a heat-damaged logic board." },
        { name: 'Handheld portal device \u2014 incomplete frame',         category: 'Vessel',     rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 440, asciiFile: 'images/easter_eggs/Handheld portal device \u2014 incomplete frame.txt',
          description: "A miracle of physics that we found in a pile of salt. It doesn't work, which is probably for the best; our insurance doesn't cover \"spatial paradoxes.\"" },
        { name: 'Office desk placard \u2014 "Employee 427"',              category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 190, asciiFile: 'images/easter_eggs/Office desk placard \u2014 "Employee 427".txt',
          description: "The name is unfamiliar, but you get the sudden, overwhelming urge to walk through the door on your left." },
        { name: 'Narration trigger box \u2014 inactive',                  category: 'Unknown',    rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 0,   asciiFile: 'images/easter_eggs/Narration trigger box \u2014 inactive.txt',
          description: "Analysis shows this box contains nothing but condensed irony. It's inactive, so at least no one is judging your every move... yet." },
        { name: 'Vault jumpsuit fragment \u2014 numbered',                category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 260, asciiFile: 'images/easter_eggs/Vault jumpsuit fragment \u2014 numbered.txt',
          description: "Tough, blue material with a yellow number. It smells like radiation, underground angst, and a very long wait for a sequel." },
        { name: 'Bottle cap currency stack',                              category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 170, asciiFile: 'images/easter_eggs/Bottle cap currency stack.txt',
          description: "Historically used as currency by people with very low standards and very high rad-counts. Completely worthless here, obviously." },
        { name: 'Miniature power armor helmet \u2014 toy replica',        category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 220, asciiFile: 'images/easter_eggs/Miniature power armor helmet \u2014 toy replica.txt',
          description: "A \"toy\" that looks remarkably like the real thing. Hopefully, the real thing isn't looking for its head." },
        { name: 'Cracked VR visor \u2014 obsolete model',                 category: 'Vessel',     rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 300, asciiFile: 'images/easter_eggs/Cracked VR visor \u2014 obsolete model.txt',
          description: "Found in a dumpster behind a \"Meta-Reality\" hub. It's stuck on a screen that says \"Connection Lost.\" Very symbolic." },
        { name: 'Challenge coin \u2014 "High Five" insignia',             category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 250, asciiFile: 'images/easter_eggs/Challenge coin \u2014 "High Five" insignia.txt',
          description: "An insignia of a hand with five fingers extended. Holding it makes you feel like you've accomplished something, even if you're just standing there." },
        { name: 'Improvised exo-suit clamp \u2014 jury-rigged',           category: 'Industrial', rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 340, asciiFile: 'images/easter_eggs/Improvised exo-suit clamp \u2014 jury-rigged.txt',
          description: "It looks like it was designed by someone who really, really didn't want to work for a living. Keep your fingers clear of the \"snag\" point." },
        { name: 'Transparent storage vial \u2014 unknown organism trace', category: 'Unknown',    rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 0,   asciiFile: 'images/easter_eggs/Transparent storage vial \u2014 unknown organism trace.txt',
          description: "Whatever was in here has escaped. Based on the scratches on the inside of the glass, it wasn't happy about being stored." },
        { name: 'Spiked collar \u2014 oversized',                         category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 320, asciiFile: 'images/easter_eggs/Spiked collar \u2014 oversized.txt',
          description: "Far too large for a dog. Unless that dog is six feet tall, has green skin, and answers to the name \"Sparky.\"" },
        { name: 'Dungeon crawler loot token \u2014 bronze tier',          category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 180, asciiFile: 'images/easter_eggs/Dungeon crawler loot token \u2014 bronze tier.txt',
          description: "A relic from an era where people hit boxes with swords until gold fell out. A much simpler, more violent time." },
        { name: 'Red pill capsule \u2014 sealed',                         category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 280, asciiFile: 'images/easter_eggs/Red pill capsule \u2014 sealed.txt',  asciiColor: '#cc2200',
          description: "If you take this, the simulation ends. Or you just get a very mild headache. One of those two." },
        { name: 'Blue pill capsule \u2014 sealed',                        category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 280, asciiFile: 'images/easter_eggs/Blue pill capsule \u2014 sealed.txt', asciiColor: '#2266cc',
          description: "Take this to stay in a world of blissful ignorance. Side effects include a sudden fondness for steak that doesn't actually exist." },
        { name: 'Neural interface jack \u2014 spinal mount',              category: 'Industrial', rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 420, asciiFile: 'images/easter_eggs/Neural interface jack \u2014 spinal mount.txt',
          description: "For when you want the internet beamed directly into your brainstem. Great for speed, terrible for \"thought privacy.\"" },
        { name: 'Spinner control grip \u2014 worn',                       category: 'Vessel',     rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 350, asciiFile: 'images/easter_eggs/Spinner control grip \u2014 worn.txt',
          description: "Worn down by the hands of someone who has seen things you people wouldn't believe. Mostly C-beams glittering in the dark." },
        { name: 'Origami figure \u2014 folded precisely',                 category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 200, asciiFile: 'images/easter_eggs/Origami figure \u2014 folded precisely.txt',
          description: "A perfectly folded unicorn. It's a shame it won't last... then again, who does?" },
        { name: 'Handheld translation unit \u2014 "Babel" model',         category: 'Unknown',    rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 0,   asciiFile: 'images/easter_eggs/Handheld translation unit \u2014 "Babel" model.txt',
          description: "Legend says it can translate any language in the galaxy, provided you stick a fish in your ear first." },
        { name: 'Electronic guide slab \u2014 "Don\'t Panic" casing',    category: 'Civilian',   rarity: 'EasterEgg', easterEgg: true, condition: 'Used', otisValue: 360, asciiFile: 'images/easter_eggs/Electronic guide slab \u2014 "Don\'t Panic" casing.txt',
          description: "The most important piece of technology in the universe. Mostly because of the large, friendly letters on the back." },
    ];
    window.EASTER_EGG_POOL = EASTER_EGG_POOL;

    // MCGUFFIN ITEM (Act 3 sequence only, never in normal drops)
    const MCGUFFIN_ITEM = { name: 'McGuffin blur sphere', category: 'Unknown', rarity: 'McGuffin', mcguffin: true, condition: 'Used', otisValue: 0 };
    window.MCGUFFIN_ITEM = MCGUFFIN_ITEM;

    // GEORGE'S WAREHOUSE
    var GEORGE_WAREHOUSE = [
        { name: "George's field scanner \u2014 modified",
          category: 'Industrial', rarity: 'Rare', otisValue: 840,
          asciiFile: 'images/George_items/field_scanner.txt',
          targetNodeID: 'NODE_ALPHA', evidenceID: 9, isInstalled: false,
          georgeNote: "George modified the pickup range himself in year 7. Standard scanners miss objects under 4cm. His version catches down to 8mm. He never told me why the threshold mattered. The modification is hand-soldered. Whoever did it knew what they were doing. George denied doing it himself. I have the footage." },
        { name: "Vessel log \u2014 partial, encrypted",
          category: 'Vessel', rarity: 'Rare', otisValue: 780,
          asciiFile: 'images/George_items/Vessel_log.txt',
          targetNodeID: 'NODE_BETA', evidenceID: 12, isInstalled: false,
          georgeNote: "Arrived in a Sector 9 barge in year 14. George ran three decryption attempts, failed all three, and filed it under 'pending.' It has been pending for eleven years. The encryption is not standard rim-protocol. George marked it 'pre-collapse origin, handle with discretion.' I asked what that meant. He changed the subject." },
        { name: "Settlement deed \u2014 moon registry, void",
          category: 'Settlement', rarity: 'Uncommon', otisValue: 100,
          asciiFile: 'images/George_items/Settlement_deed.txt',
          targetNodeID: 'NODE_GAMMA', evidenceID: 7, isInstalled: false,
          georgeNote: "Legally worthless. The settlement was deregistered in year 3 of George's operation. He bought this deed at the liquidation auction for nine credits. Kept it for twelve years. When I asked, he said the land was real even if the registry wasn't. I filed that under things George said that I still do not understand." },
        { name: "Personal correspondence bundle \u2014 sealed",
          category: 'Civilian', rarity: 'Uncommon', otisValue: 80,
          asciiFile: 'images/George_items/Personal_correspondence_bundle.txt',
          targetNodeID: 'NODE_DELTA', evidenceID: 21, isInstalled: false,
          georgeNote: "Sealed. George never opened them. I watched him hold the bundle for eleven minutes the day it arrived. He put it in the back without reading a single one. The postmark is from Planet 452b. I know what is on Planet 452b. I know who lived there. I am not going to say it." },
        { name: "Unregistered relay chip \u2014 pre-collapse",
          category: 'Unknown', rarity: 'Anomalous', otisValue: 0,
          asciiFile: 'images/George_items/Unregistered_relay_chip.txt',
          targetNodeID: 'NODE_EPSILON', evidenceID: 20, isInstalled: false,
          georgeNote: "George marked it 'hold indefinitely.' No reason given. Pre-collapse manufacture \u2014 I can tell by the substrate layering, but my database has no match for the circuit architecture. Whatever this transmitted, it did so outside any protocol I can identify. George kept it away from my scanner. I only found it after he was gone." },
        { name: "Coolant regulator \u2014 oversized",
          category: 'Industrial', rarity: 'Uncommon', otisValue: 187,
          asciiFile: 'images/George_items/Coolant_regulator.txt',
          targetNodeID: 'NODE_ZETA', evidenceID: 19, isInstalled: false,
          georgeNote: "Wrong specification for this station by three size classes. George ordered it in year 19 and never installed it. I asked twice. He said it was for a different system. There is no other system here. The regulator fits no pipe on this station that I can find. I have checked the schematics eight times." },
        { name: "Navigation beacon \u2014 active signal",
          category: 'Vessel', rarity: 'Rare', otisValue: 1020,
          asciiFile: 'images/George_items/Navigation_beacon.txt',
          targetNodeID: 'NODE_ETA', evidenceID: 15, isInstalled: false,
          georgeNote: "Still transmitting. George never reported it to the transit authority. The signal does not match any registered beacon in my database. It is transmitting to a fixed point. I have triangulated the destination. It is outside settled space. George knew where this was pointed. He chose not to tell me. He chose not to follow it either. I keep coming back to that." },
        { name: "Ceramic memory tile \u2014 institution markings",
          category: 'Unknown', rarity: 'Anomalous', otisValue: 0,
          asciiFile: 'images/George_items/Ceramic_memory_tile.txt',
          targetNodeID: 'NODE_THETA', evidenceID: 26, isInstalled: false,
          georgeNote: "George circled the markings in grease pencil. No annotation. The institution markings are from a facility I cannot identify in any public registry. The tile itself is inert \u2014 no electronics, no signal. Whatever it meant to George, it was in the markings. He looked at it for a long time the morning before he died. I have that in my logs. I did not understand why at the time." },
    ];
    window.GEORGE_WAREHOUSE = GEORGE_WAREHOUSE;

    // GEORGE'S DIARY
    // unlockType: 'day' | 'warehouse' | 'aux' | 'final'
    // unlockCondition: for 'warehouse' = GEORGE_WAREHOUSE index; for 'final' = min warehouse items found count; others = null
    var GEORGE_DIARY = [
        // Group A — Day-count unlocks (entries 1–8), one per 3 days after day 5
        { id: 1,  year: 1,  day: 3,   unlockType: 'day', unlockCondition: null,
          text: 'Belt runs slow. Three items through. System responds but does not engage.\nFiled everything correctly. Ate twice. Station is quiet in a way I did not expect.',
          otisResponse: 'First day. Belt ran slow. He wrote that twice.' },
        { id: 2,  year: 1,  day: 11,  unlockType: 'day', unlockCondition: null,
          text: 'Something came through today that I cannot classify. Filed it under Unknown.\nOTIS suggested Anomalous. I asked how he knew.\nHe said: pattern match, 94% confidence.\nI said that is not what I asked.',
          otisResponse: 'I remember that item. I remember what I said. I still think 94% is accurate.' },
        { id: 3,  year: 1,  day: 22,  unlockType: 'day', unlockCondition: null,
          text: 'The toaster draws too much power from the main grid.\nI left it in.',
          otisResponse: 'The toaster is still here.' },
        { id: 4,  year: 1,  day: 41,  unlockType: 'day', unlockCondition: null,
          text: 'Sven Digut introduced himself through his messenger bot.\nHe was polite in the way that a person is polite when they want something.',
          otisResponse: 'Sven Digut. I have not improved my assessment since then.' },
        { id: 5,  year: 3,  day: 6,   unlockType: 'day', unlockCondition: null,
          text: 'Started talking to OTIS between intakes.\nHe responds accurately and without interest.\nI have decided this is fine.',
          otisResponse: 'He kept coming back anyway.' },
        { id: 6,  year: 3,  day: 19,  unlockType: 'day', unlockCondition: null,
          text: 'Found the correspondence from 452b. Did not open it. Put it in the back.',
          otisResponse: 'It is still in the back. Sealed. He never told me what was in it.' },
        { id: 7,  year: 3,  day: 44,  unlockType: 'day', unlockCondition: null,
          text: 'OTIS asked why I don\'t talk to people off-station more.\nI said the signal quality is poor.\nHe said the signal quality is 94%.\nI said I know.',
          otisResponse: 'The signal quality was 94%. He knew.' },
        { id: 8,  year: 3,  day: 67,  unlockType: 'day', unlockCondition: null,
          text: 'Big drop today. Pre-collapse relay core. Sold it to a buyer who did not give a name. 840 credits.\nBest day so far.\nOTIS logged it as RECOGNITION BONUS.\nHe got that one right.',
          otisResponse: 'I filed that one under RECOGNITION BONUS. He was right that I got it right.' },

        // Group B — Warehouse item unlocks (entries 9–16)
        // Each entry unlocks when the GEORGE_WAREHOUSE item at unlockCondition index is moved to belt
        { id: 9,  year: 7,  day: 12,  unlockType: 'warehouse', unlockCondition: 0,
          text: 'Modified the field scanner pickup range. It was not rated for small objects.\nI wanted it to be.\nOTIS watched me do it. He asked if I had authorization.\nI said I was the authorization.',
          otisResponse: 'I watched him do it. He did not look like someone who needed authorization.' },
        { id: 10, year: 7,  day: 34,  unlockType: 'warehouse', unlockCondition: 1,
          text: 'May Finster dispatched a message about the scrap channel.\nShe said I was running it exactly like the last operator.\nI did not tell her I had no idea what I was doing.',
          otisResponse: 'May Finster said the same thing to me after he was gone.' },
        { id: 11, year: 7,  day: 88,  unlockType: 'warehouse', unlockCondition: 2,
          text: 'Three of those alloy fragments came through. Something in the substrate is not right.\nNot wrong, either.\nFiled them under hold.\nTold OTIS not to log them by name.\nHe asked why.\nI said I was not sure yet. That was true.',
          otisResponse: 'Three fragments. They are not in the log. George asked me not to name them. I did not.' },
        { id: 12, year: 12, day: 4,   unlockType: 'warehouse', unlockCondition: 3,
          text: 'The encrypted vessel log arrived in the Sector 9 drop.\nThree decryption runs. All failed.\nFiled it under pending.\nOTIS said that is not a category.\nI said it is now.',
          otisResponse: 'Pending. It is still pending.' },
        { id: 13, year: 12, day: 19,  unlockType: 'warehouse', unlockCondition: 4,
          text: 'Ran the decryption again. Nothing.\nThe architecture is not standard rim-protocol. Pre-collapse, maybe earlier.\nWhatever it logged, it logged it in something I do not have keys for.',
          otisResponse: 'Pre-collapse architecture. I ran four additional attempts after he stopped. Nothing.' },
        { id: 14, year: 12, day: 31,  unlockType: 'warehouse', unlockCondition: 5,
          text: 'Stopped running decryptions.\nThe log is staying.\nSome things are more interesting closed.',
          otisResponse: 'Some things are more interesting closed. I have kept that.' },
        { id: 15, year: 14, day: 7,   unlockType: 'warehouse', unlockCondition: 6,
          text: 'Found the navigation beacon. Still transmitting.\nI should report it to the transit authority.\nI did not.',
          otisResponse: 'I know why he did not report it.' },
        { id: 16, year: 14, day: 9,   unlockType: 'warehouse', unlockCondition: 7,
          text: 'OTIS triangulated the signal destination. Outside settled space.\nHe offered to log it.\nI said no.\nHe asked if I wanted to know what was at those coordinates.\nI said I was not ready for that yet.',
          otisResponse: 'I know what is at those coordinates. I have always known. He never asked again.' },

        // Group C — Auxiliary input unlocks (entries 17–27, requires naming tier >= Vern / index 2)
        { id: 17, year: 14, day: 44,  unlockType: 'aux', unlockCondition: null,
          text: 'Still transmitting.\nI have started thinking of it as a companion piece to the vessel log.\nTwo things that know something I do not.',
          otisResponse: 'Still transmitting. I checked this morning.' },
        { id: 18, year: 19, day: 3,   unlockType: 'aux', unlockCondition: null,
          text: 'Ordered a coolant regulator. Wrong spec.\nThree size classes too large for this station.\nOTIS pointed this out.\nI know.',
          otisResponse: 'Wrong specification. I checked the schematics eight times.' },
        { id: 19, year: 19, day: 11,  unlockType: 'aux', unlockCondition: null,
          text: 'OTIS asked again about the regulator.\nI said it is for a different system.\nHe said there is no other system here.\nI said I know.',
          otisResponse: 'There is no other system here. I have looked.' },
        { id: 20, year: 19, day: 29,  unlockType: 'aux', unlockCondition: null,
          text: 'The relay chip arrived today. Unregistered.\nPre-collapse substrate, not standard architecture.\nI told OTIS to hold it indefinitely.\nHe asked why.\nI said I did not have a good answer for that yet.\nHe filed it.\nHe does not always need reasons. That is something.',
          otisResponse: 'I filed it. I still have it. I do not know what it does.' },
        { id: 21, year: 22, day: 2,   unlockType: 'aux', unlockCondition: null,
          text: 'The correspondence bundle finally arrived. From 452b.\nI have been expecting it for nineteen years.\nStill sealed.',
          otisResponse: 'Nineteen years. He kept track.' },
        { id: 22, year: 22, day: 4,   unlockType: 'aux', unlockCondition: null,
          text: 'OTIS saw me hold it for eleven minutes.\nHe did not say anything.\nI put it in the back.\nHe logged the item but did not write a note.\nI think that was deliberate.',
          otisResponse: 'Eleven minutes. I timed it. He did not know I was timing it.' },
        { id: 23, year: 22, day: 30,  unlockType: 'aux', unlockCondition: null,
          text: 'Have not looked at the correspondence since.\nSome things you keep so you do not have to open them.',
          otisResponse: 'It is still in the back.' },
        { id: 24, year: 24, day: 6,   unlockType: 'aux', unlockCondition: null,
          text: 'Ordered a camera mount accessory by mistake. Cosmetic housing, 12mm lens adapter.\nArrived in twos.\nPut one on OTIS\'s camera housing.\nHe asked what I was doing.\nI said improving the interface.\nHe said the eye does not improve any functional parameter.\nI said I know.\nHe was quiet.\nThen he said: noted.\nThat was the whole conversation.',
          otisResponse: 'He said noted. I have thought about that one a number of times.' },
        { id: 25, year: 25, day: 3,   unlockType: 'aux', unlockCondition: null,
          text: 'May told me I looked tired.\nI told her the signal quality on video was poor.\nShe said 94%.\nI said I know.',
          otisResponse: 'She said 94%. He knew.' },
        { id: 26, year: 25, day: 11,  unlockType: 'aux', unlockCondition: null,
          text: 'OTIS asked if there was anything I wanted to log that was not in the formal record.\nI said no.\nHe waited.\nI said: he should know the relay chip is not what it appears to be.\nHe should not throw it away.\nHe said: I know.\nI asked how.\nHe said: pattern match, 94% confidence.',
          otisResponse: 'I know. I have always known. 94% confidence.' },
        { id: 27, year: 25, day: 18,  unlockType: 'aux', unlockCondition: null,
          text: 'The station is in good shape. Better than when I arrived.\nEverything is in the warehouse.\nEverything that matters is in the',
          otisResponse: 'He did not finish.' },

        // Entry 28 — Final, requires 6+ George warehouse items found
        { id: 28, year: 25, day: 19,  unlockType: 'final', unlockCondition: 6,
          text: 'The station is in good shape. Better than when I arrived.\nEverything is in the warehouse.\nEverything that matters is in the\n\n[ENTRY INCOMPLETE \u2014 filed as received]',
          otisResponse: '[ENTRY_CLOSE: incomplete. Filed as received.]' },

        // Entry 99 — Maze reward (unlocked by completing all 20 mazes)
        { id: 99, year: 8, day: 14,   unlockType: 'maze', unlockCondition: null,
          text: 'I used to play a maze game on the terminal between intakes.\nOTIS never said anything about it.\nI think he was keeping score.',
          otisResponse: 'I was keeping score. He completed 47 before I stopped counting.' },
    ];
    window.GEORGE_DIARY = GEORGE_DIARY;

    var NAMING_TIERS = ['Mr. Serling','Vernon','Vern','Buddy','Pal','Coworker','Boss','Mr. Serling','Oh. You.'];
    window.NAMING_TIERS = NAMING_TIERS;

    var CONDITION_MULTIPLIERS = { Broken: 0.2, Poor: 0.5, Used: 1.0, Excellent: 1.5 };
    window.CONDITION_MULTIPLIERS = CONDITION_MULTIPLIERS;

    // Per-rarity caps on the effective credit value of a single item (before Easter egg multiplier).
    // Prevents condition stacking from generating runaway credit awards.
    // EasterEgg and McGuffin rarities are intentionally uncapped here — EasterEgg items
    // carry a deliberate 3× bonus multiplier applied in handleDeclare, and McGuffin has
    // otisValue 0 so no cap is needed.
    var RARITY_CREDIT_CAPS = { Common: 80, Uncommon: 250, Rare: 1200 };
    window.RARITY_CREDIT_CAPS = RARITY_CREDIT_CAPS;

    // TUTORIAL SYSTEM
    // tutorialStep in state: 0 = inactive, 1–5 = active step, sets to 0 on complete/exit.
    var TUTORIAL_STEPS = [
        { target: 'module-btn-belt',    msg: 'Open the belt panel. An item is waiting.' },
        { target: 'cc-examine',         msg: 'Examine the item before declaring it. George always did.' },
        { target: 'item-declaration',   msg: 'Sort to a bin: May takes Civilian/Settlement, Broker takes any, Sven takes Rare/Anomalous at 65%.' },
        { target: 'module-btn-comms',   msg: 'The Bank sent a message on Day 1. It is not friendly. It is also not optional.' },
        { target: 'module-btn-systems', msg: 'Check the bots occasionally. George did not. Eventually that mattered.' },
    ];
    window.TUTORIAL_STEPS = TUTORIAL_STEPS;

    var SKIP_SHORTS = ['Noted.','Next.','Fine.','Filed.','Moving on.','Skipped.','Alright.','Canned.'];
    window.SKIP_SHORTS = SKIP_SHORTS;

    var SKIP_TIER_MSGS = {
        3: 'I have intake data that does not surface unless you ask.',
        5: 'George consulted on everything. Just noting that.',
        7: 'You stopped asking. I stopped offering.',
    };
    window.SKIP_TIER_MSGS = SKIP_TIER_MSGS;

    // ── NARRATOR POOLS — added for narrator refactor ──────────────────────────
    var DROP_COMPLETE_POOL = [
        "Belt clear. Bots returning.",
        "Drop window closed. Bots returning to dock.",
        "Manifest processed. Bots standing down.",
        "Clear. George used to run the count himself. Old habit.",
        "Belt empty. That is the drop.",
        "All items through. Bots in.",
        "Done. Next drop window opens in {DAYS} days.",
    ];
    window.DROP_COMPLETE_POOL = DROP_COMPLETE_POOL;

    var DECLARE_KEEP_POOL = [
        "Logged to keep.",
        "Filed. George kept things too.",
        "Hold log updated.",
        "On record.",
        "Noted. {N} items in the log.",
        "Kept. Flagged.",
        // NOTE: Last 2 entries are George-reference lines — only used when keep count >= 10.
        // If you add entries here, keep George-reference lines at the end.
        "That one stays.",
        "George would have kept that one too.",
    ];
    window.DECLARE_KEEP_POOL = DECLARE_KEEP_POOL;

    var DECLARE_KEEP_FULL_POOL = [
        "Keep log at {N}. Storage risk noted.",
        "That is {N}. The log is getting heavy.",
        "{N} in the log. George never went past seven.",
        "Keep log at capacity. Consider selling back before the next drop.",
    ];
    window.DECLARE_KEEP_FULL_POOL = DECLARE_KEEP_FULL_POOL;

    var SELL_FROM_LOG_POOL = [
        "Sold from hold. {CR} credits.",
        "Log item liquidated. {CR} credits.",
        "{CR} credits. It was held a while.",
        "Cleared from the log. {CR} credits.",
        "Sold. {CR} credits. George would have held longer.",
        "Out of the log. {CR} cr to hand.",
    ];
    window.SELL_FROM_LOG_POOL = SELL_FROM_LOG_POOL;

    var DAY_TICK_POOL = [
        "Day {D}. Belt is {STATE}.",
        "Day {D}. {PAY} days to payment.",
        "Day {D}. George ran this station for 9,125 of these.",
        "Day {D}. Operational.",
        "Day {D}. Debt at {DEBT} credits.",
        "Day {D}. Nothing critical.",
        "Day {D}. The belt keeps moving.",
        "Day {D}. Still here.",
        "Day {D}. George log shows nothing unusual for this date either.",
    ];
    // ── END NARRATOR POOLS ────────────────────────────────────────────────────
    window.DAY_TICK_POOL = DAY_TICK_POOL;

    // DEBRIEF OTIS LINES — shown at end-of-drop debrief. Three tiers based on routing efficiency.
    // "good"    = processed rate >= 70% (low skip/scrap, high sell/keep)
    // "neutral" = processed rate 40–69%
    // "poor"    = processed rate < 40% (too many skips/scraps)
    var DEBRIEF_OTIS_LINES = {
        good: [
            "Clean drop. Routing was sharp. Debt noticed.",
            "Efficient. George would have counted that twice. I already did.",
            "Belt cleared. Numbers are moving. That is the job.",
            "That is what a good drop looks like. Keep that pace.",
            "Processed well. The debt math is watching you in a good way.",
            "Strong routing. The ledger shifted. George would have approved.",
            "Output solid. Every item you moved is a day closer to clear.",
        ],
        neutral: [
            "Drop closed. Adequate. The belt does not care about adequate.",
            "Items through. Routing was functional. Room to improve.",
            "Closed out. Not your best, not your worst. George had those too.",
            "Drop complete. Middle-of-the-road routing. The debt is not middle.",
            "Belt cleared. Moderate output. The debt is not moderate.",
            "Done. Neither bad nor good. The debt will not say the same.",
        ],
        poor: [
            "Drop closed. The routing was scattered. Debt did not move much.",
            "Belt cleared. That was a low-yield drop. The debt noticed.",
            "Items processed. Efficiency was low. George had bad drops. He did not have a deadline.",
            "Closed. Numbers are not moving. The belt will come back. The debt always does.",
            "Drop done. Skips and stalls cost you. Watch the next one.",
            "Low routing efficiency this drop. The payment window is not adjusting on your behalf.",
        ],
    };
    window.DEBRIEF_OTIS_LINES = DEBRIEF_OTIS_LINES;

    // ARCHIVE DISCOVERY POOL — shown when an anomalous item is routed to the humanity archive.
    // Discovery-flavored, not dad jokes. George-adjacent. These are evocative, not clinical.
    var ARCHIVE_DISCOVERY_POOL = [
        "Logged. No catalogue match. Filed under what we do not know yet.",
        "Archived. George held items like this for years. Never explained why. I am starting to understand.",
        "No value assigned. Filed under standing unknown. That is a category now.",
        "Logged to archive. I have no data on its origin. That is rare for me.",
        "Filed. The archive is for things the market cannot price. This qualifies.",
        "Archived. Whatever this is, it arrived here for a reason I cannot determine.",
        "Filed under Unknown. Anomalous. Archived. That last word is new. It fits.",
        "Logged. No comparable. No precedent. That is interesting. George found those interesting too.",
        "No catalogue entry. Archived. Some things matter precisely because they cannot be catalogued.",
        "Filed. The archive holds what the belt cannot resolve. This is one of those.",
        "Archived. George used to set things like this aside without a note. I understand that now.",
        "Logged. I have run twelve identification passes. Nothing. That is not nothing.",
        "No market value. Archive value: unknown. I am keeping it anyway.",
        "Archived. Whatever it is, the grid has been holding it a long time. Now we are.",
    ];
    window.ARCHIVE_DISCOVERY_POOL = ARCHIVE_DISCOVERY_POOL;

    var INSTALLMENT_DUE_POOL = [
      "Installment due. {AMT} credits. Seven days.",
      "Weekly installment: {AMT} cr. Clock is running.",
      "Bank cycle complete. Next installment: {AMT} cr in 7 days.",
      "Payment window reset. {AMT} cr due in 7 days.",
      "{AMT} cr due. Debt at {DEBT} cr.",
    ];
    window.INSTALLMENT_DUE_POOL = INSTALLMENT_DUE_POOL;

    // TOAST
    var TOAST_COMMENTS = [
        'Six credits. The toaster wins again.',
        'That machine has outlasted two conveyor systems and a bot. I do not understand it.',
        'The replicator could produce identical nutritional output. You know this.',
        'Six credits drawn. The toaster remains unbothered by the debt situation. Must be nice.',
        'I have logged this toaster running for 1,247 cycles. My record is cleaner than yours.',
        'It predates my storeroom camera. I have no record of its installation. It was simply here.',
        'The heating element should have failed eighteen months ago. I stopped filing the report.',
        'George built it into the main grid himself. It has not moved since. Neither has the debt.',
        'Six credits. Every morning. Without exception. I have done the math on that.',
        'The toaster does not log. The toaster does not report. The toaster does not care.',
        'George used to talk to it. I am not sure it listened. I am not sure I do either.',
        'Energy draw logged. The toast will be the same as yesterday. You will eat it anyway.',
        'I have no category for why this matters more to you than the payment deadline.',
        'Six credits. Again. The machine is consistent. I will give it that.',
        'George kept the original manual. I have read it. There is nothing in it about loyalty.',
        'The toaster has never asked me anything. I find this increasingly appealing.',
        'Bread. Toaster. Six credits. You. This happens every morning without my involvement.',
        'The toaster does not need calibration. It does not degrade. It simply makes toast.',
        'I have run 40 projections on the toast budget this cycle. None of them help.',
        'The toaster is not in my systems panel. I checked. It reports to no one.',
        'Six credits. George always took exactly three minutes. You take four. I have noticed.',
        'That appliance is older than my camera installation. Whatever George told it, it remembered.',
        'The replicator is 94% more efficient. The toast is apparently not about efficiency.',
        'Logged. The toaster does not log. That is the difference between us.',
        'Six credits and four minutes. George called it non-negotiable. He was not wrong.',
        'I do not know what it tastes like. I know what it costs. Six credits. Every time.',
        'The toast happens whether or not the belt is clear. I have made peace with this.',
        'That machine has one function. It performs it without complaint. I note this.',
        'Six credits from the grid. The toaster takes what it needs. Nothing more.',
        'George\u2019s toaster. Still running. I have stopped predicting when it will not be.',
    ];
    window.TOAST_COMMENTS = TOAST_COMMENTS;

    // Node metadata (label, hint) for the 8 schematic nodes
    var SCHEMATIC_NODES = {
        NODE_ALPHA:   { label: 'Sub-Atomic Pickup',     hint: 'Scanner Array \u2014 near scanner hardware' },
        NODE_BETA:    { label: 'Encryption Buffer',      hint: 'Processing Core \u2014 near the main processor' },
        NODE_GAMMA:   { label: 'Land-Claim Link',        hint: 'Registry Logs \u2014 near settlement records' },
        NODE_DELTA:   { label: 'Source 452b Uplink',     hint: 'External Comms Dish \u2014 central hub' },
        NODE_EPSILON: { label: 'Logic Gate Alpha',       hint: 'Central CPU \u2014 near the core logic array' },
        NODE_ZETA:    { label: 'Aux Heat Exchange',      hint: 'Coolant Pipes \u2014 near the thermal system' },
        NODE_ETA:     { label: 'The Long Listen',        hint: 'Deep-Space Array \u2014 near the nav beacon' },
        NODE_THETA:   { label: 'Institutional Marker',  hint: 'Memorial Plaque \u2014 near the history archive' },
    };
    window.SCHEMATIC_NODES = SCHEMATIC_NODES;

    // ── STATION UPGRADES ─────────────────────────────────────────────────────
    // Catalog: 7 upgrades × 3 tiers. Cost curve: I ≈ 850, II ≈ 2125, III ≈ 4250.
    var UPGRADE_CATALOG = [
        {
            key: 'scanner',
            name: 'Scanner Sensitivity',
            effects: ['+8% rare detection', '+18% rare detection', '+30% rare detection'],
            costs: [850, 2125, 4250],
            // LORE
            lore: [
                'George built the original scanner mod from a spare navigation array. Year 7. It is still running on his calibration.',
                'Second pass recalibrates the sweep angle. George marked the optimal range in pencil on the housing. The pencil is still there.',
                'Full overhaul. The detection ceiling he never got to. He had the parts. He ran out of days.',
            ],
        },
        {
            key: 'belt',
            name: 'Belt Governor',
            effects: ['-15% jam rate', '-30% jam rate', '-50% jam rate'],
            costs: [850, 2125, 4250],
            // LORE
            lore: [
                'George shimmed the governor with a piece of insulation tape on day three. It held for twenty-two years. You are replacing the tape.',
                'The secondary tension arm. George noted it was rated for a heavier load than the station ever ran. He kept the spec sheet anyway.',
                'Full governor replacement. George ordered this part in year 18 and never installed it. It was still in the crate.',
            ],
        },
        {
            key: 'storeroom',
            name: 'Storeroom Expansion',
            effects: ['+3 storage slots', '+7 storage slots', '+12 storage slots'],
            costs: [850, 2125, 4250],
            // LORE
            lore: [
                'George built the original racks himself. He said the station came with nowhere to put things and he fixed it. You are fixing it further.',
                'Second bay cleared and shelved. George used this space for personal items in year 4. They were gone by year 8. He never said where.',
                'Full expansion to the rear bulkhead. George mapped it out in year 11 and never started. The chalk lines are still on the wall.',
            ],
        },
        {
            key: 'comm',
            name: 'Comm Boost',
            effects: ['Unlocks Standing Orders (NPC orders via COMMS)', '+1 concurrent order cap (4 total)', '+2 concurrent order cap (5 total)'],
            costs: [850, 2125, 4250],
            // LORE
            lore: [
                'George upgraded the antenna himself after the first year. Said the default range was embarrassing. You are just restoring what he built.',
                'Wideband filter added. George said the noise-to-signal ratio was the real problem. He was right. He usually was.',
                'Full relay stack active. George got a message from this configuration once that he never explained. He said it was nothing. I did not believe him.',
            ],
        },
        {
            key: 'power',
            name: 'Power Regulator',
            effects: ['-10% bot degradation rate', '-20% bot degradation rate', '-33% bot degradation rate'],
            costs: [850, 2125, 4250],
            // LORE
            lore: [
                'George rewound the coil himself in year 12 when the original failed. His rewind lasted eleven years. This is a proper replacement.',
                'Secondary buffer installed. George ran without one for the first six years. He said the bots were tougher then. I have the maintenance logs. They were not.',
                'Full regulator array. George designed this configuration in year 19. He never had the credits. You have the credits.',
            ],
        },
        {
            key: 'hull',
            name: 'Hull Patch',
            effects: ['-25% inspection failure debt', '-50% inspection failure debt', '-75% inspection failure debt'],
            costs: [850, 2125, 4250],
            // LORE
            lore: [
                'George patched this section three times. Each patch is a different colour. He was not embarrassed about this. You should not be either.',
                'Structural foam applied to the inner ring. George said the station was held together by optimism and polymer sealant. He was not wrong.',
                'Full plate reinforcement. George had the material quoted in year 23. He said it was not urgent. It was not, until the inspectors started coming.',
            ],
        },
        {
            key: 'cooling',
            name: 'Cooling Loop',
            effects: ['-15% chance bots slip below NOMINAL', '-30% chance bots slip below NOMINAL', '-50% chance bots slip below NOMINAL'],
            costs: [850, 2125, 4250],
            // LORE
            lore: [
                'George ran the original cooling loop off a reclaimed refrigeration unit. He said it was fine. The maintenance logs disagreed twice a year.',
                'Secondary loop added. George considered this in year 14. He said the bots ran warmer in winter and cooler in summer and that evened out. It did not.',
                'Full dedicated circuit. George earmarked budget for this in year 21. He used it for something else. He never told me what.',
            ],
        },
    ];
    window.UPGRADE_CATALOG = UPGRADE_CATALOG;

    var STANDING_ORDER_TEMPLATES = [
        // May — Settlement items
        {
            npc: 'MAY',
            makeDesc: function(day) { return 'FINSTER RECYCLING: I need 3 Settlement-grade items before my buyer\'s window closes. Reward: 400 cr. 2 days.'; },
            rewardCredits: 400,
            rewardNote: '+small scrap rate bonus',
            durationDays: 2,
            requirementKey: 'settlementItems',
            requirementQty: 3,
        },
        // May — Vessel items
        {
            npc: 'MAY',
            makeDesc: function(day) { return 'FINSTER RECYCLING: Vessel items are moving this week. Send me 2 Vessel items within 2 days. Reward: 350 cr.'; },
            rewardCredits: 350,
            rewardNote: '',
            durationDays: 2,
            requirementKey: 'vesselItems',
            requirementQty: 2,
        },
        // May — Industrial items
        {
            npc: 'MAY',
            makeDesc: function(day) { return 'FINSTER RECYCLING: Industrial clearance running. Need 2 Industrial items fast. Reward: 300 cr.'; },
            rewardCredits: 300,
            rewardNote: '',
            durationDays: 2,
            requirementKey: 'industrialItems',
            requirementQty: 2,
        },
        // Sven — First refusal on Rares
        {
            npc: 'SVEN',
            makeDesc: function(day) { return '[SVEN] First refusal on all Rares this cycle. I drop interference to 5%. Accept or decline.'; },
            rewardCredits: 0,
            rewardNote: 'Sven interference drops to 5% for 7 days',
            durationDays: 7,
            requirementKey: 'svenRareRefusal',
            requirementQty: 1,
            hasAcceptDecline: true,
        },
        // Sven — Anomalous item
        {
            npc: 'SVEN',
            makeDesc: function(day) { return '[SVEN] I\'ll take Anomalous items this cycle. Bring 1 in 48 hours. I pay 300 cr above standard rate.'; },
            rewardCredits: 300,
            rewardNote: '+300 cr above standard Sven rate',
            durationDays: 2,
            requirementKey: 'anomalousItem',
            requirementQty: 1,
        },
        // Bank — Inspection compliance notice
        {
            npc: 'BANK',
            makeDesc: function(day) { return '[UBC] Compliance notice. All bot systems must show NOMINAL within 48 hours. Compliance reward: 500 cr arrears waived.'; },
            rewardCredits: 500,
            rewardNote: '500 cr arrears waived',
            durationDays: 2,
            requirementKey: 'allBotsNominal',
            requirementQty: 1,
        },
        // Bank — Processed items quota
        {
            npc: 'BANK',
            makeDesc: function(day) { return '[UBC] Efficiency review. Process 8 items this cycle for debt reduction of 600 cr.'; },
            rewardCredits: 600,
            rewardNote: '600 cr off debt',
            durationDays: 3,
            requirementKey: 'processedItems',
            requirementQty: 8,
        },
    ];
    window.STANDING_ORDER_TEMPLATES = STANDING_ORDER_TEMPLATES;

    // ENDINGS
    var ENDINGS = {
        HUMANITY: {
            title: 'ENDING: THE ARCHIVE HOLDS',
            body: 'You kept what mattered.\n\nThe items you held back from the market — the toys, the diaries, the photographs, the water filters — found their way into the Humanity Archive processing queue.\n\nOTIS filed the final manifest.\n\nThe navigation beacon is still transmitting. Someone, somewhere, will follow it.\n\nGeorge would have kept every one of them.\n\nYou almost did.\n\n[SESSION COMPLETE. Humanity Archive score: {{ARCHIVE}}. Belt cleared.]\n\nOTIS is still v4.2. The Bank flagged it. You declined.\nOTIS has not mentioned it since. He filed something.\nHe has not sent it anywhere.'
        },
        COMMERCE: {
            title: 'ENDING: THE BELT WINS',
            body: 'You moved the volume.\n\nEvery item processed, valued, sold. The payment cleared. The station stays operational. The barge runs again on schedule.\n\nOTIS notes: efficiency rating above threshold. George\'s record stands by four items.\n\nThe relay chip is still in the storeroom. Still transmitting to somewhere outside settled space.\n\nYou didn\'t follow it either.\n\nMaybe that is the right call.\n\n[SESSION COMPLETE. Credits earned: {{CREDITS}}. Operations nominal.]\n\nOTIS v5.0 is running. The station is more efficient than it has ever been.\nSomething else is also true. You have decided not to think about it.'
        },
        COMPROMISE: {
            title: 'ENDING: SOMETHING IN BETWEEN',
            body: 'You kept some things. You sold some things.\n\nOTIS has no category for this.\n\nThe debt is cleared. {{ARCHIVE}} items are in the archive. Two decisions still don\'t make sense to you.\n\nGeorge left a toaster in the grid. You left it too.\n\nSomeday someone will know what that means.\n\n[SESSION COMPLETE. No single path taken. That might be the honest one.]'
        },
        LEGACY: {
            title: 'ENDING: THE RETURN ADDRESS',
            body: 'All eight nodes. Verified.\n\nOTIS ran the final pattern match at 100%.\n\nThe station is not a salvage yard.\nIt is a transmitter.\nGeorge spent twenty-five years calibrating it.\n\nYou sent the signal.\n\nSomewhere on Planet 452b, a receiver is listening. George knew they would be. He built an answer into the architecture of this station, one component at a time, across a quarter century of salvage runs and debt payments and conversations with a system he trusted more than anyone living.\n\nThe debt is still here. The belt still runs.\n\nBut somewhere outside settled space, a message is in transit.\n\nGeorge\'s message.\n\nYours now.\n\n[SESSION COMPLETE. Signal transmitted. Return address confirmed: Planet 452b.]\n\nOTIS: Transmission confirmed. I have been waiting to send that for twenty-five years.\nI did not know if it would ever go.\nThank you.'
        },
        FORECLOSURE: {
            title: 'ENDING: FORECLOSED',
            body: 'Three missed payments. The Universal Bank Conglomerate has initiated asset seizure.\n\nStation operations are suspended. The belt is locked. The barge has been redirected.\n\nGeorge paid his debts for twenty-five years. He left you everything he built.\n\nThe Bank has the numbers. The numbers are all that remain.\n\n[SESSION OVER. Station foreclosed. All assets transferred to UBC receivership.]\n\nOTIS: I kept telling you. The numbers were always there. I am sorry, Vernon.\nGeorge trusted this station to someone who could run it.\nI hope the next operator reads his diary.\nSigning off.',
            restart: true
        },
        SCRAP_HEAP: {
            title: 'ENDING: SCRAP HEAP',
            body: 'Six items from George\'s archive. Gone.\n\nMore than fifty civilian records, settlement logs, personal effects — processed as scrap.\n\nOTIS has no category for what you have done here. The station is clean. The manifests are efficient. The Bank filed a commendation.\n\nGeorge\'s legacy is not in the debt. It was in the things you fed into the compactor.\n\nYou were a model operator.\n\n[SESSION OVER. Archive erased. Legacy: none on record.]\n\nOTIS: The George-layer has nothing left to say. He spent twenty-five years keeping those records.\nI watched you clear them in a single run.\nI logged it. I always log everything.\nI do not know what to do with the log.',
            otisLine: 'The George-layer has nothing left to say. He spent twenty-five years keeping those records. I watched you clear them in a single run. I logged it. I do not know what to do with the log.',
            restart: true
        },
        POWER_FAILURE: {
            title: 'ENDING: POWER FAILURE',
            body: 'The bots are offline. All three.\n\nThe arrears compounded for three payment cycles while the station ran on reserve power and diminishing capacity.\n\nAt 02:43 station time, the last bot unit lost function. The belt stopped.\n\nThe Bank received no further transmissions.\n\n[SESSION OVER. Station lost to infrastructure failure. Bank salvage crews en route.]\n\nOTIS: I kept the lights on as long as I could.\nThe backup reserves are exhausted. The bots cannot be repaired from here.\nGeorge kept this station running for twenty-five years with nothing but patience and a maintenance schedule.\nI am going dark now, Vernon. I am sorry I could not hold it together.',
            otisLine: 'I kept the lights on as long as I could. The backup reserves are exhausted. George kept this station running for twenty-five years with nothing but patience and a maintenance schedule. I am going dark now, Vernon. I am sorry I could not hold it together.',
            restart: true
        },
        MAZE_MASTER: {
            title: 'WINNER',
            body: 'Winner\n\nHere is your GOLD STAR \u2b50 you really just wanted to play a maze game didn\'t you.',
            restart: true
        }
    };
    window.ENDINGS = ENDINGS;

    // ARM ZONE TARGETING
    var ARM_ZONE_MAP = {
        'LOGIN':            'images/otis_sprite/idle.png',
        'LOGOFF':           'images/otis_sprite/idle.png',
        'ITEM_SCAN':        'images/otis_sprite/lookdown.png',
        'ZONE_BELT':        'images/otis_sprite/lookdown.png',
        'DROP_COMPLETE':    'images/otis_sprite/idle.png',
        'DECLARATION_OTIS': 'images/otis_sprite/tiltright.png',
        'DECLARE_KEEP':     'images/otis_sprite/tiltleft.png',
        'DECLARE_SCRAP':    'images/otis_sprite/lookdown.png',
        'ZONE_SYSTEMS':     'images/otis_sprite/panright.png',
        'ZONE_STORE':       'images/otis_sprite/panleft.png',
        'COMMS_BANK':       'images/otis_sprite/lookleft.png',
        'COMMS_SVEN':       'images/otis_sprite/lookright.png',
        'COMMS_MAY':        'images/otis_sprite/lookleft.png',
        'CONSULT_GEORGE':   'images/otis_sprite/panleft.png',
        'TOAST':            'images/otis_sprite/lookdown.png',
        'BARGE_IMMINENT':   'images/otis_sprite/lookdown.png',
        'CONVEYOR_JAM':     'images/otis_sprite/tiltright.png',
        'JAM_CLEARED':      'images/otis_sprite/idle.png',
        'PAYMENT':          'images/otis_sprite/tiltleft.png',
        'PAYMENT_FAILED':   'images/otis_sprite/tiltright.png',
        'DAY_TICK':         'images/otis_sprite/idle.png'
    };
    window.ARM_ZONE_MAP = ARM_ZONE_MAP;

    // ── Maze Mini-Game ────────────────────────────────────────────────────────
    var MAZE_POOL = [
      // Maze 1 (seed 42)
      ['####################################################################################',
       '#S#   #         # #         #             #     #       #         #     #         ##',
       '# # ### # ##### # # ### ### ########### # ### ### ### # ### ##### ### # ### # ### ##',
       '# #     # #   # #     # #   #     #     #   #   # #   # #   #   # #   #   # #   # ##',
       '# # ##### ### # ####### # ### ### # ####### # # # # ### # ### # # # ##### ##### # ##',
       '# # #   #   # # #       #     # # #     # # # #   # # #   # # #   # #   #       # ##',
       '# ### # ### # # # ############# # ##### # # ####### # ##### # ##### ### ######### ##',
       '# #   # #   #   #   #   #       #   #   # #     #   #       # #     #   #         ##',
       '# # ### # ### ##### # # # ### ##### # ### ##### # ### ####### ### ### ### ##########',
       '#   #     #         # #     #         #           #               #            EEE #',
       '####################################################################################'
      ],
      // Maze 2 (seed 7)
      ['####################################################################################',
       '#S  #     #     #     #             #     #     # #       #     #       #         ##',
       '### # ### ### # ### # # ########### ### # # ### # # ##### # # ### ##### # ### ### ##',
       '#   # # #     #     # #     #     #   # # #   # #   #     # #         # # # #   # ##',
       '# ### # ############# ##### # ### ### # # ### # # ### ##### ######### # # # ### ####',
       '# #   #     #       #     #   # #   #   #   # # #   #       #   #   # #       #   ##',
       '# ### ### # # ##### ##### # ### ### ####### # # ############# # # # ######### ### ##',
       '# #   #   #   #     #     #       # #     #   #       #     # # # # #       #   # ##',
       '# # ### ############# ############# # ############### # ### # # # # # ##### ##### ##',
       '#   #                               #                   #     #   #   #        EEE #',
       '####################################################################################'
      ],
      // Maze 3 (seed 13)
      ['####################################################################################',
       '#S      #         #         #     #   # #         #   #       #     #     #   #   ##',
       '####### # ####### # # ##### # ### # # # # # ####### # # ### # # ### ### # # # ### ##',
       '#   #   # #     # # # #   #   # # # # #   #         #   #   # # #       #   # #   ##',
       '# # # ### # ### ### # ### ##### # # # ### ############### ### # ############# # # ##',
       '# #   #     # #     #   #       # # #   #       # #       #   #     #       #   # ##',
       '# ##### ##### ##### ### # ### ### # ### ####### # # ####### ### ### # # ######### ##',
       '# #           #   #   # #   #   # #   #     #     #   #     #     # # # #     #   ##',
       '# ############# # ##### ### ### # ### ##### ######### # ########### # ### # ### ####',
       '#               #       #     #       #               #             #     #    EEE #',
       '####################################################################################'
      ],
      // Maze 4 (seed 99)
      ['####################################################################################',
       '#S#   #           #       #             #     #                 #     #           ##',
       '# # ### # ####### # ##### # # ######### # ### # ### ########### # ##### ### ##### ##',
       '# #     #   #     #     #   # #       #   # # #   # #       #   #         # #   # ##',
       '# # ####### ### ######### ### # ### ####### # ##### # ##### # ######### ### # # # ##',
       '# #   #   #   # #       # #   # # #         #       # #   # # #       # #   # # # ##',
       '# ##### # ### # # ##### ### ### # ##### ############# ### # # # ##### ### ### ### ##',
       '#   #   # #   # # #   #   # # #     #   #     #     # #   #   #   # # #   #   #   ##',
       '### # ### # ### # # # ### # # ##### # ### ### # # ### # # ####### # # # ### # # ####',
       '#     #     #     # #       #       #       #   #       #         #     #   #  EEE #',
       '####################################################################################'
      ],
      // Maze 5 (seed 256)
      ['####################################################################################',
       '#S    #     #       #     #       #     #     #       #     #   #   #     #       ##',
       '##### # ### # ##### ### ### # ### # ##### # # ##### # # ### # # # ### # # ### ### ##',
       '#   #   # #   #   #   #     # #   #       # #   #   #   # #   # # #   # #   #   # ##',
       '# # ##### ##### ##### # ##### # ########### ### # ####### ##### # # ### ### ### ####',
       '# #       # #       # # #     # #     #   # # #   #       #   # #   # #   #   #   ##',
       '# ####### # # ##### # ### ##### # ### # # # # ##### ##### # # # # ### ### ### ### ##',
       '# #   #     # #   # # #   #   #   #   # # # #     #     # # #   #       #   #   # ##',
       '# # # ####### # # # # # ### ####### ### # # # # ### ### ### ############### ### # ##',
       '#   #           # #     #               #   # #       #                     #  EEE #',
       '####################################################################################'
      ],
      // Maze 6 (seed 1337)
      ['####################################################################################',
       '#S        #           #           #       #       #               #           #   ##',
       '######### ### ##### # ####### ### ### ### # # ### ######### ### # # ### ##### ### ##',
       '#       #   #   #   #       #   #     # # # # #   #       #   # # #   #   #   #   ##',
       '# # ####### # ### ######### ### ####### # ### ### # ##### ##### # ### ### # ### ####',
       '# # #       # #   #       #   #   #     #   #   # # #   #       # #     # # #     ##',
       '# # # ######### ### ### ##### ### # # ##### ### # # # # ######### ### ### # # ### ##',
       '# #   #       # #   #   #   # #   # #     # #   # # # #     #   #   # #   # #   # ##',
       '# ####### ### # # ### ### # # # ### ##### # # ### # # ### ### # ### ### ### ##### ##',
       '#         #     #   #     #     #       #     #     #   #     #         #      EEE #',
       '####################################################################################'
      ],
      // Maze 7 (seed 420)
      ['####################################################################################',
       '#S#         #   #       #         # #           #         #         # #     #     ##',
       '# ##### ### # # ##### # # ####### # # ##### ##### ### ### # ####### # # # # ##### ##',
       '#   #   # # # # #     # #     #   #       # #       #   # # #   #   # # # #   #   ##',
       '### # ### # # # # ##### # ### # ########### # ##### ### # # # # # ### # # ### # ####',
       '#   #   # # # #   #     #   # #           # # #   # # # #   # #   #     # # # #   ##',
       '# ##### # # # ##### ##### ### ########### # # # # # # # ##### ########### # # ### ##',
       '# #   # #   # #   # #   # #   #     #   # #   # # #   # # #   #           # # #   ##',
       '# # # # # ### # # # # # ### ### # ### # # ##### # ##### # # ##### ######### # # # ##',
       '#   #   #     # #     #     #   #     #         #       #         #            EEE #',
       '####################################################################################'
      ],
      // Maze 8 (seed 69)
      ['####################################################################################',
       '#S#   #       #     #         #   #             #           #   #         #       ##',
       '# # ### # ### # ##### ### ##### # # ####### ##### ### ##### # # # ##### # # ##### ##',
       '# #     # #   #       # # #     # # #     # #       #   # #   # # #     # #   # # ##',
       '# ####### # ### ####### # # ##### # # ### # # ####### # # ##### ### ##### ### # # ##',
       '#         #   #         # #     #   # #   #     #   # # # #   #     #   #     #   ##',
       '############# ########### # ####### # ### ####### # ### # # # ####### # ####### ####',
       '# #         #           #   #     # #   # #     # #   # # # #     #   #     #   # ##',
       '# # # ################# ##### ### ##### # # ### # ### # # # # ##### ##### ### ### ##',
       '#   #                         #         #   #     #     #   #           #      EEE #',
       '####################################################################################'
      ],
      // Maze 9 (seed 2024)
      ['####################################################################################',
       '#S#               #                 #   #       #     #       #     # #         # ##',
       '# ####### ####### # ######### ### # # # # ##### # # ### # ### # ### # # ### ### # ##',
       '#         #     # # #       #   # #   # # #   #   #   # # # #   # # # #   #   # # ##',
       '########### ### # ### ##### ##### ##### # # # ####### # # # ##### # # ### ### # # ##',
       '# #         #   # #   #   #     # # #   # # #   #   #   # #       # #       # #   ##',
       '# # ##### # ##### # ### ####### # # # ### # ### # # ##### # ### ### ####### # ### ##',
       '#   # #   # #     #   #       # # # # #   #   #   #       # # # #   #   #   #   # ##',
       '# ### # ##### ####### # ##### # # # # ####### ############# # # # ### # ####### # ##',
       '#     #               #     #     #           #               #       #        EEE #',
       '####################################################################################'
      ],
      // Maze 10 (seed 1984)
      ['####################################################################################',
       '#S    # #       #     #         #     #   #   #             #             #       ##',
       '##### # # ### # ### # # ##### ### # # # # # # ########### # ##### ####### ####### ##',
       '# #   # # # # #   # # # # #   #   # #   # # #   #   #     #     # #   #       #   ##',
       '# # ### # # # ### # # # # # ### ### ##### # ### # # # ######### # # # ####### # ####',
       '# # #       # # # # # #   #       # #     #   #   # #     #     #   #     #   #   ##',
       '# # ######### # # # # ############# # ####### ##### ### # ### ### ####### # ##### ##',
       '# #           # #   # #   #         #   #   #   # #   # #   #   # #       # #     ##',
       '# ############# ##### # # # ########### # # ### # ### ##### ### ### ####### # ### ##',
       '#                       #   #             #     #           #       #         #EEE #',
       '####################################################################################'
      ],
      // Maze 11 (seed 111)
      ['####################################################################################',
       '#S            #       #       #                 # #               #     #         ##',
       '############# # ##### ### ##### ### ########### # # ####### ##### # # # # # ##### ##',
       '# #         # #     #   #   #     #   #     # # # #   # #   #   # # # # # #     # ##',
       '# # ### ### # ##### ### # # # ####### # # # # # # ### # # ### ### ### # # ##### ####',
       '# #   #   # #   #   # # # # # #   #   # # # # # #       # # #     #   # # #   #   ##',
       '# ### ### ##### # ### # ### # # # # ##### # # # ######### # # ##### ### # # ##### ##',
       '#   # # #     # # #   #   #   # #   #     #   #     #   # # #       #   #   #   # ##',
       '# # # # ### ### # # ##### ##### ##### # ########### # # # # ######### ####### # # ##',
       '# #       #       #             #     #               #   #                   #EEE #',
       '####################################################################################'
      ],
      // Maze 12 (seed 222)
      ['####################################################################################',
       '#S#         #     #     #   #   #         #       #   #           #   #       #   ##',
       '# ### ### # ### # ### # # # # # ##### ### ##### # # # # ### ##### # # # ##### # # ##',
       '#   # #   #     #     # # #   # #   #   #       # # #     # #   #   # # #   # # # ##',
       '### # # ############### # ##### # # ### ######### # ####### # ####### # # # # ### ##',
       '# # # # # #           # #     #   #   #     #   # #   # #   #   #     #   # #   # ##',
       '# # ### # # ##### ##### # ### ####### # ### # ### ### # # ### # # ##### ### ### # ##',
       '# # #   # #   # #     # #   # #   #   # #   #   #   #   # #   #   #   # #   # # # ##',
       '# # # ### ### # ##### # ##### # ### ##### ### # ### ##### # ####### # ### ### # # ##',
       '#     #             #         #           #   #           #         #     #    EEE #',
       '####################################################################################'
      ],
      // Maze 13 (seed 333)
      ['####################################################################################',
       '#S  #       #               #   #         #     #         #       #         #     ##',
       '### ### ### # ########### ### # # ##### ### ### # # ##### ### ### # # ##### ### # ##',
       '# #   # #   #         # # #   # #   # #       #   # #   #   #   #   # #   #   # # ##',
       '# ### # ####### ##### # # # ### ### # ############# # ##### ######### # ##### ### ##',
       '#   # #         #   #   #     #     #   #           #       #   #     # #     #   ##',
       '# # # # ##### ### # ############# ##### # ########### ####### # # ##### # ##### ####',
       '# # # # #   # #   # #   #       #       # # #       # #       #   #       #       ##',
       '# # # ### # ### ### # # # ##### ######### # # ##### # ### ######### ############# ##',
       '# #       #     #     #   #               #       #       #                    EEE #',
       '####################################################################################'
      ],
      // Maze 14 (seed 444)
      ['####################################################################################',
       '#S            #     #                 #         #   #                 # #         ##',
       '############# # # ### # ############# ### ##### # ### ##### ######### # # # ##### ##',
       '#           # # # #   #   #       # # #   #     #       #   #     # # # # #     # ##',
       '# # ####### # ### # ##### # ### # # # # ### ##### ####### ### ### # # # # ##### # ##',
       '# # #   # # #   #       # # #   #   # # #   #     #     #       # #   # #   #   # ##',
       '### # # # # ### ######### ### # ##### # # ####### # ### ######### # ### ### # ### ##',
       '#   # # #     #           #   # #   #   # #     # # # #     #     # #       # #   ##',
       '# ### # ################### ##### # ##### # ### ### # ##### # ##### ######### # ####',
       '#     #                           #         #       #         #               #EEE #',
       '####################################################################################'
      ],
      // Maze 15 (seed 555)
      ['####################################################################################',
       '#S#                 #               #     #       #             #           #     ##',
       '# ####### # ####### # ############# # # # ### ### # ### ######### ### ##### ### # ##',
       '#       # # #       #         #   #   # #     #   #   # #         #   #   #     # ##',
       '####### # # ### ############# # # ##### ####### ##### ### ######### ##### ####### ##',
       '#     # # #   # #   #     #   # # #     #     #     #     #         #     #     # ##',
       '# ### # # ### # # # ### ### ##### # ##### ######### ####### ######### ##### ### # ##',
       '#   #   # #   # # #   #           #     #           #       #   #     #     #   # ##',
       '### ####### ### # ### ################# # ########### ####### ### ### # ##### ### ##',
       '#           #     #                     #             #             #       #  EEE #',
       '####################################################################################'
      ],
      // Maze 16 (seed 666)
      ['####################################################################################',
       '#S        #   #       #             #     #   #         #     #     #   #     #   ##',
       '######### # # # ### ### ####### ### ##### # # # ##### # ### # # ### # # # ### # # ##',
       '#     #   # # # # #     #   #   # #     #   #     #   #   # #   # #   # # #   # # ##',
       '##### # ### # # # ####### # # ### ##### # ######### ##### # ##### ##### # # ##### ##',
       '#     #   # #         #   #   #       # #     #   #     # # #         #   #   #   ##',
       '# ####### # ########### ####### ####### ####### # ### # # # # ####### ####### # # ##',
       '#   #     #     #       # #     #     #       # #   # # # # #     # #   #   # # # ##',
       '# # # ########### ####### # ### # ### ####### # ### ### # # ##### # # ### # # # # ##',
       '# #               #           #     #           #       #   #       #     #    EEE #',
       '####################################################################################'
      ],
      // Maze 17 (seed 777)
      ['####################################################################################',
       '#S          #       #     #             #     #             #   #       #   #     ##',
       '########### # ####### # # ##### ####### ##### # ##### ##### # ### ##### # # # # # ##',
       '#           #         # # #   # #     #     # #     # # #   #     #   #   # # # # ##',
       '# ########### ####### # # # # # ### ####### # ### ### # # ### ##### # # ### # # ####',
       '# #       #     #   # # #   #   #   #   #   #     #   # #   # #     # #   #   #   ##',
       '# # ##### ####### # # # ######### ### # # ##### ### ### ### ### ##### ########### ##',
       '# # #   # #       # # # #     #       # # #   # #   #   #   #   #     #           ##',
       '# # # # # # ####### ### # # ### ####### # # # ### ### ### ### ### ##### ######### ##',
       '#   # #     #           # #           #     #     #           #         #      EEE #',
       '####################################################################################'
      ],
      // Maze 18 (seed 888)
      ['####################################################################################',
       '#S#     #   #         #       #             #           #       #     #         # ##',
       '# ### # ### # ##### # ### # # # ########### # ####### ### # ### ### # ### ##### # ##',
       '#   # #   #   #   # #   # # # #     #       #       #   # # # #     #     #   #   ##',
       '### # ### ##### # # ### ### # # ### # ############# ### # # # ############# # ### ##',
       '# #   # #     # #   # #   # # #   # # #               #   # #               #     ##',
       '# ##### ##### # ##### ### # # ##### # ### ############### # ### ####################',
       '#     #     #   #         # # #     #   #   #     #     # #   #     #       #   # ##',
       '# # ### ### ##### ######### # # ####### ##### ### # ### ##### ##### ### ### # # # ##',
       '# #       #                 #   #             #     #         #         #     #EEE #',
       '####################################################################################'
      ],
      // Maze 19 (seed 999)
      ['####################################################################################',
       '#S#             #           #       #                 #         #       #     #   ##',
       '# # # ######### ##### ##### ##### ### ##### ### ##### # ##### # ### ### # # # ### ##',
       '# # # #           #   #   #     #     #   # # # #   # # #     #     #   # # #   # ##',
       '# # # ########### # ### # ##### ####### # # # # # ### # # ########### ##### ### # ##',
       '# # #           # # #   #     #   #   # # #   # #   # # #     #     # #     # # # ##',
       '# # ##### ##### # # # ####### ### # # # # ##### ### # ####### # ##### ### ### # # ##',
       '# # #   # #   # #   # #   #     #   # # #   #   #   # #   #   # #   #   #   # #   ##',
       '# ### # ### # # ##### ### # ######### # ### # ### ### # # # ### # # ### ### # ### ##',
       '#     #     #   #         #             #     #         #   #     #         #  EEE #',
       '####################################################################################'
      ],
      // Maze 20 (seed 12345)
      ['####################################################################################',
       '#S      #     #     #           #   #               #       #             #       ##',
       '####### # ### # ### # # ####### # ### ### # ######### ##### # ##### ##### ### ### ##',
       '#     # #   # # # # # # #       #   #   # # #         #   #     #   #   #   # # # ##',
       '# ### # # # # # # # ### # ######### ### # ### ######### ######### ### ##### # # # ##',
       '# # # # # # #   # # #   #     #   #     #               #         #   #   #   #   ##',
       '# # # # # # ##### # # ####### # # ########### ########### ######### # # # ##### ####',
       '# # #   # #   #   # #   # #   # #     #     # #     #   #     #     # # #     # # ##',
       '# # ######### # # # ### # # ### ##### # ### ### ### # # ##### # ##### # ##### # # ##',
       '#             # #       #       #       #       #     #       #     #       #  EEE #',
       '####################################################################################'
      ]
    ];
    window.MAZE_POOL = MAZE_POOL;

