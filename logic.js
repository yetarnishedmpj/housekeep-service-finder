(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HousekeepLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const OFFICIAL_LINKS = Object.freeze({
    home: "https://housekeep.com/",
    regular: "https://housekeep.com/signup/quote",
    specialist: "https://housekeep.com/one-off-cleaning/booking/form",
    trades: "https://housekeep.com/tradespeople/quote/form",
  });

  const SERVICES = Object.freeze({
    regular: {
      name: "Regular home cleaning",
      short: "Ongoing upkeep on a repeat schedule",
      icon: "R",
      link: OFFICIAL_LINKS.regular,
      reason: "This is the closest fit for ongoing upkeep in an occupied home, with a repeat schedule managed through Housekeep.",
      scope: ["Routine cleaning of rooms, surfaces and floors", "Daily, weekly or fortnightly scheduling", "Optional tasks can be requested with the clean"],
      prep: ["Confirm the current price and local coverage in the official quote flow", "List priority rooms, surfaces and any delicate materials", "Check which products and equipment you should provide"],
    },
    oneOff: {
      name: "One-off standard cleaning",
      short: "A single routine home clean",
      icon: "O",
      link: OFFICIAL_LINKS.specialist,
      reason: "This matches a single routine clean when the property does not need specialist deep-cleaning work.",
      scope: ["A single standard home clean", "Requested routine tasks and selected extras", "A quote based on the property and work required"],
      prep: ["Confirm the final task list in the official quote flow", "Check product and equipment requirements", "Flag delicate surfaces or access restrictions"],
    },
    deep: {
      name: "Deep cleaning",
      short: "Intensive work in a lived-in home",
      icon: "D",
      link: OFFICIAL_LINKS.specialist,
      reason: "A deep clean is designed for a lived-in home that needs intensive work, including accumulated grime or limescale.",
      scope: ["More intensive cleaning than a standard visit", "Oven and inside-window cleaning are listed as standard by Housekeep", "Housekeep says specialist teams bring products and equipment"],
      prep: ["Allow for a longer appointment; Housekeep gives 3–5 hours as a typical guide", "Identify the heaviest areas of grime or limescale", "Confirm the scope, timing and payment on the official site"],
    },
    endTenancy: {
      name: "End-of-tenancy cleaning",
      short: "A thorough clean for an empty moving property",
      icon: "E",
      link: OFFICIAL_LINKS.specialist,
      reason: "This is Housekeep's closest match for a completely empty property before new occupants move in or after tenants move out.",
      scope: ["The most thorough moving-home option described by Housekeep", "Inside cupboards, appliances and windows", "Standard cleaning tasks across the empty property"],
      prep: ["Remove personal belongings and leave the property empty", "Share checkout or inventory requirements", "Housekeep gives 3–5 hours as a typical guide; confirm timing and payment officially"],
    },
    afterBuilders: {
      name: "After-builders cleaning",
      short: "Cleaning after renovation or building work",
      icon: "B",
      link: OFFICIAL_LINKS.specialist,
      reason: "This specialist service is intended for dust and residue left after renovation, decorating or building work.",
      scope: ["Removal of post-work dust and residue", "Detailed cleaning of affected rooms and surfaces", "A specialist quote based on the work completed"],
      prep: ["Make sure building work is finished before the clean", "List the rooms and surfaces affected", "Mention paint, plaster, adhesive or other specific residue"],
    },
    carpet: {
      name: "Carpet and rug cleaning",
      short: "Specialist treatment for carpets and rugs",
      icon: "C",
      link: OFFICIAL_LINKS.specialist,
      reason: "The main need is carpet or rug treatment, which is better matched to a specialist service than a general home clean.",
      scope: ["Specialist cleaning for carpets and rugs", "Treatment planned around the material and stains", "A quote based on size, condition and access"],
      prep: ["Note approximate dimensions", "Describe each stain and how long it has been present", "Check the care label or material if known"],
    },
    upholstery: {
      name: "Upholstery cleaning",
      short: "Specialist treatment for furniture fabric",
      icon: "U",
      link: OFFICIAL_LINKS.specialist,
      reason: "The job centres on furniture fabric, so specialist upholstery cleaning is the closest public-site match.",
      scope: ["Specialist cleaning for upholstered furniture", "Treatment based on material and stain type", "A quote based on the number and size of items"],
      prep: ["Count the items and seats needing treatment", "Describe stains and fabric where possible", "Check care labels before the appointment"],
    },
    trades: {
      name: "Housekeep tradesperson",
      short: "Repair, installation or maintenance work",
      icon: "T",
      link: OFFICIAL_LINKS.trades,
      reason: "The request is a repair, installation or maintenance task rather than a cleaning service.",
      scope: ["A tradesperson matched to the job category", "A quote based on the issue and work required", "Scheduling confirmed through Housekeep"],
      prep: ["Describe the fault, location and urgency clearly", "Take photographs or measurements if the official flow requests them", "Use the emergency guidance shown here if there is immediate danger"],
    },
  });

  const INTENT_SERVICE = Object.freeze({
    regular: "regular",
    oneOff: "oneOff",
    deep: "deep",
    moving: "endTenancy",
    builders: "afterBuilders",
    fabric: "carpet",
    trades: "trades",
  });

  function cleanText(value, maxLength = 1200) {
    return String(value || "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim()
      .slice(0, maxLength);
  }

  function normalise(value) {
    return cleanText(value).toLocaleLowerCase("en-GB");
  }

  function includesAny(text, words) {
    return words.some((word) => text.includes(word));
  }

  function inferTrade(text) {
    const rules = [
      ["Plumber", ["leak", "leaking", "tap", "toilet", "pipe", "plumb", "water pressure", "burst pipe"]],
      ["Gas & heating engineer", ["boiler", "radiator", "heating", "gas"]],
      ["Electrician", ["electric", "socket", "light fitting", "wiring", "fuse", "sparking"]],
      ["Locksmith", ["lock", "lost key", "locked out", "door won't open"]],
      ["Drainage specialist", ["drain", "blocked sink", "sewer", "backing up"]],
      ["Appliance engineer", ["washing machine", "dishwasher", "appliance", "fridge broken", "tumble dryer"]],
      ["Gardener", ["garden", "hedge", "lawn", "tree", "weeds"]],
      ["Painter & decorator", ["paint", "wallpaper", "decorate"]],
      ["Carpenter", ["carpenter", "woodwork", "cabinet", "shelf", "door frame"]],
      ["Removals", ["removal", "move furniture", "moving van"]],
      ["Waste removal", ["rubbish", "waste", "clearance"]],
      ["Builder", ["builder", "brick", "structural", "masonry"]],
      ["Handyman", ["repair", "mount", "assemble", "install", "handyman"]],
    ];
    for (const [trade, words] of rules) if (includesAny(text, words)) return trade;
    return "A suitable tradesperson";
  }

  function detectEmergency(value) {
    const text = normalise(value);
    if (includesAny(text, ["smell gas", "gas smell", "carbon monoxide", "co alarm", "gas leak"])) {
      return {
        level: "critical",
        title: "Possible gas emergency",
        message: "Leave the property and call the National Gas Emergency Service on 0800 111 999. Call 999 if anyone is in immediate danger.",
      };
    }
    if (includesAny(text, ["electrical fire", "sparks", "sparking", "smoke from socket", "live wire", "burning socket"])) {
      return {
        level: "critical",
        title: "Possible electrical emergency",
        message: "Do not touch exposed wiring or use affected equipment. Switch off power only if it is safe. Call 999 for fire or immediate danger.",
      };
    }
    if (includesAny(text, ["burst pipe", "active flooding", "water pouring", "flooding now", "ceiling leaking badly"])) {
      return {
        level: "urgent",
        title: "Active water damage",
        message: "Turn off the water supply only if it is safe and contact an emergency plumber. Call 999 if the flooding creates immediate danger.",
      };
    }
    return null;
  }

  function containsPaymentData(value) {
    const text = String(value || "");
    const possibleCard = text.match(/(?:\d[ -]*?){13,19}/g) || [];
    return possibleCard.some((match) => {
      const digits = match.replace(/\D/g, "");
      return digits.length >= 13 && digits.length <= 19;
    }) || /\b(cvv|cvc|security code)\b/i.test(text);
  }

  function validateInputs(data) {
    const errors = [];
    const notes = String(data.notes || "");
    const postcode = String(data.postcode || "");
    if (notes.length > 1200) errors.push({ field: "notes", message: "Keep the job description under 1,200 characters." });
    if (postcode.length > 80) errors.push({ field: "postcode", message: "Keep the postcode or area under 80 characters." });
    if (postcode && !/^[\p{L}\p{N}\s'.,-]+$/u.test(postcode)) errors.push({ field: "postcode", message: "Use letters, numbers, spaces and normal punctuation for the area." });
    if (containsPaymentData(`${notes} ${postcode}`)) errors.push({ field: "notes", message: "Remove payment-card or security-code details. Enter them only on Housekeep's official payment page." });
    return errors;
  }

  function analyse(data) {
    const cleaned = {
      ...data,
      notes: cleanText(data.notes, 1200),
      postcode: cleanText(data.postcode, 80),
    };
    const text = normalise(`${cleaned.notes} ${cleaned.intent || ""}`);
    const scores = Object.fromEntries(Object.keys(SERVICES).map((key) => [key, 0]));
    const evidence = Object.fromEntries(Object.keys(SERVICES).map((key) => [key, []]));
    const add = (key, points, reason) => {
      scores[key] += points;
      if (reason && !evidence[key].includes(reason)) evidence[key].push(reason);
    };

    const explicit = INTENT_SERVICE[cleaned.intent];
    if (explicit) add(explicit, 5, "You selected this type of work.");
    if (cleaned.tradeType) add("trades", 10, `You selected ${cleaned.tradeType}.`);

    if (cleaned.occupancy === "heavy") add("deep", 8, "You described an occupied property with heavy grime or limescale.");
    if (cleaned.occupancy === "emptyMove") add("endTenancy", 9, "You said the property is empty for a move.");
    if (cleaned.occupancy === "buildingDust") add("afterBuilders", 9, "You reported renovation or building dust.");

    const frequency = normalise(cleaned.frequency);
    if (includesAny(frequency, ["daily", "weekly", "fortnightly"])) add("regular", 8, `You requested a ${frequency} schedule.`);
    if (frequency === "one time only") add("oneOff", 3, "You requested a single visit.");

    const keywordRules = [
      ["trades", 9, ["leak", "repair", "broken", "install", "plumber", "electric", "boiler", "locksmith", "radiator", "socket", "burst pipe", "flooding", "gas smell", "smell gas", "sparking", "live wire"], "The description contains repair or maintenance work."],
      ["afterBuilders", 10, ["after builders", "after builder", "renovation", "building dust", "plaster dust", "construction dust", "post-construction"], "The description mentions recent building or renovation work."],
      ["endTenancy", 10, ["end of tenancy", "moving out", "move out", "moving in", "empty property", "get deposit", "checkout clean"], "The description is tied to a move or empty property."],
      ["upholstery", 10, ["sofa", "armchair", "upholstery", "mattress", "dining chair fabric"], "The main items are upholstered furniture."],
      ["carpet", 9, ["carpet", "rug", "runner", "fabric stain"], "The description focuses on carpets or rugs."],
      ["deep", 9, ["deep clean", "limescale", "heavy grime", "grease build-up", "very dirty", "intensive clean", "descale"], "The description indicates intensive cleaning rather than routine upkeep."],
      ["regular", 8, ["regular cleaner", "weekly clean", "fortnightly clean", "ongoing clean", "every week", "every two weeks"], "The description asks for recurring cleaning."],
      ["oneOff", 5, ["one-off", "one off", "single clean", "one time clean", "tidy before guests"], "The description asks for one standard visit."],
    ];
    for (const [key, points, words, reason] of keywordRules) if (includesAny(text, words)) add(key, points, reason);

    if (cleaned.intent === "fabric") add(includesAny(text, ["sofa", "armchair", "upholstery", "mattress"]) ? "upholstery" : "carpet", 4, "You selected carpet or upholstery cleaning.");

    let ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (ranked[0][1] === 0) {
      add("oneOff", 2, "No specialist signal was found, so a standard one-off clean is the safest starting point.");
      ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    }

    const [topKey, topScore] = ranked[0];
    const secondScore = ranked[1][1];
    const difference = topScore - secondScore;
    let confidence = 64;
    if (topScore >= 14 && difference >= 5) confidence = 95;
    else if (topScore >= 10 && difference >= 3) confidence = 89;
    else if (topScore >= 7 && difference >= 2) confidence = 82;
    else if (topScore >= 5) confidence = 74;

    const service = { ...SERVICES[topKey], key: topKey };
    if (topKey === "trades") {
      const trade = cleanText(cleaned.tradeType, 80) || inferTrade(text);
      service.name = trade === "A suitable tradesperson" ? "Housekeep tradesperson" : trade;
      service.reason = `${trade} is the closest match because the request is a repair, installation or maintenance job rather than cleaning.`;
    }

    const alternatives = ranked
      .slice(1)
      .filter(([, score]) => score > 0)
      .slice(0, 2)
      .map(([key, score]) => ({ key, score, ...SERVICES[key] }));

    return {
      service,
      confidence,
      evidence: evidence[topKey].slice(0, 3),
      alternatives,
      emergency: detectEmergency(cleaned.notes),
      scores,
      cleaned,
    };
  }

  function recommend(data) {
    const analysis = analyse(data);
    return {
      ...analysis.service,
      confidence: analysis.confidence,
      evidence: analysis.evidence,
      alternatives: analysis.alternatives,
      emergency: analysis.emergency,
    };
  }

  function bookingBrief(data, service) {
    const rows = [];
    const push = (label, value) => { if (value) rows.push([label, cleanText(value, 1200)]); };
    push("Area", data.postcode);
    push("Property", [data.propertyType, data.bedrooms && `${data.bedrooms} bedroom${data.bedrooms === "1" ? "" : "s"}`, data.bathrooms && `${data.bathrooms} bathroom${data.bathrooms === "1" ? "" : "s"}`].filter(Boolean).join(", "));
    push("Condition", data.occupancyLabel);
    push("Timing", data.timeframe);
    push("Frequency", data.frequency);
    push("Trade", data.tradeType);
    push("Urgency", data.urgency);
    push("Extras", data.extras && data.extras.join(", "));
    push("Job description", data.notes);
    push("Recommended route", service.name);
    return rows;
  }

  return Object.freeze({
    OFFICIAL_LINKS,
    services: SERVICES,
    analyse,
    recommend,
    bookingBrief,
    inferTrade,
    detectEmergency,
    containsPaymentData,
    validateInputs,
    cleanText,
  });
});
