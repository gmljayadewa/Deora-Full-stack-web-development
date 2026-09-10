import Hero from '../components/Hero';
import ShopByCategory from '../components/ShopByCategory';
import PromoBanner from '../components/PromoBanner';
import FeaturedProducts from '../components/FeaturedProducts';
import WhyChooseDeora from '../components/WhyChooseDeora';
import BlogsEvents from '../components/BlogsEvents';
import Newsletter from '../components/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <PromoBanner />
      <FeaturedProducts />
      <WhyChooseDeora />
      <BlogsEvents />
      <Newsletter />
    </>
  );
}
