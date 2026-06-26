import {
  BriefcaseBusiness,
  Code2,
  Database,
  Github,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ServerCog,
  Wrench,
} from 'lucide-react'

export const portfolioProfile = {
  name: 'Tran Thai Minh Tri',
  role: 'Middle PHP Developer / Laravel Developer',
  location: 'District 7, Ho Chi Minh City',
  email: 'mzk.tri2000@gmail.com',
  phone: '+84 333 717 088',
  github: 'tricoder1205',
  githubUrl: 'https://github.com/tricoder1205',
  cvUrl: '/files/tran-thai-minh-tri-cv.pdf',
  avatarUrl: '/images/portfolio/tran-thai-minh-tri.jpeg',
  summary:
    'PHP/Laravel developer with 4+ years of experience building web applications, APIs, and user interfaces across Laravel, Vue.js, React.js, and Flutter projects.',
}

export const contactLinks = [
  {
    label: portfolioProfile.email,
    href: `mailto:${portfolioProfile.email}`,
    icon: Mail,
  },
  {
    label: portfolioProfile.phone,
    href: `tel:${portfolioProfile.phone.replace(/\s/g, '')}`,
    icon: Phone,
  },
  {
    label: portfolioProfile.location,
    href: 'https://www.google.com/maps/search/?api=1&query=District%207%2C%20Ho%20Chi%20Minh%20City',
    icon: MapPin,
  },
  {
    label: `github.com/${portfolioProfile.github}`,
    href: portfolioProfile.githubUrl,
    icon: Github,
  },
]

export const highlights = [
  'Strong foundation in PHP, Laravel, HTML, CSS, JavaScript, Vue.js, and React.js.',
  'Experienced in Laravel SSR work, API development, UI implementation, and performance-focused improvements.',
  'Comfortable communicating project specifics with Japanese clients and translating requirements into working features.',
  'Quick learner with hands-on exposure to Docker, Nginx, MySQL, MongoDB, SQL Server, Redis, and Git workflows.',
]

export const education = {
  school: 'Can Tho University',
  degree: 'Information Technology',
  period: 'Sep 2018 - Jan 2023',
  description:
    'Graduated with a degree in Information Technology and built a strong foundation for software development, problem solving, and adapting to new technologies.',
}

export const experiences = [
  {
    company: 'THK Holdings Vietnam',
    period: '01/11/2024 - Present',
    role: 'Middle PHP Developer',
    points: [
      'Develop and maintain PHP/Laravel features for production systems.',
      'Collaborate with team members to clarify requirements, improve implementation quality, and support delivery.',
      'Apply fullstack experience across backend logic, database interactions, and UI integration.',
    ],
  },
  {
    company: 'Splus Software',
    period: 'Dec 2023 - Oct 2024',
    role: 'PHP - Laravel Developer',
    points: [
      'Built Laravel SSR web application features aligned with Japanese client requirements.',
      'Improved application performance and contributed to steady project progress with favorable feedback.',
      'Communicated project specifics clearly and converted business needs into practical implementation tasks.',
    ],
  },
  {
    company: 'Freightek',
    period: 'Aug 2022 - Nov 2023',
    role: 'Fullstack Developer (PHP Laravel + Vue.js)',
    points: [
      'Developed APIs and user interfaces for digitalization software using PHP Laravel and Vue.js.',
      'Implemented backend APIs with Laravel and user-facing interfaces with Vue.js.',
      'Participated in research and development for mobile applications with Flutter.',
    ],
  },
  {
    company: 'STECH',
    period: 'May 2022 - Aug 2022',
    role: 'Web Developer (React.js)',
    points: [
      'Developed APIs and user interfaces for a social network system using Next.js and Express.',
      'Supported server interaction features through user-facing interfaces.',
    ],
  },
]

export const skillGroups = [
  {
    title: 'Programming',
    icon: Code2,
    skills: ['PHP', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'OOP', 'MVC', 'Scrum'],
  },
  {
    title: 'Frameworks & UI',
    icon: Wrench,
    skills: ['Laravel', 'Vue.js', 'React.js', 'Flutter', 'Tailwind CSS', 'Bootstrap', 'jQuery'],
  },
  {
    title: 'Database',
    icon: Database,
    skills: ['MySQL', 'MongoDB', 'SQL Server', 'Redis'],
  },
  {
    title: 'DevOps & Tools',
    icon: ServerCog,
    skills: ['Docker', 'Nginx', 'Node.js', 'Git', 'Git Desktop', 'Visual Studio Code', 'MongoDB Compass'],
  },
]

export const featuredProjects = [
  {
    title: 'Laravel SSR Business Application',
    type: 'Professional project',
    stack: ['Laravel', 'PHP', 'SSR', 'MySQL'],
    description:
      'Built and optimized business-facing web application features for a Japanese client, focusing on clear requirements, practical delivery, and performance.',
    outcome: 'Improved feature delivery quality and contributed to favorable client feedback.',
  },
  {
    title: 'Freightek Digitalization Platform',
    type: 'Professional project',
    stack: ['Laravel', 'Vue.js', 'API', 'MySQL'],
    description:
      'Developed backend APIs and user interfaces for logistics digitalization software, connecting Laravel services with Vue.js workflows.',
    outcome: 'Supported API-driven operations and smoother internal user workflows.',
  },
  {
    title: 'Mobile R&D Application',
    type: 'Professional R&D',
    stack: ['Flutter', 'API Integration', 'UI Development'],
    description:
      'Participated in research and development for mobile application experiences while integrating backend data and interface behavior.',
    outcome: 'Expanded product exploration into mobile platforms.',
  },
  {
    title: 'Social Network Web System',
    type: 'Early professional project',
    stack: ['React.js', 'Next.js', 'Express', 'API'],
    description:
      'Contributed to APIs and user interfaces for a social network system, including client-side features that interact with server data.',
    outcome: 'Built practical experience across frontend and backend collaboration.',
  },
]

export const stats = [
  { value: '4+', label: 'Years in IT' },
  { value: '4', label: 'Companies' },
  { value: '10+', label: 'Core skills' },
]

export const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export const sectionMeta = {
  about: {
    eyebrow: 'About',
    title: 'Fullstack-minded PHP developer focused on practical delivery.',
    icon: BriefcaseBusiness,
  },
  education: {
    eyebrow: 'Education',
    title: `${education.degree} at ${education.school}`,
    icon: GraduationCap,
  },
}
