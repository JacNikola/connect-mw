import type { AppState, Community, Employee, EventItem } from './types';

// All data in this file is FICTIONAL and exists only to demonstrate the prototype.

export const INTEREST_GROUPS: { name: string; emoji: string; items: string[] }[] = [
  { name: 'Sports & Fitness', emoji: '🏸', items: ['Badminton', 'Cricket', 'Football', 'Table Tennis', 'Running', 'Cycling', 'Yoga', 'Fitness', 'Swimming'] },
  { name: 'Outdoors & Travel', emoji: '🥾', items: ['Trekking', 'Travel', 'Camping', 'Bird Watching'] },
  { name: 'Arts & Creativity', emoji: '🎨', items: ['Photography', 'Music', 'Guitar', 'Singing', 'Painting', 'Writing', 'Dance'] },
  { name: 'Tech & Games', emoji: '🎮', items: ['Technology', 'AI & ML', 'Robotics', 'Open Source', 'Gaming', 'Board Games', 'Chess'] },
  { name: 'Food & Lifestyle', emoji: '☕', items: ['Cooking', 'Baking', 'Coffee', 'Gardening', 'Reading', 'Movies', 'Podcasts', 'Languages', 'Volunteering'] },
];
export const ALL_INTERESTS = INTEREST_GROUPS.flatMap((g) => g.items);
export const INTEREST_EMOJI: Record<string, string> = {
  Badminton: '🏸', Cricket: '🏏', Football: '⚽', 'Table Tennis': '🏓', Running: '🏃', Cycling: '🚴', Yoga: '🧘', Fitness: '💪', Swimming: '🏊',
  Trekking: '🥾', Travel: '✈️', Camping: '🏕️', 'Bird Watching': '🐦',
  Photography: '📷', Music: '🎵', Guitar: '🎸', Singing: '🎤', Painting: '🎨', Writing: '✍️', Dance: '💃',
  Technology: '💡', 'AI & ML': '🤖', Robotics: '🦾', 'Open Source': '🧩', Gaming: '🎮', 'Board Games': '🎲', Chess: '♟️',
  Cooking: '🍳', Baking: '🧁', Coffee: '☕', Gardening: '🌱', Reading: '📚', Movies: '🎬', Podcasts: '🎧', Languages: '🗣️', Volunteering: '🤝',
};

export const DEPARTMENTS = [
  'Engineering Development', 'Application Engineering', 'Quality Engineering', 'Technical Support', 'Training Services',
  'Documentation', 'Consulting', 'Sales', 'Marketing', 'Finance', 'People & Culture', 'IT Services',
];
export const LOCATIONS = ['Bangalore', 'Hyderabad', 'Natick', 'Cambridge (UK)', 'Munich', 'Tokyo', 'Remote – India'];

const e = (
  id: string, name: string, title: string, department: string, team: string, location: string,
  interests: string[], bio: string, joined: number, hue: number,
): Employee => ({ id, name, title, department, team, location, interests, bio, joined, hue });

