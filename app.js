(function () {
  "use strict";

  const state = {
    intent: "",
    currentStep: 1,
    latestAnalysis: null,
    latestBrief: [],
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const views = $$(".step-view");
  const progressItems = $$(".step-item");
  const intentCards = $$(".intent-card");
  const cleaningFields = $("#cleaning-fields");
  const tradeFields = $("#trade-fields");
  const frequencyField = $("#frequency-field");
  const notesField = $("#job-notes");
  const allowedOfficialLinks = new Set(Object.values(HousekeepLogic.OFFICIAL_LINKS));

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function showStep(number, focusHeading = true) {
    state.currentStep = number;
    views.forEach((view) => {
      const active = Number(view.dataset.step) === number;
      view.classList.toggle("is-visible", active);
      view.hidden = !active;
      if ("inert" in view) view.inert = !active;
    });
    progressItems.forEach((item) => {
      const step = Number(item.dataset.progress);
      item.classList.toggle("is-active", step === number);
      item.classList.toggle("is-complete", step < number);
      if (step === number) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
    document.querySelector(".finder-shell").scrollIntoView({ behavior: "smooth", block: "start" });
    if (focusHeading) {
      const heading = $(`.step-view[data-step="${number}"] [data-step-title]`);
      window.setTimeout(() => heading?.focus({ preventScroll: true }), 180);
    }
  }

  function readData() {
    const occupancy = $("#occupancy");
    return {
      intent: state.intent,
      notes: notesField.value,
      postcode: $("#postcode").value,
      timeframe: $("#timeframe").value,
      propertyType: $("#property-type").value,
      occupancy: occupancy.value,
      occupancyLabel: occupancy.selectedIndex > 0 ? occupancy.options[occupancy.selectedIndex].text : "",
      bedrooms: $("#bedrooms").value,
      bathrooms: $("#bathrooms").value,
      frequency: $("#frequency").value,
      tradeType: $("#trade-type").value,
      urgency: $("#urgency").value,
      extras: $$(".check-grid input:checked").map((box) => box.value),
    };
  }

  function draftAnalysis() {
    return HousekeepLogic.analyse({
      intent: state.intent,
      notes: notesField.value,
      frequency: $("#frequency").value,
      occupancy: $("#occupancy").value,
      tradeType: $("#trade-type").value,
    });
  }

  function clearCleaningFields() {
    ["#property-type", "#occupancy", "#bedrooms", "#bathrooms", "#frequency"].forEach((selector) => { $(selector).selectedIndex = 0; });
    $$(".check-grid input").forEach((box) => { box.checked = false; });
  }

  function clearTradeFields() {
    $("#trade-type").selectedIndex = 0;
    $("#urgency").selectedIndex = 0;
  }

  function configureFields(analysis, clearHidden = false) {
    const trades = analysis.service.key === "trades";
    cleaningFields.classList.toggle("is-hidden", trades);
    tradeFields.classList.toggle("is-hidden", !trades);
    frequencyField.classList.toggle("is-hidden", trades || analysis.service.key !== "regular");
    if (clearHidden) {
      if (trades) clearCleaningFields();
      else clearTradeFields();
    }
  }

  function updatePreview() {
    const notes = notesField.value.trim();
    $("#notes-count").textContent = `${notesField.value.length.toLocaleString("en-GB")} / 1,200`;
    const preview = $("#route-preview");
    if (!state.intent && !notes) {
      preview.hidden = true;
      return;
    }
    const analysis = draftAnalysis();
    $("#route-preview-icon").textContent = analysis.service.icon;
    $("#route-preview-name").textContent = analysis.service.name;
    $("#route-preview-reason").textContent = analysis.evidence[0] || analysis.service.short;
    preview.hidden = false;

    const validation = HousekeepLogic.validateInputs({ notes });
    const sensitiveError = validation.find((error) => error.field === "notes");
    $("#intent-error").textContent = sensitiveError ? sensitiveError.message : "";
    notesField.setAttribute("aria-invalid", String(Boolean(sensitiveError)));
  }

  function setIntent(intent) {
    state.intent = intent;
    intentCards.forEach((card) => card.setAttribute("aria-pressed", String(card.dataset.intent === intent)));
    $("#intent-error").textContent = "";
    updatePreview();
  }

  function showFieldError(field, errorElement, message) {
    field.setAttribute("aria-invalid", String(Boolean(message)));
    errorElement.textContent = message || "";
  }

  function validateStepOne() {
    const notes = notesField.value.trim();
    if (!state.intent && !notes) {
      showFieldError(notesField, $("#intent-error"), "Choose an option or describe the job to continue.");
      notesField.focus();
      return false;
    }
    const validation = HousekeepLogic.validateInputs({ notes });
    const error = validation.find((item) => item.field === "notes");
    if (error) {
      showFieldError(notesField, $("#intent-error"), error.message);
      notesField.focus();
      return false;
    }
    showFieldError(notesField, $("#intent-error"), "");
    if (!state.intent) setIntent("unsure");
    return true;
  }

  function validateDetails(data, analysis) {
    const errors = HousekeepLogic.validateInputs(data);
    const postcodeError = errors.find((item) => item.field === "postcode");
    showFieldError($("#postcode"), $("#postcode-error"), postcodeError?.message || "");
    if (postcodeError) return postcodeError.message;
    if (!data.postcode.trim()) return "Add a postcode or general area so the booking brief is useful.";
    if (!data.timeframe) return "Choose a preferred timeframe.";
    if (analysis.service.key === "trades" && !data.urgency) return "Choose the urgency of the repair or maintenance job.";
    if (analysis.service.key !== "trades" && !data.propertyType) return "Choose the property type.";
    return "";
  }

  function appendList(list, items) {
    list.replaceChildren(...items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    }));
  }

  function safeOfficialLink(value) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" && url.hostname === "housekeep.com" && allowedOfficialLinks.has(url.href)) return url.href;
    } catch (_) {
      // Fall through to the allowlisted homepage.
    }
    return HousekeepLogic.OFFICIAL_LINKS.home;
  }

  function renderAlternatives(alternatives) {
    const section = $("#alternatives-section");
    const list = $("#alternatives-list");
    list.replaceChildren();
    alternatives.forEach((alternative) => {
      const article = document.createElement("article");
      const icon = document.createElement("span");
      const content = document.createElement("div");
      const title = document.createElement("strong");
      const description = document.createElement("p");
      icon.textContent = alternative.icon;
      title.textContent = alternative.name;
      description.textContent = alternative.short;
      content.append(title, description);
      article.append(icon, content);
      list.append(article);
    });
    section.hidden = alternatives.length === 0;
  }

  function renderEmergency(emergency) {
    const alert = $("#emergency-alert");
    if (!emergency) {
      alert.hidden = true;
      alert.classList.remove("is-critical", "is-urgent");
      return;
    }
    $("#emergency-title").textContent = emergency.title;
    $("#emergency-message").textContent = emergency.message;
    alert.classList.toggle("is-critical", emergency.level === "critical");
    alert.classList.toggle("is-urgent", emergency.level === "urgent");
    alert.hidden = false;
  }

  function renderResult(data, analysis) {
    const service = analysis.service;
    const brief = HousekeepLogic.bookingBrief(analysis.cleaned, service);
    state.latestAnalysis = analysis;
    state.latestBrief = brief;

    $("#service-name").textContent = service.name;
    $("#result-title").textContent = service.name;
    $("#result-icon").textContent = service.icon;
    $("#service-reason").textContent = service.reason;
    $("#confidence-value").textContent = analysis.confidence;
    $("#official-link").href = safeOfficialLink(service.link);
    appendList($("#evidence-list"), analysis.evidence.length ? analysis.evidence : ["This is the strongest match from the information provided."]);
    renderAlternatives(analysis.alternatives);
    renderEmergency(analysis.emergency);

    const dl = $("#brief-list");
    dl.replaceChildren();
    brief.forEach(([label, value]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      dl.append(dt, dd);
    });
    appendList($("#scope-list"), service.scope);
    appendList($("#prep-list"), service.prep);
    $("#copy-status").textContent = "";
    showStep(3);
  }

  function buildCopyText() {
    const service = state.latestAnalysis.service;
    const lines = [
      "Housekeep booking brief — unofficial prototype",
      "",
      ...state.latestBrief.map(([label, value]) => `${label}: ${value}`),
      "",
      `Why this fits: ${service.reason}`,
      `Official next step: ${safeOfficialLink(service.link)}`,
      "",
      "Final coverage, price, timing and inclusions must be confirmed by Housekeep.",
    ];
    return lines.join("\n");
  }

  async function copyPlan() {
    const text = buildCopyText();
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        $("#copy-status").textContent = "Booking brief copied securely.";
        return;
      } catch (_) {
        // Use the explicit manual-copy dialog below.
      }
    }
    $("#copy-fallback-text").value = text;
    openDialog($("#copy-dialog"));
    $("#copy-fallback-text").focus();
    $("#copy-fallback-text").select();
  }

  function reset() {
    state.intent = "";
    state.latestAnalysis = null;
    state.latestBrief = [];
    document.querySelectorAll("input, textarea").forEach((field) => {
      if (field.type === "checkbox") field.checked = false;
      else field.value = "";
      field.removeAttribute("aria-invalid");
    });
    document.querySelectorAll("select").forEach((field) => { field.selectedIndex = 0; });
    intentCards.forEach((card) => card.setAttribute("aria-pressed", "false"));
    cleaningFields.classList.remove("is-hidden");
    tradeFields.classList.add("is-hidden");
    frequencyField.classList.add("is-hidden");
    $("#route-preview").hidden = true;
    $("#intent-error").textContent = "";
    $("#postcode-error").textContent = "";
    $("#details-error").textContent = "";
    $("#notes-count").textContent = "0 / 1,200";
    showStep(1);
  }

  intentCards.forEach((card, index) => {
    card.addEventListener("click", () => setIntent(card.dataset.intent));
    card.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
      event.preventDefault();
      const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
      const next = intentCards[(index + direction + intentCards.length) % intentCards.length];
      next.focus();
    });
  });

  notesField.addEventListener("input", updatePreview);
  $("#to-details").addEventListener("click", () => {
    if (!validateStepOne()) return;
    const analysis = draftAnalysis();
    configureFields(analysis, true);
    showStep(2);
  });
  $("#build-plan").addEventListener("click", () => {
    const data = readData();
    const analysis = HousekeepLogic.analyse(data);
    const error = validateDetails(data, analysis);
    $("#details-error").textContent = error;
    if (error) {
      const firstInvalid = document.querySelector('[aria-invalid="true"]') || $("#details-error");
      firstInvalid.focus?.();
      return;
    }
    renderResult(data, analysis);
  });
  $$('[data-back]').forEach((button) => button.addEventListener("click", () => showStep(Number(button.dataset.back))));
  $("#copy-plan").addEventListener("click", copyPlan);
  $("#start-over").addEventListener("click", reset);
  $("#compare-open").addEventListener("click", () => openDialog($("#compare-dialog")));
  $$('[data-dialog-close]').forEach((button) => button.addEventListener("click", () => closeDialog($(`#${button.dataset.dialogClose}`))));
  $("#select-copy-text").addEventListener("click", () => { $("#copy-fallback-text").focus(); $("#copy-fallback-text").select(); });
  [$("#compare-dialog"), $("#copy-dialog")].forEach((dialog) => dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  }));

  views.forEach((view) => { view.hidden = Number(view.dataset.step) !== 1; });
  updatePreview();
})();
