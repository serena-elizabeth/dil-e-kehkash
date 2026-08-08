import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiGithub, FiMail } from 'react-icons/fi'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

export default function About() {
  return (
    <div className="min-h-screen pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-10">

        {/* Profile */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full border-2 border-gold/40 overflow-hidden">
              {/* Replace /profile.jpg with your actual photo in the public folder */}
              <img
                src="/profile.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="w-full h-full bg-gold/10 items-center justify-center hidden">
                <span className="font-serif text-4xl text-gold">د</span>
              </div>
            </div>
                      </div>

          <div className="text-center sm:text-left">
            <span className="font-sans text-xs tracking-widest uppercase text-gold-light block mb-2">The Voice Behind</span>
            <h1 className="font-serif text-4xl text-heading mb-3">Dil-e-Kehkash</h1>
            <p className="font-sans text-sm text-muted leading-relaxed max-w-md">
              A wanderer of words, a keeper of feelings. This anthology is a living archive — every quote, poem, song, and story is a fragment of a soul that finds expression in all forms.
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="gold-divider" />

        {/* About Text */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl text-gold">About This Space</h2>
          <p className="font-sans text-sm text-body leading-relaxed">
            Dil-e-Kehkash — meaning <em className="text-body">"the heart that pulls like a galaxy"</em> — is a personal anthology where creativity meets vulnerability. It is not a portfolio. It is a confession, a celebration, a record of everything that has ever moved this soul.
          </p>
          <p className="font-sans text-sm text-body leading-relaxed">
            Here you will find quotes born at odd hours, poems that refused to stay quiet, articles that demanded to be written, songs half-hummed and half-remembered, photographs that held more than light, and stories that began as whispers.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="gold-divider" />

        {/* Category Stats */}
        <motion.div variants={fadeUp}>
          <h2 className="font-serif text-2xl text-gold mb-6">The Collection</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Quotes', symbol: '"' },
              { label: 'Poems', symbol: '✦' },
              { label: 'Articles', symbol: '≡' },
              { label: 'Songs', symbol: '♪' },
              { label: 'Photos', symbol: '◎' },
              { label: 'Stories', symbol: '§' },
            ].map(({ label, symbol }) => (
              <Link key={label} to={`/${label.toLowerCase()}`} className="glass-card rounded-sm p-4 flex items-center gap-3 hover:border-gold transition-colors">
                <span className="font-serif text-2xl text-gold/40">{symbol}</span>
                <span className="font-sans text-xs tracking-widest uppercase text-muted">{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="gold-divider" />

        {/* Social Links */}
        <motion.div variants={fadeUp}>
          <h2 className="font-serif text-2xl text-gold mb-6">Connect</h2>
          <div className="flex gap-4">
            {[
              { icon: FiInstagram, label: 'Instagram', href: '#' },
              { icon: FiTwitter, label: 'Twitter / X', href: '#' },
              { icon: FiGithub, label: 'GitHub', href: '#' },
              { icon: FiMail, label: 'Email', href: 'mailto:your@email.com' },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-3 glass-card rounded-sm text-muted hover:text-gold transition-colors duration-200"
                rel="noopener noreferrer"
                target={href.startsWith('mailto') ? undefined : '_blank'}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