export const EMPLOYEES: Employee[] = [
  e('neha', 'Neha Kulkarni', 'Application Engineer', 'Application Engineering', 'Automotive AE', 'Bangalore', ['Badminton', 'Trekking', 'Photography', 'Coffee', 'Travel'], 'Helping automotive customers adopt Model-Based Design. Weekend trekker, weekday badminton regular, always up for filter coffee.', 2019, 200),
  e('rahul', 'Rahul Iyer', 'Senior Software Engineer', 'Engineering Development', 'MATLAB Compiler', 'Bangalore', ['Cricket', 'Gaming', 'AI & ML', 'Technology', 'Movies'], 'I build deployment tooling. Off the clock: gully cricket, co-op games and too many sci-fi films.', 2016, 25),
  e('sneha', 'Sneha Reddy', 'Quality Engineer', 'Quality Engineering', 'Simulink Test QE', 'Hyderabad', ['Fitness', 'Yoga', 'Music', 'Singing', 'Cooking'], 'Breaking things so customers don’t have to. Trained in Carnatic vocals and always experimenting in the kitchen.', 2021, 320),
  e('arjun', 'Arjun Nair', 'Technical Support Engineer', 'Technical Support', 'Install & Licensing Support', 'Bangalore', ['Badminton', 'Cricket', 'Table Tennis', 'Board Games', 'Coffee'], 'Solving install puzzles all day, real puzzles in the evening. Catan rematch, anyone?', 2020, 150),
  e('kavya', 'Kavya Menon', 'Documentation Writer', 'Documentation', 'Deep Learning Toolbox Docs', 'Bangalore', ['Writing', 'Reading', 'Photography', 'Bird Watching', 'Gardening'], 'I write the docs you (hopefully) read. Birder, balcony gardener and book-club organizer.', 2018, 95),
  e('vikram', 'Vikram Shetty', 'Account Manager', 'Sales', 'Enterprise Accounts – South', 'Bangalore', ['Cricket', 'Running', 'Travel', 'Podcasts', 'Cycling'], 'Partnering with enterprise customers across South India. Training for my third half-marathon.', 2015, 10),
  e('ananya', 'Ananya Das', 'UX Designer', 'Engineering Development', 'MATLAB Online UX', 'Bangalore', ['Painting', 'Photography', 'Music', 'Coffee', 'Dance', 'Trekking'], 'Designing calm, usable interfaces. Watercolours on Sundays, street photography whenever I travel.', 2022, 280),
  e('rohan', 'Rohan Gupta', 'Training Engineer', 'Training Services', 'MATLAB Fundamentals', 'Hyderabad', ['Chess', 'Board Games', 'Gaming', 'Technology', 'Running'], 'Teaching MATLAB to new learners. Rated 1800 on a good day; happy to lose a blitz game to you.', 2019, 260),
  e('meera', 'Meera Pillai', 'People Partner', 'People & Culture', 'HR Business Partners – India', 'Bangalore', ['Volunteering', 'Yoga', 'Reading', 'Baking', 'Music'], 'Here to help teams thrive. I bake for every office celebration and volunteer with a literacy NGO.', 2017, 340),
  e('karthik', 'Karthik Subramanian', 'Principal Engineer', 'Engineering Development', 'Embedded Coder', 'Bangalore', ['Robotics', 'AI & ML', 'Open Source', 'Trekking', 'Cycling', 'Guitar'], 'Code generation for embedded targets. I tinker with robots, contribute to open source, and play bad acoustic guitar.', 2012, 215),
  e('divya', 'Divya Joshi', 'Marketing Manager', 'Marketing', 'Industry Marketing – APAC', 'Bangalore', ['Travel', 'Photography', 'Cooking', 'Movies', 'Dance'], 'Telling customer stories across APAC. Visited 14 countries; Bollywood dance enthusiast.', 2018, 0),
  e('siddharth', 'Siddharth Rao', 'IT Systems Engineer', 'IT Services', 'Workplace Technology', 'Hyderabad', ['Gaming', 'Technology', 'Football', 'Cricket', 'Podcasts'], 'Keeping laptops and meeting rooms happy. Sunday league footballer and retro gaming collector.', 2020, 175),
  e('pooja', 'Pooja Bhat', 'Financial Analyst', 'Finance', 'FP&A India', 'Bangalore', ['Badminton', 'Fitness', 'Baking', 'Reading', 'Swimming'], 'Numbers by day, sourdough by night. Early-morning swimmer and badminton doubles partner-for-hire.', 2021, 45),
  e('aditya', 'Aditya Kumar', 'Consultant', 'Consulting', 'Model-Based Design Services', 'Bangalore', ['Trekking', 'Camping', 'Photography', 'Fitness', 'Coffee'], 'Helping teams scale MBD. I organise monthly treks in the Western Ghats — come along!', 2017, 130),
  e('isha', 'Isha Verma', 'Software Engineer', 'Engineering Development', 'Signal Processing Toolbox', 'Hyderabad', ['Music', 'Guitar', 'AI & ML', 'Board Games', 'Badminton'], 'DSP algorithms and the occasional open-mic. Looking for people to start an office band.', 2023, 300),
  e('farhan', 'Farhan Sheikh', 'QE Lead', 'Quality Engineering', 'Performance QE', 'Bangalore', ['Cricket', 'Fitness', 'Running', 'Gaming', 'Cooking'], 'Making MATLAB faster, one benchmark at a time. Fitness coach on weekends, biryani expert always.', 2014, 190),
  e('lakshmi', 'Lakshmi Narayan', 'Senior Technical Support Engineer', 'Technical Support', 'Simulink Support', 'Bangalore', ['Gardening', 'Cooking', 'Music', 'Singing', 'Volunteering'], 'Helping Simulink users get unstuck. Terrace gardener and choir member.', 2013, 110),
  e('nikhil', 'Nikhil Desai', 'Application Engineer', 'Application Engineering', 'Wireless & 5G AE', 'Bangalore', ['Badminton', 'Table Tennis', 'Technology', 'Photography', 'Cycling'], 'Wireless systems, 5G and beyond. You’ll find me at the TT table after lunch.', 2022, 230),
  e('tanvi', 'Tanvi Shah', 'Software Engineer', 'Engineering Development', 'Polyspace', 'Bangalore', ['Dance', 'Fitness', 'Yoga', 'Travel', 'Languages'], 'Static analysis for safety-critical code. Learning Japanese, teaching Zumba.', 2023, 350),
  e('emily', 'Emily Carter', 'Senior Developer', 'Engineering Development', 'Simulink Editor', 'Natick', ['Running', 'Photography', 'Board Games', 'Coffee', 'Reading'], 'Working on the Simulink canvas. Boston Marathon hopeful and board-game hoarder.', 2014, 205),
  e('marcus', 'Marcus Johnson', 'Application Engineer', 'Application Engineering', 'Aerospace AE', 'Natick', ['Trekking', 'Camping', 'Robotics', 'Cycling', 'Music'], 'Flight control and aerospace workflows. Hiking all 48 of New Hampshire’s 4,000-footers.', 2016, 160),
  e('sophie', 'Sophie Williams', 'Training Content Developer', 'Training Services', 'Online Courses', 'Cambridge (UK)', ['Writing', 'Painting', 'Baking', 'Languages', 'Yoga'], 'Building self-paced courses. Amateur painter and enthusiastic (if messy) baker.', 2019, 330),
  e('oliver', 'Oliver Brown', 'Account Manager', 'Sales', 'Academia – UK', 'Cambridge (UK)', ['Football', 'Cricket', 'Podcasts', 'Movies', 'Travel'], 'Working with UK universities. Village cricket captain and podcast addict.', 2018, 30),
  e('lena', 'Lena Schmidt', 'Quality Engineer', 'Quality Engineering', 'Code Generation QE', 'Munich', ['Cycling', 'Trekking', 'Photography', 'Chess', 'Coffee'], 'Testing generated code. Alpine hiker, film-camera fan and espresso snob.', 2020, 180),
  e('jonas', 'Jonas Weber', 'Consultant', 'Consulting', 'Automotive Consulting', 'Munich', ['Football', 'Running', 'AI & ML', 'Technology', 'Gaming'], 'Automotive consulting and AI for ADAS. Five-a-side every Wednesday.', 2017, 240),
  e('yuki', 'Yuki Tanaka', 'Application Engineer', 'Application Engineering', 'Robotics AE', 'Tokyo', ['Robotics', 'Photography', 'Music', 'Gaming', 'Cooking'], 'Robotics and ROS workflows. Synth music hobbyist and ramen tourist.', 2021, 290),
  e('haruto', 'Haruto Sato', 'Technical Support Engineer', 'Technical Support', 'Japan Support', 'Tokyo', ['Table Tennis', 'Chess', 'Reading', 'Coffee', 'Movies'], 'Supporting customers across Japan. Table tennis club member and mystery-novel reader.', 2019, 50),
  e('priya', 'Priya Raman', 'Engineering Manager', 'Engineering Development', 'Deep Learning Toolbox', 'Bangalore', ['AI & ML', 'Trekking', 'Board Games', 'Reading', 'Badminton', 'Podcasts'], 'Leading a deep learning team. Mentor, trekker and host of a monthly board-game night.', 2011, 270),
  e('manish', 'Manish Agarwal', 'Payroll Specialist', 'Finance', 'Payroll & Compliance', 'Hyderabad', ['Cricket', 'Movies', 'Cooking', 'Travel'], 'Making sure everyone gets paid on time. Weekend chef and cricket stats nerd.', 2016, 60),
  e('zara', 'Zara Khan', 'Brand Designer', 'Marketing', 'Creative Studio', 'Bangalore', ['Painting', 'Photography', 'Music', 'Guitar', 'Gaming'], 'Visual design for campaigns and events. Indie games, indie music, indie everything.', 2022, 310),
  e('deepak', 'Deepak Hegde', 'Network Engineer', 'IT Services', 'Network & Security', 'Bangalore', ['Trekking', 'Camping', 'Cricket', 'Fitness', 'Bird Watching'], 'Keeping our networks fast and safe. Spotted 210 bird species and counting.', 2015, 120),
  e('ritu', 'Ritu Malhotra', 'Recruiter', 'People & Culture', 'Talent Acquisition', 'Remote – India', ['Running', 'Podcasts', 'Languages', 'Volunteering', 'Coffee'], 'Finding great people to join us. Remote from Pune; happy to do virtual coffees any day.', 2020, 15),
];

