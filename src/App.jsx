import { Component, createContext, useContext, useEffect, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, matchPath, useNavigate, useSearchParams } from "react-router-dom";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, set, update, keys, delMany } from "idb-keyval";
import { getSession, sessionKey, request, loginUser, registerUser } from "./services/api";
import journeyPhoto from "./assets/hero.png";
import activePhoto from "./assets/photos/active.webp";
import breastfeedingPhoto from "./assets/photos/breastfeeding.webp";
import consultationPhoto from "./assets/photos/consultation.webp";
import healthWorkerPhoto from "./assets/photos/health-worker.webp";
import journalPhoto from "./assets/photos/journal.webp";
import latePregnancyPhoto from "./assets/photos/late-pregnancy.webp";
import nutritionPhoto from "./assets/photos/nutrition.webp";
import obstetricianPhoto from "./assets/photos/obstetrician.webp";
import partnerPhoto from "./assets/photos/partner.webp";
import waitingRoomPhoto from "./assets/photos/waiting-room.webp";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field";
import { Input, InputGroup } from "@ui-sdk/react/input";
import { Textarea } from "@ui-sdk/react/textarea";
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectTrigger, SelectValue } from "@ui-sdk/react/select";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { Progress, ProgressIndicator, ProgressTrack } from "@ui-sdk/react/progress";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@ui-sdk/react/menu";
import { Avatar, AvatarFallback } from "@ui-sdk/react/avatar";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@ui-sdk/react/accordion";
import { OverlayHost } from "@ui-sdk/react/overlays";
import { Toast, ToastClose, ToastDescription, ToastTitle, toast } from "@ui-sdk/react/toast";
import { confirm } from "@ui-sdk/react/alert-dialog";
import "@fontsource-variable/inter";
import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "@ui-sdk/core/web.css";
import "./index.css";
import "./App.css";

const destinations = [
  { path: "/", label: "Home", icon: "house", title: "My Journey" },
  { path: "/appointments", label: "Visits", icon: "calendar-days", title: "Appointments", eyebrow: "Care plan", image: obstetricianPhoto, imageAlt: "A pregnant woman talking with her doctor during a check-up", description: "Schedule clinic visits and keep every upcoming appointment in one place." },
  { path: "/diary", label: "Diary", icon: "pen-to-square", title: "My Diary", eyebrow: "Personal notes", image: journalPhoto, imageAlt: "A woman writing in her notebook at home", description: "Write down how you feel and the questions you want to ask at your next visit." },
  { path: "/learn", label: "Learn", icon: "book-open-reader", title: "Learning library", eyebrow: "Reviewed lessons", image: consultationPhoto, imageAlt: "A pregnant woman learning from a clinician", description: "Short lessons on pregnancy, birth and newborn care, approved by our content reviewers." },
  { path: "/facilities", label: "Care", icon: "hospital", title: "Where to get care", eyebrow: "Facility directory", image: healthWorkerPhoto, imageAlt: "A smiling health worker in a hospital corridor", description: "Contacts for health facilities and what to do when you need urgent help." },
];
const secondaryPages = [
  { path: "/account", title: "Account & privacy", eyebrow: "Settings", description: "Control how your records are stored, export your data or close your account." },
  { path: "/review", title: "Content review", eyebrow: "Reviewer tools", description: "Edit drafts and publish approved versions of lessons and the facility directory." },
];

const stages = {
  FIRST_TRIMESTER: "First trimester", SECOND_TRIMESTER: "Second trimester",
  THIRD_TRIMESTER: "Third trimester", POSTPARTUM: "Postpartum",
};
const stageItems = Object.entries(stages).map(([value, label]) => ({ value, label }));
const account = createContext(null);
const stamp = (value) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const longDate = (value) => new Date(value).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
const shortTime = (value) => new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const cacheKey = (user, path) => `materna:v1:${user}:${path}`;
const granted = (choices, type) => Boolean(choices?.some(c => c.type === type && c.granted));
const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("") || "M";
const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

function Icon({ name, className = "" }) {
  return <i className={`fa-solid fa-${name} ${className}`} aria-hidden="true" />;
}

export function NavigationDock() {
  return (
    <nav className="dock" aria-label="Main navigation">
      {destinations.map(({ path, label, icon }) => (
        <NavLink key={path} to={path} end className="dock-link">
          <Icon name={icon} /><span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

async function clearAccountCache(userId, includePending) {
  const prefix = cacheKey(userId, "");
  const owned = (await keys()).filter(key => typeof key === "string" && key.startsWith(prefix));
  await delMany(includePending ? owned : owned.filter(key => !key.startsWith(prefix + "pending") && !key.startsWith(prefix + "/lessons") && !key.startsWith(prefix + "/support")));
}

function useResource(path, { offline = false, optional = false } = {}) {
  const { userId } = useContext(account);
  return useQuery({
    queryKey: [userId, path], enabled: Boolean(path), networkMode: "always",
    queryFn: async ({ signal }) => {
      const key = cacheKey(userId, path);
      try {
        const data = await request(path, { signal });
        if (offline) {
          const approvedContent = path.startsWith("/lessons") || path === "/support";
          const allowed = approvedContent || path === "/consents" ||
            granted(await get(cacheKey(userId, "/consents")).catch(() => []), "DATA_STORAGE");
          if (allowed) await set(key, data).catch(() => {});
        }
        return data;
      } catch (error) {
        if (optional && error.status === 404) {
          if (offline) await set(key, null).catch(() => {});
          return null;
        }
        if (offline && error instanceof TypeError && !signal.aborted) {
          const stored = await get(key);
          if (stored !== undefined) return stored;
        }
        throw error;
      }
    },
  });
}

function useChange(action, paths = [], errorTitle = "Something went wrong") {
  const { userId } = useContext(account);
  const client = useQueryClient();
  return useMutation({
    mutationFn: action, networkMode: "always", meta: { errorTitle },
    onSuccess: () => Promise.all(paths.map(path => client.invalidateQueries({ queryKey: [userId, path] }))),
  });
}

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const changed = () => setOnline(navigator.onLine);
    window.addEventListener("online", changed); window.addEventListener("offline", changed);
    return () => { window.removeEventListener("online", changed); window.removeEventListener("offline", changed); };
  }, []);
  return online;
}

function Feedback({ task }) {
  if (!task.isError) return null;
  return <p className="alert alert-error" role="alert"><Icon name="circle-exclamation" />{task.error.message}</p>;
}

function Skeleton({ lines = 3 }) {
  return (
    <div className="skeleton" role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => <span key={i} />)}
    </div>
  );
}

function Result({ query, children, lines }) {
  if (query.isError) {
    return (
      <div className="error-state">
        <Feedback task={query} />
        <Button className="btn btn-secondary" onClick={() => query.refetch()}><Icon name="rotate-right" />Try again</Button>
      </div>
    );
  }
  if (query.isPending) return <Skeleton lines={lines} />;
  return children(query.data);
}

function EmptyState({ icon, title, children }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} /></span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function ConsentNotice({ children }) {
  return (
    <div className="alert alert-info">
      <Icon name="shield-halved" />
      <span>{children} <Link to="/account">Manage privacy settings</Link></span>
    </div>
  );
}

