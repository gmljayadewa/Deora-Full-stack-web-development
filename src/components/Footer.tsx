import Image from 'next/image';
import Link from 'next/link';
import { FaPhoneVolume, FaRegEnvelope, FaLocationDot, FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer
      className="pt-[50px] px-5 text-white"
      style={{ background: 'var(--color-brand-dark)' }}
    >
      {/* 12-Column Grid for precise alignment matching the design.
          Column spans: 2 + 2 + 2 + 2 + 2 + 2 = 12, so the row fills edge-to-edge
          with no leftover gap on the right. */}
      <div className="mx-auto grid max-w-300 grid-cols-1 gap-8 pb-16 md:grid-cols-2 lg:grid-cols-12 items-start">
        {/* Brand Column (Logo & Text) */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <Image
              src="/../footer-logo.png"
              alt="DEORA Logo"
              width={120}
              height={40}
              className="object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Link
            href="https://facebook.com/deorafamily"
            target="_blank"
            aria-label="Facebook"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition-opacity hover:opacity-80"
    >
              <FaFacebookF />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition-opacity hover:opacity-80"
            >
              <FaInstagram />
            </Link>
            <Link
              href="https://wa.me/94775769353"
              target="_blank"
              aria-label="WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition-opacity hover:opacity-80"
            >
              <FaWhatsapp />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2">
          <h4 className="mb-6 text-[14px] font-bold uppercase tracking-wide">Quick Links</h4>
          <ul className="space-y-4 text-xs">
            <li><Link href="/shop" className="transition-opacity hover:opacity-80 hover:underline">Shop All</Link></li>
            <li><Link href="/shop" className="transition-opacity hover:opacity-80 hover:underline">Categories</Link></li>
            <li><Link href="/about" className="transition-opacity hover:opacity-80 hover:underline">About Us</Link></li>
            <li><Link href="/blogs" className="transition-opacity hover:opacity-80 hover:underline">Blog</Link></li>
            <li><Link href="/contact" className="transition-opacity hover:opacity-80 hover:underline">Contact Us</Link></li>
            <li><Link href="/faq" className="transition-opacity hover:opacity-80 hover:underline">FAQ</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="lg:col-span-2">
          <h4 className="mb-6 text-[14px] font-bold uppercase tracking-wide">Customer Service</h4>
          <ul className="space-y-4 text-xs">
            <li><Link href="/account" className="transition-opacity hover:opacity-80 hover:underline">My Account</Link></li>
            <li><Link href="/track-order" className="transition-opacity hover:opacity-80 hover:underline">Order Tracking</Link></li>
            <li><Link href="/returns" className="transition-opacity hover:opacity-80 hover:underline">Returns & Refunds</Link></li>
            <li><Link href="/shipping" className="transition-opacity hover:opacity-80 hover:underline">Shipping Policy</Link></li>
            <li><Link href="/terms" className="transition-opacity hover:opacity-80 hover:underline">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="transition-opacity hover:opacity-80 hover:underline">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="lg:col-span-2">
          <h4 className="mb-6 text-[14px] font-bold uppercase tracking-wide">Categories</h4>
          <ul className="space-y-4 text-xs">
            <li><Link href="/shop?category=Wellness" className="transition-opacity hover:opacity-80 hover:underline">Herbal Capsules</Link></li>
            <li><Link href="/shop?category=Herbal%20Tea" className="transition-opacity hover:opacity-80 hover:underline">Herbal Tea Bags</Link></li>
            <li><Link href="/shop?category=Nutrition" className="transition-opacity hover:opacity-80 hover:underline">Nutrition Products</Link></li>
            <li><Link href="/shop?category=Kitchen%20Essentials" className="transition-opacity hover:opacity-80 hover:underline">Spices</Link></li>
            <li><Link href="/offers" className="transition-opacity hover:opacity-80 hover:underline">Bundles & Offers</Link></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="lg:col-span-2">
          <h4 className="mb-6 text-[14px] font-bold uppercase tracking-wide">Contact Us</h4>
          <ul className="space-y-4 text-xs">
            <li className="flex items-start gap-3">
              <FaPhoneVolume className="mt-1 flex-shrink-0" />
              <span>+94 77 576 9353</span>
            </li>
            <li className="flex items-start gap-3">
              <FaRegEnvelope className="mt-1 flex-shrink-0" />
              <span>hello.deoradryfoods@gmail.com</span>
            </li>
            <li className="flex items-start gap-3">
              <FaLocationDot className="mt-1 flex-shrink-0" />
              <span>159/2, Kumbuka North, Gonapala,Horana, Sri Lanka</span>
            </li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <h4 className="mb-6 text-[14px] font-bold uppercase tracking-wide">Payment Methods</h4>
          <div className="inline-block rounded-md border border-white/30 p-4">
            <span className="mb-1 block text-base font-bold">PayHere</span>
            <span
              className="block text-[10px] font-bold tracking-wider"
              style={{ color: 'var(--color-secondary)' }}
            >
              SANDBOX ENVIRONMENT
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Area */}
      <div className="border-t border-white/20 py-5 text-center text-[13px]">
        <p>&copy; 2026 DEORA. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;