export const DEFAULT_ME: Employee = {
  id: 'me',
  name: 'Aditi Rao',
  title: 'Senior Software Engineer',
  department: 'Engineering Development',
  team: 'Simulink Code Generation',
  location: 'Bangalore',
  bio: 'Working on Simulink code generation. Looking to meet people for weekend treks, photo walks and badminton.',
  interests: ['Badminton', 'Trekking', 'Photography', 'AI & ML', 'Coffee', 'Board Games'],
  joined: 2020,
  hue: 205,
};

export const COMMUNITIES: Community[] = [
  { id: 'badminton', name: 'Badminton Club', emoji: '🏸', tagline: 'Smash, rally, repeat', description: 'Friendly doubles and singles for all levels. We book courts near the office twice a week and run a fun ladder every quarter. Rackets available to borrow.', tags: ['Badminton'], schedule: 'Tue & Thu · 7:00 AM', leadId: 'neha', gradient: 'from-emerald-400 to-teal-600' },
  { id: 'cricket', name: 'Cricket Club', emoji: '🏏', tagline: 'Box cricket to league days', description: 'Weekend box cricket, an inter-team tournament, and watch parties for the big matches. Every skill level welcome, from fast bowlers to first-timers.', tags: ['Cricket'], schedule: 'Saturdays · 8:00 AM', leadId: 'vikram', gradient: 'from-amber-400 to-orange-600' },
  { id: 'trekking', name: 'Trekking & Outdoors', emoji: '🥾', tagline: 'Find your trail', description: 'Monthly day treks, sunrise hikes and the occasional camping weekend. We share carpools, gear lists and safety briefings before every trip.', tags: ['Trekking', 'Camping'], schedule: 'Monthly · Weekends', leadId: 'aditya', gradient: 'from-lime-500 to-green-700' },
  { id: 'photography', name: 'Photography Circle', emoji: '📷', tagline: 'See the world differently', description: 'Photo walks, monthly themes and friendly critique sessions. Phone cameras are just as welcome as DSLRs.', tags: ['Photography'], schedule: 'Every other Sunday', leadId: 'ananya', gradient: 'from-fuchsia-500 to-purple-700' },
  { id: 'gaming', name: 'Gaming & Board Games', emoji: '🎮', tagline: 'Press start, roll dice', description: 'Friday game nights with board games, console co-op and a chess ladder. Bring your favourite game or learn a new one.', tags: ['Gaming', 'Board Games', 'Chess'], schedule: 'Fridays · 6:00 PM', leadId: 'rohan', gradient: 'from-indigo-500 to-violet-700' },
  { id: 'fitness', name: 'Fitness & Wellness', emoji: '💪', tagline: 'Move a little every day', description: 'Lunchtime yoga, running groups and monthly step challenges. A supportive space to build healthy habits together.', tags: ['Fitness', 'Yoga', 'Running'], schedule: 'Mon, Wed, Fri · 1:00 PM', leadId: 'farhan', gradient: 'from-rose-400 to-red-600' },
  { id: 'music', name: 'Music Collective', emoji: '🎵', tagline: 'Jam, sing, share', description: 'Unplugged jam sessions, a choir corner and playlist swaps. Whether you sing, strum or just love listening, there’s a seat for you.', tags: ['Music', 'Guitar', 'Singing'], schedule: 'Thursdays · 5:30 PM', leadId: 'isha', gradient: 'from-pink-500 to-rose-600' },
  { id: 'technology', name: 'Tech Tinkerers', emoji: '💡', tagline: 'Build things for fun', description: 'Side projects, robotics kits, AI experiments and lightning talks. Show what you’re hacking on, or come find a collaborator.', tags: ['Technology', 'AI & ML', 'Robotics', 'Open Source'], schedule: 'Alternate Wednesdays · 4:00 PM', leadId: 'karthik', gradient: 'from-sky-500 to-brand-700' },
];

