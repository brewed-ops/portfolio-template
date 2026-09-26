import { Link } from 'react-router-dom'
import { SealCheck, CaretRight, Play, Stack, Coffee } from '@/components/slab'
import { profile } from '@/data/profile'
import QuickMenu from './QuickMenu'

/**
 * Home on a phone, the parts the rail and the bento used to carry:
 *
 *   HomeProfile  avatar, name, verified mark, handle and the QuickMenu
 *                (theme + accessibility) - the rail's identity block, laid flat
 *   HomeStats    three proof facts (profile.stats), each named by a glyph so
 *                it reads at a glance
 *   HomeExplore  one shelf card per rail view in a snap row, then the first
 *                testimonial as a video stage
 */

export function HomeProfile() {
  return (
    <header className="hprofile">
      <img className="hprofile__avatar" src={profile.avatarSrc} alt="" width={56} height={56} />
      <div className="hprofile__who">
        <span className="hprofile__name">
          {profile.name}
          <SealCheck size={16} weight="fill" className="hprofile__verified" aria-label={profile.verifiedLabel} />
        </span>
        <span className="hprofile__handle">
          {profile.handle} · {profile.role}
        </span>
      </div>
      <QuickMenu className="hprofile__menu" />
    </header>
  )
}

export function HomeStats() {
  return (
    <ul className="hstats" role="list">
      {profile.stats.map(({ value, label, Icon }, i) => (
        <li key={i}>
          <Icon className="hstats__icon" size={18} weight="duotone" aria-hidden="true" />
          <b className="hstats__value">{value}</b>
          <span className="hstats__label">{label}</span>
        </li>
      ))}
    </ul>
  )
}

const TILES = [
  { n: '01', label: 'Projects', to: '/projects', title: 'PLACEHOLDER - projects headline', desc: 'Tell me what to put here.', img: '/placeholders/project-1.jpg' },
  { n: '02', label: 'Services', to: '/services', title: 'PLACEHOLDER - services headline', desc: 'Tell me what to put here.', Icon: Stack },
  { n: '03', label: 'Showcase', to: '/showcase', title: 'PLACEHOLDER - your flagship', desc: 'Tell me what to put here.', Icon: Coffee, accent: true },
  { n: '04', label: 'Testimonials', to: '/testimonials', title: 'PLACEHOLDER - testimonials headline', desc: 'Tell me what to put here.', img: '/placeholders/testimonial-1.jpg' },
  { n: '05', label: 'About', to: '/about', title: `Hi, I'm ${profile.firstName}.`, desc: 'PLACEHOLDER - one line about you.', img: profile.avatarSrc },
] as const

export function HomeExplore() {
  return (
    <>
      <div className="hsec">
        <h2 className="hsec__title">Explore</h2>
      </div>
      <ul className="htiles" role="list">
        {TILES.map((t) => (
          <li key={t.to}>
            <Link to={t.to} className={`htile${'accent' in t && t.accent ? ' htile--accent' : ''}`}>
              {'img' in t ? (
                <span className="htile__media"><img className="htile__img" src={t.img} alt="" loading="lazy" /></span>
              ) : (
                <span className="htile__media htile__glyph"><t.Icon size={52} weight="duotone" aria-hidden="true" /></span>
              )}
              <span className="htile__body">
                <span className="htile__n">{t.n} {t.label}</span>
                <span className="htile__title">{t.title}</span>
                <span className="htile__desc">{t.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* A header that links carries its chevron on the title itself. */}
      <div className="hsec">
        <h2 className="hsec__title">
          <Link to="/testimonials" className="hsec__link">
            What clients say
            <CaretRight size={16} weight="bold" aria-hidden="true" />
          </Link>
        </h2>
      </div>
      <Link to="/testimonials" className="hproof" aria-label="Client testimonial. PLACEHOLDER - a one-line teaser for your best testimonial.">
        <span className="hproof__stage">
          <img src="/placeholders/testimonial-1.jpg" alt="" loading="lazy" />
          <span className="hproof__play" aria-hidden="true"><Play size={20} weight="fill" /></span>
          <span className="hproof__dur" aria-hidden="true">0:00</span>
        </span>
        <span className="hproof__copy">
          <span className="hproof__title">PLACEHOLDER - tell me what to put here: a one-line teaser for your best testimonial.</span>
          <span className="hproof__meta">PLACEHOLDER - client role</span>
        </span>
      </Link>
    </>
  )
}