function Paragraphs({ text }) {
  const lines = String(text || "").split(/\n/).map(line => line.trim()).filter(Boolean);
  const blocks = [];
  for (const line of lines) {
    if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.type === "list") last.items.push(line.slice(2));
      else blocks.push({ type: "list", items: [line.slice(2)] });
    } else blocks.push({ type: line.startsWith("## ") ? "heading" : /^sample content/i.test(line) ? "note" : "text", text: line.replace(/^## /, "") });
  }
  return blocks.map((block, i) => {
    if (block.type === "list") return <ul key={i} className="prose-list">{block.items.map(item => <li key={item}><Icon name="check" />{item}</li>)}</ul>;
    if (block.type === "heading") return <h2 key={i}>{block.text}</h2>;
    if (block.type === "note") return <p key={i} className="content-note"><Icon name="circle-info" />{block.text}</p>;
    return <p key={i}>{block.text}</p>;
  });
}

function Guides({ items, defaultOpen }) {
  return (
    <Accordion className="guides" defaultValue={defaultOpen ? [defaultOpen] : []}>
      {items.map(item => (
        <AccordionItem key={item.id} value={item.id} className="guide">
          <AccordionHeader className="guide-header">
            <AccordionTrigger className="guide-trigger">
              <span className={`icon-chip ${item.tone || ""}`}><Icon name={item.icon} /></span>
              <span className="row-body"><strong>{item.title}</strong><small>{item.summary}</small></span>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel className="guide-panel">
            {item.intro && <p>{item.intro}</p>}
            {item.tone === "tone-danger"
              ? <ul className="warning-list">{item.points.map(point => <li key={point}><Icon name="circle-exclamation" />{point}</li>)}</ul>
              : <ul className="topic-list">{item.points.map(point => <li key={point}><Icon name="check" />{point}</li>)}</ul>}
            {item.footer && <p className="guide-footer">{item.footer}</p>}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function PageHeader({ page }) {
  return (
    <header className={`page-header ${page.image ? "has-image" : ""}`}>
      <div className="page-header-copy">
        {page.eyebrow && <span className="eyebrow">{page.eyebrow}</span>}
        <h1>{page.title}</h1>
        {page.description && <p>{page.description}</p>}
      </div>
      {page.image && <img className="page-header-image" src={page.image} alt={page.imageAlt || ""} />}
    </header>
  );
}

function StageSelect({ value, onChange, label = "Pregnancy or postpartum stage" }) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select items={stageItems} value={value} onValueChange={next => next && onChange(next)}>
        <SelectTrigger className="select-trigger"><SelectValue /></SelectTrigger>
        <SelectContent className="select-content" sideOffset={6}>
          {stageItems.map(item => (
            <SelectItem key={item.value} value={item.value} className="select-item">
              {item.label}
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

const lessonPhotos = {
  "aaaaaaaa-0000-0000-0000-000000000001": consultationPhoto,
  "aaaaaaaa-0000-0000-0000-000000000002": nutritionPhoto,
  "aaaaaaaa-0000-0000-0000-000000000003": latePregnancyPhoto,
  "aaaaaaaa-0000-0000-0000-000000000004": breastfeedingPhoto,
  "aaaaaaaa-0000-0000-0000-000000000005": journalPhoto,
  "aaaaaaaa-0000-0000-0000-000000000006": nutritionPhoto,
  "aaaaaaaa-0000-0000-0000-000000000007": waitingRoomPhoto,
  "aaaaaaaa-0000-0000-0000-000000000008": activePhoto,
  "aaaaaaaa-0000-0000-0000-000000000009": partnerPhoto,
  "aaaaaaaa-0000-0000-0000-000000000010": obstetricianPhoto,
  "aaaaaaaa-0000-0000-0000-000000000011": healthWorkerPhoto,
  "aaaaaaaa-0000-0000-0000-000000000012": latePregnancyPhoto,
  "aaaaaaaa-0000-0000-0000-000000000013": partnerPhoto,
  "aaaaaaaa-0000-0000-0000-000000000014": breastfeedingPhoto,
  "aaaaaaaa-0000-0000-0000-000000000015": waitingRoomPhoto,
  "aaaaaaaa-0000-0000-0000-000000000016": journalPhoto,
};

const stagePhotos = { FIRST_TRIMESTER: consultationPhoto, SECOND_TRIMESTER: nutritionPhoto, THIRD_TRIMESTER: latePregnancyPhoto, POSTPARTUM: breastfeedingPhoto };
const lessonPhoto = lesson => lessonPhotos[lesson.moduleId] || stagePhotos[lesson.stage] || journeyPhoto;

const photoCredits = "Photos by DC Studio, ASphotofamily, prostooleh, wayhomestudio and Freepik, via Freepik.";

const stageGuides = [
  { stage: "FIRST_TRIMESTER", icon: "seedling", weeks: "Weeks 1–13", summary: "Settle in, book your first visit and learn what changes to expect.",
    topics: ["Your first clinic visits", "Healthy habits early on", "Questions to ask"],
    tip: "Book your first antenatal visit as early as you can, and bring any health card you have." },
  { stage: "SECOND_TRIMESTER", icon: "apple-whole", weeks: "Weeks 14–27", summary: "Eat well, stay active and start feeling your baby move.",
    topics: ["Eating well during pregnancy", "Staying active", "Feeling movements"],
    tip: "Many people first feel their baby move between about 16 and 24 weeks. Mention it at your next visit." },
  { stage: "THIRD_TRIMESTER", icon: "bag-shopping", weeks: "Weeks 28–40", summary: "Prepare for the birth, plan your transport and know the signs of labour.",
    topics: ["Getting ready for the birth", "Signs of labour", "Your birth plan"],
    tip: "Plan how you will get to the health facility when labour starts, day or night." },
  { stage: "POSTPARTUM", icon: "baby", weeks: "After birth", summary: "Recover, feed your baby and keep up with postnatal check-ups.",
    topics: ["Caring for yourself after birth", "Feeding your baby", "Postnatal check-ups"],
    tip: "Rest when your baby rests, and keep every postnatal check-up for you and your baby." },
];

const goodNews = [
  { icon: "stethoscope", title: "Every visit counts", body: "WHO recommends at least eight antenatal care contacts. Regular visits help health workers find and manage problems early.", source: "World Health Organization, 2016" },
  { icon: "hand-holding-heart", title: "Skin-to-skin helps", body: "Holding your baby skin-to-skin straight after birth helps keep them warm and supports early breastfeeding.", source: "World Health Organization" },
  { icon: "person-breastfeeding", title: "The first hour matters", body: "WHO recommends starting breastfeeding within the first hour after birth.", source: "World Health Organization" },
  { icon: "calendar-check", title: "Care continues after birth", body: "WHO recommends at least four postnatal check-ups in the first six weeks, for both you and your baby.", source: "World Health Organization, 2022" },
];

const encouragements = [
  "Asking questions is a sign of strength. Your care team is there to help.",
  "Small steps count. One lesson today is real progress.",
  "You know your body best. If something feels wrong, it is always okay to get checked.",
  "Rest is part of the work. Taking care of yourself is taking care of your baby.",
  "Every visit you attend is a gift to your future self and your family.",
  "You do not have to know everything today. Learning a little at a time is enough.",
  "Writing down how you feel helps your health worker understand you better.",
];

const warningSigns = {
  pregnancy: ["Bleeding from the vagina", "Severe headache or blurred vision", "Fits or convulsions", "Fever or feeling very weak", "Severe pain in the belly", "Fast or difficult breathing", "Sudden swelling of the face or hands", "Baby moving less, or not at all"],
  newborn: ["Not feeding well, or stopped feeding", "Fits or stiffening of the body", "Fast breathing or chest pulling in", "Feels hot, or cold to touch", "Very sleepy and hard to wake", "Yellow skin on day one, or yellow palms and soles", "Red, swollen or smelly cord"],
};

const guides = [
  { id: "danger-pregnancy", icon: "triangle-exclamation", tone: "tone-danger", title: "Danger signs in pregnancy", summary: "Go to a health facility straight away",
    intro: "Most pregnancies go well, but these signs need care the same day. Do not wait for your next appointment.",
    points: warningSigns.pregnancy, footer: "Ask someone to take you, and bring your health card." },
  { id: "danger-newborn", icon: "baby", tone: "tone-danger", title: "Danger signs in your newborn", summary: "Newborns can become ill quickly",
    intro: "Take your baby to a health facility straight away if you notice any of these.",
    points: warningSigns.newborn, footer: "Keep your baby warm and keep feeding if you can on the way." },
  { id: "birth-bag", icon: "bag-shopping", title: "What to pack for the birth", summary: "Have your bag ready from about 36 weeks",
    points: ["Your health card, clinic book and test results", "Clean clothes and sanitary pads for you", "Clothes, a hat and warm wraps for the baby", "Water and a small snack", "Money for transport and the phone number of your facility"] },
  { id: "visit-questions", icon: "comments", title: "Questions for your next visit", summary: "Make the most of your appointment",
    points: ["Is my blood pressure and weight normal for this stage?", "Which tests are you offering me today, and why?", "Which medicines or supplements should I take?", "What signs mean I should come back early?", "When is my next visit?"] },
  { id: "eating", icon: "apple-whole", title: "Healthy eating basics", summary: "Simple meals made from local foods",
    points: ["Eat vegetables and fruits of different colours", "Include beans, lentils, eggs, fish or meat for protein", "Choose whole grains such as maize, millet or brown rice", "Drink clean, safe water through the day", "Take the iron and folic acid your health worker gives you"] },
];

const visitQuestions = ["What tests are you offering me today?", "Is my blood pressure normal?", "Which supplements should I take?", "What signs mean I should come back early?", "When is my next visit?"];

const diaryPrompts = ["How are you feeling today, in your body and your mood?", "Did you notice any new symptoms?", "How is your baby moving?", "What would you like to ask at your next visit?", "What made you smile this week?"];

const faqs = [
  { q: "Is MaternaCare free to use?", a: "Yes. Creating an account and using the lessons, visit planner and diary is free." },
  { q: "Who writes the lessons?", a: "Lessons are written for this app and checked by a content reviewer before they are published. Every lesson shows its version." },
  { q: "Does MaternaCare replace my health worker?", a: "No. MaternaCare is for education only and does not diagnose. Always follow the advice of your health worker, and get care straight away if you are worried." },
  { q: "Can I use it without internet?", a: "Yes. Lessons you open stay available offline, and you can write diary notes and visits that sync when you are back online." },
  { q: "Who can see my information?", a: "Your records are private to your account. You choose whether to store and sync them, and you can export or delete everything at any time." },
];

const libraryPreview = [
  { stage: "FIRST_TRIMESTER", title: "Your first clinic visits", minutes: 4 },
  { stage: "FIRST_TRIMESTER", title: "Danger signs in pregnancy", minutes: 3 },
  { stage: "SECOND_TRIMESTER", title: "Eating well during pregnancy", minutes: 4 },
  { stage: "SECOND_TRIMESTER", title: "Feeling your baby move", minutes: 3 },
  { stage: "THIRD_TRIMESTER", title: "Getting ready for the birth", minutes: 5 },
  { stage: "POSTPARTUM", title: "Breastfeeding basics", minutes: 5 },
];

const topics = [
  { icon: "seedling", label: "Early pregnancy", href: "#learn" },
  { icon: "apple-whole", label: "Nutrition", href: "#learn" },
  { icon: "person-pregnant", label: "Baby's movements", href: "#learn" },
  { icon: "bag-shopping", label: "Birth preparation", href: "#learn" },
  { icon: "person-breastfeeding", label: "Breastfeeding", href: "#learn" },
  { icon: "baby", label: "Newborn care", href: "#warning-signs" },
  { icon: "heart", label: "Feelings after birth", href: "#learn" },
  { icon: "triangle-exclamation", label: "Warning signs", href: "#warning-signs" },
];

const DAY = 86400000;

function DueDateTool({ compact = false }) {
  const [today] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); });
  const [lmp, setLmp] = useState("");
  const start = lmp ? new Date(lmp + "T00:00").getTime() : null;
  const days = start === null ? null : Math.round((today - start) / DAY);
  const invalid = days !== null && (days < 0 || days > 44 * 7);
  const due = start === null ? null : new Date(start + 280 * DAY);
  const week = days === null ? 0 : Math.floor(days / 7);
  const trimester = week < 14 ? "FIRST_TRIMESTER" : week < 28 ? "SECOND_TRIMESTER" : "THIRD_TRIMESTER";
  return (
    <section className={`card tool-card ${compact ? "is-compact" : ""}`}>
      <header className="card-header">
        <span className="icon-chip"><Icon name="calculator" /></span>
        <div><h2>Due date calculator</h2><p>Estimate your due date from the first day of your last period.</p></div>
      </header>
      <Field>
        <FieldLabel>First day of your last period</FieldLabel>
        <Input type="date" value={lmp} onChange={e => setLmp(e.target.value)} max={new Date(today).toISOString().slice(0, 10)} />
      </Field>
      {invalid && <p className="alert alert-error" role="alert"><Icon name="circle-exclamation" />Choose a date within the last 44 weeks.</p>}
      {due && !invalid && (
        <div className="tool-result" role="status">
          <span className="eyebrow">Estimated due date</span>
          <strong>{due.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
          <p>About {week} {week === 1 ? "week" : "weeks"} and {days % 7} {days % 7 === 1 ? "day" : "days"} pregnant · {stages[trimester]}</p>
          <Progress value={Math.min(week, 40)} max={40} aria-label="Weeks of pregnancy" className="hero-progress">
            <ProgressTrack className="progress-track"><ProgressIndicator className="progress-indicator" /></ProgressTrack>
          </Progress>
        </div>
      )}
      <p className="source-note"><Icon name="circle-info" />An estimate based on a 28-day cycle. Your health worker will confirm your dates.</p>
    </section>
  );
}

const features = [
  { icon: "book-open-reader", title: "Reviewed lessons", body: "Short, clear lessons for each stage, checked by a content reviewer before they are published." },
  { icon: "clipboard-question", title: "Quick quizzes", body: "A few questions after each lesson help you check what you have learned." },
  { icon: "calendar-days", title: "Visit planning", body: "Keep every clinic visit in one place, with a reminder of what is coming up." },
  { icon: "pen-to-square", title: "Private diary", body: "Note symptoms, feelings and questions to bring to your next appointment." },
  { icon: "hospital", title: "Where to get care", body: "Facility contacts and clear guidance for when you need help quickly." },
  { icon: "cloud-arrow-down", title: "Works offline", body: "Lessons and notes stay on your device and sync when you choose." },
];

const demoCredentials = import.meta.env.VITE_ENABLE_DEMO !== "false" ? { email: "user1@demo.test", password: "Demo1234!" } : null;
const demoEnabled = Boolean(demoCredentials);
const dayIndex = () => Math.floor(Date.now() / 86400000);

function useDemoLogin(enter) {
  return useMutation({ mutationFn: () => loginUser(demoCredentials), onSuccess: enter, meta: { inline: true } });
}

function Landing({ enter }) {
  const demo = useDemoLogin(enter);
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="container landing-nav-inner">
          <Link className="brand" to="/"><span className="brand-mark"><Icon name="heart-pulse" /></span>MaternaCare</Link>
          <nav className="landing-links" aria-label="Page sections">
            <a href="#learn">Pregnancy</a>
            <a href="#topics">Topics</a>
            <a href="#tools">Tools</a>
            <a href="#warning-signs">Warning signs</a>
            <a href="#good-news">Good news</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-nav-actions">
            <Link className="btn btn-ghost" to="/signin">Sign in</Link>
            <Link className="btn btn-primary" to="/signin?mode=register">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container landing-hero">
          <div className="landing-hero-copy">
            <span className="pill"><Icon name="graduation-cap" />Free maternal health education</span>
            <h1>Feel informed and prepared at every stage of pregnancy.</h1>
            <p>MaternaCare is a learning companion for expectant and new mothers. Short reviewed lessons, visit planning and a private diary, all in one calm place.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/signin?mode=register">Create an account<Icon name="arrow-right" /></Link>
              {demoEnabled
                ? <Button className="btn btn-secondary btn-lg" disabled={demo.isPending} onClick={() => demo.mutate()}>Open demo account</Button>
                : <Link className="btn btn-secondary btn-lg" to="/signin">Sign in</Link>}
            </div>
            <Feedback task={demo} />
            <ul className="assurances">
              <li><Icon name="shield-halved" />Private by default</li>
              <li><Icon name="user-doctor" />Reviewed content</li>
              <li><Icon name="wifi" />Works offline</li>
            </ul>
          </div>
          <div className="landing-hero-visual">
            <img src={journeyPhoto} alt="An expectant mother smiling during a check-up with a clinician" />
            <div className="float-card float-top" aria-hidden="true">
              <span className="icon-chip"><Icon name="calendar-check" /></span>
              <span><strong>Next visit</strong><small>Antenatal check-up · Thu</small></span>
            </div>
            <div className="float-card float-bottom" aria-hidden="true">
              <span className="icon-chip tone-success"><Icon name="circle-check" /></span>
              <span><strong>Lesson complete</strong><small>Your first clinic visits</small></span>
            </div>
          </div>
        </section>

        <section className="container fact-strip" aria-label="At a glance">
          <div><strong>4</strong><span>stages covered, from early pregnancy to after birth</span></div>
          <div><strong>5 min</strong><span>lessons you can finish in a short break</span></div>
          <div><strong>100%</strong><span>of lessons reviewed before publishing</span></div>
          <div><strong>Offline</strong><span>reading for the times you have no signal</span></div>
        </section>

        <section className="landing-section editorial-section">
          <div className="container editorial">
            <article className="featured-story">
              <img src={journeyPhoto} alt="A pregnant woman smiling while a clinician listens with a stethoscope" />
              <div className="featured-copy">
                <div className="chips"><span className="chip">Featured</span><span className="chip chip-muted"><Icon name="clock" />4 min read</span><span className="chip chip-success"><Icon name="circle-check" />Reviewed content</span></div>
                <h2>Your first clinic visits: what to expect and how to prepare</h2>
                <p>Antenatal care helps health workers find and manage problems early. Learn what happens at your first visit, which questions to ask, and why starting in the first 12 weeks matters.</p>
                <Link className="card-link" to="/signin?mode=register">Read the lesson<Icon name="arrow-right" /></Link>
              </div>
            </article>
            <aside className="start-here">
              <h2 className="aside-title">Start here</h2>
              <ol>
                {libraryPreview.slice(1).map((item, i) => (
                  <li key={item.title}>
                    <span className="start-number">{i + 1}</span>
                    <Link to="/signin?mode=register"><small>{stages[item.stage]}</small><strong>{item.title}</strong><span>{item.minutes} min read</span></Link>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        <section id="topics" className="landing-section topics-section">
          <div className="container">
            <header className="section-head">
              <span className="eyebrow">Browse by topic</span>
              <h2>Find what you need, fast</h2>
            </header>
            <div className="topic-grid">
              {topics.map(topic => (
                <a key={topic.label} className="topic-tile" href={topic.href}>
                  <span className="icon-chip icon-chip-lg"><Icon name={topic.icon} /></span>
                  <strong>{topic.label}</strong>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="tools" className="landing-section tools-section">
          <div className="container tools-layout">
            <DueDateTool />
            <div className="tool-list">
              <header className="section-head section-head-left">
                <span className="eyebrow">Health tools</span>
                <h2>Simple tools for every week</h2>
                <p>Practical helpers you can use right now, no account needed for the calculator.</p>
              </header>
              <a className="card tool-link" href="#warning-signs"><span className="icon-chip tone-danger"><Icon name="triangle-exclamation" /></span><span className="row-body"><strong>Warning signs checklist</strong><small>Know when to go to a health facility straight away</small></span><Icon name="arrow-right" className="row-chevron" /></a>
              <Link className="card tool-link" to="/signin?mode=register"><span className="icon-chip"><Icon name="calendar-plus" /></span><span className="row-body"><strong>Visit planner</strong><small>Keep every antenatal and postnatal visit in one place</small></span><Icon name="arrow-right" className="row-chevron" /></Link>
              <Link className="card tool-link" to="/signin?mode=register"><span className="icon-chip"><Icon name="bag-shopping" /></span><span className="row-body"><strong>Birth bag checklist</strong><small>Everything to pack from about 36 weeks</small></span><Icon name="arrow-right" className="row-chevron" /></Link>
              <Link className="card tool-link" to="/signin?mode=register"><span className="icon-chip"><Icon name="pen-to-square" /></span><span className="row-body"><strong>Symptom and question diary</strong><small>Note how you feel and what to ask at your visit</small></span><Icon name="arrow-right" className="row-chevron" /></Link>
            </div>
          </div>
        </section>

        <section id="learn" className="landing-section">
          <div className="container">
            <header className="section-head">
              <span className="eyebrow">What you will learn</span>
              <h2>Guidance that grows with you</h2>
              <p>Lessons are grouped by stage, so you always see what matters now.</p>
            </header>
            <div className="stage-grid">
              {stageGuides.map(guide => (
                <article key={guide.stage} className="card stage-card has-photo">
                  <img className="card-photo" src={stagePhotos[guide.stage]} alt="" />
                  <span className="icon-chip icon-chip-lg stage-badge"><Icon name={guide.icon} /></span>
                  <span className="stage-weeks">{guide.weeks}</span>
                  <h3>{stages[guide.stage]}</h3>
                  <p>{guide.summary}</p>
                  <ul className="topic-list">{guide.topics.map(topic => <li key={topic}><Icon name="check" />{topic}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="good-news" className="landing-section good-news-section">
          <div className="container">
            <header className="section-head">
              <span className="eyebrow">Good news</span>
              <h2>Simple steps make a real difference</h2>
              <p>Proven, everyday care helps mothers and babies stay healthy. Here is some of what the evidence says.</p>
            </header>
            <NewsGrid />
          </div>
        </section>

        <section className="landing-section">
          <div className="container">
            <header className="section-head">
              <span className="eyebrow">From the library</span>
              <h2>Short lessons, written in plain language</h2>
              <p>A few of the lessons waiting for you. Each one ends with a quick quiz.</p>
            </header>
            <div className="preview-grid">
              {libraryPreview.map(item => {
                const guide = stageGuides.find(g => g.stage === item.stage);
                return (
                  <Link key={item.title} className="card preview-card" to="/signin?mode=register">
                    <img className="preview-thumb" src={stagePhotos[item.stage]} alt="" />
                    <span className="sr-only">{guide.weeks}</span>
                    <span className="row-body"><small>{stages[item.stage]} · {item.minutes} min read</small><strong>{item.title}</strong></span>
                    <Icon name="arrow-right" className="row-chevron" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="warning-signs" className="landing-section warning-section">
          <div className="container warning-layout">
            <header className="section-head section-head-left">
              <span className="eyebrow eyebrow-danger">Know the warning signs</span>
              <h2>Knowing when to get help saves lives</h2>
              <p>Most pregnancies go well. If you or your baby have any of these signs, go to a health facility straight away. Do not wait for your next appointment.</p>
              <img className="how-photo" src={waitingRoomPhoto} alt="A nurse talking with a patient in a clinic waiting area" />
            </header>
            <div className="warning-columns">
              <div className="card"><h3><Icon name="person-pregnant" />During pregnancy</h3><ul className="warning-list">{warningSigns.pregnancy.map(sign => <li key={sign}><Icon name="circle-exclamation" />{sign}</li>)}</ul></div>
              <div className="card"><h3><Icon name="baby" />In your newborn</h3><ul className="warning-list">{warningSigns.newborn.map(sign => <li key={sign}><Icon name="circle-exclamation" />{sign}</li>)}</ul></div>
            </div>
          </div>
        </section>

        <section id="how" className="landing-section">
          <div className="container how-layout">
            <header className="section-head section-head-left">
              <span className="eyebrow">How it works</span>
              <h2>Start learning in three steps</h2>
              <p>No cost and no complicated setup. You decide what is stored and when it syncs.</p>
              <Link className="btn btn-primary" to="/signin?mode=register">Create your free account<Icon name="arrow-right" /></Link>
              <img className="how-photo" src={partnerPhoto} alt="A father resting his head on his partner's pregnant belly" />
            </header>
            <ol className="steps">
              <li><span className="step-number">1</span><div><h3>Create your account</h3><p>Sign up with your email. It takes less than a minute.</p></div></li>
              <li><span className="step-number">2</span><div><h3>Tell us your stage</h3><p>Choose your trimester or postpartum, and add your due date if you know it.</p></div></li>
              <li><span className="step-number">3</span><div><h3>Learn and plan</h3><p>Read a lesson, take the quiz, and add your next clinic visit.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-section features-section">
          <div className="container">
            <header className="section-head">
              <span className="eyebrow">Everything in one place</span>
              <h2>Built around your care</h2>
            </header>
            <div className="feature-grid">
              {features.map(item => (
                <article key={item.title} className="feature">
                  <span className="icon-chip"><Icon name={item.icon} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="landing-section faq-section">
          <div className="container faq-layout">
            <header className="section-head section-head-left">
              <span className="eyebrow">Questions</span>
              <h2>Frequently asked questions</h2>
              <p>Everything you need to know before you start.</p>
            </header>
            <Accordion className="faq" defaultValue={["faq-0"]}>
              {faqs.map((item, i) => (
                <AccordionItem key={item.q} value={"faq-" + i} className="faq-item">
                  <AccordionHeader className="guide-header"><AccordionTrigger className="faq-trigger">{item.q}</AccordionTrigger></AccordionHeader>
                  <AccordionPanel className="faq-panel"><p>{item.a}</p></AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="container">
          <div className="cta-band">
            <div>
              <h2>Your journey deserves good information.</h2>
              <p>Join MaternaCare and learn something useful today.</p>
            </div>
            <div className="hero-actions">
              <Link className="btn btn-light btn-lg" to="/signin?mode=register">Get started free</Link>
              <Link className="btn btn-outline-light btn-lg" to="/signin">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <span className="brand"><span className="brand-mark"><Icon name="heart-pulse" /></span>MaternaCare</span>
          <p>MaternaCare provides education only and does not diagnose. If you are worried about your health or your baby, contact a health facility or emergency services right away.</p>
          <p className="credits"><Icon name="camera" />{photoCredits}</p>
        </div>
      </footer>
    </div>
  );
}

function Welcome({ enter, expired }) {
  const [params] = useSearchParams();
  const [register, setRegister] = useState(params.get("mode") === "register");
  const auth = useMutation({ mutationFn: ({ data, signup }) => signup ? registerUser(data) : loginUser(data), onSuccess: enter, meta: { inline: true } });
  const demo = useDemoLogin(enter);
  const busy = auth.isPending || demo.isPending;
  function submit(e) {
    e.preventDefault();
    auth.mutate({ data: Object.fromEntries(new FormData(e.currentTarget)), signup: register });
  }
  return (
    <main className="auth">
      <section className="auth-visual">
        <img src={activePhoto} alt="A smiling pregnant woman holding a yoga mat" />
        <div className="auth-visual-copy">
          <Link className="brand brand-light" to="/"><span className="brand-mark"><Icon name="heart-pulse" /></span>MaternaCare</Link>
          <h2>Calm, reliable guidance for every stage of pregnancy.</h2>
          <ul>
            <li><Icon name="circle-check" />Lessons reviewed before they reach you</li>
            <li><Icon name="circle-check" />Visit planning and reminders</li>
            <li><Icon name="circle-check" />Works offline, syncs when you choose</li>
          </ul>
        </div>
      </section>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <Link className="back-link" to="/"><Icon name="arrow-left" />Back to home</Link>
          <header>
            <h1>{register ? "Create your account" : "Welcome back"}</h1>
            <p>{register ? "Keep your visits, notes and progress in one private place." : "Sign in to continue your journey."}</p>
          </header>
          {expired && <p className="alert alert-info" role="status"><Icon name="clock" />Your session expired. Sign in again to see your account.</p>}
          {register && (
            <Field><FieldLabel>Full name</FieldLabel><Input name="fullName" maxLength="100" required autoComplete="name" /></Field>
          )}
          <Field><FieldLabel>Email</FieldLabel><Input name="email" type="email" required autoComplete="username" placeholder="you@example.com" /></Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input name="password" type="password" required minLength={register ? 8 : 1} autoComplete={register ? "new-password" : "current-password"} />
            {register && <FieldDescription>At least 8 characters.</FieldDescription>}
          </Field>
          <Feedback task={auth} /><Feedback task={demo} />
          <Button className="btn btn-primary btn-block" type="submit" disabled={busy}>{register ? "Register" : "Sign in"}</Button>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to MaternaCare?"}{" "}
            <button type="button" className="text-button" onClick={() => { auth.reset(); setRegister(!register); }}>{register ? "Use existing account" : "Create an account"}</button>
          </p>
          {demoEnabled && <>
            <div className="divider"><span>or</span></div>
            <Button className="btn btn-secondary btn-block" type="button" disabled={busy} onClick={() => demo.mutate()}>Open demo account</Button>
            <p className="fine-print">The demo account is shared and shows example information. Use your own account for personal entries.</p>
          </>}
        </form>
      </section>
    </main>
  );
}

function TimelineForm({ timeline }) {
  const consent = useResource("/consents", { offline: true });
  const [stage, setStage] = useState(timeline?.stage || "FIRST_TRIMESTER");
  const save = useChange(body => request("/timeline", { method: "PUT", body }), ["/timeline"], "Your timeline was not saved");
  const allowed = granted(consent.data, "DATA_STORAGE");
  return (
    <form id="pregnancy-details" className="card form-card" onSubmit={e => {
      e.preventDefault();
      save.mutate({ stage, expectedDate: new FormData(e.currentTarget).get("due") || null }, { onSuccess: () => toast.success("Timeline saved.") });
    }}>
      <header className="card-header">
        <span className="icon-chip"><Icon name="sliders" /></span>
        <div><h2>Pregnancy details</h2><p>Your stage decides which lessons you see first.</p></div>
      </header>
      <StageSelect value={stage} onChange={setStage} />
      <Field><FieldLabel>Expected due date</FieldLabel><Input name="due" type="date" defaultValue={timeline?.expectedDate || ""} /><FieldDescription>Optional. Used to work out your current week.</FieldDescription></Field>
      {!allowed && <ConsentNotice>Allow data storage to save your timeline.</ConsentNotice>}
      <div className="form-actions"><Button className="btn btn-primary" type="submit" disabled={save.isPending || !allowed}>Save timeline</Button></div>
    </form>
  );
}

function StatCard({ icon, label, value, meta, to }) {
  return (
    <section className="card stat-card">
      <div className="stat-top"><span className="icon-chip"><Icon name={icon} /></span><span className="stat-label">{label}</span></div>
      <div className="stat-value">{value}</div>
      <p className="stat-meta">{meta}</p>
      {to && (to.hash
        ? <a className="card-link" href={to.hash}>{to.label}<Icon name="arrow-right" /></a>
        : <Link className="card-link" to={to.path}>{to.label}<Icon name="arrow-right" /></Link>)}
    </section>
  );
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function Journey() {
  const user = useContext(account);
  const timeline = useResource("/timeline", { optional: true, offline: true });
  const visits = useResource("/appointments", { offline: true });
  const progress = useResource("/progress", { offline: true });
  const stage = timeline.data?.stage || "FIRST_TRIMESTER";
  const lessons = useResource("/lessons?stage=" + stage, { offline: true });
  const [now] = useState(Date.now);
  const [hello] = useState(greeting);
  const [day] = useState(dayIndex);
  const guide = stageGuides.find(g => g.stage === stage);
  const fact = goodNews[day % goodNews.length];
  const week = timeline.data?.currentWeek;
  const due = timeline.data?.expectedDate ? new Date(timeline.data.expectedDate + "T00:00") : null;
  const next = visits.data?.filter(v => Date.parse(v.dateTime) >= now).sort((a, b) => Date.parse(a.dateTime) - Date.parse(b.dateTime))[0];
  const done = progress.data?.filter(r => r.completed).length ?? 0;
  const passed = progress.data?.filter(r => r.quizPassed).length ?? 0;
  return (
    <div className="stack-lg">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{timeline.data ? stages[stage] : "Your journey"}</span>
          <h1>{hello}, {user.fullName?.split(" ")[0] || "there"}</h1>
          <p>{week ? `You are in week ${week}. Here is what matters this week.` : "Add your stage and due date to personalise your lessons and reminders."}</p>
          {week > 0 && stage !== "POSTPARTUM" && (
            <Progress value={Math.min(week, 40)} max={40} aria-label="Pregnancy progress" className="hero-progress">
              <div className="hero-progress-label"><span>Week {week}</span><span>40 weeks</span></div>
              <ProgressTrack className="progress-track"><ProgressIndicator className="progress-indicator" /></ProgressTrack>
            </Progress>
          )}
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/learn">Continue learning<Icon name="arrow-right" /></Link>
            <Link className="btn btn-secondary" to="/appointments"><Icon name="calendar-plus" />Plan a visit</Link>
          </div>
        </div>
        <figure className="hero-media"><img src={journeyPhoto} alt="An expectant mother meeting with a clinician" /></figure>
      </section>

      <section className="encouragement" aria-label="Today's encouragement">
        <span className="encouragement-icon"><Icon name="sun" /></span>
        <div>
          <span className="eyebrow">Today's encouragement</span>
          <p>{encouragements[day % encouragements.length]}</p>
        </div>
      </section>

      <div className="stat-grid">
        {visits.isPending ? <section className="card stat-card"><Skeleton lines={2} /></section> :
          <StatCard icon="calendar-check" label="Next visit" value={next ? new Date(next.dateTime).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "None"}
            meta={next ? <><strong>{next.title}</strong> · {shortTime(next.dateTime)}{next.facility ? ` · ${next.facility}` : ""}</> : "No upcoming visits scheduled."}
            to={{ path: "/appointments", label: "Manage visits" }} />}
        <StatCard icon="graduation-cap" label="Lessons completed" value={done} meta={`${passed} ${passed === 1 ? "quiz" : "quizzes"} passed`} to={{ path: "/learn", label: "Open library" }} />
        <StatCard icon="baby" label="Due date" value={due ? due.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Not set"}
          meta={due ? due.getFullYear() : "Add it to see your current week."} to={{ hash: "#pregnancy-details", label: due ? "Update details" : "Set due date" }} />
      </div>

      <div className="two-col">
        <div className="col-stack">
          <section className="card">
            <header className="card-header">
              <span className="icon-chip"><Icon name="book-open" /></span>
              <div><h2>Recommended for you</h2><p>Lessons for the {stages[stage].toLowerCase()}.</p></div>
            </header>
            <Result query={lessons}>{rows => rows.length ? (
              <ul className="list">
                {rows.map(row => {
                  const complete = progress.data?.some(r => r.moduleId === row.moduleId && r.completed);
                  return (
                    <li key={row.moduleId}>
                      <Link className="list-row" to={"/learn?lesson=" + row.moduleId}>
                        <img className="row-thumb" src={lessonPhoto(row)} alt="" />
                        <span className="row-body"><strong>{row.title}</strong><small>Lesson {row.orderNo || 1} · {complete ? "Completed" : "Not started"}</small></span>
                        {complete && <span className="chip chip-success"><Icon name="check" />Done</span>}
                        <Icon name="chevron-right" className="row-chevron" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : <EmptyState icon="book-open" title="No lessons yet">Approved lessons for this stage will appear here.</EmptyState>}</Result>
          </section>

          <section className="card stage-tip has-photo">
            <img className="card-photo" src={stagePhotos[stage]} alt="" />
            <header className="card-header">
              <span className="icon-chip"><Icon name={guide.icon} /></span>
              <div><h2>This stage: {stages[stage].toLowerCase()}</h2><p>{guide.weeks}</p></div>
            </header>
            <p className="stage-tip-text">{guide.tip}</p>
            <ul className="topic-list">{guide.topics.map(topic => <li key={topic}><Icon name="check" />{topic}</li>)}</ul>
            <p className="source-note"><Icon name="circle-info" />General information, not medical advice.</p>
          </section>

          <section className="card warning-card">
            <header className="card-header">
              <span className="icon-chip tone-danger"><Icon name="triangle-exclamation" /></span>
              <div><h2>Know the warning signs</h2><p>Go to a health facility straight away if you notice any of these.</p></div>
            </header>
            <ul className="warning-list">{warningSigns[stage === "POSTPARTUM" ? "newborn" : "pregnancy"].slice(0, 6).map(sign => <li key={sign}><Icon name="circle-exclamation" />{sign}</li>)}</ul>
            <Link className="card-link" to="/facilities">Find a health facility<Icon name="arrow-right" /></Link>
          </section>
        </div>

        <div className="col-stack">
          <Result query={timeline} lines={5}>{data => <TimelineForm timeline={data} />}</Result>
          <section className="card">
            <header className="card-header">
              <span className="icon-chip"><Icon name="calendar-days" /></span>
              <div><h2>Upcoming visits</h2><p>Your next clinic appointments.</p></div>
            </header>
            <Result query={visits}>{rows => {
              const upcoming = rows.filter(v => Date.parse(v.dateTime) >= now).sort((x, y) => Date.parse(x.dateTime) - Date.parse(y.dateTime)).slice(0, 3);
              return upcoming.length ? (
                <ul className="list">
                  {upcoming.map(v => (
                    <li key={v.clientId}>
                      <Link className="list-row" to="/appointments">
                        <DateBadge value={v.dateTime} />
                        <span className="row-body"><strong>{v.title}</strong><small>{shortTime(v.dateTime)}{v.facility ? ` · ${v.facility}` : ""}</small></span>
                        <Icon name="chevron-right" className="row-chevron" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState icon="calendar" title="No visits planned">Add your next antenatal visit to get a reminder.</EmptyState>;
            }}</Result>
          </section>
        </div>
      </div>

      <section className="stack">
        <div className="section-bar"><div><h2>Good news</h2><p>Simple, proven steps that make a real difference.</p></div><span className="chip chip-muted"><Icon name="star" />Featured today: {fact.title}</span></div>
        <NewsGrid />
      </section>
    </div>
  );
}

function parseQuiz(value) {
  try { const q = typeof value === "string" ? JSON.parse(value) : value; return Array.isArray(q) ? q : []; }
  catch { return []; }
}

function Article({ lesson, record }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const { userId } = useContext(account);
  const offline = !useOnline();
  const consent = useResource("/consents", { offline: true });
  const client = useQueryClient();
  const pendingKey = cacheKey(userId, "pending-progress/" + lesson.moduleId + "/" + lesson.version);
  const local = useQuery({ queryKey: [userId, pendingKey], networkMode: "always", queryFn: async () => (await get(pendingKey)) || null });
  const allowStorage = granted(consent.data, "DATA_STORAGE");
  const allowSync = granted(consent.data, "SYNC");
  const quiz = parseQuiz(lesson.quiz);
  const answered = quiz.every((_, i) => answers[i] !== undefined);
  const practice = useChange(async result => {
    await update(pendingKey, previous => ({ completed: true, quizPassed: Boolean(previous?.quizPassed || record?.quizPassed || result === quiz.length), score: result }));
    await client.invalidateQueries({ queryKey: [userId, pendingKey] });
  }, [], "Your quiz result was not saved on this device");
  const save = useChange(async body => {
    await request("/progress/" + lesson.moduleId, { method: "PUT", body });
    await delMany([pendingKey]);
    await client.invalidateQueries({ queryKey: [userId, pendingKey] });
  }, ["/progress"], "Your progress was not saved");
  function check(e) {
    e.preventDefault();
    const result = quiz.filter((q, i) => Number(answers[i]) === q.correctOptionIndex).length;
    setScore(result);
    if (offline && allowStorage) practice.mutate(result);
    else if (!offline && allowStorage) save.mutate({ completed: true, quizPassed: Boolean(record?.quizPassed || local.data?.quizPassed) || result === quiz.length });
  }
  return (
    <div className="reader-layout">
    <div className="reader">
      <article className="card lesson">
        <img className="lesson-cover" src={lessonPhoto(lesson)} alt="" />
        <header className="lesson-header">
          <div className="chips"><span className="chip">{stages[lesson.stage]}</span><span className="chip chip-muted">Version {lesson.version}</span>
            {record?.completed && <span className="chip chip-success"><Icon name="check" />Completed</span>}</div>
          <h1>{lesson.title}</h1>
        </header>
        <div className="prose"><Paragraphs text={lesson.body} /></div>
        <footer className="lesson-footer">
          <Button className="btn btn-secondary" disabled={offline || !allowStorage || record?.completed || save.isPending}
            onClick={() => save.mutate({ completed: true, quizPassed: Boolean(record?.quizPassed) })}>
            {record?.completed ? <><Icon name="circle-check" />Reading completed</> : <><Icon name="check" />Mark as read</>}
          </Button>
          {!allowStorage && <ConsentNotice>Allow data storage to save your progress.</ConsentNotice>}
        </footer>
      </article>

      {quiz.length > 0 && (
        <form className="card quiz" onSubmit={check}>
          <header className="card-header">
            <span className="icon-chip"><Icon name="clipboard-question" /></span>
            <div><h2>Check your understanding</h2><p>{plural(quiz.length, "question")} · your answers stay private.</p></div>
          </header>
          {quiz.map((q, i) => {
            const marked = score !== null;
            const correct = Number(answers[i]) === q.correctOptionIndex;
            return (
              <Field key={q.question} className={`question ${marked ? (correct ? "is-correct" : "is-wrong") : ""}`}>
                <FieldLabel className="question-title"><span className="question-number">{i + 1}</span>{q.question}</FieldLabel>
                <RadioGroup className="choices" value={answers[i] ?? null} onValueChange={value => { setScore(null); setAnswers(previous => ({ ...previous, [i]: value })); }}>
                  {q.options.map((option, j) => (
                    <label className="choice" key={option}>
                      <Radio value={String(j)}><RadioIndicator /></Radio>
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </Field>
            );
          })}
          <div className="form-actions">
            <Button className="btn btn-primary" type="submit" disabled={!answered || save.isPending}>Check answers</Button>
            {score !== null && (
              <p role="status" className={`score ${score === quiz.length ? "is-perfect" : ""}`}>
                <Icon name={score === quiz.length ? "trophy" : "chart-simple"} />
                {score} of {quiz.length} correct.{!allowStorage && " Practice only. Enable data storage in Account to save results."}
              </p>
            )}
          </div>
        </form>
      )}

      {local.data && (
        <section className="card sync-card">
          <span className="icon-chip tone-warn"><Icon name="cloud-arrow-up" /></span>
          <div className="sync-body"><strong>Offline quiz: {local.data.score} of {quiz.length} correct</strong><small>Pending sync</small></div>
          {allowStorage && allowSync
            ? <Button className="btn btn-secondary" disabled={offline || save.isPending} onClick={() => save.mutate({ completed: true, quizPassed: Boolean(local.data.quizPassed || record?.quizPassed) })}>Sync quiz progress</Button>
            : <Link className="btn btn-ghost" to="/account">Manage sync consent</Link>}
        </section>
      )}
    </div>
    <aside className="reader-aside">
      <section className="card">
        <h2 className="aside-title">About this lesson</h2>
        <dl className="facts">
          <div><dt>Stage</dt><dd>{stages[lesson.stage]}</dd></div>
          <div><dt>Quiz</dt><dd>{quiz.length ? plural(quiz.length, "question") : "None"}</dd></div>
          <div><dt>Status</dt><dd>{record?.completed ? "Completed" : local.data ? "Pending sync" : "Not started"}</dd></div>
          <div><dt>Reviewed</dt><dd>Version {lesson.version}</dd></div>
        </dl>
      </section>
      <section className="card">
        <h2 className="aside-title">Next steps</h2>
        <ul className="list">
          <li><Link className="list-row" to="/diary"><span className="row-icon"><Icon name="pen-to-square" /></span><span className="row-body"><strong>Note a question</strong><small>Ask it at your next visit</small></span></Link></li>
          <li><Link className="list-row" to="/appointments"><span className="row-icon"><Icon name="calendar-plus" /></span><span className="row-body"><strong>Plan a visit</strong><small>Add it to your care plan</small></span></Link></li>
        </ul>
      </section>
    </aside>
    </div>
  );
}

function StageTabs({ value, onChange }) {
  return (
    <SegmentedControl className="segmented" aria-label="Stage" value={value} onValueChange={next => next && onChange(next)}>
      <SegmentedControlIndicator className="segmented-indicator" />
      {stageItems.map(item => <SegmentedControlItem key={item.value} value={item.value} className="segmented-item">{item.label}</SegmentedControlItem>)}
    </SegmentedControl>
  );
}

function useAllLessons() {
  const first = useResource("/lessons?stage=FIRST_TRIMESTER", { offline: true });
  const second = useResource("/lessons?stage=SECOND_TRIMESTER", { offline: true });
  const third = useResource("/lessons?stage=THIRD_TRIMESTER", { offline: true });
  const post = useResource("/lessons?stage=POSTPARTUM", { offline: true });
  const all = [first, second, third, post];
  return { pending: all.some(q => q.isPending), rows: all.flatMap(q => q.data || []) };
}

function NewsGrid({ items = goodNews }) {
  return (
    <div className="news-grid">
      {items.map(item => (
        <article key={item.title} className="news-card">
          <span className="news-icon"><Icon name={item.icon} /></span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <small>{item.source}</small>
        </article>
      ))}
    </div>
  );
}

function LearningOverview({ progress }) {
  const all = useAllLessons();
  const doneIds = new Set((progress.data || []).filter(r => r.completed).map(r => r.moduleId));
  const total = all.rows.length;
  const done = all.rows.filter(r => doneIds.has(r.moduleId)).length;
  const passed = (progress.data || []).filter(r => r.quizPassed).length;
  const percent = total ? Math.round(done / total * 100) : 0;
  return (
    <section className="card overview">
      <div className="overview-main">
        <span className="eyebrow">Your learning</span>
        <h2>{done ? `${done} of ${total} lessons completed` : total ? `${total} lessons waiting for you` : "Your lessons"}</h2>
        <Progress value={percent} aria-label="Lessons completed" className="hero-progress">
          <div className="hero-progress-label"><span>{percent}% complete</span><span>{passed} {passed === 1 ? "quiz" : "quizzes"} passed</span></div>
          <ProgressTrack className="progress-track"><ProgressIndicator className="progress-indicator" /></ProgressTrack>
        </Progress>
      </div>
      <ul className="overview-stages">
        {stageGuides.map(guide => {
          const rows = all.rows.filter(r => r.stage === guide.stage);
          const finished = rows.filter(r => doneIds.has(r.moduleId)).length;
          return (
            <li key={guide.stage}>
              <span className="icon-chip"><Icon name={guide.icon} /></span>
              <span className="row-body"><strong>{stages[guide.stage]}</strong><small>{all.pending ? "Loading…" : `${finished} of ${rows.length} done`}</small></span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LibrarySearch({ progress }) {
  const all = useAllLessons();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const doneIds = new Set((progress.data || []).filter(r => r.completed).map(r => r.moduleId));
  const lessonHits = term ? all.rows.filter(r => r.title.toLowerCase().includes(term) || stages[r.stage].toLowerCase().includes(term)) : [];
  const guideHits = term ? guides.filter(g => (g.title + " " + g.points.join(" ")).toLowerCase().includes(term)) : [];
  const upNext = [...all.rows].sort((a, b) => Object.keys(stages).indexOf(a.stage) - Object.keys(stages).indexOf(b.stage) || a.orderNo - b.orderNo).filter(r => !doneIds.has(r.moduleId)).slice(0, 4);
  return (
    <section className="library-hero">
      <div className="library-search">
        <InputGroup className="search-group">
          <Icon name="magnifying-glass" className="search-icon" />
          <Input type="search" aria-label="Search lessons and guides" placeholder="Search lessons and guides, for example “breastfeeding”" value={query} onChange={e => setQuery(e.target.value)} />
        </InputGroup>
        <div className="search-chips">
          {["Nutrition", "Labour", "Breastfeeding", "Danger signs", "Movements"].map(chip => (
            <button key={chip} type="button" className="chip chip-button" onClick={() => setQuery(chip)}>{chip}</button>
          ))}
        </div>
      </div>
      {term ? (
        <div className="card search-results" role="region" aria-label="Search results">
          <h2 className="aside-title">{lessonHits.length + guideHits.length} results for “{query.trim()}”</h2>
          {lessonHits.length + guideHits.length === 0 ? <p className="stat-meta">No matches. Try another word, or browse lessons by stage below.</p> : (
            <ul className="list">
              {lessonHits.map(r => (
                <li key={r.moduleId}><Link className="list-row" to={"/learn?lesson=" + r.moduleId}><span className={`row-icon ${doneIds.has(r.moduleId) ? "is-done" : ""}`}><Icon name={doneIds.has(r.moduleId) ? "check" : "book-open"} /></span><span className="row-body"><strong>{r.title}</strong><small>Lesson · {stages[r.stage]}</small></span><Icon name="chevron-right" className="row-chevron" /></Link></li>
              ))}
              {guideHits.map(g => (
                <li key={g.id}><a className="list-row" href="#quick-guides"><span className="row-icon"><Icon name={g.icon} /></span><span className="row-body"><strong>{g.title}</strong><small>Quick guide · {g.summary}</small></span><Icon name="chevron-right" className="row-chevron" /></a></li>
              ))}
            </ul>
          )}
        </div>
      ) : upNext.length > 0 && (
        <div className="up-next">
          <Link className="featured-lesson" to={"/learn?lesson=" + upNext[0].moduleId}>
            <img src={lessonPhoto(upNext[0])} alt="" />
            <span className="featured-lesson-copy">
              <span className="chips"><span className="chip chip-on-dark">Up next for you</span><span className="chip chip-on-dark">{stages[upNext[0].stage]}</span></span>
              <strong>{upNext[0].title}</strong>
              <span className="featured-lesson-cta">Start lesson<Icon name="arrow-right" /></span>
            </span>
          </Link>
          <ol className="card up-next-list">
            <li className="aside-title">Then continue with</li>
            {upNext.slice(1).map((r, i) => (
              <li key={r.moduleId}><Link className="list-row" to={"/learn?lesson=" + r.moduleId}><span className="start-number">{i + 2}</span><span className="row-body"><strong>{r.title}</strong><small>{stages[r.stage]} · Lesson {r.orderNo}</small></span></Link></li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function Library({ initialStage }) {
  const [stage, setStage] = useState(initialStage || "FIRST_TRIMESTER");
  const { search } = useLocation();
  const selected = new URLSearchParams(search).get("lesson");
  const lessons = useResource("/lessons?stage=" + stage, { offline: true });
  const article = useResource(selected && "/lessons/" + encodeURIComponent(selected), { offline: true });
  const progress = useResource("/progress", { offline: true });
  const guide = stageGuides.find(g => g.stage === stage);
  if (selected) {
    return (
      <div className="stack">
        <Link className="back-link" to="/learn"><Icon name="arrow-left" />All lessons</Link>
        <Result query={article} lines={6}>{data => <Article key={data.moduleId + ":" + data.version} lesson={data} record={progress.data?.find(r => r.moduleId === data.moduleId)} />}</Result>
      </div>
    );
  }
  return (
    <div className="stack-xl">
      <LibrarySearch progress={progress} />
      <LearningOverview progress={progress} />

      <section className="stack">
        <div className="section-bar">
          <div><h2>Lessons by stage</h2><p>{guide.weeks} · {guide.summary}</p></div>
          <div className="toolbar-row"><StageTabs value={stage} onChange={setStage} /></div>
        </div>
        <Result query={lessons}>{rows => rows.length ? (
          <div className="card-grid">
            {[...rows].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0)).map(row => {
              const complete = progress.data?.some(r => r.moduleId === row.moduleId && r.completed);
              return (
                <article className="card lesson-card has-photo" key={row.moduleId}>
                  <img className="card-photo" src={lessonPhoto(row)} alt="" />
                  <div className="lesson-card-top">
                    <span className="icon-chip"><Icon name={guide.icon} /></span>
                    {complete ? <span className="chip chip-success"><Icon name="check" />Completed</span> : <span className="chip chip-muted">Lesson {row.orderNo || 1}</span>}
                  </div>
                  <h2>{row.title}</h2>
                  <p>{stages[row.stage]} · Version {row.version} · Includes a quiz</p>
                  <Link className="card-link" to={"/learn?lesson=" + row.moduleId}>Read lesson<Icon name="arrow-right" /></Link>
                </article>
              );
            })}
          </div>
        ) : <EmptyState icon="book-open" title="No lessons for this stage yet">Approved lessons will appear here once a reviewer publishes them.</EmptyState>}</Result>
      </section>

      <section className="split-section">
        <div className="stack">
          <div className="section-bar" id="quick-guides"><div><h2>Quick guides</h2><p>Short checklists you can come back to at any time.</p></div></div>
          <Guides items={guides} defaultOpen="danger-pregnancy" />
        </div>
        <aside className="card guide-card">
          <h2>How lessons work</h2>
          <ul className="guide-list">
            <li><Icon name="user-doctor" /><span>Each lesson is checked by a content reviewer before it is published.</span></li>
            <li><Icon name="clipboard-question" /><span>A short quiz helps you check what you have learned.</span></li>
            <li><Icon name="cloud-arrow-down" /><span>Lessons you open stay available when you are offline.</span></li>
            <li><Icon name="rotate" /><span>When a lesson is updated, you always see the newest approved version.</span></li>
          </ul>
        </aside>
      </section>

      <section className="stack">
        <div className="section-bar"><div><h2>Good news</h2><p>Simple, proven steps that help mothers and babies stay healthy.</p></div></div>
        <NewsGrid />
      </section>
    </div>
  );
}

function Learn() {
  const timeline = useResource("/timeline", { optional: true, offline: true });
  return <Result query={timeline}>{data => <Library initialStage={data?.stage} />}</Result>;
}

function parseDirectory(body) {
  const lines = String(body || "").split("\n").map(line => line.trim());
  const start = lines.findIndex(line => /^facilities:?$/i.test(line));
  const urgentAt = lines.findIndex(line => /^urgent/i.test(line));
  const facilities = lines.filter(line => line.startsWith("- ")).map(line => {
    const [name, type, phone, area] = line.slice(2).split(" - ").map(part => part.trim());
    return { name, type, phone, area };
  }).filter(f => f.name);
  return {
    intro: lines.slice(0, start === -1 ? 0 : start).filter(Boolean).join(" "),
    facilities,
    urgent: urgentAt === -1 ? "" : lines.slice(urgentAt + 1).filter(Boolean).join(" "),
  };
}

function Support() {
  const support = useResource("/support", { optional: true, offline: true });
  return (
    <Result query={support}>{data => {
      if (!data) return <EmptyState icon="hospital" title="No directory published yet">A reviewer has not approved a facility directory yet.</EmptyState>;
      const directory = parseDirectory(data.body);
      if (!directory.facilities.length) {
        return <article className="card prose-card"><h2>{data.title}</h2><div className="prose"><Paragraphs text={data.body} /></div></article>;
      }
      return (
        <div className="stack">
          {directory.urgent && (
            <section className="urgent" aria-labelledby="urgent-title">
              <span className="urgent-icon"><Icon name="truck-medical" /></span>
              <div><h2 id="urgent-title">If you are worried, get help now</h2><p>{directory.urgent}</p></div>
            </section>
          )}
          <div className="card-grid">
            {directory.facilities.map(f => (
              <article className="card facility" key={f.name}>
                <div className="lesson-card-top"><span className="icon-chip"><Icon name={/hospital/i.test(f.type) ? "hospital" : "house-medical"} /></span>{f.type && <span className="chip chip-muted">{f.type}</span>}</div>
                <h2>{f.name}</h2>
                <ul className="meta-list">
                  {f.area && <li><Icon name="location-dot" />{f.area}</li>}
                  {f.phone && <li><Icon name="phone" />{f.phone}</li>}
                </ul>
                {f.phone && <a className="btn btn-secondary btn-block" href={"tel:" + f.phone.replace(/\s+/g, "")}><Icon name="phone" />Call {f.type?.toLowerCase() || "facility"}</a>}
              </article>
            ))}
          </div>
          <div className="two-col">
            <section className="card warning-card">
              <header className="card-header">
                <span className="icon-chip tone-danger"><Icon name="truck-medical" /></span>
                <div><h2>When to go straight away</h2><p>Do not wait for your next appointment.</p></div>
              </header>
              <div className="warning-columns">
                <div><h3>In pregnancy</h3><ul className="warning-list">{warningSigns.pregnancy.slice(0, 5).map(sign => <li key={sign}><Icon name="circle-exclamation" />{sign}</li>)}</ul></div>
                <div><h3>In your newborn</h3><ul className="warning-list">{warningSigns.newborn.slice(0, 5).map(sign => <li key={sign}><Icon name="circle-exclamation" />{sign}</li>)}</ul></div>
              </div>
            </section>
            <section className="card">
              <header className="card-header">
                <span className="icon-chip"><Icon name="clipboard-list" /></span>
                <div><h2>Before you go</h2><p>A few things that make your visit easier.</p></div>
              </header>
              <ul className="topic-list">
                <li><Icon name="check" />Call ahead if you can, and say why you are coming</li>
                <li><Icon name="check" />Bring your health card, clinic book and any medicines</li>
                <li><Icon name="check" />Ask someone to come with you, especially in an emergency</li>
                <li><Icon name="check" />Write down your symptoms and when they started</li>
                <li><Icon name="check" />Keep money for transport ready for late pregnancy</li>
              </ul>
              <Link className="card-link" to="/diary">Write your symptoms in your diary<Icon name="arrow-right" /></Link>
            </section>
          </div>
          <p className="source-note"><Icon name="circle-info" />{directory.intro || data.title} Published version {data.version} · Approved {stamp(data.approvedAt)}.</p>
        </div>
      );
    }}</Result>
  );
}

function localDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function DateBadge({ value }) {
  const date = new Date(value);
  return (
    <span className="date-badge" aria-hidden="true">
      <span>{date.toLocaleDateString(undefined, { month: "short" })}</span>
      <strong>{date.getDate()}</strong>
    </span>
  );
}

function Records({ diary = false }) {
  const path = diary ? "/diary/notes" : "/appointments";
  const { userId } = useContext(account);
  const online = useOnline();
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  const queueKey = cacheKey(userId, "pending" + path);
  const remote = useResource(path, { offline: true });
  const consent = useResource("/consents", { offline: true });
  const client = useQueryClient();
  const queued = useQuery({ queryKey: [userId, queueKey], networkMode: "always", queryFn: async () => (await get(queueKey)) || [] });
  const [editing, setEditing] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const storageAllowed = granted(consent.data, "DATA_STORAGE");
  const syncAllowed = storageAllowed && granted(consent.data, "SYNC");
  const drafts = queued.data || [];
  const merged = new Map((remote.data || []).map(row => [row.clientId, row]));
  for (const draft of drafts) merged.set(draft.clientId, { ...merged.get(draft.clientId), ...draft, pending: true });
  const rows = [...merged.values()].filter(row => !row.deleted).sort((a, b) => diary ?
    Date.parse(b.clientUpdatedAt) - Date.parse(a.clientUpdatedAt) : Date.parse(a.dateTime) - Date.parse(b.dateTime));
  const upcoming = diary ? rows : rows.filter(r => Date.parse(r.dateTime) >= now);
  const past = diary ? [] : rows.filter(r => Date.parse(r.dateTime) < now).reverse();
  const dueSoon = rows.filter(r => Date.parse(r.dateTime) >= now && Date.parse(r.dateTime) <= now + 3 * 86400000).length;
  const noun = diary ? "note" : "visit";
  async function refreshQueue() { await client.invalidateQueries({ queryKey: [userId, queueKey] }); }
  function clearForm() { setEditing(null); setFormVersion(v => v + 1); }
  const change = useChange(async ({ row, deleted }) => {
    if (diary || !navigator.onLine || row.pending) {
      if (!storageAllowed) throw new Error("Allow data storage in Account before saving on this device.");
      const draft = { clientId: row.clientId, clientUpdatedAt: new Date().toISOString(), deleted,
        ...(diary ? { text: row.text } : { title: row.title, facility: row.facility, dateTime: row.dateTime }) };
      await update(queueKey, existing => [...(existing || []).filter(item => item.clientId !== row.clientId), draft]);
      await refreshQueue();
      toast.info("Saved on this device", { description: "Pending sync." });
    } else {
      const body = { clientId: row.clientId, title: row.title, facility: row.facility, dateTime: row.dateTime };
      await request(path + (row.id ? "/" + row.id : ""), { method: deleted ? "DELETE" : row.id ? "PUT" : "POST", body: deleted ? undefined : body });
      toast.success(deleted ? "Visit deleted." : "Visit saved to your account.");
    }
    clearForm();
  }, [path], ({ deleted }) => `The ${noun} was not ${deleted ? "deleted" : "saved"}`);
  const sync = useChange(async () => {
    if (!syncAllowed) throw new Error("Allow data storage and sync in Account first.");
    for (const draft of (await get(queueKey)) || []) {
      if (getSession()?.userId !== userId) throw new Error("Sign in to the original account to sync.");
      const reply = await request(diary ? path : path + "/sync", { method: "POST", body: draft });
      if (!["CREATED", "UPDATED", "UNCHANGED", "STALE"].includes(reply.result)) throw new Error(reply.reason || "The server could not accept the entry.");
      await update(queueKey, existing => (existing || []).filter(item => item.clientId !== draft.clientId || item.clientUpdatedAt !== draft.clientUpdatedAt));
      await refreshQueue();
      await client.invalidateQueries({ queryKey: [userId, path] });
    }
    toast.success("Sync complete.", { description: "Your account has the latest accepted entries." });
  }, [path], "Sync did not finish");
  function submit(e) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    if (!diary) fields.dateTime = new Date(fields.dateTime).toISOString();
    change.mutate({ row: { ...editing, clientId: editing?.clientId || crypto.randomUUID(), ...fields }, deleted: false });
  }
  async function remove(row) {
    const yes = await confirm({
      title: `Delete this ${noun}?`,
      description: diary ? "The note will be removed from this device and, after sync, from your account." : `“${row.title}” will be removed from your visits.`,
      confirmLabel: "Delete", cancelLabel: "Keep it",
    });
    if (yes) change.mutate({ row, deleted: true });
  }
  function edit(row) {
    setEditing(row);
    document.querySelector(".record-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderRow(row) {
    return (
      <article key={row.clientId} className={`record ${diary ? "record-note" : ""}`}>
        {diary ? <span className="row-icon"><Icon name="feather" /></span> : <DateBadge value={row.dateTime} />}
        <div className="record-body">
          {diary ? <>
            <div className="record-meta"><time>{stamp(row.clientUpdatedAt)}</time>{row.pending && <span className="chip chip-warn">Pending sync</span>}</div>
            <p className="note-text">{row.text}</p>
          </> : <>
            <h3>{row.title}</h3>
            <p className="record-meta"><span><Icon name="clock" />{longDate(row.dateTime)} · {shortTime(row.dateTime)}</span>
              <span><Icon name="location-dot" />{row.facility || "Facility not set"}</span></p>
            {row.pending ? <span className="chip chip-warn">Pending sync</span> : <span className="chip chip-muted">Account record</span>}
          </>}
        </div>
        <div className="record-actions">
          <Button className="btn btn-icon" aria-label={`Edit ${noun}`} onClick={() => edit(row)}><Icon name="pen" /></Button>
          <Button className="btn btn-icon btn-icon-danger" aria-label={`Delete ${noun}`} disabled={change.isPending || sync.isPending} onClick={() => remove(row)}><Icon name="trash-can" /></Button>
        </div>
      </article>
    );
  }
  return (
    <div className="records">
      <aside className="records-side">
        <section className="card status-card">
          <div className="status-row">
            <span className={`dot ${online ? "is-online" : ""}`} />
            <span>{online ? "Online" : "Offline"}</span>
            <span className="status-sep" />
            <span>{drafts.length} pending {drafts.length === 1 ? "change" : "changes"}</span>
          </div>
          <p>{diary ? "Notes stay on this device until you choose to sync them with your account." : `${plural(dueSoon, "visit")} due in the next three days.`}</p>
          {drafts.length > 0 && <div className="form-actions">
            <Button className="btn btn-secondary" disabled={!online || !syncAllowed || sync.isPending} onClick={() => sync.mutate()}><Icon name="arrows-rotate" />Sync pending changes</Button>
            {!syncAllowed && <Link to="/account">Manage consent</Link>}
          </div>}
        </section>

        <form key={formVersion + ":" + (editing?.clientId || "new")} className="card form-card record-form" onSubmit={submit}>
          <header className="card-header">
            <span className="icon-chip"><Icon name={diary ? "pen-to-square" : "calendar-plus"} /></span>
            <div><h2>{editing ? `Edit ${noun}` : diary ? "Write a note" : "Schedule a visit"}</h2>
              <p>{diary ? "Symptoms, feelings or questions for your care team." : "Add a clinic visit to get a reminder."}</p></div>
          </header>
          {diary ? (
            <Field><FieldLabel>Note or question</FieldLabel><Textarea name="text" defaultValue={editing?.text} required maxLength="5000" rows="5" placeholder="What would you like to remember?" /></Field>
          ) : <>
            <Field><FieldLabel>Purpose of visit</FieldLabel><Input name="title" required maxLength="200" defaultValue={editing?.title} placeholder="e.g. Antenatal check-up" /></Field>
            <Field><FieldLabel>Clinic or facility</FieldLabel><Input name="facility" maxLength="200" defaultValue={editing?.facility} placeholder="Optional" /></Field>
            <Field><FieldLabel>Date and time</FieldLabel><Input type="datetime-local" name="dateTime" required defaultValue={localDateTime(editing?.dateTime)} /></Field>
          </>}
          {!storageAllowed && <ConsentNotice>Allow data storage to save {noun}s.</ConsentNotice>}
          <div className="form-actions">
            <Button className="btn btn-primary" type="submit" disabled={!storageAllowed || change.isPending}>{diary ? "Save note" : "Save visit"}</Button>
            {editing && <Button className="btn btn-ghost" type="button" onClick={clearForm}>Cancel edit</Button>}
          </div>
        </form>
        <section className="card tips-card">
          <h2 className="aside-title">{diary ? "Ideas to write about" : "Questions to ask at your visit"}</h2>
          <ul className="prompt-list">
            {(diary ? diaryPrompts : visitQuestions).map(item => <li key={item}><Icon name={diary ? "feather" : "circle-question"} />{item}</li>)}
          </ul>
        </section>
      </aside>

      <section className="records-main">
        <Feedback task={consent} /><Feedback task={remote} /><Feedback task={queued} />
        <div className="section-title"><h2>{diary ? "Your entries" : "Upcoming visits"}</h2><span className="count">{upcoming.length}</span></div>
        {remote.isPending ? <div className="card"><Skeleton /></div> :
          !remote.isError && !upcoming.length ? (
            <EmptyState icon={diary ? "feather" : "calendar"} title={diary ? "No diary entries yet" : "No visits scheduled"}>
              {diary ? "Your first note will appear here." : "Use the form to add your next clinic visit."}
            </EmptyState>
          ) : <div className="record-list">{upcoming.map(renderRow)}</div>}
        {past.length > 0 && <>
          <div className="section-title"><h2>Past visits</h2><span className="count">{past.length}</span></div>
          <div className="record-list is-past">{past.map(renderRow)}</div>
        </>}
      </section>
    </div>
  );
}

function SettingRow({ title, description, checked, disabled, onChange }) {
  return (
    <label className="setting-row">
      <span className="setting-copy"><strong>{title}</strong><small>{description}</small></span>
      <Switch className="switch" checked={checked} disabled={disabled} onCheckedChange={onChange}><SwitchThumb className="switch-thumb" /></Switch>
    </label>
  );
}

function AccountPage({ signOut }) {
  const user = useContext(account);
  const consents = useResource("/consents", { offline: true });
  const save = useChange(async body => {
    await request("/consents", { method: "POST", body });
    if (body.type === "DATA_STORAGE" && !body.granted) await clearAccountCache(user.userId, false);
  }, ["/consents"], "Your privacy setting was not changed");
  const remove = useChange(async () => {
    await request("/account", { method: "DELETE" });
    try { await clearAccountCache(user.userId, true); } finally { signOut(); }
  }, [], "Your account was not deleted");
  const exportData = useChange(async () => {
    const data = await request("/account/export");
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "maternacare-account.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Export ready", { description: "maternacare-account.json was downloaded." });
  }, [], "Your data could not be exported");
  async function deleteAccount() {
    const yes = await confirm({
      title: "Delete your account permanently?",
      description: "This deletes your account, visits, diary and learning progress. It cannot be undone.",
      confirmLabel: "Delete account", cancelLabel: "Cancel",
    });
    if (yes) remove.mutate();
  }
  return (
    <div className="account-layout">
    <div className="settings">
      <section className="card profile-card">
        <Avatar className="avatar avatar-lg"><AvatarFallback>{initials(user.fullName)}</AvatarFallback></Avatar>
        <div className="profile-copy">
          <h2>{user.fullName}</h2>
          <p>{user.email}</p>
          <span className="chip chip-muted">{user.role === "REVIEWER" ? "Content reviewer" : "Member"}</span>
        </div>
        <div className="profile-actions">
          {user.role === "REVIEWER" && <Link className="btn btn-ghost" to="/review"><Icon name="clipboard-check" />Review content</Link>}
          <Button className="btn btn-secondary" onClick={signOut}>Sign out</Button>
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <span className="icon-chip"><Icon name="shield-halved" /></span>
          <div><h2>Privacy choices</h2><p>You decide what is stored. You can change these at any time.</p></div>
        </header>
        <Result query={consents}>{choices => (
          <div className="setting-list">
            <SettingRow title="Store personal records" description="Keep your timeline, visits and notes in your account and on this device."
              checked={granted(choices, "DATA_STORAGE")} disabled={save.isPending} onChange={value => save.mutate({ type: "DATA_STORAGE", granted: value })} />
            <SettingRow title="Allow sync" description="Upload entries saved on this device when you are back online."
              checked={granted(choices, "SYNC")} disabled={save.isPending} onChange={value => save.mutate({ type: "SYNC", granted: value })} />
          </div>
        )}</Result>
      </section>

      <section className="card">
        <header className="card-header">
          <span className="icon-chip"><Icon name="file-export" /></span>
          <div><h2>Your data</h2><p>Download a copy of everything stored in your account.</p></div>
        </header>
        <div className="form-actions"><Button className="btn btn-secondary" disabled={exportData.isPending} onClick={() => exportData.mutate()}><Icon name="download" />Export my data</Button></div>
      </section>

      <section className="card danger-card">
        <header className="card-header">
          <span className="icon-chip tone-danger"><Icon name="triangle-exclamation" /></span>
          <div><h2>Delete account</h2><p>Permanently deletes your account, visits, diary and learning progress.</p></div>
        </header>
        <div className="form-actions"><Button className="btn btn-danger" disabled={remove.isPending} onClick={deleteAccount}>Delete my account permanently</Button></div>
      </section>
    </div>
    <AccountSummary />
    </div>
  );
}

function AccountSummary() {
  const visits = useResource("/appointments", { offline: true });
  const notes = useResource("/diary/notes", { offline: true });
  const progress = useResource("/progress", { offline: true });
  const timeline = useResource("/timeline", { optional: true, offline: true });
  const count = query => query.isPending ? "…" : query.isError ? "–" : query.data?.length ?? 0;
  return (
    <aside className="account-aside">
      <section className="card">
        <h2 className="aside-title">Your records</h2>
        <dl className="facts">
          <div><dt><Icon name="calendar-days" />Visits</dt><dd>{count(visits)}</dd></div>
          <div><dt><Icon name="pen-to-square" />Diary notes</dt><dd>{count(notes)}</dd></div>
          <div><dt><Icon name="graduation-cap" />Lessons completed</dt><dd>{progress.data ? progress.data.filter(r => r.completed).length : "…"}</dd></div>
          <div><dt><Icon name="baby" />Stage</dt><dd>{timeline.data ? stages[timeline.data.stage] : "Not set"}</dd></div>
        </dl>
      </section>
      <section className="card guide-card">
        <h2>How we protect your information</h2>
        <ul className="guide-list">
          <li><Icon name="lock" /><span>Your records are private to your account.</span></li>
          <li><Icon name="toggle-on" /><span>Nothing personal is stored until you turn on data storage.</span></li>
          <li><Icon name="cloud-arrow-up" /><span>Entries made offline only upload when you allow sync.</span></li>
          <li><Icon name="file-export" /><span>You can export or delete all your data at any time.</span></li>
        </ul>
      </section>
      <section className="card">
        <h2 className="aside-title">Need help?</h2>
        <ul className="list">
          <li><Link className="list-row" to="/facilities"><span className="row-icon"><Icon name="hospital" /></span><span className="row-body"><strong>Where to get care</strong><small>Facility contacts and urgent help</small></span><Icon name="chevron-right" className="row-chevron" /></Link></li>
          <li><Link className="list-row" to="/learn"><span className="row-icon"><Icon name="book-open-reader" /></span><span className="row-body"><strong>Learning library</strong><small>Lessons and quick guides</small></span><Icon name="chevron-right" className="row-chevron" /></Link></li>
        </ul>
      </section>
    </aside>
  );
}

function ReviewEditor({ record }) {
  const client = useQueryClient();
  const save = useChange(async body => { await request("/review/content", { method: "POST", body }); toast.success("Draft created."); }, ["/review/content"], "The draft was not saved");
  const approve = useChange(async () => {
    await request("/review/content/" + record.id + "/approve", { method: "POST" });
    await client.invalidateQueries();
    toast.success("Version approved.");
  }, ["/review/content"], "The version was not approved");
  return (
    <form className="review-form" onSubmit={e => {
      e.preventDefault(); const form = new FormData(e.currentTarget);
      save.mutate({ contentType: record.contentType, moduleId: record.moduleId, title: form.get("title"), body: form.get("body"), quiz: record.contentType === "LESSON" ? parseQuiz(record.quiz) : [] });
    }}>
      <Field><FieldLabel>Title</FieldLabel><Input name="title" defaultValue={record.title} required maxLength="200" /></Field>
      <Field><FieldLabel>Content</FieldLabel><Textarea name="body" defaultValue={record.body} required maxLength="20000" rows="8" /></Field>
      <div className="form-actions">
        <Button className="btn btn-secondary" type="submit" disabled={save.isPending}>Save as new draft</Button>
        {record.status === "DRAFT" && <Button className="btn btn-primary" type="button" disabled={approve.isPending} onClick={() => approve.mutate()}>Approve saved version</Button>}
      </div>
    </form>
  );
}

function Review() {
  const versions = useResource("/review/content");
  return (
    <Result query={versions}>{rows => (
      <div className="review-list">
        {rows.map(row => (
          <details key={row.id} className="card review-item">
            <summary>
              <span className="icon-chip"><Icon name={row.contentType === "LESSON" ? "book-open" : "hospital"} /></span>
              <span className="row-body"><strong>{row.title}</strong><small>{row.contentType === "LESSON" ? "Lesson" : "Directory"} · Version {row.version}</small></span>
              <span className={`chip chip-caps ${row.status === "APPROVED" ? "chip-success" : "chip-warn"}`}>{row.status.toLowerCase()}</span>
              <Icon name="chevron-down" className="row-chevron" />
            </summary>
            <ReviewEditor record={row} />
          </details>
        ))}
      </div>
    )}</Result>
  );
}

function AccountMenu({ user, signOut }) {
  const navigate = useNavigate();
  return (
    <Menu onAction={value => value === "sign-out" ? signOut() : navigate(value)}>
      <MenuTrigger className="account-trigger" aria-label="Account menu">
        <Avatar className="avatar"><AvatarFallback>{initials(user.fullName)}</AvatarFallback></Avatar>
        <span className="account-name">{user.fullName?.split(" ")[0]}</span>
        <Icon name="chevron-down" className="account-chevron" />
      </MenuTrigger>
      <MenuContent className="menu-content" align="end" sideOffset={8}>
        <div className="menu-heading"><strong>{user.fullName}</strong><small>{user.email}</small></div>
        <MenuSeparator className="menu-separator" />
        <MenuItem value="/account" className="menu-item"><Icon name="user-shield" />Account & privacy</MenuItem>
        {user.role === "REVIEWER" && <MenuItem value="/review" className="menu-item"><Icon name="clipboard-check" />Content review</MenuItem>}
        <MenuSeparator className="menu-separator" />
        <MenuItem value="sign-out" className="menu-item"><Icon name="arrow-right-from-bracket" />Sign out</MenuItem>
      </MenuContent>
    </Menu>
  );
}

function Workspace({ user, signOut }) {
  const { pathname } = useLocation();
  const page = [...destinations, ...secondaryPages].find(item => matchPath(item.path, pathname)) || destinations[0];
  const online = useOnline();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); document.title = page.title + " | MaternaCare"; }, [page.title]);
  return (
    <account.Provider value={user}>
      <div className="app">
        <header className="topbar">
          <div className="container topbar-inner">
            <Link className="brand" to="/"><span className="brand-mark"><Icon name="heart-pulse" /></span>MaternaCare</Link>
            <div className="topbar-end">
              {!online && <span className="chip chip-warn" role="status"><Icon name="wifi" />Offline</span>}
              <AccountMenu user={user} signOut={signOut} />
            </div>
          </div>
        </header>
        <main className="container page">
          {!online && <p className="alert alert-info offline-banner"><Icon name="cloud" />You are offline. Showing information saved on this device.</p>}
          {page.path !== "/" && <PageHeader page={page} />}
          <PageBoundary key={pathname}>
          <Routes>
            <Route path="/" element={<Journey />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/appointments" element={<Records key="visits" />} />
            <Route path="/diary" element={<Records key="diary" diary />} />
            <Route path="/facilities" element={<Support />} />
            <Route path="/account" element={<AccountPage signOut={signOut} />} />
            {user.role === "REVIEWER" && <Route path="/review" element={<Review />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </PageBoundary>
          <footer className="site-footer">
            <span><Icon name="circle-info" />MaternaCare provides education only and does not diagnose. In an emergency, contact a health facility right away.</span>
            <span className="credits"><Icon name="camera" />{photoCredits}</span>
          </footer>
        </main>
        <NavigationDock />
      </div>
    </account.Provider>
  );
}

class PageBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="card crash-card" role="alert">
        <span className="empty-icon tone-danger-soft"><Icon name="triangle-exclamation" /></span>
        <h2>This page ran into a problem</h2>
        <p>Your saved information is safe. Reload the page, or go back to the home page.</p>
        <div className="form-actions">
          <Button className="btn btn-primary" onClick={() => window.location.reload()}><Icon name="rotate-right" />Reload page</Button>
          <a className="btn btn-secondary" href="/">Go to home</a>
        </div>
      </section>
    );
  }
}

const toastIcons = { success: "circle-check", error: "circle-exclamation", warning: "triangle-exclamation", info: "circle-info", loading: "spinner" };

function ToastItem(item) {
  const type = item.type || "default";
  return (
    <Toast className="toast">
      <span className="toast-icon" data-tone={type}><Icon name={toastIcons[type] || "bell"} className={type === "loading" ? "fa-spin" : ""} /></span>
      <div className="toast-copy"><ToastTitle className="toast-title" /><ToastDescription className="toast-description" /></div>
      <ToastClose className="toast-close" aria-label="Dismiss notification"><Icon name="xmark" /></ToastClose>
    </Toast>
  );
}

function notifyError(title, error) {
  toast.error(title, { description: error?.message || "Please try again.", duration: 8000 });
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 15000 }, mutations: { retry: false } },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data === undefined || error.status === 401 || (error.network && !navigator.onLine)) return;
        toast.error("Could not refresh", { id: "refresh-error", description: error.message, duration: 8000 });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, _context, mutation) => {
        if (mutation.meta?.inline || error.status === 401) return;
        const title = mutation.meta?.errorTitle;
        notifyError(typeof title === "function" ? title(variables) : title || "Something went wrong", error);
      },
    }),
  });
}

function useConnectionNotices() {
  useEffect(() => {
    const offline = () => toast.warning("You are offline", { id: "connection", description: "Showing information saved on this device. Changes you allow will sync later.", duration: Infinity });
    const online = () => toast.success("Back online", { id: "connection", description: "You can sync any changes saved on this device.", duration: 4000 });
    window.addEventListener("offline", offline); window.addEventListener("online", online);
    return () => { window.removeEventListener("offline", offline); window.removeEventListener("online", online); };
  }, []);
}

export default function App() {
  const [user, setUser] = useState(getSession);
  const [expired, setExpired] = useState(false);
  const [client] = useState(createClient);
  useConnectionNotices();
  const navigate = useNavigate();
  useEffect(() => {
    const expire = () => { sessionStorage.removeItem(sessionKey); client.clear(); setUser(null); setExpired(true); toast.info("Your session has ended", { id: "session", description: "Sign in again to continue where you left off." }); };
    window.addEventListener("materna-session-expired", expire);
    return () => window.removeEventListener("materna-session-expired", expire);
  }, [client]);
  function enter(session) {
    client.clear(); sessionStorage.setItem(sessionKey, JSON.stringify(session)); setExpired(false); setUser(session);
  }
  function signOut() {
    sessionStorage.removeItem(sessionKey); client.clear(); setUser(null); setExpired(false); navigate("/", { replace: true });
  }
  return (
    <QueryClientProvider client={client}>
      {user ? <Workspace key={user.userId} user={user} signOut={signOut} /> : expired ? <Welcome enter={enter} expired /> : (
        <Routes>
          <Route path="/" element={<Landing enter={enter} />} />
          <Route path="/signin" element={<Welcome enter={enter} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      <OverlayHost toast={{ side: "top", align: "center", children: ToastItem }} />
    </QueryClientProvider>
  );
}