// Choices offered when a user creates their own community. Class strings must stay literal for Tailwind.
export const COMMUNITY_EMOJIS = ['🌟', '🏸', '🏏', '⚽', '🏃', '🚴', '🥾', '📷', '🎨', '🎵', '🎮', '♟️', '📚', '🍳', '🌱', '🤝', '💡', '🧘'];
export const COMMUNITY_GRADIENTS = [
  'from-emerald-400 to-teal-600', 'from-amber-400 to-orange-600', 'from-fuchsia-500 to-purple-700',
  'from-indigo-500 to-violet-700', 'from-rose-400 to-red-600', 'from-sky-500 to-brand-700',
];

const pad = (n: number) => String(n).padStart(2, '0');
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => isoDate(new Date());
const inDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return isoDate(d); };

export function seedEvents(): EventItem[] {
  return [
    { id: 'ev1', title: 'Morning Badminton Doubles', communityId: 'badminton', date: inDays(2), time: '07:00', endTime: '08:30', location: 'Shuttle Point Courts, near Bangalore office', city: 'Bangalore', mode: 'In person', description: 'Rotating doubles. All levels welcome. We’ll pair beginners with experienced players. Shuttles provided.', capacity: 16, hostId: 'neha', attendees: ['neha', 'arjun', 'pooja', 'nikhil', 'priya', 'isha'] },
    { id: 'ev2', title: 'Sunrise Trek to the Hills', communityId: 'trekking', date: inDays(5), time: '04:30', endTime: '12:00', location: 'Meet at Bangalore office main gate', city: 'Bangalore', mode: 'In person', description: 'An easy-to-moderate sunrise hike about 60 km from the city. Carpools arranged; bring water, a light jacket and good shoes.', capacity: 20, hostId: 'aditya', attendees: ['aditya', 'deepak', 'karthik', 'neha', 'ananya', 'priya', 'kavya'] },
    { id: 'ev3', title: 'Photo Walk: Old City Markets', communityId: 'photography', date: inDays(9), time: '07:30', endTime: '10:00', location: 'City market entrance (shared on registration)', city: 'Bangalore', mode: 'In person', description: 'Theme: “Colour & Commerce”. Walk, shoot, then share your top 3 frames over breakfast. Phone cameras welcome.', capacity: 15, hostId: 'ananya', attendees: ['ananya', 'kavya', 'zara', 'divya', 'nikhil'] },
    { id: 'ev4', title: 'Inter-team Box Cricket — Round 1', communityId: 'cricket', date: inDays(6), time: '08:00', endTime: '11:00', location: 'Turf Arena, 2 km from office', city: 'Bangalore', mode: 'In person', description: 'Six-a-side, 6 overs per innings. Sign up individually and we’ll draft mixed teams across departments.', capacity: 36, hostId: 'vikram', attendees: ['vikram', 'rahul', 'farhan', 'arjun', 'deepak', 'manish', 'siddharth'] },
    { id: 'ev5', title: 'Friday Game Night', communityId: 'gaming', date: inDays(3), time: '18:00', endTime: '20:30', location: 'Bangalore office — Level 3 breakout', city: 'Bangalore', mode: 'In person', description: 'Board games, a Mario Kart bracket and a beginner-friendly chess table. Snacks on us (well, on the community budget).', capacity: 24, hostId: 'priya', attendees: ['priya', 'arjun', 'rahul', 'zara', 'farhan'] },
    { id: 'ev6', title: 'Lunchtime Yoga (Virtual)', communityId: 'fitness', date: inDays(1), time: '13:00', endTime: '13:30', location: 'Video call (link shared with registrants)', city: 'All offices', mode: 'Virtual', description: '30 minutes of desk-friendly stretches and breathing. Cameras optional.', capacity: 50, hostId: 'tanvi', attendees: ['tanvi', 'meera', 'sneha', 'sophie', 'ritu'] },
    { id: 'ev7', title: 'Unplugged Jam Session', communityId: 'music', date: inDays(8), time: '17:30', endTime: '19:00', location: 'Hyderabad office — Café area', city: 'Hyderabad', mode: 'Hybrid', description: 'Bring an instrument or just your voice. We’ll stream for anyone joining from other offices.', capacity: 25, hostId: 'isha', attendees: ['isha', 'sneha', 'lakshmi', 'zara'] },
    { id: 'ev8', title: 'Tinker Talks: Tiny Robots & AI', communityId: 'technology', date: inDays(12), time: '16:00', endTime: '17:00', location: 'Bangalore office — Auditorium + video call', city: 'Bangalore', mode: 'Hybrid', description: 'Three 10-minute lightning talks on weekend side projects, followed by open demos. Speakers wanted!', capacity: 60, hostId: 'karthik', attendees: ['karthik', 'rahul', 'yuki', 'jonas', 'priya', 'siddharth', 'marcus'] },
    { id: 'ev9', title: 'Coffee & Conversations Mixer', communityId: null, date: inDays(4), time: '15:30', endTime: '16:30', location: 'Bangalore office — Terrace café', city: 'Bangalore', mode: 'In person', description: 'A relaxed cross-team mixer. We’ll shuffle tables every 15 minutes so you meet new people. No agenda, no slides.', capacity: 40, hostId: 'meera', attendees: ['meera', 'ritu', 'kavya', 'lakshmi', 'divya', 'tanvi'] },
    { id: 'ev10', title: 'Fall Foliage Hike', communityId: 'trekking', date: inDays(10), time: '09:00', endTime: '14:00', location: 'Trailhead parking (shared on registration)', city: 'Natick', mode: 'In person', description: 'A moderate 8-mile loop with great views. Carpools from campus.', capacity: 18, hostId: 'marcus', attendees: ['marcus', 'emily'] },
  ];
}

