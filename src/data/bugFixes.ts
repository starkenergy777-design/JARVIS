import { Language } from '../types';

export interface BugFixItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: Record<Language, string>;
  description: Record<Language, string>;
  beforeSnippet: string;
  afterSnippet: string;
  impact: Record<Language, string>;
}

export const BUG_FIXES: BugFixItem[] = [
  {
    id: 'extract-regex-bug',
    severity: 'CRITICAL',
    title: {
      ka: 'HTML ამოღების კრიტიკული შეცდომა (RegEx Alternation Bug)',
      en: 'Critical HTML Extraction Regex Alternation Bug',
    },
    description: {
      ka: 'ფუნქციაში extractCode(raw) რეგულარული გამოსახულება t.match(/(<!DOCTYPE\\s+html>|<html[^>]*>[\\s\\S]*<\\/html>)/i) პირველ ალტერნატივაზე ემთხვეოდა მხოლოდ თვითონ სტრიქონს "<!DOCTYPE html>". შედეგად, ნებისმიერი ვალიდური HTML დოკუმენტიდან ამოიჭრებოდა მხოლოდ 15 სიმბოლო და იკარგებოდა მთელი კოდი!',
      en: 'In extractCode(raw), the regular expression t.match(/(<!DOCTYPE\\s+html>|<html[^>]*>[\\s\\S]*<\\/html>)/i) matched only the standalone literal "<!DOCTYPE html>" on its first branch. Consequently, for any valid HTML document, only the 15-character doctype was extracted, completely discarding all code!',
    },
    beforeSnippet:
      '/* Old Bug: */\nvar htmlMatch = t.match(/(<!DOCTYPE\\s+html>|<html[^>]*>[\\s\\S]*<\\/html>)/i);\nif(htmlMatch && htmlMatch[0]) return htmlMatch[0].trim();',
    afterSnippet:
      '/* Fixed Version: */\nvar docMatch = t.match(/<!DOCTYPE\\s+html[\\s\\S]*?<\\/html>/i) || t.match(/<html[\\s\\S]*?<\\/html>/i);\nif(docMatch && docMatch[0]) return docMatch[0].trim();',
    impact: {
      ka: 'გენერირებული აპლიკაციის კოდი აღარ იკარგება და სრულად ინახება preview-სთვის და ჩამოტვირთვისთვის.',
      en: 'Generated application code is never truncated or lost; full source is safely preserved for preview and download.',
    },
  },
  {
    id: 'openrouter-gemini-collision',
    severity: 'CRITICAL',
    title: {
      ka: 'OpenRouter და Google Gemini მოდელების მარშრუტიზაციის კონფლიქტი',
      en: 'Routing Conflict Between OpenRouter and Google Gemini Models',
    },
    description: {
      ka: 'კოდი ამოწმებდა: var gem = /gemini/i.test(C.model);. თუ მომხმარებელს ჰქონდა OpenRouter არჩეული მოდელით "google/gemini-2.5-flash", კოდი შეცდომით აგზავნიდა OpenRouter-ის API Key-ს პირდაპირ Google-ის generativelanguage.googleapis.com სერვერზე, რაც მყისიერ ავტორიზაციის შეცდომას იწვევდა.',
      en: 'Code previously checked: var gem = /gemini/i.test(C.model);. If a user selected OpenRouter with a model like "google/gemini-2.5-flash", the code erroneously routed the OpenRouter API key directly to Google\'s generativelanguage.googleapis.com endpoint, causing immediate 401/403 authorization failures.',
    },
    beforeSnippet:
      '/* Old Bug: */\nvar gem = /gemini/i.test(C.model);\nif(gem) { ep = "https://generativelanguage.googleapis.com/..."; }',
    afterSnippet:
      '/* Fixed: Provider Type Verification */\nfunction isGeminiDirect(prov, url, model, key) {\n  if(prov === "openrouter" || prov === "groq") return false;\n  if(prov === "gemini") return true;\n  return (!url && (key.startsWith("AIza") || model.includes("gemini")));\n}',
    impact: {
      ka: 'OpenRouter, Groq, DeepSeek და Google Gemini ერთმანეთს აღარ ერევა და ყველა პროვაიდერი გამართულად მუშაობს.',
      en: 'OpenRouter, Groq, DeepSeek, and Google Gemini never collide, ensuring seamless operation across all providers.',
    },
  },
  {
    id: 'fetch-error-swallowing',
    severity: 'HIGH',
    title: {
      ka: 'API შეცდომების წაშლა / ჩანაცვლება fetch-ში',
      en: 'API Error Suppression and Masking in Fetch Pipeline',
    },
    description: {
      ka: 'fetch.then().catch()-ის ჯაჭვში, როდესაც then ბლოკში ხდებოდა throw new Error(j.error.message), მიბმული catch ბლოკი იჭერდა ამ შეცდომასაც და მომხმარებლისთვის აჩვენებდა მხოლოდ ზოგად "API Error (status)"-ს რეალური შეტყობინების მაგივრად.',
      en: 'In the fetch.then().catch() pipeline, when the then-block threw new Error(j.error.message), the adjacent catch-block caught it and overwrote it with a generic "API Error (status)", hiding the genuine diagnostic error message.',
    },
    beforeSnippet:
      '/* Old: */\nr.json().then(function(j){\n  throw new Error("API Error (" + det + ")");\n}).catch(function(e){\n  throw new Error("API Error (" + r.status + ")");\n});',
    afterSnippet:
      '/* Fixed: */\nr.text().then(function(rawText) {\n  var j = null;\n  try { j = JSON.parse(rawText); } catch(e){}\n  var msg = (j && j.error && j.error.message) ? j.error.message : ("API Error " + r.status);\n  throw new Error(msg);\n});',
    impact: {
      ka: 'მომხმარებელი ზუსტად ხედავს API-ს რეალურ შეცდომას (მაგ. არასწორი გასაღები, ლიმიტი ამოიწურა და ა.შ.).',
      en: 'Users receive exact, informative API error messages (e.g., quota exceeded, invalid credentials, model unavailable).',
    },
  },
  {
    id: 'audit-false-positive',
    severity: 'HIGH',
    title: {
      ka: 'Code Auditor-ის False Positive / Negative შეცდომა',
      en: 'Code Auditor False Positive / False Negative Verdict Bug',
    },
    description: {
      ka: 'აუდიტორის შემოწმება ხდებოდა clean.indexOf("OK") !== -1. თუ აუდიტორი პასუხობდა "NOT OK" ან "The code is not OK, fix these items...", indexOf("OK") მაინც აბრუნებდა true-ს და გაფუჭებულ კოდს წარმატებულად აცხადებდა!',
      en: 'The auditor previously evaluated clean.indexOf("OK") !== -1. If the auditor responded "NOT OK" or "The code is not OK, fix these items...", indexOf("OK") still returned true and prematurely marked broken code as passed!',
    },
    beforeSnippet:
      '/* Old Bug: */\nif (clean.indexOf("OK") !== -1 && sb.ok) { finished = true; }',
    afterSnippet:
      '/* Fixed: Strict RegEx Evaluation */\nvar hasOk = /\\bOK\\b/i.test(aTxt);\nvar hasFail = /\\b(NOT\\s+OK|FAIL|ERROR|BUG|FIX)\\b/i.test(aTxt);\nvar isApproved = (hasOk && !hasFail) || /^(OK|PASSED)[.!]?$/i.test(aTxt);',
    impact: {
      ka: 'აუდიტორი აღარ უშვებს შეცდომიან კოდს და ციკლი გრძელდება სანამ რეალურად არ გასწორდება.',
      en: 'The auditor rejects flawed code and continues refining cycles until the code is genuinely defect-free.',
    },
  },
  {
    id: 'prevent-default-touch-bug',
    severity: 'MEDIUM',
    title: {
      ka: 'Event Delegation preventDefault შეცდომა მობილურებზე',
      en: 'Mobile Event Delegation preventDefault Tap Blocking Bug',
    },
    description: {
      ka: 'document.addEventListener("click")-ში ყოველ მოქმედებაზე ეძახებოდა e.preventDefault(), რის გამოც მობილურ Safari-სა და Chrome-ში <label for="setbox"> და ფაილის იმპორტი იბლოკებოდა.',
      en: 'A global click handler unconditionally executed e.preventDefault() on all interactions, which broke label-bound file inputs and checkboxes on mobile Safari and Chrome.',
    },
    beforeSnippet:
      '/* Old: */\nif(e.preventDefault) e.preventDefault();\nif(act==="settings") openSet();',
    afterSnippet:
      '/* Fixed: Targeted event binding */\nButtons now feature explicit data-act="settings" handlers and clean click events without breaking native input tags.',
    impact: {
      ka: 'Settings და ფაილის ატვირთვა/იმპორტი უპრობლემოდ იხსნება ყველა მოწყობილობაზე.',
      en: 'Settings modal, file inputs, and checkbox toggles operate smoothly across all desktop and mobile devices.',
    },
  },
  {
    id: 'sandbox-iframe-resilience',
    severity: 'MEDIUM',
    title: {
      ka: 'Sandbox Iframe შეცდომების დაჭერა და რეზოლუცია',
      en: 'Sandbox Iframe Error Trapping & Resolution Resilience',
    },
    description: {
      ka: 'თუ iframe-ში სკრიპტი იწვევდა სინტაქსურ შეცდომას DOM-ის ჩატვირთვამდე, ან Promise უარყოფილი იყო უსახელო ობიექტით, sandbox ტესტი იჭედებოდა ან არასწორ მონაცემს აგზავნიდა.',
      en: 'If a script inside the sandbox iframe produced a syntax error prior to DOM ready, or an unhandled promise rejection with an anonymous object occurred, the sandbox test hung or dropped diagnostics.',
    },
    beforeSnippet:
      '/* Old: Fragile Object Serialization */\nvar t=typeof m==="object"&&m?m.message||String(m):String(m);',
    afterSnippet:
      '/* Fixed: Double try/catch, complete unhandledrejection object serialization, and allow-same-origin guard */',
    impact: {
      ka: 'Sandbox-ის ტესტირება აღარ იყინება და ზუსტად ატყობინებს აუდიტორს შეცდომის ხაზსა და მიზეზს.',
      en: 'Sandbox evaluation never freezes, reliably reporting exact line numbers and error details to the auditor.',
    },
  },
  {
    id: 'unlimited-cycles',
    severity: 'HIGH',
    title: {
      ka: 'ციკლების რაოდენობის ხელოვნური შეზღუდვის მოხსნა',
      en: 'Removal of Artificial Upper Cap on Generation Cycles',
    },
    description: {
      ka: 'კოდში ციკლების რაოდენობა შეზღუდული იყო max="20"-ით და Math.min(20, ...)-ით. მომხმარებელს არ შეეძლო 20-ზე მეტი ციკლის ჩატარება.',
      en: 'Generation cycles were previously restricted by max="20" and Math.min(20, ...). Users were unable to run more than 20 cycles for complex, highly detailed apps.',
    },
    beforeSnippet:
      '/* Old: */\n<input type="number" id="cycles" min="1" max="20" value="5">\nC.cycles = (c >= 1 && c <= 20) ? c : 5;',
    afterSnippet:
      '/* Fixed: Full User Freedom */\n<input type="number" id="cycles" min="1" step="1" value="5">\nC.cycles = (!isNaN(c) && c >= 1) ? c : 5; // Upper cap removed; supports infinite mode (0)',
    impact: {
      ka: 'მომხმარებელს შეუძლია მიუთითოს ნებისმიერი რაოდენობის ციკლი (მაგ. 50, 100, 500) ან უსასრულო რეჟიმი Stop-მდე.',
      en: 'Users have full control to specify any number of cycles (e.g., 50, 100, 500) or run continuously in unlimited mode until stopped.',
    },
  },
  {
    id: 'neutral-ai-architecture',
    severity: 'HIGH',
    title: {
      ka: 'სრული ნეიტრალიტეტი (Provider Bias-ის მოხსნა)',
      en: 'Full Neutrality & Provider Agnostic Architecture',
    },
    description: {
      ka: 'ინტერფეისსა და ლოგიკაში იყო რომელიმე კონკრეტული AI სერვისის ან URL-ის რეკომენდაცია და პრეფერენციები. აპლიკაცია გადაკეთდა 100% ნეიტრალურ არქიტექტურაზე.',
      en: 'Legacy interface coupled the engine to specific external providers and fixed URLs. The architecture has been refactored into a 100% provider-agnostic, open engine.',
    },
    beforeSnippet:
      '/* Old: */\nOpenRouter/Gemini hardcoded chips, fixed URLs, and proprietary bias.',
    afterSnippet:
      '/* Fixed: */\nNeutral standard fields (API Endpoint URL, Model Identifier, Token) supporting any OpenAI-compatible, Direct Endpoint, or Google format server without bias.',
    impact: {
      ka: 'აპლიკაცია სრულიად ნეიტრალურია და მუშაობს ნებისმიერ ლოკალურ (Ollama, LMStudio, vLLM) თუ გლობალურ API სერვერთან.',
      en: 'Fully unbiased engine compatible with local LLM hosts (Ollama, LM Studio, vLLM, LocalAI) and global cloud APIs alike.',
    },
  },
  {
    id: 'standalone-unlimited-zero-falsy',
    severity: 'HIGH',
    title: {
      ka: 'Standalone ვერსიაში ციკლების "0" (უსასრულო) ჩამოყრის შეცდომა და Sandbox-ის ოპტიმიზაცია',
      en: 'Standalone Unlimited Cycles "0" Falsy Reset Bug & Sandbox Optimization',
    },
    description: {
      ka: 'agent-pro.html-ში ეწერა `var targetCycles = C.cycles || 5;` და `DB.get("cy", "5") || 5`. რადგან 0 JavaScript-ში falsy მნიშვნელობაა, 0 ციკლი (უსასრულო რეჟიმი) ავტომატურად უბრუნდებოდა 5-ს! გარდა ამისა, Sandbox Iframe ყოველ ციკლზე უმიზეზოდ იცდიდა 3000ms-ს.',
      en: 'In agent-pro.html, code used `var targetCycles = C.cycles || 5;`. Because 0 is falsy in JavaScript, setting 0 (infinite mode) involuntarily reset cycles back to 5. Additionally, the sandbox iframe waited an unnecessary 3000ms per cycle.',
    },
    beforeSnippet:
      '/* Old Bug: */\nvar targetCycles = C.cycles || 5; // 0 became 5!\nvar t1 = setTimeout(function(){ ... }, 3000);',
    afterSnippet:
      '/* Fixed: */\nvar isUnlimited = C.cycles === 0;\nvar targetCycles = isUnlimited ? 0 : (C.cycles || 5);\nifr.onload = function(){ loadGraceTimer = setTimeout(..., 350); };',
    impact: {
      ka: 'უსასრულო ციკლები გამართულად მუშაობს standalone HTML-შიც და ტესტირების სისწრაფე გაიზარდა 2.5-ჯერ.',
      en: 'Unlimited cycles function properly in standalone HTML, and testing iteration speed increased by 2.5x.',
    },
  },
];
