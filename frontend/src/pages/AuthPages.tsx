import { Check, CircleX, Eye, EyeOff, Gavel, Lock, Mail, User } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { validateLogin, validateSignup } from '../utils/validation'

export function LoginPage() {
  const { login, signIn } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const next = validateLogin({ email, password })
    setErrors(next)
    if (Object.keys(next).length > 0) return
    const apiErrors = await login(email, password, remember)
    if (apiErrors) {
      setErrors(apiErrors)
      return
    }
    navigate('/')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to Auctionly" onClose={() => navigate('/')}>
      <form onSubmit={submit} noValidate>
        <Field label="Email Address" error={errors.email} icon={<Mail size={18} />}>
          <input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Password" error={errors.password} icon={<Lock size={18} />} trailing={<button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((value) => !value)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}>
          <input type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        <div className="meta-row">
          <label className="check-row">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            <span className={`box ${remember ? 'on' : ''}`}>{remember ? <Check size={12} /> : null}</span>
            Remember me
          </label>
          <button type="button" className="linkish" onClick={() => setNotice('Password reset instructions would be sent to your email.')}>Forgot password?</button>
        </div>
        {notice ? <p className="hint">{notice}</p> : null}
        <button className="btn btn-primary btn-block" type="submit">Sign In</button>
        <OrDivider />
        <button className="btn btn-ghost btn-block" type="button" onClick={() => { signIn({ name: 'Alex Morgan', email: 'alex@gmail.com', initials: 'AM' }, true); navigate('/') }}>
          <CircleX size={18} /> Continue with Google
        </button>
        <p className="switch-auth">Don&apos;t have an account? <Link to="/signup">Sign up</Link></p>
      </form>
    </AuthShell>
  )
}

export function SignUpPage() {
  const { register, signIn } = useSession()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', acceptedTerms: false })
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const next = validateSignup(form)
    setErrors(next)
    if (Object.keys(next).length > 0) return
    const apiErrors = await register(form)
    if (apiErrors) {
      setErrors(apiErrors)
      return
    }
    navigate('/profile')
  }

  return (
    <AuthShell title="Create your account" subtitle="Join the Auctionly community — buy and sell through local auctions" compactSubtitle="Join the Auctionly community" back>
      <form onSubmit={submit} noValidate>
        <Field label="Full Name" error={errors.name} icon={<User size={18} />}>
          <input placeholder="John Smith" value={form.name} onChange={(event) => update('name', event.target.value)} />
        </Field>
        <Field label="Email Address" error={errors.email} icon={<Mail size={18} />}>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </Field>
        <Field label="Password" error={errors.password} icon={<Lock size={18} />} hint="Must be at least 8 characters with one uppercase and one number" trailing={<button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((value) => !value)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}>
          <input type={show ? 'text' : 'password'} placeholder="Create a password" value={form.password} onChange={(event) => update('password', event.target.value)} />
        </Field>
        <Field label="Confirm Password" error={errors.confirmPassword} icon={<Lock size={18} />}>
          <input type={show ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} />
        </Field>
        <label className="check-row terms">
          <input type="checkbox" checked={form.acceptedTerms} onChange={(event) => update('acceptedTerms', event.target.checked)} />
          <span className={`box ${form.acceptedTerms ? 'on' : ''}`}>{form.acceptedTerms ? <Check size={12} /> : null}</span>
          <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
        </label>
        {errors.terms ? <p className="form-error">{errors.terms}</p> : null}
        <button className="btn btn-primary btn-block" type="submit">Create Account</button>
        <OrDivider />
        <button className="btn btn-ghost btn-block" type="button" onClick={() => { signIn({ name: 'Alex Morgan', email: 'alex@gmail.com', initials: 'AM' }, true); navigate('/profile') }}>
          <CircleX size={18} /> Continue with Google
        </button>
        <p className="switch-auth">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, compactSubtitle, children }: { title: string; subtitle: string; compactSubtitle?: string; children: ReactNode; onClose?: () => void; back?: boolean }) {
  return (
    <div className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand center"><span className="logo-mark sm"><Gavel size={14} /></span> Auctionly</Link>
        <h1>{title}</h1>
        <p className="hide-mobile">{subtitle}</p>
        <p className="only-mobile">{compactSubtitle ?? subtitle}</p>
        {children}
      </section>
      <p className="auth-copy">© 2026 Auctionly. All rights reserved.</p>
    </div>
  )
}

function Field({ label, error, icon, trailing, hint, children }: { label: string; error?: string; icon: ReactNode; trailing?: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label} <em>*</em></span>
      <span className={`input-shell ${error ? 'invalid' : ''}`}>
        {icon}
        {children}
        {trailing}
      </span>
      {hint ? <small>{hint}</small> : null}
      {error ? <small className="form-error">{error}</small> : null}
    </label>
  )
}

function OrDivider() {
  return <div className="or-divider"><span>or</span></div>
}