const STARTERS: Record<string, string> = {
  Badminton: 'Singles or doubles? Want to join the next morning session together?',
  Cricket: 'Batter, bowler or all-rounder? Who are you backing this season?',
  Football: 'Which club do you follow, and do you still play five-a-side?',
  'Table Tennis': 'Up for a quick post-lunch TT game? What’s your best shot?',
  Running: 'What distance are you training for? Any favourite routes near the office?',
  Cycling: 'Commute rides or weekend long rides? Any route recommendations?',
  Yoga: 'How did you get into yoga? Any style you’d recommend for desk folks?',
  Fitness: 'What does your usual workout routine look like?',
  Swimming: 'Early-morning laps or weekend swims? Where do you swim?',
  Trekking: 'What’s the best trek you’ve done so far? Anything on your list for next season?',
  Travel: 'What’s the most memorable place you’ve visited, and where to next?',
  Camping: 'Tent or cabin? Any camping spot you’d recommend for a beginner?',
  'Bird Watching': 'What’s the most exciting bird you’ve spotted around the city?',
  Photography: 'What do you like to shoot most: street, landscape or portraits? Phone or camera?',
  Music: 'What’s been on repeat for you lately?',
  Guitar: 'Acoustic or electric? What song are you learning right now?',
  Singing: 'Do you sing in a group or solo? What genre do you love?',
  Painting: 'Which medium do you enjoy most? Watercolour, acrylic or digital?',
  Writing: 'What do you write for fun? Fiction, blogs or poetry?',
  Dance: 'Which dance style do you enjoy, and how did you start?',
  Technology: 'What’s a gadget or tool that changed how you work or live?',
  'AI & ML': 'Seen any AI project lately that genuinely impressed you?',
  Robotics: 'Working on any robot builds? What kit or platform do you use?',
  'Open Source': 'Which open-source project would you love to contribute to?',
  Gaming: 'What are you playing right now? Co-op or solo?',
  'Board Games': 'What’s your go-to board game for a group of five?',
  Chess: 'Blitz or classical? Fancy a friendly game sometime?',
  Cooking: 'What’s your signature dish? Any cuisine you’re exploring?',
  Baking: 'What’s the best thing you’ve baked recently? Any tips for sourdough?',
  Coffee: 'Filter coffee, espresso or pour-over? Where’s the best cup near the office?',
  Gardening: 'What are you growing right now? Any tips for a balcony garden?',
  Reading: 'What’s the best book you’ve read this year?',
  Movies: 'Seen anything great recently? Theatre or streaming?',
  Podcasts: 'Which podcast would you recommend to a new listener?',
  Languages: 'Which language are you learning, and how are you practising?',
  Volunteering: 'What cause do you volunteer for? How could others get involved?',
};

