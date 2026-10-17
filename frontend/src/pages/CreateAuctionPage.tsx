import { Bold, Calendar, Camera, ChevronDown, ChevronRight, CloudUpload, Gavel, Info, Italic, List, MapPin, Plus, Save, Tag, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useSession } from '../context/SessionContext'
import { categories, conditions, sampleUploads } from '../data/catalog'
import { characterCount } from '../utils/format'
import { validateAuctionDraft, type FieldErrors } from '../utils/validation'

const steps = ['Item Details', 'Images', 'Auction Settings', 'Shipping']
const stepFields = [
  ['title', 'category', 'condition', 'description'],
  [],
  ['startingPrice', 'reservePrice'],
  ['location', 'shipping'],
] as const

export function CreateAuctionPage() {
  const { token } = useSession()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [startingPrice, setStartingPrice] = useState('0.00')
  const [reservePrice, setReservePrice] = useState('')
  const [duration, setDuration] = useState('7 days')
  const [location, setLocation] = useState('')
  const [pickup, setPickup] = useState(true)
  const [domestic, setDomestic] = useState(false)
  const [international, setInternational] = useState(false)
  const [pickupNotes, setPickupNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>(sampleUploads)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [notice, setNotice] = useState('')
  const [preview, setPreview] = useState(false)
  const [step, setStep] = useState(0)
  const [furthest, setFurthest] = useState(0)

  const endDate = useMemo(() => {
    const days = Number(duration.match(/\d+/)?.[0] ?? 7)
    const date = new Date('2026-09-23T00:00:00')
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }, [duration])

  function draftInput() {
    return { title, category, condition, description, startingPrice, reservePrice, location, pickup, domestic, international }
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).slice(0, 10 - photos.length).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : ''
        if (url) setPhotos((current) => [...current, url].slice(0, 10))
      }
      reader.readAsDataURL(file)
    })
  }

  function wrap(marker: string) {
    setDescription((current) => `${current}${current ? ' ' : ''}${marker}`)
  }

  function errorsFor(index: number) {
    const all = validateAuctionDraft(draftInput())
    return Object.fromEntries(stepFields[index].filter((key) => all[key]).map((key) => [key, all[key]]))
  }

  function continueStep() {
    const next = errorsFor(step)
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setNotice('')
    setPreview(false)
    setStep((current) => {
      const next = Math.min(current + 1, steps.length - 1)
      setFurthest((reached) => Math.max(reached, next))
      return next
    })
  }

  function goTo(index: number) {
    if (index > furthest) return
    setErrors({})
    setNotice('')
    setPreview(false)
    setStep(index)
  }

  async function save(kind: 'draft' | 'preview' | 'publish') {
    const next = validateAuctionDraft(draftInput())
    setErrors(next)
    if (Object.keys(next).length > 0) {
      setNotice('')
      setPreview(false)
      const firstInvalid = stepFields.findIndex((fields) => fields.some((key) => next[key]))
      if (firstInvalid >= 0) setStep(firstInvalid)
      return
    }
    if (kind === 'preview') {
      setPreview(true)
      setNotice('')
      return
    }
    const result = await api('/auctions', {
      method: 'POST',
      token,
      body: {
        title,
        category,
        condition,
        description,
        startingPrice,
        reservePrice,
        location,
        pickup,
        domestic,
        international,
        pickupNotes,
        durationDays: Number(duration.match(/\d+/)?.[0] ?? 7),
        photos,
        publish: kind === 'publish',
      },
    })
    if (!result.ok && result.status !== 0) {
      setErrors(result.errors)
      setNotice('')
      return
    }
    setPreview(false)
    setNotice(kind === 'draft' ? 'Draft saved. You can finish this listing later.' : 'Auction created. Bidders can now find your item.')
  }

  return (
    <div className="create-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span>Create Auction</span>
      </nav>
      <header className="create-heading">
        <h1>Create New Auction</h1>
        <p className="hide-mobile">List your item and start receiving bids from the Auctionly community.</p>
        <p className="only-mobile">List your item and start receiving bids.</p>
      </header>
      <ol className="stepper">
        {steps.map((label, index) => (
          <li key={label} className={index === step ? 'active' : index < step ? 'done' : ''}>
            <button type="button" onClick={() => goTo(index)} disabled={index > furthest}>
              <span>{index + 1}</span>
              <b className="hide-mobile">{label}</b>
            </button>
          </li>
        ))}
      </ol>
      <p className="only-mobile step-caption">Step {step + 1} of {steps.length}: {steps[step]}</p>

      {step === 0 ? <section className="form-card">
        <h2><Tag size={18} /> Item Details</h2>
        <p>Tell buyers about your item</p>
        <label className="field">Item Title <em>*</em>
          <input value={title} maxLength={100} placeholder="e.g., MacBook Pro 14-inch M3 Pro 2024" onChange={(event) => setTitle(event.target.value)} />
          <small>{characterCount(title, 100)}</small>
          {errors.title ? <small className="form-error">{errors.title}</small> : null}
        </label>
        <div className="two-col">
          <label className="field">Category <em>*</em>
            <span className="select-shell">
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">Select a category</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <ChevronDown size={16} />
            </span>
            {errors.category ? <small className="form-error">{errors.category}</small> : null}
          </label>
          <label className="field">Condition <em>*</em>
            <span className="select-shell">
              <select value={condition} onChange={(event) => setCondition(event.target.value)}>
                <option value="">Select condition</option>
                {conditions.map((item) => <option key={item}>{item}</option>)}
              </select>
              <ChevronDown size={16} />
            </span>
            {errors.condition ? <small className="form-error">{errors.condition}</small> : null}
          </label>
        </div>
        <label className="field">Description <em>*</em>
          <span className="toolbar">
            <button type="button" aria-label="Bold" onClick={() => wrap('**bold**')}><Bold size={16} /></button>
            <button type="button" aria-label="Italic" onClick={() => wrap('_italic_')}><Italic size={16} /></button>
            <button type="button" aria-label="List" onClick={() => wrap('\n- ')}><List size={16} /></button>
          </span>
          <textarea rows={5} maxLength={2000} placeholder="Describe your item in detail — condition, features, included accessories, any defects..." value={description} onChange={(event) => setDescription(event.target.value)} />
          <small>{characterCount(description, 2000)}</small>
          {errors.description ? <small className="form-error">{errors.description}</small> : null}
        </label>
      </section> : null}

      {step === 1 ? <section className="form-card">
        <h2><Camera size={18} /> Photos</h2>
        <p>Add up to 10 photos. First image will be the cover.</p>
        <label className="dropzone">
          <CloudUpload size={28} />
          <strong>Drag and drop your images here</strong>
          <span>or</span>
          <span className="btn btn-ghost">Browse Files</span>
          <small>PNG, JPG or WebP. Max 5MB each.</small>
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => addFiles(event.target.files)} />
        </label>
        <div className="upload-row">
          {photos.map((photo, index) => (
            <figure key={photo}>
              <img src={photo} alt="" />
              {index === 0 ? <em>Cover</em> : null}
              <button type="button" aria-label="Remove photo" onClick={() => setPhotos(photos.filter((item) => item !== photo))}><X size={14} /></button>
            </figure>
          ))}
          {photos.length < 10 ? <span className="add-tile"><Plus size={18} /></span> : null}
        </div>
      </section> : null}

      {step === 2 ? <section className="form-card">
        <h2><Gavel size={18} /> Auction Settings</h2>
        <p>Set your pricing and schedule</p>
        <div className="two-col">
          <label className="field">Starting Price <em>*</em>
            <span className="input-shell money"><span>$</span><input value={startingPrice} onChange={(event) => setStartingPrice(event.target.value)} /></span>
            <small><Info size={12} /> Minimum starting price is $1.00</small>
            {errors.startingPrice ? <small className="form-error">{errors.startingPrice}</small> : null}
          </label>
          <label className="field">Reserve Price (Optional)
            <span className="input-shell money"><span>$</span><input value={reservePrice} placeholder="0.00" onChange={(event) => setReservePrice(event.target.value)} /></span>
            {errors.reservePrice ? <small className="form-error">{errors.reservePrice}</small> : null}
          </label>
        </div>
        <div className="two-col">
          <label className="field">Auction Duration
            <span className="select-shell">
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                {['3 days', '5 days', '7 days', '10 days'].map((item) => <option key={item}>{item}</option>)}
              </select>
              <ChevronDown size={16} />
            </span>
          </label>
          <label className="field">Minimum Bid Increment
            <span className="select-shell">
              <select defaultValue="Auto (based on price)">
                <option>Auto (based on price)</option>
                <option>$5.00</option>
                <option>$10.00</option>
                <option>$25.00</option>
              </select>
              <ChevronDown size={16} />
            </span>
          </label>
        </div>
        <div className="two-col">
          <label className="field">Start Date
            <span className="input-shell"><Calendar size={16} /><input placeholder="Select start date" defaultValue="Sep 23, 2026" /></span>
          </label>
          <label className="field">End Date
            <span className="input-shell"><Calendar size={16} /><input readOnly value={endDate} /></span>
            <small>Auto-calculated from start date + duration</small>
          </label>
        </div>
      </section> : null}

      {step === 3 ? <section className="form-card">
        <h2><MapPin size={18} /> Shipping</h2>
        <p>Where is the item and how will it be delivered?</p>
        <label className="field">Item Location <em>*</em>
          <span className="input-shell"><MapPin size={16} /><input placeholder="City, State" value={location} onChange={(event) => setLocation(event.target.value)} /></span>
          {errors.location ? <small className="form-error">{errors.location}</small> : null}
        </label>
        <fieldset>
          <legend>Shipping Options</legend>
          <label><input type="checkbox" checked={pickup} onChange={(event) => setPickup(event.target.checked)} /> Local Pickup</label>
          <label><input type="checkbox" checked={domestic} onChange={(event) => setDomestic(event.target.checked)} /> Domestic Shipping</label>
          <label><input type="checkbox" checked={international} onChange={(event) => setInternational(event.target.checked)} /> International Shipping</label>
          {errors.shipping ? <small className="form-error">{errors.shipping}</small> : null}
        </fieldset>
        <label className="field">Pickup Information
          <textarea rows={3} placeholder="Add details about pickup availability, e.g., weekdays after 5pm..." value={pickupNotes} onChange={(event) => setPickupNotes(event.target.value)} />
        </label>
      </section> : null}

      {preview && step === 3 ? (
        <section className="form-card preview-card">
          <h2>Preview Listing</h2>
          <img src={photos[0]} alt="" />
          <h3>{title}</h3>
          <p>{description}</p>
          <p>{category} · {condition} · {location}</p>
          <p>Starts at ${startingPrice} · {duration} · ends {endDate}</p>
        </section>
      ) : null}
      {notice ? <p className="success-note">{notice}</p> : null}

      <div className="action-bar">
        {step > 0 ? <button type="button" className="btn btn-ghost" onClick={() => goTo(step - 1)}>Back</button> : null}
        {step < steps.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={continueStep}>Continue</button>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => save('draft')}><Save size={16} /> Save Draft</button>
            <button type="button" className="btn btn-ghost" onClick={() => save('preview')}>Preview Listing</button>
            <button type="button" className="btn btn-primary" onClick={() => save('publish')}>Create Auction</button>
          </>
        )}
      </div>
    </div>
  )
}
