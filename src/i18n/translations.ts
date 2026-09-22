export type Language = 'ka' | 'en';

export interface TranslationDictionary {
  header: {
    production: string;
    versionTag: string;
    subtitle: string;
    terminal: string;
    preview: string;
    code: string;
    copy: string;
    copied: string;
    download: string;
    clear: string;
    fixesList: string;
    fixesListTooltip: string;
    standaloneTooltip: string;
    autoSave: string;
    autoSaveTooltip: string;
    restoreBackup: string;
    restoreBackupTooltip: string;
    settings: string;
    langToggle: string;
    langTooltip: string;
  };
  promptBar: {
    statusReady: string;
    cycle: string;
    unlimited: string;
    ideasLabel: string;
    sampleIdeas: string[];
    placeholder: string;
    start: string;
    pause: string;
    resume: string;
    stop: string;
  };
  console: {
    stdoutLabel: string;
    copyLogs: string;
    copied: string;
    emptyPlaceholder: string;
  };
  preview: {
    desktopTip: string;
    tabletTip: string;
    mobileTip: string;
    refreshTip: string;
    newTab: string;
    newTabTip: string;
    noCode: string;
  };
  codeView: {
    lines: string;
    copy: string;
    copied: string;
    download: string;
    noCode: string;
  };
  settings: {
    title: string;
    subtitle: string;
    language: string;
    langKa: string;
    langEn: string;
    requiresUrl: string;
    noUrlNeeded: string;
    urlAutomatic: string;
    apiKeyLabel: string;
    recognized: string;
    apiKeyPlaceholder: string;
    apiKeyHint: string;
    modelLabel: string;
    modelPlaceholder: string;
    protocolFormatLabel: string;
    quickSelect: string;
    endpointUrlLabel: string;
    optionalForProvider: string;
    endpointUrlPlaceholderAuto: string;
    endpointUrlPlaceholderCustom: string;
    endpointUrlEmptyNote: string;
    cycleCountLabel: string;
    unlimitedToggle: string;
    unlimitedActive: string;
    cycleCountPlaceholder: string;
    cycleCountHint: string;
    fileNameLabel: string;
    customRulesLabel: string;
    customRulesPlaceholder: string;
    advancedHeadersLabel: string;
    collapse: string;
    expand: string;
    customHeadersHint: string;
    autoSaveSlotLabel: string;
    lastAutoSave: string;
    autoSaveSlotHint: string;
    backupNow: string;
    restore: string;
    testing: string;
    testApi: string;
    saveAndClose: string;
    exportSettings: string;
    importSettings: string;
    importSuccess: string;
    importFail: string;
  };
  fixes: {
    title: string;
    subtitle: string;
    summary: string;
    downloadStandalone: string;
    beforeLabel: string;
    afterLabel: string;
    impactLabel: string;
    close: string;
  };
  banners: {
    autosaveDetected: string;
    codeSize: string;
    ideaSnippet: string;
    restoreAction: string;
    dismissAction: string;
    completedTitle: string;
    previewAction: string;
    copyCodeAction: string;
    downloadAction: string;
    shareTitle: string;
    sharedSuccess: string;
  };
  logs: {
    ready: string;
    generatingCode: string;
    sandboxTesting: string;
    codeAudit: string;
    appReady: string;
    cyclesDone: string;
    paused: string;
    resumed: string;
    stopped: string;
    processStarted: string;
    requestingAi: string;
    emptyCodeRetry: string;
    codeGenerated: string;
    sandboxRunning: string;
    runtimeErrorFound: string;
    runtimeClean: string;
    auditorChecking: string;
    auditPassed: string;
    auditIssues: string;
    cyclesExhausted: string;
    processStoppedByUser: string;
    codeCopiedToClipboard: string;
    fileDownloaded: string;
    logsCleared: string;
    backupCreated: string;
    dataRestored: string;
    enterIdeaPrompt: string;
    enterUrlPrompt: string;
    enterModelPrompt: string;
    backupEmpty: string;
    unlimitedCycles: string;
    maxCycles: string;
    providerLabel: string;
    automaticUrlLabel: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  ka: {
    header: {
      production: "Lasha Kvitsiani's Production",
      versionTag: "Agent Pro v136.1 Fixed",
      subtitle: "ავტონომიური ერთფაილიანი HTML აპლიკაციების გენერატორი & კოდის აუდიტორი",
      terminal: "Terminal",
      preview: "Preview",
      code: "Code",
      copy: "Copy",
      copied: "Copied",
      download: "Download",
      clear: "Clear",
      fixesList: "შეცდომების სია",
      fixesListTooltip: "გასწორებული შეცდომების სრული სია და აუდიტის ანგარიში",
      standaloneTooltip: "Standalone ოფლაინ ფაილის ჩამოტვირთვა (agent-pro.html)",
      autoSave: "Auto-Save",
      autoSaveTooltip: "Auto-Save slot: იდეისა და კოდის ავტომატური სარეზერვო შენახვა ყოველ 60 წამში. დააჭირეთ მყისიერი შენახვისთვის.",
      restoreBackup: "ასლის აღდგენა",
      restoreBackupTooltip: "ავტო-შენახული სარეზერვო ასლის აღდგენა",
      settings: "Settings",
      langToggle: "KA",
      langTooltip: "ენის გადართვა (Switch Language to English)",
    },
    promptBar: {
      statusReady: "მზადაა მუშაობისთვის",
      cycle: "ციკლი",
      unlimited: "შეუზღუდავი",
      ideasLabel: "იდეები:",
      sampleIdeas: [
        'კალკულატორი ნეომორფიზმის სტილში და ისტორიით',
        'ტასკ მენეჯერი (Todo List) კატეგორიებით და LocalStorage-ით',
        'ინტერაქტიული ამინდის და დროის ვიჯეტი ანიმაციებით',
        'Markdown რედაქტორი რეალურ დროში და HTML ექსპორტით',
        'პომოდორო ტაიმერი ხმოვანი სიგნალებით და სტატისტიკით',
      ],
      placeholder: "აღწერეთ აპლიკაციის იდეა… (Enter — Start, Shift+Enter — ახალი ხაზი)",
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
    },
    console: {
      stdoutLabel: "agent-stdout.log",
      copyLogs: "Copy Logs",
      copied: "Copied",
      emptyPlaceholder: 'დააჭირეთ "Start" აპლიკაციის გენერირების დასაწყებად…',
    },
    preview: {
      desktopTip: "სრული / დესკტოპ ხედი",
      tabletTip: "ტაბლეტის ხედი (768px)",
      mobileTip: "მობილურის ხედი (375px)",
      refreshTip: "გადატვირთვა",
      newTab: "New Tab",
      newTabTip: "გახსნა ახალ ფანჯარაში",
      noCode: "კოდი ჯერ არ არის გენერირებული",
    },
    codeView: {
      lines: "ხაზი",
      copy: "Copy",
      copied: "Copied",
      download: "Download",
      noCode: "კოდი ჯერ არ არის გენერირებული",
    },
    settings: {
      title: "პარამეტრები (Settings)",
      subtitle: "Lasha Kvitsiani's Production — ჭკვიანი ავტო-დეტექცია & მრავალმოდელური მხარდაჭერა",
      language: "ენა (Language):",
      langKa: "ქართული (Georgian)",
      langEn: "English (ინგლისური)",
      requiresUrl: "საჭიროებს URL-ს",
      noUrlNeeded: "⚡ URL არ არის საჭირო — ავტომატური კავშირი",
      urlAutomatic: "URL ავტომატურია",
      apiKeyLabel: "API Key / Token:",
      recognized: "ამოცნობილია:",
      apiKeyPlaceholder: "შეიყვანეთ API Key (მაგ. Google Gemini AIzaSy..., OpenAI sk-..., Groq gsk_...)",
      apiKeyHint: "Gemini-ს ან მხარდაჭერილი AI-ის API Key-ს შეყვანისას URL-ის მითითება აღარ არის საჭირო.",
      modelLabel: "მოდელის სახელი (Model):",
      modelPlaceholder: "gemini-2.5-flash ან gpt-4o",
      protocolFormatLabel: "პროტოკოლის ფორმატი:",
      quickSelect: "სწრაფი არჩევა:",
      endpointUrlLabel: "API Endpoint URL:",
      optionalForProvider: "არჩევითი (ავტომატურია {name}-სთვის)",
      endpointUrlPlaceholderAuto: "ავტომატურია ({defaultUrl}) — დატოვეთ ცარიელი",
      endpointUrlPlaceholderCustom: "https://api.example.com/v1 (ან დატოვეთ ცარიელი Gemini-სთვის)",
      endpointUrlEmptyNote: "✓ URL ცარიელია. გამოყენებული იქნება:",
      cycleCountLabel: "ციკლების რაოდენობა:",
      unlimitedToggle: "უსასრულო",
      unlimitedActive: "შეუზღუდავი ციკლები (Stop-მდე)",
      cycleCountPlaceholder: "ციკლების რიცხვი (შეუზღუდავი)",
      cycleCountHint: "შეზღუდვა არ არის: შეგიძლიათ ჩაწეროთ ნებისმიერი რიცხვი (მაგ. 5, 20, 50, 100).",
      fileNameLabel: "ფაილის სახელი:",
      customRulesLabel: "დამატებითი წესები და ინსტრუქციები (Custom Rules):",
      customRulesPlaceholder: "მაგ: Tailwind CDN, მუქი თემა, responsive UI, ანიმაციები, ქართული ენა…",
      advancedHeadersLabel: "⚙️ დამატებითი (Custom Headers JSON):",
      collapse: "აკეცვა ▲",
      expand: "გაშლა ▼",
      customHeadersHint: "სურვილისამებრ: მიუთითეთ დამატებითი HTTP ჰედერები JSON ფორმატში.",
      autoSaveSlotLabel: "Auto-Save სარეზერვო სლოტი (60 წმ)",
      lastAutoSave: "ბოლო ავტო-შენახვა: ",
      autoSaveSlotHint: "ინახება ყოველ 60 წამში crash-ისგან დასაცავად",
      backupNow: "Backup Now",
      restore: "Restore",
      testing: "⏳ მოწმდება…",
      testApi: "🔌 Test API Connection",
      saveAndClose: "💾 Save & Close",
      exportSettings: "Export Settings",
      importSettings: "Import Settings",
      importSuccess: "✅ პარამეტრები წარმატებით იმპორტირებულია!",
      importFail: "❌ ფაილის წაკითხვა ვერ მოხერხდა.",
    },
    fixes: {
      title: "გასწორებული შეცდომების დეტალური ანგარიში (v136.1)",
      subtitle: "Lasha Kvitsiani's Production — კოდის აუდიტი და ყველა დაფიქსირებული ხარვეზი",
      summary: "სულ გასწორდა {count} კრიტიკული და მაღალი რისკის შეცდომა.",
      downloadStandalone: "Standalone agent-pro.html-ის ჩამოტვირთვა",
      beforeLabel: "შეცდომა (Before):",
      afterLabel: "გასწორებული (After):",
      impactLabel: "შედეგი:",
      close: "დახურვა",
    },
    banners: {
      autosaveDetected: "🛡️ აღმოჩენილია ავტო-შენახული სარეზერვო ასლი (შენახვის დრო: {time})",
      codeSize: "კოდი: {size}",
      ideaSnippet: 'იდეა: "{idea}"',
      restoreAction: "აღდგენა (Restore)",
      dismissAction: "გაუქმება",
      completedTitle: "✅ აპლიკაცია წარმატებით დამზადდა! შეგიძლიათ ნახოთ Preview-ში ან ჩამოტვირთოთ:",
      previewAction: "Preview ნახვა",
      copyCodeAction: "კოდის კოპირება",
      downloadAction: "ჩამოტვირთვა",
      shareTitle: "გაზიარება",
      sharedSuccess: "კოდი დაკოპირებულია clipboard-ში!",
    },
    logs: {
      ready: "მზადაა მუშაობისთვის",
      generatingCode: "კოდის გენერირება ({cycle}/{max})…",
      sandboxTesting: "Sandbox ტესტირება…",
      codeAudit: "კოდის აუდიტი…",
      appReady: "✅ აპი მზადაა! 🎉",
      cyclesDone: "ციკლები დასრულდა",
      paused: "Paused ⏸️",
      resumed: "Resumed ▶️",
      stopped: "Stopped ⏹️",
      processStarted: "პროცესი დაიწყო ({cycles}){provider}",
      requestingAi: "[Cycle {cycle}] AI-სგან კოდის მოთხოვნა…",
      emptyCodeRetry: "[Cycle {cycle}] ⚠️ ცარიელი/არასრული კოდი — თავიდან ცდა…",
      codeGenerated: "[Cycle {cycle}] ✓ კოდი გენერირებულია ({size})",
      sandboxRunning: "[Cycle {cycle}] Sandbox გარემოში გაშვება და შეცდომების შემოწმება…",
      runtimeErrorFound: "[Sandbox] ⚠️ ნაპოვნია runtime შეცდომა: {msg}",
      runtimeClean: "[Sandbox] ✓ JavaScript-ის runtime შეცდომები არ დაფიქსირდა",
      auditorChecking: "[Cycle {cycle}] აუდიტორის შემოწმება…",
      auditPassed: "[Audit] ✅ სრულყოფილია — აპლიკაცია წარმატებით დამზადდა {cycle} ციკლში!",
      auditIssues: "[Audit] 🔧 გასასწორებელი დეტალები:\n{feedback}",
      cyclesExhausted: "მითითებული ციკლები ამოიწურა. კოდი ხელმისაწვდომია Preview-სა და ჩამოტვირთვაში.",
      processStoppedByUser: "პროცესი შეჩერებულია მომხმარებლის მიერ ⏹️",
      codeCopiedToClipboard: "📋 კოდი დაკოპირდა clipboard-ში!",
      fileDownloaded: "📥 ფაილი ჩამოიტვირთა: {file}",
      logsCleared: "ლოგები გასუფთავებულია.",
      backupCreated: "💾 სარეზერვო ასლი (Auto-Save Slot) შეიქმნა: {time}",
      dataRestored: "🔄 მონაცემები წარმატებით აღდგა ავტო-შენახული სარეზერვო ასლიდან {time}!",
      enterIdeaPrompt: "გთხოვთ შეიყვანოთ აპლიკაციის იდეა!",
      enterUrlPrompt: "გთხოვთ მიუთითოთ API Endpoint URL ან შეიყვანოთ მხარდაჭერილი AI-ის API Key (მაგ. Gemini-სთვის URL ავტომატურია და არ მოითხოვება)!",
      enterModelPrompt: "გთხოვთ მიუთითოთ მოდელის სახელი (Model Identifier) პარამეტრებში!",
      backupEmpty: "სარეზერვო ასლი ცარიელია.",
      unlimitedCycles: "შეუზღუდავი ციკლები",
      maxCycles: "მაქს. {count} ციკლი",
      providerLabel: "პროვაიდერი",
      automaticUrlLabel: "ავტომატური URL",
    },
  },
  en: {
    header: {
      production: "Lasha Kvitsiani's Production",
      versionTag: "Agent Pro v136.1 Fixed",
      subtitle: "Autonomous Single-File HTML App Generator & Code Auditor",
      terminal: "Terminal",
      preview: "Preview",
      code: "Code",
      copy: "Copy",
      copied: "Copied",
      download: "Download",
      clear: "Clear",
      fixesList: "Bug Fixes",
      fixesListTooltip: "View Complete Bug Fixes List & Code Audit Report",
      standaloneTooltip: "Download Standalone Offline Tool (agent-pro.html)",
      autoSave: "Auto-Save",
      autoSaveTooltip: "Auto-Save slot: Automatic backup of idea & code every 60 seconds. Click for instant backup.",
      restoreBackup: "Restore Backup",
      restoreBackupTooltip: "Restore auto-saved backup copy",
      settings: "Settings",
      langToggle: "EN",
      langTooltip: "Switch Language to Georgian (ქართულზე გადართვა)",
    },
    promptBar: {
      statusReady: "Ready to work",
      cycle: "Cycle",
      unlimited: "Unlimited",
      ideasLabel: "Ideas:",
      sampleIdeas: [
        'Neumorphic calculator with computation history',
        'Todo task manager with categories & LocalStorage',
        'Interactive weather and clock widget with animations',
        'Real-time Markdown editor with live preview & HTML export',
        'Pomodoro timer with audio alerts & productivity stats',
      ],
      placeholder: "Describe your app idea… (Enter — Start, Shift+Enter — new line)",
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
    },
    console: {
      stdoutLabel: "agent-stdout.log",
      copyLogs: "Copy Logs",
      copied: "Copied",
      emptyPlaceholder: 'Click "Start" to begin generating application…',
    },
    preview: {
      desktopTip: "Full / Desktop View",
      tabletTip: "Tablet View (768px)",
      mobileTip: "Mobile View (375px)",
      refreshTip: "Refresh Preview",
      newTab: "New Tab",
      newTabTip: "Open in New Tab",
      noCode: "No code generated yet",
    },
    codeView: {
      lines: "lines",
      copy: "Copy",
      copied: "Copied",
      download: "Download",
      noCode: "No code generated yet",
    },
    settings: {
      title: "Settings",
      subtitle: "Lasha Kvitsiani's Production — Smart Auto-Detection & Multi-Model Support",
      language: "Language / ენა:",
      langKa: "ქართული (Georgian)",
      langEn: "English (English)",
      requiresUrl: "Requires URL",
      noUrlNeeded: "⚡ No URL required — automatic connection",
      urlAutomatic: "URL is automatic",
      apiKeyLabel: "API Key / Token:",
      recognized: "Recognized:",
      apiKeyPlaceholder: "Enter API Key (e.g. Google Gemini AIzaSy..., OpenAI sk-..., Groq gsk_...)",
      apiKeyHint: "When entering an API Key for Gemini or supported AI, providing URL is no longer required.",
      modelLabel: "Model Identifier (Model):",
      modelPlaceholder: "gemini-2.5-flash or gpt-4o",
      protocolFormatLabel: "Protocol Format:",
      quickSelect: "Quick select:",
      endpointUrlLabel: "API Endpoint URL:",
      optionalForProvider: "Optional (automatic for {name})",
      endpointUrlPlaceholderAuto: "Automatic ({defaultUrl}) — leave blank",
      endpointUrlPlaceholderCustom: "https://api.example.com/v1 (or leave blank for Gemini)",
      endpointUrlEmptyNote: "✓ URL is blank. Will use:",
      cycleCountLabel: "Cycle Count:",
      unlimitedToggle: "Unlimited",
      unlimitedActive: "Unlimited cycles (until Stop)",
      cycleCountPlaceholder: "Number of cycles (unlimited)",
      cycleCountHint: "No upper limit: enter any number (e.g. 5, 20, 50, 100).",
      fileNameLabel: "File Name:",
      customRulesLabel: "Custom Rules & Instructions:",
      customRulesPlaceholder: "e.g., Tailwind CDN, dark mode, responsive UI, animations, English language…",
      advancedHeadersLabel: "⚙️ Advanced (Custom Headers JSON):",
      collapse: "Collapse ▲",
      expand: "Expand ▼",
      customHeadersHint: "Optional: specify additional HTTP headers in JSON format.",
      autoSaveSlotLabel: "Auto-Save Backup Slot (60s)",
      lastAutoSave: "Last auto-save: ",
      autoSaveSlotHint: "Saved every 60 seconds to protect against crashes",
      backupNow: "Backup Now",
      restore: "Restore",
      testing: "⏳ Testing…",
      testApi: "🔌 Test API Connection",
      saveAndClose: "💾 Save & Close",
      exportSettings: "Export Settings",
      importSettings: "Import Settings",
      importSuccess: "✅ Settings successfully imported!",
      importFail: "❌ Failed to read settings file.",
    },
    fixes: {
      title: "Detailed Bug Fixes Report (v136.1)",
      subtitle: "Lasha Kvitsiani's Production — Code audit and all resolved issues",
      summary: "Resolved {count} critical & high-risk issues in total.",
      downloadStandalone: "Download Standalone agent-pro.html",
      beforeLabel: "Issue (Before):",
      afterLabel: "Fixed (After):",
      impactLabel: "Impact:",
      close: "Close",
    },
    banners: {
      autosaveDetected: "🛡️ Auto-saved backup detected (Saved: {time})",
      codeSize: "code: {size}",
      ideaSnippet: 'idea: "{idea}"',
      restoreAction: "Restore",
      dismissAction: "Dismiss",
      completedTitle: "✅ Application successfully built! View in Preview or download:",
      previewAction: "View Preview",
      copyCodeAction: "Copy Code",
      downloadAction: "Download",
      shareTitle: "Share",
      sharedSuccess: "Code copied to clipboard!",
    },
    logs: {
      ready: "Ready to work",
      generatingCode: "Generating code ({cycle}/{max})…",
      sandboxTesting: "Sandbox testing…",
      codeAudit: "Code audit…",
      appReady: "✅ App is ready! 🎉",
      cyclesDone: "Cycles completed",
      paused: "Paused ⏸️",
      resumed: "Resumed ▶️",
      stopped: "Stopped ⏹️",
      processStarted: "Process started ({cycles}){provider}",
      requestingAi: "[Cycle {cycle}] Requesting code from AI…",
      emptyCodeRetry: "[Cycle {cycle}] ⚠️ Empty/invalid code block — retrying…",
      codeGenerated: "[Cycle {cycle}] ✓ Code generated ({size})",
      sandboxRunning: "[Cycle {cycle}] Running in sandbox & checking for errors…",
      runtimeErrorFound: "[Sandbox] ⚠️ Runtime error detected: {msg}",
      runtimeClean: "[Sandbox] ✓ No JavaScript runtime errors found",
      auditorChecking: "[Cycle {cycle}] Auditor evaluating application…",
      auditPassed: "[Audit] ✅ Passed — App successfully crafted in {cycle} cycles!",
      auditIssues: "[Audit] 🔧 Issues to fix:\n{feedback}",
      cyclesExhausted: "Allocated cycles completed. Code is available in Preview and for download.",
      processStoppedByUser: "Process stopped by user ⏹️",
      codeCopiedToClipboard: "📋 Code copied to clipboard!",
      fileDownloaded: "📥 File downloaded: {file}",
      logsCleared: "Logs cleared.",
      backupCreated: "💾 Backup (Auto-Save Slot) saved: {time}",
      dataRestored: "🔄 Data restored from auto-saved backup {time}!",
      enterIdeaPrompt: "Please enter an application idea!",
      enterUrlPrompt: "Please specify an API Endpoint URL or provide an API Key for supported AI (e.g. Gemini has automatic URL)!",
      enterModelPrompt: "Please specify the Model Identifier in settings!",
      backupEmpty: "Backup copy is empty.",
      unlimitedCycles: "Unlimited cycles",
      maxCycles: "Max {count} cycles",
      providerLabel: "Provider",
      automaticUrlLabel: "Automatic URL",
    },
  },
};
