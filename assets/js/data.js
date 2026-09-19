/* ============================================================
   KID HUSTLE LAB — idea database
   Every idea carries: who it suits, what it pays, what it takes,
   and what a kid should say to land the first customer.

   startup = one-time cost of the kit you buy once
   mat     = supplies used up per job (defaults to 0 when omitted)
   ============================================================ */

window.CATEGORIES = [
  { id: "home",    name: "Home & Yard",     emoji: "🏡", color: "#ff8a3d", blurb: "Physical work, big satisfaction, customer usually owns the tools." },
  { id: "animals", name: "Animals & Kids",  emoji: "🐾", color: "#12b886", blurb: "Highest trust, highest pay per hour. Parents must know the family first." },
  { id: "digital", name: "Digital & Tech",  emoji: "💻", color: "#6c5ce7", blurb: "Zero heavy lifting. Needs a phone, tablet, or laptop and wifi." },
  { id: "craft",   name: "Craft & Making",  emoji: "🎨", color: "#e84393", blurb: "Turn a hobby into inventory you sell at markets, school, and online." },
  { id: "organize",name: "Organizing",      emoji: "♻️", color: "#0ca678", blurb: "Adults pay real money to be rescued from their own clutter." }
];

window.VIBES = [
  { id: "outdoor", label: "Outside & moving",  emoji: "🌤️", hint: "yards, snow, cars, pools" },
  { id: "animals", label: "Animals & kids",    emoji: "🐕", hint: "pets, sitting, tutoring" },
  { id: "digital", label: "On a computer",     emoji: "⌨️", hint: "design, video, websites" },
  { id: "craft",   label: "Making things",     emoji: "🧵", hint: "sell what you create" },
  { id: "organize",label: "Fixing messes",     emoji: "📦", hint: "sorting, decluttering" }
];

window.AGE_BANDS = [
  { id: "8-10",  label: "8–10",  age: 9,  note: "Work with a grown-up nearby" },
  { id: "11-12", label: "11–12", age: 12, note: "The sweet spot to start" },
  { id: "13-14", label: "13–14", age: 13, note: "Real hours, real money" },
  { id: "15-17", label: "15–17", age: 16, note: "Run it like a company" }
];

