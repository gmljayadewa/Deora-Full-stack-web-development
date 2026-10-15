import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact Us | Deora',
  description: 'Questions about our products or your order? Contact the Deora team.',
};

// Set ready to true after you add the photo to public/images/contact/hero.jpg
const HERO_IMAGE = { src: '/images/contact/hero.jpg', ready: true };

// ===== EDIT THIS BLOCK WITH REAL DETAILS =====
const CONTACT = {
  phone: '+94 77 576 9353',
  whatsapp: '94775769353', // digits only, with country code, no + or spaces
  email: 'hello.deoradryfoods@gmail.com',
  address: '159/2, Kumbuka North, Gonapala, Horana, Sri Lanka',
  hours: 'TODO', // e.g. 'Monday to Saturday, 9:00 AM to 5:00 PM'
};
// =============================================

const isFilled = (v: string) => v.trim() !== '' && !v.startsWith('TODO');

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`;

const CARDS = [
  {
    icon: Phone,
    label: 'Call us',
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone.replace(/\s/g, '')}`,
    action: 'Call now',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: CONTACT.phone,
    href: `https://wa.me/${CONTACT.whatsapp}`,
    action: 'Chat with us',
  },
  {
    icon: Mail,
    label: 'Email',
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    action: 'Send an email',
  },
  {
    icon: MapPin,
    label: 'Visit us',
    value: CONTACT.address,
    href: mapsUrl,
    action: 'Open in Maps',
  },
];

const FAQS = [
  {
    q: 'Are your products medicine?',
    a: 'No. Our products are food and herbal supplements. They are not medicine and do not replace medical treatment. Please ask your doctor if you have a health question.',
  },
  {
    q: 'I have an allergy. Is a product safe for me?',
    a: 'Please check the ingredients list on the product page and on the pack. If you are not sure, ask your doctor before you order.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Please contact us as soon as possible with your order details. If the order has not been shipped yet, we will try to help.',
  },
  {
    q: 'Do you sell in bulk?',
    a: 'Please contact us with the product and the quantity you need, and our team will reply to you.',
  },
];

export default function ContactPage() {
  return (
    <div>
            {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))' }}
      >
        {HERO_IMAGE.ready && (
          <>
            <Image
              src={HERO_IMAGE.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'rgba(27, 67, 50, 0.78)' }} />
          </>
        )}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-14 text-center text-white">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Contact Deora
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            We&apos;d Love to Hear From You
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
            Have a question about our products or your order? Choose the way that is easiest for you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ icon: Icon, label, value, href, action }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex flex-col rounded-xl border p-5 shadow-sm transition-transform hover:-translate-y-1"
              style={{ borderColor: 'var(--color-line)', background: 'white' }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'rgba(27, 67, 50, 0.1)' }}
              >
                <Icon size={22} style={{ color: 'var(--color-brand-dark)' }} />
              </span>
              <h3 className="mt-4 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                {label}
              </h3>
              <p
                className="mt-1 break-words text-sm"
                style={{ color: 'var(--color-muted)' }}
              >
                {value}
              </p>
              <span
                className="mt-4 flex items-center gap-1 text-xs font-medium transition-transform group-hover:translate-x-1"
                style={{ color: 'var(--color-brand)' }}
              >
                {action} <ArrowRight size={12} />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Quick answers + form */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-brand)' }}
            >
              Quick Answers
            </span>
            <h2
              className="mt-2 font-display text-2xl font-bold"
              style={{ color: 'var(--color-ink)' }}
            >
              Before You Write
            </h2>

            {isFilled(CONTACT.hours) && (
              <div
                className="mt-5 flex items-start gap-3 rounded-lg border p-4"
                style={{ borderColor: 'var(--color-line)' }}
              >
                <Clock size={18} style={{ color: 'var(--color-brand-dark)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                    Opening hours
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    {CONTACT.hours}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="rounded-lg border p-4"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <summary
                    className="cursor-pointer text-sm font-semibold"
                    style={{ color: 'var(--color-ink)' }}
                  >
                    {f.q}
                  </summary>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {f.a}
                  </p>
                </details>
              ))}
            </div>

            <p className="mt-5 text-sm" style={{ color: 'var(--color-muted)' }}>
              Looking for something to buy?{' '}
              <Link href="/shop" className="font-medium underline" style={{ color: 'var(--color-brand)' }}>
                Browse our products
              </Link>
            </p>
          </div>

          <ContactForm whatsapp={CONTACT.whatsapp} email={CONTACT.email} />
        </div>
      </section>
    </div>
  );
}