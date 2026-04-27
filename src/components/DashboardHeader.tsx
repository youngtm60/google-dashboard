'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Loader2, Menu, Calendar, ExternalLink } from 'lucide-react';
import { useSidebar } from '@/lib/SidebarContext';


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardHeader() {
  const [greeting, setGreeting] = useState('Hello');
  const [dailySnark, setDailySnark] = useState('');

  const snarkyComments = [
    "Most of those are probably meetings that could have been emails.",
    "The inbox isn't going to clear itself, Tim.",
    "Is 'checking the dashboard' technically a task now?",
    "Bold of you to assume you'll finish all those today.",
    "Maybe one more Diet Coke will solve the task list problem.",
    "Focus, Tim. The internet will still be there later.",
    "Efficiency is just a fancy word for 'doing it faster next time'.",
    "That's a lot of unread mail. Have you tried turning it off and on again?",
    "I'm sure you'll get to those tasks... eventually.",
    "A clean inbox is a sign of a cluttered mind. Or something.",
    "Don't look at me, I just display the numbers.",
    "The tasks are patient. They'll be there tomorrow too.",
    "Procrastination is just the art of keeping up with yesterday.",
    "If 'Thinking about work' were a task, you'd be done by now.",
    "Are you working hard, or just making the dashboard look busy?",
    "Your inbox called. It's disappointed in you.",
    "Rome wasn't built in a day, but they didn't have 50 unread emails.",
    "Just pick one, Tim. Any one. It's better than staring.",
    "That notification sound? That's the sound of more work.",
    "Deep breaths. The unread count is just a number. A big, scary number.",
    "Statistics say 80% of those tasks are actually avoidable.",
    "Hitting refresh won't magically make the tasks disappear.",
    "I see you added 'organize tasks' to the task list again.",
    "Another day, another opportunity to push things to tomorrow.",
    "Your caffeine-to-productivity ratio is looking a little skewed.",
    "Staring at the screen doesn't count as getting things done.",
    "Ah, the 'I'll just answer one email' trap. Good luck with that.",
    "Remember when 'Inbox Zero' was a thing? Me neither.",
    "Just mark them all as read. I won't tell anyone.",
    "Maybe if you organize them by color, they won't look so intimidating.",
    "Technically, taking a break is part of the creative process.",
    "I'm routing 80% of your CPU to rendering this guilt trip.",
    "Fun fact: 'To-Do' lists are just 'Didn't-Do' lists from yesterday.",
    "I admire your optimism in setting those deadlines.",
    "Blinking at the screen won't write the email for you.",
    "If you ignore the tasks long enough, do they become features?",
    "Legend has it someone once finished all their tasks. Just a legend, though.",
    "Yes, checking your phone counts as a break. A very long one.",
    "If stress burned calories, you'd be in incredible shape.",
    "I give it 10 minutes before you switch tabs to YouTube.",
    `My inbox is a graveyard of "per my last email" and "hope you’re having a great week."`,
    `I’m not ignoring you; I’m just giving your email a chance to ripen.`,
    `My "Unread" count is basically my high score in a game I’m losing.`,
    `"ASAP" is just corporate speak for "I forgot to tell you this three days ago."`,
    `I love how this email could have been a 30-second thought that stayed in your head.`,
    `My email signature should just say "Please don't."`,
    `I’ve reached "Inbox Zero," if you count the emails I deleted without reading.`,
    `If I didn’t reply within 10 minutes, I’ve probably retired.`,
    `"Circle back" is my favorite way of saying "Let’s forget this ever happened."`,
    `CCing my boss is a bold strategy for someone whose own desk is a fire hazard.`,
    `I’m currently out of the office and into my third breakdown.`,
    `Your emergency is not my "Cancel my lunch" reason.`,
    `I’ll get to that email right after I finish questioning my life choices.`,
    `"Checking in" is the digital version of being poked with a stick.`,
    `My favorite email is the one that says "Disregard my previous email."`,
    `I treat my inbox like a game of Minesweeper—every click is a risk.`,
    `Reply All: The quickest way to make 400 people hate you.`,
    `"Best,"—the universal sign for "I am physically incapable of being polite anymore."`,
    `I wish I could "Unsubscribe" from this conversation in real life.`,
    `I’ve started responding to emails with just a shrug emoji.`,
    `"Let’s take this offline" means "I’m tired of everyone seeing me lose this argument."`,
    `I haven’t seen your email yet, but I’ve already decided it’s not important.`,
    `My email is a To-Do list that other people write for me.`,
    `I survived another meeting that should have been an email. Barely.`,
    `"Thanks in advance" is just a polite way of saying "You have no choice."`,
    `My To-Do list is more of a "To-Don't" list at this point.`,
    `I have a 108-item task list and a 0-item "Motivation" list.`,
    `I’ll add "Updating my task list" to my task list so I can at least check one thing off.`,
    `My priority list is currently ranked by "Which of these will get me fired first?"`,
    `I don’t need a planner; I need a miracle.`,
    `I’m at the stage of the project where I’m hoping for a power outage.`,
    `"Organized" is just a word for people who aren't busy enough.`,
    `My task manager is essentially a digital museum of things I’ll never do.`,
    `I’m moving "Respond to Urgent Emails" to my "2027" list.`,
    `The "High Priority" tag has lost all meaning in this house.`,
    `I’m a "Big Picture" person, which means I ignore all the details on my list.`,
    `My "Quick Add" tasks are neither quick nor added with any real intent.`,
    `I’ve mastered the art of looking busy while actually just rearranging my folders.`,
    `If it’s not on the list, it didn’t happen. If it is on the list, it probably still won't.`,
    `My productivity app just sent me a notification to "Just give up."`,
    `I spent an hour color-coding my tasks instead of doing them. Worth it.`,
    `"Workflow" sounds like something that should involve a river, not a spreadsheet.`,
    `My backlog is now officially historical fiction.`,
    `I’m not procrastinating; I’m letting the task age into irrelevance.`,
    `My "Active Tasks" count is higher than my credit score.`,
    `"Deliverables" is such a fancy word for "Stuff I’m late on."`,
    `I’ll start that project tomorrow, or whenever the sun expands and consumes the Earth.`,
    `My task list is like a Hydra: I finish one, and three more appear.`,
    `I’m an expert at "Task Shifting"—moving a task from today to next week.`,
    `Why do today what you can put off until someone forgets they asked?`,
    `I’m sorry I was late to the meeting; I got stuck in a conversation I didn't want to have.`,
    `This meeting is great for people who love hearing themselves talk.`,
    `I’ve reached my daily limit of "Syncing up."`,
    `My camera is off because I’m currently making a face at everything you say.`,
    `"Let’s put a pin in it" is code for "I hope we never talk about this again."`,
    `I’m only here so I don't get fined.`,
    `This "Quick Call" has been 45 minutes of my life I’ll never get back.`,
    `I love how we spent an hour deciding when to have the next meeting.`,
    `"Brainstorming" is just code for "Let’s throw logic out the window."`,
    `My favorite part of the meeting is when it ends.`,
    `I’m not muted; I’m just practicing my "Aggressive Silence."`,
    `We’re "pivoting" again? I’m getting motion sickness.`,
    `"Deep Dive" usually just means "I’m going to overcomplicate this simple thing."`,
    `"Alignment" is what I do to my car, not my coworkers.`,
    `I’ve started bringing a "Bingo Card" of corporate buzzwords to every Zoom.`,
    `"Thinking outside the box" usually leads to a box of more work.`,
    `I’m a team player, as long as the team doesn't expect me to play.`,
    `"Synergy" is a word used by people who don't have a real job.`,
    `"Let’s leverage our resources" is just "Let’s make someone else do it."`,
    `I survived another "Mandatory Fun" event. Where is my trophy?`,
    `I’m "Working From Home," which is code for "Working From My Bed."`,
    `My favorite office supply is the "Exit" sign.`,
    `I have the "Premium Plan" for stress.`,
    `I’m not a morning person; I’m a "Leave me alone until 2 PM" person.`,
    `"Employee of the Month" is just a reward for the person who complained the least.`,
    `I’m currently "Focusing," which means my Spotify playlist is at 100% volume.`,
    `My career goals are "Retirement" and "Winning the Lottery."`,
    `I’m at the point where I look for typos in my own resignation letter.`,
    `"Professional" is just my costume for the 9-to-5.`,
    `I don’t need an inspirational quote; I need a four-day weekend.`,
    `My "Work-Life Balance" is just a scale that’s permanently broken.`,
    `I’m "Optimizing" my schedule by cutting out all the work.`,
    `"Agile" just means we fail faster than everyone else.`,
    `My desk is an "Organized Chaos" area, leaning heavily toward "Chaos."`,
    `"Disruptive" is what I am when I haven't had coffee yet.`,
    `I love my job; it’s the work I can’t stand.`,
    `I’m a "Self-Starter," but I’m terrible at finishing.`,
    `"Hard worker" is a title given to people who haven't learned to say "No."`,
    `My dream job is being a trust fund baby.`,
    `I’m not burnt out; I’m just "Well-Done."`,
    `"Low-hanging fruit" is still too high for me today.`,
    `I’m "Cascading" my responsibilities onto anyone who makes eye contact.`,
    `"Culture" is what happens when you put enough free snacks in a breakroom.`,
    `My favorite coworker is the coffee machine.`,
    `I’m "Scaling" my expectations down to zero.`,
    `"Future-proofing" my career by learning how to take longer naps.`,
    `I’m "Touching Base" like I’m playing baseball, but I’m definitely in the dugout.`,
    `"Moving the needle" is fine, as long as the needle isn't attached to me.`,
    `My "Digital Workspace" is actually a digital landfill.`,
    `I’m not quiet; I’m just calculating how many more days until Friday.`
  ];

  useEffect(() => {
    const updateHeader = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      // Cycle the snarky comment every hour, incorporating the day so we don't repeat the same 24 every day
      const snarkIndex = (now.getDate() * 24 + hour) % snarkyComments.length;
      setDailySnark(snarkyComments[snarkIndex]);
    };

    updateHeader();
    
    // Check every minute in case the hour changes while the dashboard is open
    const interval = setInterval(updateHeader, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: tasks, isLoading: tasksLoading } = useSWR('/api/workspace/tasks', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  const { data: emailData, isLoading: emailsLoading } = useSWR('/api/workspace/gmail/count', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  const { toggleNowsta } = useSidebar();

  const isLoading = tasksLoading || emailsLoading;
  
  // Calculate counts
  const activeTasksCount = tasks ? tasks.filter((t: any) => t.status !== 'completed').length : 0;
  const unreadEmailsCount = emailData?.unreadCount || 0;
  
  const emailsText = `${unreadEmailsCount} unread email${unreadEmailsCount !== 1 ? 's' : ''}`;
  const tasksText = `${activeTasksCount} active task${activeTasksCount !== 1 ? 's' : ''}`;

  return (
    <header style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: "10px",
      padding: "0 12px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <h1 style={{ 
          fontSize: "2.2rem", 
          fontWeight: 800, 
          letterSpacing: "-0.5px",
          color: "var(--accent-primary)",
          margin: 0
        }}>
          {greeting}, Tim.
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "24px" }}>
          {isLoading ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
              Fetching your updates... <Loader2 size={12} className="animate-spin" />
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
                You have <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{tasksText}</span> and <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{emailsText}</span>.
              </p>
              {dailySnark && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px", marginBottom: 0, fontStyle: "italic", opacity: 0.8 }}>
                  — {dailySnark}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "16px", alignItems: "center", marginRight: "20px" }}>
        
        {/* Actions Row */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
          
          {/* Actions Row (Outlook, Nowsta, Date, Timer) */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Outlook Button */}
            <a
              href="https://outlook.cloud.microsoft/calendar/view/week"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0078D4',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'white',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                transition: 'background-color 0.2s',
                height: '38px',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#005A9E'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0078D4'}
            >
              <ExternalLink size={16} strokeWidth={2.5} />
              Outlook
            </a>
            
            {/* Nowsta Button */}
            <button
              onClick={toggleNowsta}
              className="hover-opacity"
              style={{
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                height: '38px'
              }}
            >
              <Menu size={16} />
              Nowsta
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