export function conversationStarters(shared: string[], other?: Employee): string[] {
  const out = shared.slice(0, 3).map((i) => STARTERS[i] ?? `What got you into ${i.toLowerCase()}?`);
  if (other && out.length < 3) out.push(`What does a typical week look like on the ${other.team} team?`);
  if (out.length < 3) out.push('What’s something you’re looking forward to this month?');
  if (out.length < 3) out.push('What’s a hobby you’ve always wanted to try?');
  return out;
}

export function meetingPlaces(location: string): string[] {
  if (location.startsWith('Remote')) return ['Video call', 'Café of your choice'];
  return [`${location} office — Café`, `${location} office — Lounge / breakout area`, 'Café near the office', 'Video call'];
}

const DEFAULT_SETTINGS: AppState['settings'] = { participating: true, visibility: 'everyone', showLocation: true, surprise: true, allowRequests: true };

/** Clean slate for a freshly registered account: no connections, communities or registrations yet. */
export function newUserState(p: Pick<Employee, 'name' | 'title' | 'department' | 'location'>): AppState {
  return {
    version: 1,
    onboarded: false,
    me: { id: 'me', ...p, team: '', bio: '', interests: [], joined: new Date().getFullYear(), hue: Math.floor(Math.random() * 360) },
    settings: { ...DEFAULT_SETTINGS },
    connections: {},
    requestsSeenAt: 0,
    communities: [...COMMUNITIES],
    joined: [],
    events: seedEvents(),
    registered: [],
    coffee: [],
    blocked: [],
    reports: [],
  };
}