window.IDEAS = [
  /* ---------------- HOME & YARD ---------------- */
  {
    id: "lawn-mowing", emoji: "🌱", title: "Lawn Mowing", cat: "home", mode: "outdoor",
    ages: [11, 17], level: 2, startup: 0, demand: "high", seasons: "Spring–Fall",
    price: "$25–45", payLow: 25, payHigh: 45, payUnit: "yard", time: "45–75 min",
    tagline: "The most reliable first business in America. Lawns never stop growing.",
    why: ["Neighbors mow every 7–10 days all season, so it repeats automatically", "Customers own the mower, gas, and bags — your startup cost is zero", "One street can keep a kid busy three afternoons a week"],
    gear: ["Customer's mower (get a 5-minute safety walkthrough)", "Safety glasses + closed-toe shoes", "Work gloves", "Trash bag for clippings", "Your price list and a pen"],
    steps: ["Measure your own yard, time yourself mowing it — that's your honest pace", "Practice on your lawn and a relative's until the lines are straight", "Walk your block with a parent and knock on the 6 most overgrown lawns", "Quote a flat price per yard, not per hour — neighbors love flat prices", "Take a before/after photo every single job for the fridge-worthy proof sheet"],
    script: "\"Hi, I'm [name] from two doors down. I'm mowing lawns on this street on Saturdays — front and back is $30, and I edge the walkway for free the first time. Can I do yours this Saturday morning?\"",
    safety: ["Never mow with bare feet or flip-flops", "Shut the mower off before clearing a clog — never reach in while it runs", "Learn where the gas cap and the blade brake are before you pull the cord", "Skip steep hills, wet grass, and any yard with rocks or toys in it"],
    upsell: "Offer a $12 add-on to bag and haul clippings, or $15 for hedge touch-ups."
  },
  {
    id: "weed-pulling", emoji: "🌿", title: "Weed Pulling", cat: "home", mode: "outdoor",
    ages: [9, 17], level: 1, startup: 0, demand: "high", seasons: "Spring–Fall",
    price: "$10–20", payLow: 10, payHigh: 20, payUnit: "hour", time: "1–2 hrs",
    tagline: "Nobody wants to do it. Everybody has it. The perfect low-barrier start.",
    why: ["You only need hands, a bucket, and gloves", "Great for younger kids — zero machines involved", "Gardeners happily pay more than mowing per hour because it's tedious work"],
    gear: ["Gardening gloves", "Small hand trowel or weeding fork", "Bucket or tarp for the pile", "Knee pad or folded towel", "Spray bottle of water for cleanup"],
    steps: ["Have a grown-up point out weeds vs. plants in your own garden first", "Photograph a before and after of one flower bed at home — that's your portfolio", "Ask neighbors with big flower beds and no time", "Agree on price BEFORE starting: flat rate per bed, or hourly", "Bag everything and leave the bed looking like a magazine photo"],
    script: "\"Hi! I'm doing garden cleanups on our street this week. I'll pull every weed in this bed and haul it away for $15 — want me to start with the front one?\"",
    safety: ["Wear gloves — some weeds sting or irritate skin", "Never eat or taste anything from a garden", "Ask before touching plants: some are the neighbor's prized flowers", "Watch for bees, wasps, and ant hills"],
    upsell: "Add fresh mulch spreading for $25 a bed, or a weekly maintenance visit."
  },
  {
    id: "leaf-raking", emoji: "🍂", title: "Leaf Raking", cat: "home", mode: "outdoor",
    ages: [9, 17], level: 1, startup: 0, demand: "high", seasons: "Autumn",
    price: "$20–40", payLow: 20, payHigh: 40, payUnit: "yard", time: "1–2 hrs",
    tagline: "Four weeks a year where every single house on the block needs help.",
    why: ["Autumn demand is enormous and lasts about a month", "You can book the whole street in one weekend", "Repeat customers hire you again every October"],
    gear: ["Leaf rake (fan rake) and a sturdy garden rake", "Tarps — the fastest way to move a pile", "Heavy-duty paper bags or a bin", "Work gloves", "A wheelbarrow if you can borrow one"],
    steps: ["Rake your own yard and time it — that's your pricing guide", "Post a hand-drawn flyer at the mailbox cluster or on community boards", "Offer a 'front yard only' price so it feels affordable", "Rake onto a tarp, drag the tarp to the curb — 3x faster than bagging", "Offer to come back after the next windy week for a discount"],
    script: "\"Hi, I'm doing fall yard cleanups for $30 a yard, leaves hauled to the curb and everything. I have Saturday morning open — should I put you down?\"",
    safety: ["Don't jump into leaf piles — hidden sticks and rocks cause injuries", "Lift with your legs, not your back, when moving full bags", "Never rake near a running car or into the street", "Wet leaves are slippery — wear shoes with grip"],
    upsell: "Bundle raking + gutter clearing in the fall, and snow shoveling in the winter."
  },
  {
    id: "snow-shoveling", emoji: "❄️", title: "Snow Shoveling", cat: "home", mode: "outdoor",
    ages: [10, 17], level: 2, startup: 0, demand: "high", seasons: "Winter",
    price: "$15–35", payLow: 15, payHigh: 35, payUnit: "driveway", time: "30–60 min",
    tagline: "The highest-paid hour of the year. Snow is a countdown clock for adults.",
    why: ["People are late for work and will pay extra for speed", "One storm = every driveway on the street needing help at once", "You can charge a season pass for steady, guaranteed money"],
    gear: ["Snow shovel + a push broom", "Ice melt or sand for walkways", "Waterproof gloves and boots", "Warm hat, extra pair of socks", "A headlamp for early-morning shoveling"],
    steps: ["Shovel your own driveway first and time it carefully", "Before the storm, hand out cards saying you shovel within 2 hours of it stopping", "Sell a 'season pass': $250 for the whole winter, paid in two parts", "Always clear the mailbox, the front walk, and the path to the door — that's what neighbors actually care about", "Check in on elderly neighbors first, sometimes for free, always for tips and referrals"],
    script: "\"Hi! Storm's coming tonight. I shovel walkways and driveways — $25 for the driveway and walk, and I'll have it done before 8am. Want me to add you to my list for the season?\"",
    safety: ["Never shovel after dark without a light and reflectors", "Push snow, don't lift it, and take breaks — heart strain is real", "Don't start a snow blower unless an adult trains you on it personally", "Come inside if fingers or toes go numb"],
    upsell: "Add a monthly $40 'always clear' contract for the whole winter season."
  },
  {
    id: "watering-plants", emoji: "🪴", title: "Plant Watering While People Travel", cat: "home", mode: "outdoor",
    ages: [8, 17], level: 1, startup: 0, demand: "medium", seasons: "All year",
    price: "$8–15", payLow: 8, payHigh: 15, payUnit: "visit", time: "15–30 min",
    tagline: "Small job, huge gratitude. Vacation season turns this into a route.",
    why: ["Families go away constantly and hate losing plants", "You can stack 4–6 houses into a single walk", "Indoor plant jobs pay the same and happen in the winter too"],
    gear: ["Customer's watering cans", "A checklist of which plant gets how much", "Paper towels for drips", "A simple log sheet with times and dates"],
    steps: ["Write down the exact instructions for each house and read them back to the owner", "Text a photo of the watered plants on day one, day three, and the last day", "Charge per visit, not per plant — simpler to explain", "Ask about mail collection and trash bins while they're away (extra $5)", "Leave a note card with your name so they remember you next trip"],
    script: "\"Going away this summer? I water plants for $12 a visit and text you photos so you know they're happy. I can also bring in the mail.\"",
    safety: ["Only if a parent has met the family and knows the house", "Never enter a home without a parent's approval and never take a key without one", "Watch for wet floors — you're the one who gets blamed", "Only water what the owner marks; over-watering kills plants"],
    upsell: "Add mail pickup ($5/visit), trash bins ($5), and garden hose duty ($5)."
  },
  {
    id: "curb-number-painting", emoji: "🔢", title: "Curb Number Painting", cat: "home", mode: "outdoor",
    ages: [12, 17], level: 2, startup: 25, mat: 1.5, demand: "medium", seasons: "Spring–Fall",
    price: "$15–25", payLow: 15, payHigh: 25, payUnit: "curb", time: "25 min",
    tagline: "A one-time purchase of a stencil turns into a whole afternoon of paid curbs.",
    why: ["Faded house numbers are a safety issue — that's your sales pitch", "Almost every house has the same problem and nobody wants to fix it", "One $25 kit paints 20+ curbs, so the profit margin is huge"],
    gear: ["Number stencils (0–9)", "Exterior concrete spray paint in white or yellow", "Wire brush + broom for cleaning", "Painter's tape and a cardboard shield", "Mask and safety glasses"],
    steps: ["Practice once on a scrap board or your own curb until the numbers are crisp", "Get permission from the homeowner in writing (a text message is fine)", "Offer a discount if two neighbors on the same street both buy in", "Mask off the area, clean the surface, spray two light coats instead of one heavy one", "Photograph every finished curb and build a mini portfolio for the next street"],
    script: "\"Hi, I repaint street numbers so emergency vehicles can find you fast — it's $20, takes me about twenty minutes, and I'm doing the Miller's curb next door right now.\"",
    safety: ["Spray paint must be used outdoors, never in a garage", "Wear a mask and glasses — never spray toward your face", "Only paint the homeowner's own curb, with their permission", "Never step into the road to work — pull up close from the lawn side"],
    upsell: "Offer a package deal: repaint numbers plus paint a mailbox post for $35."
  },
  {
    id: "window-washing", emoji: "🪟", title: "Window Washing", cat: "home", mode: "outdoor",
    ages: [11, 17], level: 2, startup: 15, mat: 1, demand: "medium", seasons: "Spring–Fall",
    price: "$3–5", payLow: 25, payHigh: 60, payUnit: "house", time: "45–90 min",
    tagline: "Ground floor only. Streak-free results are obvious, so word travels fast.",
    why: ["Customers can see the improvement instantly", "A couple of dollars per window adds up to $50+ in an afternoon", "Spring cleaning season makes it a repeat gig every year"],
    gear: ["Squeegee (6\u2033 and 12\u2033)", "Microfiber cloths + a scrubber sponge", "Bucket with a squirt of dish soap", "White vinegar for a streak-free rinse", "Step stool and a towel for drips"],
    steps: ["Practice the squeegee stroke at home: soap, scrub, then pull down in one clean line", "Book a first 'demo' window free for one neighbor — they'll hire you on the spot", "Charge per window with a minimum job price so small jobs still pay", "Bring a towel for wet sills and always wipe the frame too", "Ask for a review from the first three customers and quote them on your flyer"],
    script: "\"Hi! I'm washing ground-floor windows on the street this week — outside glass, inside if you want, for $4 a window. I can do your front three right now for $12 so you can see how it looks.\"",
    safety: ["Ground floor only — no ladders, ever, no second stories", "Never lean out over a sill or climb on furniture", "Use a step stool only on flat, dry ground", "Skip windows with cracks or loose frames"],
    upsell: "Add screen rinsing for $2 each and sliding-door tracks for $5."
  },
  {
    id: "trash-can-management", emoji: "🗑️", title: "Trash Can Management", cat: "home", mode: "outdoor",
    ages: [8, 17], level: 1, startup: 0, demand: "high", seasons: "All year",
    price: "$5–8", payLow: 5, payHigh: 8, payUnit: "visit", time: "10 min",
    tagline: "The most boring job on this list — and the one that quietly earns every week.",
    why: ["Collection day comes 52 times a year, so it's recurring by nature", "Adults in work clothes hate doing it — perfect timing gap for a kid", "Elderly neighbors need it and will happily pay more"],
    gear: ["A route list with house addresses and bin day", "Gloves", "A watch or phone reminder", "Rain boots for bad days"],
    steps: ["Find your town's collection day for each street you serve", "Offer a monthly subscription: $25/month, every week, guaranteed", "Send a reminder text the night before so nobody forgets to fill the cans", "Bring the cans back within 3 hours of pickup — that's the whole product", "Add a holiday-week check-in, since collection days shift and people forget"],
    script: "\"Hi! I take bins out and bring them back every collection day — it's $6 a week or $25 for the month, and I send a reminder text the night before. I've got three houses on the street already.\"",
    safety: ["Wear gloves when handling lids and handles", "Never climb inside a bin", "Don't handle needles, glass, or unknown trash — ask an adult", "Watch for traffic when pulling bins to the road"],
    upsell: "Add a bin-wash (hose + soap + dry) once a month for $10."
  },
  {
    id: "car-washing", emoji: "🚗", title: "Car Washing & Vacuuming", cat: "home", mode: "outdoor",
    ages: [12, 17], level: 3, startup: 30, mat: 2, demand: "medium", seasons: "Spring–Fall",
    price: "$25–50", payLow: 25, payHigh: 50, payUnit: "car", time: "60–90 min",
    tagline: "The highest ticket on the street — and adults tip generously for clean interiors.",
    why: ["One job pays more than a whole afternoon of most starter ideas", "Interior vacuuming is the part people really hate doing", "Can be run as a driveway wash station for three cars in a row"],
    gear: ["Car wash soap (never dish soap — it strips wax)", "Two buckets + wash mitt + wheel brush", "Microfiber drying towels", "Vacuum and extension cord", "Glass cleaner + interior wipes"],
    steps: ["Wash a family car twice and photograph every stage for a portfolio", "Ask 5 neighbors if you can do a $15 first-time 'showcase' wash", "Book two cars back-to-back in one driveway so you only set up once", "Charge a package: exterior only, or full inside-and-out", "Ask permission to use the customer's hose, water, and power outlet up front"],
    script: "\"Hi! I'm detailing cars on the street this Saturday — inside vacuumed, outside hand-washed and dried, $35. I bring everything except your hose. Want the 10am slot?\"",
    safety: ["Always work on a parked car with the engine off and keys out", "Never wash a car in gear or with anyone inside", "Keep water away from electrical outlets and the vacuum cord", "Never use a hose to spray inside the car — damp electronics cause real damage"],
    upsell: "Add tire shine and headlight wipe-down for $10, or an all-three-cars deal."
  },
  {
    id: "pool-skimming", emoji: "🏊", title: "Pool Skimming & Care", cat: "home", mode: "outdoor",
    ages: [11, 17], level: 2, startup: 0, demand: "medium", seasons: "Summer",
    price: "$20–35", payLow: 20, payHigh: 35, payUnit: "visit", time: "30 min",
    tagline: "A 20-minute job that neighbors pay weekly to never think about.",
    why: ["Pool owners travel in summer — they need someone reliable weekly", "Pays more per hour than almost any yard job", "The task is easy once an adult shows you the equipment"],
    gear: ["Skimmer net with telescoping pole", "Bucket for debris", "Test strips (for reporting only, not chemicals)", "Sunscreen and a hat"],
    steps: ["Focus on families going on vacation — check with a parent who's friends with them", "Learn the skimmer, brushes, and where the filter basket is from an adult first", "Offer a vacation package: $100 for a week of daily visits", "Text a photo of the clean pool each visit so they can relax", "Never handle chemicals — report the test strip reading to the owner instead"],
    script: "\"Away this summer? I skim the pool and check the filter basket daily — $25 a visit, and I'll text you a photo so you know it's swim-ready when you're back.\"",
    safety: ["Never swim alone, and never go in the pool during a job", "Stay away from the pump, filter, and chemical shed", "No chemical handling for kids — ever", "Wear shoes on wet concrete, and never run around a pool deck"],
    upsell: "Add plant watering and trash bins while they're away for a combined $40 visit."
  },

  /* ---------------- ANIMALS & KIDS ---------------- */
  {
    id: "dog-walking", emoji: "🐕", title: "Dog Walking", cat: "animals", mode: "animals",
    ages: [10, 17], level: 2, startup: 20, demand: "high", seasons: "All year",
    price: "$12–20", payLow: 12, payHigh: 20, payUnit: "walk", time: "30 min",
    tagline: "The most requested kid job in every neighborhood, all four seasons.",
    why: ["Dogs need walking every single day, rain or shine", "Meet-the-dog visits turn one-time walks into a weekly schedule", "A reliable kid walker costs the owner half of a professional service"],
    gear: ["Customer's leash and harness (learn their fit)", "Poop bags — bring triple what you think you need", "One-page info card per dog: name, route, allergies, vet number", "Water bottle on hot days"],
    steps: ["Walk with a parent and the owner for the first 2 walks so everyone is comfortable", "Complete a dog-safety sheet per dog: does it hate skateboards? other dogs? kids?", "Set a fixed route and stick to it so the dog learns the pattern", "Text a photo and a one-line report after every walk", "Open 3 slots per day max — never overbook dogs you can't control"],
    script: "\"Hi! I walk dogs on this street after school. I'd love to meet [dog] first with my mom so you can see how we do — $15 for a 30-minute walk, and I'll send you a picture every time.\"",
    safety: ["Never walk a dog you haven't met with its owner present", "Only walk dogs you can physically control — no dogs over 40 lbs until you're experienced", "Skip dogs with a bite history, no exceptions", "Stay off busy roads, never let the leash wrap your wrist, and never drop the leash"],
    upsell: "Offer a 5-walk weekly package at $60, and pet sitting during vacations."
  },
  {
    id: "pet-feeding", emoji: "🐈", title: "Pet Feeding While Away", cat: "animals", mode: "animals",
    ages: [9, 17], level: 2, startup: 0, demand: "high", seasons: "All year",
    price: "$10–18", payLow: 10, payHigh: 18, payUnit: "visit", time: "20 min",
    tagline: "Cats, dogs, and fish don't care about holidays — their owners do.",
    why: ["Vacation pet care is a $100+ booking per trip for one family", "Owners strongly prefer a neighbor kid over a boarding facility", "Fish and cats are the ideal starter animals for younger kids"],
    gear: ["Written feeding chart from the owner", "Scoop and bags for litter boxes", "Gloves", "A log sheet with dates and times checked off"],
    steps: ["Write the owner's instructions down and text them back before the trip — never trust memory", "Do one practice visit with the owner home first", "Visit at the same times every day; pets notice", "Send photos plus a note about appetite and behavior", "Do a final walkthrough with the owner when they return"],
    script: "\"Going out of town? I feed cats and dogs and refresh water, $15 a visit, and you get a photo each time. I can do mornings and evenings.\"",
    safety: ["A parent must meet the family and know the entry plan", "Never enter an unfamiliar home alone", "Never give human food or medicine to a pet", "Leave every gate and door exactly as you found it — a lost pet is the worst outcome"],
    upsell: "Bundle plant watering, mail, and litter box duty into a $25 daily visit."
  },
  {
    id: "cage-cleaning", emoji: "🐹", title: "Small Pet Cage Cleaning", cat: "animals", mode: "animals",
    ages: [9, 17], level: 2, startup: 10, demand: "medium", seasons: "All year",
    price: "$15–25", payLow: 15, payHigh: 25, payUnit: "cage", time: "40 min",
    tagline: "Nobody enjoys it. Everybody owns at least one of these pets.",
    why: ["Hamster, rabbit, and bird cages need cleaning every 1–2 weeks", "Owners find the job gross, which means the pay is generous", "It's a fixed chore with a clear before and after"],
    gear: ["Nitrile gloves", "Pet-safe cage cleaner + paper towels", "Fresh bedding (ask the owner to buy their brand)", "Small scrub brush", "Trash bags"],
    steps: ["Start with a family pet so you learn handling and escape-proofing", "Photograph a spotless cage for your portfolio", "Offer a recurring schedule instead of one-time visits", "Put the animal in a safe carrier during cleaning so it can't run", "Count the water bottle and food dish as part of the job every time"],
    script: "\"I clean small pet cages for $20 — fresh bedding, washed dish, wiped down. I can come every two weeks on Saturday so you never have to think about it.\"",
    safety: ["Always ask an adult how to handle the pet before you lift it", "Never use bleach or human cleaners on a cage — use pet-safe only", "Close the room door before opening any cage", "Wash your hands before and after handling any animal"],
    upsell: "Add nail trims? No — leave that to adults. Add pet feeding visits instead."
  },
  {
    id: "dog-bathing", emoji: "🛁", title: "Dog Bathing", cat: "animals", mode: "animals",
    ages: [11, 17], level: 2, startup: 15, mat: 1.5, demand: "medium", seasons: "All year",
    price: "$20–35", payLow: 20, payHigh: 35, payUnit: "dog", time: "50 min",
    tagline: "Small and medium dogs only — and the price is set by the breed's fluff.",
    why: ["A groomer charges $60+; you charge $25 and are three houses away", "Owners love the convenience more than the savings", "Repeat customers every 4–6 weeks, forever"],
    gear: ["Dog shampoo (never human shampoo)", "Two towels per dog", "A cup for rinsing", "Rubber curry brush", "Tub or kiddie pool with a non-slip mat"],
    steps: ["Practice on a calm family dog until you're fast and gentle", "Ask the owner about skin problems, ear infections, and nervousness up front", "Never get water in the ears or eyes — that's how you lose a customer", "Blow-dry or towel-dry thoroughly; a wet dog shaking indoors is a bad review", "Ask if they also want the nails or the ears done — then say no and refer to a groomer"],
    script: "\"I bathe small and medium dogs at home for $25 — warm water, dog shampoo, towel dry, and a brush-out. I can do [dog] on Saturday afternoon if you'd like to try it.\"",
    safety: ["Back only — no ears, eyes, or legs, and never scissors near a dog", "Skip dogs with skin conditions, stitches, or anxiety until an adult says yes", "Never bathe a dog alone without an adult in the house", "Keep the water lukewarm and the floor covered so nobody slips"],
    upsell: "Sell a monthly 'always fresh' plan for $60, or add a neighborhood dog walk."
  },
  {
    id: "mothers-helper", emoji: "🍼", title: "Mother's Helping", cat: "animals", mode: "animals",
    ages: [11, 17], level: 2, startup: 0, demand: "high", seasons: "All year",
    price: "$10–15", payLow: 10, payHigh: 15, payUnit: "hour", time: "2 hrs",
    tagline: "The gateway job to babysitting — the parent is always home, and it pays by the hour.",
    why: ["Parents desperate for an hour of uninterrupted work will pay well", "Lower pressure than full babysitting because a parent is present", "It's the fastest way to earn a babysitting reference"],
    gear: ["A bag of tricks: bubbles, stickers, crayons, a deck of cards", "Your phone with a parent-approved list of games", "A snack you brought yourself", "Notes on what the child loved and hated"],
    steps: ["Practice with a little cousin or sibling for an afternoon first", "Learn three games you can run without any props", "Ask parents you already know — church, school, sports parents", "Agree on duties before you start: what's play, what's cleanup, what's off-limits", "Give the parent a 30-second report at the end about what you did, ate, and learned"],
    script: "\"Hi, I'm [name] — I do mother's helping. I'll come play with [kid] for two hours while you work or rest, and I'll bring the games. I'm happy to start with a shorter visit so you can see how it goes.\"",
    safety: ["A parent or guardian must be home the entire time", "Never take a child outside or into a pool without permission", "Never change a diaper or give medicine — call the parent", "Get an emergency contact and always know where the parent is in the house"],
    upsell: "Add a tidy-up of the playroom at the end for $5, or a craft project for $5."
  },
  {
    id: "babysitting", emoji: "🧸", title: "Babysitting", cat: "animals", mode: "animals",
    ages: [13, 17], level: 3, startup: 25, demand: "high", seasons: "All year",
    price: "$12–18", payLow: 12, payHigh: 18, payUnit: "hour", time: "3 hrs",
    tagline: "The classic teen job. Highest pay per hour on this entire list.",
    why: ["One Friday night pays more than a week of odd jobs", "Parents book the same sitter over and over", "A first-aid certificate puts you above every other teen applicant"],
    gear: ["First-aid kit and a printed emergency contact sheet", "Activities in a bag: books, cards, puzzles", "A flashlight and a night-light", "Your own snacks and water bottle"],
    steps: ["Take a Red Cross babysitting and first-aid course (many are online or through school)", "Get certified in CPR if your family can arrange it", "Sit for a neighbor while a parent is home first, then a short evening out", "Print a family info sheet: allergies, bedtime, snacks allowed, comfort item, where the fuse box is", "Send a text update every couple of hours and never leave the child alone"],
    script: "\"Hi! I'm certified in first aid and I babysit in the evenings. I charge $14 an hour and I bring activities, plus I'll text you updates. Could I sit for you next Friday so you can see how it goes?\"",
    safety: ["Never have visitors over, and never post publicly that you're home alone with kids", "Never leave a child sleeping unattended while you're on your phone in another room", "No baths, no medicine, no driving with kids, ever", "If something scares you, call the parent or 911 — you will never be in trouble for asking for help"],
    upsell: "Offer a sibling rate (cheaper per kid), and get on the neighborhood sitter list."
  },
  {
    id: "homework-tutoring", emoji: "📚", title: "Homework Tutoring", cat: "animals", mode: "animals",
    ages: [11, 17], level: 2, startup: 5, demand: "high", seasons: "School year",
    price: "$12–20", payLow: 12, payHigh: 20, payUnit: "hour", time: "1 hr",
    tagline: "Sell the skill you already have: being two years ahead of a struggling kid.",
    why: ["You know exactly what's confusing because you learned it recently", "Parents pay a premium when grades go up (and they will tell other parents)", "You can tutor online for kids in other neighborhoods"],
    gear: ["Flashcards, a whiteboard, or a notebook", "Stickers and small rewards", "A simple progress sheet per student", "Apps like Khan Academy as a backup"],
    steps: ["Pick your strongest subject and one grade band you'll serve (e.g. 2nd–4th grade reading)", "Offer the first session free for one family — get a written quote or a review after", "Structure every session: 5 min warm-up, 20 min skill work, 15 min homework, 5 min game", "Keep a progress sheet and show the parent every two weeks", "Raise your rate once you have three regular students"],
    script: "\"Hi, I'm [name] and I tutor 2nd and 3rd grade reading and spelling. The first session is free, and I send you a progress note every couple of weeks. Could we try it Tuesday at 4?\"",
    safety: ["Meet in a shared space — kitchen table, library, or front porch, never a bedroom", "A parent should be home during the session", "Never promise grades or test scores", "Never tutor a child you're not comfortable with; hand back the money"],
    upsell: "Offer a 'test week' crash-course package, or a sibling group rate."
  },

  /* ---------------- DIGITAL & TECH ---------------- */
  {
    id: "graphic-design", emoji: "🎨", title: "Canva Graphic Design", cat: "digital", mode: "digital",
    ages: [11, 17], level: 2, startup: 0, demand: "high", seasons: "All year",
    price: "$15–50", payLow: 15, payHigh: 50, payUnit: "design", time: "1–2 hrs",
    tagline: "Every small business, birthday party, and lemonade stand needs a graphic.",
    why: ["Canva's free tier is enough to do professional-level work", "Birthday invitations and party flyers are constant demand", "You build a portfolio file that sells the next job for you"],
    gear: ["Free Canva account", "Phone or laptop", "A folder of past designs as your portfolio", "Google Drive for delivering files"],
    steps: ["Redesign three real invitations or flyers for free as your portfolio pieces", "Pick one niche: party invites, business logos, or social posts", "Post your work to a local Facebook group or the school parent chat", "Deliver three sizes every time: square, story, and printable PDF", "Offer one free revision, then charge for more — that's the professional line"],
    script: "\"Hi! I do Canva designs — invitations, logos, and social media posts. Here are three I made for free. A custom design is $25 and you get it in two sizes within 24 hours.\"",
    safety: ["Never use images you don't have the rights to sell", "Never share your account password or personal address with a client online", "Turn off location sharing on your portfolio posts", "Clients found online must be approved by a parent before any payment"],
    upsell: "Bundle a matching invitation + thank-you card set for $40."
  },
  {
    id: "video-editing", emoji: "🎬", title: "Video Editing for Creators", cat: "digital", mode: "digital",
    ages: [12, 17], level: 3, startup: 0, demand: "high", seasons: "All year",
    price: "$20–60", payLow: 20, payHigh: 60, payUnit: "video", time: "2–3 hrs",
    tagline: "Every local business, coach, and team has raw footage sitting unused in a camera roll.",
    why: ["CapCut and DaVinci Resolve are free and genuinely professional", "Most adult creators would rather pay than learn editing", "Turnaround speed is your real competitive edge"],
    gear: ["CapCut or DaVinci Resolve (free)", "A computer or tablet that can handle video", "Headphones", "A folder system for raw footage and exports"],
    steps: ["Edit three free sample reels from your own footage to prove you can hook viewers in 3 seconds", "Offer five short vertical cuts from one long video as a $35 package", "Find clients among realtor, restaurant, and sports-team accounts in your town", "Deliver in the platform's ratio: 9:16 for shorts and reels, 1:1 for posts", "Ask for a shoutout or a testimonial as payment for your first two clients"],
    script: "\"Hi! I edit short-form videos. Send me one long clip and I'll cut five vertical shorts with captions and music for $35. First one is a free sample so you can see the style.\"",
    safety: ["Never post a client's video before they approve it", "Don't use copyrighted music in work you get paid for", "Never share logins — have clients upload footage through a link", "Cap your hours per week; editing eats an entire weekend before you notice"],
    upsell: "Offer a monthly retainer: 12 shorts a month for $200."
  },
  {
    id: "ai-website", emoji: "🧑‍💻", title: "No-Code Website Building", cat: "digital", mode: "digital",
    ages: [13, 17], level: 3, startup: 0, demand: "medium", seasons: "All year",
    price: "$80–250", payLow: 80, payHigh: 250, payUnit: "site", time: "4–8 hrs",
    tagline: "The biggest single paycheck on this list. Local businesses still don't have a site.",
    why: ["One page with hours, photos, and a phone number is all most shops need", "You can build it in an afternoon with AI help and templates", "Charge a yearly 'updates' fee for recurring income"],
    gear: ["Carrd, Google Sites, or Framer (free tiers work)", "Google Business Profile access from the owner", "Photos of the business (ask them to send, or take your own)", "A simple invoice template"],
    steps: ["Find five local businesses with no website — try barbers, food trucks, cleaners, dog walkers", "Build a full demo site for one of them before you ask for money", "Pitch the demo: 'it's already made, want it live? $150 including the domain setup'", "Get the owner's real hours, phone, photos, and reviews in writing", "Charge $50 a year for updates after the first month of free changes"],
    script: "\"Hi! I noticed [business] doesn't have a website, so I built you a one-page site as a demo. It's ready to go live — $150 for the site, and I'll keep it updated for $50 a year. Want to take a look?\"",
    safety: ["Only pitch businesses with a parent's knowledge, and meet in the shop during open hours", "Never buy a domain or hosting with a client's card — have the owner pay directly", "Never collect payment through an unapproved app; use a parent's account or cash", "Keep the client's passwords private and never reuse your own"],
    upsell: "Add a Google Business Profile cleanup, plus $50/year maintenance."
  },
  {
    id: "data-entry", emoji: "📊", title: "Data Entry & Spreadsheet Help", cat: "digital", mode: "digital",
    ages: [11, 17], level: 1, startup: 0, demand: "medium", seasons: "All year",
    price: "$12–20", payLow: 12, payHigh: 20, payUnit: "hour", time: "1–3 hrs",
    tagline: "The easiest digital job to learn — and small business owners are drowning in it.",
    why: ["Google Sheets is free forever and you can learn it in a weekend", "Low pressure, flexible hours, and you can do it from a couch", "Businesses always have a messy list that needs typing up"],
    gear: ["Free Google account", "Sheet templates for invoices, inventory, and contact lists", "A short typing practice routine", "Headphones for focus"],
    steps: ["Learn three skills cold: sorting, formulas like =SUM, and formatting a clean table", "Build a sample 'customer list' sheet with fake data to show as a demo", "Offer to convert one messy paper list or notebook into a sheet for free", "Deliver every job with frozen header rows, sorted alphabetically, and phone numbers formatted the same", "Quote per job, not per hour, so fast workers earn more"],
    script: "\"Hi! I type up messy lists into clean Google Sheets — customers, inventory, or expenses. Send me one page and I'll do it free so you can see the format.\"",
    safety: ["Never upload a client's private customer data to random websites or AI tools", "Keep client files in a separate folder from your own stuff", "Sign out of shared devices, always", "No client list leaves a password-protected account that a parent set up"],
    upsell: "Add a monthly cleanup session where you tidy up their sheet for $25."
  },
  {
    id: "photo-organizing", emoji: "🖼️", title: "Photo Organizing & Digitizing", cat: "digital", mode: "digital",
    ages: [11, 17], level: 2, startup: 0, demand: "medium", seasons: "All year",
    price: "$15–25", payLow: 15, payHigh: 25, payUnit: "hour", time: "2 hrs",
    tagline: "Adults have 12,000 blurry photos and one favourite cousin who can fix it.",
    why: ["Nobody over 40 wants to sort their camera roll — you do it in an evening", "Digitizing an old album is emotionally valuable and pays accordingly", "It's calm indoor work you can do while watching TV"],
    gear: ["Phone + Google Photos or Apple Photos", "A photo scanner app", "Labelled folders and album templates", "An external drive or shared album for delivery"],
    steps: ["Start with your own family's camera roll and time how long it takes to sort 500 photos", "Build a naming system: Year-Month-Event so everything sorts itself", "Offer three services: dedupe, album building, and slide-show videos", "Do the first 100 photos free so the client sees the system", "Deliver a shared album plus a highlights reel of 30 favourites"],
    script: "\"I organize photo libraries — deleting duplicates, sorting by date, and building one 'greatest hits' album. It's $20 an hour and I'll do the first hundred photos free so you can see the difference.\"",
    safety: ["Never delete anything without a backup already made", "Work on a copy, never the only version of a family's photos", "Never share or post a client's personal photos", "Get explicit permission before uploading anything to the cloud"],
    upsell: "Add a printed photo book or a slideshow video for family events."
  },
  {
    id: "tech-coaching", emoji: "📱", title: "Tech Coaching for Seniors", cat: "digital", mode: "digital",
    ages: [12, 17], level: 2, startup: 0, demand: "high", seasons: "All year",
    price: "$15–25", payLow: 15, payHigh: 25, payUnit: "hour", time: "1 hr",
    tagline: "Patient, kind, and endlessly needed. You speak two languages: phones and grandmas.",
    why: ["Grandparents want to video call family and are afraid of breaking something", "You can teach from the same device every week and build real trust", "Referrals spread instantly through senior groups and churches"],
    gear: ["A one-page cheat sheet you create for each topic", "Their own phone or tablet", "Big-print printed steps", "A notebook to log what they learned"],
    steps: ["Pick four lessons: video calling, photos, texting, and passwords", "Write a one-page cheat sheet for each with big print and screenshots", "Teach one skill per session — never two", "Leave the cheat sheet behind so they can practice alone", "Check in a week later with a phone call to reinforce it, for free"],
    script: "\"Hi Mrs. [name]! I teach phone lessons — video calling, photos, and passwords. It's $20 an hour and I'll leave you written steps so you can practice. Would Tuesday work?\"",
    safety: ["Never memorize or write down someone else's passwords", "Never take someone's device home", "Never set up payments, banking, or purchases for another person", "Sessions happen at home with a parent nearby or at a library"],
    upsell: "Offer a 'setup package' where you configure the whole phone once for $35."
  },
  {
    id: "gaming-coaching", emoji: "🎮", title: "Gaming Coaching", cat: "digital", mode: "digital",
    ages: [10, 17], level: 2, startup: 0, demand: "medium", seasons: "All year",
    price: "$10–20", payLow: 10, payHigh: 20, payUnit: "hour", time: "1 hr",
    tagline: "You already know the game. Younger kids will pay to skip the frustration.",
    why: ["Parents love that their child is learning from a kid rather than a stranger", "Sessions are fun, low prep, and repeat weekly", "Roblox and Minecraft building lessons are in constant demand"],
    gear: ["Your own account and headset", "A parent-approved voice chat setup", "A written lesson plan per topic", "Recorded clips for feedback"],
    steps: ["Choose one game and get genuinely great at one skill inside it", "Write 4 lesson plans: basics, building, redstone or scripting, and safety", "Coach a friend's younger sibling for free first and get a parent quote", "Sessions run 45 minutes, with a parent within earshot the whole time", "Never coach for in-game currency — cash or chore-trade only, approved by both families"],
    script: "\"Hi! I coach Minecraft builds and Roblox basics for younger kids — 45 minutes, $12, and parents can sit in the whole time. First lesson is free.\"",
    safety: ["Keep the session in a private lobby, never an open public server", "Parents must know and approve who you're playing with", "Never accept friend requests or DMs from strangers met while coaching", "Never ask a client for in-game items or money", "Voice chat only if both families agree — otherwise coach through text or a shared screen"],
    upsell: "Offer a weekly 4-lesson package for $40 and a printed skill certificate."
  },

  /* ---------------- CRAFT & MAKING ---------------- */
  {
    id: "slime-making", emoji: "🫧", title: "Slime Making", cat: "craft", mode: "craft",
    ages: [9, 17], level: 1, startup: 20, mat: 2, demand: "high", seasons: "All year",
    price: "$4–7", payLow: 4, payHigh: 7, payUnit: "jar", time: "15 min per jar",
    tagline: "The lowest-risk product business there is: school kids buy it instantly.",
    why: ["Materials are cheap and you can batch 12 jars in one afternoon", "Friends and classmates are a built-in customer base", "Custom colours and themes let you charge more"],
    gear: ["Clear glue, baking soda, contact lens solution", "Food colouring, glitter, and scents", "Small jars with lids and labels", "Plastic tablecloth and gloves (this stuff gets everywhere)"],
    steps: ["Perfect one base recipe and time exactly how long a batch takes", "Make 12 jars and photograph them like a product catalogue", "Price by jarl size: small $4, large $7, deluxe with charms $9", "Sell at school events, the park, or a table at a neighbor's garage sale", "Print labels with your business name and a 'keep sealed' care note"],
    script: "\"Hi! I make custom slime — choose your colour and scent, $5 a jar. The deluxe ones with charms are $8. I have them with me right now if you want to check one out.\"",
    safety: ["Never sell slime to kids under 5 — it's a choking and eating risk", "Wear gloves and keep it away from eyes, hair, and carpet", "Label every jar with an ingredient list and 'do not eat'", "Get a parent's help with any chemical handling and clean-up"],
    upsell: "Offer bundle pricing: 3 jars for $12, or a party pack of 10 for $35."
  },
  {
    id: "jewelry-making", emoji: "📿", title: "Friendship Bracelets & Jewelry", cat: "craft", mode: "craft",
    ages: [9, 17], level: 1, startup: 15, mat: 1.5, demand: "high", seasons: "All year",
    price: "$3–12", payLow: 3, payHigh: 12, payUnit: "piece", time: "20 min",
    tagline: "Cheap to make, fast to sell, and personalization doubles the price.",
    why: ["Beads and cord cost pennies per bracelet", "Custom names and colours create instant repeat buyers", "Perfect for markets, school fairs, and gifts"],
    gear: ["Beads (seed, letter, and clay)", "Elastic cord and strong thread", "Jump rings, clasps, and a small pliers set", "A display board and a cash box"],
    steps: ["Make 20 pieces in three price tiers: simple, custom name, and charm deluxe", "Design a display board so the table looks like a real shop", "Photograph everything on a plain white background", "Take custom orders for names and colours with a 2-day pickup", "Track what sells — double down on your top three designs"],
    script: "\"Hi! I make custom bracelets — $5 for a name bracelet in your colours, $8 with a charm. I can have it ready by Friday if you tell me the letters.\"",
    safety: ["Small beads are a choking hazard — never sell to toddlers' families", "Use a bead mat so you don't lose pieces on the floor", "Keep cords away from pets and small siblings", "Use adult supervision for any wire or pliers work"],
    upsell: "Add a matching keychain or phone charm for $3 more."
  },
  {
    id: "dog-treats", emoji: "🦴", title: "Dog Treat Baking", cat: "craft", mode: "craft",
    ages: [10, 17], level: 2, startup: 15, mat: 3, demand: "medium", seasons: "All year",
    price: "$6–12", payLow: 6, payHigh: 12, payUnit: "bag", time: "1 hr per batch",
    tagline: "Dog owners buy gifts for their dogs more often than for themselves.",
    why: ["Simple, healthy recipes use peanut butter, oats, and pumpkin — cheap ingredients", "Every dog walker and pet owner you know is a potential customer", "Packaging small bags makes the product feel premium"],
    gear: ["Dog-safe recipe (no xylitol, no chocolate, no raisins, no onion)", "Cookie cutters in bone and paw shapes", "Paper bags, labels, and a food-safe sealer", "Cookie sheet and cooling rack"],
    steps: ["Bake one batch and test it on your own dog or a friend's, with the owner's permission", "Write the full ingredient list on every label — trust is the product", "Sell at $8 for a 6-ounce bag, with a 3-for-$20 bundle", "Sample one cracker at vet offices, dog parks (ask first), and grooming salons", "Deliver a 'dog birthday box' for parties at a premium price"],
    script: "\"Hi! I bake dog treats with oats and peanut butter — no preservatives, $8 a bag. Would your dog like a sample? I'll bring the ingredient list too.\"",
    safety: ["Never use xylitol (birch sugar), chocolate, raisins, grapes, or onions — these are toxic to dogs", "Always include the full ingredient list and a bake date", "An adult must run the oven", "Never sell anything that hasn't been tasted by a dog with the owner's okay"],
    upsell: "Sell a 'puppy pack': treats plus a hand-painted food bowl for $20."
  },
  {
    id: "baking", emoji: "🧁", title: "Baking: Cookies & Cupcakes", cat: "craft", mode: "craft",
    ages: [10, 17], level: 2, startup: 20, mat: 6, demand: "high", seasons: "All year",
    price: "$15–25", payLow: 15, payHigh: 25, payUnit: "dozen", time: "2 hrs",
    tagline: "The product everyone says yes to. Bake sales, parties, and holiday orders all pay.",
    why: ["Ingredients are cheap; the finished product sells for 4x the cost", "Holiday pre-orders can be planned weeks in advance", "Customers reorder for every party, forever"],
    gear: ["Cookie sheets, mixer, cooling racks, piping bags", "Cute packaging: boxes, bags, ribbon, labels", "An adult for the oven", "A printed price list with a flavour menu"],
    steps: ["Master three recipes only: a cookie, a cupcake, and a brownie", "Cost it out: ingredients per batch vs. what you charge — that's your profit lesson", "Sell by the dozen with a flavour list and 3 days' notice", "Take holiday pre-orders: Halloween, Thanksgiving, Christmas, Valentine's", "Deliver on time in clean packaging with a business card attached"],
    script: "\"Hi! I bake cookies and cupcakes for parties — $18 a dozen, and you choose the flavours. I can have them ready Saturday morning. Want a sample?\"",
    safety: ["An adult must handle the oven and the hot pans", "List allergens: nuts, dairy, eggs, gluten", "Never bake for strangers' events without a parent knowing", "Keep hair tied back and counters sanitized"],
    upsell: "Add custom icing colours or a personalized message for $3 more."
  },
  {
    id: "tie-dye", emoji: "🌈", title: "Tie-Dye & Custom Apparel", cat: "craft", mode: "craft",
    ages: [10, 17], level: 2, startup: 30, mat: 4, demand: "medium", seasons: "Spring–Summer",
    price: "$12–20", payLow: 12, payHigh: 20, payUnit: "item", time: "45 min per item",
    tagline: "Cheap blanks, huge markup, and every item is one of a kind.",
    why: ["Plain shirts cost $3–5 and sell for $15 once dyed", "Shirts, socks, totes, and scrunchies all use the same skills", "Summer camps and birthday parties pay extra for a 'dye party'"],
    gear: ["Tie-dye kit or Procion dyes", "100% cotton blanks (shirts, socks, tote bags)", "Rubber bands, gloves, and plastic bags", "Drop cloth and a dedicated bucket"],
    steps: ["Test three patterns until you can repeat them: swirl, spiral, and stripes", "Buy blanks in bulk to lower your cost per item", "Make 15 pieces and photograph each one flat and on a hanger", "Price by item: socks $8, shirt $18, tote $15", "Wash and seal each piece before selling so colours don't bleed"],
    script: "\"Hi! Hand-dyed shirts, one of a kind, $18 each — and I do custom orders in your team or school colours.\"",
    safety: ["Dye stains skin and clothes — wear gloves and old clothes", "Work outdoors or in a well-ventilated area", "Never dye in a kitchen where food is prepared; use a separate bucket", "Keep dyes away from pets and little siblings"],
    upsell: "Offer a birthday tie-dye party package: 8 shirts plus supplies for $100."
  },
  {
    id: "soap-making", emoji: "🧼", title: "Melt & Pour Soap Making", cat: "craft", mode: "craft",
    ages: [11, 17], level: 2, startup: 30, mat: 3, demand: "medium", seasons: "Holiday season",
    price: "$5–10", payLow: 5, payHigh: 10, payUnit: "bar", time: "45 min per batch",
    tagline: "A safe, kid-friendly way into soap — melt, pour, add scent, sell.",
    why: ["Melt-and-pour glycerin base needs no lye handling, so it's safe for kids", "Custom shapes and scents make strong holiday gifts", "Gift season triples demand in November and December"],
    gear: ["Glycerin soap base", "Microwave-safe pitcher or double boiler", "Silicone molds (animals, shapes, letters)", "Skin-safe fragrance and colourant, plus shrink wrap and labels"],
    steps: ["Melt, pour, and unmold three test batches to learn the timing", "Design 4 signature shapes: holiday, animal, flower, and letter", "Wrap each bar in shrink film with a label and ingredient list", "Sell gift sets of three for $20 at holiday markets and school events", "Keep a batch log so a favorite recipe can be repeated exactly"],
    script: "\"Hi! These are handmade glycerin soaps — $7 each or 3 for $18 in a gift box. They're great teacher gifts and stocking stuffers.\"",
    safety: ["An adult handles the microwave or stove — melted soap is hot enough to burn", "Use only skin-safe colourants and fragrances, never candle or craft dye", "Never add food products to soap without checking safety first", "Label ingredients for people with allergies"],
    upsell: "Add a soap with a toy inside or a custom colour for a teacher's gift set."
  },
  {
    id: "holiday-decorating", emoji: "🎄", title: "Holiday Decorating Help", cat: "craft", mode: "craft",
    ages: [10, 17], level: 2, startup: 0, demand: "high", seasons: "Nov–Jan, Oct",
    price: "$20–45", payLow: 20, payHigh: 45, payUnit: "hour", time: "2 hrs",
    tagline: "Two frantic weeks in December when adults will pay anything for a hand.",
    why: ["Everybody wants lights up and nobody wants to climb a ladder", "Taking decorations down pays as well as putting them up", "Halloween setup is a second season with the same skills"],
    gear: ["Gloves and warm layers", "Extension cords and clips (ask the owner to supply)", "A ladder used only by an adult", "A bucket for untangling and packing"],
    steps: ["Practice on your own house: lights, untangling, and storage packing", "Book 'take-down' jobs in early January — most kids forget this half", "Offer an hourly rate with a two-hour minimum", "Label every box and cord with tape so next year is 10x faster", "Keep a photo of each setup to show neighbors"],
    script: "\"Hi! I help put up and take down holiday decorations — lights, wreaths, and packing everything away, $25 an hour. I have January take-down slots open if you'd rather I do the cleanup.\"",
    safety: ["Never climb a ladder or a roof — an adult handles anything above arm's reach", "Check cords for frays and never plug in a damaged strand", "Electricity and wet ground don't mix — wait for dry weather", "Lift boxes with your legs and get help for anything heavy"],
    upsell: "Add a full storage-organization package after the holidays for $40."
  },

  /* ---------------- ORGANIZING ---------------- */
  {
    id: "garage-organizing", emoji: "🧰", title: "Garage & Closet Organizing", cat: "organize", mode: "organize",
    ages: [11, 17], level: 2, startup: 10, mat: 1, demand: "medium", seasons: "Spring & Fall",
    price: "$15–25", payLow: 15, payHigh: 25, payUnit: "hour", time: "3 hrs",
    tagline: "Adults have been meaning to do this for six years. You do it in one afternoon.",
    why: ["It's satisfying, visible work that clients brag about", "You can charge by the hour and take breaks as needed", "Referrals come fast because neighbors see the results across the street"],
    gear: ["Gloves, dust mask, and a broom", "Black trash bags + clear donation bags", "Label maker or masking tape and marker", "A clipboard for a 'keep / donate / trash' plan"],
    steps: ["Start with your own garage so you know your pace and your system", "Do a free 20-minute walkthrough with the client and agree on the three piles", "Sort first, organize second, sweep third — never mix the steps", "Label every bin by category. This is what makes it stay organized", "Take a before/after photo and ask for a written testimonial"],
    script: "\"Hi! I organize garages — sorting, sweeping, and labeling bins so you can actually park in there. It's $20 an hour and I bring the supplies. I have Saturday open for a free walkthrough.\"",
    safety: ["Never open unknown containers, chemicals, or anything that could be dangerous", "Wear gloves and a mask — garages are dusty", "Ask before throwing anything away, ever. Some 'junk' is sentimental", "Lift with your legs and use a wagon or dolly for anything heavy"],
    upsell: "Offer a seasonal 'come back and re-sort' visit for $40 every six months."
  },
  {
    id: "toy-decluttering", emoji: "🧸", title: "Toy Decluttering with Kids", cat: "organize", mode: "organize",
    ages: [9, 17], level: 1, startup: 5, demand: "medium", seasons: "All year",
    price: "$12–20", payLow: 12, payHigh: 20, payUnit: "hour", time: "2 hrs",
    tagline: "You're closer in age to the toys than the parent is, so kids actually listen to you.",
    why: ["Parents try and fail at this every year before the holidays", "You can make it a game, which no adult can pull off", "Donation runs give you a story and photos for marketing"],
    gear: ["Three labelled bins: KEEP, DONATE, TOSS", "Stickers and a timer for the game", "Wipes for cleaning toys as you sort", "A wagon for taking donations to the car"],
    steps: ["Practice with your own toys and time how long each bin takes", "Make a game: 10-minute rounds, one bin per round, sticker rewards", "Let the child make the final call on KEEP — that's why they trust you", "Clean every kept toy with a wipe as it goes back in the bin", "Have the parent handle the donation drop-off with you, and photograph the final shelf"],
    script: "\"Hi! I help kids clean out their toys before the holidays — we sort into keep, donate, and toss, and we make it a game. It's $15 an hour. Want me to come Saturday?\"",
    safety: ["The child having the toys always decides what stays", "Never handle broken glass or batteries — get an adult", "Ask before donating anything, and never take anything home without permission", "A parent must be home the entire time"],
    upsell: "Add a bin-labeling and shelf-setup service for $10 after sorting."
  },
  {
    id: "recycling-sorting", emoji: "♻️", title: "Can & Bottle Recycling", cat: "organize", mode: "organize",
    ages: [10, 17], level: 1, startup: 5, mat: 0.5, demand: "high", seasons: "All year",
    price: "$10–25", payLow: 10, payHigh: 25, payUnit: "load", time: "1–2 hrs",
    tagline: "Cash in hand the same day. The classic first money-making operation.",
    why: ["You get paid twice: once by the family, once by the recycling center", "Almost every house has a bag of cans sitting in the garage", "It teaches the real lesson that volume beats luck"],
    gear: ["Heavy-duty gloves", "Big bags or a wagon", "A tally sheet for counting", "A parent with a car for the drop-off"],
    steps: ["Ask five neighbors if you can collect their cans monthly — most say yes", "Set a route and a collection day so people can save them up for you", "Sort by state and type: many places pay 5–10 cents per can", "Photograph and count each load so you can track real earnings", "Offer to take other recyclables: cardboard, scrap metal, e-waste (with adult help)"],
    script: "\"Hi! I collect cans and bottles for recycling on the first Saturday of every month — can I add your house to my route? I'll pick them up and you never have to think about it.\"",
    safety: ["Gloves and shoes always — never bare hands in a recycling bin", "Never pick up needles, broken glass, or unknown containers. Tell an adult", "Never ride in the back of a truck or on top of a load", "Wash your hands well after handling anything from a bin"],
    upsell: "Offer a garage clean-out where you haul everything recyclable for a flat $20."
  },
  {
    id: "garage-sale", emoji: "🏷️", title: "Garage Sale Helper", cat: "organize", mode: "organize",
    ages: [10, 17], level: 2, startup: 5, demand: "medium", seasons: "Spring–Fall",
    price: "$12–20", payLow: 12, payHigh: 20, payUnit: "hour", time: "4 hrs",
    tagline: "One Saturday of work that pays like a whole week of odd jobs.",
    why: ["Sellers are overwhelmed on the morning of the sale and need help", "Pricing, organizing, and sign-holding are all easy jobs nobody wants", "You can often negotiate to keep the unsold items you like"],
    gear: ["Price sticker gun or roll of labels", "A cash box with change (small bills and coins)", "Big poster board and markers for signs", "A folding table setup plan"],
    steps: ["Ask a neighbor planning a sale if they want a helper the day before and the day of", "Price in the days before: research a few items on your phone so you're fair", "Set up by category: tools, kids' stuff, kitchen, clothes, electronics", "Greet every person, and offer a bundle deal to anyone buying three or more items", "Photograph the leftovers so the seller knows what to donate"],
    script: "\"Hi! I saw you're having a sale — I can help price everything the day before and run the table with you on Saturday. I'm $15 an hour and good with customers.\"",
    safety: ["Stay near the seller at all times and never handle cash alone", "Never be alone with a stranger during a sale", "Watch for cracked glass and sharp edges when unpacking", "Carry cash with a parent or keep it in a locked box"],
    upsell: "Offer a 'leftover haul' service where you bag everything for donation for $20."
  }
];

