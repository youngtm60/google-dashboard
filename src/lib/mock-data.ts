export const MOCK_EMAILS = [
  {
    id: "1",
    threadId: "t1",
    from: "Alex Rivera",
    subject: "Q2 Strategy Feedback",
    snippet: "I've reviewed the latest strategy deck and have a few suggestions regarding the growth targets for next quarter...",
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    isUnread: true,
  },
  {
    id: "2",
    threadId: "t2",
    from: "Google Cloud",
    subject: "Monthly Usage Report",
    snippet: "Your monthly usage report for Project Workspace-Dash-772 is now available. Click here to view the breakdown...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isUnread: true,
  },
  {
    id: "3",
    threadId: "t3",
    from: "Design Team",
    subject: "New Brand Assets",
    snippet: "Hey team, we've just uploaded the new glassmorphism icons and gradients to the shared drive. Let us know...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isUnread: false,
  },
];

export const MOCK_TASKS = [
  {
    id: "t1",
    title: "Finish Glassmorphic Dashboard UI",
    status: "needsAction",
    due: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Review Google API quotas",
    status: "needsAction",
    due: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Sync with marketing on launch",
    status: "completed",
    due: new Date().toISOString(),
  },
];

export const MOCK_FILES = [
  {
    id: "f1",
    name: "Dashboard Specs 2026.pdf",
    mimeType: "application/pdf",
    modifiedTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    size: "2.4 MB",
  },
  {
    id: "f2",
    name: "Logo_Exploration.ai",
    mimeType: "application/illustrator",
    modifiedTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    size: "15 MB",
  },
  {
    id: "f3",
    name: "Q1 Results.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    modifiedTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    size: "450 KB",
  },
];

export const MOCK_NOTION_PAGES = [
  {
    id: 'notion-1',
    title: 'Q2 Project Roadmap',
    notebook: 'Personal',
    lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    url: 'https://notion.so/roadmap',
    icon: '🚀'
  },
  {
    id: 'notion-2',
    title: 'Differential Equations Study Guide',
    notebook: 'BYU Notes',
    lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: 'https://notion.so/byu-calculus',
    icon: '📝'
  },
  {
    id: 'notion-3',
    title: 'Summer Internship Applications',
    notebook: 'Personal',
    lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    url: 'https://notion.so/internships',
    icon: '💼'
  }
];

export const MOCK_CALENDAR_EVENTS = [
  {
    id: "c1",
    summary: "Q2 Product Roadmap Alignment",
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString() }, // In 2 hours
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString() },
    location: "Google Meet",
    hangoutLink: "https://meet.google.com/abc-defg-hij",
    description: "Finalizing the glassmorphism design tokens and API limits for the dashboard launch.",
  },
  {
    id: "c2",
    summary: "Nebula Sync with Design Team",
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() }, // Tomorrow
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString() },
    location: "Studio 4B",
    description: "Reviewing the new icon sets and the Today scratchpad implementation.",
  },
  {
    id: "c3",
    summary: "Weekly Strategy Review",
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString() }, // In 2 days
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 60 * 49).toISOString() },
    location: "Google Meet",
    hangoutLink: "https://meet.google.com/xyz-pdqr-stuv",
  },
];