export function seedState(): AppState {
  const now = Date.now();
  const d = (n: number) => inDays(n);
  return {
    version: 1,
    onboarded: false,
    me: { ...DEFAULT_ME },
    settings: { ...DEFAULT_SETTINGS },
    requestsSeenAt: 0,
    communities: [...COMMUNITIES],
    connections: {
      neha: { status: 'incoming', at: now - 3600e3 * 5, note: 'Hi! Saw we both love trekking and photography. Fancy a coffee and swapping trail stories?' },
      isha: { status: 'incoming', at: now - 3600e3 * 26, note: 'Hey! We’re trying to start a board-game group in Hyderabad. Would love your ideas.' },
      aditya: { status: 'incoming', at: now - 3600e3 * 50 },
      priya: { status: 'connected', at: now - 86400e3 * 40 },
      arjun: { status: 'connected', at: now - 86400e3 * 18 },
      emily: { status: 'connected', at: now - 86400e3 * 7 },
      kavya: { status: 'outgoing', at: now - 3600e3 * 20, note: 'Hi Kavya, I’d love to join a photo walk with you sometime!' },
    },
    joined: ['badminton', 'photography'],
    events: seedEvents(),
    registered: ['ev1'],
    coffee: [
      { id: 'cf1', withId: 'arjun', date: d(2), time: '16:00', mode: 'In person', place: 'Bangalore office — Café', note: 'Board-game recommendations + badminton plans', status: 'confirmed', createdAt: now - 86400e3 },
    ],
    blocked: [],
    reports: [],
  };
}
