import { useEffect, type CSSProperties } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  Github,
} from 'lucide-react'

import {
  contactLinks,
  education,
  experiences,
  featuredProjects,
  highlights,
  navItems,
  portfolioProfile,
  sectionMeta,
  skillGroups,
  stats,
} from '@/data/portfolio'

export default function PortfolioPage() {
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03071f]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#66d7c5] text-sm font-bold text-[#03071f]">
              TM
            </span>
            <span className="hidden text-sm font-semibold tracking-wide text-white sm:inline">
              {portfolioProfile.name}
            </span>
          </a>

          <div className="hidden items-center gap-6 text-sm font-medium text-blue-100/80 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <a
            // href={portfolioProfile.cvUrl}
            href="#"
            download
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#f4b26b] px-4 text-sm font-semibold text-[#03071f] transition hover:bg-[#ffd098]"
          >
            <Download className="h-4 w-4" />
            CV
          </a>
        </nav>
      </header>

      <main id="top" className="scroll-smooth lg:snap-y lg:snap-mandatory">
        <section className="portfolio-hero relative min-h-[calc(100vh-73px)] overflow-hidden bg-[#03071f] text-white lg:snap-start">
          <div className="portfolio-hero__welcome pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 text-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.55em] text-[#66d7c5]">Welcome to</p>
              <h2 className="mt-4 font-serif text-5xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
                My Portfolio
              </h2>
            </div>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(102,215,197,0.18),transparent_28%),radial-gradient(circle_at_82%_55%,rgba(244,178,107,0.13),transparent_30%)]" />
          <div className="portfolio-contours absolute inset-0 opacity-55" />
          <div className="absolute left-[62%] top-1/2 hidden h-[38rem] w-[38rem] -translate-y-1/2 rounded-full border border-[#66d7c5]/10 lg:block" />
          <div className="absolute left-[69%] top-[28%] hidden h-20 w-px bg-[#66d7c5]/30 lg:block" />

          <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="portfolio-showcase grid w-full overflow-hidden border border-[#243356] bg-[#061129]/78 shadow-2xl backdrop-blur md:grid-cols-[0.92fr_1.08fr]">
              <div className="portfolio-showcase__image relative min-h-[22rem] border-[#243356] p-4 md:border-r lg:min-h-[34rem]">
                <div className="absolute inset-4 border border-[#f4b26b]/70" />
                <div className="absolute left-4 top-4 h-24 w-24 border-l-4 border-t-4 border-[#f4b26b]" />
                <div className="absolute bottom-4 right-4 h-24 w-24 border-b-4 border-r-4 border-[#66d7c5]" />
                <img
                  src={portfolioProfile.avatarUrl}
                  alt={portfolioProfile.name}
                  className="h-full min-h-[22rem] w-full object-cover saturate-[0.92] lg:min-h-[34rem]"
                />
                <div className="absolute inset-4 bg-[linear-gradient(180deg,transparent_52%,rgba(3,7,31,0.7))]" />
                <div className="portfolio-chip absolute bottom-8 left-8 rounded-full bg-[#66d7c5] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#03071f]">
                  Middle PHP Developer
                </div>
              </div>

              <div className="relative flex min-h-[30rem] items-center p-7 sm:p-10 lg:p-14">
                <div className="absolute right-0 top-0 h-full w-[42%] border-l border-[#243356] bg-[#07142e]/55" />
                <div className="portfolio-orbit absolute right-[14%] top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full border border-[#66d7c5]/15 lg:block" />
                <div className="portfolio-orbit-dot absolute right-[18%] top-[12%] hidden h-16 w-16 rounded-full border-4 border-[#03071f] bg-[#66d7c5] shadow-[0_0_0_1px_rgba(102,215,197,0.35)] lg:block" />

                <div className="relative max-w-2xl">
                  <p
                    className="portfolio-step mb-6 text-xs font-bold uppercase tracking-[0.45em] text-[#f4b26b]"
                    style={animationDelayStyle(2700)}
                  >
                    Personal Portfolio
                  </p>
                  <h1 className="portfolio-title font-serif text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                    Tran Thai
                    <span className="block text-[#66d7c5]">Minh Tri</span>
                  </h1>
                  <p
                    className="portfolio-step mt-6 text-xl font-semibold text-blue-100 sm:text-2xl"
                    style={animationDelayStyle(3200)}
                  >
                    {portfolioProfile.role}
                  </p>
                  <p
                    className="portfolio-step mt-5 max-w-xl text-sm leading-7 text-blue-100/75 sm:text-base"
                    style={animationDelayStyle(3350)}
                  >
                    {portfolioProfile.summary} I turn business requirements into reliable Laravel features,
                    clean APIs, and practical user-facing flows.
                  </p>

                  <div className="portfolio-step mt-8 flex flex-wrap gap-3" style={animationDelayStyle(3500)}>
                    <a
                      href="#projects"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#66d7c5] px-5 text-sm font-bold text-[#03071f] transition hover:bg-[#8ff0e1]"
                    >
                      View Projects
                      <ArrowDown className="ml-2 h-4 w-4" />
                    </a>
                    <a
                      // href={portfolioProfile.cvUrl}
                      href="#"
                      download
                      className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-bold text-white transition hover:border-[#f4b26b] hover:text-[#f4b26b]"
                    >
                      Download CV
                      <Download className="ml-2 h-4 w-4" />
                    </a>
                    <a
                      href="#contact"
                      className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-blue-100 transition hover:bg-white/10"
                    >
                      Contact Me
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>

                  <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                    {stats.map((stat, index) => (
                      <div
                        key={stat.label}
                        className="portfolio-stat rounded-lg border border-white/10 bg-white/5 p-4"
                        style={animationDelayStyle(3650 + index * 130)}
                      >
                        <div className="text-2xl font-bold text-[#66d7c5]">{stat.value}</div>
                        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-100/60">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="relative flex min-h-screen items-center overflow-hidden bg-[#f7efe5] px-4 py-16 sm:px-6 lg:snap-start lg:px-8"
        >
          <div className="absolute inset-y-0 left-0 hidden w-[22vw] bg-[#03071f] lg:block" />
          <div className="portfolio-contours absolute inset-0 opacity-20" />
          <div className="absolute right-8 top-12 hidden text-[12rem] font-black leading-none text-[#03071f]/5 lg:block">
            01
          </div>
          <div className="relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div data-reveal className="relative rounded-none border border-[#e2c9a6] bg-white/85 p-8 shadow-xl backdrop-blur lg:p-10">
              <div className="absolute -left-6 top-10 hidden h-28 w-2 bg-[#66d7c5] lg:block" />
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#9f6a2c]">{sectionMeta.about.eyebrow}</p>
              <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-[#03071f] sm:text-5xl">
                {sectionMeta.about.title}
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-700">
                I bring a practical engineering style from startup and software outsourcing environments:
                clarify the requirement, build the useful flow, and keep improving the implementation until it
                is stable for real users.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight, index) => (
                <div
                  key={highlight}
                  data-reveal
                  style={revealStyle(index * 110)}
                  className="group relative overflow-hidden rounded-none border border-[#e2c9a6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="absolute right-4 top-4 font-serif text-5xl text-[#03071f]/5">0{index + 1}</span>
                  <CheckCircle2 className="mb-4 h-5 w-5 text-[#0f9f8c]" />
                  <p className="text-sm leading-6 text-slate-700">{highlight}</p>
                </div>
              ))}
            </div>

            <div
              data-reveal
              style={revealStyle(420)}
              className="rounded-none border border-[#e2c9a6] bg-[#03071f] p-6 text-white shadow-xl lg:col-span-2"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#66d7c5]">
                <sectionMeta.education.icon className="h-5 w-5" />
                <span>{sectionMeta.education.eyebrow}</span>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{sectionMeta.education.title}</h3>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-100/70">
                    <CalendarDays className="h-4 w-4" />
                    {education.period}
                  </p>
                </div>
                <p className="text-sm leading-7 text-blue-50/80">{education.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="relative flex min-h-screen items-center overflow-hidden border-y border-white/10 bg-[#03071f] text-white lg:snap-start">
          <div className="portfolio-contours absolute inset-0 opacity-35" />
          <div className="absolute left-8 top-12 hidden text-[12rem] font-black leading-none text-white/5 lg:block">
            02
          </div>
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Experience timeline"
              title="A growing Laravel and fullstack journey."
              description="A vertical career timeline showing the main roles and technologies from early web work to the current Middle PHP Developer position."
              tone="dark"
            />

            <div className="relative mt-12">
              <div className="absolute left-4 top-0 hidden h-full w-px bg-[#66d7c5]/30 sm:block" />
              <div className="grid gap-4 lg:grid-cols-2">
                {experiences.map((experience, index) => (
                  <article
                    key={experience.company}
                    data-reveal
                    style={revealStyle(index * 120)}
                    className="relative sm:pl-12"
                  >
                    <div className="absolute left-0 top-6 hidden h-8 w-8 items-center justify-center rounded-full border border-[#66d7c5] bg-[#03071f] text-sm font-bold text-[#66d7c5] sm:flex">
                      {index + 1}
                    </div>
                    <div className="h-full rounded-none border border-white/10 bg-white/8 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-[#66d7c5]/60 hover:bg-white/12">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide text-[#f4b26b]">
                            {experience.period}
                          </p>
                          <h3 className="mt-2 font-serif text-2xl font-semibold text-white">{experience.company}</h3>
                          <p className="mt-1 font-semibold text-blue-100/80">{experience.role}</p>
                        </div>
                        {index === 0 && (
                          <span className="rounded-full bg-[#66d7c5] px-3 py-1 text-xs font-bold text-[#03071f]">
                            Current
                          </span>
                        )}
                      </div>
                      <ul className="mt-5 space-y-3">
                        {experience.points.map((point) => (
                          <li key={point} className="flex gap-3 text-sm leading-6 text-blue-50/75">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#66d7c5]" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="skills"
          className="portfolio-grid relative flex min-h-screen items-center overflow-hidden bg-[#eef5fb] px-4 py-16 sm:px-6 lg:snap-start lg:px-8"
        >
          <div className="absolute right-8 top-12 hidden text-[12rem] font-black leading-none text-[#03071f]/5 lg:block">
            03
          </div>
          <div className="mx-auto w-full max-w-7xl">
            <SectionHeading
              eyebrow="Skills matrix"
              title="The stack I use to ship web products."
              description="Grouped by day-to-day engineering use: programming foundations, frameworks, data storage, and delivery tools."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {skillGroups.map((group, index) => (
                <article
                  key={group.title}
                  data-reveal
                  style={revealStyle(index * 120)}
                  className="group rounded-none border border-[#bed7e8] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#66d7c5] hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#03071f] text-[#66d7c5] transition group-hover:rotate-6">
                    <group.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-slate-950">{group.title}</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#25466f] transition group-hover:border-[#66d7c5]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="relative flex min-h-screen items-center overflow-hidden border-y border-white/10 bg-[#10243d] text-white lg:snap-start">
          <div className="portfolio-contours absolute inset-0 opacity-30" />
          <div className="absolute left-8 top-12 hidden text-[12rem] font-black leading-none text-white/5 lg:block">
            04
          </div>
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <SectionHeading
                eyebrow="Featured projects"
                title="Selected professional work."
                description="Representative projects based on the CV and current public information. GitHub repository links can be added when the exact public repos are confirmed."
                tone="dark"
              />
              <a
                href={portfolioProfile.githubUrl}
                target="_blank"
                rel="noreferrer"
                data-reveal
                style={revealStyle(120)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 hover:text-white"
              >
                <Github className="h-4 w-4" />
                Visit GitHub
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {featuredProjects.map((project, index) => (
                <article
                  key={project.title}
                  data-reveal
                  style={revealStyle(index * 120)}
                  className="group relative overflow-hidden rounded-none border border-white/10 bg-white/10 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 translate-x-10 -translate-y-10 rounded-full bg-[#66d7c5]/20 transition group-hover:scale-150" />
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-200">{project.type}</p>
                  <h3 className="mt-3 text-xl font-bold text-white">{project.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-blue-50">{project.description}</p>
                  <p className="mt-4 rounded-lg bg-white/10 p-3 text-sm font-medium text-blue-50">
                    {project.outcome}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#25466f]">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="relative flex min-h-screen items-center overflow-hidden bg-[#f7efe5] px-4 py-16 sm:px-6 lg:snap-start lg:px-8">
          <div className="mx-auto w-full max-w-7xl rounded-none border border-[#e2c9a6] bg-[#25466f] p-8 text-white shadow-2xl sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div data-reveal>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#f4b26b]">Contact</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Let&apos;s build useful products together.</h2>
                <p className="mt-4 max-w-xl leading-7 text-blue-50">
                  I am open to PHP/Laravel, fullstack, and product engineering opportunities where practical
                  delivery and steady growth matter.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {contactLinks.map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    data-reveal
                    style={revealStyle(index * 100)}
                    className="flex items-center gap-3 rounded-none border border-white/15 bg-white/10 p-4 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-white/15"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-blue-100" />
                    <span className="break-all">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {portfolioProfile.name}. Built with React, TypeScript, and Tailwind CSS.
      </footer>
    </div>
  )
}

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  tone?: 'light' | 'dark'
}

function SectionHeading({ eyebrow, title, description, tone = 'light' }: SectionHeadingProps) {
  const isDark = tone === 'dark'

  return (
    <div data-reveal className="max-w-3xl">
      <p className={`text-sm font-bold uppercase tracking-wide ${isDark ? 'text-blue-200' : 'text-[#3f7cab]'}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-slate-950'}`}>
        {title}
      </h2>
      <p className={`mt-4 text-base leading-8 ${isDark ? 'text-blue-50' : 'text-slate-600'}`}>{description}</p>
    </div>
  )
}

function revealStyle(delay = 0) {
  return { '--reveal-delay': `${delay}ms` } as CSSProperties
}

function animationDelayStyle(delay = 0) {
  return { animationDelay: `${delay}ms` } as CSSProperties
}