/* ============================================================
   Extras used by the plan builder, flyer, and safety pages.
   ============================================================ */

window.NAME_PARTS = {
  first: ["Sunny", "Busy", "Happy", "Tidy", "Speedy", "Shiny", "Green", "Neighbor", "Friendly", "Bright", "Lucky", "Hustle"],
  second: ["Side", "Street", "Yard", "Paw", "Pixel", "Sprout", "Bucket", "Scoop", "Brush", "Spark"],
  suffix: ["Co.", "Works", "Crew", "Club", "Studio", "Services", "HQ", "Brigade"]
};

window.SAFETY_RULES = [
  { icon: "🤝", title: "Parent first, always", text: "A grown-up knows who you're working for, where you're going, and when you'll be back. No exceptions, no exceptions for people you think you know." },
  { icon: "🚪", title: "Never enter alone", text: "If a job means going inside a home you've never been in, a parent comes with you the first time." },
  { icon: "📵", title: "Stay reachable", text: "Charge your phone, share your route, and text when you arrive and when you leave." },
  { icon: "💵", title: "Cash or a parent's app", text: "Get paid at the end of the job. Never venmo/cashapp with strangers unless a parent approves the account first." },
  { icon: "🚗", title: "Roads are not a workplace", text: "No working in the street, no ladders, no roofs, no riding in the back of trucks, ever." },
  { icon: "🩹", title: "Stop if you're hurt", text: "Numb fingers, a cut, a dizzy feeling, or a nervous gut means stop and call home. No job is worth an injury." },
  { icon: "🐕", title: "Respect the animal", text: "Meet every dog with its owner first. Never walk a dog you can't control. A strong leash grip saves lives." },
  { icon: "🔊", title: "Trust your gut", text: "If anyone makes you uncomfortable, leave the job and tell a parent. You are allowed to quit a job for any reason." }
];

window.PARENT_CHECKLIST = [
  "Meet the customer in person, at their home, before the first paid job",
  "Get the job scope and price in a text message so it's written down",
  "Confirm the address, the time window, and who else will be there",
  "Decide the payment method together before the work starts",
  "Save the customer's number in your phone as well as theirs",
  "Agree on a check-in time by text for jobs over 2 hours",
  "Confirm which equipment is theirs and which is yours",
  "Walk the route once with your child the first time, then spot-check",
  "Agree on where earnings go: spend, save, or give",
  "Set a maximum number of customers so schoolwork never slips"
];

window.MONEY_SPLIT = [
  { id: "save",  label: "Save",  defaultPct: 50, color: "#12b886", why: "Your future self wants a bike, a laptop, or a car." },
  { id: "spend", label: "Spend", defaultPct: 35, color: "#ff8a3d", why: "Reward the work. A business with no reward quits in a month." },
  { id: "give",  label: "Give",  defaultPct: 15, color: "#6c5ce7", why: "A donation to a local shelter or team buys trust and friends." }
];
